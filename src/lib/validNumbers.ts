// Valid numbers for left and right positions in games (3-digit numbers)
export const VALID_NUMBERS = [
  // Row 1
  "128", "129", "120", "130", "140", "123", "124", "125", "126", "127",
  // Row 2
  "137", "138", "139", "149", "159", "150", "160", "134", "135", "136",
  // Row 3
  "146", "147", "148", "158", "168", "169", "179", "170", "180", "145",
  // Row 4
  "236", "156", "157", "167", "230", "178", "250", "189", "270", "190",
  // Row 5
  "245", "237", "238", "239", "249", "240", "269", "260", "234", "280",
  // Row 6
  "290", "146", "247", "248", "258", "259", "278", "279", "289", "235",
  // Row 7
  "380", "345", "256", "257", "267", "268", "340", "350", "360", "370",
  // Row 8
  "470", "390", "346", "347", "348", "349", "359", "369", "379", "389",
  // Row 9
  "489", "480", "490", "356", "357", "358", "368", "378", "450", "460",
  // Row 10
  "560", "570", "580", "590", "456", "367", "458", "459", "469", "479",
  // Row 11
  "579", "589", "670", "680", "690", "457", "467", "468", "478", "569",
  // Row 12
  "678", "679", "689", "789", "780", "790", "890", "567", "568", "578",
  // Row 13 (100 series)
  "100", "200", "300", "400", "500", "600", "700", "800", "900", "550",
  // Row 14
  "119", "110", "166", "112", "113", "114", "115", "116", "117", "118",
  // Row 15
  "155", "228", "229", "220", "122", "277", "133", "224", "144", "226",
  // Row 16
  "227", "255", "337", "266", "177", "330", "188", "233", "199", "244",
  // Row 17
  "335", "336", "355", "338", "339", "448", "223", "288", "225", "299",
  // Row 18
  "344", "499", "445", "446", "366", "466", "377", "440", "388", "334",
  // Row 19
  "399", "660", "599", "455", "447", "556", "449", "477", "559", "488",
  // Row 20
  "588", "688", "779", "699", "799", "880", "557", "558", "577", "668",
  // Row 21
  "669", "778", "788", "770", "889", "899", "566", "990", "667", "677",
  // Row 22 (Triple digits)
  "777", "444", "111", "888", "555", "222", "999", "666", "333", "000"
];

// Valid center numbers (single digits 0-9, double digits 10-99, and *)
export const VALID_CENTER_NUMBERS = [
  // Single digits
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  // Double digits 10-99
  "01","02","03","04","05","06","07","08","09",
  "00","10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
  "51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
  "61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
  "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
  "81", "82", "83", "84", "85", "86", "87", "88", "89", "90",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
  // Wildcard
  "*"
];

// Helper function to validate game numbers
export const isValidGameNumber = (number: string, position: "left" | "center" | "right"): boolean => {
  if (position === "center") {
    return VALID_CENTER_NUMBERS.includes(number);
  }
  // For left and right positions
  return VALID_NUMBERS.includes(number) || number === "***";
};

// Helper function to get validation error message
export const getValidationErrorMessage = (number: string, position: "left" | "center" | "right"): string | null => {
  if (position === "center") {
    if (!VALID_CENTER_NUMBERS.includes(number)) {
      return "Center number must be a single digit (0-9), double digit (10-99), or *";
    }
  } else {
    if (number === "***") return null; // Allow placeholder
    if (!VALID_NUMBERS.includes(number)) {
      return `Invalid ${position} number. Please select a valid 3-digit number from the list.`;
    }
  }
  return null;
};

// Helper function to check if a number is a valid center number
export const isValidCenterNumber = (number: string): boolean => {
  return VALID_CENTER_NUMBERS.includes(number);
};

// Get all valid center numbers for display
export const getValidCenterNumbers = (): string[] => {
  return VALID_CENTER_NUMBERS;
};