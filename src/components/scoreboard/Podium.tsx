// Top-3 standings shown alongside the confetti burst when a player reaches the
// game's target score with a clear lead.

import { Text, View } from "react-native";

import type { GameRule } from "@/games";
import type { Game, Totals } from "@/lib/types";

import { Num } from "../ui/Txt";

const RANK_STYLE = [
    { badge: "bg-accent", text: "text-white" },
    { badge: "bg-keymuted dark:bg-keymuted-dark", text: "text-ink dark:text-ink-dark" },
    { badge: "bg-keymuted dark:bg-keymuted-dark", text: "text-ink dark:text-ink-dark" },
];

export function Podium({ game, rule, totals }: { game: Game; rule: GameRule; totals: Totals }) {
    const ranked = [...game.players]
        .sort((a, b) => (rule.scoreDirection === "asc" ? totals[b.id] - totals[a.id] : totals[a.id] - totals[b.id]))
        .slice(0, 3);

    return (
        <View
            className="absolute inset-x-8 top-1/2 -translate-y-1/2 gap-3 rounded-2xl bg-surface p-5 shadow-lg dark:bg-surface-dark"
            accessibilityLabel="Classement"
        >
            <Text className="text-center text-xs font-bold uppercase tracking-[1.4px] text-muted">Classement</Text>
            {ranked.map((p, i) => (
                <View
                    key={p.id}
                    className="flex-row items-center gap-3"
                >
                    <View className={`h-7 w-7 items-center justify-center rounded-full ${RANK_STYLE[i].badge}`}>
                        <Text className={`text-[13px] font-bold ${RANK_STYLE[i].text}`}>{i + 1}</Text>
                    </View>
                    <Text
                        numberOfLines={1}
                        className="min-w-0 flex-1 text-[15px] font-semibold text-ink dark:text-ink-dark"
                    >
                        {p.name}
                    </Text>
                    <Num className="text-sm font-bold text-muted">{totals[p.id]}</Num>
                </View>
            ))}
        </View>
    );
}
