// Core domain types for a game and its scoring document.

export type Player = { id: string; name: string };

/** A single round. `scores[playerId]` is the points for that player, or null/undefined if not yet entered. */
export type Round = { id: string; scores: Record<string, number | null> };

export type Game = {
    id: string;
    name: string;
    gameRuleId: string;
    players: Player[];
    rounds: Round[];
    startedAt: number;
    endedAt: number | null;
    /** Per-game override of the rule's `maxGameScore`, set at creation (e.g. Papayo's target). */
    maxGameScore?: number;
};

/** Mapping playerId -> running total. */
export type Totals = Record<string, number>;
