"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, RotateCcw, Users, Sparkles } from "lucide-react";

/* ───────── Types ───────── */
interface Player {
  id: string;
  name: string;
  color: string; // avatar background (dark fills, so lime text works)
  accentColor: string; // softer tint for backgrounds
  spins: number;
}

/* ───────── Constants ───────── */
// Deep fills so Electric Lime text stays readable (as per Statamic rules)
const PLAYER_PALETTE: { color: string; accentColor: string }[] = [
  { color: "#4c305a", accentColor: "#f5ddee" }, // plum / blossom
  { color: "#191a1b", accentColor: "#d7e5fe" }, // ink  / lilac
  { color: "#3f3f46", accentColor: "#fdf1ef" }, // iron / warm-shell
  { color: "#5e5a5a", accentColor: "#cbd5e0" }, // smoke / mist
  { color: "#4e5154", accentColor: "#cbc2ea" }, // graphite / lavender
  { color: "#334155", accentColor: "#d7e5fe" }, // slate / lilac
  { color: "#3d2b1f", accentColor: "#fdf1ef" }, // dark brown / warm
  { color: "#1e3a5f", accentColor: "#d7e5fe" }, // deep navy / lilac
];

const CONFETTI_COLORS = [
  "#d4ff4c",
  "#cbc2ea",
  "#f5ddee",
  "#d7e5fe",
  "#beb9b3",
  "#4c305a",
  "#191a1b",
  "#fdf1ef",
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

/* ───────── BottleSVG — warm amber editorial bottle ───────── */
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
        transition: isSpinning
          ? "none"
          : "rotate 0.5s cubic-bezier(0.22,1,0.36,1)",
        width: "100%",
        height: "100%",
        filter:
          "drop-shadow(0px 12px 28px rgba(76,48,90,0.22)) drop-shadow(0px 2px 4px rgba(0,0,0,0.12))",
      }}
    >
      <defs>
        {/* Warm amber-brown bottle body */}
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5c3a1e" />
          <stop offset="28%" stopColor="#8b5e3c" />
          <stop offset="55%" stopColor="#a0714f" />
          <stop offset="78%" stopColor="#8b5e3c" />
          <stop offset="100%" stopColor="#4a2e12" />
        </linearGradient>
        <linearGradient id="neckGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a2e12" />
          <stop offset="45%" stopColor="#7a4f30" />
          <stop offset="100%" stopColor="#3d2510" />
        </linearGradient>
        {/* Glass sheen */}
        <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.22" />
          <stop offset="100%" stopColor="white" stopOpacity="0.03" />
        </linearGradient>
        {/* Warm label background */}
        <linearGradient id="labelBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf1ef" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f5ddee" stopOpacity="0.92" />
        </linearGradient>
        {/* Foil cap */}
        <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8b89a" />
          <stop offset="50%" stopColor="#e8d5b7" />
          <stop offset="100%" stopColor="#b8a88a" />
        </linearGradient>
        {/* Bottom plum glow */}
        <radialGradient id="baseGlow" cx="50%" cy="90%" r="55%">
          <stop offset="0%" stopColor="rgba(76,48,90,0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Base shadow glow */}
      <ellipse cx="50" cy="248" rx="26" ry="5" fill="url(#baseGlow)" />

      {/* Main body */}
      <path
        d="M23 128 Q21 196 23 238 Q23 250 50 250 Q77 250 77 238 Q79 196 77 128 Z"
        fill="url(#bodyGrad)"
      />

      {/* Shoulder */}
      <path
        d="M36 98 Q23 110 23 128 L77 128 Q77 110 64 98 Z"
        fill="url(#bodyGrad)"
      />

      {/* Neck */}
      <rect x="36" y="38" width="28" height="62" rx="3" fill="url(#neckGrad)" />

      {/* Foil capsule */}
      <rect x="33" y="28" width="34" height="14" rx="3" fill="url(#capGrad)" />
      {/* Cork tip */}
      <rect x="35" y="19" width="30" height="13" rx="3" fill="#c8b89a" />
      {/* Capsule ridge lines */}
      <line
        x1="33"
        y1="33"
        x2="67"
        y2="33"
        stroke="#b8a070"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <line
        x1="33"
        y1="37"
        x2="67"
        y2="37"
        stroke="#b8a070"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Label */}
      <rect x="26" y="152" width="48" height="62" rx="4" fill="url(#labelBg)" />
      {/* Label border */}
      <rect
        x="26"
        y="152"
        width="48"
        height="62"
        rx="4"
        fill="none"
        stroke="#cbc2ea"
        strokeWidth="0.8"
      />
      {/* Label inner frame */}
      <rect
        x="30"
        y="157"
        width="40"
        height="52"
        rx="2"
        fill="none"
        stroke="#ddd0e8"
        strokeWidth="0.5"
      />

      {/* Label text */}
      <text
        x="50"
        y="175"
        textAnchor="middle"
        fontSize="5.5"
        fontFamily="Georgia, serif"
        fill="#191a1b"
        fontWeight="300"
        letterSpacing="1.5"
      >
        SPIN THE
      </text>
      <text
        x="50"
        y="186"
        textAnchor="middle"
        fontSize="8.5"
        fontFamily="Georgia, serif"
        fill="#191a1b"
        fontWeight="400"
        fontStyle="italic"
        letterSpacing="0.5"
      >
        Bottle
      </text>
      {/* Decorative lime rule */}
      <line
        x1="34"
        y1="191"
        x2="66"
        y2="191"
        stroke="#d4ff4c"
        strokeWidth="1.2"
      />
      <text
        x="50"
        y="200"
        textAnchor="middle"
        fontSize="4.5"
        fontFamily="sans-serif"
        fill="#5e5a5a"
        letterSpacing="1"
      >
        PARTY EDITION
      </text>

      {/* Liquid fill */}
      <path
        d="M25 198 Q25 244 50 247 Q75 244 75 198 Z"
        fill="rgba(92,58,30,0.45)"
      />
      {/* Bubble detail */}
      <circle cx="42" cy="215" r="2" fill="rgba(255,255,255,0.12)" />
      <circle cx="58" cy="225" r="1.4" fill="rgba(255,255,255,0.10)" />
      <circle cx="48" cy="232" r="1" fill="rgba(255,255,255,0.08)" />

      {/* Glass sheen on body */}
      <path
        d="M30 132 Q29 185 30 234"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.13"
        fill="none"
      />
      <path
        d="M34 136 Q33 190 34 232"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.08"
        fill="none"
      />

      {/* Neck sheen */}
      <path
        d="M38 40 Q37.5 65 38 96 L42 96 Q41.5 65 42 40 Z"
        fill="url(#sheen)"
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
    Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 5 + Math.random() * 9,
      delay: Math.random() * 1.8,
      duration: 2.2 + Math.random() * 2,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    })),
  ).current;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-50"
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            width: `${p.size}px`,
            height: p.shape === "rect" ? `${p.size * 0.45}px` : `${p.size}px`,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animationName: "confetti-fall",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
          }}
        />
      ))}
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
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-white transition-all duration-250 group"
      style={{
        borderColor: isSelected ? "#4c305a" : isSpinner ? "#cbc2ea" : "#cbd5e0",
        boxShadow: isSelected
          ? "rgba(94,90,90,0.1) 0px 0px 0px 1px, rgba(76,48,90,0.12) 0px 4px 16px -4px"
          : "rgba(0,0,0,0.05) 0px 1px 2px 0px",
        transform: isSelected ? "scale(1.015)" : "scale(1)",
      }}
    >
      {/* Rank */}
      <span className="text-xs font-mono w-5 text-center shrink-0 text-[#beb9b3]">
        {rank}
      </span>

      {/* Avatar */}
      <Avatar
        className="size-8 shrink-0"
        style={{
          outline: `2px solid ${player.accentColor}`,
          outlineOffset: "1px",
        }}
      >
        <AvatarFallback
          className="text-[10px] font-semibold"
          style={{ background: player.color, color: "#d4ff4c" }}
        >
          {getInitials(player.name)}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <span className="flex-1 text-sm font-light truncate min-w-0 text-[#191a1b]">
        {player.name}
      </span>

      {/* Status badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isSelected && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "#191a1b", color: "#d4ff4c" }}
            role="status"
          >
            Chosen
          </span>
        )}
        {isSpinner && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
            style={{ borderColor: "#cbc2ea", color: "#5e5a5a" }}
          >
            Spinning
          </span>
        )}
        {player.spins > 0 && (
          <span className="text-[10px] font-mono text-[#beb9b3]">
            ×{player.spins}
          </span>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        aria-label={`Remove ${player.name}`}
        onClick={() => onRemove(player.id)}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded-md hover:bg-[#fdf1ef] focus-visible:ring-2 focus-visible:ring-[#cbc2ea] text-[#beb9b3] hover:text-[#5e5a5a]"
      >
        <Trash2 size={13} aria-hidden="true" />
      </button>
    </div>
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
        const angle = (i / players.length) * 360 - 90;
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
              transform: "translate(-50%,-50%)",
              zIndex: isSelected ? 10 : 1,
            }}
          >
            {/* Ping ring */}
            {isSelected && (
              <div
                className="absolute rounded-full"
                style={{
                  inset: 0,
                  background: p.accentColor,
                  animation: "ring-ping 1.1s ease-out infinite",
                }}
              />
            )}

            <div
              className="size-9 rounded-full flex items-center justify-center text-[10px] font-semibold shadow-sm transition-all duration-300"
              style={{
                background: p.color,
                color: "#d4ff4c",
                boxShadow: isSelected
                  ? `0 0 0 2.5px #ffffff, 0 0 0 4px ${p.color}, ${isSelected ? "rgba(76,48,90,0.2) 0px 8px 24px -4px" : ""}`
                  : isSpinner
                    ? `0 0 0 2px #cbc2ea`
                    : `rgba(0,0,0,0.1) 0px 2px 8px -2px`,
                transform: isSelected
                  ? "scale(1.25)"
                  : isSpinner
                    ? "scale(1.08)"
                    : "scale(1)",
              }}
            >
              {getInitials(p.name)}
            </div>

            <span
              className="mt-1 text-[9px] font-medium max-w-14 text-center leading-tight"
              style={{
                color: isSelected ? "#4c305a" : "#beb9b3",
                fontWeight: isSelected ? "600" : "400",
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
          background: "#ffffff",
          boxShadow:
            "rgba(94,90,90,0.1) 0px 0px 0px 1px, rgba(76,48,90,0.18) 0px 24px 64px -12px",
        }}
        aria-live="polite"
      >
        {/* Top gradient band — warm shell → blossom */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(to right in oklab, #fdf1ef, #cbc2ea, #f5ddee)",
          }}
        />

        <div className="px-8 py-8 text-center">
          <DialogHeader>
            {/* Avatar */}
            <div className="flex justify-center mb-5">
              <div
                className="size-20 rounded-full flex items-center justify-center bounce-in"
                style={{
                  background: target?.color ?? "#191a1b",
                  boxShadow: "rgba(76,48,90,0.18) 0px 11px 37px -10px",
                }}
              >
                <span
                  className="text-2xl font-semibold"
                  style={{ color: "#d4ff4c", fontFamily: "var(--font-sans)" }}
                >
                  {target ? getInitials(target.name) : "?"}
                </span>
              </div>
            </div>

            <DialogTitle
              className="font-light mb-1 tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.25rem",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#191a1b",
              }}
            >
              {target?.name ?? "…"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm font-light mb-1 text-[#5e5a5a]">
            The bottle chose you.
          </p>
          {spinner && (
            <p className="text-sm font-light mb-7 text-[#beb9b3]">
              Spun by {spinner.name}
            </p>
          )}

          <Button
            id="result-close-btn"
            onClick={onClose}
            className="w-full font-medium rounded-lg transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "#191a1b",
              color: "#d4ff4c",
              border: "none",
              padding: "12px 24px",
              fontSize: "15px",
              boxShadow: "rgba(0,0,0,0.05) 0px 1px 2px 0px",
            }}
          >
            <RotateCcw
              size={14}
              aria-hidden="true"
              className="mr-2 opacity-70"
            />
            Spin Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Main ───────── */
export default function SpinTheBottle() {
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Alice", ...PLAYER_PALETTE[0], spins: 0 },
    { id: "2", name: "Bob", ...PLAYER_PALETTE[1], spins: 0 },
    { id: "3", name: "Charlie", ...PLAYER_PALETTE[2], spins: 0 },
  ]);
  const [newName, setNewName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [bottleRot, setBottleRot] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [spinnerIdx, setSpinnerIdx] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Press Spin to begin");

  const inputId = useId();
  const spinnerRef = useRef<number>(0);
  const totalRot = useRef(0);
  const reducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  const pickTarget = useCallback((sIdx: number, count: number) => {
    const pool = Array.from({ length: count }, (_, i) => i).filter(
      (i) => i !== sIdx,
    );
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const addPlayer = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed || players.length >= MAX_PLAYERS) return;
    const palette = PLAYER_PALETTE[players.length % PLAYER_PALETTE.length];
    setPlayers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, ...palette, spins: 0 },
    ]);
    setNewName("");
  }, [newName, players.length]);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setSelectedIdx(null);
    setSpinnerIdx(null);
    setStatusMsg("Press Spin to begin");
  }, []);

  const spin = useCallback(() => {
    if (isSpinning || players.length < MIN_PLAYERS) return;

    setSelectedIdx(null);
    setShowResult(false);
    setShowConfetti(false);
    setStatusMsg("Spinning…");

    const sIdx = (spinnerRef.current + 1) % players.length;
    spinnerRef.current = sIdx;
    setSpinnerIdx(sIdx);

    const tIdx = pickTarget(sIdx, players.length);

    // Where the bottle cap currently rests (0–360°)
    const currentAngleMod = ((totalRot.current % 360) + 360) % 360;
    // Where player tIdx sits on the ring (player 0 = 0° = 12-o'clock = cap-up)
    const targetAngle = (tIdx / players.length) * 360;
    // How many degrees to rotate FROM the current rest position to reach target
    // Use `|| 360` so we still spin a full turn when already aimed at target
    const deltaToTarget =
      (((targetAngle - currentAngleMod) % 360) + 360) % 360 || 360;
    const extraSpins = 4 + Math.floor(Math.random() * 4);
    const finalAngle = totalRot.current + extraSpins * 360 + deltaToTarget;
    const duration = reducedMotion.current ? 80 : 3200 + Math.random() * 1400;

    setIsSpinning(true);

    if (reducedMotion.current) {
      totalRot.current = finalAngle;
      setBottleRot(finalAngle);
      setIsSpinning(false);
      setSelectedIdx(tIdx);
      setPlayers((prev) =>
        prev.map((p, i) => (i === sIdx ? { ...p, spins: p.spins + 1 } : p)),
      );
      setStatusMsg(`${players[tIdx]?.name ?? "Someone"} was chosen!`);
      setShowResult(true);
      setShowConfetti(true);
      return;
    }

    const start = performance.now();
    const from = totalRot.current;
    const diff = finalAngle - from;

    const ease = (t: number) => 1 - Math.pow(1 - t, 4.5); // aggressive ease-out

    function frame(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setBottleRot(from + diff * ease(progress));

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        totalRot.current = finalAngle;
        setBottleRot(finalAngle);
        setIsSpinning(false);
        setSelectedIdx(tIdx);
        setPlayers((prev) =>
          prev.map((p, i) => (i === sIdx ? { ...p, spins: p.spins + 1 } : p)),
        );
        setStatusMsg(`${players[tIdx]?.name ?? "Someone"} was chosen!`);
        setTimeout(() => {
          setShowResult(true);
          setShowConfetti(true);
        }, 380);
      }
    }

    requestAnimationFrame(frame);
  }, [isSpinning, players, pickTarget]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") addPlayer();
    },
    [addPlayer],
  );

  useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 5500);
    return () => clearTimeout(t);
  }, [showConfetti]);

  const canSpin = players.length >= MIN_PLAYERS && !isSpinning;

  return (
    <main
      id="main-content"
      className="min-h-dvh flex flex-col"
      style={{ background: "#fdf1ef" }}
    >
      {/* Skip link */}
      <a
        href="#spin-btn"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#191a1b] focus:text-[#d4ff4c] focus:font-medium"
      >
        Skip to spin button
      </a>

      {/* Decorative peach → blossom hero gradient strip */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom in oklab, #fdf1ef 0%, rgba(245,221,238,0.4) 60%, transparent 100%)",
        }}
      />

      {/* Very subtle aurora wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(233deg, rgba(50,197,255,0.04), rgba(182,32,224,0.04) 51%, rgba(247,181,0,0.04))",
        }}
      />

      {/* ─── Header ─── */}
      <header className="relative z-10 text-center pt-10 pb-5 px-4">
        {/* Eyebrow */}
        <p
          className="text-xs font-medium tracking-[0.12em] uppercase mb-3"
          style={{ color: "#beb9b3" }}
        >
          Party Game
        </p>

        <h1
          className="font-light tracking-tight mb-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.4rem, 7vw, 4.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#191a1b",
          }}
        >
          Spin the{" "}
          <em
            className="not-italic"
            style={{
              fontStyle: "italic",
              color: "#4c305a",
            }}
          >
            Bottle
          </em>
        </h1>

        <p className="text-sm font-light text-[#5e5a5a] max-w-xs mx-auto leading-relaxed">
          Add your players, give the bottle a spin, and let fate decide.
        </p>
      </header>

      {/* ─── Main layout ─── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-5 px-4 pb-10 max-w-5xl mx-auto w-full">
        {/* ═══ Left sidebar: Player management ═══ */}
        <aside
          className="lg:w-64 xl:w-72 flex flex-col gap-3"
          aria-label="Player management"
        >
          {/* Add player */}
          <section
            className="rounded-xl p-4 bg-white border"
            style={{
              borderColor: "#cbd5e0",
              boxShadow: "rgba(0,0,0,0.05) 0px 1px 2px 0px",
            }}
            aria-label="Add a player"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} aria-hidden="true" className="text-[#beb9b3]" />
              <h2 className="text-xs font-medium uppercase tracking-widest text-[#beb9b3]">
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
                  placeholder="Add a name…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={20}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={players.length >= MAX_PLAYERS}
                  className="rounded-lg text-sm font-light h-9 border-[#cbd5e0] bg-white text-[#191a1b] placeholder:text-[#beb9b3] focus-visible:ring-[#cbc2ea]"
                />
              </div>
              <Button
                type="button"
                id="add-player-btn"
                onClick={addPlayer}
                disabled={!newName.trim() || players.length >= MAX_PLAYERS}
                aria-label="Add player"
                className="rounded-lg h-9 px-3 transition-all duration-150 hover:opacity-85 active:scale-95"
                style={{
                  background: "#191a1b",
                  color: "#d4ff4c",
                  border: "none",
                  boxShadow: "rgba(0,0,0,0.05) 0px 1px 2px",
                }}
              >
                <Plus size={16} aria-hidden="true" />
              </Button>
            </div>

            {players.length < MIN_PLAYERS && (
              <p
                className="text-xs mt-2 font-light text-[#beb9b3]"
                role="status"
                aria-live="polite"
              >
                Need {MIN_PLAYERS - players.length} more player
                {MIN_PLAYERS - players.length !== 1 ? "s" : ""} to play.
              </p>
            )}
          </section>

          {/* Player list */}
          <section
            className="rounded-xl p-3 bg-white border flex-1"
            style={{
              borderColor: "#cbd5e0",
              boxShadow: "rgba(0,0,0,0.05) 0px 1px 2px 0px",
            }}
            aria-label="Player list"
          >
            <div role="list" className="flex flex-col gap-1.5">
              {players.length === 0 ? (
                <p className="text-sm font-light text-center py-5 text-[#beb9b3]">
                  No players yet.
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

          {/* Spin stats */}
          {players.some((p) => p.spins > 0) && (
            <section
              className="rounded-xl p-3 bg-white border"
              style={{
                borderColor: "#cbd5e0",
                boxShadow: "rgba(0,0,0,0.05) 0px 1px 2px 0px",
              }}
              aria-label="Spin statistics"
            >
              <h3 className="text-xs font-medium uppercase tracking-widest text-[#beb9b3] mb-2">
                Stats
              </h3>
              <div className="flex flex-col gap-1">
                {[...players]
                  .sort((a, b) => b.spins - a.spins)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2 rounded-full"
                          style={{ background: p.color }}
                          aria-hidden="true"
                        />
                        <span className="font-light text-[#5e5a5a]">
                          {p.name}
                        </span>
                      </div>
                      <span className="font-mono text-[#beb9b3]">
                        {p.spins}
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </aside>

        {/* ═══ Right: Game board ═══ */}
        <section
          className="flex-1 flex flex-col items-center justify-center gap-6"
          aria-label="Game board"
        >
          {/* Board card */}
          <div
            className="relative w-full rounded-2xl bg-white border flex flex-col items-center justify-center"
            style={{
              borderColor: "#cbd5e0",
              boxShadow:
                "rgba(94,90,90,0.1) 0px 0px 0px 1px, rgba(0,0,0,0.07) 0px 16px 40px -8px",
              minHeight: "400px",
              overflow: "hidden",
            }}
          >
            {/* Warm shell inner glow */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(253,241,239,0.7) 0%, transparent 65%)",
              }}
            />

            {/* Decorative dashed ring */}
            <div
              aria-hidden="true"
              className="absolute rounded-full border border-dashed"
              style={{
                inset: "32px",
                borderColor: "#cbd5e0",
                opacity: 0.5,
              }}
            />
            {/* Inner ring */}
            <div
              aria-hidden="true"
              className="absolute rounded-full border"
              style={{
                inset: "64px",
                borderColor: "#f5ddee",
                opacity: 0.7,
              }}
            />

            {/* Player ring */}
            <div className="absolute inset-0" aria-hidden="true">
              <div className="relative w-full h-full">
                <PlayerRing
                  players={players}
                  selectedIdx={selectedIdx}
                  spinnerIdx={
                    spinnerIdx !== null && isSpinning ? spinnerIdx : null
                  }
                  radius={37}
                />
              </div>
            </div>

            {/* Bottle */}
            <div
              className="relative z-10 bottle-float"
              style={{ width: "min(140px, 30vw)", height: "min(260px, 52vw)" }}
            >
              <BottleSVG rotation={bottleRot} isSpinning={isSpinning} />
            </div>

            {/* Status */}
            <div
              role="status"
              aria-live="polite"
              className="absolute bottom-4 left-0 right-0 text-center text-xs font-light text-[#beb9b3]"
            >
              {statusMsg}
            </div>
          </div>

          {/* ─── Spin button ─── */}
          <button
            type="button"
            id="spin-btn"
            onClick={spin}
            disabled={!canSpin}
            aria-label={isSpinning ? "Spinning…" : "Spin the bottle"}
            aria-busy={isSpinning}
            className={[
              "flex items-center gap-2.5 px-10 py-4 rounded-lg text-base font-medium tracking-wide",
              "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#cbc2ea]",
              canSpin
                ? "hover:opacity-90 active:scale-[0.97] cursor-pointer"
                : "opacity-35 cursor-not-allowed",
            ].join(" ")}
            style={{
              background: canSpin ? "#191a1b" : "#4e5154",
              color: canSpin ? "#d4ff4c" : "#beb9b3",
              border: "none",
              boxShadow: canSpin
                ? "rgba(0,0,0,0.1) 0px 2px 8px -2px, rgba(76,48,90,0.15) 0px 8px 24px -6px"
                : "none",
            }}
          >
            <Sparkles size={16} aria-hidden="true" className="opacity-80" />
            {isSpinning ? "Spinning…" : "Spin"}
            <Sparkles size={16} aria-hidden="true" className="opacity-80" />
          </button>

          {/* Ghost secondary label */}
          {canSpin && (
            <p className="text-xs font-light text-[#beb9b3] -mt-3 fade-in-up">
              {players.length} players ·{" "}
              {players.filter((p) => p.spins > 0).length > 0
                ? `${players.reduce((a, p) => a + p.spins, 0)} total spins`
                : "First spin!"}
            </p>
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
          setStatusMsg("Press Spin to begin");
        }}
      />
    </main>
  );
}
