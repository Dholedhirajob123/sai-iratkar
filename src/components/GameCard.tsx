import { Game } from "@/lib/gameApi";
import { Play, Clock, XCircle, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

type GameStatus = "open" | "timeout";

// Extended Game interface
interface ExtendedGame extends Game {
  leftNumberColor?: string;
  centerNumberColor?: string;
  rightNumberColor?: string;
  leftNumberBgColor?: string;
  centerNumberBgColor?: string;
  rightNumberBgColor?: string;
}

// Special double-digit numbers that should be shown in red
const SPECIAL_RED_NUMBERS = [
  "11", "22", "33", "44", "55", "66", "77", "88", "99", "00",
  "05","16","27","38","49","50","61","72","83","94"
];

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

  // ⏰ Night Block Range
  const nightClose = new Date();
  nightClose.setHours(0, 15, 0, 0); // 12:15 AM

  const morningOpen = new Date();
  morningOpen.setHours(9, 30, 0, 0); // 9:30 AM

  // 👉 If current time is between 12:15 AM → 9:30 AM
  if (now >= nightClose && now < morningOpen) {
    return {
      openStatus: "timeout",
      closeStatus: "timeout",
    };
  }

  // 👉 Normal logic after 9:30 AM
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

// Helper function to check if a number is a special red number
const isSpecialRedNumber = (number: string): boolean => {
  return SPECIAL_RED_NUMBERS.includes(number);
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

  // Check if center number is special (should be red)
  const isSpecial = isSpecialRedNumber(game.centerNumber);
  
  // For Left Number - Use admin color if available, otherwise default
  // If center is special, also make left number red
  let leftTextColor = game.leftNumberColor || "#000000";
  let leftBgColor = game.leftNumberBgColor || "#f3f4f6";
  
  // If center is special red number, override left number colors with red
  if (isSpecial) {
    leftTextColor = "#dc2626"; // Red text
    if (!game.leftNumberBgColor) {
      leftBgColor = "#fee2e2"; // Light red background
    }
  }
  
  // For Center Number - If special, override with red, otherwise use admin colors
  let centerTextColor = game.centerNumberColor || "#000000";
  let centerBgColor = game.centerNumberBgColor || "#f3f4f6";
  
  // If special red number, override with red colors
  if (isSpecial) {
    centerTextColor = "#dc2626"; // Red text
    if (!game.centerNumberBgColor) {
      centerBgColor = "#fee2e2"; // Light red background
    }
  }
  
  // For Right Number - Use admin color if available, otherwise default
  // If center is special, also make right number red
  let rightTextColor = game.rightNumberColor || "#000000";
  let rightBgColor = game.rightNumberBgColor || "#f3f4f6";
  
  // If center is special red number, override right number colors with red
  if (isSpecial) {
    rightTextColor = "#dc2626"; // Red text
    if (!game.rightNumberBgColor) {
      rightBgColor = "#fee2e2"; // Light red background
    }
  }

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
        className={`flex-1 flex items-center justify-center gap-2 py-2 font-mono text-xs font-bold transition-all duration-300 ${
          config.className
        } ${
          withBorder ? "border-r-2 border-gray-200" : ""
        } ${
          isTimeout 
            ? "cursor-not-allowed opacity-80" 
            : "hover:shadow-lg hover:scale-[1.02] active:scale-95"
        }`}
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
      {/* HEADER with Game Badge - Compact */}
      <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 border-b border-yellow-600 px-2 py-2">
  <h3 className="text-center font-mono font-bold text-xs text-white tracking-wider flex items-center justify-center gap-1">
    {game.name}
  </h3>
</div>

      {/* NUMBERS - Reduced padding and gap */}
      <div className="flex items-center justify-center gap-2 py-2 px-2 bg-white">
        {/* Left Number */}
        <span
          className="text-xl font-mono font-bold px-2 py-1 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: leftBgColor,
            color: leftTextColor,
            ...(isSpecial && !game.leftNumberBgColor && { boxShadow: '0 0 3px rgba(220,38,38,0.2)' })
          }}
        >
          {game.leftNumber}
        </span>
        
        {/* Center Number */}
        <span
          className="text-2xl font-mono font-black px-2 py-1 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: centerBgColor,
            color: centerTextColor,
            ...(isSpecial && !game.centerNumberBgColor && { boxShadow: '0 0 6px rgba(220,38,38,0.3)' })
          }}
        >
          {game.centerNumber}
        </span>
        
        {/* Right Number */}
        <span
          className="text-xl font-mono font-bold px-2 py-1 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: rightBgColor,
            color: rightTextColor,
            ...(isSpecial && !game.rightNumberBgColor && { boxShadow: '0 0 3px rgba(220,38,38,0.2)' })
          }}
        >
          {game.rightNumber}
        </span>
      </div>

      {/* TIMES with Icons and Status - Compact */}
      <div className="flex border-t border-gray-200 bg-gray-50">
  <div className="flex-1 text-center py-1 border-r border-gray-200">
    <div className="flex items-center justify-center gap-0.5 ">
      <TrendingUp className="w-2 h-2 text-orange-500" />
      <p className="text-[8px] font-mono font-bold text-black-500 uppercase tracking-wider">
        OPEN TIME
      </p>
    </div>
    <p className="text-[10px] font-mono font-bold text-gray-800">
      {formatTime(game.openTime)}
    </p>
  </div>

  <div className="flex-1 text-center py-1">
    <div className="flex items-center justify-center gap-0.5 ">
      <TrendingUp className="w-2 h-2 text-purple-500" />
      <p className="text-[8px] font-mono font-bold text-black-500 uppercase tracking-wider">
        CLOSE TIME
      </p>
    </div>
    <p className="text-[10px] font-mono font-bold text-gray-800">
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