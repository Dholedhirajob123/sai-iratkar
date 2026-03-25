import { Game } from "@/lib/gameApi";
import { Play, Clock, XCircle } from "lucide-react";

type GameStatus = "open" | "timeout";

const getTodayDateTime = (time: string): Date => {
  const now = new Date();
  const parts = time.split(":").map(Number);

  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;

  const date = new Date(now);
  date.setHours(hours, minutes, seconds, 0);

  return date;
};

// ✅ SIMPLE & CORRECT LOGIC
const getGameStatus = (
  openTime: string,
  closeTime: string
): { openStatus: GameStatus; closeStatus: GameStatus } => {
  const now = new Date();

  const openDate = getTodayDateTime(openTime);
  const closeDate = getTodayDateTime(closeTime);

  return {
    openStatus: now < openDate ? "open" : "timeout",
    closeStatus: now < closeDate ? "open" : "timeout",
  };
};

const formatTime = (time: string) => {
  const parts = time.split(":").map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;

  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;

  return `${hour.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")} ${ampm}`;
};

const statusConfig = {
  open: {
    label: "Play",
    icon: Play,
    className: "text-success border-success/30 bg-success/10",
  },
  timeout: {
    label: "Closed",
    icon: Clock,
    className:
      "text-muted-foreground border-foreground/10 bg-accent opacity-50",
  },
};

interface GameCardProps {
  game: Game;
  onPlayOpen: (game: Game) => void;
  onPlayClose: (game: Game) => void;
}

const GameCard = ({ game, onPlayOpen, onPlayClose }: GameCardProps) => {
  const { openStatus, closeStatus } = getGameStatus(
    game.openTime,
    game.closeTime
  );

  const isActive = game.isActive === true || game.active === true;

  const renderClosedSection = () => (
    <div className="flex border-t-2 border-foreground/10">
      <div className="flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs font-semibold text-destructive bg-destructive/10 border-r-2 border-foreground/10">
        <XCircle className="w-3.5 h-3.5" />
        CLOSED
      </div>
      <div className="flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs font-semibold text-destructive bg-destructive/10">
        <XCircle className="w-3.5 h-3.5" />
        CLOSED
      </div>
    </div>
  );

  const renderPlayButton = (
    status: GameStatus,
    label: "Open" | "Close",
    onClick: () => void,
    withBorder = false
  ) => {
    const cfg = statusConfig[status];
    const Icon = cfg.icon;
    const disabled = status === "timeout";

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs font-semibold transition-opacity ${cfg.className} ${
          withBorder ? "border-r-2 border-foreground/10" : ""
        } ${disabled ? "cursor-not-allowed pointer-events-none" : "hover:opacity-80"}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {cfg.label} {label}
      </button>
    );
  };

  return (
    <div
      className={`surface-card p-0 overflow-hidden ${
        !isActive ? "opacity-60" : ""
      }`}
    >
      {/* HEADER */}
      <div className="bg-accent/50 border-b-2 border-foreground/10 px-4 py-3">
        <h3 className="text-center font-mono font-bold text-sm text-foreground tracking-widest">
          {game.name}
        </h3>
      </div>

      {/* NUMBERS */}
      <div className="flex items-center justify-center gap-4 py-5 px-4">
        <span className="text-2xl font-mono font-bold text-foreground">
          {game.leftNumber}
        </span>
        <span className="text-3xl font-mono font-bold text-primary">
          {game.centerNumber}
        </span>
        <span className="text-2xl font-mono font-bold text-foreground">
          {game.rightNumber}
        </span>
      </div>

      {/* TIMES */}
      <div className="flex border-t-2 border-foreground/10">
        <div className="flex-1 text-center py-3 border-r-2 border-foreground/10">
          <p className="text-[10px] font-mono text-muted-foreground">
            OPEN TIME
          </p>
          <p className="text-sm font-mono font-semibold">
            {formatTime(game.openTime)}
          </p>
        </div>
        <div className="flex-1 text-center py-3">
          <p className="text-[10px] font-mono text-muted-foreground">
            CLOSE TIME
          </p>
          <p className="text-sm font-mono font-semibold">
            {formatTime(game.closeTime)}
          </p>
        </div>
      </div>

      {/* BUTTONS */}
      {!isActive ? (
        renderClosedSection()
      ) : (
        <div className="flex border-t-2 border-foreground/10">
          {renderPlayButton(openStatus, "Open", () => onPlayOpen(game), true)}
          {renderPlayButton(closeStatus, "Close", () => onPlayClose(game))}
        </div>
      )}
    </div>
  );
};

export default GameCard;