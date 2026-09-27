// Body of the custom-rule editor: every field of `RuleDraft`, no logic beyond
// patching the draft. Validation and persistence live in CustomEditor.

import { Text, View } from "react-native";

import type { RuleDraft, ScoreDirection } from "@/games";

import { Field } from "../home/parts";
import { ChoicePair, NumField, TextField, ToggleRow } from "./fields";

const DIRECTIONS: { value: ScoreDirection; title: string; meta: string }[] = [
    { value: "asc", title: "Le plus haut", meta: "Le plus de points gagne" },
    { value: "desc", title: "Le plus bas", meta: "Le moins de points gagne" },
];

export function CustomForm({
    draft,
    patch,
}: {
    draft: RuleDraft;
    patch: (p: Partial<RuleDraft>) => void;
}) {
    return (
        <View className="gap-6 px-6 pb-3 pt-5">
            <TextField
                label="Nom"
                value={draft.name}
                onChange={(name) => patch({ name })}
                placeholder="Mon jeu"
            />

            <TextField
                label="Description"
                value={draft.description}
                onChange={(description) => patch({ description })}
                placeholder="Générée si laissée vide"
            />

            <Field label="Score gagnant">
                <ChoicePair
                    options={DIRECTIONS}
                    value={draft.scoreDirection}
                    onChange={(scoreDirection) => patch({ scoreDirection })}
                />
            </Field>

            <Field label="Joueurs">
                <View className="flex-row gap-3">
                    <NumField
                        label="Minimum"
                        value={draft.minPlayers}
                        onChange={(minPlayers) => patch({ minPlayers })}
                        placeholder="2"
                    />
                    <NumField
                        label="Maximum"
                        value={draft.maxPlayers}
                        onChange={(maxPlayers) => patch({ maxPlayers })}
                        placeholder="6"
                    />
                </View>
            </Field>

            <Field label="Limites">
                <View className="flex-row gap-3">
                    <NumField
                        label="Pts / manche"
                        value={draft.maxRoundScore}
                        // Clearing the round total also disables the auto-fill option, so the
                        // switch can never stay on while its control is greyed out.
                        onChange={(maxRoundScore) => patch({ maxRoundScore, autoFillLast: draft.autoFillLast && !!maxRoundScore })}
                        placeholder="—"
                    />
                    <NumField
                        label="Pts / partie"
                        value={draft.maxGameScore}
                        onChange={(maxGameScore) => patch({ maxGameScore })}
                        placeholder="—"
                    />
                    <NumField
                        label="Manches"
                        value={draft.maxRounds}
                        onChange={(maxRounds) => patch({ maxRounds })}
                        placeholder="—"
                    />
                </View>
                <Text className="mt-2 text-[12px] leading-[16px] text-muted">
                    Laisse vide pour aucune limite. « Pts / partie » et « Manches » terminent la partie, « Pts / manche » borne une manche.
                </Text>
            </Field>

            <Field label="Options">
                <View className="rounded-2xl bg-elevated px-4 dark:bg-elevated-dark">
                    <ToggleRow
                        label="Compléter le dernier joueur"
                        hint="Propose le score restant pour atteindre le total de la manche."
                        value={draft.autoFillLast}
                        onChange={(autoFillLast) => patch({ autoFillLast })}
                        disabled={!draft.maxRoundScore.trim()}
                    />
                </View>
            </Field>
        </View>
    );
}
