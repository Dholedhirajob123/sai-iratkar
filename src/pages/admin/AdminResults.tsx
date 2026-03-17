import { useState, useEffect } from "react";
import { getGames, getResults, declareResult, GAME_TYPE_MULTIPLIERS, Game, GameResult } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Search, Trophy, Clock, Sun, Moon } from "lucide-react";

// Game types for OPEN time results
const OPEN_GAME_TYPES = ["Single Digit", "Jodi Digit", "Single Pana", "Double Pana", "Triple Patti", "SP-DP-TP"];

// Game types for CLOSE time results (without Jodi)
const CLOSE_GAME_TYPES = ["Single Digit", "Single Pana", "Double Pana", "Triple Patti", "SP-DP-TP"];

const AdminResults = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedTime, setSelectedTime] = useState<"open" | "close" | "">("");
  const [selectedType, setSelectedType] = useState("");
  const [winningNumber, setWinningNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setGames(getGames());
    setResults(getResults().sort((a, b) => 
      new Date(b.declaredAt).getTime() - new Date(a.declaredAt).getTime()
    ));
  }, []);

  const filteredResults = results.filter(r => 
    r.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.gameType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGame = games.find(g => g.id === selectedGameId);

  // Get available game types based on selected time (open/close)
  const getGameTypesForTime = () => {
    if (selectedTime === "open") return OPEN_GAME_TYPES;
    if (selectedTime === "close") return CLOSE_GAME_TYPES;
    return [];
  };

  const isAlreadyDeclared = (gameId: string, gameType: string) => {
    // Check if result already exists for this game and game type
    return results.some(r => r.gameId === gameId && r.gameType === gameType);
  };

  const handleDeclare = () => {
    if (!selectedGameId || !selectedTime || !selectedType || !winningNumber) {
      toast({ 
        title: "Error", 
        description: "Please select game, time (open/close), game type, and winning number", 
        variant: "destructive" 
      });
      return;
    }
    
    const game = games.find(g => g.id === selectedGameId);
    if (!game) return;
    
    // Check if result already declared for this game and type
    if (isAlreadyDeclared(selectedGameId, selectedType)) {
      toast({ 
        title: "Error", 
        description: `Result already declared for ${selectedType}`, 
        variant: "destructive" 
      });
      return;
    }
    
    // Add time indicator to game type for display
    const timeSuffix = selectedTime === "open" ? " (Open)" : " (Close)";
    const gameTypeWithTime = selectedType + timeSuffix;
    
    declareResult(selectedGameId, game.name, selectedType, winningNumber);
    
    setResults(getResults().sort((a, b) => 
      new Date(b.declaredAt).getTime() - new Date(a.declaredAt).getTime()
    ));
    
    setWinningNumber("");
    setSelectedType("");
    setSelectedTime("");
    setSelectedGameId("");
    
    toast({ 
      title: "Result Declared", 
      description: `${game.name} - ${selectedType} (${selectedTime}): #${winningNumber}` 
    });
  };

  const resetSelections = () => {
    setSelectedTime("");
    setSelectedType("");
    setWinningNumber("");
  };

  return (
    <div className="space-y-6">
      {/* Declare Result Form */}
      <div className="surface-card p-4">
        <h3 className="font-mono font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" /> Declare Result
        </h3>
        
        {/* Game Selection */}
        <select
          value={selectedGameId}
          onChange={(e) => { 
            setSelectedGameId(e.target.value); 
            resetSelections();
          }}
          className="w-full bg-input border-2 p-2 mb-3 text-sm font-mono"
        >
          <option value="">Select Game</option>
          {games.map(g => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.openTime} - {g.closeTime})
            </option>
          ))}
        </select>

        {/* Time Selection (Open/Close) - Show only after game is selected */}
        {selectedGameId && (
          <div className="mb-4">
            <label className="text-[10px] font-mono text-muted-foreground tracking-wider block mb-2">
              SELECT TIME
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedTime("open");
                  setSelectedType("");
                }}
                className={`p-3 text-sm font-mono border-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  selectedTime === "open" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-foreground/10 hover:border-primary/30"
                }`}
              >
                <Sun className={`w-5 h-5 ${selectedTime === "open" ? "text-primary" : "text-muted-foreground"}`} />
                <span>OPEN Time</span>
                <span className="text-[10px] text-muted-foreground">{selectedGame?.openTime}</span>
              </button>
              
              <button
                onClick={() => {
                  setSelectedTime("close");
                  setSelectedType("");
                }}
                className={`p-3 text-sm font-mono border-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${
                  selectedTime === "close" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-foreground/10 hover:border-primary/30"
                }`}
              >
                <Moon className={`w-5 h-5 ${selectedTime === "close" ? "text-primary" : "text-muted-foreground"}`} />
                <span>CLOSE Time</span>
                <span className="text-[10px] text-muted-foreground">{selectedGame?.closeTime}</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Type Selection - Show only after time is selected */}
        {selectedTime && (
          <div className="mb-4">
            <label className="text-[10px] font-mono text-muted-foreground tracking-wider block mb-2">
              GAME TYPE FOR {selectedTime.toUpperCase()} TIME
              {selectedTime === "close" && (
                <span className="ml-2 text-[8px] text-destructive">(Jodi not available)</span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {getGameTypesForTime().map(type => {
                const declared = isAlreadyDeclared(selectedGameId, type);
                const isJodi = type === "Jodi Digit";
                
                return (
                  <button
                    key={type}
                    onClick={() => !declared && setSelectedType(type)}
                    disabled={declared}
                    className={`p-2 text-xs font-mono border-2 transition-colors relative ${
                      declared 
                        ? "opacity-50 line-through cursor-not-allowed bg-accent/30" 
                        : selectedType === type 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-foreground/10 hover:border-primary/30"
                    } ${selectedTime === "open" && isJodi ? 'border-l-4 border-l-primary' : ''}`}
                    title={
                      selectedTime === "close" && isJodi 
                        ? "Jodi not available for CLOSE time" 
                        : declared ? "Result already declared" : ""
                    }
                  >
                    <div className="flex items-center justify-center gap-1">
                      {selectedTime === "open" && isJodi && <Sun className="w-3 h-3" />}
                      {selectedTime === "close" && !isJodi && <Moon className="w-3 h-3" />}
                      {type}
                    </div>
                    {declared && (
                      <span className="block text-[9px] text-muted-foreground">Already Declared</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Winning Number Input - Show only after type is selected */}
        {selectedType && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">
                WINNING NUMBER for {selectedType} ({selectedTime})
              </span>
              <span className="text-xs font-mono text-primary flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Multiplier: {GAME_TYPE_MULTIPLIERS[selectedType as keyof typeof GAME_TYPE_MULTIPLIERS] || 9}x
              </span>
            </div>
            <input
              type="text"
              value={winningNumber}
              onChange={(e) => setWinningNumber(e.target.value.replace(/\D/g, ""))}
              placeholder={`Enter ${selectedType} winning number`}
              className="w-full bg-input border-2 p-2 mb-3 text-sm font-mono"
              maxLength={
                selectedType === "Single Digit" ? 1 :
                selectedType === "Jodi Digit" ? 2 : 3
              }
              autoFocus
            />
            <button 
              onClick={handleDeclare} 
              className="w-full bg-primary text-white p-3 font-mono font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Declare {selectedType} Result for {selectedTime.toUpperCase()} Time
            </button>
          </>
        )}

        {/* Selection Summary */}
        {selectedGameId && selectedTime && selectedType && winningNumber && (
          <div className="mt-3 p-2 bg-accent/20 rounded text-xs font-mono">
            <p className="text-center">
              Summary: {selectedGame?.name} - {selectedType} ({selectedTime}) - #{winningNumber}
            </p>
          </div>
        )}
      </div>

      {/* Past Results */}
      <div>
        <h3 className="font-mono font-bold mb-3">Declared Results</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 pl-10 pr-4 py-2 text-sm font-mono"
          />
        </div>
        
        {filteredResults.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No results declared yet</p>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((r, i) => {
              // Determine if this was likely an open or close result based on game times
              const game = games.find(g => g.id === r.gameId);
              const isJodi = r.gameType === "Jodi Digit";
              
              return (
                <div key={r.id} className="surface-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-primary text-xl w-12 text-center">
                      {r.winningNumber}
                    </span>
                    <div>
                      <p className="font-mono text-xs font-semibold text-foreground">{r.gameName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        {isJodi ? (
                          <Sun className="w-3 h-3 text-primary" />
                        ) : (
                          <Moon className="w-3 h-3 text-muted-foreground" />
                        )}
                        {r.gameType} · {GAME_TYPE_MULTIPLIERS[r.gameType as keyof typeof GAME_TYPE_MULTIPLIERS] || 9}x
                        {isJodi && <span className="text-[8px] text-primary">(Open)</span>}
                        {!isJodi && r.gameType !== "Jodi Digit" && <span className="text-[8px] text-muted-foreground">(Close)</span>}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {new Date(r.declaredAt).toLocaleDateString("en-IN", { 
                      day: "2-digit", 
                      month: "2-digit", 
                      year: "numeric" 
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResults;