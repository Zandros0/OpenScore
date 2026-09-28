import { Pressable, Text, View } from "react-native";

import { computeTotals } from "@/lib/game";
import { getRule } from "@/games";
import type { Game } from "@/lib/types";

import { Num } from "../ui/Txt";

function winnerSort(game: Game) {
    const totals = computeTotals(game);
    const rule = getRule(game.gameRuleId);
    const sorted = [...game.players].sort((a, b) =>
        rule.scoreDirection === "asc" ? totals[b.id] - totals[a.id] : totals[a.id] - totals[b.id]
    );
    return { totals, sorted, rule };
}

export function HistoryCard({
    game,
    onOpen,
    onResume,
    onReplay,
}: {
    game: Game;
    onOpen: () => void;
    onResume: () => void;
    onReplay: () => void;
}) {
    const { totals, sorted, rule } = winnerSort(game);
    const winner = sorted[0];
    const date = new Date(game.endedAt ?? game.startedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

    return (
        <View className="rounded-2xl bg-surface p-3.5 dark:bg-surface-dark">
            <Pressable
                onPress={onOpen}
                accessibilityRole="button"
                accessibilityLabel={`${game.name}, ${rule.name}, gagnant ${winner.name}`}
            >
                <View className="mb-2.5 flex-row items-start gap-2.5">
                    <View className="min-w-0 flex-1">
                        <Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-muted">
                            {rule.name} · {date} · {game.players.length} joueurs
                        </Text>
                        <Text
                            numberOfLines={1}
                            className="mt-0.5 text-[17px] font-bold text-ink dark:text-ink-dark"
                        >
                            {game.name}
                        </Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-[9px] font-bold uppercase tracking-[1.4px] text-muted">Gagnant</Text>
                        <View className="mt-0.5 flex-row items-center gap-1.5">
                            <Text className="text-sm font-bold text-accent">{winner.name}</Text>
                            <Num className="text-xs font-medium text-muted">{totals[winner.id]}</Num>
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-1.5 border-t border-line pt-2 dark:border-line-dark">
                    {sorted.map((p, i) => (
                        <View
                            key={p.id}
                            className="min-w-0 flex-1 items-center"
                        >
                            <Text
                                numberOfLines={1}
                                className="mt-1 text-[10px] font-medium text-muted"
                            >
                                {p.name}
                            </Text>
                            <Num className={`mt-0.5 text-[18px] font-bold ${i === 0 ? "text-accent" : "text-ink dark:text-ink-dark"}`}>
                                {totals[p.id]}
                            </Num>
                        </View>
                    ))}
                </View>
            </Pressable>

            <View className="mt-3 flex-row gap-1.5">
                <Pressable
                    onPress={onOpen}
                    accessibilityRole="button"
                    accessibilityLabel={`Détail : ${game.name}`}
                    className="h-11 flex-1 items-center justify-center rounded-[10px] bg-keymuted active:opacity-70 dark:bg-keymuted-dark"
                >
                    <Text className="text-[13px] font-semibold text-ink dark:text-ink-dark">Détail</Text>
                </Pressable>
                <Pressable
                    onPress={onReplay}
                    accessibilityRole="button"
                    accessibilityLabel={`Rejouer avec les mêmes joueurs : ${game.name}`}
                    className="h-11 flex-1 items-center justify-center rounded-[10px] bg-keymuted active:opacity-70 dark:bg-keymuted-dark"
                >
                    <Text className="text-[13px] font-semibold text-ink dark:text-ink-dark">Rejouer</Text>
                </Pressable>
                <Pressable
                    onPress={onResume}
                    accessibilityRole="button"
                    accessibilityLabel={`Reprendre : ${game.name}`}
                    className="h-11 flex-1 items-center justify-center rounded-[10px] bg-night active:opacity-90"
                >
                    <Text className="text-[13px] font-semibold text-cream">Reprendre</Text>
                </Pressable>
            </View>
        </View>
    );
}
