import { useState, useEffect } from "react";
import { getEntries, getUsers, GameEntry, User } from "@/lib/storage";
import { Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AdminHistory = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setEntries(getEntries().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setUsers(getUsers());
  }, []);

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || "Unknown";

  const filteredEntries = entries.filter(entry => {
    const playerName = entry.playerName || "";
    const addedBy = getUserName(entry.userId) || "";
    const gameName = entry.gameName || "";
    const gameType = entry.gameType || "";
    
    const matchesSearch = playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           addedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
           gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           gameType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Group by Added By (User who placed the bet) instead of Player Name
  const groupedByAddedBy: Record<string, GameEntry[]> = {};
  filteredEntries.forEach(e => {
    const key = getUserName(e.userId); // Group by the user who added the bet
    if (!groupedByAddedBy[key]) groupedByAddedBy[key] = [];
    groupedByAddedBy[key].push(e);
  });

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono"
          />
        </div>
      </div>
      
      {filteredEntries.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No history found</p>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {Object.entries(groupedByAddedBy).map(([addedBy, userEntries]) => {
            const totalBet = userEntries.reduce((s, e) => s + e.amount, 0);
            const uniquePlayers = new Set(userEntries.map(e => e.playerName)).size;
            
            return (
              <AccordionItem key={addedBy} value={addedBy} className="surface-card">
                <AccordionTrigger className="px-4 py-3 font-mono text-sm">
                  <div className="flex justify-between w-full pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">Added By:</span>
                      <span>{addedBy}</span>
                      <span className="text-xs bg-accent px-2 py-0.5 rounded">
                        {uniquePlayers} player{uniquePlayers > 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-xs">{userEntries.length} bets · ₹{totalBet}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="text-[10px] py-2 px-2">Sr.No</th>
                        <th className="text-[10px] py-2 px-2">Player Name</th>
                        <th className="text-[10px] py-2 px-2">Number</th>
                        <th className="text-[10px] py-2 px-2">Game</th>
                        <th className="text-[10px] py-2 px-2">Type</th>
                        <th className="text-[10px] py-2 px-2">Amount</th>
                        <th className="text-[10px] py-2 px-2">Result</th>
                        <th className="text-[10px] py-2 px-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userEntries.map((e, index) => (
                        <tr key={e.id} className="border-b hover:bg-accent/5">
                          <td className="py-2 px-2 text-xs">{index + 1}</td>
                          <td className="py-2 px-2 text-xs text-primary font-semibold">{e.playerName}</td>
                          <td className="py-2 px-2 text-xs font-bold">{e.number}</td>
                          <td className="py-2 px-2 text-xs">{e.gameName}</td>
                          <td className="py-2 px-2 text-xs text-muted-foreground">{e.gameType}</td>
                          <td className="py-2 px-2 text-xs font-semibold">₹{e.amount}</td>
                          <td className="py-2 px-2">
                            {e.result ? (
                              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                e.result === "won" 
                                  ? "text-success bg-success/10 border border-success/30" 
                                  : "text-destructive bg-destructive/10 border border-destructive/30"
                              }`}>
                                {e.result === "won" ? `WON ₹${e.winAmount}` : "LOST"}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Pending</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-[10px] text-muted-foreground">
                            {new Date(e.createdAt).toLocaleDateString("en-IN", { 
                              day: "2-digit", 
                              month: "2-digit", 
                              year: "numeric" 
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default AdminHistory;