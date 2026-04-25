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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-3 font-mono text-xs text-gray-500">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[7px] font-mono opacity-80">Results</p>
              <p className="text-base font-mono font-black mt-0.5">{stats.totalResults}</p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <BarChart3 className="w-3 h-3" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[7px] font-mono opacity-80">Payout</p>
              <p className="text-xs font-mono font-black mt-0.5">₹{stats.totalPayout.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <DollarSign className="w-3 h-3" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[7px] font-mono opacity-80">Winners</p>
              <p className="text-base font-mono font-black mt-0.5">{stats.totalWinners}</p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Users className="w-3 h-3" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-2 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[7px] font-mono opacity-80">Games</p>
              <p className="text-base font-mono font-black mt-0.5">{stats.uniqueGames}</p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Star className="w-3 h-3" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-2 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[7px] font-mono opacity-80">Avg Payout</p>
              <p className="text-xs font-mono font-black mt-0.5">₹{Math.round(stats.avgPayout).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
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
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="bg-gray-50 border border-gray-200 px-3 py-2 text-[11px] font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
            >
              <option value="all">All Games</option>
              {games.map((game) => (
                <option key={game.id} value={game.id.toString()}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-50 border border-gray-200 px-3 py-2 text-[11px] font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
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

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Results Section - Compact */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3">
            <Trophy className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-mono font-bold text-gray-700 mb-1">
            No results found
          </h3>
          <p className="text-[10px] font-mono text-gray-500">
            {searchQuery ? "Try adjusting your search terms" : "Results will appear here once declared"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedByDate).map(([date, dateResults]) => (
            <div key={date} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
              {/* Date Header - Compact */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-mono font-bold text-gray-700">{formatDate(date)}</span>
                    <span className="text-[8px] font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {dateResults.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] font-mono text-gray-500">
                    <span>₹{dateResults.reduce((s, r) => s + (r.totalPayout || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Results Grid - Compact */}
              <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {dateResults.map((result) => (
                    <div
                      key={result.id}
                      className={`group bg-gradient-to-br from-gray-50 to-white rounded-lg border overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                        result.timeType?.toUpperCase() === "OPEN" 
                          ? "border-green-200 hover:border-green-400" 
                          : result.timeType?.toUpperCase() === "CLOSE"
                          ? "border-red-200 hover:border-red-400"
                          : "border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      {/* Game Header - Compact */}
                      <div className={`px-2 py-1.5 border-b ${
                        result.timeType?.toUpperCase() === "OPEN" 
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100" 
                          : result.timeType?.toUpperCase() === "CLOSE"
                          ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
                          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[8px] font-mono font-bold text-blue-600 uppercase">
                              {result.gameName}
                            </p>
                            <p className="text-[9px] font-mono font-bold text-gray-700">
                              {result.gameType}
                            </p>
                          </div>
                          <div className={`p-1 rounded-md ${
                            result.timeType?.toUpperCase() === "OPEN" 
                              ? "bg-green-100" 
                              : result.timeType?.toUpperCase() === "CLOSE"
                              ? "bg-red-100"
                              : "bg-blue-100"
                          }`}>
                            {result.timeType?.toUpperCase() === "OPEN" ? (
                              <span className="text-[7px] font-mono font-bold text-green-600">OPEN</span>
                            ) : result.timeType?.toUpperCase() === "CLOSE" ? (
                              <span className="text-[7px] font-mono font-bold text-red-600">CLOSE</span>
                            ) : (
                              <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Winning Number - Compact */}
                      <div className="px-2 py-2 text-center">
                        <div className="inline-flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-sm">
                          <span className="text-base font-mono font-bold text-gray-800">
                            {result.leftNumber || "-"}
                          </span>
                          <span className="text-xl font-mono font-black text-blue-600">
                            {result.centerNumber || "-"}
                          </span>
                          <span className="text-base font-mono font-bold text-gray-800">
                            {result.rightNumber || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid - Compact */}
                      <div className="px-2 pb-2 space-y-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-gray-50 rounded-md p-1.5 text-center">
                            <div className="flex items-center justify-center gap-0.5 mb-0.5">
                              <Clock className="w-2 h-2 text-gray-500" />
                              <p className="text-[6px] font-mono text-gray-500">TIME</p>
                            </div>
                            <p className="text-[8px] font-mono font-bold text-gray-700">
                              {new Date(result.declaredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-md p-1.5 text-center">
                            <div className="flex items-center justify-center gap-0.5 mb-0.5">
                              <Award className="w-2 h-2 text-gray-500" />
                              <p className="text-[6px] font-mono text-gray-500">TYPE</p>
                            </div>
                            <p className={`text-[7px] font-mono font-bold uppercase ${
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

                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-[6px] font-mono text-gray-500">WINNERS</p>
                            <p className="text-[10px] font-mono font-bold text-gray-900">
                              {result.totalWinners || 0}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[6px] font-mono text-gray-500">PAYOUT</p>
                            <p className="text-[9px] font-mono font-bold text-green-600">
                              ₹{result.totalPayout?.toLocaleString() || 0}
                            </p>
                          </div>
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