export interface User {
  id: number;
  name: string;
  mobileNumber: string;
  role: string;
  status: string;
  balance: number;
  canAddPlayerName: boolean;
}

export interface Transaction {
  id: number;
  userId?: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Game {
  id: number;
  name: string;
  leftNumber: string;
  centerNumber: string;
  rightNumber: string;
  openTime: string;
  closeTime: string;
  active?: boolean;
  isActive?: boolean;
  leftNumberAddedBy?: string;
  leftNumberAddedAt?: string;
  leftNumberResult?: "won" | "lost" | "pending";
  leftNumberDeclaredAt?: string;
  // Color properties for text and background
  leftNumberColor?: string;
  leftNumberBgColor?: string;
  centerNumberColor?: string;
  centerNumberBgColor?: string;
  rightNumberColor?: string;
  rightNumberBgColor?: string;
}

export interface GameEntry {
  id?: number;
  user?: {
    id: number;
  };
  game?: {
    id: number;
  };
  gameName?: string;
  playType: string;
  gameType: string;
  number: string;
  amount: number;
  playerName: string;
  createdAt?: string;
  result?: string;
  winAmount?: number;
  leftNumberFlag?: boolean;
  leftNumber?: string;
  centerNumber?: string;
  rightNumber?: string;
}

export interface GameResult {
  leftNumber: string;
  centerNumber: string;
  rightNumber: string;
  game: any;
  id?: number;
  gameId?: number;
  gameName: string;
  gameType: string;
  winningNumber: string;
  declaredAt?: string;
  declaredBy?: string;
  totalWinners?: number;
  totalPayout?: number;
  timeType: "open" | "close";
  leftNumberFlag?: boolean;
}

export interface LeftNumberEntry {
  id?: number;
  gameId?: number;
  gameName?: string;
  number: string;
  addedBy?: string;
  addedAt?: string;
  result?: "won" | "lost" | "pending";
  declaredAt?: string;
  declaredBy?: string;
  game?: {
    id: number;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
  id: number;
}

const BASE_URL = "http://localhost:5003";

// Cache keys for offline storage
const CACHE_KEYS = {
  GAMES: 'cached_games',
  ENTRIES: 'cached_entries',
  TRANSACTIONS: 'cached_transactions',
  RESULTS: 'cached_results'
};

const getToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = (isJson: boolean = false): HeadersInit => {
  const token = getToken();

  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function to check if we're online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Helper function to cache data
const cacheData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
};

// Helper function to get cached data
const getCachedData = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    return null;
  }
};

// Fetch with timeout and offline support
const fetchWithTimeout = async (
  url: string, 
  options: RequestInit, 
  timeout = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

// ==================== AUTH ====================

export const loginUser = async (payload: {
  mobileNumber: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user details");
  }

  return data;
};

// ==================== GAMES ====================

export const getGames = async (): Promise<Game[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/public/games`, {
      headers: getHeaders(),
    });
    const games = await handleResponse(response);
    
    // Ensure all games have color properties with defaults
    const gamesWithColors = games.map((game: Game) => ({
      ...game,
      leftNumberColor: game.leftNumberColor || "#000000",
      leftNumberBgColor: game.leftNumberBgColor || "#f3f4f6",
      centerNumberColor: game.centerNumberColor || "#000000",
      centerNumberBgColor: game.centerNumberBgColor || "#fde68a",
      rightNumberColor: game.rightNumberColor || "#000000",
      rightNumberBgColor: game.rightNumberBgColor || "#f3f4f6",
    }));
    
    cacheData(CACHE_KEYS.GAMES, gamesWithColors);
    return gamesWithColors;
  } catch (error) {
    console.error('Failed to fetch games:', error);
    // Return cached data if offline
    const cachedGames = getCachedData(CACHE_KEYS.GAMES);
    if (cachedGames) {
      return cachedGames;
    }
    return [];
  }
};

export const getActiveGames = async (): Promise<Game[]> => {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/public/games/active`,
      {
        headers: getHeaders(),
      }
    );

    const games = await handleResponse(response);

    const gamesWithColors = games.map((game: Game) => ({
      ...game,
      leftNumberColor: game.leftNumberColor || "#000000",
      leftNumberBgColor: game.leftNumberBgColor || "#f3f4f6",
      centerNumberColor: game.centerNumberColor || "#000000",
      centerNumberBgColor: game.centerNumberBgColor || "#fde68a",
      rightNumberColor: game.rightNumberColor || "#000000",
      rightNumberBgColor: game.rightNumberBgColor || "#f3f4f6",
    }));

    return gamesWithColors;
  } catch (error) {
    console.error("Failed to fetch active games:", error);
    return [];
  }
};

export const getGameById = async (id: number): Promise<Game> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/public/games/${id}`, {
      headers: getHeaders(),
    });
    const game = await handleResponse(response);
    
    // Ensure game has color properties with defaults
    return {
      ...game,
      leftNumberColor: game.leftNumberColor || "#000000",
      leftNumberBgColor: game.leftNumberBgColor || "#f3f4f6",
      centerNumberColor: game.centerNumberColor || "#000000",
      centerNumberBgColor: game.centerNumberBgColor || "#fde68a",
      rightNumberColor: game.rightNumberColor || "#000000",
      rightNumberBgColor: game.rightNumberBgColor || "#f3f4f6",
    };
  } catch (error) {
    console.error('Failed to fetch game:', error);
    const cachedGames = getCachedData(CACHE_KEYS.GAMES);
    if (cachedGames) {
      const game = cachedGames.find((g: Game) => g.id === id);
      if (game) return game;
    }
    throw error;
  }
};

export const createGame = async (game: Partial<Game>): Promise<Game> => {
  const response = await fetch(`${BASE_URL}/games`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({
      name: game.name,
      leftNumber: game.leftNumber || "***",
      centerNumber: game.centerNumber || "*",
      rightNumber: game.rightNumber || "***",
      openTime: game.openTime || "00:00",
      closeTime: game.closeTime || "00:00",
      active: game.active !== undefined ? game.active : true,
      // Include color properties with defaults
      leftNumberColor: game.leftNumberColor || "#000000",
      leftNumberBgColor: game.leftNumberBgColor || "#f3f4f6",
      centerNumberColor: game.centerNumberColor || "#000000",
      centerNumberBgColor: game.centerNumberBgColor || "#fde68a",
      rightNumberColor: game.rightNumberColor || "#000000",
      rightNumberBgColor: game.rightNumberBgColor || "#f3f4f6",
    }),
  });
  const newGame = await handleResponse(response);
  // Invalidate cache
  localStorage.removeItem(CACHE_KEYS.GAMES);
  return newGame;
};

export const updateGame = async (
  id: number,
  game: Partial<Game>
): Promise<Game> => {
  const updatePayload = {
    name: game.name,
    leftNumber: game.leftNumber,
    centerNumber: game.centerNumber,
    rightNumber: game.rightNumber,
    openTime: game.openTime,
    closeTime: game.closeTime,
    active: game.active !== undefined ? game.active : game.isActive,
    // Include color properties - preserve existing if not provided
    leftNumberColor: game.leftNumberColor,
    leftNumberBgColor: game.leftNumberBgColor,
    centerNumberColor: game.centerNumberColor,
    centerNumberBgColor: game.centerNumberBgColor,
    rightNumberColor: game.rightNumberColor,
    rightNumberBgColor: game.rightNumberBgColor,
  };
  
  const response = await fetch(`${BASE_URL}/games/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(updatePayload),
  });
  const updatedGame = await handleResponse(response);
  
  // Invalidate cache to force refresh
  localStorage.removeItem(CACHE_KEYS.GAMES);
  
  return updatedGame;
};

export const deleteGame = async (id: number): Promise<string> => {
  const response = await fetch(`${BASE_URL}/games/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const result = await handleResponse(response);
  localStorage.removeItem(CACHE_KEYS.GAMES);
  return result;
};

export const toggleGameStatus = async (id: number): Promise<Game> => {
  const response = await fetch(`${BASE_URL}/games/${id}/toggle-status`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  const updatedGame = await handleResponse(response);
  localStorage.removeItem(CACHE_KEYS.GAMES);
  return updatedGame;
};

export const searchGames = async (name: string): Promise<Game[]> => {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/public/games/search?name=${encodeURIComponent(name)}`,
      { headers: getHeaders() }
    );
    const games = await handleResponse(response);
    
    // Ensure all games have color properties with defaults
    const gamesWithColors = games.map((game: Game) => ({
      ...game,
      leftNumberColor: game.leftNumberColor || "#000000",
      leftNumberBgColor: game.leftNumberBgColor || "#f3f4f6",
      centerNumberColor: game.centerNumberColor || "#000000",
      centerNumberBgColor: game.centerNumberBgColor || "#fde68a",
      rightNumberColor: game.rightNumberColor || "#000000",
      rightNumberBgColor: game.rightNumberBgColor || "#f3f4f6",
    }));
    
    return gamesWithColors;
  } catch (error) {
    console.error('Failed to search games:', error);
    const cachedGames = getCachedData(CACHE_KEYS.GAMES);
    if (cachedGames) {
      return cachedGames.filter((game: Game) => 
        game.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    return [];
  }
};

// ==================== USERS ====================

export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/users/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

// ==================== GAME ENTRIES ====================

export const addGameEntry = async (entry: GameEntry): Promise<GameEntry> => {
  const response = await fetch(`${BASE_URL}/game-entries`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(entry),
  });
  const newEntry = await handleResponse(response);
  localStorage.removeItem(CACHE_KEYS.ENTRIES);
  return newEntry;
};

export const addBulkGameEntries = async (
  entries: GameEntry[]
): Promise<GameEntry[]> => {
  const response = await fetch(`${BASE_URL}/game-entries/bulk`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(entries),
  });
  const newEntries = await handleResponse(response);
  localStorage.removeItem(CACHE_KEYS.ENTRIES);
  return newEntries;
};

export const getAllGameEntries = async (): Promise<GameEntry[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/game-entries`, {
      headers: getHeaders(),
    });
    const entries = await handleResponse(response);
    cacheData(CACHE_KEYS.ENTRIES, entries);
    return entries;
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    const cachedEntries = getCachedData(CACHE_KEYS.ENTRIES);
    return cachedEntries || [];
  }
};

export const getEntryById = async (entryId: number): Promise<GameEntry> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/game-entries/${entryId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch entry:', error);
    const cachedEntries = getCachedData(CACHE_KEYS.ENTRIES);
    if (cachedEntries) {
      const entry = cachedEntries.find((e: GameEntry) => e.id === entryId);
      if (entry) return entry;
    }
    throw error;
  }
};

export const getEntriesByUserId = async (
  userId: number
): Promise<GameEntry[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/game-entries/user/${userId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch user entries:', error);
    const cachedEntries = getCachedData(CACHE_KEYS.ENTRIES);
    if (cachedEntries) {
      return cachedEntries.filter((e: GameEntry) => e.user?.id === userId);
    }
    return [];
  }
};

export const getEntriesByGameId = async (
  gameId: number
): Promise<GameEntry[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/game-entries/game/${gameId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch game entries:', error);
    const cachedEntries = getCachedData(CACHE_KEYS.ENTRIES);
    if (cachedEntries) {
      return cachedEntries.filter((e: GameEntry) => e.game?.id === gameId);
    }
    return [];
  }
};

// ==================== LEFT NUMBERS ====================

export const addLeftNumber = async (
  payload: LeftNumberEntry
): Promise<LeftNumberEntry> => {
  const response = await fetch(`${BASE_URL}/left-numbers`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const getAllLeftNumbers = async (): Promise<LeftNumberEntry[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/left-numbers`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch left numbers:', error);
    return [];
  }
};

export const getLeftNumberById = async (
  id: number
): Promise<LeftNumberEntry> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/left-numbers/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch left number:', error);
    throw error;
  }
};

export const getLeftNumbersByGame = async (
  gameId: number
): Promise<LeftNumberEntry[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/left-numbers/game/${gameId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch game left numbers:', error);
    return [];
  }
};

// ==================== RESULTS ====================

export const declareResult = async (
  payload: GameResult
): Promise<GameResult> => {
  const response = await fetch(`${BASE_URL}/game-results`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
  const result = await handleResponse(response);
  localStorage.removeItem(CACHE_KEYS.RESULTS);
  return result;
};

export const getResults = async (): Promise<GameResult[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/public/game-results`, {
      headers: getHeaders(),
    });
    const results = await handleResponse(response);
    cacheData(CACHE_KEYS.RESULTS, results);
    return results;
  } catch (error) {
    console.error('Failed to fetch results:', error);
    const cachedResults = getCachedData(CACHE_KEYS.RESULTS);
    return cachedResults || [];
  }
};

export const getResultById = async (resultId: number): Promise<GameResult> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/public/game-results/${resultId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch result:', error);
    const cachedResults = getCachedData(CACHE_KEYS.RESULTS);
    if (cachedResults) {
      const result = cachedResults.find((r: GameResult) => r.id === resultId);
      if (result) return result;
    }
    throw error;
  }
};

export const getResultsByGameId = async (
  gameId: number
): Promise<GameResult[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/public/game-results/game/${gameId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch game results:', error);
    const cachedResults = getCachedData(CACHE_KEYS.RESULTS);
    if (cachedResults) {
      return cachedResults.filter((r: GameResult) => r.gameId === gameId);
    }
    return [];
  }
};

// ==================== TRANSACTIONS ====================

export const addTransaction = async (
  payload: Partial<Transaction>
): Promise<Transaction> => {
  const response = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
  const transaction = await handleResponse(response);
  localStorage.removeItem(CACHE_KEYS.TRANSACTIONS);
  return transaction;
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/transactions`, {
      headers: getHeaders(),
    });
    const transactions = await handleResponse(response);
    cacheData(CACHE_KEYS.TRANSACTIONS, transactions);
    return transactions;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    const cachedTransactions = getCachedData(CACHE_KEYS.TRANSACTIONS);
    return cachedTransactions || [];
  }
};

export const getTransactionById = async (
  transactionId: number
): Promise<Transaction> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/transactions/${transactionId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    throw error;
  }
};

export const getUserTransactions = async (
  userId: number
): Promise<Transaction[]> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/transactions/user/${userId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch user transactions:', error);
    const cachedTransactions = getCachedData(CACHE_KEYS.TRANSACTIONS);
    if (cachedTransactions) {
      return cachedTransactions.filter((t: Transaction) => t.userId === userId);
    }
    return [];
  }
};

// Helper function to clear all caches
export const clearAllCaches = () => {
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Helper function to get default colors for a game
export const getDefaultGameColors = () => ({
  leftNumberColor: "#000000",
  leftNumberBgColor: "#f3f4f6",
  centerNumberColor: "#000000",
  centerNumberBgColor: "#fde68a",
  rightNumberColor: "#000000",
  rightNumberBgColor: "#f3f4f6",
});