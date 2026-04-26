import { Game } from "@/lib/gameApi";
import { Play, Clock, XCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

type GameStatus = "open" | "timeout";

interface ExtendedGame extends Game {
  leftNumberColor?: string;
  centerNumberColor?: string;
  rightNumberColor?: string;
  leftNumberBgColor?: string;
  centerNumberBgColor?: string;
  rightNumberBgColor?: string;
}

const SPECIAL_RED_NUMBERS = [
  "11", "22", "33", "44", "55", "66", "77", "88", "99", "00",
  "05","16","27","38","49","50","61","72","83","94"
];

// ---------- Helper: time string → minutes since midnight ----------
const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

// ---------- Get the open and close Date objects for the *current* session ----------
// Returns { openDate, closeDate } where:
//   - if now is inside an active session → that session's open/close
//   - if now is before the next open → next session's open/close
//   - if now is after the last session's close → next session's open/close (future)
const getCurrentSession = (openTime: string, closeTime: string, now: Date) => {
  const openMin = toMinutes(openTime);
  const closeMin = toMinutes(closeTime);
  const isOvernight = closeMin < openMin; // e.g. 23:30 → 00:30

  // Build a date for today at the open time
  const todayOpen = new Date(now);
  todayOpen.setHours(Math.floor(openMin / 60), openMin % 60, 0, 0);

  // Case 1: normal session (close same day)
  if (!isOvernight) {
    const todayClose = new Date(now);
    todayClose.setHours(Math.floor(closeMin / 60), closeMin % 60, 0, 0);
    return { openDate: todayOpen, closeDate: todayClose };
  }

  // Case 2: overnight session (close on the next day)
  // First, assume the session starts today at openTime and ends tomorrow at closeTime
  const tomorrowClose = new Date(now);
  tomorrowClose.setDate(tomorrowClose.getDate() + 1);
  tomorrowClose.setHours(Math.floor(closeMin / 60), closeMin % 60, 0, 0);

  // If we are before today's open → the relevant session is yesterday's open and today's close
  if (now < todayOpen) {
    const yesterdayOpen = new Date(now);
    yesterdayOpen.setDate(yesterdayOpen.getDate() - 1);
    yesterdayOpen.setHours(Math.floor(openMin / 60), openMin % 60, 0, 0);
    const todayClose = new Date(now);
    todayClose.setHours(Math.floor(closeMin / 60), closeMin % 60, 0, 0);
    return { openDate: yesterdayOpen, closeDate: todayClose };
  }

  // Otherwise we are inside or after today's session
  return { openDate: todayOpen, closeDate: tomorrowClose };
};

// ---------- Main status logic (with 9:30 AM gate and cross‑day handling) ----------
const getGameStatus = (
  openTime: string,
  closeTime: string
): { openStatus: GameStatus; closeStatus: GameStatus } => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const MORNING_START = 9 * 60 + 30; // 9:30 AM
  const MIDNIGHT = 0;

  // Night period (00:00 – 09:30)
  if (currentMinutes >= MIDNIGHT && currentMinutes < MORNING_START) {
    // Only night games (those that cross midnight or close before 9:30) are playable
    const closeMin = toMinutes(closeTime);
    const openMin = toMinutes(openTime);
    const isNightGame = closeMin < openMin || closeMin < MORNING_START;

    if (!isNightGame) {
      // Regular day games are completely closed during night
      return { openStatus: "timeout", closeStatus: "timeout" };
    }
    // Night game: use session logic to determine if it's still open/close
    const { openDate, closeDate } = getCurrentSession(openTime, closeTime, now);
    return {
      openStatus: now < openDate ? "open" : "timeout",
      closeStatus: now < closeDate ? "open" : "timeout",
    };
  }

  // Day period (9:30 AM – midnight): all games follow normal session rules
  const { openDate, closeDate } = getCurrentSession(openTime, closeTime, now);
  return {
    openStatus: now < openDate ? "open" : "timeout",
    closeStatus: now < closeDate ? "open" : "timeout",
  };
};

// ---------- Format time for display ----------
const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const hour = h || 0;
  const minute = m || 0;
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

const isSpecialRedNumber = (num: string) => SPECIAL_RED_NUMBERS.includes(num);

interface GameCardProps {
  game: ExtendedGame;
  onPlayOpen?: (game: ExtendedGame) => void;
  onPlayClose?: (game: ExtendedGame) => void;
}

const GameCard = ({ game, onPlayOpen, onPlayClose }: GameCardProps) => {
  const navigate = useNavigate();
  const { openStatus, closeStatus } = getGameStatus(game.openTime, game.closeTime);
  const isActive = game.isActive === true || game.active === true;
  const isSpecial = isSpecialRedNumber(game.centerNumber);

  // Color overrides for special red numbers
  let leftTextColor = game.leftNumberColor || "#000000";
  let leftBgColor = game.leftNumberBgColor || "#f3f4f6";
  let centerTextColor = game.centerNumberColor || "#000000";
  let centerBgColor = game.centerNumberBgColor || "#f3f4f6";
  let rightTextColor = game.rightNumberColor || "#000000";
  let rightBgColor = game.rightNumberBgColor || "#f3f4f6";

  if (isSpecial) {
    leftTextColor = "#dc2626";
    if (!game.leftNumberBgColor) leftBgColor = "#fee2e2";
    centerTextColor = "#dc2626";
    if (!game.centerNumberBgColor) centerBgColor = "#fee2e2";
    rightTextColor = "#dc2626";
    if (!game.rightNumberBgColor) rightBgColor = "#fee2e2";
  }

  const handlePlayOpen = () => {
    if (onPlayOpen) onPlayOpen(game);
    else navigate(`/play/${game.id}?type=open`);
  };

  const handlePlayClose = () => {
    if (onPlayClose) onPlayClose(game);
    else navigate(`/play/${game.id}?type=close`);
  };

  const renderClosedSection = () => (
    <div className="flex border-t-2 border-gray-200">
      <div className="flex-1 flex items-center justify-center gap-2 py-2.5 font-mono text-xs font-bold text-red-600 bg-gradient-to-r from-red-50 to-rose-50 border-r-2 border-gray-200">
        <XCircle className="w-3.5 h-3.5" />
        CLOSED
      </div>
      <div className="flex-1 flex items-center justify-center gap-2 py-2.5 font-mono text-xs font-bold text-red-600 bg-gradient-to-r from-red-50 to-rose-50">
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
    const isTimeout = status === "timeout";
    const config = isTimeout
      ? {
          className: "bg-gradient-to-r from-red-500 to-rose-500 text-white cursor-not-allowed",
          icon: Clock,
          text: "Time Out",
        }
      : {
          className: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md",
          icon: Play,
          text: `Play ${label}`,
        };
    const Icon = config.icon;

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isTimeout}
        className={`flex-1 flex items-center justify-center gap-2 py-2 font-mono text-xs font-bold transition-all duration-300 ${config.className} ${
          withBorder ? "border-r-2 border-gray-200" : ""
        } ${isTimeout ? "cursor-not-allowed opacity-80" : "hover:shadow-lg hover:scale-[1.02] active:scale-95"}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </button>
    );
  };

  return (
    <div
      className={`group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-200 ${
        !isActive ? "opacity-60" : ""
      }`}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 border-b border-yellow-600 px-2 py-2">
        <h3 className="text-center font-mono font-bold text-xs text-white tracking-wider flex items-center justify-center gap-1">
          {game.name}
        </h3>
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-center gap-2 py-2 px-2 bg-white">
        <span
          className="text-xl font-mono font-bold px-2 py-1 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: leftBgColor,
            color: leftTextColor,
            ...(isSpecial && !game.leftNumberBgColor && { boxShadow: "0 0 3px rgba(220,38,38,0.2)" }),
          }}
        >
          {game.leftNumber}
        </span>
        <span
          className="text-2xl font-mono font-black px-2 py-1 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: centerBgColor,
            color: centerTextColor,
            ...(isSpecial && !game.centerNumberBgColor && { boxShadow: "0 0 6px rgba(220,38,38,0.3)" }),
          }}
        >
          {game.centerNumber}
        </span>
        <span
          className="text-xl font-mono font-bold px-2 py-1 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: rightBgColor,
            color: rightTextColor,
            ...(isSpecial && !game.rightNumberBgColor && { boxShadow: "0 0 3px rgba(220,38,38,0.2)" }),
          }}
        >
          {game.rightNumber}
        </span>
      </div>

      {/* Times */}
      <div className="flex border-t border-gray-200 bg-gray-50">
        <div className="flex-1 text-center py-1 border-r border-gray-200">
          <div className="flex items-center justify-center gap-0.5">
            <TrendingUp className="w-2 h-2 text-orange-500" />
            <p className="text-[8px] font-mono font-bold text-black-500 uppercase tracking-wider">OPEN TIME</p>
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-800">{formatTime(game.openTime)}</p>
        </div>
        <div className="flex-1 text-center py-1">
          <div className="flex items-center justify-center gap-0.5">
            <TrendingUp className="w-2 h-2 text-purple-500" />
            <p className="text-[8px] font-mono font-bold text-black-500 uppercase tracking-wider">CLOSE TIME</p>
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-800">{formatTime(game.closeTime)}</p>
        </div>
      </div>

      {/* Buttons */}
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