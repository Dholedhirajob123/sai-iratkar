import { useState, useEffect } from "react";
import {
  getGames,
  createGame,
  updateGame,
  deleteGame,
  toggleGameStatus,
  Game,
} from "@/lib/gameApi";
import {
  isValidGameNumber,
  getValidationErrorMessage,
  VALID_NUMBERS,
  getValidCenterNumbers,
} from "@/lib/validNumbers";
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
          <p className="text-[10px] font-mono text-muted-foreground mb-2">
            Valid 3-digit numbers for left/right positions:
          </p>
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

  const singleDigits = centerNumbers.filter((n) => n.length === 1 && n !== "*");
  const doubleDigits = centerNumbers.filter((n) => n.length === 2);
  const wildcard = centerNumbers.filter((n) => n === "*");

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
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newGame, setNewGame] = useState<Partial<Game>>({
    name: "",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "00:00",
    closeTime: "00:00",
    active: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadGames();
  }, []);

  const getGameActiveValue = (game: Partial<Game>) => {
    return typeof game.active === "boolean"
      ? game.active
      : typeof (game as any).isActive === "boolean"
      ? (game as any).isActive
      : false;
  };

  const loadGames = async () => {
    try {
      setLoading(true);
      const updatedGames = await getGames();
      setGames(updatedGames);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load games.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (g: Game) => {
    setEditing(g.id);
    setEditData({
      ...g,
      active: getGameActiveValue(g),
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData(null);
  };

  const saveEdit = async () => {
    if (!editData) return;

    if (!isValidGameNumber(editData.leftNumber, "left")) {
      const errorMsg = getValidationErrorMessage(editData.leftNumber, "left");
      toast({
        title: "Invalid Left Number",
        description: errorMsg || "Please enter a valid 3-digit number from the list.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidGameNumber(editData.centerNumber, "center")) {
      toast({
        title: "Invalid Center Number",
        description: "Center number must be a single digit (0-9), double digit (10-99), or *",
        variant: "destructive",
      });
      return;
    }

    if (!isValidGameNumber(editData.rightNumber, "right")) {
      const errorMsg = getValidationErrorMessage(editData.rightNumber, "right");
      toast({
        title: "Invalid Right Number",
        description: errorMsg || "Please enter a valid 3-digit number from the list.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateGame(editData.id, {
        name: editData.name.trim(),
        leftNumber: editData.leftNumber,
        centerNumber: editData.centerNumber,
        rightNumber: editData.rightNumber,
        openTime: editData.openTime,
        closeTime: editData.closeTime,
        active: getGameActiveValue(editData),
      });

      await loadGames();
      setEditing(null);
      setEditData(null);

      toast({
        title: "Game Updated",
        description: `${editData.name} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update game.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGame = async (gameId: number, gameName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${gameName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteGame(gameId);
      await loadGames();

      toast({
        title: "Game Deleted",
        description: `${gameName} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete game.",
        variant: "destructive",
      });
    }
  };

  const handleAddGame = async () => {
    if (!newGame.name?.trim()) {
      toast({
        title: "Error",
        description: "Game name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidGameNumber(newGame.leftNumber || "***", "left")) {
      const errorMsg = getValidationErrorMessage(newGame.leftNumber || "***", "left");
      toast({
        title: "Invalid Left Number",
        description: errorMsg || "Please enter a valid 3-digit number from the list.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidGameNumber(newGame.centerNumber || "*", "center")) {
      toast({
        title: "Invalid Center Number",
        description: "Center number must be a single digit (0-9), double digit (10-99), or *",
        variant: "destructive",
      });
      return;
    }

    if (!isValidGameNumber(newGame.rightNumber || "***", "right")) {
      const errorMsg = getValidationErrorMessage(newGame.rightNumber || "***", "right");
      toast({
        title: "Invalid Right Number",
        description: errorMsg || "Please enter a valid 3-digit number from the list.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGame({
        name: newGame.name.trim(),
        leftNumber: newGame.leftNumber || "***",
        centerNumber: newGame.centerNumber || "*",
        rightNumber: newGame.rightNumber || "***",
        openTime: newGame.openTime || "00:00",
        closeTime: newGame.closeTime || "00:00",
        active: true,
      });

      await loadGames();

      setNewGame({
        name: "",
        leftNumber: "***",
        centerNumber: "*",
        rightNumber: "***",
        openTime: "00:00",
        closeTime: "00:00",
        active: true,
      });

      setShowAddForm(false);

      toast({
        title: "Game Added",
        description: "Game has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add game.",
        variant: "destructive",
      });
    }
  };

  const handleToggleGameStatus = async (gameId: number) => {
    try {
      const updatedGame = await toggleGameStatus(gameId);
      await loadGames();

      const active = getGameActiveValue(updatedGame);

      toast({
        title: active ? "Game Activated" : "Game Deactivated",
        description: `${updatedGame.name} is now ${active ? "active" : "inactive"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to toggle game status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
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
                active: true,
              });
            }
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-mono text-xs font-semibold hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Cancel" : "Add New Game"}
        </button>
      </div>

      <ValidNumbersList />
      <CenterNumbersList />

      {showAddForm && (
        <div className="surface-card p-4 mb-4 border-2 border-primary/30">
          <h3 className="font-mono font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Add New Game
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground tracking-wider">
                GAME NAME
              </label>
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
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">
                  LEFT NUMBER
                </label>
                <input
                  value={newGame.leftNumber}
                  onChange={(e) => setNewGame({ ...newGame, leftNumber: e.target.value })}
                  placeholder="Left (e.g., 128)"
                  maxLength={3}
                  className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none mt-1 ${
                    newGame.leftNumber &&
                    !isValidGameNumber(newGame.leftNumber, "left") &&
                    newGame.leftNumber !== "***"
                      ? "border-destructive/50 focus:border-destructive"
                      : "border-foreground/10 focus:border-primary/50"
                  }`}
                />
                {newGame.leftNumber &&
                  !isValidGameNumber(newGame.leftNumber, "left") &&
                  newGame.leftNumber !== "***" && (
                    <p className="text-[8px] font-mono text-destructive mt-1">Invalid number</p>
                  )}
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">
                  CENTER NUMBER
                </label>
                <input
                  value={newGame.centerNumber}
                  onChange={(e) => setNewGame({ ...newGame, centerNumber: e.target.value })}
                  placeholder="Center (0-9, 10-99, or *)"
                  maxLength={2}
                  className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none mt-1 ${
                    newGame.centerNumber && !isValidGameNumber(newGame.centerNumber, "center")
                      ? "border-destructive/50 focus:border-destructive"
                      : "border-foreground/10 focus:border-primary/50"
                  }`}
                />
                {newGame.centerNumber && !isValidGameNumber(newGame.centerNumber, "center") && (
                  <p className="text-[8px] font-mono text-destructive mt-1">Must be 0-9, 10-99, or *</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">
                  RIGHT NUMBER
                </label>
                <input
                  value={newGame.rightNumber}
                  onChange={(e) => setNewGame({ ...newGame, rightNumber: e.target.value })}
                  placeholder="Right (e.g., 129)"
                  maxLength={3}
                  className={`w-full bg-input border-2 px-3 py-2 text-sm font-mono text-foreground text-center focus:outline-none mt-1 ${
                    newGame.rightNumber &&
                    !isValidGameNumber(newGame.rightNumber, "right") &&
                    newGame.rightNumber !== "***"
                      ? "border-destructive/50 focus:border-destructive"
                      : "border-foreground/10 focus:border-primary/50"
                  }`}
                />
                {newGame.rightNumber &&
                  !isValidGameNumber(newGame.rightNumber, "right") &&
                  newGame.rightNumber !== "***" && (
                    <p className="text-[8px] font-mono text-destructive mt-1">Invalid number</p>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">
                  OPEN TIME
                </label>
                <input
                  type="time"
                  value={newGame.openTime}
                  onChange={(e) => setNewGame({ ...newGame, openTime: e.target.value })}
                  className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground tracking-wider">
                  CLOSE TIME
                </label>
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

      <div className="space-y-3">
        {loading ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">Loading games...</p>
        ) : filteredGames.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">
            {searchQuery ? "No games match your search" : "No games found. Click 'Add New Game' to create one."}
          </p>
        ) : (
          filteredGames.map((g, index) => {
            const isActive = getGameActiveValue(g);

            return (
              <div key={g.id} className="surface-card p-4">
                {editing === g.id && editData ? (
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
                            !isValidGameNumber(editData.leftNumber, "left") &&
                            editData.leftNumber !== "***"
                              ? "border-destructive/50"
                              : "border-foreground/10"
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
                              ? "border-destructive/50"
                              : "border-foreground/10"
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
                            !isValidGameNumber(editData.rightNumber, "right") &&
                            editData.rightNumber !== "***"
                              ? "border-destructive/50"
                              : "border-foreground/10"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground mr-2">#{index + 1}</span>
                        <h3 className="font-mono font-bold text-sm text-foreground">{g.name}</h3>
                        <span
                          className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                            isActive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        {g.leftNumber} <span className="text-primary">{g.centerNumber}</span> {g.rightNumber} ·{" "}
                        {g.openTime} – {g.closeTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleGameStatus(g.id)}
                        className={`hover:opacity-70 ${
                          isActive ? "text-success" : "text-muted-foreground"
                        }`}
                        title={isActive ? "Deactivate Game" : "Activate Game"}
                      >
                        <Power
                          className={`w-4 h-4 ${
                            isActive ? "text-success" : "text-muted-foreground"
                          }`}
                        />
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminGames;