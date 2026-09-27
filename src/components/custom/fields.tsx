// Form controls for the custom-rule editor. Same visual language as the new-game
// form: underlined text inputs, boxed numbers, segmented choices.

import { Switch, Text, TextInput, View } from "react-native";

import { useColors } from "@/theme/colors";

import { Segment } from "../home/pickerParts";

export function TextField({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    const c = useColors();
    return (
        <View>
            <Text className="mb-2 text-xs font-bold uppercase tracking-[1.4px] text-ink2 dark:text-ink2-dark">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                accessibilityLabel={label}
                placeholder={placeholder}
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
        </View>
    );
}

/** Boxed integer input. An empty value is meaningful (= no cap) for the limits. */
export function NumField({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    const c = useColors();
    return (
        <View className="min-w-0 flex-1">
            <Text className="mb-1.5 text-[11px] font-semibold text-muted">{label}</Text>
            <TextInput
                value={value}
                // Keep digits only: the numeric keypad still exposes symbols on some devices.
                onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ""))}
                accessibilityLabel={label}
                placeholder={placeholder}
                placeholderTextColor={c.faint}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={5}
                style={{
                    borderWidth: 1.5,
                    borderColor: c.line,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 11,
                    fontSize: 16,
                    fontWeight: "600",
                    fontVariant: ["tabular-nums"],
                    color: c.ink,
                }}
            />
        </View>
    );
}

export function ToggleRow({
    label,
    hint,
    value,
    onChange,
    disabled,
}: {
    label: string;
    hint: string;
    value: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    const c = useColors();
    return (
        <View className={`flex-row items-center gap-3 py-3 ${disabled ? "opacity-40" : ""}`}>
            <View className="min-w-0 flex-1">
                <Text className="text-[15px] font-semibold text-ink dark:text-ink-dark">{label}</Text>
                <Text className="mt-0.5 text-[12px] leading-[16px] text-muted">{hint}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                accessibilityLabel={label}
                trackColor={{ true: c.accent, false: c.keyMuted }}
            />
        </View>
    );
}

/** Two mutually exclusive options — the game picker's segments, driven by a value. */
export function ChoicePair<T extends string>({
    options,
    value,
    onChange,
}: {
    options: { value: T; title: string; meta: string }[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <View className="flex-row gap-2">
            {options.map((o) => (
                <Segment
                    key={o.value}
                    title={o.title}
                    meta={o.meta}
                    selected={o.value === value}
                    onPress={() => onChange(o.value)}
                />
            ))}
        </View>
    );
}
