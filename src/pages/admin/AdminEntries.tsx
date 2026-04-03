import { useEffect, useMemo, useState, useRef } from "react";
import { Search, Filter, TrendingUp, Users, DollarSign, Calendar, Clock, Award, Gamepad2, RefreshCw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getEntriesByGameId, getGames, Game, GameEntry } from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";

const AdminEntries = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameType, setSelectedGameType] = useState<string>("all");
  const [selectedGameName, setSelectedGameName] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Track if data has been loaded
  const dataLoadedRef = useRef(false);

  const loadEntries = async (showRefreshToast = false) => {
    // Prevent multiple API calls
    if (dataLoadedRef.current && !showRefreshToast) {
      return;
    }
    
    try {
      if (!dataLoadedRef.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Fetch games and entries in parallel for better performance
      const [gamesData, allEntriesResponses] = await Promise.all([
        getGames(),
        Promise.all(
          (dataLoadedRef.current ? games : []).map((game) => getEntriesByGameId(game.id))
        )
      ]);

      // If first time loading games, fetch entries for all games
      let allEntries: GameEntry[] = [];
      if (!dataLoadedRef.current) {
        setGames(gamesData);
        const entriesPromises = gamesData.map((game) => getEntriesByGameId(game.id));
        const entriesResponses = await Promise.all(entriesPromises);
        allEntries = entriesResponses.flat();
      } else {
        allEntries = allEntriesResponses.flat();
      }

      const normalizedEntries = allEntries.map((entry) => ({
        ...entry,
        gameName:
          entry.gameName ||
          gamesData.find((g) => g.id === entry.game?.id)?.name ||
          "Unknown Game",
      }));

      setEntries(normalizedEntries);
      dataLoadedRef.current = true;

      if (showRefreshToast) {
        toast({
          title: "Refreshed",
          description: `Loaded ${normalizedEntries.length} entries`,
        });
      }
    } catch (error) {
      console.error("Failed to load entries:", error);
      toast({
        title: "Error",
        description: "Failed to load game entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data only once on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    loadEntries(true);
  };

  const gameTypes = useMemo(() => {
    const types = new Set(entries.map((e) => e.gameType).filter(Boolean));
    return ["all", ...Array.from(types).sort()];
  }, [entries]);

  const gameNames = useMemo(() => {
    const names = new Set(entries.map((e) => e.gameName).filter(Boolean));
    return ["all", ...Array.from(names).sort()];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const playerName = entry.playerName || "";
      const gameName = entry.gameName || "";
      const gameType = entry.gameType || "";
      const number = entry.number || "";

      const matchesSearch =
        playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gameType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedGameType === "all" || entry.gameType === selectedGameType;
      
      const matchesGameName =
        selectedGameName === "all" || entry.gameName === selectedGameName;

      return matchesSearch && matchesType && matchesGameName;
    });
  }, [entries, searchQuery, selectedGameType, selectedGameName]);

  // Group by Game Type AND Game Name
  const groupedByTypeAndGame = useMemo(() => {
    const grouped: Record<string, { gameName: string; entries: GameEntry[] }[]> = {};
    
    filteredEntries.forEach((entry) => {
      const type = entry.gameType || "Unknown";
      const gameName = entry.gameName || "Unknown Game";
      
      if (!grouped[type]) {
        grouped[type] = [];
      }
      
      const existingGameGroup = grouped[type].find(g => g.gameName === gameName);
      if (existingGameGroup) {
        existingGameGroup.entries.push(entry);
      } else {
        grouped[type].push({ gameName, entries: [entry] });
      }
    });
    
    return grouped;
  }, [filteredEntries]);

  const getNumberGroups = (items: GameEntry[]) => {
    const byNum: Record<string, { entries: GameEntry[]; total: number }> = {};

    items.forEach((entry) => {
      const num = entry.number || "N/A";
      if (!byNum[num]) {
        byNum[num] = { entries: [], total: 0 };
      }
      byNum[num].entries.push(entry);
      byNum[num].total += entry.amount || 0;
    });

    return Object.entries(byNum).sort((a, b) => b[1].total - a[1].total);
  };

  const totalAmount = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  }, [filteredEntries]);

  const totalPlayers = useMemo(() => {
    const uniquePlayers = new Set(filteredEntries.map(e => e.playerName));
    return uniquePlayers.size;
  }, [filteredEntries]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-mono text-sm font-semibold text-gray-600">Loading entries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {filteredEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">Total Entries</p>
                <p className="text-2xl font-mono font-bold text-gray-900 mt-1">{filteredEntries.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold text-green-600 uppercase tracking-wider">Total Amount</p>
                <p className="text-2xl font-mono font-bold text-gray-900 mt-1">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider">Unique Players</p>
                <p className="text-2xl font-mono font-bold text-gray-900 mt-1">{totalPlayers}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by player name, game, type, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 pl-11 pr-4 py-3 text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Game Name Filter */}
            {gameNames.length > 1 && (
              <div className="flex-1 flex items-center gap-3">
                <Gamepad2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <select
                  value={selectedGameName}
                  onChange={(e) => setSelectedGameName(e.target.value)}
                  className="flex-1 bg-gray-50 border-2 border-gray-200 px-4 py-2 text-xs font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="all">All Games</option>
                  {gameNames.filter(name => name !== "all").map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Game Type Filter */}
            {gameTypes.length > 1 && (
              <div className="flex-1 flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <select
                  value={selectedGameType}
                  onChange={(e) => setSelectedGameType(e.target.value)}
                  className="flex-1 bg-gray-50 border-2 border-gray-200 px-4 py-2 text-xs font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  {gameTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Game Types" : type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Active Filters Display */}
          {(selectedGameName !== "all" || selectedGameType !== "all") && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] font-mono text-gray-500">Active filters:</span>
              {selectedGameName !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-mono font-semibold">
                  Game: {selectedGameName}
                  <button
                    onClick={() => setSelectedGameName("all")}
                    className="hover:text-blue-900 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedGameType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-mono font-semibold">
                  Type: {selectedGameType}
                  <button
                    onClick={() => setSelectedGameType("all")}
                    className="hover:text-purple-900 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
              {(selectedGameName !== "all" || selectedGameType !== "all") && (
                <button
                  onClick={() => {
                    setSelectedGameName("all");
                    setSelectedGameType("all");
                  }}
                  className="text-[10px] font-mono text-red-500 hover:text-red-700"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results - Grouped by Game Type then Game Name */}
      {Object.keys(groupedByTypeAndGame).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-mono font-semibold text-gray-500">
            {searchQuery ? "No entries match your search" : "No entries found"}
          </p>
          <p className="text-[10px] font-mono text-gray-400 mt-1">
            {searchQuery ? "Try different keywords" : "Entries will appear here once placed"}
          </p>
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {Object.entries(groupedByTypeAndGame).map(([type, gameGroups]) => {
            const typeTotal = gameGroups.reduce(
              (sum, group) => sum + group.entries.reduce((s, e) => s + (e.amount || 0), 0),
              0
            );
            const totalEntries = gameGroups.reduce((sum, group) => sum + group.entries.length, 0);
            const uniqueNumbers = new Set(gameGroups.flatMap(g => g.entries.map(e => e.number))).size;

            return (
              <AccordionItem
                key={type}
                value={type}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="px-5 py-4 font-mono text-sm hover:no-underline hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200">
                  <div className="flex justify-between w-full pr-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <Award className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-bold text-gray-900 text-base">{type}</span>
                    </div>
                    <div className="flex gap-6 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="font-semibold text-gray-600">{totalEntries} entries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-gray-500" />
                        <span className="font-bold text-blue-600">₹{typeTotal.toLocaleString()}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-gray-500" />
                        <span className="font-semibold text-gray-600">{uniqueNumbers} numbers</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-5 pb-5 pt-2">
                  {gameGroups.map((gameGroup) => {
                    const gameTotal = gameGroup.entries.reduce((sum, e) => sum + (e.amount || 0), 0);
                    
                    return (
                      <div key={gameGroup.gameName} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-blue-200">
                          <Gamepad2 className="w-4 h-4 text-blue-600" />
                          <h4 className="font-mono font-bold text-base text-blue-800">
                            {gameGroup.gameName}
                          </h4>
                          <span className="text-xs font-mono text-gray-500 ml-auto">
                            {gameGroup.entries.length} bets | ₹{gameTotal.toLocaleString()}
                          </span>
                        </div>

                        {getNumberGroups(gameGroup.entries).map(([num, data]) => (
                          <div
                            key={num}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-4 border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-200"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                                  <span className="font-mono font-black text-blue-600 text-xl">{num}</span>
                                </div>
                                <div>
                                  <p className="text-[10px] font-mono text-gray-500">Total Bets</p>
                                  <p className="text-xs font-mono font-bold text-gray-900">{data.entries.length} bets</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-mono text-gray-500">Total Amount</p>
                                <p className="text-lg font-mono font-bold text-blue-600">₹{data.total.toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                              {data.entries.map((entry, index) => (
                                <div
                                  key={entry.id ?? `${num}-${index}`}
                                  className="group relative inline-flex flex-col bg-white border border-gray-200 px-3 py-2 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-help min-w-[160px]"
                                  title={`${entry.gameName} - ${
                                    entry.createdAt
                                      ? new Date(entry.createdAt).toLocaleString()
                                      : "No date"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Users className="w-3 h-3 text-gray-600" />
                                      </div>
                                      <span className="text-xs font-mono font-bold text-gray-800 truncate max-w-[100px]">
                                        {entry.playerName || "Unknown"}
                                      </span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-blue-600">₹{entry.amount}</span>
                                  </div>
                                  <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default AdminEntries;