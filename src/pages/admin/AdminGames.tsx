import { useState, useEffect, useCallback, useRef } from "react";
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
import { 
  Search, 
  Plus, 
  Pencil, 
  Save, 
  Undo2, 
  Power, 
  Trash2, 
  RefreshCw,
  Gamepad2,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  Sparkles,
  Info,
  X,
  CheckCircle,
  AlertCircle,
  Palette
} from "lucide-react";

// Valid double-digit center numbers
const VALID_DOUBLE_DIGIT_CENTER = ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
  "51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
  "61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
  "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
  "81", "82", "83", "84", "85", "86", "87", "88", "89", "90",
  "91", "92", "93", "94", "95", "96", "97", "98", "99"];

// Color Picker Component
const ColorPicker = ({ 
  color, 
  onChange, 
  label 
}: { 
  color: string; 
  onChange: (color: string) => void; 
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-all duration-200"
      >
        <div className="w-6 h-6 rounded border border-gray-300 shadow-sm" style={{ backgroundColor: color }} />
        <span className="text-xs font-mono text-gray-600">{label}</span>
        <Palette className="w-3 h-3 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-200">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-32 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full px-2 py-1 text-xs font-mono border border-gray-200 rounded"
          />
        </div>
      )}
    </div>
  );
};

// Valid Numbers List Component
const ValidNumbersList = () => {
  const [showList, setShowList] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowList(!showList)}
        className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
      >
        <Info className="w-3.5 h-3.5" />
        {showList ? "▼ Hide" : "▶ Show"} Valid 3-Digit Numbers List
      </button>

      {showList && (
        <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl max-h-60 overflow-y-auto shadow-sm">
          <p className="text-[10px] font-mono font-semibold text-gray-600 mb-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Valid 3-digit numbers for left/right positions:
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
            {VALID_NUMBERS.map((num, index) => (
              <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-center text-xs font-mono font-semibold text-gray-700 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
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
  const doubleDigits = VALID_DOUBLE_DIGIT_CENTER;
  const wildcard = centerNumbers.filter((n) => n === "*");

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowList(!showList)}
        className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
      >
        <Info className="w-3.5 h-3.5" />
        {showList ? "▼ Hide" : "▶ Show"} Valid Center Numbers (0-9, 10-99, *)
      </button>

      {showList && (
        <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-mono font-semibold text-gray-600 mb-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Valid center numbers:
          </p>

          <div className="mb-3">
            <p className="text-[8px] font-mono text-gray-500 mb-2">Single Digits (0-9):</p>
            <div className="grid grid-cols-10 gap-1.5">
              {singleDigits.map((num, index) => (
                <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-center text-xs font-mono font-semibold text-gray-700">
                  {num}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-[8px] font-mono text-gray-500 mb-2">Valid Double Digits:</p>
            <div className="grid grid-cols-6 gap-1.5">
              {doubleDigits.map((num, index) => (
                <span key={index} className="px-2 py-1 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg text-center text-xs font-mono font-bold text-red-600">
                  {num}
                </span>
              ))}
            </div>
            <p className="text-[7px] font-mono text-red-500 mt-1">⚠️ Only these double digits are valid</p>
          </div>

          <div>
            <p className="text-[8px] font-mono text-gray-500 mb-2">Wildcard:</p>
            <div className="grid grid-cols-1 gap-1.5">
              {wildcard.map((num, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg text-center w-12 text-xs font-mono font-bold text-purple-700">
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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "inactive">("all");

  const [newGame, setNewGame] = useState<Partial<Game>>({
    name: "",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "00:00",
    closeTime: "00:00",
    active: true,
    leftNumberColor: "#000000",
    leftNumberBgColor: "#f3f4f6",
    centerNumberColor: "#000000",
    centerNumberBgColor: "#f3f4f6",
    rightNumberColor: "#000000",
    rightNumberBgColor: "#f3f4f6",
  });

  const { toast } = useToast();
  
  const initialLoadRef = useRef(false);
  const isFetchingRef = useRef(false);

  const getGameActiveValue = (game: Partial<Game>) => {
    return typeof game.active === "boolean"
      ? game.active
      : typeof (game as any).isActive === "boolean"
      ? (game as any).isActive
      : false;
  };

  const loadGames = useCallback(async (showRefreshToast = false) => {
    if (isFetchingRef.current) {
      return;
    }
    
    if (initialLoadRef.current && !showRefreshToast) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      
      if (!showRefreshToast) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const updatedGames = await getGames();
      setGames(updatedGames);
      initialLoadRef.current = true;
      
      if (showRefreshToast) {
        toast({
          title: "Refreshed",
          description: `Loaded ${updatedGames.length} games`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load games.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [toast]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const handleRefresh = () => {
    loadGames(true);
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      selectedFilter === "all" ? true :
      selectedFilter === "active" ? getGameActiveValue(game) :
      !getGameActiveValue(game);
    return matchesSearch && matchesFilter;
  });

  const validateCenterNumberWithColor = (centerNum: string) => {
    if (centerNum.length === 2) {
      if (VALID_DOUBLE_DIGIT_CENTER.includes(centerNum)) {
        return { isValid: true, isSpecialDouble: true };
      }
      return { isValid: false, isSpecialDouble: false };
    }
    return { isValid: true, isSpecialDouble: false };
  };

  const startEdit = (g: Game) => {
    setEditing(g.id);
    setEditData({
      ...g,
      active: getGameActiveValue(g),
      leftNumberColor: g.leftNumberColor || "#000000",
      leftNumberBgColor: g.leftNumberBgColor || "#f3f4f6",
      centerNumberColor: g.centerNumberColor || "#000000",
      centerNumberBgColor: g.centerNumberBgColor || "#f3f4f6",
      rightNumberColor: g.rightNumberColor || "#000000",
      rightNumberBgColor: g.rightNumberBgColor || "#f3f4f6",
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData(null);
  };

  const resetLeftNumber = () => {
    if (editData) {
      setEditData({ ...editData, leftNumber: "***" });
    }
  };

  const resetCenterNumber = () => {
    if (editData) {
      setEditData({ ...editData, centerNumber: "*" });
    }
  };

  const resetRightNumber = () => {
    if (editData) {
      setEditData({ ...editData, rightNumber: "***" });
    }
  };

  const resetAllNumbers = () => {
    if (editData) {
      setEditData({
        ...editData,
        leftNumber: "***",
        centerNumber: "*",
        rightNumber: "***",
      });
      toast({
        title: "Reset",
        description: "All numbers have been reset to default values.",
      });
    }
  };

  const saveEdit = async () => {
    if (!editData) return;

    if (!isValidGameNumber(editData.leftNumber, "left") && editData.leftNumber !== "***") {
      const errorMsg = getValidationErrorMessage(editData.leftNumber, "left");
      toast({
        title: "Invalid Left Number",
        description: errorMsg || "Please enter a valid 3-digit number from the list.",
        variant: "destructive",
      });
      return;
    }

    const centerValidation = validateCenterNumberWithColor(editData.centerNumber);
    if (!centerValidation.isValid && editData.centerNumber !== "*") {
      toast({
        title: "Invalid Center Number",
        description: `Center number must be a single digit (0-9), one of these double digits: ${VALID_DOUBLE_DIGIT_CENTER.join(", ")}, or *`,
        variant: "destructive",
      });
      return;
    }

    if (!isValidGameNumber(editData.rightNumber, "right") && editData.rightNumber !== "***") {
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
        leftNumberColor: editData.leftNumberColor,
        leftNumberBgColor: editData.leftNumberBgColor,
        centerNumberColor: editData.centerNumberColor,
        centerNumberBgColor: editData.centerNumberBgColor,
        rightNumberColor: editData.rightNumberColor,
        rightNumberBgColor: editData.rightNumberBgColor,
      });

      await loadGames(true);
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
      await loadGames(true);

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

    if (!isValidGameNumber(newGame.leftNumber || "***", "left") && newGame.leftNumber !== "***") {
      const errorMsg = getValidationErrorMessage(newGame.leftNumber || "***", "left");
      toast({
        title: "Invalid Left Number",
        description: errorMsg || "Please enter a valid 3-digit number from the list.",
        variant: "destructive",
      });
      return;
    }

    const centerValidation = validateCenterNumberWithColor(newGame.centerNumber || "*");
    if (!centerValidation.isValid && newGame.centerNumber !== "*") {
      toast({
        title: "Invalid Center Number",
        description: `Center number must be a single digit (0-9), one of these double digits: ${VALID_DOUBLE_DIGIT_CENTER.join(", ")}, or *`,
        variant: "destructive",
      });
      return;
    }

    if (!isValidGameNumber(newGame.rightNumber || "***", "right") && newGame.rightNumber !== "***") {
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
        leftNumberColor: newGame.leftNumberColor || "#000000",
        leftNumberBgColor: newGame.leftNumberBgColor || "#f3f4f6",
        centerNumberColor: newGame.centerNumberColor || "#000000",
        centerNumberBgColor: newGame.centerNumberBgColor || "#f3f4f6",
        rightNumberColor: newGame.rightNumberColor || "#000000",
        rightNumberBgColor: newGame.rightNumberBgColor || "#f3f4f6",
      });

      await loadGames(true);

      setNewGame({
        name: "",
        leftNumber: "***",
        centerNumber: "*",
        rightNumber: "***",
        openTime: "00:00",
        closeTime: "00:00",
        active: true,
        leftNumberColor: "#000000",
        leftNumberBgColor: "#f3f4f6",
        centerNumberColor: "#000000",
        centerNumberBgColor: "#f3f4f6",
        rightNumberColor: "#000000",
        rightNumberBgColor: "#f3f4f6",
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
      await loadGames(true);

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

  const stats = {
    total: games.length,
    active: games.filter(g => getGameActiveValue(g)).length,
    inactive: games.filter(g => !getGameActiveValue(g)).length,
  };

  if (loading && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 font-mono text-sm text-gray-500">Loading games...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono opacity-80">Total Games</p>
              <p className="text-3xl font-mono font-black mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Gamepad2 className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono opacity-80">Active Games</p>
              <p className="text-3xl font-mono font-black mt-1">{stats.active}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono opacity-80">Inactive Games</p>
              <p className="text-3xl font-mono font-black mt-1">{stats.inactive}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <X className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search games by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 pl-12 pr-4 py-3.5 text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="bg-gray-50 border-2 border-gray-200 px-5 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200"
            >
              <option value="all">All Games</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm font-bold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
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
                  leftNumberColor: "#000000",
                  leftNumberBgColor: "#f3f4f6",
                  centerNumberColor: "#000000",
                  centerNumberBgColor: "#f3f4f6",
                  rightNumberColor: "#000000",
                  rightNumberBgColor: "#f3f4f6",
                });
              }
            }}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm font-bold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Cancel" : "Add New Game"}
          </button>
        </div>
      </div>

      <ValidNumbersList />
      <CenterNumbersList />

      {/* Add Game Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-mono font-bold text-lg text-gray-900">Add New Game</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">
                GAME NAME
              </label>
              <input
                type="text"
                value={newGame.name}
                onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                placeholder="Enter game name"
                className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">
                  LEFT NUMBER
                </label>
                <input
                  value={newGame.leftNumber}
                  onChange={(e) => setNewGame({ ...newGame, leftNumber: e.target.value })}
                  placeholder="Left (e.g., 128)"
                  maxLength={3}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">
                  CENTER NUMBER
                </label>
                <input
                  value={newGame.centerNumber}
                  onChange={(e) => setNewGame({ ...newGame, centerNumber: e.target.value })}
                  placeholder="Center (0-9, or specific double digits)"
                  maxLength={2}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">
                  RIGHT NUMBER
                </label>
                <input
                  value={newGame.rightNumber}
                  onChange={(e) => setNewGame({ ...newGame, rightNumber: e.target.value })}
                  placeholder="Right (e.g., 129)"
                  maxLength={3}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>

            {/* Color Pickers for Add Form */}
            <div className="border-t border-gray-200 pt-4">
              <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                CUSTOMIZE COLORS (Text & Background)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Number Colors */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-mono font-bold text-gray-700 mb-2">Left Number</p>
                  <div className="flex gap-2 mb-2">
                    <ColorPicker
                      color={newGame.leftNumberColor || "#000000"}
                      onChange={(color) => setNewGame({ ...newGame, leftNumberColor: color })}
                      label="Text"
                    />
                    <ColorPicker
                      color={newGame.leftNumberBgColor || "#f3f4f6"}
                      onChange={(color) => setNewGame({ ...newGame, leftNumberBgColor: color })}
                      label="BG"
                    />
                  </div>
                  <div 
                    className="mt-2 p-2 rounded-lg text-center text-sm font-mono font-bold transition-all"
                    style={{ 
                      backgroundColor: newGame.leftNumberBgColor || "#f3f4f6",
                      color: newGame.leftNumberColor || "#000000"
                    }}
                  >
                    Preview: {newGame.leftNumber || "***"}
                  </div>
                </div>

                {/* Center Number Colors */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-mono font-bold text-gray-700 mb-2">Center Number</p>
                  <div className="flex gap-2 mb-2">
                    <ColorPicker
                      color={newGame.centerNumberColor || "#000000"}
                      onChange={(color) => setNewGame({ ...newGame, centerNumberColor: color })}
                      label="Text"
                    />
                    <ColorPicker
                      color={newGame.centerNumberBgColor || "#f3f4f6"}
                      onChange={(color) => setNewGame({ ...newGame, centerNumberBgColor: color })}
                      label="BG"
                    />
                  </div>
                  <div 
                    className="mt-2 p-2 rounded-lg text-center text-lg font-mono font-black transition-all"
                    style={{ 
                      backgroundColor: newGame.centerNumberBgColor || "#f3f4f6",
                      color: newGame.centerNumberColor || "#000000"
                    }}
                  >
                    Preview: {newGame.centerNumber || "*"}
                  </div>
                </div>

                {/* Right Number Colors */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-mono font-bold text-gray-700 mb-2">Right Number</p>
                  <div className="flex gap-2 mb-2">
                    <ColorPicker
                      color={newGame.rightNumberColor || "#000000"}
                      onChange={(color) => setNewGame({ ...newGame, rightNumberColor: color })}
                      label="Text"
                    />
                    <ColorPicker
                      color={newGame.rightNumberBgColor || "#f3f4f6"}
                      onChange={(color) => setNewGame({ ...newGame, rightNumberBgColor: color })}
                      label="BG"
                    />
                  </div>
                  <div 
                    className="mt-2 p-2 rounded-lg text-center text-sm font-mono font-bold transition-all"
                    style={{ 
                      backgroundColor: newGame.rightNumberBgColor || "#f3f4f6",
                      color: newGame.rightNumberColor || "#000000"
                    }}
                  >
                    Preview: {newGame.rightNumber || "***"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  OPEN TIME
                </label>
                <input
                  type="time"
                  value={newGame.openTime}
                  onChange={(e) => setNewGame({ ...newGame, openTime: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  CLOSE TIME
                </label>
                <input
                  type="time"
                  value={newGame.closeTime}
                  onChange={(e) => setNewGame({ ...newGame, closeTime: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>

            <button
              onClick={handleAddGame}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 font-mono text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
              <Gamepad2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-mono font-bold text-gray-700 mb-2">
              {searchQuery ? "No games match your search" : "No games found"}
            </h3>
            <p className="text-sm font-mono text-gray-500">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Click 'Add New Game' to create your first game"}
            </p>
          </div>
        ) : (
          filteredGames.map((g, index) => {
            const isActive = getGameActiveValue(g);
            const isSpecialDouble = VALID_DOUBLE_DIGIT_CENTER.includes(g.centerNumber);

            return (
              <div key={g.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                {editing === g.id && editData ? (
                  <div className="p-5 space-y-4">
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Left Number</label>
                          <button onClick={resetLeftNumber} className="text-[8px] font-mono text-blue-600">Reset</button>
                        </div>
                        <input
                          value={editData.leftNumber}
                          maxLength={3}
                          onChange={(e) => setEditData({ ...editData, leftNumber: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Center</label>
                          <button onClick={resetCenterNumber} className="text-[8px] font-mono text-blue-600">Reset</button>
                        </div>
                        <input
                          value={editData.centerNumber}
                          maxLength={2}
                          onChange={(e) => setEditData({ ...editData, centerNumber: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Right</label>
                          <button onClick={resetRightNumber} className="text-[8px] font-mono text-blue-600">Reset</button>
                        </div>
                        <input
                          value={editData.rightNumber}
                          maxLength={3}
                          onChange={(e) => setEditData({ ...editData, rightNumber: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Color Pickers for Edit Form */}
                    <div className="border-t border-gray-200 pt-4">
                      <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-3 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        CUSTOMIZE COLORS
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs font-mono font-bold text-gray-700 mb-2">Left Number</p>
                          <div className="flex gap-2 mb-2">
                            <ColorPicker
                              color={editData.leftNumberColor || "#000000"}
                              onChange={(color) => setEditData({ ...editData, leftNumberColor: color })}
                              label="Text"
                            />
                            <ColorPicker
                              color={editData.leftNumberBgColor || "#f3f4f6"}
                              onChange={(color) => setEditData({ ...editData, leftNumberBgColor: color })}
                              label="BG"
                            />
                          </div>
                          <div 
                            className="p-2 rounded-lg text-center text-sm font-mono font-bold"
                            style={{ 
                              backgroundColor: editData.leftNumberBgColor || "#f3f4f6",
                              color: editData.leftNumberColor || "#000000"
                            }}
                          >
                            {editData.leftNumber}
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs font-mono font-bold text-gray-700 mb-2">Center Number</p>
                          <div className="flex gap-2 mb-2">
                            <ColorPicker
                              color={editData.centerNumberColor || "#000000"}
                              onChange={(color) => setEditData({ ...editData, centerNumberColor: color })}
                              label="Text"
                            />
                            <ColorPicker
                              color={editData.centerNumberBgColor || "#f3f4f6"}
                              onChange={(color) => setEditData({ ...editData, centerNumberBgColor: color })}
                              label="BG"
                            />
                          </div>
                          <div 
                            className="p-2 rounded-lg text-center text-lg font-mono font-black"
                            style={{ 
                              backgroundColor: editData.centerNumberBgColor || "#f3f4f6",
                              color: editData.centerNumberColor || "#000000"
                            }}
                          >
                            {editData.centerNumber}
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs font-mono font-bold text-gray-700 mb-2">Right Number</p>
                          <div className="flex gap-2 mb-2">
                            <ColorPicker
                              color={editData.rightNumberColor || "#000000"}
                              onChange={(color) => setEditData({ ...editData, rightNumberColor: color })}
                              label="Text"
                            />
                            <ColorPicker
                              color={editData.rightNumberBgColor || "#f3f4f6"}
                              onChange={(color) => setEditData({ ...editData, rightNumberBgColor: color })}
                              label="BG"
                            />
                          </div>
                          <div 
                            className="p-2 rounded-lg text-center text-sm font-mono font-bold"
                            style={{ 
                              backgroundColor: editData.rightNumberBgColor || "#f3f4f6",
                              color: editData.rightNumberColor || "#000000"
                            }}
                          >
                            {editData.rightNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono font-bold text-gray-600">Open Time</label>
                        <input
                          type="time"
                          value={editData.openTime}
                          onChange={(e) => setEditData({ ...editData, openTime: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono font-bold text-gray-600">Close Time</label>
                        <input
                          type="time"
                          value={editData.closeTime}
                          onChange={(e) => setEditData({ ...editData, closeTime: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={resetAllNumbers}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 font-mono text-xs font-bold rounded-lg transition-all border border-gray-300"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Reset All
                      </button>
                      <button
                        onClick={saveEdit}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-mono text-xs font-bold rounded-lg transition-all"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-300 text-gray-600 py-2.5 font-mono text-xs font-bold rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all"
                      >
                        <Undo2 className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                            <span className="text-xs font-mono font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <h3 className="font-mono font-bold text-lg text-gray-900">{g.name}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {isActive ? "● Active" : "● Inactive"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 rounded-lg">
                            <span 
                              className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all"
                              style={{ 
                                backgroundColor: g.leftNumberBgColor || "#f3f4f6",
                                color: g.leftNumberColor || "#000000"
                              }}
                            >
                              {g.leftNumber}
                            </span>
                            <span 
                              className="text-lg font-mono font-black px-3 py-1.5 rounded-lg transition-all"
                              style={{ 
                                backgroundColor: g.centerNumberBgColor || (isSpecialDouble ? "#fee2e2" : "#f3f4f6"),
                                color: g.centerNumberColor || (isSpecialDouble ? "#dc2626" : "#000000")
                              }}
                            >
                              {g.centerNumber}
                            </span>
                            <span 
                              className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all"
                              style={{ 
                                backgroundColor: g.rightNumberBgColor || "#f3f4f6",
                                color: g.rightNumberColor || "#000000"
                              }}
                            >
                              {g.rightNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                            <Clock className="w-3 h-3" />
                            {g.openTime} – {g.closeTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleGameStatus(g.id)}
                          className={`p-2 rounded-lg transition-all ${isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                          title={isActive ? "Deactivate Game" : "Activate Game"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEdit(g)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Game"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(g.id, g.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Game"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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