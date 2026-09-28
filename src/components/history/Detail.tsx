import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { computeTotals } from "@/lib/game";
import { getRule } from "@/games";
import { replay, resume } from "@/store/gameStore";
import { useHistory } from "@/store/useGame";
import { useColors } from "@/theme/colors";

import { ChartsModal } from "../scoreboard/charts/ChartsModal";
import { IconButton } from "../ui/IconButton";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Num } from "../ui/Txt";
import { Chart, Chevron } from "../ui/icons";
import { DetailTable } from "./DetailTable";

export function Detail({ gameId }: { gameId: string }) {
    const router = useRouter();
    const c = useColors();
    const game = useHistory().find((g) => g.id === gameId);
    const [chartsOpen, setChartsOpen] = useState(false);

    if (!game) {
        return (
            <View className="flex-1 items-center justify-center bg-bg dark:bg-bg-dark">
                <Text className=" text-muted">Partie introuvable.</Text>
            </View>
        );
    }

    const rule = getRule(game.gameRuleId);
    const totals = computeTotals(game);
    const winner = [...game.players].sort((a, b) =>
        rule.scoreDirection === "asc" ? totals[b.id] - totals[a.id] : totals[a.id] - totals[b.id]
    )[0];
    const onResume = () => {
        if (resume(game.id)) router.navigate("/game");
    };
    const onReplay = () => {
        if (replay(game.id)) router.navigate("/game");
    };

    return (
        <View className="flex-1 bg-bg dark:bg-bg-dark">
            <View className="border-b border-line px-4 pb-4 pt-safe-offset-2 dark:border-line-dark">
                <View className="flex-row items-center gap-2.5">
                    <IconButton
                        onPress={() => router.back()}
                        accessibilityLabel="Retour"
                    >
                        <Chevron
                            dir="left"
                            color={c.ink}
                            size={13}
                        />
                    </IconButton>
                    <View className="min-w-0 flex-1">
                        <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-muted">
                            {rule.name} · {new Date(game.endedAt ?? game.startedAt).toLocaleDateString("fr-FR")}
                        </Text>
                        <Text
                            numberOfLines={1}
                            className="text-[17px] font-bold text-ink dark:text-ink-dark"
                        >
                            {game.name}
                        </Text>
                    </View>
                    <IconButton
                        onPress={() => setChartsOpen(true)}
                        accessibilityLabel="Graphiques"
                    >
                        <Chart
                            color={c.ink}
                            size={14}
                        />
                    </IconButton>
                </View>
                <View className="mt-4 flex-row items-baseline gap-2.5">
                    <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-muted">Gagnant</Text>
                    <Text className="text-[22px] font-bold text-accent">{winner.name}</Text>
                    <Num className="text-sm font-semibold text-muted">{totals[winner.id]} pts</Num>
                </View>
            </View>

            <ScrollView contentContainerClassName="pb-safe-offset-4">
                <DetailTable
                    game={game}
                    totals={totals}
                    winnerId={winner.id}
                />

                <View className="gap-2.5 px-4 pt-5">
                    <PrimaryButton
                        onPress={onResume}
                        arrow={false}
                    >
                        Reprendre la partie
                    </PrimaryButton>
                    <Pressable
                        onPress={onReplay}
                        accessibilityRole="button"
                        accessibilityLabel="Rejouer avec les mêmes joueurs"
                        className="h-12 items-center justify-center rounded-xl bg-keymuted active:opacity-70 dark:bg-keymuted-dark"
                    >
                        <Text className="text-sm font-semibold text-ink dark:text-ink-dark">Rejouer avec les mêmes joueurs</Text>
                    </Pressable>
                </View>
            </ScrollView>

            <ChartsModal
                visible={chartsOpen}
                onClose={() => setChartsOpen(false)}
                game={game}
            />
        </View>
    );
}
