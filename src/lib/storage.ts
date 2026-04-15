export interface User {
  id: string;
  phone: string;
  password: string;
  name: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected";
  balance: number;
  canAddPlayerName: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdraw" | "bet" | "win";
  amount: number;
  description: string;
  createdAt: string;
}

export interface Game {
  id: string;
  name: string;
  leftNumber: string;
  centerNumber: string;
  rightNumber: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  leftNumberAddedBy?: string;
  leftNumberAddedAt?: string;
  leftNumberResult?: "won" | "lost" | "pending";
  leftNumberDeclaredAt?: string;
}

export interface GameEntry {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  gameType: string;
  number: string;
  amount: number;
  playerName: string;
  createdAt: string;
  result?: "won" | "lost";
  winAmount?: number;
  resultId?: string;
  isLeftNumber?: boolean;
  leftNumber?: string;  // Game's left number at time of bet
  centerNumber?: string; // Game's center number at time of bet
  rightNumber?: string;  // Game's right number at time of bet
}

export interface GameResult {
  id: string;
  gameId: string;
  gameName: string;
  gameType: string;
  winningNumber: string;
  declaredAt: string;
  declaredBy: string;
  totalWinners: number;
  totalPayout: number;
  timeType: "open" | "close";
  isLeftNumber?: boolean;
}

export interface LeftNumberEntry {
  id: string;
  gameId: string;
  gameName: string;
  number: string;
  addedBy: string;
  addedAt: string;
  result?: "won" | "lost" | "pending";
  declaredAt?: string;
  declaredBy?: string;
}

const KEYS = {
  users: "star_users",
  games: "star_games",
  entries: "star_entries",
  transactions: "star_transactions",
  currentUser: "star_current_user",
  results: "star_results",
  leftNumbers: "star_left_numbers",
};

const generateId = (): string =>
  `id-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const safeSet = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error("Storage write failed for key:", key);
  }
};

const initialUsers: User[] = [
  {
    id: "admin-001",
    phone: "9999999999",
    password: "admin123",
    name: "Admin",
    role: "admin",
    status: "approved",
    balance: 0,
    canAddPlayerName: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-001",
    phone: "8888888888",
    password: "user123",
    name: "Dhiraj",
    role: "user",
    status: "approved",
    balance: 2500,
    canAddPlayerName: false,
    createdAt: new Date().toISOString(),
  },
];

const initialGames: Game[] = [
  {
    id: "game-001",
    name: "KALYAN MATKA",
    leftNumber: "478",
    centerNumber: "5",
    rightNumber: "690",
    openTime: "09:30",
    closeTime: "11:30",
    isActive: true,
  },
  {
    id: "game-002",
    name: "MILAN DAY",
    leftNumber: "123",
    centerNumber: "8",
    rightNumber: "456",
    openTime: "13:00",
    closeTime: "15:00",
    isActive: true,
  },
];

export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.users)) safeSet(KEYS.users, initialUsers);
  if (!localStorage.getItem(KEYS.games)) safeSet(KEYS.games, initialGames);
  if (!localStorage.getItem(KEYS.entries)) safeSet(KEYS.entries, []);
  if (!localStorage.getItem(KEYS.transactions)) safeSet(KEYS.transactions, []);
  if (!localStorage.getItem(KEYS.results)) safeSet(KEYS.results, []);
  if (!localStorage.getItem(KEYS.leftNumbers)) safeSet(KEYS.leftNumbers, []);
};

// ===== USERS =====
export const getUsers = (): User[] => safeGet(KEYS.users, []);

export const addUser = (user: Omit<User, "id" | "createdAt">): User => {
  const users = getUsers();
  const newUser: User = { 
    ...user, 
    id: generateId(), 
    createdAt: new Date().toISOString(),
    canAddPlayerName: false
  };
  users.push(newUser);
  safeSet(KEYS.users, users);
  return newUser;
};

export const updateUser = (updated: User) => {
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u));
  safeSet(KEYS.users, users);
};

export const getUserByPhone = (phone: string): User | undefined =>
  getUsers().find((u) => u.phone === phone);

export const getUserById = (id: string): User | undefined =>
  getUsers().find((u) => u.id === id);

export const deleteUser = (userId: string) => {
  const users = getUsers().filter((u) => u.id !== userId);
  safeSet(KEYS.users, users);
};

// ===== WALLET =====
export const updateUserBalance = (userId: string, amount: number) => {
  const user = getUserById(userId);
  if (user) {
    user.balance += amount;
    updateUser(user);
  }
};

export const getUserBalance = (userId: string): number =>
  getUserById(userId)?.balance ?? 0;

// ===== GAMES =====
export const getGames = (): Game[] => safeGet(KEYS.games, []);

export const updateGame = (updated: Game) => {
  const games = getGames().map((g) => (g.id === updated.id ? updated : g));
  safeSet(KEYS.games, games);
};

export const addGame = (game: Omit<Game, "id">): Game => {
  const games = getGames();
  const newGame: Game = { ...game, id: generateId() };
  games.push(newGame);
  safeSet(KEYS.games, games);
  return newGame;
};

// ===== LEFT NUMBERS =====
export const getLeftNumbers = (): LeftNumberEntry[] => safeGet(KEYS.leftNumbers, []);

export const addLeftNumber = (gameId: string, gameName: string, number: string, adminId: string): LeftNumberEntry => {
  const leftNumbers = getLeftNumbers();
  
  const newEntry: LeftNumberEntry = {
    id: generateId(),
    gameId,
    gameName,
    number,
    addedBy: adminId,
    addedAt: new Date().toISOString(),
    result: "pending"
  };
  
  leftNumbers.push(newEntry);
  safeSet(KEYS.leftNumbers, leftNumbers);
  
  const games = getGames();
  const updatedGames = games.map(g => {
    if (g.id === gameId) {
      return {
        ...g,
        leftNumber: number,
        leftNumberAddedBy: adminId,
        leftNumberAddedAt: new Date().toISOString(),
        leftNumberResult: "pending"
      };
    }
    return g;
  });
  safeSet(KEYS.games, updatedGames);
  
  return newEntry;
};

export const getLeftNumbersByGame = (gameId: string): LeftNumberEntry[] =>
  getLeftNumbers().filter(l => l.gameId === gameId).sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );

// ===== ENTRIES =====
export const addEntry = (entry: Omit<GameEntry, "id" | "createdAt">): GameEntry => {
  const entries = getEntries();
  const newEntry: GameEntry = { 
    ...entry, 
    id: generateId(), 
    createdAt: new Date().toISOString(),
    playerName: entry.playerName,
    isLeftNumber: entry.isLeftNumber || false,
    leftNumber: entry.leftNumber,
    centerNumber: entry.centerNumber,
    rightNumber: entry.rightNumber
  };
  entries.push(newEntry);
  safeSet(KEYS.entries, entries);
  return newEntry;
};

export const getEntries = (): GameEntry[] => safeGet(KEYS.entries, []);

export const getEntriesByUser = (userId: string): GameEntry[] =>
  getEntries().filter((e) => e.userId === userId);

export const updateEntry = (updated: GameEntry) => {
  const entries = getEntries().map((e) => (e.id === updated.id ? updated : e));
  safeSet(KEYS.entries, entries);
};

// ===== TRANSACTIONS =====
export const addTransaction = (tx: Omit<Transaction, "id" | "createdAt">): Transaction => {
  const txs = getTransactions();
  const newTx: Transaction = { ...tx, id: generateId(), createdAt: new Date().toISOString() };
  txs.push(newTx);
  safeSet(KEYS.transactions, txs);
  return newTx;
};

export const getTransactions = (): Transaction[] => safeGet(KEYS.transactions, []);

export const getUserTransactions = (userId: string): Transaction[] =>
  getTransactions().filter((t) => t.userId === userId);

// ===== RESULTS =====
export const getResults = (): GameResult[] => safeGet(KEYS.results, []);

export const addResult = (result: Omit<GameResult, "id">): GameResult => {
  const results = getResults();
  const newResult: GameResult = { 
    ...result, 
    id: generateId(),
    isLeftNumber: result.isLeftNumber || false
  };
  results.push(newResult);
  safeSet(KEYS.results, results);
  return newResult;
};

export const GAME_TYPE_MULTIPLIERS: Record<string, number> = {
  "Single Digit": 9,
  "Jodi Digit": 90,
  "Single Pana": 150,
  "Double Pana": 300,
  "Triple Patti": 600,
  "SP-DP-TP": 100,
  "Left Number": 1,
};

export const declareResult = (
  gameId: string, 
  gameName: string, 
  gameType: string, 
  winningNumber: string,
  adminId: string,
  timeType: "open" | "close",
  isLeftNumber: boolean = false
) => {
  const entries = getEntries();
  const multiplier = GAME_TYPE_MULTIPLIERS[gameType] || 9;
  
  const winningEntries = entries.filter(e => 
    e.gameId === gameId && 
    e.gameType === gameType && 
    e.number === winningNumber &&
    e.result === undefined
  );

  const totalWinners = winningEntries.length;
  const totalPayout = winningEntries.reduce((sum, e) => sum + (e.amount * multiplier), 0);

  const result = addResult({
    gameId,
    gameName,
    gameType,
    winningNumber,
    declaredBy: adminId,
    totalWinners,
    totalPayout,
    timeType,
    declaredAt: new Date().toISOString(),
    isLeftNumber
  });

  const updatedEntries = entries.map((e) => {
    if (e.gameId === gameId && e.gameType === gameType && e.result === undefined) {
      if (e.number === winningNumber) {
        const winAmount = e.amount * multiplier;
        updateUserBalance(e.userId, winAmount);
        addTransaction({ 
          userId: e.userId, 
          type: "win", 
          amount: winAmount, 
          description: `Won ${gameName} - ${gameType} #${winningNumber} (${multiplier}x) for ${e.playerName}` 
        });
        return { 
          ...e, 
          result: "won" as const, 
          winAmount,
          resultId: result.id 
        };
      } else {
        return { ...e, result: "lost" as const, winAmount: 0, resultId: result.id };
      }
    }
    return e;
  });

  safeSet(KEYS.entries, updatedEntries);
  
  if (isLeftNumber) {
    const leftNumbers = getLeftNumbers();
    const updatedLeftNumbers = leftNumbers.map(l => {
      if (l.gameId === gameId && l.number === winningNumber && l.result === "pending") {
        return {
          ...l,
          result: "won" as const,
          declaredAt: new Date().toISOString(),
          declaredBy: adminId
        };
      }
      if (l.gameId === gameId && l.result === "pending") {
        return {
          ...l,
          result: "lost" as const,
          declaredAt: new Date().toISOString(),
          declaredBy: adminId
        };
      }
      return l;
    });
    safeSet(KEYS.leftNumbers, updatedLeftNumbers);
  }
  
  return result;
};

// ===== MIGRATION =====
export const migrateUsersWithPlayerNamePermission = () => {
  const users = getUsers();
  let updated = false;
  
  const migratedUsers = users.map(user => {
    if (user.canAddPlayerName === undefined) {
      updated = true;
      return { ...user, canAddPlayerName: false };
    }
    return user;
  });
  
  if (updated) {
    safeSet(KEYS.users, migratedUsers);
    console.log("✅ Users migrated with canAddPlayerName field");
  }
};

// ===== SESSION =====
export const setCurrentUser = (user: User) => safeSet(KEYS.currentUser, user);

export const getCurrentUser = (): User | null => safeGet(KEYS.currentUser, null);

export const logout = () => {
  localStorage.removeItem(KEYS.currentUser); // user
  localStorage.removeItem("token");          // 🔥 IMPORTANT
};