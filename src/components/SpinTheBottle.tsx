"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type KeyboardEvent,
  type CSSProperties,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, RotateCcw, Users, Sparkles, Wine } from "lucide-react";

/* ───────── Types ───────── */
interface Player {
  id: string;
  name: string;
  color: string;
  spins: number;
}

/* ───────── Constants ───────── */
const PLAYER_COLORS = [
  "oklch(0.72 0.26 295)", // violet
  "oklch(0.82 0.28 145)", // neon green
  "oklch(0.78 0.22 30)", // warm orange
  "oklch(0.82 0.20 85)", // gold
  "oklch(0.72 0.26 220)", // blue
  "oklch(0.78 0.28 340)", // pink
  "oklch(0.75 0.22 175)", // cyan
  "oklch(0.77 0.20 55)", // amber
];

const CONFETTI_COLORS = [
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#facc15",
  "#60a5fa",
  "#f472b6",
  "#2dd4bf",
  "#fbbf24",
];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ───────── BottleSVG ───────── */
function BottleSVG({
  rotation,
  isSpinning,
}: {
  rotation: number;
  isSpinning: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 260"
      aria-hidden="true"
      style={{
        rotate: `${rotation}deg`,
        transformOrigin: "50% 50%",
        transformBox: "fill-box",
        transition: isSpinning ? "none" : "rotate 0.4s ease-out",
        width: "100%",
        height: "100%",
        filter: "drop-shadow(0 0 18px oklch(0.72 0.26 295 / 0.7))",
      }}
    >
      {/* Bottle body gradient */}
      <defs>
        <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.28 0.18 285)" />
          <stop offset="40%" stopColor="oklch(0.55 0.22 295)" />
          <stop offset="70%" stopColor="oklch(0.65 0.25 300)" />
          <stop offset="100%" stopColor="oklch(0.30 0.16 285)" />
        </linearGradient>
        <linearGradient id="neckGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.25 0.16 285)" />
          <stop offset="50%" stopColor="oklch(0.50 0.20 295)" />
          <stop offset="100%" stopColor="oklch(0.26 0.15 285)" />
        </linearGradient>
        <linearGradient id="glassSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id="bottomGlow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="oklch(0.72 0.26 295 / 0.4)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="innerGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Bottle base glow */}
      <ellipse cx="50" cy="245" rx="28" ry="6" fill="url(#bottomGlow)" />

      {/* Main bottle body */}
      <path
        d="M22 130 Q20 200 22 240 Q22 250 50 250 Q78 250 78 240 Q80 200 78 130 Z"
        fill="url(#bottleGrad)"
      />

      {/* Shoulder curve */}
      <path
        d="M35 100 Q22 112 22 130 L78 130 Q78 112 65 100 Z"
        fill="url(#bottleGrad)"
      />

      {/* Neck */}
      <rect x="35" y="40" width="30" height="62" rx="4" fill="url(#neckGrad)" />

      {/* Bottle lip/cap */}
      <rect
        x="32"
        y="30"
        width="36"
        height="14"
        rx="4"
        fill="oklch(0.60 0.24 295)"
      />
      <rect
        x="34"
        y="20"
        width="32"
        height="14"
        rx="3"
        fill="oklch(0.68 0.26 298)"
      />

      {/* Glass sheen highlight on body */}
      <path
        d="M29 135 Q28 185 29 235"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.18"
        fill="none"
      />
      <path
        d="M33 140 Q31 190 33 232"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.10"
        fill="none"
      />

      {/* Label area */}
      <rect
        x="28"
        y="155"
        width="44"
        height="58"
        rx="5"
        fill="oklch(0.22 0.12 285 / 0.6)"
      />
      <text
        x="50"
        y="181"
        textAnchor="middle"
        fontSize="7"
        fontFamily="sans-serif"
        fill="oklch(0.82 0.20 295)"
        fontWeight="bold"
        letterSpacing="1"
      >
        SPIN
      </text>
      <text
        x="50"
        y="193"
        textAnchor="middle"
        fontSize="6"
        fontFamily="sans-serif"
        fill="oklch(0.72 0.15 295)"
        letterSpacing="1"
      >
        THE
      </text>
      <text
        x="50"
        y="205"
        textAnchor="middle"
        fontSize="7"
        fontFamily="sans-serif"
        fill="oklch(0.82 0.20 295)"
        fontWeight="bold"
        letterSpacing="1"
      >
        BOTTLE
      </text>

      {/* Liquid inside */}
      <path
        d="M24 200 Q24 245 50 248 Q76 245 76 200 Z"
        fill="oklch(0.42 0.18 285 / 0.5)"
      />

      {/* Glass sheen overlay */}
      <path
        d="M36 42 Q35 70 36 98 L41 98 Q40 70 41 42 Z"
        fill="url(#glassSheen)"
      />
    </svg>
  );
}

/* ───────── Confetti ───────── */
interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  shape: "rect" | "circle";
}

function Confetti() {
  const pieces = useRef<ConfettiPiece[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 10,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    })),
  ).current;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-50"
    >
      {pieces.map((p) =>
        p.shape === "rect" ? (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: "-20px",
              width: `${p.size}px`,
              height: `${p.size * 0.5}px`,
              background: p.color,
              borderRadius: "2px",
              animationName: "confetti-fall",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
            }}
          />
        ) : (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: "-20px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              borderRadius: "50%",
              animationName: "confetti-fall",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
            }}
          />
        ),
      )}
    </div>
  );
}

/* ───────── PlayerCard ───────── */
function PlayerCard({
  player,
  onRemove,
  isSelected,
  isSpinner,
  rank,
}: {
  player: Player;
  onRemove: (id: string) => void;
  isSelected: boolean;
  isSpinner: boolean;
  rank: number;
}) {
  return (
    <div
      role="listitem"
      className={[
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group",
        "border",
        isSelected
          ? "border-[var(--game-accent)] bg-[var(--game-accent)]/10 scale-105"
          : isSpinner
            ? "border-[var(--game-neon)] bg-[var(--game-neon)]/10 scale-102"
            : "border-[var(--game-border)] bg-[var(--game-surface)]",
      ].join(" ")}
    >
      {/* Rank */}
      <span
        className="text-xs font-mono w-5 text-center shrink-0"
        style={{ color: "var(--game-text-muted)" }}
      >
        {rank}
      </span>

      {/* Avatar */}
      <Avatar
        className="size-8 shrink-0 transition-all duration-300"
        style={{ outline: `2px solid ${player.color}`, outlineOffset: "2px" }}
      >
        <AvatarFallback
          className="text-xs font-bold text-white"
          style={{ background: player.color }}
        >
          {getInitials(player.name)}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <span
        className="flex-1 text-sm font-medium truncate min-w-0"
        style={{ color: "var(--game-text)" }}
      >
        {player.name}
      </span>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isSelected && (
          <Badge
            className="text-[10px] px-1.5 py-0.5 animate-pulse"
            style={{
              background: "var(--game-accent)",
              color: "oklch(0.1 0 0)",
              border: "none",
            }}
          >
            🎯 Chosen!
          </Badge>
        )}
        {isSpinner && (
          <Badge
            className="text-[10px] px-1.5 py-0.5"
            style={{
              background: "var(--game-neon)",
              color: "oklch(0.1 0 0)",
              border: "none",
            }}
          >
            🔄 Spinning
          </Badge>
        )}
        {player.spins > 0 && (
          <span
            className="text-[10px] font-mono"
            style={{ color: "var(--game-text-muted)" }}
          >
            ×{player.spins}
          </span>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        aria-label={`Remove ${player.name}`}
        onClick={() => onRemove(player.id)}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-red-500"
        style={{ color: "var(--game-text-muted)" }}
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ───────── ResultDialog ───────── */
function ResultDialog({
  open,
  spinner,
  target,
  onClose,
}: {
  open: boolean;
  spinner: Player | null;
  target: Player | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm border-0 p-0 overflow-hidden"
        style={{
          background: "var(--game-surface)",
          boxShadow:
            "0 0 60px 10px var(--game-accent), 0 0 120px 30px var(--game-accent-2)",
        }}
        aria-live="polite"
      >
        {/* Header gradient band */}
        <div
          className="h-2 w-full"
          style={{
            background:
              "linear-gradient(to right in oklab, var(--game-accent), var(--game-neon), var(--game-warm))",
          }}
        />

        <div className="px-8 py-8 text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div
                className="size-20 rounded-full flex items-center justify-center bounce-in"
                style={{
                  background: target?.color,
                  boxShadow: `0 0 30px ${target?.color ?? "transparent"}`,
                }}
              >
                <span className="text-3xl font-bold text-white">
                  {target ? getInitials(target.name) : "?"}
                </span>
              </div>
            </div>

            <DialogTitle
              className="text-3xl font-bold mb-2 shimmer-text"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {target?.name ?? "…"}
            </DialogTitle>
          </DialogHeader>

          <p
            className="text-sm mb-1"
            style={{ color: "var(--game-text-muted)" }}
          >
            The bottle chose you!
          </p>
          {spinner && (
            <p
              className="text-sm font-medium mb-6"
              style={{ color: "var(--game-text)" }}
            >
              <span style={{ color: "var(--game-text-muted)" }}>Spinner: </span>
              {spinner.name}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              id="result-close-btn"
              onClick={onClose}
              className="flex-1 font-semibold py-5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg in oklab, var(--game-accent), var(--game-accent-2))",
                color: "white",
                border: "none",
              }}
            >
              <RotateCcw size={16} aria-hidden="true" className="mr-2" />
              Spin Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── PlayerRing ───────── */
function PlayerRing({
  players,
  selectedIdx,
  spinnerIdx,
  radius,
}: {
  players: Player[];
  selectedIdx: number | null;
  spinnerIdx: number | null;
  radius: number;
}) {
  if (players.length === 0) return null;

  return (
    <>
      {players.map((p, i) => {
        const angle = (i / players.length) * 360 - 90; // start at top
        const rad = (angle * Math.PI) / 180;
        const cx = 50 + radius * Math.cos(rad);
        const cy = 50 + radius * Math.sin(rad);

        const isSelected = selectedIdx === i;
        const isSpinner = spinnerIdx === i;

        return (
          <div
            key={p.id}
            aria-hidden="true"
            className="absolute flex flex-col items-center transition-all duration-500"
            style={{
              left: `${cx}%`,
              top: `${cy}%`,
              transform: "translate(-50%, -50%)",
              zIndex: isSelected ? 10 : 1,
            }}
          >
            {/* Ping ring for selected */}
            {isSelected && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: p.color,
                  animation: "ring-ping 1s ease-out infinite",
                  opacity: 0.6,
                }}
              />
            )}

            <div
              className="size-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg transition-all duration-300"
              style={{
                background: p.color,
                boxShadow: isSelected
                  ? `0 0 0 3px white, 0 0 20px ${p.color}`
                  : isSpinner
                    ? `0 0 0 2px var(--game-neon), 0 0 12px var(--game-neon)`
                    : `0 4px 16px ${p.color}80`,
                transform: isSelected
                  ? "scale(1.3)"
                  : isSpinner
                    ? "scale(1.1)"
                    : "scale(1)",
              }}
            >
              {getInitials(p.name)}
            </div>
            <span
              className="mt-1 text-[10px] font-medium max-w-[60px] text-center leading-tight"
              style={{
                color: isSelected ? p.color : "var(--game-text-muted)",
                fontWeight: isSelected ? "700" : "500",
              }}
            >
              {p.name}
            </span>
          </div>
        );
      })}
    </>
  );
}

/* ───────── Main Game Component ───────── */
export default function SpinTheBottle() {
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Alice", color: PLAYER_COLORS[0], spins: 0 },
    { id: "2", name: "Bob", color: PLAYER_COLORS[1], spins: 0 },
    { id: "3", name: "Charlie", color: PLAYER_COLORS[2], spins: 0 },
  ]);
  const [newName, setNewName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [bottleRotation, setBottleRotation] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [spinnerIdx, setSpinnerIdx] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const inputId = useId();
  const spinnerRef = useRef<number>(0); // tracks current spinner index
  const totalRotation = useRef(0);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  /* Pick a random player that isn't the spinner */
  const pickTarget = useCallback(
    (spinnerIndex: number, playerCount: number) => {
      const others = Array.from({ length: playerCount }, (_, i) => i).filter(
        (i) => i !== spinnerIndex,
      );
      return others[Math.floor(Math.random() * others.length)];
    },
    [],
  );

  /* Add player */
  const addPlayer = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed || players.length >= MAX_PLAYERS) return;
    const idx = players.length % PLAYER_COLORS.length;
    setPlayers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        color: PLAYER_COLORS[idx],
        spins: 0,
      },
    ]);
    setNewName("");
  }, [newName, players.length]);

  /* Remove player */
  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setSelectedIdx(null);
    setSpinnerIdx(null);
  }, []);

  /* Spin */
  const spin = useCallback(() => {
    if (isSpinning || players.length < MIN_PLAYERS) return;

    setSelectedIdx(null);
    setShowResult(false);
    setShowConfetti(false);

    // Randomly pick spinner (could rotate through or be random)
    const sIdx =
      spinnerRef.current === null
        ? 0
        : (spinnerRef.current + 1) % players.length;
    spinnerRef.current = sIdx;
    setSpinnerIdx(sIdx);

    const tIdx = pickTarget(sIdx, players.length);

    // Calculate bottle final angle to point at target
    const targetAngle = (tIdx / players.length) * 360;
    const extraSpins = 3 + Math.floor(Math.random() * 4); // 3–6 full rotations
    const finalAngle = totalRotation.current + extraSpins * 360 + targetAngle;

    const duration = prefersReducedMotion.current
      ? 100
      : 3000 + Math.random() * 1500;

    setIsSpinning(true);

    if (prefersReducedMotion.current) {
      // Instant result
      totalRotation.current = finalAngle;
      setBottleRotation(finalAngle);
      setIsSpinning(false);
      setSelectedIdx(tIdx);
      setPlayers((prev) =>
        prev.map((p, i) => (i === sIdx ? { ...p, spins: p.spins + 1 } : p)),
      );
      setShowResult(true);
      setShowConfetti(true);
      return;
    }

    // Animate via JS-controlled CSS rotation
    const start = performance.now();
    const from = totalRotation.current;
    const diff = finalAngle - from;

    function ease(t: number) {
      // cubic ease-out: fast start → slow end
      return 1 - Math.pow(1 - t, 4);
    }

    function frame(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = from + diff * ease(progress);
      setBottleRotation(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        totalRotation.current = finalAngle;
        setBottleRotation(finalAngle);
        setIsSpinning(false);
        setSelectedIdx(tIdx);
        setPlayers((prev) =>
          prev.map((p, i) => (i === sIdx ? { ...p, spins: p.spins + 1 } : p)),
        );
        setTimeout(() => {
          setShowResult(true);
          setShowConfetti(true);
        }, 400);
      }
    }

    requestAnimationFrame(frame);
  }, [isSpinning, players, pickTarget]);

  /* Handle Enter key in name input */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") addPlayer();
    },
    [addPlayer],
  );

  /* Hide confetti after delay */
  useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, [showConfetti]);

  const canSpin = players.length >= MIN_PLAYERS && !isSpinning;

  return (
    <main
      id="main-content"
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--game-bg)" }}
    >
      {/* Skip link */}
      <a
        href="#spin-btn"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-black focus:font-semibold"
      >
        Skip to spin button
      </a>

      {/* Background gradient blobs */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
      >
        <div
          className="absolute -top-40 -left-40 size-[600px] rounded-full blur-3xl opacity-20"
          style={{ background: "var(--game-accent)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 size-[600px] rounded-full blur-3xl opacity-15"
          style={{ background: "var(--game-accent-2)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] rounded-full blur-3xl opacity-10"
          style={{ background: "var(--game-neon)" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 text-center pt-8 pb-4 px-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Wine
            size={28}
            aria-hidden="true"
            style={{ color: "var(--game-accent)" }}
          />
          <h1
            className="text-3xl sm:text-4xl font-bold shimmer-text"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Spin the Bottle
          </h1>
          <Wine
            size={28}
            aria-hidden="true"
            style={{ color: "var(--game-accent)", transform: "scaleX(-1)" }}
          />
        </div>
        <p className="text-sm" style={{ color: "var(--game-text-muted)" }}>
          Add players, spin the bottle, let fate decide!
        </p>
      </header>

      {/* Main layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 px-4 pb-8 max-w-6xl mx-auto w-full">
        {/* === Left: Player List === */}
        <aside
          className="lg:w-72 xl:w-80 flex flex-col gap-4"
          aria-label="Player management"
        >
          {/* Add player card */}
          <section
            className="rounded-2xl p-4 border"
            style={{
              background: "var(--game-surface)",
              borderColor: "var(--game-border)",
            }}
            aria-label="Add a player"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users
                size={16}
                aria-hidden="true"
                style={{ color: "var(--game-accent)" }}
              />
              <h2
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: "var(--game-text-muted)" }}
              >
                Players ({players.length}/{MAX_PLAYERS})
              </h2>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor={inputId} className="sr-only">
                  Player name
                </Label>
                <Input
                  id={inputId}
                  type="text"
                  placeholder="Player name…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={players.length >= MAX_PLAYERS}
                  className="rounded-xl border-0 text-sm"
                  style={{
                    background: "var(--game-surface-2)",
                    color: "var(--game-text)",
                    caretColor: "var(--game-accent)",
                  }}
                  aria-label="Enter player name"
                />
              </div>
              <Button
                type="button"
                id="add-player-btn"
                onClick={addPlayer}
                disabled={!newName.trim() || players.length >= MAX_PLAYERS}
                className="rounded-xl px-3 transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "var(--game-accent)",
                  color: "white",
                  border: "none",
                }}
                aria-label="Add player"
              >
                <Plus size={18} aria-hidden="true" />
              </Button>
            </div>

            {players.length < MIN_PLAYERS && (
              <p
                className="text-xs mt-2"
                role="status"
                aria-live="polite"
                style={{ color: "var(--game-warm)" }}
              >
                Add at least {MIN_PLAYERS - players.length} more player
                {MIN_PLAYERS - players.length !== 1 ? "s" : ""} to play.
              </p>
            )}
          </section>

          {/* Player list */}
          <section
            className="rounded-2xl p-4 border flex-1"
            style={{
              background: "var(--game-surface)",
              borderColor: "var(--game-border)",
            }}
            aria-label="Player list"
          >
            <div
              role="list"
              className="flex flex-col gap-2"
              aria-label="Players in game"
            >
              {players.length === 0 ? (
                <p
                  className="text-sm text-center py-4"
                  style={{ color: "var(--game-text-muted)" }}
                >
                  No players yet. Add some above!
                </p>
              ) : (
                players.map((p, i) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    onRemove={removePlayer}
                    isSelected={selectedIdx === i}
                    isSpinner={spinnerIdx === i && isSpinning}
                    rank={i + 1}
                  />
                ))
              )}
            </div>
          </section>
        </aside>

        {/* === Right: Game Board === */}
        <section
          className="flex-1 flex flex-col items-center justify-center gap-6"
          aria-label="Game board"
        >
          {/* Spinning area */}
          <div
            className="relative rounded-3xl border p-6 flex flex-col items-center justify-center w-full"
            style={{
              background: "var(--game-surface)",
              borderColor: "var(--game-border)",
              minHeight: "420px",
            }}
          >
            {/* Decorative ring */}
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-full border-2 border-dashed opacity-20"
              style={{ borderColor: "var(--game-accent)" }}
            />
            {/* Inner ring */}
            <div
              aria-hidden="true"
              className="absolute inset-16 rounded-full border opacity-10"
              style={{ borderColor: "var(--game-neon)" }}
            />

            {/* Player ring around bottle */}
            <div className="absolute inset-0" aria-hidden="true">
              <div className="relative w-full h-full">
                <PlayerRing
                  players={players}
                  selectedIdx={selectedIdx}
                  spinnerIdx={
                    spinnerIdx !== null && isSpinning ? spinnerIdx : null
                  }
                  radius={38}
                />
              </div>
            </div>

            {/* Center glow + bottle */}
            <div
              className="relative z-10 flex flex-col items-center"
              style={{ width: "min(160px, 35vw)", height: "min(280px, 55vw)" }}
            >
              {/* Center glow */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full blur-2xl opacity-30 pointer-events-none"
                style={{
                  background: "var(--game-accent)",
                  transform: "scale(1.2)",
                }}
              />
              <BottleSVG rotation={bottleRotation} isSpinning={isSpinning} />
            </div>

            {/* Status text */}
            <div
              role="status"
              aria-live="polite"
              className="absolute bottom-4 left-0 right-0 text-center text-xs"
              style={{ color: "var(--game-text-muted)" }}
            >
              {isSpinning
                ? "Spinning…"
                : selectedIdx !== null && players[selectedIdx]
                  ? `🎯 ${players[selectedIdx].name} was chosen!`
                  : players.length >= MIN_PLAYERS
                    ? "Press spin to begin"
                    : `Need ${MIN_PLAYERS - players.length} more player${MIN_PLAYERS - players.length !== 1 ? "s" : ""}`}
            </div>
          </div>

          {/* Spin button */}
          <button
            type="button"
            id="spin-btn"
            onClick={spin}
            disabled={!canSpin}
            aria-label={isSpinning ? "Spinning…" : "Spin the bottle"}
            aria-busy={isSpinning}
            className={[
              "relative px-12 py-5 rounded-2xl text-xl font-bold tracking-wide",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
              canSpin
                ? "hover:scale-105 active:scale-95 cursor-pointer btn-glow"
                : "opacity-40 cursor-not-allowed",
            ].join(" ")}
            style={
              {
                background: canSpin
                  ? "linear-gradient(135deg in oklab, var(--game-accent), var(--game-accent-2))"
                  : "var(--game-surface-2)",
                color: "white",
                border: "none",
                boxShadow: canSpin ? undefined : "none",
                focusRingColor: "var(--game-accent)",
              } as CSSProperties
            }
          >
            <span className="flex items-center gap-3">
              <Sparkles size={22} aria-hidden="true" />
              {isSpinning ? "Spinning…" : "Spin!"}
              <Sparkles size={22} aria-hidden="true" />
            </span>
          </button>

          {/* Stats row */}
          {players.some((p) => p.spins > 0) && (
            <div
              className="flex flex-wrap justify-center gap-3"
              aria-label="Spin statistics"
            >
              {[...players]
                .sort((a, b) => b.spins - a.spins)
                .slice(0, 5)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${p.color}22`,
                      border: `1px solid ${p.color}55`,
                      color: "var(--game-text)",
                    }}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ background: p.color }}
                      aria-hidden="true"
                    />
                    {p.name}: {p.spins} spin{p.spins !== 1 ? "s" : ""}
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Result dialog */}
      <ResultDialog
        open={showResult}
        spinner={spinnerIdx !== null ? (players[spinnerIdx] ?? null) : null}
        target={selectedIdx !== null ? (players[selectedIdx] ?? null) : null}
        onClose={() => {
          setShowResult(false);
          setSelectedIdx(null);
          setSpinnerIdx(null);
          spinnerRef.current =
            (spinnerRef.current + 1) % Math.max(players.length, 1);
        }}
      />
    </main>
  );
}
