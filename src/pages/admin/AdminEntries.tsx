import { useEffect, useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="font-mono text-sm text-muted-foreground">Loading entries...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by player name, game, type, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
          />
        </div>

        {gameTypes.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedGameType}
              onChange={(e) => setSelectedGameType(e.target.value)}
              className="bg-input border-2 border-foreground/10 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary/50"
            >
              {gameTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Game Types" : type}
                </option>
              ))}
            </select>
          </div>
        )}

        {filteredEntries.length > 0 && (
          <div className="flex justify-between items-center text-xs font-mono bg-accent/20 p-2">
            <span>
              Total Entries: <span className="font-bold">{filteredEntries.length}</span>
            </span>
            <span>
              Total Amount: <span className="font-bold text-primary">₹{totalAmount}</span>
            </span>
          </div>
        )}
      </div>

      {Object.keys(groupedByType).length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          {searchQuery ? "No entries match your search" : "No entries found"}
        </p>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {Object.entries(groupedByType).map(([type, items]) => {
            const typeTotal = items.reduce((sum, e) => sum + (e.amount || 0), 0);

            return (
              <AccordionItem
                key={type}
                value={type}
                className="surface-card border-2 border-foreground/10"
              >
                <AccordionTrigger className="px-4 py-3 font-mono text-sm hover:no-underline">
                  <div className="flex justify-between w-full pr-4">
                    <span className="font-semibold">{type}</span>
                    <div className="flex gap-4 text-xs">
                      <span className="text-muted-foreground">{items.length} entries</span>
                      <span className="text-primary font-bold">₹{typeTotal}</span>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  {getNumberGroups(items).map(([num, data]) => (
                    <div
                      key={num}
                      className="surface-raised p-3 mb-2 border border-foreground/5"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono font-bold text-primary text-lg">
                          {num}
                        </span>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {data.entries.length} bet{data.entries.length > 1 ? "s" : ""}
                          </p>
                          <p className="text-xs font-mono font-semibold">₹{data.total}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {data.entries.map((entry, index) => (
                          <span
                            key={entry.id ?? `${num}-${index}`}
                            className="text-[10px] font-mono bg-accent px-2 py-0.5 rounded border border-foreground/5"
                            title={`${entry.gameName || "Unknown Game"} - ${
                              entry.createdAt
                                ? new Date(entry.createdAt).toLocaleString()
                                : "No date"
                            }`}
                          >
                            {entry.playerName || "Unknown"}: ₹{entry.amount}
                          </span>
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