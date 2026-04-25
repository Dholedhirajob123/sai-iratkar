import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Search, ChevronDown, ChevronUp, Trophy, Award, TrendingUp } from "lucide-react";
import { getEntriesByUserId, GameEntry } from "@/lib/gameApi";
import BottomNav from "@/components/BottomNav";

const BetHistory = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<GameEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showOnlyWins, setShowOnlyWins] = useState(false);

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

  const hasFetched = useRef(false);
  
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;

      try {
        setHistoryLoading(true);
        const data = await getEntriesByUserId(user.id);
        
        // Sort by date - newest first
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
        
        // Move win results to the top while maintaining date order within win/loss groups
        const winEntries = sorted.filter(e => e.result === "win");
        const otherEntries = sorted.filter(e => e.result !== "win");
        
        // Win entries come first, then others (both groups sorted by date)
        const reordered = [...winEntries, ...otherEntries];
        
        setEntries(reordered);
        setFilteredEntries(reordered);
      } catch (error) {
        console.error("Failed to load bet history:", error);
        setEntries([]);
        setFilteredEntries([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (!user || hasFetched.current) return;
    hasFetched.current = true;
    loadHistory();
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...entries];

    // Filter by win only if toggle is on
    if (showOnlyWins) {
      filtered = filtered.filter(e => e.result === "win");
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.playerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.gameName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.gameType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.playType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.number?.includes(searchQuery)
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredEntries(filtered);
  }, [entries, searchQuery, sortOrder, showOnlyWins]);

  const stats = {
    totalBets: entries.length,
    totalAmount: entries.reduce((sum, e) => sum + (e.amount || 0), 0),
    totalWins: entries.filter(e => e.result === "win").length,
    totalWinAmount: entries.filter(e => e.result === "win").reduce((sum, e) => sum + (e.winAmount || 0), 0),
    totalLosses: entries.filter(e => e.result === "lose").length,
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  if (loading || !user || historyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - Compact */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-white" />
            <h1 className="text-sm font-semibold text-white">Bet History</h1>
          </div>
          {/* <div className="bg-white/20 rounded-md px-2 py-0.5">
            <p className="text-[9px] text-white opacity-90">Win Rate</p>
            <p className="text-xs font-bold text-white">
              {stats.totalBets > 0 ? Math.round((stats.totalWins / stats.totalBets) * 100) : 0}%
            </p>
          </div> */}
        </div>
      </div>

  

      {/* Filter Toggle - Compact */}
      <div className="px-3 mt-2">
        <button
          onClick={() => setShowOnlyWins(!showOnlyWins)}
          className={`w-full py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 ${
            showOnlyWins
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
              : "bg-white border border-gray-200 text-gray-700 hover:border-yellow-400"
          }`}
        >
          {showOnlyWins ? "🏆 Showing Only Wins" : "👁️ Show All Bets"}
        </button>
      </div>

      {/* Search - Compact */}
      <div className="px-3 mt-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by player, game, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Sort - Compact */}
      <div className="px-3 mt-1.5 flex justify-end">
        <button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="flex items-center gap-0.5 text-[10px] text-gray-600 hover:text-gray-900"
        >
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          {sortOrder === "desc" ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronUp className="w-2.5 h-2.5" />}
        </button>
      </div>

      {/* History List - Compact */}
      <div className="px-3 mt-2 space-y-2 pb-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-10">
            <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 shadow-md">
              <Clock className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No bets found</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Place your first bet to see history</p>
          </div>
        ) : (
          filteredEntries.map((e, index) => {
            const isWin = e.result === "win";
            
            return (
              <div 
                key={e.id ?? index} 
                className={`bg-white rounded-lg border-2 p-3 shadow-sm transition-all duration-300 hover:shadow-md ${
                  isWin 
                    ? "border-green-200 hover:border-green-400" 
                    : e.result === "lose" 
                    ? "border-red-100 hover:border-red-200" 
                    : "border-yellow-100 hover:border-yellow-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Game Info - Compact */}
                    <div className="flex items-center flex-wrap gap-1.5 mb-2">
                      {isWin && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Trophy className="w-2 h-2" />
                          WINNER
                        </div>
                      )}
                      <span className="text-[10px] font-medium text-gray-400">#{index + 1}</span>
                      <span className="text-xs font-bold text-gray-900">{e.gameName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-600">
                        {e.gameType}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 rounded-full text-blue-600 font-semibold">
                        {e.playType}
                      </span>
                    </div>

                    {/* Number - Compact */}
                    <div className="mb-2">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-md ${
                        isWin 
                          ? "bg-gradient-to-r from-green-50 to-emerald-50" 
                          : "bg-gray-50"
                      }`}>
                        <span className={`text-lg font-black ${
                          isWin ? "text-green-600" : "text-blue-600"
                        }`}>{e.number}</span>
                      </div>
                    </div>

                    {/* Details - Compact */}
                    <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                      <div className="flex items-center gap-0.5">
                        <span>👤</span>
                        <span className="font-medium text-gray-700">{e.playerName}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span>💰</span>
                        <span className="font-medium text-gray-700">₹{e.amount}</span>
                      </div>
                      {isWin && (
                        <div className="flex items-center gap-0.5">
                          <span>🎉</span>
                          <span className="font-bold text-green-600">+₹{e.winAmount}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-0.5">
                        <span>📅</span>
                        <span className="font-medium text-gray-700">{formatDate(e.createdAt || "")}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span>⏰</span>
                        <span className="font-medium text-gray-700">
                          {new Date(e.createdAt || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Result Badge - Compact */}
                  <div className="ml-3">
                    {e.result === "win" && (
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-2 py-1 rounded-lg text-center shadow-md">
                        <p className="text-[8px] font-mono text-green-100">WIN</p>
                        <p className="text-[10px] font-black text-white">+₹{e.winAmount}</p>
                      </div>
                    )}
                    {e.result === "lose" && (
                      <div className="bg-gradient-to-br from-red-500 to-rose-600 px-2 py-1 rounded-lg text-center shadow-md">
                        <p className="text-[8px] font-mono text-red-100">LOSS</p>
                        <p className="text-[10px] font-black text-white">-₹{e.amount}</p>
                      </div>
                    )}
                    {(!e.result || e.result === "pending") && (
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 px-2 py-1 rounded-lg text-center shadow-md">
                        <p className="text-[8px] font-mono text-yellow-100">PENDING</p>
                        <p className="text-[10px] font-black text-white">₹{e.amount}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BetHistory;