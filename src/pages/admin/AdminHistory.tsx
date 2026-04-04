import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, TrendingUp, DollarSign, Users, Calendar, Clock, Award, BarChart3, PieChart, Download, Eye, ChevronRight, RefreshCw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  getAllGameEntries,
  getAllTransactions,
  GameEntry,
  Transaction,
} from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";

const AdminHistory = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"entries" | "transactions">("entries");
  const [selectedDateRange, setSelectedDateRange] = useState<"all" | "today" | "week" | "month">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Track if initial data has been loaded
  const initialLoadRef = useRef(false);
  const isFetchingRef = useRef(false);

  // =========================
  // FETCH DATA - Single API Call
  // =========================
  const fetchData = useCallback(async (showRefreshToast = false) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }
    
    // Skip if already loaded and not a manual refresh
    if (initialLoadRef.current && !showRefreshToast) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      
      if (!showRefreshToast) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const [entriesData, transactionsData] = await Promise.all([
        getAllGameEntries(),
        getAllTransactions(),
      ]);

      setEntries(
        entriesData.sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        )
      );

      setTransactions(
        transactionsData.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
      );
      
      initialLoadRef.current = true;
      
      if (showRefreshToast) {
        toast({
          title: "Refreshed",
          description: `Loaded ${entriesData.length} entries and ${transactionsData.length} transactions`,
        });
      }
    } catch (err) {
      console.error("Error loading history:", err);
      toast({
        title: "Error",
        description: "Failed to load history data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [toast]);

  // Load data only once on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchData(true);
  };

  // =========================
  // FILTERS
  // =========================
  const filterByDate = (date: Date | string | undefined) => {
    if (!date) return false;
    const itemDate = new Date(date);
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    switch (selectedDateRange) {
      case "today":
        return itemDate.toDateString() === today.toDateString();
      case "week":
        return itemDate >= weekAgo;
      case "month":
        return itemDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredEntries = entries.filter((e) => {
    const text =
      (e.playerName || "") +
      (e.gameName || "") +
      (e.gameType || "");

    const matchesSearch = text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = filterByDate(e.createdAt);
    return matchesSearch && matchesDate;
  });

  const filteredTransactions = transactions.filter((t) => {
    const text =
      (t.user?.name || "") +
      (t.type || "");

    const matchesSearch = text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = filterByDate(t.createdAt);
    return matchesSearch && matchesDate;
  });

  // =========================
  // GROUP BY USER
  // =========================
  const grouped: Record<string, GameEntry[]> = {};

  filteredEntries.forEach((e) => {
    const userName = e.user?.name || "Unknown";
    if (!grouped[userName]) grouped[userName] = [];
    grouped[userName].push(e);
  });

  // =========================
  // STATISTICS
  // =========================
  const stats = {
    totalEntries: filteredEntries.length,
    totalAmount: filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
    totalWins: filteredEntries.filter(e => e.result === "won").length,
    totalLosses: filteredEntries.filter(e => e.result === "lose").length,
    totalWinAmount: filteredEntries.filter(e => e.result === "won").reduce((sum, e) => sum + (e.winAmount || 0), 0),
    uniquePlayers: new Set(filteredEntries.map(e => e.user?.name)).size,
    avgBet: filteredEntries.length > 0 ? filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0) / filteredEntries.length : 0,
  };

  const transactionStats = {
    totalDeposits: filteredTransactions.filter(t => t.type === "deposit").reduce((sum, t) => sum + t.amount, 0),
    totalWithdrawals: filteredTransactions.filter(t => t.type === "withdraw").reduce((sum, t) => sum + t.amount, 0),
    totalWins: filteredTransactions.filter(t => t.type === "win").reduce((sum, t) => sum + t.amount, 0),
    totalBets: filteredTransactions.filter(t => t.type === "bet").reduce((sum, t) => sum + t.amount, 0),
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 font-mono text-sm text-gray-500">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards for Game History */}
      {activeTab === "entries" && filteredEntries.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono opacity-80">Total Bets</p>
                <p className="text-2xl font-mono font-black mt-1">{stats.totalEntries}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono opacity-80">Total Amount</p>
                <p className="text-2xl font-mono font-black mt-1">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono opacity-80">Win Rate</p>
                <p className="text-2xl font-mono font-black mt-1">
                  {stats.totalEntries > 0 ? Math.round((stats.totalWins / stats.totalEntries) * 100) : 0}%
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono opacity-80">Unique Players</p>
                <p className="text-2xl font-mono font-black mt-1">{stats.uniquePlayers}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards for Transactions */}
      {activeTab === "transactions" && filteredTransactions.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono opacity-80">Total Deposits</p>
                <p className="text-xl font-mono font-black mt-1">₹{transactionStats.totalDeposits.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono opacity-80">Total Withdrawals</p>
                <p className="text-xl font-mono font-black mt-1">₹{transactionStats.totalWithdrawals.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono opacity-80">Total Wins</p>
                <p className="text-xl font-mono font-black mt-1">₹{transactionStats.totalWins.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono opacity-80">Total Bets</p>
                <p className="text-xl font-mono font-black mt-1">₹{transactionStats.totalBets.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Buttons */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("entries")}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-mono font-bold transition-all duration-200 ${
              activeTab === "entries"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🎮 Game History
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-mono font-bold transition-all duration-200 ${
              activeTab === "transactions"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            💰 Transactions
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by player name, game, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 pl-12 pr-4 py-3.5 text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
              className="bg-gray-50 border-2 border-gray-200 px-5 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* GAME HISTORY */}
      {/* ========================= */}
      {activeTab === "entries" && (
        <>
          {filteredEntries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                <Eye className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-mono font-bold text-gray-700 mb-2">
                No history found
              </h3>
              <p className="text-sm font-mono text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "Game history will appear here"}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {Object.entries(grouped).map(([user, list]) => {
                const total = list.reduce((s, e) => s + e.amount, 0);
                const winAmount = list.filter(e => e.result === "won").reduce((s, e) => s + (e.winAmount || 0), 0);

                return (
                  <AccordionItem
                    key={user}
                    value={user}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200">
                      <div className="flex flex-wrap items-center justify-between w-full pr-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-gray-900 text-base">{user}</span>
                            <p className="text-[10px] font-mono text-gray-500 mt-0.5">{list.length} bets</p>
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-right">
                            <p className="text-[9px] font-mono text-gray-500">Total Amount</p>
                            <p className="text-sm font-mono font-bold text-blue-600">₹{total.toLocaleString()}</p>
                          </div>
                          {winAmount > 0 && (
                            <div className="text-right">
                              <p className="text-[9px] font-mono text-gray-500">Total Wins</p>
                              <p className="text-sm font-mono font-bold text-green-600">₹{winAmount.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5 pt-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b-2 border-gray-200 rounded-xl">
                            <tr>
                              <th className="text-xs font-mono font-bold text-gray-700 py-3 px-3">Player</th>
                              <th className="text-xs font-mono font-bold text-gray-700 py-3 px-3">Number</th>
                              <th className="text-xs font-mono font-bold text-gray-700 py-3 px-3">Game</th>
                              <th className="text-xs font-mono font-bold text-gray-700 py-3 px-3">Type</th>
                              <th className="text-xs font-mono font-bold text-gray-700 py-3 px-3">Amount</th>
                              <th className="text-xs font-mono font-bold text-gray-700 py-3 px-3">Result</th>
                              <th className="text-xs font-mono font-bold text-gray-700 py-3 px-3">Date</th>
                            </tr>
                          </thead>

                          <tbody>
                            {list.map((e, index) => (
                              <tr key={e.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/30 transition-colors`}>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                      <span className="text-[9px] font-mono font-bold text-gray-600">
                                        {e.playerName?.charAt(0) || "U"}
                                      </span>
                                    </div>
                                    <span className="text-xs font-mono font-semibold text-gray-900">{e.playerName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="inline-flex items-center justify-center w-12 h-8 bg-blue-100 rounded-lg text-sm font-mono font-bold text-blue-600">
                                    {e.number}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-xs font-mono text-gray-700">{e.gameName}</td>
                                <td className="py-3 px-3">
                                  <span className="text-[10px] font-mono font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">
                                    {e.gameType}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-xs font-mono font-bold text-gray-900">₹{e.amount}</td>
                                <td className="py-3 px-3">
                                  {e.result ? (
                                    e.result === "won" ? (
                                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                                        +₹{e.winAmount}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                                        LOST
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <span className="text-[10px] font-mono text-gray-500">
                                      {formatDate(e.createdAt || "")}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </>
      )}

      {/* ========================= */}
      {/* TRANSACTIONS */}
      {/* ========================= */}
      {activeTab === "transactions" && (
        <>
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
                <DollarSign className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-mono font-bold text-gray-700 mb-2">
                No transactions found
              </h3>
              <p className="text-sm font-mono text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "Transaction history will appear here"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-xs font-mono font-bold text-gray-700 py-4 px-4">User</th>
                      <th className="text-xs font-mono font-bold text-gray-700 py-4 px-4">Type</th>
                      <th className="text-xs font-mono font-bold text-gray-700 py-4 px-4">Amount</th>
                      <th className="text-xs font-mono font-bold text-gray-700 py-4 px-4">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map((t, index) => (
                      <tr
                        key={t.id}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/30 transition-all duration-200`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-mono font-bold text-gray-600">
                                {t.user?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                            <span className="text-sm font-mono font-semibold text-gray-900">{t.user?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-full ${
                            t.type === "deposit" ? "bg-green-100 text-green-700" :
                            t.type === "win" ? "bg-yellow-100 text-yellow-700" :
                            t.type === "withdraw" ? "bg-red-100 text-red-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {t.type === "deposit" ? "📥 Deposit" :
                             t.type === "win" ? "🏆 Win" :
                             t.type === "withdraw" ? "📤 Withdraw" :
                             "🎲 Bet"}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-sm font-mono font-bold ${
                          t.type === "deposit" || t.type === "win"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          {t.type === "deposit" || t.type === "win" ? "+" : "-"}₹{Math.abs(t.amount).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-mono text-gray-500">
                              {formatDate(t.createdAt)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminHistory;