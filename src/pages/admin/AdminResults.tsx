import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Search, Trophy, Calendar, TrendingUp, Award, Users, DollarSign, Clock, Filter, BarChart3, Star, Sparkles, RefreshCw } from "lucide-react";
import { getResults, getGames, GameResult, Game } from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";

const AdminResults = () => {
  const [results, setResults] = useState<GameResult[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Track if initial data has been loaded
  const initialLoadRef = useRef(false);
  const isFetchingRef = useRef(false);

  const loadData = useCallback(async (showRefreshToast = false) => {
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

      const [resultsData, gamesData] = await Promise.all([
        getResults(),
        getGames(),
      ]);

      const sortedResults = [...resultsData].sort(
        (a, b) =>
          new Date(b.declaredAt).getTime() -
          new Date(a.declaredAt).getTime()
      );

      setResults(sortedResults);
      setGames(gamesData);
      initialLoadRef.current = true;
      
      if (showRefreshToast) {
        toast({
          title: "Refreshed",
          description: `Loaded ${sortedResults.length} results`,
        });
      }
    } catch (error) {
      console.error("Failed to load results:", error);
      toast({
        title: "Error",
        description: "Failed to load results.",
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
    loadData();
  }, [loadData]);

  // Manual refresh handler
  const handleRefresh = () => {
    loadData(true);
  };

  // Define available time types (Open and Close)
  const timeTypes = useMemo(() => {
    const types = new Set(results.map(r => r.timeType).filter(Boolean));
    // Ensure we have both Open and Close if they exist in data
    return ["all", "OPEN", "CLOSE", ...Array.from(types).filter(t => t !== "OPEN" && t !== "CLOSE")];
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const gameName = result.gameName || "";
      const gameType = result.gameType || "";
      const timeType = result.timeType || "";

      const displayNumber = `${result.leftNumber || "-"} ${result.centerNumber || "-"} ${result.rightNumber || "-"}`;

      const matchesSearch =
        gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gameType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        displayNumber.includes(searchQuery);

      const resultGameId = result.game?.id?.toString();
      const matchesGame = selectedGame === "all" || resultGameId === selectedGame;
      
      // Updated type filter to handle both gameType and timeType
      let matchesType = selectedType === "all";
      if (!matchesType) {
        if (selectedType === "OPEN" || selectedType === "CLOSE") {
          // Filter by timeType for Open/Close
          matchesType = timeType?.toUpperCase() === selectedType;
        } else {
          // Filter by gameType for other types
          matchesType = result.gameType === selectedType;
        }
      }

      return matchesSearch && matchesGame && matchesType;
    });
  }, [results, searchQuery, selectedGame, selectedType]);

  const groupedByDate = useMemo(() => {
    return filteredResults.reduce((acc, result) => {
      const date = new Date(result.declaredAt).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(result);
      return acc;
    }, {} as Record<string, GameResult[]>);
  }, [filteredResults]);

  const stats = {
    totalResults: filteredResults.length,
    totalPayout: filteredResults.reduce((sum, r) => sum + (r.totalPayout || 0), 0),
    totalWinners: filteredResults.reduce((sum, r) => sum + (r.totalWinners || 0), 0),
    uniqueGames: new Set(filteredResults.map(r => r.gameName)).size,
    avgPayout: filteredResults.length > 0 ? filteredResults.reduce((sum, r) => sum + (r.totalPayout || 0), 0) / filteredResults.length : 0,
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
            <Trophy className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 font-mono text-sm text-gray-500">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Header Removed */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono opacity-80">Total Results</p>
              <p className="text-2xl font-mono font-black mt-1">{stats.totalResults}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono opacity-80">Total Payout</p>
              <p className="text-xl font-mono font-black mt-1">₹{stats.totalPayout.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono opacity-80">Total Winners</p>
              <p className="text-2xl font-mono font-black mt-1">{stats.totalWinners}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono opacity-80">Unique Games</p>
              <p className="text-2xl font-mono font-black mt-1">{stats.uniqueGames}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Star className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono opacity-80">Avg Payout</p>
              <p className="text-xl font-mono font-black mt-1">₹{Math.round(stats.avgPayout).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar with Refresh Button */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by game name, type, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 pl-12 pr-4 py-3.5 text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="bg-gray-50 border-2 border-gray-200 px-5 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200"
            >
              <option value="all">All Games</option>
              {games.map((game) => (
                <option key={game.id} value={game.id.toString()}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-50 border-2 border-gray-200 px-5 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200"
            >
              <option value="all">All Types</option>
              <option value="OPEN" className="text-green-600 font-bold">🔓 OPEN</option>
              <option value="CLOSE" className="text-red-600 font-bold">🔒 CLOSE</option>
              {timeTypes.filter(t => t !== "all" && t !== "OPEN" && t !== "CLOSE").map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button moved here */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm font-bold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Results Section */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
            <Trophy className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-mono font-bold text-gray-700 mb-2">
            No results found
          </h3>
          <p className="text-sm font-mono text-gray-500">
            {searchQuery ? "Try adjusting your search terms" : "Results will appear here once declared"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedByDate).map(([date, dateResults]) => (
            <div key={date} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Date Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-gray-500">DATE</p>
                      <p className="text-sm font-mono font-black text-gray-900">{formatDate(date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-gray-500">Results</p>
                      <p className="text-sm font-mono font-bold text-blue-600">{dateResults.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-gray-500">Total Payout</p>
                      <p className="text-sm font-mono font-bold text-green-600">
                        ₹{dateResults.reduce((sum, r) => sum + (r.totalPayout || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateResults.map((result) => (
                    <div
                      key={result.id}
                      className={`group bg-gradient-to-br from-gray-50 to-white rounded-xl border overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${
                        result.timeType?.toUpperCase() === "OPEN" 
                          ? "border-green-200 hover:border-green-400" 
                          : result.timeType?.toUpperCase() === "CLOSE"
                          ? "border-red-200 hover:border-red-400"
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      {/* Game Header */}
                      <div className={`px-4 py-3 border-b ${
                        result.timeType?.toUpperCase() === "OPEN" 
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100" 
                          : result.timeType?.toUpperCase() === "CLOSE"
                          ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
                          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                              {result.gameName}
                            </p>
                            <p className="text-xs font-mono font-bold text-gray-700 mt-0.5">
                              {result.gameType}
                            </p>
                          </div>
                          <div className={`p-1.5 rounded-lg ${
                            result.timeType?.toUpperCase() === "OPEN" 
                              ? "bg-green-100" 
                              : result.timeType?.toUpperCase() === "CLOSE"
                              ? "bg-red-100"
                              : "bg-blue-100"
                          }`}>
                            {result.timeType?.toUpperCase() === "OPEN" ? (
                              <span className="text-[8px] font-mono font-bold text-green-600">OPEN</span>
                            ) : result.timeType?.toUpperCase() === "CLOSE" ? (
                              <span className="text-[8px] font-mono font-bold text-red-600">CLOSE</span>
                            ) : (
                              <Sparkles className="w-3 h-3 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Winning Number */}
                      <div className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-sm">
                          <span className="text-2xl font-mono font-bold text-gray-800">
                            {result.leftNumber || "-"}
                          </span>
                          <span className="text-3xl font-mono font-black text-blue-600">
                            {result.centerNumber || "-"}
                          </span>
                          <span className="text-2xl font-mono font-bold text-gray-800">
                            {result.rightNumber || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="px-4 pb-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-xl p-2 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <p className="text-[8px] font-mono text-gray-500">TIME</p>
                            </div>
                            <p className="text-[10px] font-mono font-bold text-gray-700">
                              {new Date(result.declaredAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Award className="w-3 h-3 text-gray-500" />
                              <p className="text-[8px] font-mono text-gray-500">TYPE</p>
                            </div>
                            <p className={`text-[9px] font-mono font-bold uppercase ${
                              result.timeType?.toUpperCase() === "OPEN" 
                                ? "text-green-600" 
                                : result.timeType?.toUpperCase() === "CLOSE"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}>
                              {result.timeType || "RESULT"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-[8px] font-mono text-gray-500">WINNERS</p>
                            <p className="text-sm font-mono font-bold text-gray-900">
                              {result.totalWinners || 0}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-mono text-gray-500">PAYOUT</p>
                            <p className="text-sm font-mono font-bold text-green-600">
                              ₹{result.totalPayout?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Hover Effect Badge */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={`rounded-full p-1.5 shadow-lg ${
                          result.timeType?.toUpperCase() === "OPEN" 
                            ? "bg-green-500" 
                            : result.timeType?.toUpperCase() === "CLOSE"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}>
                          <Trophy className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminResults;