import { Pressable, Text, TextInput, View } from "react-native";

import { useColors } from "@/theme/colors";

import { Num } from "../ui/Txt";

/** Uppercase section label with optional trailing control. */
export function Field({ label, trailing, children }: { label: string; trailing?: React.ReactNode; children: React.ReactNode }) {
    return (
        <View>
            <View className="mb-2.5 flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-[1.4px] text-ink2 dark:text-ink2-dark">{label}</Text>
                {trailing}
            </View>
            {children}
        </View>
    );
}

export function PlayerRow({
    index,
    value,
    onChange,
    onRemove,
    last,
    inputRef,
}: {
    index: number;
    value: string;
    onChange: (v: string) => void;
    onRemove?: () => void;
    last: boolean;
    inputRef?: (el: TextInput | null) => void;
}) {
    const c = useColors();
    return (
        <View className={`flex-row items-center gap-3 py-3 ${last ? "" : "border-b border-line dark:border-line-dark"}`}>
            <Num className="w-[22px] text-[15px] font-bold text-muted">{index + 1}.</Num>
            <TextInputRow
                value={value}
                onChange={onChange}
                inputRef={inputRef}
                placeholder={`Joueur ${index + 1}`}
                color={c.ink}
                muted={c.muted}
            />
            {onRemove && (
                <Pressable
                    onPress={onRemove}
                    accessibilityRole="button"
                    accessibilityLabel={`Retirer le joueur ${index + 1}`}
                    hitSlop={8}
                    className="h-7 w-7 items-center justify-center rounded-full bg-keymuted active:opacity-70 dark:bg-keymuted-dark"
                >
                    <Text className=" text-base leading-none text-muted">×</Text>
                </Pressable>
            )}
        </View>
    );
}

/** Full-width dashed button that appends a new (empty) player row. */
export function AddPlayerButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Ajouter un joueur"
            accessibilityState={{ disabled }}
            className={`mt-3 flex-row items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-3 dark:border-line-dark ${disabled ? "opacity-40" : "active:opacity-70"}`}
        >
            <Text className=" text-lg leading-none text-accent">+</Text>
            <Text className="text-sm font-semibold text-ink dark:text-ink-dark">Ajouter un joueur</Text>
        </Pressable>
    );
}

// Small wrapper so the player input keeps a single styled definition.
function TextInputRow({
    value,
    onChange,
    placeholder,
    color,
    muted,
    inputRef,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    color: string;
    muted: string;
    inputRef?: (el: TextInput | null) => void;
}) {
    return (
        <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChange}
            accessibilityLabel={placeholder}
            placeholder={placeholder}
            placeholderTextColor={muted}
            returnKeyType="done"
            autoCapitalize="words"
            autoCorrect={false}
            style={{ flex: 1, fontSize: 17, fontWeight: "500", color, padding: 0 }}
        />
    );
}

