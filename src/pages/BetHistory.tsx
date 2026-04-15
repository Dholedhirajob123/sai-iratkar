import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Search, ChevronDown, ChevronUp } from "lucide-react";
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
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
        setEntries(sorted);
        setFilteredEntries(sorted);
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

    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.playerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.gameName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.gameType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.playType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.number?.includes(searchQuery)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredEntries(filtered);
  }, [entries, searchQuery, sortOrder]);

  const stats = {
    totalBets: entries.length,
    totalAmount: entries.reduce((sum, e) => sum + (e.amount || 0), 0),
    totalWins: entries.filter(e => e.result === "win").length,
    totalWinAmount: entries.filter(e => e.result === "win").reduce((sum, e) => sum + (e.winAmount || 0), 0),
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
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
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">Bet History</h1>
        </div>
      </div>

     

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by player, game, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 pl-10 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="px-4 mt-3 flex justify-end">
        <button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
        >
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          {sortOrder === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {/* History List */}
      <div className="px-4 mt-3 space-y-3 pb-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No bets found</p>
          </div>
        ) : (
          filteredEntries.map((e, index) => (
            <div key={e.id ?? index} className="bg-white rounded-lg border p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Game Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-semibold text-gray-900">{e.gameName}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                      {e.gameType}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{e.playType}</span>
                  </div>

                  {/* Number */}
                  <div className="mb-2">
                    <span className="text-xl font-bold text-blue-600">{e.number}</span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>👤 {e.playerName}</span>
                    <span>💰 ₹{e.amount}</span>
                    <span>📅 {formatDate(e.createdAt || "")}</span>
                    <span>⏰ {new Date(e.createdAt || "").toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Result */}
                <div className="ml-4">
                  {e.result === "win" && (
                    <div className="bg-green-100 px-3 py-1 rounded text-center min-w-[70px]">
                      <p className="text-xs font-semibold text-green-700">+₹{e.winAmount}</p>
                    </div>
                  )}
                  {e.result === "lose" && (
                    <div className="bg-red-100 px-3 py-1 rounded text-center min-w-[70px]">
                      <p className="text-xs font-semibold text-red-700">Lost</p>
                    </div>
                  )}
                  {(!e.result || e.result === "pending") && (
                    <div className="bg-yellow-100 px-3 py-1 rounded text-center min-w-[70px]">
                      <p className="text-xs font-semibold text-yellow-700">Pending</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BetHistory;