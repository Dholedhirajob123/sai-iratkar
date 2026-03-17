import { useState, useEffect } from "react";
import { getGames, updateGame, Game } from "@/lib/storage";
import { isValidGameNumber, getValidationErrorMessage, VALID_NUMBERS, getValidCenterNumbers } from "@/lib/validNumbers";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Pencil, Save, Undo2, Power, Trash2 } from "lucide-react";

// Valid Numbers List Component
const ValidNumbersList = () => {
  const [showList, setShowList] = useState(false);
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setShowList(!showList)}
        className="text-xs font-mono text-primary hover:opacity-70 flex items-center gap-1"
      >
        {showList ? "▼ Hide" : "▶ Show"} Valid 3-Digit Numbers List
      </button>
      
      {showList && (
        <div className="mt-2 p-3 bg-accent/30 border border-foreground/10 rounded max-h-60 overflow-y-auto">
          <p className="text-[10px] font-mono text-muted-foreground mb-2">Valid 3-digit numbers for left/right positions:</p>
          <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
            {VALID_NUMBERS.map((num, index) => (
              <span key={index} className="px-1 py-0.5 bg-background/50 rounded text-center">
                {num}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Center Numbers List Component
const CenterNumbersList = () => {
  const [showList, setShowList] = useState(false);
  const centerNumbers = getValidCenterNumbers();
  
  const singleDigits = centerNumbers.filter(n => n.length === 1 && n !== "*");
  const doubleDigits = centerNumbers.filter(n => n.length === 2);
  const wildcard = centerNumbers.filter(n => n === "*");
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setShowList(!showList)}
        className="text-xs font-mono text-primary hover:opacity-70 flex items-center gap-1"
      >
        {showList ? "▼ Hide" : "▶ Show"} Valid Center Numbers (0-9, 10-99, *)
      </button>
      
      {showList && (
        <div className="mt-2 p-3 bg-accent/30 border border-foreground/10 rounded">
          <p className="text-[10px] font-mono text-muted-foreground mb-2">Valid center numbers:</p>
          
          <div className="mb-2">
            <p className="text-[8px] font-mono text-muted-foreground mb-1">Single Digits (0-9):</p>
            <div className="grid grid-cols-10 gap-1 text-[10px] font-mono">
              {singleDigits.map((num, index) => (
                <span key={index} className="px-1 py-0.5 bg-background/50 rounded text-center">
                  {num}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-2">
            <p className="text-[8px] font-mono text-muted-foreground mb-1">Double Digits (10-99):</p>
            <div className="grid grid-cols-10 gap-1 text-[10px] font-mono max-h-40 overflow-y-auto">
              {doubleDigits.map((num, index) => (
                <span key={index} className="px-1 py-0.5 bg-background/50 rounded text-center">
                  {num}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-[8px] font-mono text-muted-foreground mb-1">Wildcard:</p>
            <div className="grid grid-cols-1 gap-1 text-[10px] font-mono">
              {wildcard.map((num, index) => (
                <span key={index} className="px-1 py-0.5 bg-background/50 rounded text-center w-10">
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Games Tab Component
const AdminGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGame, setNewGame] = useState<Partial<Game>>({
    name: "",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "00:00",
    closeTime: "00:00",
    isActive: true,
  });
  const { toast } = useToast();

  useEffect(() => { 
    loadGames(); 
  }, []);

  const loadGames = () => {
    const updatedGames = getGames();
    setGames(updatedGames);
  };

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (g: Game) => { 
    setEditing(g.id); 
    setEditData({ ...g }); 
  };
  
  const cancelEdit = () => { 
    setEditing(null); 
    setEditData(null); 
  };
  
  const saveEdit = () => {
    if (!editData) return;
    
    if (!isValidGameNumber(editData.leftNumber, "left")) {
      const errorMsg = getValidationErrorMessage(editData.leftNumber, "left");
      toast({ 
        title: "Invalid Left Number", 
        description: errorMsg || "Please enter a valid 3-digit number from the list.", 
        variant: "destructive" 
      });
      return;
    }

    if (!isValidGameNumber(editData.centerNumber, "center")) {
      toast({ 
        title: "Invalid Center Number", 
        description: "Center number must be a single digit (0-9), double digit (10-99), or *", 
        variant: "destructive" 
      });
      return;
    }

    if (!isValidGameNumber(editData.rightNumber, "right")) {
      const errorMsg = getValidationErrorMessage(editData.rightNumber, "right");
      toast({ 
        title: "Invalid Right Number", 
        description: errorMsg || "Please enter a valid 3-digit number from the list.", 
        variant: "destructive" 
      });
      return;
    }
    
    updateGame(editData);
    loadGames();
    setEditing(null);
    setEditData(null);
    
    toast({ 
      title: "Game Updated", 
      description: `${editData.name} has been updated successfully.` 
    });
  };

  const handleDeleteGame = (gameId: string, gameName: string) => {
    if (window.confirm(`Are you sure you want to delete ${gameName}? This action cannot be undone.`)) {
      const allGames = getGames();
      const updatedGames = allGames.filter(g => g.id !== gameId);
      localStorage.setItem("star_games", JSON.stringify(updatedGames));
      setGames(updatedGames);
      toast({ 
        title: "Game Deleted", 
        description: `${gameName} has been removed.` 
      });
    }
  };

  const handleAddGame = () => {
    if (!newGame.name?.trim()) {
      toast({ 
        title: "Error", 
        description: "Game name is required.", 
        variant: "destructive" 
      });
      return;
    }

    if (!isValidGameNumber(newGame.leftNumber || "***", "left")) {
      const errorMsg = getValidationErrorMessage(newGame.leftNumber || "***", "left");
      toast({ 
        title: "Invalid Left Number", 
        description: errorMsg || "Please enter a valid 3-digit number from the list.", 
        variant: "destructive" 
      });
      return;
    }

    if (!isValidGameNumber(newGame.centerNumber || "*", "center")) {
      toast({ 
        title: "Invalid Center Number", 
        description: "Center number must be a single digit (0-9), double digit (10-99), or *", 
        variant: "destructive" 
      });
      return;
    }

    if (!isValidGameNumber(newGame.rightNumber || "***", "right")) {
      const errorMsg = getValidationErrorMessage(newGame.rightNumber || "***", "right");
      toast({ 
        title: "Invalid Right Number", 
        description: errorMsg || "Please enter a valid 3-digit number from the list.", 
        variant: "destructive" 
      });
      return;
    }

    const gameToAdd: Game = {
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newGame.name.trim(),
      leftNumber: newGame.leftNumber || "***",
      centerNumber: newGame.centerNumber || "*",
      rightNumber: newGame.rightNumber || "***",
      openTime: newGame.openTime || "00:00",
      closeTime: newGame.closeTime || "00:00",
      isActive: true,
    };

    const allGames = getGames();
    const updatedGames = [...allGames, gameToAdd];
    localStorage.setItem("star_games", JSON.stringify(updatedGames));
    setGames(updatedGames);

    setNewGame({
      name: "",
      leftNumber: "***",
      centerNumber: "*",
      rightNumber: "***",
      openTime: "00:00",
      closeTime: "00:00",
      isActive: true,
    });
    setShowAddForm(false);

    toast({ 
      title: "Game Added", 
      description: `${gameToAdd.name} has been added successfully.` 
    });
  };

  const toggleGameStatus = (gameId: string) => {
    const allGames = getGames();
    const updatedGames = allGames.map(game => {
      if (game.id === gameId) {
        return { ...game, isActive: !game.isActive };
      }
      return game;
    });
    
    localStorage.setItem("star_games", JSON.stringify(updatedGames));
    setGames(updatedGames);
    
    const game = updatedGames.find(g => g.id === gameId);
    toast({ 
      title: game?.isActive ? "Game Activated" : "Game Deactivated", 
      description: `${game?.name} is now ${game?.isActive ? 'active' : 'inactive'}.` 
    });
  };

  return (
    <div>
      {/* Header with Add Game Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search games by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) {
              setNewGame({
                name: "",
                leftNumber: "***",
                centerNumber: "*",
                rightNumber: "***",
                openTime: "00:00",
                closeTime: "00:00",
                isActive: true,
              });
            }
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-mono text-xs font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Cancel" : "Add New Game"}
        </button>
      </div>

      {/* Valid Numbers Lists */}
      <ValidNumbersList />
      <CenterNumbersList />

      {/* Add Game Form */}
      {showAddForm && (
        <div className="surface-card p-4 mb-4 border-2 border-primary/30">
          <h3 className="font-mono font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Add New Game
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground tracking-wider">GAME NAME</label>
              <input
                type="text"
                value={newGame.name}
                onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                placeholder="Enter game name"
                className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">LEFT NUMBER</label>
                <input
                  value={newGame.leftNumber}
                  onChange={(e) => setNewGame({ ...newGame, leftNumber: e.target.value })}
                  placeholder="Left (e.g., 128)"
                  maxLength={3}
                  className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none mt-1 ${
                    newGame.leftNumber && !isValidGameNumber(newGame.leftNumber, "left") && newGame.leftNumber !== "***"
                      ? 'border-destructive/50 focus:border-destructive'
                      : 'border-foreground/10 focus:border-primary/50'
                  }`}
                />
                {newGame.leftNumber && !isValidGameNumber(newGame.leftNumber, "left") && newGame.leftNumber !== "***" && (
                  <p className="text-[8px] font-mono text-destructive mt-1">Invalid number</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">CENTER NUMBER</label>
                <input
                  value={newGame.centerNumber}
                  onChange={(e) => setNewGame({ ...newGame, centerNumber: e.target.value })}
                  placeholder="Center (0-9, 10-99, or *)"
                  maxLength={2}
                  className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none mt-1 ${
                    newGame.centerNumber && !isValidGameNumber(newGame.centerNumber, "center")
                      ? 'border-destructive/50 focus:border-destructive'
                      : 'border-foreground/10 focus:border-primary/50'
                  }`}
                />
                {newGame.centerNumber && !isValidGameNumber(newGame.centerNumber, "center") && (
                  <p className="text-[8px] font-mono text-destructive mt-1">Must be 0-9, 10-99, or *</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">RIGHT NUMBER</label>
                <input
                  value={newGame.rightNumber}
                  onChange={(e) => setNewGame({ ...newGame, rightNumber: e.target.value })}
                  placeholder="Right (e.g., 129)"
                  maxLength={3}
                  className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none mt-1 ${
                    newGame.rightNumber && !isValidGameNumber(newGame.rightNumber, "right") && newGame.rightNumber !== "***"
                      ? 'border-destructive/50 focus:border-destructive'
                      : 'border-foreground/10 focus:border-primary/50'
                  }`}
                />
                {newGame.rightNumber && !isValidGameNumber(newGame.rightNumber, "right") && newGame.rightNumber !== "***" && (
                  <p className="text-[8px] font-mono text-destructive mt-1">Invalid number</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">OPEN TIME</label>
                <input
                  type="time"
                  value={newGame.openTime}
                  onChange={(e) => setNewGame({ ...newGame, openTime: e.target.value })}
                  className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">CLOSE TIME</label>
                <input
                  type="time"
                  value={newGame.closeTime}
                  onChange={(e) => setNewGame({ ...newGame, closeTime: e.target.value })}
                  className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mt-1"
                />
              </div>
            </div>

            <button
              onClick={handleAddGame}
              className="w-full bg-primary text-primary-foreground py-2 font-mono text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Game
            </button>
          </div>
        </div>
      )}
      
      {/* Games List */}
      <div className="space-y-3">
        {filteredGames.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">
            {searchQuery ? "No games match your search" : "No games found. Click 'Add New Game' to create one."}
          </p>
        ) : (
          filteredGames.map((g, index) => (
            <div key={g.id} className="surface-card p-4">
              {editing === g.id && editData ? (
                // Edit Mode
                <div className="space-y-3">
                  <input 
                    value={editData.name} 
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50" 
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground">Left Number</label>
                      <input 
                        value={editData.leftNumber} 
                        maxLength={3}
                        onChange={(e) => setEditData({ ...editData, leftNumber: e.target.value })}
                        className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none ${
                          !isValidGameNumber(editData.leftNumber, "left") && editData.leftNumber !== "***"
                            ? 'border-destructive/50'
                            : 'border-foreground/10'
                        }`} 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground">Center</label>
                      <input 
                        value={editData.centerNumber} 
                        maxLength={2}
                        onChange={(e) => setEditData({ ...editData, centerNumber: e.target.value })}
                        className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none ${
                          !isValidGameNumber(editData.centerNumber, "center")
                            ? 'border-destructive/50'
                            : 'border-foreground/10'
                        }`} 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground">Right</label>
                      <input 
                        value={editData.rightNumber} 
                        maxLength={3}
                        onChange={(e) => setEditData({ ...editData, rightNumber: e.target.value })}
                        className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none ${
                          !isValidGameNumber(editData.rightNumber, "right") && editData.rightNumber !== "***"
                            ? 'border-destructive/50'
                            : 'border-foreground/10'
                        }`} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground">Open Time</label>
                      <input 
                        type="time" 
                        value={editData.openTime} 
                        onChange={(e) => setEditData({ ...editData, openTime: e.target.value })}
                        className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground">Close Time</label>
                      <input 
                        type="time" 
                        value={editData.closeTime} 
                        onChange={(e) => setEditData({ ...editData, closeTime: e.target.value })}
                        className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={saveEdit} 
                      className="flex-1 flex items-center justify-center gap-1 bg-primary text-primary-foreground py-2 font-mono text-xs font-semibold hover:opacity-90"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                    <button 
                      onClick={cancelEdit} 
                      className="flex-1 flex items-center justify-center gap-1 border-2 border-foreground/10 text-muted-foreground py-2 font-mono text-xs font-semibold hover:text-foreground"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground mr-2">
                        #{index + 1}
                      </span>
                      <h3 className="font-mono font-bold text-sm text-foreground">{g.name}</h3>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${g.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {g.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      {g.leftNumber} <span className="text-primary">{g.centerNumber}</span> {g.rightNumber} · {g.openTime} – {g.closeTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleGameStatus(g.id)} 
                      className={`hover:opacity-70 ${g.isActive ? 'text-success' : 'text-muted-foreground'}`}
                      title={g.isActive ? "Deactivate Game" : "Activate Game"}
                    >
                      <Power className={`w-4 h-4 ${g.isActive ? 'text-success' : 'text-muted-foreground'}`} />
                    </button>
                    <button 
                      onClick={() => startEdit(g)} 
                      className="text-primary hover:opacity-70"
                      title="Edit Game"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteGame(g.id, g.name)} 
                      className="text-destructive hover:opacity-70"
                      title="Delete Game"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminGames;