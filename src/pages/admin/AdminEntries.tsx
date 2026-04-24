import { useEffect, useMemo, useState, useRef } from "react";
import { Search, Filter, TrendingUp, Users, DollarSign, Calendar, Clock, Award, Gamepad2, RefreshCw, Info, Unlock, Lock, ListChecks } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getEntriesByGameId, getGames, Game, GameEntry, getRecentEntriesByGameId } from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";

// SP (Single Pana) Numbers - Valid 3-digit numbers for Single Pana
const SP_NUMBERS = [
  "128", "129", "120", "130", "140", "123", "124", "125", "126", "127",
  "137", "138", "139", "149", "159", "150", "160", "134", "135", "136",
  "146", "147", "148", "158", "168", "169", "179", "170", "180", "145",
  "236", "156", "157", "167", "230", "178", "250", "189", "270", "190",
  "245", "237", "238", "239", "249", "240", "269", "260", "234", "280",
  "290", "146", "247", "248", "258", "259", "278", "279", "289", "235",
  "380", "345", "256", "257", "267", "268", "340", "350", "360", "370",
  "470", "390", "346", "347", "348", "349", "359", "369", "379", "389",
  "489", "480", "490", "356", "357", "358", "368", "378", "450", "460",
  "560", "570", "580", "590", "456", "367", "458", "459", "469", "479",
  "579", "589", "670", "680", "690", "457", "467", "468", "478", "569",
  "678", "679", "689", "789", "780", "790", "890", "567", "568", "578",
  "100", "200", "300", "400", "500", "600", "700", "800", "900", "550",
  "119", "110", "166", "112", "113", "114", "115", "116", "117", "118",
  "155", "228", "229", "220", "122", "277", "133", "224", "144", "226",
  "227", "255", "337", "266", "177", "330", "188", "233", "199", "244",
  "335", "336", "355", "338", "339", "448", "223", "288", "225", "299",
  "344", "499", "445", "446", "366", "466", "377", "440", "388", "334",
  "399", "660", "599", "455", "447", "556", "449", "477", "559", "488",
  "588", "688", "779", "699", "799", "880", "557", "558", "577", "668",
  "669", "778", "788", "770", "889", "899", "566", "990", "667", "677",
  "777", "444", "111", "888", "555", "222", "999", "666", "333", "000"
];

// DP (Double Pana) Numbers
const DP_NUMBERS = [
  "100", "200", "300", "400", "500", "600", "700", "800", "900", "550",
  "119", "110", "166", "112", "113", "114", "115", "116", "117", "118",
  "155", "228", "229", "220", "122", "277", "133", "224", "144", "226",
  "227", "255", "337", "266", "177", "330", "188", "233", "199", "244",
  "335", "336", "355", "338", "339", "448", "223", "288", "225", "299",
  "344", "499", "445", "446", "366", "466", "377", "440", "388", "334",
  "399", "660", "599", "455", "447", "556", "449", "477", "559", "488",
  "588", "688", "779", "699", "799", "880", "557", "558", "577", "668",
  "669", "778", "788", "770", "889", "899", "566", "990", "667", "677",
];

// TP (Triple Patti) Numbers
const TP_NUMBERS = ["777", "444", "111", "888", "555", "222", "999", "666", "333", "000"];

// Helper function to get display name for game type
const getGameTypeDisplayName = (gameType: string): string => {
  const typeMap: Record<string, string> = {
    "SINGLE": "SINGLE",
    "JODI": "JODI",
    "SINGLE PANA": "SINGLE PANA",
    "DOUBLE PANA": "DOUBLE PANA",
    "TRIPLE PATTI": "TRIPLE PATTI",
    "SP-DP-TP": "SP-DP-TP",
    "SP": "SINGLE PANA",
    "DP": "DOUBLE PANA",
    "TP": "TRIPLE PATTI"
  };
  return typeMap[gameType] || gameType;
};

// Helper function to format date as YYYY-MM-DD from ISO string
const getDateKey = (dateString?: string): string => {
  if (!dateString) return "Unknown Date";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Helper to get readable date label (Today, Yesterday, or full date)
const getDateLabel = (dateKey: string): string => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";
  return dateKey;
};

const AdminEntries = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameType, setSelectedGameType] = useState<string>("all");
  const [selectedGameName, setSelectedGameName] = useState<string>("all");
  const [selectedPlayType, setSelectedPlayType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNumberInfo, setShowNumberInfo] = useState(false);
  const { toast } = useToast();
  
  const dataLoadedRef = useRef(false);
  const initialLoadRef = useRef(false);

  const loadEntries = async (showRefreshToast = false) => {
    if (initialLoadRef.current && !showRefreshToast) {
      return;
    }
    
    try {
      if (!showRefreshToast) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const gamesData = await getGames();
      setGames(gamesData);

      const entriesPromises = gamesData.map((game) => getRecentEntriesByGameId(game.id));
      const entriesResponses = await Promise.all(entriesPromises);
      const allEntries = entriesResponses.flat();

      const normalizedEntries = allEntries.map((entry) => ({
        ...entry,
        gameName:
          entry.gameName ||
          gamesData.find((g) => g.id === entry.game?.id)?.name ||
          "Unknown Game",
      }));

      setEntries(normalizedEntries);
      initialLoadRef.current = true;
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

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadEntries();
  }, []);

  const handleRefresh = () => {
    if (!refreshing) {
      loadEntries(true);
    }
  };

  const gameTypes = useMemo(() => {
    const types = new Set(entries.map((e) => getGameTypeDisplayName(e.gameType || "")).filter(Boolean));
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
      const gameType = getGameTypeDisplayName(entry.gameType || "");
      const number = entry.number || "";
      const playType = entry.playType || "";

      const matchesSearch =
        playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gameType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedGameType === "all" || 
        getGameTypeDisplayName(entry.gameType || "") === selectedGameType;
      
      const matchesGameName =
        selectedGameName === "all" || entry.gameName === selectedGameName;

      const matchesPlayType = selectedPlayType === "all" || 
        playType.toLowerCase() === selectedPlayType.toLowerCase();

      return matchesSearch && matchesType && matchesGameName && matchesPlayType;
    });
  }, [entries, searchQuery, selectedGameType, selectedGameName, selectedPlayType]);

  // Group filtered entries by date (descending order: today first)
  const entriesByDate = useMemo(() => {
    const groups: Record<string, GameEntry[]> = {};
    filteredEntries.forEach(entry => {
      const dateKey = getDateKey(entry.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });
    // Sort date keys descending (latest first)
    const sortedKeys = Object.keys(groups).sort().reverse();
    const result: { dateKey: string; label: string; entries: GameEntry[] }[] = [];
    for (const key of sortedKeys) {
      result.push({
        dateKey: key,
        label: getDateLabel(key),
        entries: groups[key]
      });
    }
    return result;
  }, [filteredEntries]);

  // Separate entries by playType for a given list
  const getOpenEntries = (entriesList: GameEntry[]) => entriesList.filter(e => e.playType?.toLowerCase() === "open");
  const getCloseEntries = (entriesList: GameEntry[]) => entriesList.filter(e => e.playType?.toLowerCase() === "close");

  const groupByTypeAndGame = (entriesList: GameEntry[]) => {
    const grouped: Record<string, { gameName: string; entries: GameEntry[] }[]> = {};
    
    entriesList.forEach((entry) => {
      const type = getGameTypeDisplayName(entry.gameType || "Unknown");
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
  };

  const getNumberGroups = (items: GameEntry[]) => {
    const byNum: Record<string, { entries: GameEntry[]; totalAmount: number; totalEntries: number }> = {};

    items.forEach((entry) => {
      const num = entry.number || "N/A";
      if (!byNum[num]) {
        byNum[num] = { entries: [], totalAmount: 0, totalEntries: 0 };
      }
      byNum[num].entries.push(entry);
      byNum[num].totalAmount += entry.amount || 0;
      byNum[num].totalEntries += 1;
    });

    return Object.entries(byNum).sort((a, b) => b[1].totalAmount - a[1].totalAmount);
  };

  const totalAmount = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  }, [filteredEntries]);

  const totalEntries = useMemo(() => {
    return filteredEntries.length;
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
      {/* Info Button for Number Lists */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNumberInfo(!showNumberInfo)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
        >
          <Info className="w-3.5 h-3.5" />
          {showNumberInfo ? "Hide" : "Show"} Valid Numbers Info
        </button>
      </div>

      {/* Valid Numbers Info Panel */}
      {showNumberInfo && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-mono font-bold text-gray-900 mb-3">Valid Numbers Reference</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-blue-200 rounded-xl p-3 bg-blue-50/30">
              <h4 className="text-xs font-mono font-bold text-blue-700 mb-2">Single Pana Numbers</h4>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                {SP_NUMBERS.slice(0, 30).map(num => (
                  <span key={num} className="px-1.5 py-0.5 bg-white border border-blue-200 rounded text-[9px] font-mono text-blue-600">{num}</span>
                ))}
                <span className="px-1.5 py-0.5 text-[9px] font-mono text-gray-400">+{SP_NUMBERS.length - 30} more</span>
              </div>
              <p className="text-[8px] font-mono text-gray-500 mt-2">Total: {SP_NUMBERS.length} numbers</p>
            </div>

            <div className="border border-purple-200 rounded-xl p-3 bg-purple-50/30">
              <h4 className="text-xs font-mono font-bold text-purple-700 mb-2">Double Pana Numbers</h4>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                {DP_NUMBERS.slice(0, 30).map(num => (
                  <span key={num} className="px-1.5 py-0.5 bg-white border border-purple-200 rounded text-[9px] font-mono text-purple-600">{num}</span>
                ))}
                <span className="px-1.5 py-0.5 text-[9px] font-mono text-gray-400">+{DP_NUMBERS.length - 30} more</span>
              </div>
              <p className="text-[8px] font-mono text-gray-500 mt-2">Total: {DP_NUMBERS.length} numbers</p>
            </div>

            <div className="border border-red-200 rounded-xl p-3 bg-red-50/30">
              <h4 className="text-xs font-mono font-bold text-red-700 mb-2">Triple Patti Numbers</h4>
              <div className="flex flex-wrap gap-1">
                {TP_NUMBERS.map(num => (
                  <span key={num} className="px-2 py-0.5 bg-white border border-red-200 rounded text-[9px] font-mono text-red-600 font-bold">{num}</span>
                ))}
              </div>
              <p className="text-[8px] font-mono text-gray-500 mt-2">Total: {TP_NUMBERS.length} numbers</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {filteredEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">Total Entries</p>
                <p className="text-2xl font-mono font-bold text-gray-900 mt-1">{totalEntries}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <ListChecks className="w-5 h-5 text-blue-600" />
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

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> OPEN
                </p>
                <p className="text-2xl font-mono font-bold text-gray-900 mt-1">{getOpenEntries(filteredEntries).length}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Unlock className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-4 border border-rose-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3" /> CLOSE
                </p>
                <p className="text-2xl font-mono font-bold text-gray-900 mt-1">{getCloseEntries(filteredEntries).length}</p>
              </div>
              <div className="bg-rose-100 p-3 rounded-xl">
                <Lock className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="space-y-4">
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
                    <option key={name} value={name}>{name}</option>
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

            {/* OPEN/CLOSE Filter */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setSelectedPlayType("all")}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
                    selectedPlayType === "all"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <ListChecks className="w-3 h-3 inline mr-1" />
                  ALL
                </button>
                <button
                  onClick={() => setSelectedPlayType("open")}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
                    selectedPlayType === "open"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Unlock className="w-3 h-3 inline mr-1" />
                  OPEN
                </button>
                <button
                  onClick={() => setSelectedPlayType("close")}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-all ${
                    selectedPlayType === "close"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Lock className="w-3 h-3 inline mr-1" />
                  CLOSE
                </button>
              </div>
            </div>

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
          {(selectedGameName !== "all" || selectedGameType !== "all" || selectedPlayType !== "all") && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] font-mono text-gray-500">Active filters:</span>
              {selectedGameName !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-mono font-semibold">
                  Game: {selectedGameName}
                  <button onClick={() => setSelectedGameName("all")} className="hover:text-blue-900 ml-1">×</button>
                </span>
              )}
              {selectedGameType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-mono font-semibold">
                  Type: {selectedGameType}
                  <button onClick={() => setSelectedGameType("all")} className="hover:text-purple-900 ml-1">×</button>
                </span>
              )}
              {selectedPlayType !== "all" && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-semibold ${
                  selectedPlayType === "open" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-rose-100 text-rose-700"
                }`}>
                  {selectedPlayType === "open" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {selectedPlayType.toUpperCase()}
                  <button onClick={() => setSelectedPlayType("all")} className="hover:opacity-70 ml-1">×</button>
                </span>
              )}
              {(selectedGameName !== "all" || selectedGameType !== "all" || selectedPlayType !== "all") && (
                <button 
                  onClick={() => { 
                    setSelectedGameName("all"); 
                    setSelectedGameType("all");
                    setSelectedPlayType("all");
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

      {/* Results - Grouped by Date (Today first, then Yesterday, etc.) */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-mono font-semibold text-gray-500">
            {searchQuery ? "No entries match your search" : "No entries found"}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {entriesByDate.map(({ dateKey, label, entries: dateEntries }) => (
            <div key={dateKey} className="space-y-6">
              {/* Date Header */}
              <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-300">
                <div className="bg-gray-100 p-2 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-xl font-mono font-bold text-gray-800">{label}</h2>
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {dateEntries.length} entries
                </span>
              </div>

              {/* OPEN and CLOSE sections for this date */}
              {(selectedPlayType === "all" || selectedPlayType === "open") && getOpenEntries(dateEntries).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-200">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                      <Unlock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-emerald-700">OPEN Entries</h3>
                    <span className="text-xs font-mono bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                      {getOpenEntries(dateEntries).length} entries
                    </span>
                    <span className="text-xs font-mono text-gray-500 ml-auto">
                      Total: ₹{getOpenEntries(dateEntries).reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}
                    </span>
                  </div>

                  <Accordion type="multiple" className="space-y-4">
                    {Object.entries(groupByTypeAndGame(getOpenEntries(dateEntries))).map(([type, gameGroups]) => {
                      const typeTotalAmount = gameGroups.reduce(
                        (sum, group) => sum + group.entries.reduce((s, e) => s + (e.amount || 0), 0),
                        0
                      );
                      const typeTotalEntries = gameGroups.reduce((sum, group) => sum + group.entries.length, 0);
                      const uniqueNumbers = new Set(gameGroups.flatMap(g => g.entries.map(e => e.number))).size;

                      return (
                        <AccordionItem
                          key={type}
                          value={type}
                          className="bg-white border border-emerald-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                        >
                          <AccordionTrigger className="px-5 py-4 font-mono text-sm hover:no-underline hover:bg-gradient-to-r hover:from-emerald-50 hover:to-white transition-all duration-200">
                            <div className="flex justify-between w-full pr-4 items-center">
                              <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 p-2 rounded-xl">
                                  <Award className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="font-bold text-gray-900 text-base">{type}</span>
                              </div>
                              <div className="flex gap-6 text-xs">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-500" />
                                  <span className="font-semibold text-gray-600">{typeTotalEntries} entries</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-gray-500" />
                                  <span className="font-bold text-emerald-600">₹{typeTotalAmount.toLocaleString()}</span>
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
                              const gameTotalAmount = gameGroup.entries.reduce((sum, e) => sum + (e.amount || 0), 0);
                              const gameTotalEntries = gameGroup.entries.length;
                              
                              return (
                                <div key={gameGroup.gameName} className="mb-6 last:mb-0">
                                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-emerald-200">
                                    <Gamepad2 className="w-4 h-4 text-emerald-600" />
                                    <h4 className="font-mono font-bold text-base text-emerald-800">
                                      {gameGroup.gameName}
                                    </h4>
                                    <span className="text-xs font-mono text-gray-500 ml-auto">
                                      {gameTotalEntries} bets | ₹{gameTotalAmount.toLocaleString()}
                                    </span>
                                  </div>

                                  {getNumberGroups(gameGroup.entries).map(([num, data]) => (
                                    <div key={num} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-4 border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-emerald-200">
                                      <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                          <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center">
                                            <span className="font-mono font-black text-emerald-600 text-xl">{num}</span>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-mono text-gray-500">Total Bets</p>
                                            <p className="text-xs font-mono font-bold text-gray-900">{data.totalEntries} bets</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] font-mono text-gray-500">Total Amount</p>
                                          <p className="text-lg font-mono font-bold text-emerald-600">₹{data.totalAmount.toLocaleString()}</p>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                                        {data.entries.map((entry, index) => (
                                          <div key={entry.id ?? `${num}-${index}`} className="group relative inline-flex flex-col bg-white border border-gray-200 px-3 py-2 rounded-lg hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-help min-w-[160px]">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                  <Users className="w-3 h-3 text-gray-600" />
                                                </div>
                                                <span className="text-xs font-mono font-bold text-gray-800 truncate max-w-[100px]">
                                                  {entry.playerName || "Unknown"}
                                                </span>
                                              </div>
                                              <span className="text-xs font-mono font-bold text-emerald-600">₹{entry.amount}</span>
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
                </div>
              )}

              {(selectedPlayType === "all" || selectedPlayType === "close") && getCloseEntries(dateEntries).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-rose-200">
                    <div className="bg-rose-100 p-2 rounded-xl">
                      <Lock className="w-5 h-5 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-rose-700">CLOSE Entries</h3>
                    <span className="text-xs font-mono bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                      {getCloseEntries(dateEntries).length} entries
                    </span>
                    <span className="text-xs font-mono text-gray-500 ml-auto">
                      Total: ₹{getCloseEntries(dateEntries).reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()}
                    </span>
                  </div>

                  <Accordion type="multiple" className="space-y-4">
                    {Object.entries(groupByTypeAndGame(getCloseEntries(dateEntries))).map(([type, gameGroups]) => {
                      const typeTotalAmount = gameGroups.reduce(
                        (sum, group) => sum + group.entries.reduce((s, e) => s + (e.amount || 0), 0),
                        0
                      );
                      const typeTotalEntries = gameGroups.reduce((sum, group) => sum + group.entries.length, 0);
                      const uniqueNumbers = new Set(gameGroups.flatMap(g => g.entries.map(e => e.number))).size;

                      return (
                        <AccordionItem
                          key={type}
                          value={type}
                          className="bg-white border border-rose-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                        >
                          <AccordionTrigger className="px-5 py-4 font-mono text-sm hover:no-underline hover:bg-gradient-to-r hover:from-rose-50 hover:to-white transition-all duration-200">
                            <div className="flex justify-between w-full pr-4 items-center">
                              <div className="flex items-center gap-3">
                                <div className="bg-rose-100 p-2 rounded-xl">
                                  <Award className="w-4 h-4 text-rose-600" />
                                </div>
                                <span className="font-bold text-gray-900 text-base">{type}</span>
                              </div>
                              <div className="flex gap-6 text-xs">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-gray-500" />
                                  <span className="font-semibold text-gray-600">{typeTotalEntries} entries</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3 text-gray-500" />
                                  <span className="font-bold text-rose-600">₹{typeTotalAmount.toLocaleString()}</span>
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
                              const gameTotalAmount = gameGroup.entries.reduce((sum, e) => sum + (e.amount || 0), 0);
                              const gameTotalEntries = gameGroup.entries.length;
                              
                              return (
                                <div key={gameGroup.gameName} className="mb-6 last:mb-0">
                                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-rose-200">
                                    <Gamepad2 className="w-4 h-4 text-rose-600" />
                                    <h4 className="font-mono font-bold text-base text-rose-800">
                                      {gameGroup.gameName}
                                    </h4>
                                    <span className="text-xs font-mono text-gray-500 ml-auto">
                                      {gameTotalEntries} bets | ₹{gameTotalAmount.toLocaleString()}
                                    </span>
                                  </div>

                                  {getNumberGroups(gameGroup.entries).map(([num, data]) => (
                                    <div key={num} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-4 border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-rose-200">
                                      <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                          <div className="bg-rose-100 w-12 h-12 rounded-xl flex items-center justify-center">
                                            <span className="font-mono font-black text-rose-600 text-xl">{num}</span>
                                          </div>
                                          <div>
                                            <p className="text-[10px] font-mono text-gray-500">Total Bets</p>
                                            <p className="text-xs font-mono font-bold text-gray-900">{data.totalEntries} bets</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] font-mono text-gray-500">Total Amount</p>
                                          <p className="text-lg font-mono font-bold text-rose-600">₹{data.totalAmount.toLocaleString()}</p>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                                        {data.entries.map((entry, index) => (
                                          <div key={entry.id ?? `${num}-${index}`} className="group relative inline-flex flex-col bg-white border border-gray-200 px-3 py-2 rounded-lg hover:shadow-md hover:border-rose-300 transition-all duration-200 cursor-help min-w-[160px]">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                  <Users className="w-3 h-3 text-gray-600" />
                                                </div>
                                                <span className="text-xs font-mono font-bold text-gray-800 truncate max-w-[100px]">
                                                  {entry.playerName || "Unknown"}
                                                </span>
                                              </div>
                                              <span className="text-xs font-mono font-bold text-rose-600">₹{entry.amount}</span>
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEntries;