// Derives the chart series (totals per player + cumulative per round) from a game.

import type { Game } from "@/lib/types";

/**
 * 20 distinct, vivid colors assigned to players by index. Ordered so adjacent
 * indices contrast strongly (consecutive players read apart). Wraps past 20.
 */
export const SERIES_COLORS = [
    "#2563EB", // blue
    "#F4633A", // coral
    "#16A34A", // green
    "#9333EA", // purple
    "#EAB308", // yellow
    "#0891B2", // cyan
    "#DB2777", // pink
    "#DC2626", // red
    "#0D9488", // teal
    "#EA580C", // orange
    "#4F46E5", // indigo
    "#65A30D", // lime
    "#C026D3", // fuchsia
    "#0EA5E9", // sky
    "#E11D48", // rose
    "#CA8A04", // gold
    "#7C3AED", // violet
    "#059669", // emerald
    "#F59E0B", // amber
    "#64748B", // slate
] as const;

export const playerColor = (i: number) => SERIES_COLORS[i % SERIES_COLORS.length];

export type Series = {
    /** [{ x: 0, total: 12 }, …] — one entry per player, ordered as game.players. */
    totals: { x: number; total: number }[];
    /** [{ round: 1, <playerId>: cumulative, … }, …] — one entry per played round. */
    cumulative: Record<string, number>[];
    /** player ids, used as the line-chart yKeys. */
    playerKeys: string[];
};

/** Builds bar (totals) and line (round-by-round cumulative) series for a game. */
export function buildSeries(game: Game): Series {
    const playerKeys = game.players.map((p) => p.id);

    const running: Record<string, number> = {};
    for (const id of playerKeys) running[id] = 0;

    // Round 0, every player at 0: so the line chart shows movement from a flat
    // baseline as soon as round 1 is filled in, instead of starting mid-air.
    const zeroRow: Record<string, number> = { round: 0 };
    for (const id of playerKeys) zeroRow[id] = 0;
    const cumulative: Record<string, number>[] = [zeroRow];

    game.rounds.forEach((r, i) => {
        const row: Record<string, number> = { round: i + 1 };
        for (const id of playerKeys) {
            const v = r.scores[id];
            if (typeof v === "number") running[id] += v;
            row[id] = running[id];
        }
        cumulative.push(row);
    });

    const totals = game.players.map((p, i) => ({ x: i, total: running[p.id] ?? 0 }));

    return { totals, cumulative, playerKeys };
}
