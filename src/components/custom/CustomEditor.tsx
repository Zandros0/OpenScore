import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { draftFromRule, emptyDraft, ruleFromDraft, validateDraft, type RuleDraft } from "@/games";
import { deleteCustomRule, saveCustomRule } from "@/store/gameStore";
import { useCustomRule } from "@/store/useGame";
import { useColors } from "@/theme/colors";

import { IconButton } from "../ui/IconButton";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Display } from "../ui/Txt";
import { Chevron } from "../ui/icons";
import { CustomForm } from "./CustomForm";

/** Editor for one custom rule. `ruleId` undefined = creation. */
export function CustomEditor({ ruleId }: { ruleId?: string }) {
    const router = useRouter();
    const c = useColors();
    const existing = useCustomRule(ruleId);
    // The route decides the mode, not the lookup: the rule can be missing (store not
    // hydrated yet) or gone (just deleted) while this screen is still mounted.
    const editing = !!ruleId;

    const [draft, setDraft] = useState<RuleDraft>(() => (existing ? draftFromRule(existing) : emptyDraft()));
    const [error, setError] = useState<string | null>(null);

    // Seed once per rule. Entering `/custom/<id>` cold renders before the store is
    // hydrated, so the draft has to catch the rule when it lands; later store updates
    // are this screen's own saves and must not clobber what is being typed.
    const seeded = useRef(existing?.id);
    useEffect(() => {
        if (existing && seeded.current !== existing.id) {
            seeded.current = existing.id;
            setDraft(draftFromRule(existing));
        }
    }, [existing]);

    const patch = (p: Partial<RuleDraft>) => {
        setDraft((d) => ({ ...d, ...p }));
        setError(null);
    };

    const save = () => {
        const invalid = validateDraft(draft);
        if (invalid) return setError(invalid);
        saveCustomRule(ruleFromDraft(draft, existing ?? undefined));
        router.back();
    };

    const confirmDelete = () => {
        if (!existing) return;
        Alert.alert(`Supprimer « ${existing.name} » ?`, "Les parties déjà jouées avec ce jeu repasseront en comptage libre.", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: () => {
                    deleteCustomRule(existing.id);
                    router.back();
                },
            },
        ]);
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-bg dark:bg-bg-dark"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View className="flex-row items-center gap-2.5 px-4 pb-1 pt-safe-offset-2">
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
                <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-muted">Mes jeux</Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerClassName="pb-[88px]"
                automaticallyAdjustKeyboardInsets
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-3.5">
                    <Text className="text-[34px] leading-[38px] tracking-[-1.2px]">
                        <Display className="text-ink dark:text-ink-dark">{editing ? "Modifier " : "Créer "}</Display>
                        <Display className="text-accent">un jeu.</Display>
                    </Text>
                </View>

                <CustomForm
                    draft={draft}
                    patch={patch}
                />

                {editing && (
                    <View className="px-6 pt-2">
                        <Pressable
                            onPress={confirmDelete}
                            accessibilityRole="button"
                            accessibilityLabel="Supprimer ce jeu"
                            className="h-12 items-center justify-center rounded-xl bg-keymuted active:opacity-70 dark:bg-keymuted-dark"
                        >
                            <Text className="text-sm font-semibold text-danger dark:text-danger-dark">Supprimer ce jeu</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            <View className="border-t border-line bg-bg px-4 pb-safe-offset-4 pt-3 dark:border-line-dark dark:bg-bg-dark">
                {error && <Text className="mb-2 text-center text-[13px] font-semibold text-danger dark:text-danger-dark">{error}</Text>}
                <PrimaryButton
                    onPress={save}
                    arrow={false}
                >
                    {editing ? "Enregistrer" : "Créer le jeu"}
                </PrimaryButton>
            </View>
        </KeyboardAvoidingView>
    );
}
