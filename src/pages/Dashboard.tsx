import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star,
  Wallet,
  RefreshCw,
  User,
  Phone,
  Menu,
  X,
  Home,
  LogOut,
  History,
  Share2,
  Check,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Gamepad2,
  Zap,
  Bell,
  Settings,
  AlertCircle
} from "lucide-react";
import {
  getActiveGames,
  addBulkGameEntries,
  Game,
  GameEntry,
} from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";
import GameCard from "@/components/GameCard";
import GameTypeSelector from "@/components/GameTypeSelector";
import BottomNav from "@/components/BottomNav";

// Extended Game interface with color properties
interface ExtendedGame extends Game {
  leftNumberColor?: string;
  centerNumberColor?: string;
  rightNumberColor?: string;
  leftNumberBgColor?: string;
  centerNumberBgColor?: string;
  rightNumberBgColor?: string;
  openRate?: number;
  closeRate?: number;
}

const getTodayDateTime = (time: string): Date => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const canPlayGame = (game: ExtendedGame, playType: "open" | "close") => {
  const now = new Date();
  const openDate = getTodayDateTime(game.openTime);
  const closeDate = getTodayDateTime(game.closeTime);

  if (playType === "open") {
    return now < openDate;
  }
  if (playType === "close") {
    return now < closeDate;
  }
  return false;
};

const Dashboard = () => {
  const { user, loading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [games, setGames] = useState<ExtendedGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedGame, setSelectedGame] = useState<{
    game: ExtendedGame;
    playType: "open" | "close";
  } | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submittingBet, setSubmittingBet] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, loading, navigate]);

// In Dashboard.tsx, update the loadGames function to ensure colors are passed properly:

const loadGames = useCallback(async () => {
  try {
    setGamesLoading(true);
    const allGames = await getActiveGames();
    // Pass colors exactly as from admin - preserve all color properties
    const gamesWithColors = allGames.map(game => ({
      ...game,
      // Number colors
      leftNumberColor: (game as ExtendedGame).leftNumberColor || "#000000",
      centerNumberColor: (game as ExtendedGame).centerNumberColor || "#000000",
      rightNumberColor: (game as ExtendedGame).rightNumberColor || "#000000",
      // Background colors
      leftNumberBgColor: (game as ExtendedGame).leftNumberBgColor || "#f3f4f6",
      centerNumberBgColor: (game as ExtendedGame).centerNumberBgColor || "#fde68a",
      rightNumberBgColor: (game as ExtendedGame).rightNumberBgColor || "#f3f4f6",
      // Rates
      openRate: (game as ExtendedGame).openRate || 95,
      closeRate: (game as ExtendedGame).closeRate || 95,
    }));
    setGames(gamesWithColors || []);
    setCurrentTime(new Date());
  } catch (error) {
    console.error("Failed to load games:", error);
    toast({
      title: "Error",
      description: "Failed to load games.",
      variant: "destructive",
    });
  } finally {
    setGamesLoading(false);
  }
}, [toast]);

  useEffect(() => {
    if (user) {
      loadGames();
    }
  }, [user, loadGames]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleBetSubmit = async (
    entries: {
      gameType: string;
      number: string;
      amount: number;
      playerName: string;
    }[]
  ) => {
    if (!user || !selectedGame || submittingBet) return;

    const isGameActive =
      selectedGame.game.isActive === true || selectedGame.game.active === true;

    if (!isGameActive) {
      toast({
        title: "Game Closed",
        description: "This game is currently inactive.",
        variant: "destructive",
      });
      setSelectedGame(null);
      return;
    }

    const allowedToPlay = canPlayGame(
      selectedGame.game,
      selectedGame.playType
    );

    if (!allowedToPlay) {
      toast({
        title: "Time Out",
        description: `${selectedGame.playType.toUpperCase()} play is closed for this game.`,
        variant: "destructive",
      });
      setSelectedGame(null);
      return;
    }

    if (!entries || entries.length === 0) {
      toast({
        title: "Invalid Entry",
        description: "Please add at least one entry.",
        variant: "destructive",
      });
      return;
    }

    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

    if (total <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Bet amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (user.balance < total) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₹${total}, but your balance is ₹${user.balance}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingBet(true);

      const payload: GameEntry[] = entries.map((entry) => ({
        user: {
          id: user.id,
        },
        game: {
          id: selectedGame.game.id,
        },
        gameName: selectedGame.game.name,
        playType: selectedGame.playType,
        gameType: entry.gameType,
        number: entry.number,
        amount: entry.amount,
        playerName: entry.playerName,
        leftNumberFlag: false,
      }));

      await addBulkGameEntries(payload);
      await refreshUser();
      setSelectedGame(null);

      toast({
        title: "Success!",
        description: `${entries.length} entr${
          entries.length > 1 ? "ies" : "y"
        } submitted. Total ₹${total} deducted.`,
      });
    } catch (error: any) {
      console.error("Failed to submit bets:", error);
      toast({
        title: "Bet Failed",
        description:
          error?.message || "Unable to submit entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingBet(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleShare = () => {
    setShowShareOptions(true);
    setShowMobileMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: "Link Copied",
        description: "App link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-sm font-mono text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const activeGames = games.filter(g => g.isActive || g.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-20">
      {/* Share Options Modal */}
      {showShareOptions && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowShareOptions(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-mono font-bold text-gray-900">Share App</h3>
              <button 
                type="button" 
                onClick={() => setShowShareOptions(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  window.open( 
                    `https://wa.me/?text=${encodeURIComponent(
                      "Check out Si King! " + window.location.origin
                    )}`,
                    "_blank"
                  );
                  setShowShareOptions(false);
                }}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
              >
                <span className="text-2xl">📱</span>
                <span className="flex-1 text-sm font-mono font-semibold text-green-700">WhatsApp</span>
                <ChevronRight className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <span className="text-2xl">🔗</span>
                )}
                <span className="flex-1 text-sm font-mono font-semibold text-blue-700">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
                <ChevronRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="/icons/launchericon-192x192.png" 
                  alt="Si King Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-lg font-mono font-bold text-gray-900">Menu</span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowMobileMenu(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/icons/launchericon-192x192.png" 
                alt="Si King Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <p className="text-base font-mono font-bold text-gray-900">{user.name}</p>
              <p className="text-xs font-mono text-gray-500">{user.mobileNumber}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[9px] font-mono text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {[
            { icon: Home, label: "Home", path: "/dashboard", color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
            { icon: User, label: "Profile", action: () => setShowProfile(true), color: "purple", bg: "bg-purple-50", text: "text-purple-600" },
            { icon: Wallet, label: "Balance", path: "/wallet", color: "green", bg: "bg-green-50", text: "text-green-600", badge: `₹${user.balance}` },
            { icon: History, label: "History", path: "/history", color: "orange", bg: "bg-orange-50", text: "text-orange-600" },
            { icon: Share2, label: "Share", action: handleShare, color: "teal", bg: "bg-teal-50", text: "text-teal-600" },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (item.path) navigate(item.path);
                if (item.action) item.action();
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 mb-1 group"
            >
              <div className={`p-2 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-5 h-5 ${item.text}`} />
              </div>
              <span className="flex-1 text-sm font-mono font-semibold text-gray-700 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-sm font-mono font-bold text-blue-600">{item.badge}</span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}

          <div className="border-t border-gray-100 my-3" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all duration-200 group"
          >
            <div className="p-2 rounded-xl bg-red-50 group-hover:bg-red-100 transition-colors">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="flex-1 text-sm font-mono font-semibold text-red-600 text-left">Logout</span>
            <ChevronRight className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md opacity-50 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img 
                    src="/icons/launchericon-192x192.png" 
                    alt="Si King Logo" 
                    className="w-9 h-9 object-contain"
                  />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-mono font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Si King
                </h1>
                <p className="text-[10px] text-gray-500">{timeStr}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/wallet")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <Wallet className="w-4 h-4 text-white" />
            <span className="text-sm font-mono font-bold text-white">₹{user.balance}</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-white/80">Welcome back,</p>
            <h2 className="text-xl font-mono font-bold text-white">{user.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <Gamepad2 className="w-3 h-3 text-white" />
                <span className="text-[9px] font-mono text-white">{activeGames} Active Games</span>
              </div>
            </div>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-mono font-bold text-gray-900">Profile Details</h3>
              <button 
                type="button" 
                onClick={() => setShowProfile(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-mono text-gray-500">Full Name</p>
                  <p className="text-base font-mono font-bold text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-mono text-gray-500">Phone Number</p>
                  <p className="text-base font-mono font-bold text-gray-900">{user.mobileNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
               
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Games Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Gamepad2 className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-mono font-bold text-gray-700">
            Available Games
          </span>
        </div>
        <button
          type="button"
          onClick={loadGames}
          disabled={gamesLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-all hover:bg-blue-50 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${gamesLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Games List - Pass games with colors to GameCard */}
      <div className="px-4 space-y-4 pb-24">
        {gamesLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-sm font-mono text-gray-500">Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 overflow-hidden">
              <img 
                src="/icons/launchericon-192x192.png" 
                alt="Si King Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <p className="text-base font-mono font-semibold text-gray-600">No games available</p>
            <p className="text-xs font-mono text-gray-400 mt-1">Check back later for new games</p>
          </div>
        ) : (
          games.map((game) => {
            return (
              <GameCard
                key={game.id}
                game={game}
                onPlayOpen={(g) => setSelectedGame({ game: g, playType: "open" })}
                onPlayClose={(g) =>
                  setSelectedGame({ game: g, playType: "close" })
                }
              />
            );
          })
        )}
      </div>

      {selectedGame && (
        <GameTypeSelector
          game={selectedGame.game}
          playType={selectedGame.playType}
          onClose={() => !submittingBet && setSelectedGame(null)}
          onSubmit={handleBetSubmit}
          userBalance={user.balance}
          userId={user.id}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Dashboard;