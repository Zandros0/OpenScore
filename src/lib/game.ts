// Pure helpers for building and deriving game state.

import type { Game, Totals } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function todayLabel(): string {
    return `Partie du ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
}

export function createGame({
    name,
    gameRuleId,
    players,
    maxGameScore,
}: {
    name?: string;
    gameRuleId: string;
    players: string[];
    maxGameScore?: number;
}): Game {
    return {
        id: uid(),
        name: name?.trim() || todayLabel(),
        gameRuleId,
        players: players.map((p, i) => ({ id: uid(), name: p.trim() || `Joueur ${i + 1}` })),
        rounds: [],
        startedAt: Date.now(),
        endedAt: null,
        maxGameScore,
    };
}

/** Sum of numeric scores per player. */
export function computeTotals(game: Game): Totals {
    const totals: Totals = {};
    for (const p of game.players) totals[p.id] = 0;
    for (const r of game.rounds) {
        for (const p of game.players) {
            const v = r.scores[p.id];
            if (typeof v === "number") totals[p.id] += v;
        }
    }
    return totals;
}

/**
 * True once a game can't continue: its round cap is reached, or its target score is
 * reached with exactly one player strictly ahead (several players tied at or above
 * the target keep it open — see ScoreBoard's `scoreCapReached` for the same rule
 * broken out into the pieces its confetti/podium need).
 */
export function isGameFinished(game: Game, caps: { maxRounds?: number; maxGameScore?: number }): boolean {
    if (caps.maxRounds != null && game.rounds.length >= caps.maxRounds) return true;

    const targetScore = game.maxGameScore ?? caps.maxGameScore;
    if (targetScore == null) return false;

    const lastRound = game.rounds[game.rounds.length - 1];
    const lastFilled = !lastRound || game.players.every((p) => typeof lastRound.scores[p.id] === "number");
    if (!lastFilled) return false;

    const totals = Object.values(computeTotals(game));
    const leadTotal = Math.max(...totals, 0);
    const leadersAtTop = totals.filter((v) => v === leadTotal).length;
    return leadTotal >= targetScore && leadersAtTop === 1;
}

/** Deep-clones a game so reducers can mutate `rounds`/`scores` safely. */
export function cloneGame(game: Game): Game {
    return {
        ...game,
        players: game.players.map((p) => ({ ...p })),
        rounds: game.rounds.map((r) => ({ ...r, scores: { ...r.scores } })),
    };
}
