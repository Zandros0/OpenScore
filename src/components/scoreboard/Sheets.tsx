import { useEffect, useRef } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";

import { useColors } from "@/theme/colors";

import { BottomSheet } from "../ui/BottomSheet";

function MenuRow({ children, onPress, danger }: { children: string; onPress: () => void; danger?: boolean }) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={children}
            className="rounded-[10px] px-4 py-4 active:bg-keymuted dark:active:bg-keymuted-dark"
        >
            <Text className={`text-base font-medium ${danger ? "text-danger dark:text-danger-dark" : "text-ink dark:text-ink-dark"}`}>
                {children}
            </Text>
        </Pressable>
    );
}

export function GameMenu({
    visible,
    onClose,
    onRename,
    onEnd,
    onEndAndReplay,
    onDelete,
}: {
    visible: boolean;
    onClose: () => void;
    onRename: () => void;
    onEnd: () => void;
    onEndAndReplay: () => void;
    onDelete: () => void;
}) {
    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
        >
            <MenuRow onPress={onRename}>Renommer la partie</MenuRow>
            <MenuRow onPress={onEnd}>Terminer la partie</MenuRow>
            <MenuRow onPress={onEndAndReplay}>Terminer et rejouer</MenuRow>
            <MenuRow
                danger
                onPress={onDelete}
            >
                Supprimer
            </MenuRow>
        </BottomSheet>
    );
}

export function RenameSheet({
    visible,
    value,
    onChange,
    onCancel,
    onSave,
}: {
    visible: boolean;
    value: string;
    onChange: (v: string) => void;
    onCancel: () => void;
    onSave: () => void;
}) {
    const c = useColors();
    const ref = useRef<TextInput>(null);
    useEffect(() => {
        if (visible) {
            const t = setTimeout(() => ref.current?.focus(), 80);
            return () => clearTimeout(t);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
            statusBarTranslucent
            supportedOrientations={["portrait", "landscape"]}
        >
            {/* Centres the dialog in the space left by the keyboard instead of
                behind it. */}
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <Pressable
                    className="flex-1 items-center justify-center bg-night/40 px-6"
                    onPress={onCancel}
                >
                    <Pressable
                        onPress={() => {}}
                        className="w-full rounded-[18px] bg-surface p-[18px] dark:bg-surface-dark"
                    >
                        <Text className="text-base font-bold text-ink dark:text-ink-dark">Renommer</Text>
                        <TextInput
                            ref={ref}
                            value={value}
                            onChangeText={onChange}
                            accessibilityLabel="Nouveau nom de la partie"
                            onSubmitEditing={onSave}
                            returnKeyType="done"
                            style={{
                                marginTop: 12,
                                paddingVertical: 12,
                                borderBottomWidth: 1.5,
                                borderColor: c.accent,
                                fontSize: 16,
                                color: c.ink,
                            }}
                        />
                        <View className="mt-4 flex-row gap-2">
                            <Pressable
                                onPress={onCancel}
                                accessibilityRole="button"
                                accessibilityLabel="Annuler"
                                className="h-11 flex-1 items-center justify-center rounded-xl bg-keymuted active:opacity-70 dark:bg-keymuted-dark"
                            >
                                <Text className="text-sm font-semibold text-ink dark:text-ink-dark">Annuler</Text>
                            </Pressable>
                            <Pressable
                                onPress={onSave}
                                accessibilityRole="button"
                                accessibilityLabel="Enregistrer le nom"
                                className="h-11 flex-1 items-center justify-center rounded-xl bg-accent active:opacity-90"
                            >
                                <Text className="text-sm font-semibold text-white">OK</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}
