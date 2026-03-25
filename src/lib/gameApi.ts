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
  const response = await fetch(`${BASE_URL}/games`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getActiveGames = async (): Promise<Game[]> => {
  const response = await fetch(`${BASE_URL}/games/active`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getGameById = async (id: number): Promise<Game> => {
  const response = await fetch(`${BASE_URL}/games/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createGame = async (game: Partial<Game>): Promise<Game> => {
  const response = await fetch(`${BASE_URL}/games`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(game),
  });
  return handleResponse(response);
};

export const updateGame = async (
  id: number,
  game: Partial<Game>
): Promise<Game> => {
  const response = await fetch(`${BASE_URL}/games/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(game),
  });
  return handleResponse(response);
};

export const deleteGame = async (id: number): Promise<string> => {
  const response = await fetch(`${BASE_URL}/games/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const toggleGameStatus = async (id: number): Promise<Game> => {
  const response = await fetch(`${BASE_URL}/games/${id}/toggle-status`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const searchGames = async (name: string): Promise<Game[]> => {
  const response = await fetch(
    `${BASE_URL}/games/search?name=${encodeURIComponent(name)}`,
    {
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
};

// ==================== USERS ====================

export const getUserById = async (id: number): Promise<User> => {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== GAME ENTRIES ====================

export const addGameEntry = async (entry: GameEntry): Promise<GameEntry> => {
  const response = await fetch(`${BASE_URL}/game-entries`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(entry),
  });
  return handleResponse(response);
};

export const addBulkGameEntries = async (
  entries: GameEntry[]
): Promise<GameEntry[]> => {
  const response = await fetch(`${BASE_URL}/game-entries/bulk`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(entries),
  });
  return handleResponse(response);
};

export const getAllGameEntries = async (): Promise<GameEntry[]> => {
  const response = await fetch(`${BASE_URL}/game-entries`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getEntryById = async (entryId: number): Promise<GameEntry> => {
  const response = await fetch(`${BASE_URL}/game-entries/${entryId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getEntriesByUserId = async (
  userId: number
): Promise<GameEntry[]> => {
  const response = await fetch(`${BASE_URL}/game-entries/user/${userId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getEntriesByGameId = async (
  gameId: number
): Promise<GameEntry[]> => {
  const response = await fetch(`${BASE_URL}/game-entries/game/${gameId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
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
  const response = await fetch(`${BASE_URL}/left-numbers`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getLeftNumberById = async (
  id: number
): Promise<LeftNumberEntry> => {
  const response = await fetch(`${BASE_URL}/left-numbers/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getLeftNumbersByGame = async (
  gameId: number
): Promise<LeftNumberEntry[]> => {
  const response = await fetch(`${BASE_URL}/left-numbers/game/${gameId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
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
  return handleResponse(response);
};

export const getResults = async (): Promise<GameResult[]> => {
  const response = await fetch(`${BASE_URL}/game-results`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getResultById = async (resultId: number): Promise<GameResult> => {
  const response = await fetch(`${BASE_URL}/game-results/${resultId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getResultsByGameId = async (
  gameId: number
): Promise<GameResult[]> => {
  const response = await fetch(`${BASE_URL}/game-results/game/${gameId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
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
  return handleResponse(response);
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${BASE_URL}/transactions`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getTransactionById = async (
  transactionId: number
): Promise<Transaction> => {
  const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getUserTransactions = async (
  userId: number
): Promise<Transaction[]> => {
  const response = await fetch(`${BASE_URL}/transactions/user/${userId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};