import { Text, View } from "react-native";

import { type GameRule, isDefault, ruleCapLabel } from "@/games";
import type { Game } from "@/lib/types";
import { useColors } from "@/theme/colors";

import { IconButton } from "../ui/IconButton";
import { Chart, Chevron, Dots } from "../ui/icons";

type Props = {
    game: Game;
    rule: GameRule;
    /** 0..1 progress toward maxScore, or null when not applicable. */
    progress: number | null;
    onBack: () => void;
    onCharts: () => void;
    onMenu: () => void;
};

export function GameHeader({ game, rule, progress, onBack, onCharts, onMenu }: Props) {
    const c = useColors();
    return (
        <View className="border-b border-line bg-bg px-4 pb-3.5 pt-safe-offset-2 dark:border-line-dark dark:bg-bg-dark">
            <View className="flex-row items-center gap-2.5">
                <IconButton
                    onPress={onBack}
                    accessibilityLabel="Retour à l'accueil"
                >
                    <Chevron
                        dir="left"
                        color={c.ink}
                        size={13}
                    />
                </IconButton>
                <View className="min-w-0 flex-1">
                    <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-muted">
                        {rule.name}
                        {isDefault(rule.id) ? "" : ` · ${ruleCapLabel(rule)}`}
                    </Text>
                    <Text
                        numberOfLines={1}
                        className="text-[17px] font-bold text-ink dark:text-ink-dark"
                    >
                        {game.name}
                    </Text>
                </View>
                <IconButton
                    onPress={onCharts}
                    accessibilityLabel="Graphiques"
                >
                    <Chart
                        color={c.ink}
                        size={14}
                    />
                </IconButton>
                <IconButton
                    onPress={onMenu}
                    accessibilityLabel="Menu"
                >
                    <Dots
                        color={c.ink}
                        size={3}
                    />
                </IconButton>
            </View>
            {progress !== null && (
                <View className="mt-3 h-0.5 overflow-hidden rounded-full bg-line dark:bg-line-dark">
                    <View
                        style={{
                            width: `${Math.min(progress, 1) * 100}%`,
                            height: "100%",
                            backgroundColor: progress > 0.85 ? c.danger : c.accent,
                        }}
                    />
                </View>
            )}
        </View>
    );
}
