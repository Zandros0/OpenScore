import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { InputAccessoryView, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { getRule } from "@/games";
import { createGame, isGameFinished, todayLabel } from "@/lib/game";
import { deleteActive, endActive, endAndReplay, startGame } from "@/store/gameStore";
import { useActiveGame, useCustomRules, useHistory } from "@/store/useGame";
import { useColors } from "@/theme/colors";

import { PrimaryButton } from "../ui/PrimaryButton";
import { Display, Num } from "../ui/Txt";
import { Check } from "../ui/icons";
import { ActiveGameBanner } from "./ActiveGameBanner";
import { GamePicker } from "./GamePicker";
import { AddPlayerButton, Field, PlayerRow } from "./parts";

const PAPAYO_TARGET_ACCESSORY_ID = "papayo-target-accessory";

/** Clamp the player list to `[min, max]`, keeping existing names. */
function clamp(players: string[], min: number, max: number): string[] {
    const next = players.slice(0, max);
    while (next.length < min) next.push("");
    return next;
}

export function NewGame() {
    const router = useRouter();
    const c = useColors();
    const active = useActiveGame();
    const history = useHistory();
    const customs = useCustomRules();

    const [name, setName] = useState("");
    const [ruleId, setRuleId] = useState("defaut");
    const [entered, setEntered] = useState<string[]>([]);
    // Papayo-only: target total that ends the game (partie), separate from its fixed
    // 250 pts/manche round cap. Kept as a string, like other draft number fields, so
    // clearing it is a valid "no cap" state instead of collapsing to 0.
    const [papayoTarget, setPapayoTarget] = useState("500");
    const rule = getRule(ruleId);

    // Clamped at render, not on selection: a custom rule can be edited from "Mes jeux"
    // while this form stays mounted, so its bounds must always win over the typed rows.
    const players = useMemo(() => clamp(entered, rule.minPlayers, rule.maxPlayers), [entered, rule.minPlayers, rule.maxPlayers]);

    // Focus the row just appended by "Ajouter un joueur". Set on click, consumed once the
    // new row exists so `.focus()` targets an already-mounted input.
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const pendingFocus = useRef<number | null>(null);
    useEffect(() => {
        if (pendingFocus.current === null) return;
        const i = pendingFocus.current;
        pendingFocus.current = null;
        inputRefs.current[i]?.focus();
    }, [players.length]);

    const addPlayer = () => {
        if (players.length < rule.maxPlayers) {
            pendingFocus.current = players.length;
            setEntered([...players, ""]);
        }
    };
    const removePlayer = (i: number) => {
        if (players.length > rule.minPlayers) setEntered(players.filter((_, idx) => idx !== i));
    };

    const start = () => {
        const maxGameScore = ruleId === "papayo" && papayoTarget.trim() ? Number(papayoTarget) : undefined;
        startGame(createGame({ name, gameRuleId: ruleId, players, maxGameScore }));
        router.push("/game");
    };

    // One game at a time: starting another would silently overwrite this one (no
    // history entry, since it isn't "ended"), so the form stays unreachable until
    // it's resumed or deleted from here.
    if (active) {
        return (
            <ActiveGameBanner
                game={active}
                finished={isGameFinished(active, getRule(active.gameRuleId))}
                onResume={() => router.navigate("/game")}
                onDelete={deleteActive}
                onEndAndReturnHome={endActive}
                onEndAndReplay={() => {
                    if (endAndReplay()) router.navigate("/game");
                }}
            />
        );
    }

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-bg dark:bg-bg-dark"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/*
             * The keyboard stays up for the whole form: filling several player
             * names means tapping between fields and scrolling, and losing the
             * keyboard on every one of those is what made the flow painful.
             * Both inputs keep returnKeyType="done" as the way out.
             *
             * automaticallyAdjustKeyboardInsets scrolls the focused field above
             * the keyboard natively (iOS). The extra bottom padding clears the
             * sticky "Démarrer" bar, which sits outside this ScrollView.
             */}
            <ScrollView
                className="flex-1"
                contentContainerClassName="pt-safe-offset-3 pb-[88px]"
                automaticallyAdjustKeyboardInsets
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-3">
                    <View className="mb-3.5 flex-row items-center justify-end gap-2">
                        <Pressable
                            onPress={() => router.push("/custom")}
                            accessibilityRole="button"
                            accessibilityLabel={`Mes jeux, ${customs.length}`}
                            className="flex-row items-center gap-1.5 rounded-full bg-keymuted px-2.5 py-1.5 active:opacity-70 dark:bg-keymuted-dark"
                        >
                            <Text className="text-xs font-semibold text-ink dark:text-ink-dark">Mes jeux</Text>
                            <Num className="text-xs font-bold text-muted">{customs.length}</Num>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push("/history")}
                            accessibilityRole="button"
                            accessibilityLabel={`Historique, ${history.length} ${history.length > 1 ? "parties" : "partie"}`}
                            className="flex-row items-center gap-1.5 rounded-full bg-keymuted px-2.5 py-1.5 active:opacity-70 dark:bg-keymuted-dark"
                        >
                            <Text className="text-xs font-semibold text-ink dark:text-ink-dark">Historique</Text>
                            <Num className="text-xs font-bold text-muted">{history.length}</Num>
                        </Pressable>
                    </View>
                    <Text className="text-[42px] leading-[46px] tracking-[-1.6px]">
                        <Display className="text-ink dark:text-ink-dark">Nouvelle </Display>
                        <Display className="text-accent">partie.</Display>
                    </Text>
                </View>

                <View className="gap-6 px-6 pb-3 pt-5">
                    <Field label="Nom">
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            accessibilityLabel="Nom de la partie"
                            placeholder={todayLabel()}
                            placeholderTextColor={c.muted}
                            returnKeyType="done"
                            autoCapitalize="sentences"
                            style={{
                                borderBottomWidth: 1.5,
                                borderColor: c.lineStrong,
                                paddingVertical: 12,
                                fontSize: 17,
                                fontWeight: "500",
                                color: c.ink,
                            }}
                        />
                    </Field>

                    <Field label="Jeu">
                        <GamePicker
                            ruleId={ruleId}
                            onSelect={setRuleId}
                        />
                    </Field>

                    {ruleId === "papayo" && (
                        <Field label="Objectif de points">
                            {/* number-pad has no native return key. iOS gets a checkmark docked
                                to the keyboard itself (reachable without moving the thumb);
                                Android, which has no InputAccessoryView, gets one inline. */}
                            <TextInput
                                value={papayoTarget}
                                onChangeText={(v) => setPapayoTarget(v.replace(/[^0-9]/g, ""))}
                                accessibilityLabel="Objectif de points de la partie"
                                placeholder="500"
                                placeholderTextColor={c.muted}
                                keyboardType="number-pad"
                                maxLength={5}
                                inputAccessoryViewID={Platform.OS === "ios" ? PAPAYO_TARGET_ACCESSORY_ID : undefined}
                                style={{
                                    borderBottomWidth: 1.5,
                                    borderColor: c.lineStrong,
                                    paddingVertical: 12,
                                    fontSize: 17,
                                    fontWeight: "500",
                                    fontVariant: ["tabular-nums"],
                                    color: c.ink,
                                }}
                            />
                            {Platform.OS !== "ios" && (
                                <Pressable
                                    onPress={() => Keyboard.dismiss()}
                                    accessibilityRole="button"
                                    accessibilityLabel="Valider l'objectif de points"
                                    hitSlop={8}
                                    className="mt-2 h-9 w-9 items-center justify-center self-start rounded-full bg-accent active:opacity-80"
                                >
                                    <Check
                                        color="#fff"
                                        size={14}
                                    />
                                </Pressable>
                            )}
                        </Field>
                    )}

                    {Platform.OS === "ios" && (
                        <InputAccessoryView nativeID={PAPAYO_TARGET_ACCESSORY_ID}>
                            <View className="flex-row justify-start bg-elevated px-3 py-2 dark:bg-elevated-dark">
                                <Pressable
                                    onPress={() => Keyboard.dismiss()}
                                    accessibilityRole="button"
                                    accessibilityLabel="Valider l'objectif de points"
                                    hitSlop={8}
                                    className="h-9 w-9 items-center justify-center rounded-full bg-accent active:opacity-80"
                                >
                                    <Check
                                        color="#fff"
                                        size={14}
                                    />
                                </Pressable>
                            </View>
                        </InputAccessoryView>
                    )}

                    <Field label="Joueurs">
                        <View>
                            {players.map((p, i) => (
                                <PlayerRow
                                    key={i}
                                    index={i}
                                    value={p}
                                    last={i === players.length - 1}
                                    onChange={(v) => setEntered(players.map((x, idx) => (idx === i ? v : x)))}
                                    onRemove={players.length > rule.minPlayers ? () => removePlayer(i) : undefined}
                                    inputRef={(el) => {
                                        inputRefs.current[i] = el;
                                    }}
                                />
                            ))}
                        </View>
                        <AddPlayerButton
                            onPress={addPlayer}
                            disabled={players.length >= rule.maxPlayers}
                        />
                    </Field>
                </View>
            </ScrollView>

            <View className="border-t border-line bg-bg px-4 pb-safe-offset-4 pt-3 dark:border-line-dark dark:bg-bg-dark">
                <PrimaryButton onPress={start}>Démarrer la partie</PrimaryButton>
            </View>
        </KeyboardAvoidingView>
    );
}
