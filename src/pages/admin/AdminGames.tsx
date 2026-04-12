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
  Timer,
  Lock,
  Unlock,
  Play,
  StopCircle,
} from "lucide-react";

// Valid double-digit center numbers
const VALID_DOUBLE_DIGIT_CENTER: string[] = ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20","01","02","03","04","05","06","07","08","09",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
  "51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
  "61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
  "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
  "81", "82", "83", "84", "85", "86", "87", "88", "89", "90",
  "91", "92", "93", "94", "95", "96", "97", "98", "99","00"];

// Helper function to check if current time is after or equal to given time
const isTimeReachedOrPassed = (timeStr: string): boolean => {
  const now = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  const timeDate = new Date();
  timeDate.setHours(hours, minutes, 0, 0);
  return now >= timeDate;
};

// Helper function to check if current time is before given time
const isTimeBefore = (timeStr: string): boolean => {
  return !isTimeReachedOrPassed(timeStr);
};

// Helper to check if string contains only numbers
const isOnlyNumbers = (value: string): boolean => {
  if (value === "***" || value === "*") return true;
  return /^\d+$/.test(value);
};

// Helper to strip non-digit characters
const stripNonDigits = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};

// Valid Numbers List Component
const ValidNumbersList = () => {
  const [showList, setShowList] = useState<boolean>(false);

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
            {VALID_NUMBERS.map((num: string, index: number) => (
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
  const [showList, setShowList] = useState<boolean>(false);
  const centerNumbers: string[] = getValidCenterNumbers();

  const singleDigits: string[] = centerNumbers.filter((n: string) => n.length === 1 && n !== "*");
  const doubleDigits: string[] = VALID_DOUBLE_DIGIT_CENTER;
  const wildcard: string[] = centerNumbers.filter((n: string) => n === "*");

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
              {singleDigits.map((num: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-center text-xs font-mono font-semibold text-gray-700">
                  {num}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-[8px] font-mono text-gray-500 mb-2">Valid Double Digits:</p>
            <div className="grid grid-cols-6 gap-1.5">
              {doubleDigits.map((num: string, index: number) => (
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
              {wildcard.map((num: string, index: number) => (
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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
  
  const initialLoadRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  // Update current time every second for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGameActiveValue = (game: Game): boolean => {
    return typeof game.active === "boolean"
      ? game.active
      : false;
  };

  // Check if open time has been reached (can declare after this time)
  const isOpenTimeReached = (openTime: string): boolean => {
    return isTimeReachedOrPassed(openTime);
  };

  // Check if close time has been reached (can declare after this time)
  const isCloseTimeReached = (closeTime: string): boolean => {
    return isTimeReachedOrPassed(closeTime);
  };

  // Check if can declare open number (only after open time)
  const canDeclareOpenNumber = (openTime: string): boolean => {
    return isTimeReachedOrPassed(openTime);
  };

  // Check if can declare close number (only after close time)
  const canDeclareCloseNumber = (closeTime: string): boolean => {
    return isTimeReachedOrPassed(closeTime);
  };

  const loadGames = useCallback(async (showRefreshToast: boolean = false) => {
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

  const validateCenterNumber = (centerNum: string): { isValid: boolean; isSpecialDouble: boolean } => {
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

    // Check if can declare open number (only after open time)
    if (editData.leftNumber !== "***" && !canDeclareOpenNumber(editData.openTime)) {
      toast({
        title: "Cannot Declare Open Number Yet",
        description: `Open number can only be declared after ${editData.openTime}. Current time: ${currentTime.toLocaleTimeString()}`,
        variant: "destructive",
      });
      return;
    }

    // Check if can declare close number (only after close time)
    if (editData.rightNumber !== "***" && !canDeclareCloseNumber(editData.closeTime)) {
      toast({
        title: "Cannot Declare Close Number Yet",
        description: `Close number can only be declared after ${editData.closeTime}. Current time: ${currentTime.toLocaleTimeString()}`,
        variant: "destructive",
      });
      return;
    }

    if (!isValidGameNumber(editData.leftNumber, "left") && editData.leftNumber !== "***") {
      const errorMsg = getValidationErrorMessage(editData.leftNumber, "left");
      toast({
        title: "Invalid Left Number",
        description: errorMsg || "Please enter a valid 3-digit number from the list.",
        variant: "destructive",
      });
      return;
    }

    const centerValidation = validateCenterNumber(editData.centerNumber);
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

    const centerValidation = validateCenterNumber(newGame.centerNumber || "*");
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
      {/* Current Time Display */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-mono font-semibold text-gray-700">Current Server Time:</span>
          </div>
          <span className="text-sm font-mono font-bold text-blue-600">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

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
              onChange={(e) => setSelectedFilter(e.target.value as "all" | "active" | "inactive")}
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
                  value={newGame.leftNumber === "***" ? "" : newGame.leftNumber}
                  onChange={(e) => {
                    const cleaned = stripNonDigits(e.target.value);
                    setNewGame({ ...newGame, leftNumber: cleaned || "***" });
                  }}
                  placeholder="Left (e.g., 128)"
                  maxLength={3}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl"
                />
                <p className="text-[8px] font-mono text-gray-400 mt-1">Numbers only (0-9)</p>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">
                  CENTER NUMBER
                </label>
                <input
                  value={newGame.centerNumber === "*" ? "" : newGame.centerNumber}
                  onChange={(e) => {
                    const cleaned = stripNonDigits(e.target.value);
                    setNewGame({ ...newGame, centerNumber: cleaned || "*" });
                  }}
                  placeholder="Center (0-9, or specific double digits)"
                  maxLength={2}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl"
                />
                <p className="text-[8px] font-mono text-gray-400 mt-1">Numbers only (0-9)</p>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">
                  RIGHT NUMBER
                </label>
                <input
                  value={newGame.rightNumber === "***" ? "" : newGame.rightNumber}
                  onChange={(e) => {
                    const cleaned = stripNonDigits(e.target.value);
                    setNewGame({ ...newGame, rightNumber: cleaned || "***" });
                  }}
                  placeholder="Right (e.g., 129)"
                  maxLength={3}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl"
                />
                <p className="text-[8px] font-mono text-gray-400 mt-1">Numbers only (0-9)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2 flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  OPEN TIME (When number can be declared)
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
                  <StopCircle className="w-3 h-3" />
                  CLOSE TIME (When number can be declared)
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
            const openTimeReached = isOpenTimeReached(g.openTime);
            const closeTimeReached = isCloseTimeReached(g.closeTime);

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
                          {!openTimeReached && editData.leftNumber !== "***" && (
                            <span className="text-[8px] font-mono text-orange-500 flex items-center gap-0.5">
                              <Timer className="w-2.5 h-2.5" /> Wait until {editData.openTime}
                            </span>
                          )}
                          {openTimeReached && (
                            <button onClick={resetLeftNumber} className="text-[8px] font-mono text-blue-600">Reset</button>
                          )}
                        </div>
                        <input
                          value={editData.leftNumber === "***" ? "" : editData.leftNumber}
                          maxLength={3}
                          onChange={(e) => {
                            const cleaned = stripNonDigits(e.target.value);
                            setEditData({ ...editData, leftNumber: cleaned || "***" });
                          }}
                          disabled={!openTimeReached}
                          className={`w-full bg-gray-50 border-2 px-3 py-2.5 text-sm font-mono font-semibold text-center focus:outline-none focus:border-blue-500 rounded-lg transition-all ${
                            !openTimeReached && editData.leftNumber !== "***"
                              ? "border-orange-200 bg-orange-50 text-gray-500 cursor-not-allowed" 
                              : "border-gray-200"
                          }`}
                        />
                        {!openTimeReached && editData.leftNumber !== "***" && (
                          <p className="text-[8px] font-mono text-orange-500 mt-1">
                            Can declare only after {editData.openTime}
                          </p>
                        )}
                        {openTimeReached && editData.leftNumber === "***" && (
                          <p className="text-[8px] font-mono text-green-600 mt-1">
                            Ready to declare open number
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Center</label>
                          <button onClick={resetCenterNumber} className="text-[8px] font-mono text-blue-600">Reset</button>
                        </div>
                        <input
                          value={editData.centerNumber === "*" ? "" : editData.centerNumber}
                          maxLength={2}
                          onChange={(e) => {
                            const cleaned = stripNonDigits(e.target.value);
                            setEditData({ ...editData, centerNumber: cleaned || "*" });
                          }}
                          className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Right Number</label>
                          {!closeTimeReached && editData.rightNumber !== "***" && (
                            <span className="text-[8px] font-mono text-orange-500 flex items-center gap-0.5">
                              <Timer className="w-2.5 h-2.5" /> Wait until {editData.closeTime}
                            </span>
                          )}
                          {closeTimeReached && (
                            <button onClick={resetRightNumber} className="text-[8px] font-mono text-blue-600">Reset</button>
                          )}
                        </div>
                        <input
                          value={editData.rightNumber === "***" ? "" : editData.rightNumber}
                          maxLength={3}
                          onChange={(e) => {
                            const cleaned = stripNonDigits(e.target.value);
                            setEditData({ ...editData, rightNumber: cleaned || "***" });
                          }}
                          disabled={!closeTimeReached}
                          className={`w-full bg-gray-50 border-2 px-3 py-2.5 text-sm font-mono font-semibold text-center focus:outline-none focus:border-blue-500 rounded-lg transition-all ${
                            !closeTimeReached && editData.rightNumber !== "***"
                              ? "border-orange-200 bg-orange-50 text-gray-500 cursor-not-allowed" 
                              : "border-gray-200"
                          }`}
                        />
                        {!closeTimeReached && editData.rightNumber !== "***" && (
                          <p className="text-[8px] font-mono text-orange-500 mt-1">
                            Can declare only after {editData.closeTime}
                          </p>
                        )}
                        {closeTimeReached && editData.rightNumber === "***" && (
                          <p className="text-[8px] font-mono text-green-600 mt-1">
                            Ready to declare close number
                          </p>
                        )}
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
                    
                    {/* Button Order: Cancel (Left), Reset (Middle), Save (Right) */}
                    <div className="flex gap-3">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-300 text-gray-600 py-2.5 font-mono text-xs font-bold rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all"
                      >
                        <Undo2 className="w-3.5 h-3.5" /> Cancel
                      </button>
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
                          {!openTimeReached && g.leftNumber !== "***" && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-orange-100 text-orange-700 flex items-center gap-1">
                              <Timer className="w-2.5 h-2.5" /> Open at {g.openTime}
                            </span>
                          )}
                          {!closeTimeReached && g.rightNumber !== "***" && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-orange-100 text-orange-700 flex items-center gap-1">
                              <Timer className="w-2.5 h-2.5" /> Close at {g.closeTime}
                            </span>
                          )}
                          {openTimeReached && g.leftNumber === "***" && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-green-100 text-green-700 flex items-center gap-1">
                              <Play className="w-2.5 h-2.5" /> Ready to Declare Open
                            </span>
                          )}
                          {closeTimeReached && g.rightNumber === "***" && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-green-100 text-green-700 flex items-center gap-1">
                              <StopCircle className="w-2.5 h-2.5" /> Ready to Declare Close
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 rounded-lg">
                            <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg ${!openTimeReached && g.leftNumber !== "***" ? "bg-orange-100 text-orange-600" : openTimeReached && g.leftNumber === "***" ? "bg-green-100 text-green-600 animate-pulse" : "bg-gray-100"}`}>
                              {g.leftNumber}
                            </span>
                            <span className={`text-lg font-mono font-black px-3 py-1.5 rounded-lg ${isSpecialDouble ? "bg-red-100 text-red-600" : "bg-gray-100"}`}>
                              {g.centerNumber}
                            </span>
                            <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg ${!closeTimeReached && g.rightNumber !== "***" ? "bg-orange-100 text-orange-600" : closeTimeReached && g.rightNumber === "***" ? "bg-green-100 text-green-600 animate-pulse" : "bg-gray-100"}`}>
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