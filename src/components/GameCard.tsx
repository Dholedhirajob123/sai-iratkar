import { Game } from "@/lib/gameApi";
import { Zap, Play, Clock, XCircle } from "lucide-react";

type GameStatus = "ready" | "open" | "timeout";

const getTodayDateTime = (time: string): Date => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);

  return date;
};

const getGameStatus = (
  openTime: string,
  closeTime: string
): { openStatus: GameStatus; closeStatus: GameStatus } => {
  const now = new Date();

  const openDate = getTodayDateTime(openTime);
  const closeDate = getTodayDateTime(closeTime);
  const readyDate = new Date(openDate.getTime() - 15 * 60 * 1000);

  let openStatus: GameStatus = "timeout";
  let closeStatus: GameStatus = "timeout";

  if (now >= readyDate && now < openDate) {
    openStatus = "ready";
  } else if (now >= openDate && now < closeDate) {
    openStatus = "open";
  }

  if (now >= openDate && now < closeDate) {
    closeStatus = "open";
  }

  return { openStatus, closeStatus };
};

const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const statusConfig = {
  ready: {
    label: "Ready",
    icon: Zap,
    className: "text-success border-success/30 bg-success/10",
  },
  open: {
    label: "Open",
    icon: Play,
    className: "text-success border-success/30 bg-success/10",
  },
  timeout: {
    label: "Time Out",
    icon: Clock,
    className: "text-muted-foreground border-foreground/10 bg-accent opacity-50",
  },
};

interface GameCardProps {
  game: Game;
  onPlayOpen: (game: Game) => void;
  onPlayClose: (game: Game) => void;
}

const GameCard = ({ game, onPlayOpen, onPlayClose }: GameCardProps) => {
  const { openStatus, closeStatus } = getGameStatus(game.openTime, game.closeTime);
  const isActive = game.isActive;

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
        onClick={onClick}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs font-semibold transition-opacity ${cfg.className} ${
          withBorder ? "border-r-2 border-foreground/10" : ""
        } ${disabled ? "cursor-not-allowed" : "hover:opacity-80"}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {cfg.label} {label}
      </button>
    );
  };

  return (
    <div className={`surface-card p-0 overflow-hidden ${!isActive ? "opacity-60" : ""}`}>
      <div className="bg-accent/50 border-b-2 border-foreground/10 px-4 py-3">
        <h3 className="text-center font-mono font-bold text-sm text-foreground tracking-widest">
          {game.name}
        </h3>
      </div>

      <div className="flex items-center justify-center gap-4 py-5 px-4">
        <span className="text-2xl font-mono font-bold text-foreground">{game.leftNumber}</span>
        <span className="text-3xl font-mono font-bold text-primary">{game.centerNumber}</span>
        <span className="text-2xl font-mono font-bold text-foreground">{game.rightNumber}</span>
      </div>

      <div className="flex border-t-2 border-foreground/10">
        <div className="flex-1 text-center py-3 border-r-2 border-foreground/10">
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">OPEN TIME</p>
          <p className="text-sm font-mono font-semibold text-foreground">{formatTime(game.openTime)}</p>
        </div>
        <div className="flex-1 text-center py-3">
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">CLOSE TIME</p>
          <p className="text-sm font-mono font-semibold text-foreground">{formatTime(game.closeTime)}</p>
        </div>
      </div>

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