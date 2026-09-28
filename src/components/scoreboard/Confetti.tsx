// Full-screen confetti burst, shown for ~2.2s when a player reaches the game's
// target score with a clear lead. Mount/unmount is owned by the caller.

import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const PIECE_COUNT = 40;
const COLORS = ["#2563EB", "#F4633A", "#16A34A", "#9333EA", "#EAB308", "#0891B2", "#DB2777", "#DC2626"];

type PieceSpec = { id: number; color: string; left: number; delay: number; duration: number; drift: number };

function Piece({ color, left, delay, duration, drift }: PieceSpec) {
    const progress = useSharedValue(0);
    useEffect(() => {
        progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateY: progress.value * SCREEN_H * 0.95 },
            { translateX: Math.sin(progress.value * Math.PI * 2) * drift },
            { rotate: `${progress.value * 540}deg` },
        ],
        opacity: 1 - Math.max(0, progress.value - 0.75) / 0.25,
    }));

    return (
        <Animated.View
            pointerEvents="none"
            style={[styles.piece, { left, backgroundColor: color }, style]}
        />
    );
}

export function Confetti() {
    // Math.random() can't run during render (the compiler requires render to stay
    // pure), so the per-piece layout is pulled from that external source in an
    // effect and synced into state — a legitimate one-shot exception to
    // react-hooks/set-state-in-effect, not the runaway-render pattern it guards against.
    const [pieces, setPieces] = useState<PieceSpec[]>([]);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPieces(
            Array.from({ length: PIECE_COUNT }, (_, i) => ({
                id: i,
                color: COLORS[i % COLORS.length],
                left: Math.random() * SCREEN_W,
                delay: Math.random() * 300,
                duration: 1600 + Math.random() * 500,
                drift: 16 + Math.random() * 24,
            }))
        );
    }, []);

    return (
        <View
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
        >
            {pieces.map((p) => (
                <Piece
                    key={p.id}
                    {...p}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    piece: { position: "absolute", top: -20, width: 8, height: 14, borderRadius: 2 },
});
