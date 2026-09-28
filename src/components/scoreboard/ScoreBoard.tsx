import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View, type LayoutChangeEvent } from "react-native";

import { getRule } from "@/games";
import type { Game } from "@/lib/types";
import { deleteActive, endActive, endAndReplay, renameActive, setScore } from "@/store/gameStore";
import { useTotals } from "@/store/useGame";

import { CalcKeyboard } from "../keyboard/CalcKeyboard";
import { ChartsModal } from "./charts/ChartsModal";
import { Confetti } from "./Confetti";
import { GameHeader } from "./Header";
import { Podium } from "./Podium";
import { ScoreGrid, type Editing } from "./ScoreGrid";
import { GameMenu, RenameSheet } from "./Sheets";

const LABEL_W = 38;
const ROW_H = 50;
const MIN_COL_W = 52;

export function ScoreBoard({ game }: { game: Game }) {
    const router = useRouter();
    const rule = getRule(game.gameRuleId);
    const totals = useTotals(game);
    const { width, height } = useWindowDimensions();
    const landscape = width > height;

    const [editing, setEditing] = useState<Editing>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [chartsOpen, setChartsOpen] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [nameDraft, setNameDraft] = useState(game.name);
    const [containerW, setContainerW] = useState(390);

    const goHome = () => router.navigate("/");

    // Column width: fill the screen when few players, otherwise size to the
    // longest name (min 52px tap target) and let the grid scroll horizontally.
    const colW = useMemo(() => {
        const longest = game.players.reduce((a, p) => (p.name.length > a ? p.name.length : a), 0);
        const minColW = Math.max(longest * 8 + 18, MIN_COL_W);
        const equalFit = (containerW - LABEL_W) / game.players.length;
        return Math.max(minColW, equalFit);
    }, [game.players, containerW]);

    // A game (partie) target score, distinct from the rule's per-round cap: this game's
    // own override when set at creation (e.g. Papayo's "objectif de points"), else the
    // rule's own maxGameScore for custom rules that define one.
    const targetScore = game.maxGameScore ?? rule.maxGameScore;

    // Progress toward whichever end condition applies. A game cap (partie) ends when
    // *someone* reaches it, so we track the highest running total regardless of who is
    // winning (works for both directions). Otherwise fall back to round-count progress.
    // Null when neither cap is set.
    const totalsValues = Object.values(totals);
    const leadTotal = Math.max(...totalsValues, 0);
    const leadersAtTop = totalsValues.filter((v) => v === leadTotal).length;
    const progress = targetScore
        ? leadTotal / targetScore
        : rule.maxRounds
          ? game.rounds.length / rule.maxRounds
          : null;

    const lastRound = game.rounds[game.rounds.length - 1];
    const lastFilled = !lastRound || game.players.every((p) => typeof lastRound.scores[p.id] === "number");
    // The target ends the game once exactly one player is at or past it — several
    // players tied at (or above) the target keep play going until the tie breaks,
    // even if they're all over. Whoever crosses it can keep going past it too. Gated on
    // `lastFilled`: mid-round, only some players have this round's score in their total,
    // so an early entrant crossing the target first would trip this before their
    // opponents' scores (who might match or beat them) are even in.
    const scoreCapReached = lastFilled && targetScore != null && leadTotal >= targetScore && leadersAtTop === 1;
    // Stop offering a new round once either cap is reached.
    const roundCapReached = (rule.maxRounds != null && game.rounds.length >= rule.maxRounds) || scoreCapReached;
    const displayRounds = lastFilled && !roundCapReached ? [...game.rounds, { id: "__draft__", scores: {} }] : game.rounds;


    // The confetti burst fires once, right when the target is first reached with a
    // clear leader — not on every re-render while the game stays capped, and not just
    // because a resumed or reopened game happens to already be capped on mount. The
    // podium (rendered straight off `scoreCapReached` below) has no such guard: it's
    // meant to stay up for as long as the game stays capped.
    const [showConfetti, setShowConfetti] = useState(false);
    const wasCapped = useRef(scoreCapReached);
    useEffect(() => {
        if (scoreCapReached && !wasCapped.current) {
            setShowConfetti(true);
            const t = setTimeout(() => setShowConfetti(false), 2200);
            wasCapped.current = true;
            return () => clearTimeout(t);
        }
        wasCapped.current = scoreCapReached;
    }, [scoreCapReached]);

    // Move to the next player without a score on this row; close when the row is full.
    const goNext = (justSetId: string | null) => {
        if (!editing) return;
        const round = game.rounds[editing.roundIndex] ?? { scores: {} };
        const filled = new Set(game.players.filter((p) => typeof round.scores[p.id] === "number").map((p) => p.id));
        if (justSetId) filled.add(justSetId);
        const idx = game.players.findIndex((p) => p.id === editing.playerId);
        const n = game.players.length;
        for (let i = 1; i <= n; i++) {
            const next = game.players[(idx + i) % n];
            if (!filled.has(next.id)) {
                setEditing({ roundIndex: editing.roundIndex, playerId: next.id });
                return;
            }
        }
        setEditing(null);
    };

    const editingPlayer = editing ? game.players.find((p) => p.id === editing.playerId) : undefined;
    const editingValue = editing ? game.rounds[editing.roundIndex]?.scores[editing.playerId] : undefined;
    const roundScores = useMemo<Record<string, number | null>>(
        () => (editing ? (game.rounds[editing.roundIndex]?.scores ?? {}) : {}),
        [editing, game.rounds]
    );

    const isLastInRound =
        !!editing && game.players.filter((p) => p.id !== editing.playerId).every((p) => typeof roundScores[p.id] === "number");

    // Papayo-style auto-fill: last remaining player completes the round to maxRoundScore.
    const suggestedFill = useMemo<number | null>(() => {
        if (!editing || !rule.autoFillLast || !rule.maxRoundScore) return null;
        const others = game.players.filter((p) => p.id !== editing.playerId);
        if (!others.every((p) => typeof roundScores[p.id] === "number")) return null;
        const sum = others.reduce((acc, p) => acc + (roundScores[p.id] ?? 0), 0);
        return rule.maxRoundScore - sum;
    }, [editing, rule, game.players, roundScores]);

    const onLayout = (e: LayoutChangeEvent) => setContainerW(e.nativeEvent.layout.width);

    // Same keyboard, two layouts: a bottom sheet in portrait, a docked half-screen
    // column beside the grid in landscape (returns null while no cell is being edited).
    const keyboard = (variant: "sheet" | "side") => (
        <CalcKeyboard
            variant={variant}
            open={!!editing}
            playerName={editingPlayer?.name}
            initial={editingValue}
            suggested={suggestedFill}
            isLastInRound={isLastInRound}
            players={editing ? game.players : []}
            roundScores={roundScores}
            currentPlayerId={editing?.playerId}
            onValidate={(v) => {
                if (editing && v !== null) setScore(editing.roundIndex, editing.playerId, v);
                setEditing(null);
            }}
            onNext={(v) => {
                const wasSet = !!editing && v !== null;
                if (editing && wasSet) setScore(editing.roundIndex, editing.playerId, v);
                goNext(wasSet ? editing!.playerId : null);
            }}
            onSwitchPlayer={(targetId, value) => {
                if (!editing) return;
                if (value !== null) setScore(editing.roundIndex, editing.playerId, value);
                setEditing({ roundIndex: editing.roundIndex, playerId: targetId });
            }}
            onCancel={() => setEditing(null)}
        />
    );

    return (
        // px-safe keeps content clear of the side notch when rotated to landscape
        // (0 in portrait). Top/bottom insets are handled per-panel below.
        <View className="flex-1 bg-bg px-safe dark:bg-bg-dark">
            {/* Landscape: hide the header while the keyboard is docked so the keys
                get the full height (otherwise they're cramped on a phone). */}
            {!(landscape && editing) && (
                <GameHeader
                    game={game}
                    rule={rule}
                    progress={progress}
                    onBack={goHome}
                    onCharts={() => setChartsOpen(true)}
                    onMenu={() => setMenuOpen(true)}
                />
            )}

            <View className={landscape ? "flex-1 flex-row" : "flex-1"}>
                <View
                    className="flex-1"
                    onLayout={onLayout}
                >
                    <ScoreGrid
                        game={game}
                        rounds={displayRounds}
                        totals={totals}
                        colW={colW}
                        labelW={LABEL_W}
                        rowH={ROW_H}
                        editing={editing}
                        onEditCell={(roundIndex, playerId) => setEditing({ roundIndex, playerId })}
                    />
                </View>
                {landscape && keyboard("side")}
            </View>

            {!landscape && keyboard("sheet")}

            {showConfetti && <Confetti />}
            {scoreCapReached && (
                <Podium
                    game={game}
                    rule={rule}
                    totals={totals}
                />
            )}

            <ChartsModal
                visible={chartsOpen}
                onClose={() => setChartsOpen(false)}
                game={game}
            />

            <GameMenu
                visible={menuOpen}
                onClose={() => setMenuOpen(false)}
                onRename={() => {
                    setMenuOpen(false);
                    setNameDraft(game.name);
                    setRenaming(true);
                }}
                onEnd={() => {
                    setMenuOpen(false);
                    endActive();
                    goHome();
                }}
                onEndAndReplay={() => {
                    setMenuOpen(false);
                    setEditing(null);
                    endAndReplay();
                }}
                onDelete={() => {
                    setMenuOpen(false);
                    deleteActive();
                    goHome();
                }}
            />

            <RenameSheet
                visible={renaming}
                value={nameDraft}
                onChange={setNameDraft}
                onCancel={() => {
                    setNameDraft(game.name);
                    setRenaming(false);
                }}
                onSave={() => {
                    renameActive(nameDraft.trim() || game.name);
                    setRenaming(false);
                }}
            />
        </View>
    );
}
