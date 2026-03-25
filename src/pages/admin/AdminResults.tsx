import { useEffect, useMemo, useState } from "react";
import { Search, Trophy, Calendar } from "lucide-react";
import { getResults, getGames, GameResult, Game } from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";

const AdminResults = () => {
  const [results, setResults] = useState<GameResult[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

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
    } catch (error) {
      console.error("Failed to load results:", error);
      toast({
        title: "Error",
        description: "Failed to load results.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const gameName = result.gameName || "";
      const gameType = result.gameType || "";

      const displayNumber = `${result.leftNumber || "-"} ${result.centerNumber || "-"} ${result.rightNumber || "-"}`;

      const matchesSearch =
        gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gameType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        displayNumber.includes(searchQuery);

      const resultGameId = result.game?.id?.toString();

      const matchesGame =
        selectedGame === "all" || resultGameId === selectedGame;

      return matchesSearch && matchesGame;
    });
  }, [results, searchQuery, selectedGame]);

  const groupedByDate = useMemo(() => {
    return filteredResults.reduce((acc, result) => {
      const date = new Date(result.declaredAt).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(result);
      return acc;
    }, {} as Record<string, GameResult[]>);
  }, [filteredResults]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="font-mono text-sm text-muted-foreground">
          Loading results...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="font-mono font-bold">All Declared Results</h2>
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
          />
        </div>

        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50"
        >
          <option value="all">All Games</option>
          {games.map((game) => (
            <option key={game.id} value={game.id.toString()}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      {Object.keys(groupedByDate).length === 0 ? (
        <p className="text-center text-muted-foreground py-10 font-mono text-sm">
          No results declared yet
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([date, dateResults]) => (
            <div key={date} className="surface-card p-3">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {date}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dateResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 bg-accent/10 rounded border-l-2 border-primary"
                  >
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {result.gameName}
                    </p>

                    <p className="text-xs font-mono font-semibold mt-1">
                      {result.gameType}
                    </p>

                    {/* ✅ UPDATED NUMBER DISPLAY */}
                    <p className="text-sm font-mono font-bold text-primary mt-1">
                      {result.leftNumber || "-"}{" "}
                      {result.centerNumber || "-"}{" "}
                      {result.rightNumber || "-"}
                    </p>

                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      {new Date(result.declaredAt).toLocaleTimeString()}
                    </p>

                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      Winners: {result.totalWinners} | Payout: ₹
                      {result.totalPayout}
                    </p>

                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      {result.timeType?.toUpperCase()}
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