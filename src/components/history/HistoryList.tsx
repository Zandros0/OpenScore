import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getRule } from "@/games";
import type { Game } from "@/lib/types";
import { replay, resume } from "@/store/gameStore";
import { useHistory } from "@/store/useGame";
import { useColors } from "@/theme/colors";

import { IconButton } from "../ui/IconButton";
import { Display } from "../ui/Txt";
import { Chevron, Search } from "../ui/icons";
import { HistoryCard } from "./HistoryCard";

/** 10px gap between cards (FlashList contentContainerStyle only honours padding). */
function Separator() {
    return <View style={{ height: 10 }} />;
}

export function HistoryList() {
    const router = useRouter();
    const c = useColors();
    const insets = useSafeAreaInsets();
    const history = useHistory();
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return history;
        return history.filter((g) => `${g.name} ${getRule(g.gameRuleId).name}`.toLowerCase().includes(q));
    }, [history, query]);

    const renderItem = useCallback(
        ({ item }: { item: Game }) => (
            <HistoryCard
                game={item}
                onOpen={() => router.push(`/detail/${item.id}`)}
                onResume={() => {
                    if (resume(item.id)) router.navigate("/game");
                }}
                onReplay={() => {
                    if (replay(item.id)) router.navigate("/game");
                }}
            />
        ),
        [router]
    );

    return (
        <View className="flex-1 bg-bg dark:bg-bg-dark">
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
                <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-muted">Historique</Text>
            </View>

            <View className="px-6 pt-3.5">
                <Text className="text-[34px] leading-[38px] tracking-[-1.2px]">
                    <Display className="text-ink dark:text-ink-dark">
                        {history.length || "Aucune"} {history.length > 1 ? "parties" : "partie"}
                    </Display>
                    {"\n"}
                    <Display className="text-muted">jouées.</Display>
                </Text>
            </View>

            <View className="px-4 pb-1.5 pt-5">
                <View className="flex-row items-center gap-2 rounded-xl bg-keymuted px-3.5 dark:bg-keymuted-dark">
                    <Search
                        color={c.muted}
                        size={14}
                    />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        accessibilityLabel="Rechercher une partie"
                        placeholder="Rechercher"
                        placeholderTextColor={c.muted}
                        style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: c.ink }}
                    />
                </View>
            </View>

            <FlashList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={Separator}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 32 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text className="mt-14 text-center text-sm text-muted">
                        {history.length === 0 ? "Aucune partie terminée pour le moment." : "Aucune partie ne correspond."}
                    </Text>
                }
            />
        </View>
    );
}
