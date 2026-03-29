import { useEffect, useMemo, useState } from "react";
import { Search, Filter, TrendingUp, Users, DollarSign, Calendar, Clock, Award } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getEntriesByGameId, getGames, Game, GameEntry } from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";

const AdminEntries = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameType, setSelectedGameType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);

      const gamesData = await getGames();
      setGames(gamesData);

      const allEntriesResponses = await Promise.all(
        gamesData.map((game) => getEntriesByGameId(game.id))
      );

      const allEntries = allEntriesResponses.flat();

      const normalizedEntries = allEntries.map((entry) => ({
        ...entry,
        gameName:
          entry.gameName ||
          gamesData.find((g) => g.id === entry.game?.id)?.name ||
          "Unknown Game",
      }));

      setEntries(normalizedEntries);
    } catch (error) {
      console.error("Failed to load entries:", error);
      toast({
        title: "Error",
        description: "Failed to load game entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const gameTypes = useMemo(() => {
    const types = new Set(entries.map((e) => e.gameType).filter(Boolean));
    return ["all", ...Array.from(types).sort()];
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

      return matchesSearch && matchesType;
    });
  }, [entries, searchQuery, selectedGameType]);

  const groupedByType = useMemo(() => {
    const grouped: Record<string, GameEntry[]> = {};
    filteredEntries.forEach((entry) => {
      const type = entry.gameType || "Unknown";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(entry);
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

          {gameTypes.length > 1 && (
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedGameType}
                onChange={(e) => setSelectedGameType(e.target.value)}
                className="bg-gray-50 border-2 border-gray-200 px-4 py-2 text-xs font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {gameTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Game Types" : type}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {Object.keys(groupedByType).length === 0 ? (
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
          {Object.entries(groupedByType).map(([type, items]) => {
            const typeTotal = items.reduce((sum, e) => sum + (e.amount || 0), 0);
            const uniqueNumbers = new Set(items.map(e => e.number)).size;

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
                        <span className="font-semibold text-gray-600">{items.length} entries</span>
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
                  {getNumberGroups(items).map(([num, data]) => (
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
                            className="group relative inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-help"
                            title={`${entry.gameName || "Unknown Game"} - ${
                              entry.createdAt
                                ? new Date(entry.createdAt).toLocaleString()
                                : "No date"
                            }`}
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="w-3 h-3 text-gray-600" />
                            </div>
                            <span className="text-xs font-mono font-bold text-gray-800">{entry.playerName || "Unknown"}</span>
                            <span className="text-xs font-mono font-bold text-blue-600">₹{entry.amount}</span>
                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Clock className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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