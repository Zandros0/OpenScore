// Reactive app store: the active game (MMKV) + finished history (SQLite).
// Plain external store consumed via useSyncExternalStore — no Context, no Redux.

import * as customGames from "@/db/customGames";
import * as history from "@/db/history";
import { setCustomRules, type GameRule } from "@/games";
import { cloneGame, createGame, uid } from "@/lib/game";
import type { Game } from "@/lib/types";

import { loadActiveGame, persistActiveGame } from "./active";

export type AppState = { active: Game | null; history: Game[]; customs: GameRule[] };

let state: AppState = { active: null, history: [], customs: [] };
let hydrated = false;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Replaces state immutably and persists `active` to MMKV. */
function set(next: Partial<AppState>, persistActive = true): void {
    state = { ...state, ...next };
    if (persistActive) persistActiveGame(state.active);
    emit();
}

/** Loads persisted data into memory. Call once after the DB is initialised. */
export function hydrate(): void {
    if (hydrated) return;
    const customs = customGames.listCustomGames();
    setCustomRules(customs);
    state = { active: loadActiveGame(), history: history.listHistory(), customs };
    hydrated = true;
    emit();
}

export function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): AppState {
    return state;
}

// ── Actions ────────────────────────────────────────────────────────────────

export function startGame(game: Game): void {
    set({ active: game });
}

export function setScore(roundIndex: number, playerId: string, value: number | null): void {
    if (!state.active) return;
    const g = cloneGame(state.active);
    while (g.rounds.length <= roundIndex) g.rounds.push({ id: uid(), scores: {} });
    g.rounds[roundIndex].scores[playerId] = value;
    set({ active: g });
}

export function renameActive(name: string): void {
    if (!state.active) return;
    set({ active: { ...state.active, name } });
}

export function endActive(): void {
    if (!state.active) return;
    const ended: Game = { ...state.active, endedAt: Date.now() };
    history.addHistory(ended);
    set({ active: null, history: [ended, ...state.history] });
}

/** Ends the active game and immediately starts a new one with the same rule and players. */
export function endAndReplay(): Game | null {
    if (!state.active) return null;
    const id = state.active.id;
    endActive();
    return replay(id);
}

export function deleteActive(): void {
    set({ active: null });
}

// ── Custom rules ───────────────────────────────────────────────────────────
// The registry backing `getRule` is a plain module variable, so it is refreshed
// alongside the reactive state on every write.

function setCustoms(customs: GameRule[]): void {
    setCustomRules(customs);
    set({ customs }, false);
}

/** Creates the rule, or replaces it when a rule with the same id already exists. */
export function saveCustomRule(rule: GameRule): void {
    customGames.upsertCustomGame(rule);
    const known = state.customs.some((r) => r.id === rule.id);
    setCustoms(known ? state.customs.map((r) => (r.id === rule.id ? rule : r)) : [...state.customs, rule]);
}

/**
 * Removes a custom rule. Games (active or in history) that referenced it keep
 * their `gameRuleId` and fall back to the free counter via `getRule`.
 */
export function deleteCustomRule(id: string): void {
    customGames.deleteCustomGame(id);
    setCustoms(state.customs.filter((r) => r.id !== id));
}

export function deleteHistory(id: string): void {
    history.deleteHistory(id);
    set({ history: state.history.filter((g) => g.id !== id) }, false);
}

/**
 * Reopens a finished game from history as the active game, keeping its rounds
 * and id so play continues where it stopped. It leaves history (no longer
 * finished) and returns there if ended again. Safe to call only when no game is
 * active — guaranteed by routing, since history is unreachable while one is.
 */
export function resume(id: string): Game | null {
    const src = state.history.find((g) => g.id === id);
    if (!src) return null;
    const reopened: Game = { ...cloneGame(src), endedAt: null };
    history.deleteHistory(id);
    set({ active: reopened, history: state.history.filter((g) => g.id !== id) });
    return reopened;
}

/**
 * Starts a brand-new game with the same rule and player names as a finished
 * one, but no rounds — unlike `resume`, which reopens the same game with its
 * rounds intact. Keeps the finished game in history. Safe to call only when
 * no game is active — guaranteed by routing, since history is unreachable
 * while one is.
 */
export function replay(id: string): Game | null {
    const src = state.history.find((g) => g.id === id);
    if (!src) return null;
    const next = createGame({ gameRuleId: src.gameRuleId, players: src.players.map((p) => p.name), maxGameScore: src.maxGameScore });
    set({ active: next });
    return next;
}
