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
    totalLosses: filteredTransactions.filter(t => t.type === "loss").reduce((sum, t) => sum + t.amount, 0),
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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-3 font-mono text-xs text-gray-500">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards for Game History - Compact */}
      {activeTab === "entries" && filteredEntries.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">Total Bets</p>
                <p className="text-base font-mono font-black mt-0.5">{stats.totalEntries}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">Total Amount</p>
                <p className="text-base font-mono font-black mt-0.5">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          
          {/* <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">Win Amount</p>
                <p className="text-base font-mono font-black mt-0.5">₹{stats.totalWinAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
          </div> */}
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">Unique Players</p>
                <p className="text-base font-mono font-black mt-0.5">{stats.uniquePlayers}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards for Transactions - Compact with Win Amount First */}
      {activeTab === "transactions" && filteredTransactions.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">🏆 Total Wins</p>
                <p className="text-xs font-mono font-black mt-0.5">₹{transactionStats.totalWins.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">Deposits</p>
                <p className="text-xs font-mono font-black mt-0.5">₹{transactionStats.totalDeposits.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">Withdrawals</p>
                <p className="text-xs font-mono font-black mt-0.5">₹{transactionStats.totalWithdrawals.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">Bets</p>
                <p className="text-xs font-mono font-black mt-0.5">₹{transactionStats.totalBets.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-2 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] font-mono opacity-80">Losses</p>
                <p className="text-xs font-mono font-black mt-0.5">₹{transactionStats.totalLosses.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-1.5 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 rotate-180" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Buttons - Compact */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-1.5">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab("entries")}
            className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
              activeTab === "entries"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🎮 Game History
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 px-3 py-2 rounded-lg text-[11px] font-mono font-bold transition-all duration-200 ${
              activeTab === "transactions"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            💰 Transactions
          </button>
        </div>
      </div>

      {/* Search and Filter Bar - Compact */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-3">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 pl-9 pr-3 py-2 text-[11px] font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-lg transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 px-3 py-2 text-[11px] font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
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
      {/* GAME HISTORY - Compact */}
      {/* ========================= */}
      {activeTab === "entries" && (
        <>
          {filteredEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-mono font-bold text-gray-700 mb-1">
                No history found
              </h3>
              <p className="text-[10px] font-mono text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "Game history will appear here"}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(grouped).map(([user, list]) => {
                const total = list.reduce((s, e) => s + e.amount, 0);
                const winAmount = list.filter(e => e.result === "won").reduce((s, e) => s + (e.winAmount || 0), 0);

                return (
                  <AccordionItem
                    key={user}
                    value={user}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all"
                  >
                    <AccordionTrigger className="px-3 py-2 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all">
                      <div className="flex flex-wrap items-center justify-between w-full pr-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-gray-900 text-xs">{user}</span>
                            <p className="text-[8px] font-mono text-gray-500">{list.length} bets</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="text-right">
                            <p className="text-[7px] font-mono text-gray-500">Amount</p>
                            <p className="text-[10px] font-mono font-bold text-blue-600">₹{total.toLocaleString()}</p>
                          </div>
                          {winAmount > 0 && (
                            <div className="text-right">
                              <p className="text-[7px] font-mono text-gray-500">Wins</p>
                              <p className="text-[10px] font-mono font-bold text-green-600">₹{winAmount.toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-3 pb-3 pt-1">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-200 rounded-lg">
                            <tr>
                              <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Player</th>
                              <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Number</th>
                              <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Game</th>
                              <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Type</th>
                              <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Amount</th>
                              <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Date</th>
                            </tr>
                          </thead>

                          <tbody>
                            {list.map((e, index) => (
                              <tr key={e.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/30 transition-colors`}>
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                      <span className="text-[8px] font-mono font-bold text-gray-600">
                                        {e.playerName?.charAt(0) || "U"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono font-semibold text-gray-900">{e.playerName}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-2">
                                  <span className="inline-flex items-center justify-center w-9 h-6 bg-blue-100 rounded-md text-[10px] font-mono font-bold text-blue-600">
                                    {e.number}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-[9px] font-mono text-gray-700">{e.gameName}</td>
                                <td className="py-2 px-2">
                                  <span className="text-[8px] font-mono font-semibold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-md">
                                    {e.gameType}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-[9px] font-mono font-bold text-gray-900">₹{e.amount}</td>
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-0.5">
                                    <Calendar className="w-2.5 h-2.5 text-gray-400" />
                                    <span className="text-[8px] font-mono text-gray-500">
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
      {/* TRANSACTIONS - Compact */}
      {/* ========================= */}
      {activeTab === "transactions" && (
        <>
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3">
                <DollarSign className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-mono font-bold text-gray-700 mb-1">
                No transactions found
              </h3>
              <p className="text-[10px] font-mono text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "Transaction history will appear here"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">User</th>
                      <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Type</th>
                      <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Amount</th>
                      <th className="text-[9px] font-mono font-bold text-gray-700 py-2 px-2">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map((t, index) => (
                      <tr
                        key={t.id}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/30 transition-all`}
                      >
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-[9px] font-mono font-bold text-gray-600">
                                {t.user?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-gray-900">{t.user?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex items-center gap-0.5 text-[8px] font-mono font-bold px-2 py-1 rounded-full ${
                            t.type === "deposit" ? "bg-green-100 text-green-700" :
                            t.type === "win" ? "bg-yellow-100 text-yellow-700" :
                            t.type === "withdraw" ? "bg-red-100 text-red-700" :
                            t.type === "loss" ? "bg-pink-100 text-pink-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {t.type === "deposit" ? "📥 Deposit" :
                             t.type === "win" ? "🏆 Win" :
                             t.type === "withdraw" ? "📤 Withdraw" :
                             t.type === "loss" ? "💔 Loss" :
                             "🎲 Bet"}
                          </span>
                        </td>
                        <td className={`py-2 px-2 text-[10px] font-mono font-bold ${
                          t.type === "deposit" || t.type === "win"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          {t.type === "deposit" || t.type === "win" ? "+" : "-"}₹{Math.abs(t.amount).toLocaleString()}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-gray-400" />
                            <span className="text-[8px] font-mono text-gray-500">
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