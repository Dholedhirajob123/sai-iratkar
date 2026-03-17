import { useState, useEffect } from "react";
import { getResults, getGames, GameResult, Game } from "@/lib/storage";
import { Search, Trophy, Calendar } from "lucide-react";

const AdminResults = () => {
  const [results, setResults] = useState<GameResult[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("all");

  useEffect(() => {
    setResults(getResults().sort((a, b) => 
      new Date(b.declaredAt).getTime() - new Date(a.declaredAt).getTime()
    ));
    setGames(getGames());
  }, []);

  const filteredResults = results.filter(result => {
    const matchesSearch = result.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.gameType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.winningNumber.includes(searchQuery);
    
    const matchesGame = selectedGame === "all" || result.gameId === selectedGame;
    
    return matchesSearch && matchesGame;
  });

  // Group results by date
  const groupedByDate = filteredResults.reduce((acc, result) => {
    const date = new Date(result.declaredAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(result);
    return acc;
  }, {} as Record<string, GameResult[]>);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="font-mono font-bold">All Declared Results</h2>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono"
          />
        </div>

        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono"
        >
          <option value="all">All Games</option>
          {games.map(game => (
            <option key={game.id} value={game.id}>{game.name}</option>
          ))}
        </select>
      </div>

      {/* Results Display */}
      {Object.keys(groupedByDate).length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No results declared yet</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([date, dateResults]) => (
            <div key={date} className="surface-card p-3">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {date}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {dateResults.map(result => (
                  <div key={result.id} className="p-2 bg-accent/10 rounded border-l-2 border-primary">
                    <p className="text-[10px] font-mono text-muted-foreground">{result.gameName}</p>
                    <p className="text-xs font-mono font-semibold">{result.gameType}</p>
                    <p className="text-sm font-mono font-bold text-primary">#{result.winningNumber}</p>
                    <p className="text-[8px] font-mono text-muted-foreground">
                      {new Date(result.declaredAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminResults;