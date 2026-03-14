export interface User {
  id: string;
  phone: string;
  password: string;
  name: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected";
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdraw" | "bet";
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
}

// export interface GameEntry {
//   id: string;
//   userId: string;
//   gameId: string;
//   gameName: string;
//   gameType: string;
//   number: string;
//   amount: number;
//   createdAt: string;
//   result?: "won" | "lost";
//   winAmount?: number;
// }

export interface GameEntry {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  gameType: string;
  number: string;
  amount: number;
  playerName: string; // Make sure this exists
  createdAt: string;
  result?: "won" | "lost";
  winAmount?: number;
}

export interface GameResult {
  id: string;
  gameId: string;
  gameName: string;
  gameType: string;
  winningNumber: string;
  declaredAt: string;
}

const KEYS = {
  users: "star_users",
  games: "star_games",
  entries: "star_entries",
  transactions: "star_transactions",
  currentUser: "star_current_user",
  results: "star_results",
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
    createdAt: new Date().toISOString(),
  },
];

const initialGames: Game[] = [
  // Original Games
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
  {
    id: "game-003",
    name: "RAJDHANI NIGHT",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "21:00",
    closeTime: "23:00",
    isActive: true,
  },
  {
    id: "game-004",
    name: "MAIN BAZAR",
    leftNumber: "789",
    centerNumber: "3",
    rightNumber: "120",
    openTime: "16:00",
    closeTime: "18:00",
    isActive: true,
  },
  
  // 15 Additional Games (from previous)
  {
    id: "game-005",
    name: "STAR MORNING",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "06:00",
    closeTime: "08:00",
    isActive: true,
  },
  {
    id: "game-006",
    name: "SRIDEVI MORNING",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "06:30",
    closeTime: "08:30",
    isActive: true,
  },
  {
    id: "game-007",
    name: "CHENNAI MORNING",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "07:00",
    closeTime: "09:00",
    isActive: true,
  },
  {
    id: "game-008",
    name: "ROCKET",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "07:30",
    closeTime: "09:30",
    isActive: true,
  },
  {
    id: "game-009",
    name: "TIME BAZAR",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "08:00",
    closeTime: "10:00",
    isActive: true,
  },
  {
    id: "game-010",
    name: "STAR DAY",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "11:00",
    closeTime: "13:00",
    isActive: true,
  },
  {
    id: "game-011",
    name: "MILAN DAY",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "12:00",
    closeTime: "14:00",
    isActive: true,
  },
  {
    id: "game-012",
    name: "DUBAI",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "13:00",
    closeTime: "15:00",
    isActive: true,
  },
  {
    id: "game-013",
    name: "CHENNAI DAY",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "14:00",
    closeTime: "16:00",
    isActive: true,
  },
  {
    id: "game-014",
    name: "RAJDHANI DAY",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "15:00",
    closeTime: "17:00",
    isActive: true,
  },
  {
    id: "game-015",
    name: "KALYAN NIGHT",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "17:00",
    closeTime: "19:00",
    isActive: true,
  },
  {
    id: "game-016",
    name: "STAR NIGHT",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "18:00",
    closeTime: "20:00",
    isActive: true,
  },
  {
    id: "game-017",
    name: "MILAN NIGHT",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "19:00",
    closeTime: "21:00",
    isActive: true,
  },
  {
    id: "game-018",
    name: "RAJDHANI NIGHT",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "20:00",
    closeTime: "22:00",
    isActive: true,
  },
  {
    id: "game-019",
    name: "MANI BAZAR",
    leftNumber: "***",
    centerNumber: "*",
    rightNumber: "***",
    openTime: "21:00",
    closeTime: "23:00",
    isActive: true,
  },
  
  // New Games with the numbers you provided
  // Each game gets a unique combination of left, center, and right numbers
  {
    id: "game-020",
    name: "PANNA SET 1",
    leftNumber: "128",
    centerNumber: "5",
    rightNumber: "129",
    openTime: "09:00",
    closeTime: "11:00",
    isActive: true,
  },
  {
    id: "game-021",
    name: "PANNA SET 2",
    leftNumber: "120",
    centerNumber: "3",
    rightNumber: "130",
    openTime: "09:30",
    closeTime: "11:30",
    isActive: true,
  },
  {
    id: "game-022",
    name: "PANNA SET 3",
    leftNumber: "140",
    centerNumber: "7",
    rightNumber: "123",
    openTime: "10:00",
    closeTime: "12:00",
    isActive: true,
  },
  {
    id: "game-023",
    name: "PANNA SET 4",
    leftNumber: "124",
    centerNumber: "2",
    rightNumber: "125",
    openTime: "10:30",
    closeTime: "12:30",
    isActive: true,
  },
  {
    id: "game-024",
    name: "PANNA SET 5",
    leftNumber: "126",
    centerNumber: "4",
    rightNumber: "127",
    openTime: "11:00",
    closeTime: "13:00",
    isActive: true,
  },
  {
    id: "game-025",
    name: "PANNA SET 6",
    leftNumber: "137",
    centerNumber: "6",
    rightNumber: "138",
    openTime: "11:30",
    closeTime: "13:30",
    isActive: true,
  },
  {
    id: "game-026",
    name: "PANNA SET 7",
    leftNumber: "139",
    centerNumber: "8",
    rightNumber: "149",
    openTime: "12:00",
    closeTime: "14:00",
    isActive: true,
  },
  {
    id: "game-027",
    name: "PANNA SET 8",
    leftNumber: "159",
    centerNumber: "1",
    rightNumber: "150",
    openTime: "12:30",
    closeTime: "14:30",
    isActive: true,
  },
  {
    id: "game-028",
    name: "PANNA SET 9",
    leftNumber: "160",
    centerNumber: "9",
    rightNumber: "134",
    openTime: "13:00",
    closeTime: "15:00",
    isActive: true,
  },
  {
    id: "game-029",
    name: "PANNA SET 10",
    leftNumber: "135",
    centerNumber: "2",
    rightNumber: "136",
    openTime: "13:30",
    closeTime: "15:30",
    isActive: true,
  },
  {
    id: "game-030",
    name: "PANNA SET 11",
    leftNumber: "146",
    centerNumber: "4",
    rightNumber: "147",
    openTime: "14:00",
    closeTime: "16:00",
    isActive: true,
  },
  {
    id: "game-031",
    name: "PANNA SET 12",
    leftNumber: "148",
    centerNumber: "6",
    rightNumber: "158",
    openTime: "14:30",
    closeTime: "16:30",
    isActive: true,
  },
  {
    id: "game-032",
    name: "PANNA SET 13",
    leftNumber: "168",
    centerNumber: "8",
    rightNumber: "169",
    openTime: "15:00",
    closeTime: "17:00",
    isActive: true,
  },
  {
    id: "game-033",
    name: "PANNA SET 14",
    leftNumber: "179",
    centerNumber: "3",
    rightNumber: "170",
    openTime: "15:30",
    closeTime: "17:30",
    isActive: true,
  },
  {
    id: "game-034",
    name: "PANNA SET 15",
    leftNumber: "180",
    centerNumber: "5",
    rightNumber: "145",
    openTime: "16:00",
    closeTime: "18:00",
    isActive: true,
  },
  {
    id: "game-035",
    name: "PANNA SET 16",
    leftNumber: "236",
    centerNumber: "7",
    rightNumber: "156",
    openTime: "16:30",
    closeTime: "18:30",
    isActive: true,
  },
  {
    id: "game-036",
    name: "PANNA SET 17",
    leftNumber: "157",
    centerNumber: "1",
    rightNumber: "167",
    openTime: "17:00",
    closeTime: "19:00",
    isActive: true,
  },
  {
    id: "game-037",
    name: "PANNA SET 18",
    leftNumber: "230",
    centerNumber: "4",
    rightNumber: "178",
    openTime: "17:30",
    closeTime: "19:30",
    isActive: true,
  },
  {
    id: "game-038",
    name: "PANNA SET 19",
    leftNumber: "250",
    centerNumber: "6",
    rightNumber: "189",
    openTime: "18:00",
    closeTime: "20:00",
    isActive: true,
  },
  {
    id: "game-039",
    name: "PANNA SET 20",
    leftNumber: "270",
    centerNumber: "8",
    rightNumber: "190",
    openTime: "18:30",
    closeTime: "20:30",
    isActive: true,
  },
  {
    id: "game-040",
    name: "PANNA SET 21",
    leftNumber: "245",
    centerNumber: "2",
    rightNumber: "237",
    openTime: "19:00",
    closeTime: "21:00",
    isActive: true,
  },
  {
    id: "game-041",
    name: "PANNA SET 22",
    leftNumber: "238",
    centerNumber: "3",
    rightNumber: "239",
    openTime: "19:30",
    closeTime: "21:30",
    isActive: true,
  },
  {
    id: "game-042",
    name: "PANNA SET 23",
    leftNumber: "249",
    centerNumber: "5",
    rightNumber: "240",
    openTime: "20:00",
    closeTime: "22:00",
    isActive: true,
  },
  {
    id: "game-043",
    name: "PANNA SET 24",
    leftNumber: "269",
    centerNumber: "7",
    rightNumber: "260",
    openTime: "20:30",
    closeTime: "22:30",
    isActive: true,
  },
  {
    id: "game-044",
    name: "PANNA SET 25",
    leftNumber: "234",
    centerNumber: "1",
    rightNumber: "280",
    openTime: "21:00",
    closeTime: "23:00",
    isActive: true,
  },
  {
    id: "game-045",
    name: "PANNA SET 26",
    leftNumber: "290",
    centerNumber: "4",
    rightNumber: "146",
    openTime: "21:30",
    closeTime: "23:30",
    isActive: true,
  },
  {
    id: "game-046",
    name: "PANNA SET 27",
    leftNumber: "247",
    centerNumber: "6",
    rightNumber: "248",
    openTime: "22:00",
    closeTime: "00:00",
    isActive: true,
  },
  {
    id: "game-047",
    name: "PANNA SET 28",
    leftNumber: "258",
    centerNumber: "8",
    rightNumber: "259",
    openTime: "22:30",
    closeTime: "00:30",
    isActive: true,
  },
  {
    id: "game-048",
    name: "PANNA SET 29",
    leftNumber: "278",
    centerNumber: "2",
    rightNumber: "279",
    openTime: "23:00",
    closeTime: "01:00",
    isActive: true,
  },
  {
    id: "game-049",
    name: "PANNA SET 30",
    leftNumber: "289",
    centerNumber: "5",
    rightNumber: "235",
    openTime: "23:30",
    closeTime: "01:30",
    isActive: true,
  },
  {
    id: "game-050",
    name: "PANNA SET 31",
    leftNumber: "380",
    centerNumber: "7",
    rightNumber: "345",
    openTime: "08:00",
    closeTime: "10:00",
    isActive: true,
  },
  {
    id: "game-051",
    name: "PANNA SET 32",
    leftNumber: "256",
    centerNumber: "1",
    rightNumber: "257",
    openTime: "08:30",
    closeTime: "10:30",
    isActive: true,
  },
  {
    id: "game-052",
    name: "PANNA SET 33",
    leftNumber: "267",
    centerNumber: "3",
    rightNumber: "268",
    openTime: "09:00",
    closeTime: "11:00",
    isActive: true,
  },
  {
    id: "game-053",
    name: "PANNA SET 34",
    leftNumber: "340",
    centerNumber: "6",
    rightNumber: "350",
    openTime: "09:30",
    closeTime: "11:30",
    isActive: true,
  },
  {
    id: "game-054",
    name: "PANNA SET 35",
    leftNumber: "360",
    centerNumber: "8",
    rightNumber: "370",
    openTime: "10:00",
    closeTime: "12:00",
    isActive: true,
  },
  {
    id: "game-055",
    name: "PANNA SET 36",
    leftNumber: "470",
    centerNumber: "2",
    rightNumber: "390",
    openTime: "10:30",
    closeTime: "12:30",
    isActive: true,
  },
  {
    id: "game-056",
    name: "PANNA SET 37",
    leftNumber: "346",
    centerNumber: "4",
    rightNumber: "347",
    openTime: "11:00",
    closeTime: "13:00",
    isActive: true,
  },
  {
    id: "game-057",
    name: "PANNA SET 38",
    leftNumber: "348",
    centerNumber: "5",
    rightNumber: "349",
    openTime: "11:30",
    closeTime: "13:30",
    isActive: true,
  },
  {
    id: "game-058",
    name: "PANNA SET 39",
    leftNumber: "359",
    centerNumber: "7",
    rightNumber: "369",
    openTime: "12:00",
    closeTime: "14:00",
    isActive: true,
  },
  {
    id: "game-059",
    name: "PANNA SET 40",
    leftNumber: "379",
    centerNumber: "9",
    rightNumber: "389",
    openTime: "12:30",
    closeTime: "14:30",
    isActive: true,
  },
  {
    id: "game-060",
    name: "PANNA SET 41",
    leftNumber: "489",
    centerNumber: "1",
    rightNumber: "480",
    openTime: "13:00",
    closeTime: "15:00",
    isActive: true,
  },
  {
    id: "game-061",
    name: "PANNA SET 42",
    leftNumber: "490",
    centerNumber: "3",
    rightNumber: "356",
    openTime: "13:30",
    closeTime: "15:30",
    isActive: true,
  },
  {
    id: "game-062",
    name: "PANNA SET 43",
    leftNumber: "357",
    centerNumber: "6",
    rightNumber: "358",
    openTime: "14:00",
    closeTime: "16:00",
    isActive: true,
  },
  {
    id: "game-063",
    name: "PANNA SET 44",
    leftNumber: "368",
    centerNumber: "8",
    rightNumber: "378",
    openTime: "14:30",
    closeTime: "16:30",
    isActive: true,
  },
  {
    id: "game-064",
    name: "PANNA SET 45",
    leftNumber: "450",
    centerNumber: "2",
    rightNumber: "460",
    openTime: "15:00",
    closeTime: "17:00",
    isActive: true,
  },
  {
    id: "game-065",
    name: "PANNA SET 46",
    leftNumber: "560",
    centerNumber: "4",
    rightNumber: "570",
    openTime: "15:30",
    closeTime: "17:30",
    isActive: true,
  },
  {
    id: "game-066",
    name: "PANNA SET 47",
    leftNumber: "580",
    centerNumber: "7",
    rightNumber: "590",
    openTime: "16:00",
    closeTime: "18:00",
    isActive: true,
  },
  {
    id: "game-067",
    name: "PANNA SET 48",
    leftNumber: "456",
    centerNumber: "9",
    rightNumber: "367",
    openTime: "16:30",
    closeTime: "18:30",
    isActive: true,
  },
  {
    id: "game-068",
    name: "PANNA SET 49",
    leftNumber: "458",
    centerNumber: "1",
    rightNumber: "459",
    openTime: "17:00",
    closeTime: "19:00",
    isActive: true,
  },
  {
    id: "game-069",
    name: "PANNA SET 50",
    leftNumber: "469",
    centerNumber: "3",
    rightNumber: "479",
    openTime: "17:30",
    closeTime: "19:30",
    isActive: true,
  },
  {
    id: "game-070",
    name: "PANNA SET 51",
    leftNumber: "579",
    centerNumber: "5",
    rightNumber: "589",
    openTime: "18:00",
    closeTime: "20:00",
    isActive: true,
  },
  {
    id: "game-071",
    name: "PANNA SET 52",
    leftNumber: "670",
    centerNumber: "6",
    rightNumber: "680",
    openTime: "18:30",
    closeTime: "20:30",
    isActive: true,
  },
  {
    id: "game-072",
    name: "PANNA SET 53",
    leftNumber: "690",
    centerNumber: "8",
    rightNumber: "457",
    openTime: "19:00",
    closeTime: "21:00",
    isActive: true,
  },
  {
    id: "game-073",
    name: "PANNA SET 54",
    leftNumber: "467",
    centerNumber: "2",
    rightNumber: "468",
    openTime: "19:30",
    closeTime: "21:30",
    isActive: true,
  },
  {
    id: "game-074",
    name: "PANNA SET 55",
    leftNumber: "478",
    centerNumber: "4",
    rightNumber: "569",
    openTime: "20:00",
    closeTime: "22:00",
    isActive: true,
  },
  {
    id: "game-075",
    name: "PANNA SET 56",
    leftNumber: "678",
    centerNumber: "7",
    rightNumber: "679",
    openTime: "20:30",
    closeTime: "22:30",
    isActive: true,
  },
  {
    id: "game-076",
    name: "PANNA SET 57",
    leftNumber: "689",
    centerNumber: "9",
    rightNumber: "789",
    openTime: "21:00",
    closeTime: "23:00",
    isActive: true,
  },
  {
    id: "game-077",
    name: "PANNA SET 58",
    leftNumber: "780",
    centerNumber: "1",
    rightNumber: "790",
    openTime: "21:30",
    closeTime: "23:30",
    isActive: true,
  },
  {
    id: "game-078",
    name: "PANNA SET 59",
    leftNumber: "890",
    centerNumber: "3",
    rightNumber: "567",
    openTime: "22:00",
    closeTime: "00:00",
    isActive: true,
  },
  {
    id: "game-079",
    name: "PANNA SET 60",
    leftNumber: "568",
    centerNumber: "5",
    rightNumber: "578",
    openTime: "22:30",
    closeTime: "00:30",
    isActive: true,
  },
  {
    id: "game-080",
    name: "PANNA SET 61",
    leftNumber: "100",
    centerNumber: "2",
    rightNumber: "200",
    openTime: "08:00",
    closeTime: "10:00",
    isActive: true,
  },
  {
    id: "game-081",
    name: "PANNA SET 62",
    leftNumber: "300",
    centerNumber: "4",
    rightNumber: "400",
    openTime: "08:30",
    closeTime: "10:30",
    isActive: true,
  },
  {
    id: "game-082",
    name: "PANNA SET 63",
    leftNumber: "500",
    centerNumber: "6",
    rightNumber: "600",
    openTime: "09:00",
    closeTime: "11:00",
    isActive: true,
  },
  {
    id: "game-083",
    name: "PANNA SET 64",
    leftNumber: "700",
    centerNumber: "8",
    rightNumber: "800",
    openTime: "09:30",
    closeTime: "11:30",
    isActive: true,
  },
  {
    id: "game-084",
    name: "PANNA SET 65",
    leftNumber: "900",
    centerNumber: "1",
    rightNumber: "550",
    openTime: "10:00",
    closeTime: "12:00",
    isActive: true,
  },
  {
    id: "game-085",
    name: "PANNA SET 66",
    leftNumber: "119",
    centerNumber: "3",
    rightNumber: "110",
    openTime: "10:30",
    closeTime: "12:30",
    isActive: true,
  },
  {
    id: "game-086",
    name: "PANNA SET 67",
    leftNumber: "166",
    centerNumber: "5",
    rightNumber: "112",
    openTime: "11:00",
    closeTime: "13:00",
    isActive: true,
  },
  {
    id: "game-087",
    name: "PANNA SET 68",
    leftNumber: "113",
    centerNumber: "7",
    rightNumber: "114",
    openTime: "11:30",
    closeTime: "13:30",
    isActive: true,
  },
  {
    id: "game-088",
    name: "PANNA SET 69",
    leftNumber: "115",
    centerNumber: "9",
    rightNumber: "116",
    openTime: "12:00",
    closeTime: "14:00",
    isActive: true,
  },
  {
    id: "game-089",
    name: "PANNA SET 70",
    leftNumber: "117",
    centerNumber: "2",
    rightNumber: "118",
    openTime: "12:30",
    closeTime: "14:30",
    isActive: true,
  },
  {
    id: "game-090",
    name: "PANNA SET 71",
    leftNumber: "155",
    centerNumber: "4",
    rightNumber: "228",
    openTime: "13:00",
    closeTime: "15:00",
    isActive: true,
  },
  {
    id: "game-091",
    name: "PANNA SET 72",
    leftNumber: "229",
    centerNumber: "6",
    rightNumber: "220",
    openTime: "13:30",
    closeTime: "15:30",
    isActive: true,
  },
  {
    id: "game-092",
    name: "PANNA SET 73",
    leftNumber: "122",
    centerNumber: "8",
    rightNumber: "277",
    openTime: "14:00",
    closeTime: "16:00",
    isActive: true,
  },
  {
    id: "game-093",
    name: "PANNA SET 74",
    leftNumber: "133",
    centerNumber: "1",
    rightNumber: "224",
    openTime: "14:30",
    closeTime: "16:30",
    isActive: true,
  },
  {
    id: "game-094",
    name: "PANNA SET 75",
    leftNumber: "144",
    centerNumber: "3",
    rightNumber: "226",
    openTime: "15:00",
    closeTime: "17:00",
    isActive: true,
  },
  {
    id: "game-095",
    name: "PANNA SET 76",
    leftNumber: "227",
    centerNumber: "5",
    rightNumber: "255",
    openTime: "15:30",
    closeTime: "17:30",
    isActive: true,
  },
  {
    id: "game-096",
    name: "PANNA SET 77",
    leftNumber: "337",
    centerNumber: "7",
    rightNumber: "266",
    openTime: "16:00",
    closeTime: "18:00",
    isActive: true,
  },
  {
    id: "game-097",
    name: "PANNA SET 78",
    leftNumber: "177",
    centerNumber: "9",
    rightNumber: "330",
    openTime: "16:30",
    closeTime: "18:30",
    isActive: true,
  },
  {
    id: "game-098",
    name: "PANNA SET 79",
    leftNumber: "188",
    centerNumber: "2",
    rightNumber: "233",
    openTime: "17:00",
    closeTime: "19:00",
    isActive: true,
  },
  {
    id: "game-099",
    name: "PANNA SET 80",
    leftNumber: "199",
    centerNumber: "4",
    rightNumber: "244",
    openTime: "17:30",
    closeTime: "19:30",
    isActive: true,
  },
  {
    id: "game-100",
    name: "PANNA SET 81",
    leftNumber: "335",
    centerNumber: "6",
    rightNumber: "336",
    openTime: "18:00",
    closeTime: "20:00",
    isActive: true,
  },
  {
    id: "game-101",
    name: "PANNA SET 82",
    leftNumber: "355",
    centerNumber: "8",
    rightNumber: "338",
    openTime: "18:30",
    closeTime: "20:30",
    isActive: true,
  },
  {
    id: "game-102",
    name: "PANNA SET 83",
    leftNumber: "339",
    centerNumber: "1",
    rightNumber: "448",
    openTime: "19:00",
    closeTime: "21:00",
    isActive: true,
  },
  {
    id: "game-103",
    name: "PANNA SET 84",
    leftNumber: "223",
    centerNumber: "3",
    rightNumber: "288",
    openTime: "19:30",
    closeTime: "21:30",
    isActive: true,
  },
  {
    id: "game-104",
    name: "PANNA SET 85",
    leftNumber: "225",
    centerNumber: "5",
    rightNumber: "299",
    openTime: "20:00",
    closeTime: "22:00",
    isActive: true,
  },
  {
    id: "game-105",
    name: "PANNA SET 86",
    leftNumber: "344",
    centerNumber: "7",
    rightNumber: "499",
    openTime: "20:30",
    closeTime: "22:30",
    isActive: true,
  },
  {
    id: "game-106",
    name: "PANNA SET 87",
    leftNumber: "445",
    centerNumber: "9",
    rightNumber: "446",
    openTime: "21:00",
    closeTime: "23:00",
    isActive: true,
  },
  {
    id: "game-107",
    name: "PANNA SET 88",
    leftNumber: "366",
    centerNumber: "2",
    rightNumber: "466",
    openTime: "21:30",
    closeTime: "23:30",
    isActive: true,
  },
  {
    id: "game-108",
    name: "PANNA SET 89",
    leftNumber: "377",
    centerNumber: "4",
    rightNumber: "440",
    openTime: "22:00",
    closeTime: "00:00",
    isActive: true,
  },
  {
    id: "game-109",
    name: "PANNA SET 90",
    leftNumber: "388",
    centerNumber: "6",
    rightNumber: "334",
    openTime: "22:30",
    closeTime: "00:30",
    isActive: true,
  },
  {
    id: "game-110",
    name: "PANNA SET 91",
    leftNumber: "399",
    centerNumber: "8",
    rightNumber: "660",
    openTime: "23:00",
    closeTime: "01:00",
    isActive: true,
  },
  {
    id: "game-111",
    name: "PANNA SET 92",
    leftNumber: "599",
    centerNumber: "1",
    rightNumber: "455",
    openTime: "23:30",
    closeTime: "01:30",
    isActive: true,
  },
  {
    id: "game-112",
    name: "PANNA SET 93",
    leftNumber: "447",
    centerNumber: "3",
    rightNumber: "556",
    openTime: "08:00",
    closeTime: "10:00",
    isActive: true,
  },
  {
    id: "game-113",
    name: "PANNA SET 94",
    leftNumber: "449",
    centerNumber: "5",
    rightNumber: "477",
    openTime: "08:30",
    closeTime: "10:30",
    isActive: true,
  },
  {
    id: "game-114",
    name: "PANNA SET 95",
    leftNumber: "559",
    centerNumber: "7",
    rightNumber: "488",
    openTime: "09:00",
    closeTime: "11:00",
    isActive: true,
  },
  {
    id: "game-115",
    name: "PANNA SET 96",
    leftNumber: "588",
    centerNumber: "9",
    rightNumber: "688",
    openTime: "09:30",
    closeTime: "11:30",
    isActive: true,
  },
  {
    id: "game-116",
    name: "PANNA SET 97",
    leftNumber: "779",
    centerNumber: "2",
    rightNumber: "699",
    openTime: "10:00",
    closeTime: "12:00",
    isActive: true,
  },
  {
    id: "game-117",
    name: "PANNA SET 98",
    leftNumber: "799",
    centerNumber: "4",
    rightNumber: "880",
    openTime: "10:30",
    closeTime: "12:30",
    isActive: true,
  },
  {
    id: "game-118",
    name: "PANNA SET 99",
    leftNumber: "557",
    centerNumber: "6",
    rightNumber: "558",
    openTime: "11:00",
    closeTime: "13:00",
    isActive: true,
  },
  {
    id: "game-119",
    name: "PANNA SET 100",
    leftNumber: "577",
    centerNumber: "8",
    rightNumber: "668",
    openTime: "11:30",
    closeTime: "13:30",
    isActive: true,
  },
  {
    id: "game-120",
    name: "PANNA SET 101",
    leftNumber: "669",
    centerNumber: "1",
    rightNumber: "778",
    openTime: "12:00",
    closeTime: "14:00",
    isActive: true,
  },
  {
    id: "game-121",
    name: "PANNA SET 102",
    leftNumber: "788",
    centerNumber: "3",
    rightNumber: "770",
    openTime: "12:30",
    closeTime: "14:30",
    isActive: true,
  },
  {
    id: "game-122",
    name: "PANNA SET 103",
    leftNumber: "889",
    centerNumber: "5",
    rightNumber: "899",
    openTime: "13:00",
    closeTime: "15:00",
    isActive: true,
  },
  {
    id: "game-123",
    name: "PANNA SET 104",
    leftNumber: "566",
    centerNumber: "7",
    rightNumber: "990",
    openTime: "13:30",
    closeTime: "15:30",
    isActive: true,
  },
  {
    id: "game-124",
    name: "PANNA SET 105",
    leftNumber: "667",
    centerNumber: "9",
    rightNumber: "677",
    openTime: "14:00",
    closeTime: "16:00",
    isActive: true,
  },
  {
    id: "game-125",
    name: "PANNA SET 106",
    leftNumber: "777",
    centerNumber: "2",
    rightNumber: "444",
    openTime: "14:30",
    closeTime: "16:30",
    isActive: true,
  },
  {
    id: "game-126",
    name: "PANNA SET 107",
    leftNumber: "111",
    centerNumber: "4",
    rightNumber: "888",
    openTime: "15:00",
    closeTime: "17:00",
    isActive: true,
  },
  {
    id: "game-127",
    name: "PANNA SET 108",
    leftNumber: "555",
    centerNumber: "6",
    rightNumber: "222",
    openTime: "15:30",
    closeTime: "17:30",
    isActive: true,
  },
  {
    id: "game-128",
    name: "PANNA SET 109",
    leftNumber: "999",
    centerNumber: "8",
    rightNumber: "666",
    openTime: "16:00",
    closeTime: "18:00",
    isActive: true,
  },
  {
    id: "game-129",
    name: "PANNA SET 110",
    leftNumber: "333",
    centerNumber: "1",
    rightNumber: "000",
    openTime: "16:30",
    closeTime: "18:30",
    isActive: true,
  },
];

export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.users)) safeSet(KEYS.users, initialUsers);
  if (!localStorage.getItem(KEYS.games)) safeSet(KEYS.games, initialGames);
  if (!localStorage.getItem(KEYS.entries)) safeSet(KEYS.entries, []);
  if (!localStorage.getItem(KEYS.transactions)) safeSet(KEYS.transactions, []);
  if (!localStorage.getItem(KEYS.results)) safeSet(KEYS.results, []);
};

// Users
export const getUsers = (): User[] => safeGet(KEYS.users, []);
export const addUser = (user: Omit<User, "id" | "createdAt">): User => {
  const users = getUsers();
  const newUser: User = { ...user, id: generateId(), createdAt: new Date().toISOString() };
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

// Wallet
export const updateUserBalance = (userId: string, amount: number) => {
  const user = getUserById(userId);
  if (user) {
    user.balance += amount;
    updateUser(user);
  }
};
export const getUserBalance = (userId: string): number =>
  getUserById(userId)?.balance ?? 0;

// Games
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

// Entries
export const addEntry = (entry: Omit<GameEntry, "id" | "createdAt">): GameEntry => {
  const entries = getEntries();
  const newEntry: GameEntry = { ...entry, id: generateId(), createdAt: new Date().toISOString() };
  entries.push(newEntry);
  safeSet(KEYS.entries, entries);
  return newEntry;
};
export const getEntries = (): GameEntry[] => safeGet(KEYS.entries, []);
export const getEntriesByUser = (userId: string): GameEntry[] =>
  getEntries().filter((e) => e.userId === userId);

// Transactions
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

// Results
export const getResults = (): GameResult[] => safeGet(KEYS.results, []);
export const addResult = (result: Omit<GameResult, "id" | "declaredAt">): GameResult => {
  const results = getResults();
  const newResult: GameResult = { ...result, id: generateId(), declaredAt: new Date().toISOString() };
  results.push(newResult);
  safeSet(KEYS.results, results);
  return newResult;
};
export const getResultsByGame = (gameId: string): GameResult[] =>
  getResults().filter((r) => r.gameId === gameId);

export const GAME_TYPE_MULTIPLIERS: Record<string, number> = {
  "Single Digit": 9,
  "Jodi Digit": 90,
  "Single Pana": 150,
  "Double Pana": 300,
  "Triple Patti": 600,
};

export const declareResult = (gameId: string, gameName: string, gameType: string, winningNumber: string) => {
  // Save result
  addResult({ gameId, gameName, gameType, winningNumber });

  // Find matching entries and credit winners
  const entries = getEntries();
  const multiplier = GAME_TYPE_MULTIPLIERS[gameType] || 9;
  const updated = entries.map((e) => {
    if (e.gameId === gameId && e.gameType === gameType && e.result === undefined) {
      if (e.number === winningNumber) {
        const winAmount = e.amount * multiplier;
        updateUserBalance(e.userId, winAmount);
        addTransaction({ userId: e.userId, type: "deposit", amount: winAmount, description: `Won ${gameName} - ${gameType} #${winningNumber} (${multiplier}x)` });
        return { ...e, result: "won" as const, winAmount };
      } else {
        return { ...e, result: "lost" as const, winAmount: 0 };
      }
    }
    return e;
  });
  safeSet(KEYS.entries, updated);
};

// Session
export const setCurrentUser = (user: User) => safeSet(KEYS.currentUser, user);
export const getCurrentUser = (): User | null => safeGet(KEYS.currentUser, null);
export const logout = () => localStorage.removeItem(KEYS.currentUser);