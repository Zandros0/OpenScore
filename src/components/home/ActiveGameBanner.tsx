// Home screen state while a game is already active: the one-game-at-a-time model
// means the "Nouvelle partie" form is unreachable until this one is resolved, so
// this is the way back into it (or out of it) instead of a forced redirect. Once
// the game is finished, it offers to file it away instead of just parking it here.

import { Pressable, Text, View } from "react-native";

import { getRule } from "@/games";
import type { Game } from "@/lib/types";

import { PrimaryButton } from "../ui/PrimaryButton";
import { Display } from "../ui/Txt";

function SecondaryButton({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            className="h-12 items-center justify-center rounded-xl bg-keymuted active:opacity-70 dark:bg-keymuted-dark"
        >
            <Text className={`text-sm font-semibold ${danger ? "text-danger dark:text-danger-dark" : "text-ink dark:text-ink-dark"}`}>
                {label}
            </Text>
        </Pressable>
    );
}

export function ActiveGameBanner({
    game,
    finished,
    onResume,
    onDelete,
    onEndAndReturnHome,
    onEndAndReplay,
}: {
    game: Game;
    /** Whether the game has reached its round or score cap — nothing left to play. */
    finished: boolean;
    onResume: () => void;
    onDelete: () => void;
    onEndAndReturnHome: () => void;
    onEndAndReplay: () => void;
}) {
    const rule = getRule(game.gameRuleId);
    const playerNames = game.players.map((p) => p.name).join(", ");

    return (
        <View className="flex-1 justify-center gap-2.5 bg-bg px-6 pb-safe-offset-6 pt-safe dark:bg-bg-dark">
            <Text className="text-xs font-bold uppercase tracking-[1.4px] text-muted">
                {finished ? "Partie terminée" : "Partie en cours"}
            </Text>
            <Text className="text-[34px] leading-[38px] tracking-[-1.2px]">
                <Display className="text-ink dark:text-ink-dark">{game.name}</Display>
            </Text>
            <Text className="text-sm text-muted">
                {rule.name} · {game.players.length} joueurs · {game.rounds.length}{" "}
                {game.rounds.length === 1 ? "manche jouée" : "manches jouées"}
            </Text>
            <Text
                numberOfLines={2}
                className="mt-1 text-[15px] text-ink dark:text-ink-dark"
            >
                {playerNames}
            </Text>

            <View className="mt-8 gap-2.5">
                {finished ? (
                    <>
                        <PrimaryButton
                            onPress={onEndAndReturnHome}
                            arrow={false}
                        >
                            Terminer et revenir au menu
                        </PrimaryButton>
                        <SecondaryButton
                            label="Terminer et rejouer"
                            onPress={onEndAndReplay}
                        />
                        <SecondaryButton
                            label="Supprimer la partie"
                            onPress={onDelete}
                            danger
                        />
                    </>
                ) : (
                    <>
                        <PrimaryButton onPress={onResume}>Reprendre la partie</PrimaryButton>
                        <SecondaryButton
                            label="Supprimer la partie"
                            onPress={onDelete}
                            danger
                        />
                    </>
                )}
            </View>
        </View>
    );
}
