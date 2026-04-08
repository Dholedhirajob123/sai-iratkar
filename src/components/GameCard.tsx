import { Game } from "@/lib/gameApi";
import { Play, Clock, XCircle, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

type GameStatus = "open" | "timeout";

// Extended Game interface with color properties
interface ExtendedGame extends Game {
  leftNumberColor?: string;
  centerNumberColor?: string;
  rightNumberColor?: string;
  leftNumberBgColor?: string;
  centerNumberBgColor?: string;
  rightNumberBgColor?: string;
}

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

interface GameCardProps {
  game: ExtendedGame;
  onPlayOpen?: (game: ExtendedGame) => void;
  onPlayClose?: (game: ExtendedGame) => void;
}

const GameCard = ({ game, onPlayOpen, onPlayClose }: GameCardProps) => {
  const navigate = useNavigate();
  const { openStatus, closeStatus } = getGameStatus(game.openTime, game.closeTime);
  const isActive = game.isActive === true || game.active === true;

  // Get colors from game object with fallbacks
  const leftTextColor = game.leftNumberColor || "#000000";
  const leftBgColor = game.leftNumberBgColor || "#f3f4f6";
  const centerTextColor = game.centerNumberColor || "#000000";
  const centerBgColor = game.centerNumberBgColor || "#fde68a";
  const rightTextColor = game.rightNumberColor || "#000000";
  const rightBgColor = game.rightNumberBgColor || "#f3f4f6";

  const handlePlayOpen = () => {
    if (onPlayOpen) {
      onPlayOpen(game);
    } else {
      navigate(`/play/${game.id}?type=open`);
    }
  };

  const handlePlayClose = () => {
    if (onPlayClose) {
      onPlayClose(game);
    } else {
      navigate(`/play/${game.id}?type=close`);
    }
  };

  const renderClosedSection = () => (
    <div className="flex border-t-2 border-gray-200">
      <div className="flex-1 flex items-center justify-center gap-2 py-3.5 font-mono text-xs font-bold text-red-600 bg-gradient-to-r from-red-50 to-rose-50 border-r-2 border-gray-200">
        <XCircle className="w-4 h-4" />
        CLOSED
      </div>
      <div className="flex-1 flex items-center justify-center gap-2 py-3.5 font-mono text-xs font-bold text-red-600 bg-gradient-to-r from-red-50 to-rose-50">
        <XCircle className="w-4 h-4" />
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
    const isTimeout = status === "timeout";
    
    const buttonStyles = {
      open: {
        className: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md",
        icon: Play,
        text: `Play ${label}`,
      },
      timeout: {
        className: "bg-gradient-to-r from-red-500 to-rose-500 text-white cursor-not-allowed",
        icon: Clock,
        text: `Time Out`,
      }
    };

    const config = buttonStyles[status];
    const Icon = config.icon;

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isTimeout}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-mono text-xs font-bold transition-all duration-300 ${
          config.className
        } ${
          withBorder ? "border-r-2 border-gray-200" : ""
        } ${
          isTimeout 
            ? "cursor-not-allowed opacity-80" 
            : "hover:shadow-lg hover:scale-[1.02] active:scale-95"
        }`}
      >
        <Icon className="w-4 h-4" />
        {config.text}
      </button>
    );
  };

  return (
    <div
      className={`group bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-200 ${
        !isActive ? "opacity-60" : ""
      }`}
    >
      {/* HEADER with Game Badge */}
      <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 border-b border-black-200 px-5 py-4">
        <h3 className="text-center font-mono font-bold text-base text-white tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-2 rounded-xl shadow-md">
          {game.name}
        </h3>
      </div>

      {/* NUMBERS with Admin Custom Colors */}
      <div className="flex items-center justify-center gap-6 py-8 px-4 bg-white">
        <span
          className="text-3xl font-mono font-bold px-4 py-2 rounded-xl transition-all duration-200"
          style={{
            backgroundColor: leftBgColor,
            color: leftTextColor
          }}
        >
          {game.leftNumber}
        </span>
        <span
          className="text-4xl font-mono font-black px-4 py-2 rounded-xl transition-all duration-200"
          style={{
            backgroundColor: centerBgColor,
            color: centerTextColor
          }}
        >
          {game.centerNumber}
        </span>
        <span
          className="text-3xl font-mono font-bold px-4 py-2 rounded-xl transition-all duration-200"
          style={{
            backgroundColor: rightBgColor,
            color: rightTextColor
          }}
        >
          {game.rightNumber}
        </span>
      </div>

      {/* TIMES with Icons and Status */}
      <div className="flex border-t border-gray-200 bg-gray-50">
        <div className="flex-1 text-center py-4 border-r border-gray-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="w-3 h-3 text-orange-500" />
            <p className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider">
              OPEN TIME
            </p>
          </div>
          <p className="text-sm font-mono font-bold text-gray-800">
            {formatTime(game.openTime)}
          </p>
        </div>

        <div className="flex-1 text-center py-4">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-purple-500" />
            <p className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider">
              CLOSE TIME
            </p>
          </div>
          <p className="text-sm font-mono font-bold text-gray-800">
            {formatTime(game.closeTime)}
          </p>
        </div>
      </div>

      {/* BUTTONS */}
      {!isActive ? (
        renderClosedSection()
      ) : (
        <div className="flex border-t border-gray-200">
          {renderPlayButton(openStatus, "Open", handlePlayOpen, true)}
          {renderPlayButton(closeStatus, "Close", handlePlayClose)}
        </div>
      )}
    </div>
  );
};

export default GameCard;