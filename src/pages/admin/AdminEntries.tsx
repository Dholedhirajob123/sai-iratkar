import { useState, useEffect, useMemo } from "react";
import { getEntries, GameEntry } from "@/lib/storage";
import { Search, Filter } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AdminEntries = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameType, setSelectedGameType] = useState<string>("all");

  useEffect(() => { 
    setEntries(getEntries()); 
  }, []);

  // Get unique game types for filter dropdown
  const gameTypes = useMemo(() => {
    const types = new Set(entries.map(e => e.gameType).filter(Boolean));
    return ["all", ...Array.from(types).sort()];
  }, [entries]);

  // Filter entries based on search and game type
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const playerName = entry.playerName || "";
      const gameName = entry.gameName || "";
      const gameType = entry.gameType || "";
      
      const matchesSearch = playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             gameType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedGameType === "all" || entry.gameType === selectedGameType;
      
      return matchesSearch && matchesType;
    });
  }, [entries, searchQuery, selectedGameType]);

  // Group by game type
  const groupedByType = useMemo(() => {
    const grouped: Record<string, GameEntry[]> = {};
    filteredEntries.forEach((e) => {
      const type = e.gameType || "Unknown";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(e);
    });
    return grouped;
  }, [filteredEntries]);

  // Group by number within each type
  const getNumberGroups = (items: GameEntry[]) => {
    const byNum: Record<string, { entries: GameEntry[]; total: number }> = {};
    items.forEach((e) => {
      const num = e.number || "N/A";
      if (!byNum[num]) byNum[num] = { entries: [], total: 0 };
      byNum[num].entries.push(e);
      byNum[num].total += e.amount;
    });
    return Object.entries(byNum).sort((a, b) => b[1].total - a[1].total);
  };

  // Calculate total amount for all filtered entries
  const totalAmount = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredEntries]);

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by player name, game, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Game Type Filter */}
        {gameTypes.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedGameType}
              onChange={(e) => setSelectedGameType(e.target.value)}
              className="bg-input border-2 border-foreground/10 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary/50"
            >
              {gameTypes.map(type => (
                <option key={type} value={type}>
                  {type === "all" ? "All Game Types" : type}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Summary Stats */}
        {filteredEntries.length > 0 && (
          <div className="flex justify-between items-center text-xs font-mono bg-accent/20 p-2">
            <span>Total Entries: <span className="font-bold">{filteredEntries.length}</span></span>
            <span>Total Amount: <span className="font-bold text-primary">₹{totalAmount}</span></span>
          </div>
        )}
      </div>
      
      {/* Entries Display */}
      {Object.keys(groupedByType).length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          {searchQuery ? "No entries match your search" : "No entries found"}
        </p>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {Object.entries(groupedByType).map(([type, items]) => {
            const typeTotal = items.reduce((sum, e) => sum + e.amount, 0);
            return (
              <AccordionItem key={type} value={type} className="surface-card border-2 border-foreground/10">
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
                    <div key={num} className="surface-raised p-3 mb-2 border border-foreground/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono font-bold text-primary text-lg">{num}</span>
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {data.entries.length} bet{data.entries.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs font-mono font-semibold">₹{data.total}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {data.entries.map((e) => (
                          <span 
                            key={e.id} 
                            className="text-[10px] font-mono bg-accent px-2 py-0.5 rounded border border-foreground/5"
                            title={`${e.gameName} - ${new Date(e.createdAt).toLocaleString()}`}
                          >
                            {e.playerName || "Unknown"}: ₹{e.amount}
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