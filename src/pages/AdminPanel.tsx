import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Star, LogOut, Users, Gamepad2, FileText, Check, X as XIcon, Plus, Pencil, Save, Undo2, History, Trash2, Trophy, Search, Power } from "lucide-react";
import { getUsers, updateUser, updateUserBalance, addTransaction, getGames, updateGame, getEntries, deleteUser, declareResult, getResults, GAME_TYPE_MULTIPLIERS, User, Game, GameEntry, GameResult } from "@/lib/storage";
import { isValidGameNumber, getValidationErrorMessage, VALID_NUMBERS, getValidCenterNumbers } from "@/lib/validNumbers";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AdminPanel = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"users" | "games" | "entries" | "history" | "results">("users");

  useEffect(() => {
    if (!loading) {
      if (!user) { navigate("/login", { replace: true }); return; }
      if (user.role !== "admin") { navigate("/dashboard", { replace: true }); }
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== "admin") return null;

  const tabs = [
    { id: "users" as const, label: "Users", icon: Users },
    { id: "games" as const, label: "Games", icon: Gamepad2 },
    { id: "entries" as const, label: "Entries", icon: FileText },
    { id: "history" as const, label: "History", icon: History },
    { id: "results" as const, label: "Results", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="surface-card border-t-0 border-x-0 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border-2 border-primary/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-mono font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage users & games</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-1.5 px-3 py-2 border-2 border-destructive/30 text-destructive font-mono text-xs font-semibold hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="flex border-b-2 border-foreground/10 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "users" && <UsersTab />}
        {tab === "games" && <GamesTab />}
        {tab === "entries" && <EntriesTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "results" && <ResultsTab />}
      </div>
    </div>
  );
};

// === USERS TAB ===
const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => { setUsers(getUsers().filter((u) => u.role !== "admin")); }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (u: User, status: "approved" | "rejected") => {
    const updated = { ...u, status };
    updateUser(updated);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    toast({ title: "Updated", description: `${u.name} has been ${status}.` });
  };

  const handleAddBalance = (u: User) => {
    const amount = parseInt(balanceInputs[u.id] || "0");
    if (!amount || amount <= 0) { toast({ title: "Error", description: "Enter a valid amount.", variant: "destructive" }); return; }
    updateUserBalance(u.id, amount);
    addTransaction({ userId: u.id, type: "deposit", amount, description: "Admin deposit" });
    const fresh = { ...u, balance: u.balance + amount };
    setUsers((prev) => prev.map((x) => (x.id === u.id ? fresh : x)));
    setBalanceInputs((prev) => ({ ...prev, [u.id]: "" }));
    toast({ title: "Balance Added", description: `₹${amount} added to ${u.name}'s wallet.` });
  };

  const handleRemoveBalance = (u: User) => {
    const amount = parseInt(balanceInputs[u.id] || "0");

    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    if (amount > u.balance) {
      toast({
        title: "Error",
        description: "User does not have enough balance.",
        variant: "destructive"
      });
      return;
    }

    updateUserBalance(u.id, -amount);

    addTransaction({
      userId: u.id,
      type: "withdraw",
      amount,
      description: "Admin removed balance"
    });

    const fresh = { ...u, balance: u.balance - amount };

    setUsers((prev) => prev.map((x) => (x.id === u.id ? fresh : x)));

    setBalanceInputs((prev) => ({ ...prev, [u.id]: "" }));

    toast({
      title: "Balance Removed",
      description: `₹${amount} removed from ${u.name}`
    });
  };
  
  const handleDelete = (u: User) => {
    deleteUser(u.id);
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    toast({ title: "Deleted", description: `${u.name} has been removed.` });
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "text-success";
    if (s === "rejected") return "text-destructive";
    return "text-primary";
  };

  // Function to mask password for display
  const maskPassword = (password: string) => {
    if (!password) return "—";
    return "•".repeat(Math.min(password.length, 8));
  };

  return (
    <div>
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-foreground/10">
              {["Name", "Phone", "Password", "Balance", "Status", "Actions", "Amount add/Remove", "Delete"].map((h) => (
                <th key={h} className="text-[10px] font-mono text-muted-foreground tracking-wider py-2 px-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b border-foreground/5">

                {/* NAME */}
                <td className="py-3 px-2 text-xs font-mono text-foreground">
                  {u.name}
                </td>

                {/* PHONE */}
                <td className="py-3 px-2 text-xs font-mono text-muted-foreground">
                  {u.phone}
                </td>

                {/* PASSWORD with Eye Toggle */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {showPasswords[u.id] ? (u.password || "—") : maskPassword(u.password || "")}
                    </span>
                    {u.password && (
                      <button
                        onClick={() => togglePasswordVisibility(u.id)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title={showPasswords[u.id] ? "Hide password" : "Show password"}
                      >
                        {showPasswords[u.id] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </td>

                {/* BALANCE */}
                <td className="py-3 px-2 text-xs font-mono text-foreground">
                  ₹{u.balance}
                </td>

                {/* STATUS */}
                <td className={`py-3 px-2 text-xs font-mono font-semibold uppercase ${statusColor(u.status)}`}>
                  {u.status}
                </td>

                {/* ACTIONS */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(u, "approved")}
                      className="text-success hover:opacity-70"
                      title="Approve User"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleStatusChange(u, "rejected")}
                      className="text-destructive hover:opacity-70"
                      title="Reject User"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>

                {/* AMOUNT ADD / REMOVE */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={balanceInputs[u.id] || ""}
                      onChange={(e) =>
                        setBalanceInputs((p) => ({
                          ...p,
                          [u.id]: e.target.value.replace(/\D/g, "")
                        }))
                      }
                      placeholder="₹"
                      className="w-16 bg-input border border-foreground/10 px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-primary/50"
                    />

                    <button
                      onClick={() => handleAddBalance(u)}
                      className="text-success hover:opacity-70"
                      title="Add Balance"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRemoveBalance(u)}
                      className="text-destructive hover:opacity-70"
                      title="Remove Balance"
                    >
                      <span className="text-lg font-bold">−</span>
                    </button>
                  </div>
                </td>

                {/* DELETE */}
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => handleDelete(u)}
                    className="text-destructive hover:opacity-70"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">
            {searchQuery ? "No users match your search" : "No users found"}
          </p>
        )}
      </div>
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
  
  // Split into single digits, double digits, and wildcard for better display
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

// === GAMES TAB (UPDATED with 2-digit center number support) ===
const GamesTab = () => {
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

  // Load games on mount
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
    
    // Validate left number
    if (!isValidGameNumber(editData.leftNumber, "left")) {
      const errorMsg = getValidationErrorMessage(editData.leftNumber, "left");
      toast({ 
        title: "Invalid Left Number", 
        description: errorMsg || "Please enter a valid 3-digit number from the list.", 
        variant: "destructive" 
      });
      return;
    }

    // Validate center number
    if (!isValidGameNumber(editData.centerNumber, "center")) {
      toast({ 
        title: "Invalid Center Number", 
        description: "Center number must be a single digit (0-9), double digit (10-99), or *", 
        variant: "destructive" 
      });
      return;
    }

    // Validate right number
    if (!isValidGameNumber(editData.rightNumber, "right")) {
      const errorMsg = getValidationErrorMessage(editData.rightNumber, "right");
      toast({ 
        title: "Invalid Right Number", 
        description: errorMsg || "Please enter a valid 3-digit number from the list.", 
        variant: "destructive" 
      });
      return;
    }
    
    // Update game in storage
    updateGame(editData);
    
    // Reload games from storage to ensure consistency
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
      // Get all games from storage
      const allGames = getGames();
      
      // Filter out the game to delete
      const updatedGames = allGames.filter(g => g.id !== gameId);
      
      // Update localStorage
      localStorage.setItem("star_games", JSON.stringify(updatedGames));
      
      // Update state
      setGames(updatedGames);
      
      toast({ 
        title: "Game Deleted", 
        description: `${gameName} has been removed.` 
      });
    }
  };

  const handleAddGame = () => {
    // Validate required fields
    if (!newGame.name?.trim()) {
      toast({ 
        title: "Error", 
        description: "Game name is required.", 
        variant: "destructive" 
      });
      return;
    }

    // Validate left number
    if (!isValidGameNumber(newGame.leftNumber || "***", "left")) {
      const errorMsg = getValidationErrorMessage(newGame.leftNumber || "***", "left");
      toast({ 
        title: "Invalid Left Number", 
        description: errorMsg || "Please enter a valid 3-digit number from the list.", 
        variant: "destructive" 
      });
      return;
    }

    // Validate center number
    if (!isValidGameNumber(newGame.centerNumber || "*", "center")) {
      toast({ 
        title: "Invalid Center Number", 
        description: "Center number must be a single digit (0-9), double digit (10-99), or *", 
        variant: "destructive" 
      });
      return;
    }

    // Validate right number
    if (!isValidGameNumber(newGame.rightNumber || "***", "right")) {
      const errorMsg = getValidationErrorMessage(newGame.rightNumber || "***", "right");
      toast({ 
        title: "Invalid Right Number", 
        description: errorMsg || "Please enter a valid 3-digit number from the list.", 
        variant: "destructive" 
      });
      return;
    }

    // Create new game with unique ID
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

    // Get existing games
    const allGames = getGames();
    
    // Add new game to array
    const updatedGames = [...allGames, gameToAdd];
    
    // Update localStorage
    localStorage.setItem("star_games", JSON.stringify(updatedGames));

    // Update state
    setGames(updatedGames);

    // Reset form and close it
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

  // Function to toggle game active status
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
            {/* Game Name */}
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

            {/* Numbers */}
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

            {/* Times */}
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

            {/* Add Button */}
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
          filteredGames.map((g) => (
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
                    {/* Toggle Active Status */}
                    <button 
                      onClick={() => toggleGameStatus(g.id)} 
                      className={`hover:opacity-70 ${g.isActive ? 'text-success' : 'text-muted-foreground'}`}
                      title={g.isActive ? "Deactivate Game" : "Activate Game"}
                    >
                      <Power className={`w-4 h-4 ${g.isActive ? 'text-success' : 'text-muted-foreground'}`} />
                    </button>
                    {/* Edit Button */}
                    <button 
                      onClick={() => startEdit(g)} 
                      className="text-primary hover:opacity-70"
                      title="Edit Game"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {/* Delete Button */}
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

// === ENTRIES TAB (with null checks) ===
const EntriesTab = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { 
    setEntries(getEntries()); 
  }, []);

  const filteredEntries = entries.filter(entry => {
    // Add null checks for all fields
    const playerName = entry.playerName || "";
    const gameName = entry.gameName || "";
    const gameType = entry.gameType || "";
    
    return playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           gameType.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const grouped: Record<string, GameEntry[]> = {};
  filteredEntries.forEach((e) => {
    if (!grouped[e.gameType]) grouped[e.gameType] = [];
    grouped[e.gameType].push(e);
  });

  const getNumberGroups = (items: GameEntry[]) => {
    const byNum: Record<string, { entries: GameEntry[]; total: number }> = {};
    items.forEach((e) => {
      if (!byNum[e.number]) byNum[e.number] = { entries: [], total: 0 };
      byNum[e.number].entries.push(e);
      byNum[e.number].total += e.amount;
    });
    return Object.entries(byNum).sort((a, b) => b[1].total - a[1].total);
  };

  return (
    <div>
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search by player name, game, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
        />
      </div>
      
      <div>
        {Object.keys(grouped).length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">
            {searchQuery ? "No entries match your search" : "No entries found"}
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {Object.entries(grouped).map(([type, items]) => (
              <AccordionItem key={type} value={type} className="surface-card border-2 border-foreground/10">
                <AccordionTrigger className="px-4 py-3 font-mono text-sm font-semibold text-foreground hover:no-underline">
                  {type} <span className="text-xs text-muted-foreground ml-2">({items.length} entries)</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {getNumberGroups(items).map(([num, data]) => (
                      <div key={num} className="surface-raised p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-primary text-lg">{num}</span>
                          <div className="text-right">
                            <p className="text-[10px] font-mono text-muted-foreground">{data.entries.length} entries</p>
                            <p className="text-xs font-mono font-semibold text-foreground">Total: ₹{data.total}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {data.entries.map((e) => (
                            <span key={e.id} className="text-[10px] font-mono text-muted-foreground bg-accent px-2 py-0.5 border border-foreground/5">
                              {e.playerName || "Unknown"}: ₹{e.amount}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

// === HISTORY TAB (with null checks) ===
// === HISTORY TAB (shows Player Name and Added By) ===
const HistoryTab = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");

  useEffect(() => {
    const allEntries = getEntries().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setEntries(allEntries);
    setUsers(getUsers());
  }, []);

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  // Get unique player names from entries (with null check)
  const uniquePlayers = Array.from(new Set(
    entries
      .map(e => e.playerName)
      .filter(name => name && name.trim() !== "")
  )).sort();

  const filteredEntries = entries.filter(entry => {
    const playerName = entry.playerName || "";
    const addedBy = getUserName(entry.userId) || "";
    const gameName = entry.gameName || "";
    const gameType = entry.gameType || "";
    
    const matchesSearch = playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           addedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
           gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           gameType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlayer = selectedPlayer === "all" || entry.playerName === selectedPlayer;
    
    return matchesSearch && matchesPlayer;
  });

  const groupedByPlayer: Record<string, GameEntry[]> = {};
  filteredEntries.forEach((e) => {
    const playerKey = e.playerName || "Unknown Player";
    if (!groupedByPlayer[playerKey]) groupedByPlayer[playerKey] = [];
    groupedByPlayer[playerKey].push(e);
  });

  return (
    <div>
      <div className="mb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search by player name, added by, game, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Player Filter Dropdown */}
        {uniquePlayers.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-mono text-muted-foreground">FILTER BY PLAYER:</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="bg-input border-2 border-foreground/10 px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Players</option>
              {uniquePlayers.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div>
        {filteredEntries.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">
            {searchQuery ? "No history matches your search" : "No betting history found"}
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {Object.entries(groupedByPlayer).map(([playerName, playerEntries]) => {
              const totalBet = playerEntries.reduce((s, e) => s + e.amount, 0);
              const totalWon = playerEntries
                .filter(e => e.result === "won")
                .reduce((s, e) => s + (e.winAmount || 0), 0);
              
              return (
                <AccordionItem key={playerName} value={playerName} className="surface-card border-2 border-foreground/10">
                  <AccordionTrigger className="px-4 py-3 font-mono text-sm font-semibold text-foreground hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-bold">Player:</span>
                        <span className="text-foreground">{playerName}</span>
                        <span className="text-xs bg-accent px-2 py-0.5 rounded">
                          {playerEntries.length} bets
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          Total Bet: ₹{totalBet}
                        </span>
                        {totalWon > 0 && (
                          <span className="text-xs text-success">
                            Won: ₹{totalWon}
                          </span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-foreground/10">
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Sr. No</th>
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Player Name</th>
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Added By</th>
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Number</th>
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Game</th>
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Type</th>
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Amount</th>
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Result</th>
                            <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Date & Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerEntries.map((e, index) => {
                            const addedBy = getUserName(e.userId);
                            return (
                              <tr key={e.id} className="border-b border-foreground/5 hover:bg-accent/5">
                                <td className="py-2 px-2 text-xs font-mono text-muted-foreground">
                                  {index + 1}
                                </td>
                                <td className="py-2 px-2 text-xs font-mono font-semibold text-primary">
                                  {e.playerName || "Unknown"}
                                </td>
                                <td className="py-2 px-2 text-xs font-mono text-foreground bg-accent/20">
                                  {addedBy}
                                </td>
                                <td className="py-2 px-2 text-xs font-mono font-bold text-foreground">
                                  {e.number}
                                </td>
                                <td className="py-2 px-2 text-xs font-mono text-foreground">
                                  {e.gameName}
                                </td>
                                <td className="py-2 px-2 text-xs font-mono text-muted-foreground">
                                  {e.gameType}
                                </td>
                                <td className="py-2 px-2 text-xs font-mono font-semibold text-foreground">
                                  ₹{e.amount}
                                </td>
                                <td className="py-2 px-2">
                                  {e.result ? (
                                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                                      e.result === "won" 
                                        ? "text-success bg-success/10 border border-success/30" 
                                        : "text-destructive bg-destructive/10 border border-destructive/30"
                                    }`}>
                                      {e.result === "won" ? `WON ₹${e.winAmount}` : "LOST"}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono text-muted-foreground">Pending</span>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-[10px] font-mono text-muted-foreground">
                                  {new Date(e.createdAt).toLocaleDateString("en-IN", { 
                                    day: "2-digit", 
                                    month: "2-digit", 
                                    year: "numeric" 
                                  })},{" "}
                                  {new Date(e.createdAt).toLocaleTimeString("en-IN", { 
                                    hour: "2-digit", 
                                    minute: "2-digit" 
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
};

// === RESULTS TAB ===
const GAME_TYPES = ["Single Digit", "Jodi Digit", "Single Pana", "Double Pana", "Triple Patti"];

const ResultsTab = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [winningNumber, setWinningNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setGames(getGames());
    setResults(getResults().sort((a, b) => new Date(b.declaredAt).getTime() - new Date(a.declaredAt).getTime()));
  }, []);

  const filteredResults = results.filter(result => 
    result.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.gameType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a result already exists for game+type combo
  const isAlreadyDeclared = (gameId: string, gameType: string) =>
    results.some((r) => r.gameId === gameId && r.gameType === gameType);

  const handleDeclare = () => {
    if (!selectedGameId) { toast({ title: "Error", description: "Select a game.", variant: "destructive" }); return; }
    if (!selectedType) { toast({ title: "Error", description: "Select a game type.", variant: "destructive" }); return; }
    if (!winningNumber.trim()) { toast({ title: "Error", description: "Enter winning number.", variant: "destructive" }); return; }
    if (isAlreadyDeclared(selectedGameId, selectedType)) {
      toast({ title: "Error", description: "Result already declared for this game type.", variant: "destructive" }); return;
    }

    const game = games.find((g) => g.id === selectedGameId);
    if (!game) return;

    declareResult(selectedGameId, game.name, selectedType, winningNumber.trim());

    // Refresh
    setResults(getResults().sort((a, b) => new Date(b.declaredAt).getTime() - new Date(a.declaredAt).getTime()));
    setWinningNumber("");
    const multiplier = GAME_TYPE_MULTIPLIERS[selectedType] || 9;
    toast({ title: "Result Declared", description: `${game.name} - ${selectedType}: #${winningNumber.trim()} (${multiplier}x). Winners credited!` });
  };

  const selectedGame = games.find((g) => g.id === selectedGameId);

  return (
    <div className="space-y-6">
      {/* Declare Result Form */}
      <div className="surface-card p-4 space-y-4">
        <h3 className="font-mono font-bold text-sm text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" /> Declare Result
        </h3>

        {/* Select Game */}
        <div>
          <label className="text-[10px] font-mono text-muted-foreground tracking-wider">SELECT GAME</label>
          <select
            value={selectedGameId}
            onChange={(e) => { setSelectedGameId(e.target.value); setSelectedType(""); }}
            className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mt-1"
          >
            <option value="">-- Select Game --</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Select Game Type */}
        {selectedGameId && (
          <div>
            <label className="text-[10px] font-mono text-muted-foreground tracking-wider">GAME TYPE</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {GAME_TYPES.map((type) => {
                const declared = isAlreadyDeclared(selectedGameId, type);
                return (
                  <button
                    key={type}
                    onClick={() => !declared && setSelectedType(type)}
                    disabled={declared}
                    className={`px-3 py-2 font-mono text-xs font-semibold border-2 transition-colors ${
                      declared
                        ? "border-foreground/5 text-muted-foreground/50 bg-accent/30 cursor-not-allowed line-through"
                        : selectedType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-foreground/10 text-foreground hover:border-primary/30"
                    }`}
                  >
                    {type}
                    {declared && <span className="block text-[9px] text-muted-foreground no-underline" style={{ textDecoration: "none" }}>Declared</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Winning Number + Multiplier Info */}
        {selectedType && (
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-muted-foreground tracking-wider">WINNING NUMBER</label>
              <span className="text-[10px] font-mono text-primary">Multiplier: {GAME_TYPE_MULTIPLIERS[selectedType]}x</span>
            </div>
            <input
              type="text"
              value={winningNumber}
              onChange={(e) => setWinningNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter winning number"
              className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mt-1"
            />
          </div>
        )}

        {/* Declare Button */}
        {selectedType && winningNumber && (
          <button
            onClick={handleDeclare}
            className="w-full bg-primary text-primary-foreground py-3 font-mono text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Declare Result — {selectedGame?.name} / {selectedType} / #{winningNumber}
          </button>
        )}
      </div>

      {/* Past Results */}
      <div>
        <h3 className="font-mono font-bold text-sm text-foreground mb-3">Declared Results</h3>
        
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search results by game or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        
        {filteredResults.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">
            {searchQuery ? "No results match your search" : "No results declared yet"}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((r) => (
              <div key={r.id} className="surface-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary text-xl w-14 text-center">{r.winningNumber}</span>
                  <div>
                    <p className="font-mono text-xs font-semibold text-foreground">{r.gameName}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{r.gameType} · {GAME_TYPE_MULTIPLIERS[r.gameType] || 9}x</p>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {new Date(r.declaredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })},{" "}
                  {new Date(r.declaredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;