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
} from "lucide-react";
import {
  getGames,
  addBulkGameEntries,
  Game,
  GameEntry,
} from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";
import GameCard from "@/components/GameCard";
import GameTypeSelector from "@/components/GameTypeSelector";
import BottomNav from "@/components/BottomNav";
const getTodayDateTime = (time: string): Date => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);

  return date;
};

const canPlayGame = (game: Game, playType: "open" | "close") => {
  const now = new Date();
  const openDate = getTodayDateTime(game.openTime);
  const closeDate = getTodayDateTime(game.closeTime);

  if (playType === "open") {
    return now < openDate; // ✅ play anytime before openTime
  }

  if (playType === "close") {
    return now < closeDate; // ✅ play anytime before closeTime
  }

  return false;
};
const Dashboard = () => {
  const { user, loading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedGame, setSelectedGame] = useState<{
    game: Game;
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

  const loadGames = useCallback(async () => {
    try {
      setGamesLoading(true);
      const allGames = await getGames();
      setGames(allGames || []);
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
      title: "Bets Placed",
      description: `${entries.length} entr${
        entries.length > 1 ? "ies" : "y"
      } submitted successfully. Total ₹${total} deducted.`,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {showShareOptions && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowShareOptions(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl p-6 z-50 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono font-bold">Share App</h3>
              <button type="button" onClick={() => setShowShareOptions(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      "Check out Matka King! " + window.location.origin
                    )}`,
                    "_blank"
                  );
                  setShowShareOptions(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent/10 rounded-lg transition-colors"
              >
                <span className="text-green-500 text-xl">📱</span>
                <span className="text-sm font-mono">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent/10 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <span className="text-primary text-xl">🔗</span>
                )}
                <span className="text-sm font-mono">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-card z-50 transform transition-transform duration-300 ease-in-out ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-foreground/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-mono font-bold">Menu</span>
            </div>
            <button type="button" onClick={() => setShowMobileMenu(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-foreground/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-mono font-semibold">{user.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">
                {user.mobileNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="p-2">
          <button
            type="button"
            onClick={() => {
              navigate("/dashboard");
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 text-primary" />
            <span className="text-sm font-mono">Home</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowProfile((prev) => !prev);
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <User className="w-5 h-5 text-primary" />
            <span className="text-sm font-mono">Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate("/wallet");
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-sm font-mono">Balance</span>
            <span className="ml-auto text-sm font-mono font-bold text-primary">
              ₹{user.balance}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigate("/history");
              setShowMobileMenu(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <History className="w-5 h-5 text-primary" />
            <span className="text-sm font-mono">History</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <Share2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-mono">Share</span>
          </button>

          <div className="border-t border-foreground/10 my-2" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-mono">Logout</span>
          </button>
        </div>
      </div>

      <div className="surface-card border-t-0 border-x-0 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-primary" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 border-2 border-primary/30 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-mono font-bold text-foreground">
                  Matka King
                </h1>
                <p className="text-[10px] text-muted-foreground">{timeStr}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/wallet")}
            className="flex items-center gap-2 surface-raised px-3 py-2 hover:border-primary/30 transition-colors"
          >
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono font-semibold text-foreground">
              ₹{user.balance}
            </span>
          </button>
        </div>
      </div>

      {showProfile && (
        <div className="px-4 mb-4">
          <div className="p-4 surface-card border-2 border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold text-primary">
                Profile Details
              </h3>
              <button type="button" onClick={() => setShowProfile(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-accent/10 rounded">
                <User className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-[8px] font-mono text-muted-foreground">
                    Name
                  </p>
                  <p className="text-sm font-mono font-semibold">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-accent/10 rounded">
                <Phone className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-[8px] font-mono text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-sm font-mono font-semibold">
                    {user.mobileNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-mono text-muted-foreground">
          Available Games
        </span>
        <button
          type="button"
          onClick={loadGames}
          disabled={gamesLoading}
          className="flex items-center gap-1 text-xs font-mono text-primary disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${gamesLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="px-4 space-y-3">
        {gamesLoading ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-20">
            Loading games...
          </p>
        ) : games.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-20">
            No games available
          </p>
        ) : (
          games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlayOpen={(g) => setSelectedGame({ game: g, playType: "open" })}
              onPlayClose={(g) =>
                setSelectedGame({ game: g, playType: "close" })
              }
            />
          ))
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