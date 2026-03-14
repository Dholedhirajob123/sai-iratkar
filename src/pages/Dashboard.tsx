import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Wallet, RefreshCw } from "lucide-react";
import { getGames, addEntry, addTransaction, updateUserBalance, Game } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import GameCard from "@/components/GameCard";
import GameTypeSelector from "@/components/GameTypeSelector";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedGame, setSelectedGame] = useState<{ game: Game; playType: "open" | "close" } | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) { navigate("/login", { replace: true }); return; }
      if (user.role === "admin") { navigate("/admin", { replace: true }); return; }
    }
  }, [user, loading, navigate]);

  const loadGames = useCallback(() => {
    // Get all games but show both active and inactive
    // Inactive games will be shown as CLOSED by the GameCard component
    const allGames = getGames();
    setGames(allGames);
    setCurrentTime(new Date());
  }, []);

  useEffect(() => { loadGames(); refreshUser(); }, [loadGames, refreshUser]);
  useEffect(() => { const i = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(i); }, []);

  
const handleBetSubmit = (entries: { gameType: string; number: string; amount: number; playerName: string }[]) => {
  if (!user || !selectedGame) return;
  
  // Check if game is still active
  if (!selectedGame.game.isActive) {
    toast({ 
      title: "Game Closed", 
      description: "This game is currently inactive.", 
      variant: "destructive" 
    });
    setSelectedGame(null);
    loadGames();
    return;
  }
  
  const total = entries.reduce((s, e) => s + e.amount, 0);
  
  entries.forEach((e) => {
    // Add entry with playerName
    addEntry({ 
      userId: user.id, 
      gameId: selectedGame.game.id, 
      gameName: selectedGame.game.name, 
      gameType: e.gameType, 
      number: e.number, 
      amount: e.amount,
      playerName: e.playerName // Pass the player name from the entry
    });
    
    // Add transaction with player name in description
    addTransaction({ 
      userId: user.id, 
      type: "bet", 
      amount: -e.amount, 
      description: `${selectedGame.game.name} - ${e.gameType} #${e.number} for ${e.playerName}` 
    });
  });
  
  // Update user balance
  updateUserBalance(user.id, -total);
  refreshUser();
  setSelectedGame(null);
  
  toast({ 
    title: "Bets Placed", 
    description: `${entries.length} entries submitted for ${entries[0].playerName}. ₹${total} deducted.` 
  });
};

  if (loading || !user) return null;

  const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="surface-card border-t-0 border-x-0 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border-2 border-primary/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-mono font-bold text-foreground">Matka King</h1>
              <p className="text-xs text-muted-foreground">Hi, {user.name}</p>
            </div>
          </div>
          <button onClick={() => navigate("/wallet")} className="flex items-center gap-2 surface-raised px-3 py-2 hover:border-primary/30 transition-colors">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono font-semibold text-foreground">₹{user.balance}</span>
          </button>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-mono text-muted-foreground">{timeStr}</span>
        <button onClick={loadGames} className="flex items-center gap-1.5 text-xs font-mono text-primary hover:opacity-70 transition-opacity">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Games */}
      <div className="px-4 space-y-3">
        {games.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-20">No games available</p>
        ) : (
          games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlayOpen={(g) => setSelectedGame({ game: g, playType: "open" })}
              onPlayClose={(g) => setSelectedGame({ game: g, playType: "close" })}
            />
          ))
        )}
      </div>

      {selectedGame && (
        <GameTypeSelector
          game={selectedGame.game}
          playType={selectedGame.playType}
          onClose={() => setSelectedGame(null)}
          onSubmit={handleBetSubmit}
          userBalance={user.balance}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Dashboard;