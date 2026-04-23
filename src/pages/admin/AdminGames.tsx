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

const VALID_DOUBLE_DIGIT_CENTER: string[] = ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20","01","02","03","04","05","06","07","08","09",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
  "51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
  "61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
  "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
  "81", "82", "83", "84", "85", "86", "87", "88", "89", "90",
  "91", "92", "93", "94", "95", "96", "97", "98", "99","00"];

// Helper: convert "HH:MM" to "h:MM AM/PM" (12-hour format)
const formatTime12Hour = (timeStr: string): string => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Helper: check if current time >= timeStr (ignores date, just time-of-day)
const isTimeReachedOrPassed = (timeStr: string): boolean => {
  const now = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  const timeDate = new Date();
  timeDate.setHours(hours, minutes, 0, 0);
  return now >= timeDate;
};

// For a given close time, determine if admin is allowed to declare close result
// Allowed if close time has passed OR (it's next morning before 9:30 AM and close time was yesterday)
const isCloseResultAllowed = (closeTimeStr: string): boolean => {
  if (isTimeReachedOrPassed(closeTimeStr)) return true;
  
  const now = new Date();
  const [closeHours] = closeTimeStr.split(":").map(Number);
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();
  
  if (nowHours < 9 || (nowHours === 9 && nowMinutes <= 30)) {
    if (closeHours >= 20 || closeHours <= 5) {
      return true;
    }
  }
  return false;
};

const stripNonDigits = (value: string): string => value.replace(/[^0-9]/g, "");

const ValidNumbersList = () => { return null; };
const CenterNumbersList = () => { return null; };

const AdminGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const [newGame, setNewGame] = useState<any>({
    name: "",
    leftNumber: "***",
    openCenter: "",
    closeCenter: "",
    rightNumber: "***",
    openTime: "00:00",
    closeTime: "00:00",
    active: true,
  });

  const { toast } = useToast();
  const initialLoadRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getGameActiveValue = (game: Game): boolean => typeof game.active === "boolean" ? game.active : false;

  const isOpenTimeReached = (openTime: string) => isTimeReachedOrPassed(openTime);
  const isCloseResultAllowedForGame = (closeTime: string) => isCloseResultAllowed(closeTime);

  const combineCenter = (open: string, close: string): string => {
    if (open === "*") return "*";
    if (!open) return "*";
    if (close && close.length > 0) return open + close;
    return open;
  };

  const splitCenter = (center: string): { open: string; close: string } => {
    if (center === "*") return { open: "", close: "" };
    if (!center) return { open: "", close: "" };
    if (center.length === 1) return { open: center, close: "" };
    return { open: center[0], close: center[1] };
  };

  const loadGames = useCallback(async (showRefreshToast = false) => {
    if (isFetchingRef.current) return;
    if (initialLoadRef.current && !showRefreshToast) return;
    try {
      isFetchingRef.current = true;
      if (!showRefreshToast) setLoading(true);
      else setRefreshing(true);
      const updatedGames = await getGames();
      setGames(updatedGames);
      initialLoadRef.current = true;
      if (showRefreshToast) toast({ title: "Refreshed", description: `Loaded ${updatedGames.length} games` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to load games.", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [toast]);

  useEffect(() => { loadGames(); }, [loadGames]);

  const handleRefresh = () => loadGames(true);

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" ? true : selectedFilter === "active" ? getGameActiveValue(game) : !getGameActiveValue(game);
    return matchesSearch && matchesFilter;
  });

  const validateCenterCombination = (open: string, close: string): { isValid: boolean; isSpecialDouble: boolean } => {
    const combined = combineCenter(open, close);
    if (combined === "*") return { isValid: true, isSpecialDouble: false };
    if (combined.length === 1) {
      if (/^\d$/.test(combined)) return { isValid: true, isSpecialDouble: false };
      return { isValid: false, isSpecialDouble: false };
    }
    if (combined.length === 2) {
      if (VALID_DOUBLE_DIGIT_CENTER.includes(combined)) return { isValid: true, isSpecialDouble: true };
      return { isValid: false, isSpecialDouble: false };
    }
    return { isValid: false, isSpecialDouble: false };
  };

  // Helper: check if open result has been declared (leftNumber not *** and openCenter not empty)
  const isOpenResultDeclared = (data: any): boolean => {
    return data.leftNumber !== "***" && data.openCenter !== undefined && data.openCenter !== "";
  };

  const startEdit = (g: Game) => {
    const { open, close } = splitCenter(g.centerNumber);
    setEditing(g.id);
    setEditData({
      ...g,
      active: getGameActiveValue(g),
      openCenter: open,
      closeCenter: close,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData(null);
  };

  const resetLeftNumber = () => { if (editData) setEditData({ ...editData, leftNumber: "***" }); };
  const resetOpenCenter = () => { if (editData) setEditData({ ...editData, openCenter: "" }); };
  const resetCloseCenter = () => { if (editData) setEditData({ ...editData, closeCenter: "" }); };
  const resetRightNumber = () => { if (editData) setEditData({ ...editData, rightNumber: "***" }); };
  
  const resetAllNumbers = () => {
    if (editData) {
      setEditData({
        ...editData,
        leftNumber: "***",
        openCenter: "",
        closeCenter: "",
        rightNumber: "***",
      });
      toast({ title: "Reset", description: "All numbers have been reset to default values." });
    }
  };

  const saveEdit = async () => {
    if (!editData) return;

    // ✅ RESET DETECTION
    const isResetAction =
      editData.leftNumber === "***" &&
      editData.openCenter === "" &&
      editData.closeCenter === "" &&
      editData.rightNumber === "***";

    const originalGame = games.find(g => g.id === editData.id);
    if (!originalGame) {
      toast({ title: "Error", description: "Original game not found.", variant: "destructive" });
      return;
    }

    const originalCenterSplit = splitCenter(originalGame.centerNumber);
    const openTimeReached = isOpenTimeReached(editData.openTime);
    const closeResultAllowed = isCloseResultAllowedForGame(editData.closeTime);

    // Detect changes
    const leftChanged = editData.leftNumber !== originalGame.leftNumber;
    const openCenterChanged = editData.openCenter !== originalCenterSplit.open;
    const closeCenterChanged = editData.closeCenter !== originalCenterSplit.close;
    const rightChanged = editData.rightNumber !== originalGame.rightNumber;

    // =====================================================
    // NEW: BLOCK DECLARING BOTH OPEN AND CLOSE IN ONE SAVE
    // =====================================================
    const originalOpenResultDeclared = isOpenResultDeclared(originalGame);
    const currentOpenResultDeclared = isOpenResultDeclared(editData);
    const closeResultChanged = closeCenterChanged || rightChanged;

    // If the game did NOT have an open result before editing,
    // and we are now trying to set both open result AND close result in this same save → block
    if (!originalOpenResultDeclared && currentOpenResultDeclared && closeResultChanged) {
      toast({
        title: "Invalid Action",
        description: "You must save the open result first before declaring the close result.",
        variant: "destructive"
      });
      return;
    }

    // =========================
    // 🚫 SKIP VALIDATION IF RESET
    // =========================
    if (!isResetAction) {

      // OPEN VALIDATION
      if (leftChanged && editData.leftNumber !== "***" && !openTimeReached) {
        toast({
          title: "Cannot Declare Open Number Yet",
          description: `Open number can only be declared after ${formatTime12Hour(editData.openTime)}.`,
          variant: "destructive"
        });
        return;
      }

      if (openCenterChanged && editData.openCenter && !openTimeReached) {
        toast({
          title: "Cannot Set Open Center Yet",
          description: `Open center can only be set after ${formatTime12Hour(editData.openTime)}.`,
          variant: "destructive"
        });
        return;
      }

      // CLOSE VALIDATION (only if close result is being changed)
      if (closeResultChanged && !closeResultAllowed) {
        toast({
          title: "Cannot Declare Close Result Yet",
          description: `Close result can only be declared after ${formatTime12Hour(editData.closeTime)} (or next morning before 9:30 AM).`,
          variant: "destructive"
        });
        return;
      }

      // Format validations
      if (leftChanged && !isValidGameNumber(editData.leftNumber, "left") && editData.leftNumber !== "***") {
        toast({
          title: "Invalid Left Number",
          description: getValidationErrorMessage(editData.leftNumber, "left"),
          variant: "destructive"
        });
        return;
      }

      if (rightChanged && !isValidGameNumber(editData.rightNumber, "right") && editData.rightNumber !== "***") {
        toast({
          title: "Invalid Right Number",
          description: getValidationErrorMessage(editData.rightNumber, "right"),
          variant: "destructive"
        });
        return;
      }

      if (
        (openCenterChanged || closeCenterChanged) &&
        (editData.openCenter || editData.closeCenter) &&
        !validateCenterCombination(editData.openCenter, editData.closeCenter).isValid
      ) {
        toast({
          title: "Invalid Center Number",
          description: "Invalid center combination",
          variant: "destructive"
        });
        return;
      }
    }

    const combinedCenter = combineCenter(editData.openCenter, editData.closeCenter);

    try {
      await updateGame(editData.id, {
        name: editData.name.trim(),
        leftNumber: editData.leftNumber,
        centerNumber: combinedCenter,
        rightNumber: editData.rightNumber,
        openTime: editData.openTime,
        closeTime: editData.closeTime,
        active: getGameActiveValue(editData),
      });

      await loadGames(true);
      setEditing(null);
      setEditData(null);

      if (isResetAction) {
        toast({ title: "Game Reset", description: "Old result cleared successfully." });
      } else {
        toast({ title: "Game Updated", description: `${editData.name} updated successfully.` });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update game.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGame = async (gameId: number, gameName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${gameName}?`)) return;
    try {
      await deleteGame(gameId);
      await loadGames(true);
      toast({ title: "Game Deleted", description: `${gameName} has been removed.` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete game.", variant: "destructive" });
    }
  };

  const handleAddGame = async () => {
    if (!newGame.name?.trim()) {
      toast({ title: "Error", description: "Game name is required.", variant: "destructive" });
      return;
    }
    if (!isValidGameNumber(newGame.leftNumber, "left") && newGame.leftNumber !== "***") {
      toast({ title: "Invalid Left Number", description: getValidationErrorMessage(newGame.leftNumber, "left") || "Invalid left number.", variant: "destructive" });
      return;
    }
    if (!isValidGameNumber(newGame.rightNumber, "right") && newGame.rightNumber !== "***") {
      toast({ title: "Invalid Right Number", description: getValidationErrorMessage(newGame.rightNumber, "right") || "Invalid right number.", variant: "destructive" });
      return;
    }
    const centerValidation = validateCenterCombination(newGame.openCenter, newGame.closeCenter);
    if (!centerValidation.isValid && (newGame.openCenter || newGame.closeCenter)) {
      toast({ title: "Invalid Center Number", description: `Open Center must be a single digit (0-9) and Close Center a single digit (0-9) forming a valid double digit or single digit.`, variant: "destructive" });
      return;
    }
    const combinedCenter = combineCenter(newGame.openCenter, newGame.closeCenter);

    try {
      await createGame({
        name: newGame.name.trim(),
        leftNumber: newGame.leftNumber,
        centerNumber: combinedCenter,
        rightNumber: newGame.rightNumber,
        openTime: newGame.openTime,
        closeTime: newGame.closeTime,
        active: true,
      });
      await loadGames(true);
      setNewGame({
        name: "",
        leftNumber: "***",
        openCenter: "",
        closeCenter: "",
        rightNumber: "***",
        openTime: "00:00",
        closeTime: "00:00",
        active: true,
      });
      setShowAddForm(false);
      toast({ title: "Game Added", description: "Game has been added successfully." });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to add game.", variant: "destructive" });
    }
  };

  const handleToggleGameStatus = async (gameId: number) => {
    try {
      const updatedGame = await toggleGameStatus(gameId);
      await loadGames(true);
      toast({ title: updatedGame.active ? "Game Activated" : "Game Deactivated", description: `${updatedGame.name} is now ${updatedGame.active ? "active" : "inactive"}.` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to toggle game status.", variant: "destructive" });
    }
  };

  const stats = {
    total: games.length,
    active: games.filter(g => getGameActiveValue(g)).length,
    inactive: games.filter(g => !getGameActiveValue(g)).length,
  };

  if (loading && games.length === 0) return <div>Loading...</div>;

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
            <div><p className="text-xs font-mono opacity-80">Total Games</p><p className="text-3xl font-mono font-black mt-1">{stats.total}</p></div>
            <div className="bg-white/20 p-3 rounded-xl"><Gamepad2 className="w-6 h-6" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-mono opacity-80">Active Games</p><p className="text-3xl font-mono font-black mt-1">{stats.active}</p></div>
            <div className="bg-white/20 p-3 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-mono opacity-80">Inactive Games</p><p className="text-3xl font-mono font-black mt-1">{stats.inactive}</p></div>
            <div className="bg-white/20 p-3 rounded-xl"><X className="w-6 h-6" /></div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search games by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 pl-12 pr-4 py-3.5 text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200" />
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value as any)} className="bg-gray-50 border-2 border-gray-200 px-5 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200">
              <option value="all">All Games</option><option value="active">Active Only</option><option value="inactive">Inactive Only</option>
            </select>
            <button onClick={handleRefresh} disabled={refreshing} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm font-bold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
          <button onClick={() => { setShowAddForm(!showAddForm); if (!showAddForm) setNewGame({ name: "", leftNumber: "***", openCenter: "", closeCenter: "", rightNumber: "***", openTime: "00:00", closeTime: "00:00", active: true }); }} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm font-bold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg">
            <Plus className="w-4 h-4" /> {showAddForm ? "Cancel" : "Add New Game"}
          </button>
        </div>
      </div>

      <ValidNumbersList />
      <CenterNumbersList />

      {/* Add Game Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl"><Plus className="w-5 h-5 text-white" /></div>
            <h3 className="font-mono font-bold text-lg text-gray-900">Add New Game</h3>
          </div>
          <div className="space-y-4">
            <div><label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">GAME NAME</label><input type="text" value={newGame.name} onChange={(e) => setNewGame({ ...newGame, name: e.target.value })} placeholder="Enter game name" className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div><label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">LEFT NUMBER</label><input value={newGame.leftNumber === "***" ? "" : newGame.leftNumber} onChange={(e) => { const cleaned = stripNonDigits(e.target.value); setNewGame({ ...newGame, leftNumber: cleaned || "***" }); }} placeholder="Left (e.g., 128)" maxLength={3} className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl" /><p className="text-[8px] font-mono text-gray-400 mt-1">Numbers only (0-9)</p></div>
              <div><label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">OPEN CENTER</label><input value={newGame.openCenter} onChange={(e) => { const val = stripNonDigits(e.target.value).slice(0,1); setNewGame({ ...newGame, openCenter: val }); }} placeholder="0-9" maxLength={1} className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl" /><p className="text-[8px] font-mono text-gray-400 mt-1">Single digit (0-9)</p></div>
              <div><label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">CLOSE CENTER</label><input value={newGame.closeCenter} onChange={(e) => { const val = stripNonDigits(e.target.value).slice(0,1); setNewGame({ ...newGame, closeCenter: val }); }} placeholder="0-9 (optional)" maxLength={1} className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl" /><p className="text-[8px] font-mono text-gray-400 mt-1">Single digit (0-9) for double-digit center</p></div>
              <div><label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2">RIGHT NUMBER</label><input value={newGame.rightNumber === "***" ? "" : newGame.rightNumber} onChange={(e) => { const cleaned = stripNonDigits(e.target.value); setNewGame({ ...newGame, rightNumber: cleaned || "***" }); }} placeholder="Right (e.g., 129)" maxLength={3} className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-xl" /><p className="text-[8px] font-mono text-gray-400 mt-1">Numbers only (0-9)</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2 flex items-center gap-1"><Play className="w-3 h-3" />OPEN TIME</label><input type="time" value={newGame.openTime} onChange={(e) => setNewGame({ ...newGame, openTime: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl" /></div>
              <div><label className="text-xs font-mono font-bold text-gray-700 tracking-wider block mb-2 flex items-center gap-1"><StopCircle className="w-3 h-3" />CLOSE TIME</label><input type="time" value={newGame.closeTime} onChange={(e) => setNewGame({ ...newGame, closeTime: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl" /></div>
            </div>
            <button onClick={handleAddGame} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 font-mono text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"><Plus className="w-4 h-4" /> Add Game</button>
          </div>
        </div>
      )}

      {/* Games List */}
      <div className="space-y-3">
        {filteredGames.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">No games found</div>
        ) : (
          filteredGames.map((g, index) => {
            const isActive = getGameActiveValue(g);
            const { open, close } = splitCenter(g.centerNumber);
            const isSpecialDouble = VALID_DOUBLE_DIGIT_CENTER.includes(g.centerNumber);
            const openTimeReached = isOpenTimeReached(g.openTime);
            const closeResultAllowed = isCloseResultAllowedForGame(g.closeTime);
            // Determine if the game already has an open result declared
            const hasOpenResult = isOpenResultDeclared(g);

            return (
              <div key={g.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                {editing === g.id && editData ? (
                  <div className="p-5 space-y-4">
                    <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Left Number */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Left Number</label>
                          {!openTimeReached && editData.leftNumber !== "***" && (
                            <span className="text-[8px] font-mono text-orange-500 flex items-center gap-0.5">
                              <Timer className="w-2.5 h-2.5" /> Wait until {formatTime12Hour(editData.openTime)}
                            </span>
                          )}
                          <button onClick={resetLeftNumber} className="text-[8px] font-mono text-blue-600 hover:underline">Reset</button>
                        </div>
                        <input 
                          value={editData.leftNumber === "***" ? "" : editData.leftNumber} 
                          maxLength={3} 
                          onChange={(e) => { const cleaned = stripNonDigits(e.target.value); setEditData({ ...editData, leftNumber: cleaned || "***" }); }} 
                          disabled={!openTimeReached} 
                          className={`w-full bg-gray-50 border-2 px-3 py-2.5 text-sm font-mono font-semibold text-center focus:outline-none focus:border-blue-500 rounded-lg transition-all ${!openTimeReached && editData.leftNumber !== "***" ? "border-orange-200 bg-orange-50 text-gray-500 cursor-not-allowed" : "border-gray-200"}`} 
                        />
                        {!openTimeReached && editData.leftNumber !== "***" && <p className="text-[8px] font-mono text-orange-500 mt-1">Can declare only after {formatTime12Hour(editData.openTime)}</p>}
                        {openTimeReached && editData.leftNumber === "***" && <p className="text-[8px] font-mono text-green-600 mt-1">Ready to declare open number</p>}
                      </div>
                      {/* Open Center */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Open Center</label>
                          <button onClick={resetOpenCenter} className="text-[8px] font-mono text-blue-600 hover:underline">Reset</button>
                        </div>
                        <input 
                          value={editData.openCenter} 
                          maxLength={1} 
                          onChange={(e) => { const val = stripNonDigits(e.target.value).slice(0,1); setEditData({ ...editData, openCenter: val }); }} 
                          disabled={!openTimeReached} 
                          className={`w-full bg-gray-50 border-2 px-3 py-2.5 text-sm font-mono font-semibold text-center focus:outline-none focus:border-blue-500 rounded-lg transition-all ${!openTimeReached ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-200"}`} 
                        />
                        {!openTimeReached && <p className="text-[8px] font-mono text-orange-500 mt-1">Can set only after {formatTime12Hour(editData.openTime)}</p>}
                      </div>
                      {/* Close Center - disabled until open result is saved (i.e., original game already has open result) */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Close Center</label>
                          <button onClick={resetCloseCenter} className="text-[8px] font-mono text-blue-600 hover:underline">Reset</button>
                        </div>
                        <input 
                          value={editData.closeCenter} 
                          maxLength={1} 
                          onChange={(e) => { const val = stripNonDigits(e.target.value).slice(0,1); setEditData({ ...editData, closeCenter: val }); }} 
                          // CLOSE FIELDS ARE DISABLED IF:
                          // 1. close result not allowed by time, OR
                          // 2. the game does NOT already have an open result saved.
                          disabled={!closeResultAllowed || !hasOpenResult} 
                          className={`w-full bg-gray-50 border-2 px-3 py-2.5 text-sm font-mono font-semibold text-center focus:outline-none focus:border-blue-500 rounded-lg transition-all ${(!closeResultAllowed || !hasOpenResult) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-200"}`} 
                        />
                        {!closeResultAllowed && <p className="text-[8px] font-mono text-orange-500 mt-1">Can set only after {formatTime12Hour(editData.closeTime)} (or next morning before 9:30 AM)</p>}
                        {closeResultAllowed && !hasOpenResult && <p className="text-[8px] font-mono text-red-500 mt-1">Open result must be saved first</p>}
                        {closeResultAllowed && hasOpenResult && !editData.closeCenter && <p className="text-[8px] font-mono text-green-600 mt-1">Ready to set close center</p>}
                      </div>
                      {/* Right Number - disabled until open result is saved */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-mono font-bold text-gray-600">Right Number</label>
                          {!closeResultAllowed && editData.rightNumber !== "***" && (
                            <span className="text-[8px] font-mono text-orange-500 flex items-center gap-0.5">
                              <Timer className="w-2.5 h-2.5" /> Wait until {formatTime12Hour(editData.closeTime)}
                            </span>
                          )}
                          <button onClick={resetRightNumber} className="text-[8px] font-mono text-blue-600 hover:underline">Reset</button>
                        </div>
                        <input 
                          value={editData.rightNumber === "***" ? "" : editData.rightNumber} 
                          maxLength={3} 
                          onChange={(e) => { const cleaned = stripNonDigits(e.target.value); setEditData({ ...editData, rightNumber: cleaned || "***" }); }} 
                          disabled={!closeResultAllowed || !hasOpenResult} 
                          className={`w-full bg-gray-50 border-2 px-3 py-2.5 text-sm font-mono font-semibold text-center focus:outline-none focus:border-blue-500 rounded-lg transition-all ${(!closeResultAllowed || !hasOpenResult) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-200"}`} 
                        />
                        {!closeResultAllowed && editData.rightNumber !== "***" && <p className="text-[8px] font-mono text-orange-500 mt-1">Can declare only after {formatTime12Hour(editData.closeTime)}</p>}
                        {closeResultAllowed && !hasOpenResult && <p className="text-[8px] font-mono text-red-500 mt-1">Open result must be saved first</p>}
                        {closeResultAllowed && hasOpenResult && editData.rightNumber === "***" && <p className="text-[8px] font-mono text-green-600 mt-1">Ready to declare close number</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="text-[10px] font-mono font-bold text-gray-600">Open Time</label><input type="time" value={editData.openTime} onChange={(e) => setEditData({ ...editData, openTime: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg" /></div>
                      <div><label className="text-[10px] font-mono font-bold text-gray-600">Close Time</label><input type="time" value={editData.closeTime} onChange={(e) => setEditData({ ...editData, closeTime: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2.5 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg" /></div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={cancelEdit} className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-300 text-gray-600 py-2.5 font-mono text-xs font-bold rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all"><Undo2 className="w-3.5 h-3.5" /> Cancel</button>
                      <button onClick={resetAllNumbers} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 font-mono text-xs font-bold rounded-lg transition-all border border-gray-300"><RefreshCw className="w-3.5 h-3.5" /> Reset All</button>
                      <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-mono text-xs font-bold rounded-lg transition-all"><Save className="w-3.5 h-3.5" /> Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center"><span className="text-xs font-mono font-bold text-blue-600">#{index + 1}</span></div>
                          <h3 className="font-mono font-bold text-lg text-gray-900">{g.name}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{isActive ? "● Active" : "● Inactive"}</span>
                          {!openTimeReached && g.leftNumber !== "***" && <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-orange-100 text-orange-700 flex items-center gap-1"><Timer className="w-2.5 h-2.5" /> Open at {formatTime12Hour(g.openTime)}</span>}
                          {!closeResultAllowed && g.rightNumber !== "***" && <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-orange-100 text-orange-700 flex items-center gap-1"><Timer className="w-2.5 h-2.5" /> Close at {formatTime12Hour(g.closeTime)}</span>}
                          {openTimeReached && g.leftNumber === "***" && <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-green-100 text-green-700 flex items-center gap-1"><Play className="w-2.5 h-2.5" /> Ready to Declare Open</span>}
                          {closeResultAllowed && g.rightNumber === "***" && hasOpenResult && <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-green-100 text-green-700 flex items-center gap-1"><StopCircle className="w-2.5 h-2.5" /> Ready to Declare Close</span>}
                          {closeResultAllowed && g.rightNumber === "***" && !hasOpenResult && <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-yellow-100 text-yellow-700 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Open result required first</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-2 rounded-lg">
                            <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg ${!openTimeReached && g.leftNumber !== "***" ? "bg-orange-100 text-orange-600" : openTimeReached && g.leftNumber === "***" ? "bg-green-100 text-green-600 animate-pulse" : "bg-gray-100"}`}>{g.leftNumber}</span>
                            <span className={`text-lg font-mono font-black px-3 py-1.5 rounded-lg ${isSpecialDouble ? "bg-red-100 text-red-600" : "bg-gray-100"}`}>{g.centerNumber}</span>
                            <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg ${!closeResultAllowed && g.rightNumber !== "***" ? "bg-orange-100 text-orange-600" : closeResultAllowed && g.rightNumber === "***" && hasOpenResult ? "bg-green-100 text-green-600 animate-pulse" : "bg-gray-100"}`}>{g.rightNumber}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500"><Clock className="w-3 h-3" />{formatTime12Hour(g.openTime)} – {formatTime12Hour(g.closeTime)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleGameStatus(g.id)} className={`p-2 rounded-lg transition-all ${isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`} title={isActive ? "Deactivate Game" : "Activate Game"}><Power className="w-4 h-4" /></button>
                        <button onClick={() => startEdit(g)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Game"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteGame(g.id, g.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Game"><Trash2 className="w-4 h-4" /></button>
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