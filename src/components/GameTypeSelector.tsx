import { useState, useEffect } from "react";
import { X, Trash2, User, Hash, ArrowLeft, AlertCircle, TrendingUp, DollarSign, Zap, Shield, Star, Trophy } from "lucide-react";
import { Game, getUserById } from "@/lib/gameApi";
import { useToast } from "@/hooks/use-toast";

const OPEN_GAME_TYPES = [
  "SINGLE",
  "JODI",
  "SINGLE PANA",
  "DOUBLE PANA",
  "TRIPLE PATTI",
  "SP-DP-TP",
];

const CLOSE_GAME_TYPES = [
  "SINGLE",
  "SINGLE PANA",
  "DOUBLE PANA",
  "TRIPLE PATTI",
  "SP-DP-TP",
];

const SP_DP_TP_OPTIONS = ["SP", "DP", "TP"];

const SINGLE_PANA_NUMBERS = [
  "128", "137", "146", "236", "245", "290", "380", "470", "489", "560", "579", "678",
  "129", "138", "147", "156", "237", "146", "345", "390", "480", "570", "589", "679",
  "120", "139", "148", "157", "238", "247", "256", "346", "490", "580", "670", "689",
  "130", "149", "158", "167", "239", "248", "257", "347", "356", "590", "680", "789",
  "140", "159", "168", "230", "249", "258", "267", "348", "357", "456", "690", "780",
  "123", "150", "169", "178", "240", "259", "268", "349", "358", "367", "457", "790",
  "124", "160", "179", "250", "269", "278", "340", "359", "368", "458", "467", "890",
  "125", "134", "170", "189", "260", "279", "350", "369", "378", "459", "468", "567",
  "126", "135", "180", "270", "234", "289", "360", "379", "450", "469", "478", "568",
  "127", "136", "145", "190", "280", "235", "370", "389", "460", "479", "569", "578",
];

const DOUBLE_PANA_NUMBERS = [
  "100", "200", "300", "400", "500", "600", "700", "800", "900", "550",
  "119", "110", "166", "112", "113", "114", "115", "116", "117", "118",
  "155", "228", "229", "220", "122", "277", "133", "224", "144", "226",
  "227", "255", "337", "266", "177", "330", "188", "233", "199", "244",
  "335", "336", "355", "338", "339", "448", "223", "288", "225", "299",
  "344", "499", "445", "446", "366", "466", "377", "440", "388", "334",
  "399", "660", "599", "455", "447", "556", "449", "477", "559", "488",
  "588", "688", "779", "699", "799", "880", "557", "558", "577", "668",
  "669", "778", "788", "770", "889", "899", "566", "990", "667", "677",
];

const TRIPLE_PATTI_NUMBERS = ["777", "444", "111", "888", "555", "222", "999", "666", "333", "000"];

const SP_NUMBERS: { [key: string]: string[] } = {
  "1": ["128", "137", "146", "236", "245", "290", "380", "470", "489", "560", "579", "678"],
  "2": ["129", "138", "147", "156", "237", "146", "345", "390", "480", "570", "589", "679"],
  "3": ["120", "139", "148", "157", "238", "247", "256", "346", "490", "580", "670", "689"],
  "4": ["130", "149", "158", "167", "239", "248", "257", "347", "356", "590", "680", "789"],
  "5": ["140", "159", "168", "230", "249", "258", "267", "348", "357", "456", "690", "780"],
  "6": ["123", "150", "169", "178", "240", "259", "268", "349", "358", "367", "457", "790"],
  "7": ["124", "160", "179", "250", "269", "278", "340", "359", "368", "458", "467", "890"],
  "8": ["125", "134", "170", "189", "260", "279", "350", "369", "378", "459", "468", "567"],
  "9": ["126", "135", "180", "270", "234", "289", "360", "379", "450", "469", "478", "568"],
  "0": ["127", "136", "145", "190", "280", "235", "370", "389", "460", "479", "569", "578"],
};

const DP_NUMBERS: { [key: string]: string[] } = {
  "1": ["100", "119", "155", "227", "335", "344", "399", "588", "669"],
  "2": ["200", "110", "228", "255", "336", "499", "660", "688", "778"],
  "3": ["300", "166", "229", "337", "355", "445", "599", "779", "788"],
  "4": ["400", "112", "220", "266", "338", "446", "455", "699", "770"],
  "5": ["500", "113", "122", "177", "339", "366", "447", "799", "889"],
  "6": ["600", "114", "277", "330", "448", "466", "556", "880", "899"],
  "7": ["700", "115", "133", "188", "223", "377", "449", "557", "566"],
  "8": ["800", "116", "224", "233", "288", "440", "477", "558", "990"],
  "9": ["900", "117", "145", "199", "225", "388", "559", "577", "667"],
  "0": ["550", "118", "226", "244", "299", "334", "488", "668", "677"],
};

const TP_NUMBERS: { [key: string]: string[] } = {
  "1": ["777"],
  "2": ["444"],
  "3": ["111"],
  "4": ["888"],
  "5": ["555"],
  "6": ["222"],
  "7": ["999"],
  "8": ["666"],
  "9": ["333"],
  "0": ["000"],
};

const getMaxLength = (type: string) => {
  if (type === "SINGLE") return 1;
  if (type === "JODI") return 2;
  return 3;
};

interface PendingEntry {
  gameType: string;
  number: string;
  amount: number;
  playerName: string;
}

interface GameTypeSelectorProps {
  game: Game;
  playType: "open" | "close";
  onClose: () => void;
  onSubmit: (entries: PendingEntry[]) => Promise<void> | void;
  userBalance: number;
  userId: number;
}

const GameTypeSelector = ({
  game,
  playType,
  onClose,
  onSubmit,
  userBalance,
  userId,
}: GameTypeSelectorProps) => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedSPDPTP, setSelectedSPDPTP] = useState("");
  const [inputDigit, setInputDigit] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [entries, setEntries] = useState<PendingEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [canAddPlayerName, setCanAddPlayerName] = useState(false);
  const [userName, setUserName] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const [errorPopup, setErrorPopup] = useState("");
  const [playerNameError, setPlayerNameError] = useState("");
  const [amountError, setAmountError] = useState("");
  const { toast } = useToast();

  const totalAmount = entries.reduce((s, e) => s + e.amount, 0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUserById(userId);
        if (user) {
          setCanAddPlayerName(user.canAddPlayerName || false);
          setUserName(user.name || "");
          if (!user.canAddPlayerName) {
            setPlayerName(user.name || "");
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, [userId]);

  useEffect(() => {
    if (selectedSPDPTP && inputDigit && inputDigit.length === 1) {
      if (selectedSPDPTP === "SP") {
        setAvailableNumbers(SP_NUMBERS[inputDigit] || []);
      } else if (selectedSPDPTP === "DP") {
        setAvailableNumbers(DP_NUMBERS[inputDigit] || []);
      } else if (selectedSPDPTP === "TP") {
        setAvailableNumbers(TP_NUMBERS[inputDigit] || []);
      }
    } else {
      setAvailableNumbers([]);
    }
  }, [selectedSPDPTP, inputDigit]);

  const getAvailableGameTypes = () => {
    return playType === "open" ? OPEN_GAME_TYPES : CLOSE_GAME_TYPES;
  };

  const isValidSinglePana = (num: string): boolean =>
    SINGLE_PANA_NUMBERS.includes(num);

  const isValidDoublePana = (num: string): boolean =>
    DOUBLE_PANA_NUMBERS.includes(num);

  const isValidTriplePatti = (num: string): boolean =>
    TRIPLE_PATTI_NUMBERS.includes(num);

  const resetEntryFields = () => {
    setSelectedNumber("");
    setAmount("");
    setAmountError("");
  };

  const validateAmount = (amt: number, gameType?: string): boolean => {
    // For SINGLE type: min ₹10, max ₹1000
    if (gameType === "SINGLE") {
      if (amt < 10) {
        setAmountError("Minimum amount for SINGLE is ₹10");
        return false;
      }
      if (amt > 1000) {
        setAmountError("Maximum amount is ₹1000");
        return false;
      }
      setAmountError("");
      return true;
    }
    
    // For all other types: min ₹5, max ₹1000
    if (amt < 5) {
      setAmountError("Minimum amount is ₹5");
      return false;
    }
    if (amt > 1000) {
      setAmountError("Maximum amount is ₹1000");
      return false;
    }
    setAmountError("");
    return true;
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setAmount(numericValue);
    
    if (numericValue) {
      const amt = parseInt(numericValue, 10);
      validateAmount(amt, selectedType);
    } else {
      setAmountError("");
    }
  };

  const validatePlayerName = () => {
    if (canAddPlayerName && !playerName.trim()) {
      setPlayerNameError("Player name is required!");
      return false;
    }
    setPlayerNameError("");
    return true;
  };

  const handlePlayerNameChange = (value: string) => {
    setPlayerName(value);
    if (value.trim()) {
      setPlayerNameError("");
    }
  };

  const handleAddEntry = () => {
    if (canAddPlayerName && !playerName.trim()) {
      setPlayerNameError("⚠️ Player name is required!");
      toast({
        title: "Player Name Required",
        description: "Please enter a player name before adding entry.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedType) {
      toast({
        title: "Error",
        description: "Select a game type.",
        variant: "destructive",
      });
      return;
    }

    if (selectedType === "SP-DP-TP") {
      if (!selectedSPDPTP) {
        toast({
          title: "Error",
          description: "Please select SP, DP, or TP.",
          variant: "destructive",
        });
        return;
      }

      if (!inputDigit || inputDigit.length !== 1) {
        toast({
          title: "Error",
          description: "Please enter a digit (0-9).",
          variant: "destructive",
        });
        return;
      }

      if (!selectedNumber) {
        toast({
          title: "Error",
          description: "Please select a number from the table.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!selectedNumber) {
        toast({
          title: "Error",
          description: "Please enter a number.",
          variant: "destructive",
        });
        return;
      }

      const maxLen = getMaxLength(selectedType);
      if (selectedNumber.length !== maxLen) {
        toast({
          title: "Error",
          description: `Number must be ${maxLen} digit(s).`,
          variant: "destructive",
        });
        return;
      }

      if (selectedType === "SINGLE PANA" && !isValidSinglePana(selectedNumber)) {
        setErrorPopup(`Invalid Single Pana Number: ${selectedNumber}`);
        setTimeout(() => setErrorPopup(""), 2000);
        return;
      }

      if (selectedType === "DOUBLE PANA" && !isValidDoublePana(selectedNumber)) {
        setErrorPopup(`Invalid Double Pana Number: ${selectedNumber}`);
        setTimeout(() => setErrorPopup(""), 2000);
        return;
      }

      if (selectedType === "TRIPLE PATTI" && !isValidTriplePatti(selectedNumber)) {
        setErrorPopup(`Invalid Triple Patti Number: ${selectedNumber}`);
        setTimeout(() => setErrorPopup(""), 2000);
        return;
      }
    }

    const amt = parseInt(amount, 10);

    if (!amt || amt <= 0) {
      toast({
        title: "Error",
        description: "Enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (!validateAmount(amt, selectedType)) {
      toast({
        title: "Invalid Amount",
        description: amountError,
        variant: "destructive",
      });
      return;
    }

    const finalPlayerName = canAddPlayerName ? playerName.trim() : userName;
    const gameTypeToStore =
      selectedType === "SP-DP-TP" ? selectedSPDPTP : selectedType;

    setEntries((prev) => [
      ...prev,
      {
        gameType: gameTypeToStore,
        number: selectedNumber,
        amount: amt,
        playerName: finalPlayerName,
      },
    ]);

    const addedNumber = selectedNumber;
    resetEntryFields();

    toast({
      title: "✓ Added Successfully",
      description: `${gameTypeToStore} - ${addedNumber} @ ₹${amt} for ${finalPlayerName}`,
    });
  };

  const handleAddAllNumbers = () => {
    if (canAddPlayerName && !playerName.trim()) {
      setPlayerNameError("⚠️ Player name is required!");
      toast({
        title: "Player Name Required",
        description: "Please enter a player name before adding entries.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedType || selectedType !== "SP-DP-TP") {
      toast({
        title: "Error",
        description: "This option is only for SP-DP-TP.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSPDPTP) {
      toast({
        title: "Error",
        description: "Please select SP, DP, or TP.",
        variant: "destructive",
      });
      return;
    }

    if (!inputDigit || inputDigit.length !== 1) {
      toast({
        title: "Error",
        description: "Please enter a digit (0-9).",
        variant: "destructive",
      });
      return;
    }

    if (availableNumbers.length === 0) {
      toast({
        title: "Error",
        description: `No numbers found for digit ${inputDigit}.`,
        variant: "destructive",
      });
      return;
    }

    const amt = parseInt(amount, 10);

    if (!amt || amt <= 0) {
      toast({
        title: "Error",
        description: "Enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    // For SP-DP-TP, keep the existing validation (min ₹5)
    if (amt < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is ₹5",
        variant: "destructive",
      });
      return;
    }
    if (amt > 1000) {
      toast({
        title: "Invalid Amount",
        description: "Maximum amount is ₹1000",
        variant: "destructive",
      });
      return;
    }

    const finalPlayerName = canAddPlayerName ? playerName.trim() : userName;

    const newEntries = availableNumbers.map((num) => ({
      gameType: selectedSPDPTP,
      number: num,
      amount: amt,
      playerName: finalPlayerName,
    }));

    setEntries((prev) => [...prev, ...newEntries]);
    resetEntryFields();

    toast({
      title: "✓ Bulk Added",
      description: `${newEntries.length} numbers added for ${selectedSPDPTP} digit ${inputDigit} @ ₹${amt} each`,
    });
  };

  const removeEntry = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (entries.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one entry.",
        variant: "destructive",
      });
      return;
    }

    const missingPlayerName = entries.some((e) => !e.playerName);
    if (missingPlayerName) {
      toast({
        title: "Error",
        description: "All entries must have a player name.",
        variant: "destructive",
      });
      return;
    }

    if (totalAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₹${totalAmount} but have ₹${userBalance}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(entries);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGameTypeClick = (type: string) => {
    setSelectedType(type);
    setSelectedSPDPTP("");
    setInputDigit("");
    setSelectedNumber("");
    setAvailableNumbers([]);
    setAmount("");
    setAmountError("");
  };

  const availableGameTypes = getAvailableGameTypes();

  const formatTime = (time: string) => {
    const parts = time.split(":").map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const getAmountPlaceholder = () => {
    if (selectedType === "SINGLE") {
      return "Min ₹10 - Max ₹1000";
    }
    return "Min ₹5 - Max ₹1000";
  };

  const getAmountHint = () => {
    if (selectedType === "SINGLE") {
      return "Minimum: ₹10 | Maximum: ₹1000 (SINGLE only)";
    }
    return "Minimum: ₹5 | Maximum: ₹1000";
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header with Back Button */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-5 py-4 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono text-sm font-semibold">Back</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-4 py-2 shadow-md">
              <p className="text-[10px] font-mono text-blue-100">Balance</p>
              <p className="text-lg font-mono font-bold text-white">₹{userBalance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-24">
        {/* Player Name Section */}
        {canAddPlayerName ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider">
                👤 PLAYER NAME <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                <Hash className="w-3 h-3" />
                <span>Entry #{entries.length + 1}</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => handlePlayerNameChange(e.target.value)}
                placeholder="Enter player name"
                className={`w-full bg-gray-50 border-2 pl-11 pr-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none rounded-xl transition-all duration-200 ${
                  playerNameError ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400 focus:bg-white"
                }`}
                required
              />
              {playerNameError && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {playerNameError && (
              <div className="mt-2 flex items-center gap-1 text-red-600 text-[10px] font-mono font-semibold">
                <AlertCircle className="w-3 h-3" />
                <span>{playerNameError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">PLAYING AS</p>
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold bg-white px-3 py-1 rounded-full text-gray-700 shadow-sm">
                <Hash className="w-3 h-3 text-blue-600" />
                <span>Entry #{entries.length + 1}</span>
              </div>
            </div>
            <p className="text-base font-mono font-bold text-blue-600 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {userName}
            </p>
          </div>
        )}

        {/* Game Type Selection */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
          <p className="text-xs font-mono font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            SELECT GAME TYPE
          </p>
          <div className="grid grid-cols-3 gap-3">
            {availableGameTypes.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => handleGameTypeClick(type)}
                className={`py-2.5 px-2 text-[11px] font-mono font-bold border-2 rounded-xl transition-all duration-200 ${
                  selectedType === type
                    ? "border-blue-500 text-blue-600 bg-blue-50 shadow-md scale-105"
                    : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Regular Game Type Form */}
        {selectedType && selectedType !== "SP-DP-TP" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5 shadow-sm animate-fadeIn">
            <div>
              <label className="text-xs font-mono font-bold text-gray-700 mb-2 block flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                Number ({getMaxLength(selectedType)} digits)
              </label>
              <input
                type="text"
                maxLength={getMaxLength(selectedType)}
                value={selectedNumber}
                onChange={(e) => setSelectedNumber(e.target.value.replace(/\D/g, ""))}
                placeholder={`Enter ${getMaxLength(selectedType)} digit number`}
                className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-400 focus:bg-white rounded-xl transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-gray-700 mb-2 block flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                Enter Amount (₹)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={getAmountPlaceholder()}
                className={`w-full bg-gray-50 border-2 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none rounded-xl transition-all duration-200 ${
                  amountError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-400 focus:bg-white"
                }`}
              />
              {amountError && (
                <div className="mt-2 flex items-center gap-1 text-red-600 text-[10px] font-mono font-semibold">
                  <AlertCircle className="w-3 h-3" />
                  <span>{amountError}</span>
                </div>
              )}
              <p className="text-[9px] font-mono text-gray-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {getAmountHint()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddEntry}
              disabled={!selectedNumber || !amount || submitting || !!amountError}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 font-mono text-sm font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              + Add Entry
            </button>
          </div>
        )}

        {/* SP-DP-TP Selection */}
        {selectedType === "SP-DP-TP" && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-5 shadow-sm animate-fadeIn">
            <p className="text-xs font-mono font-bold text-blue-600 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              SP/DP/TP SELECTION
            </p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {SP_DP_TP_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => {
                    setSelectedSPDPTP(option);
                    setInputDigit("");
                    setSelectedNumber("");
                    setAvailableNumbers([]);
                    setAmount("");
                    setAmountError("");
                  }}
                  className={`py-2.5 px-2 text-sm font-mono font-bold border-2 rounded-xl transition-all duration-200 ${
                    selectedSPDPTP === option
                      ? "border-blue-500 bg-blue-600 text-white shadow-md"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {selectedSPDPTP && (
              <div className="mb-5">
                <label className="text-xs font-mono font-bold text-gray-700 mb-2 block">
                  🔢 Enter Digit (0-9) for {selectedSPDPTP}
                </label>
                <input
                  type="text"
                  maxLength={1}
                  value={inputDigit}
                  onChange={(e) => {
                    const digit = e.target.value.replace(/\D/g, "");
                    setInputDigit(digit);
                    setSelectedNumber("");
                  }}
                  placeholder="Enter digit"
                  className="w-full bg-white border-2 border-gray-200 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-400 rounded-xl transition-all duration-200"
                />
              </div>
            )}

            {inputDigit && availableNumbers.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-mono font-semibold text-gray-600 mb-3">
                  {selectedSPDPTP} Numbers Starting with {inputDigit} ({availableNumbers.length} numbers)
                </p>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto bg-white">
                  <div className="grid grid-cols-4 gap-1 p-3">
                    {availableNumbers.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedNumber(num)}
                        className={`py-2 px-2 text-xs font-mono font-semibold rounded-lg transition-all duration-150 ${
                          selectedNumber === num
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {inputDigit && availableNumbers.length > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono font-bold text-gray-700 mb-2 block flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-green-600" />
                    Amount per Number (₹)
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Min ₹5 - Max ₹1000"
                    className={`w-full bg-white border-2 px-4 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none rounded-xl transition-all duration-200 ${
                      amountError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                    }`}
                  />
                  {amountError && (
                    <div className="mt-2 flex items-center gap-1 text-red-600 text-[10px] font-mono font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      <span>{amountError}</span>
                    </div>
                  )}
                  <p className="text-[9px] font-mono text-gray-500 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Minimum: ₹5 | Maximum: ₹1000
                  </p>
                </div>

                {amount && !amountError && (
                  <div className="flex gap-3">
                    {selectedNumber && (
                      <button
                        type="button"
                        onClick={handleAddEntry}
                        disabled={submitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-mono text-xs font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 transform hover:scale-[1.02]"
                      >
                        Add {selectedNumber}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleAddAllNumbers}
                      disabled={submitting}
                      className="flex-1 border-2 border-blue-600 text-blue-600 py-2.5 font-mono text-xs font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      Add All ({availableNumbers.length})
                    </button>
                  </div>
                )}

                {amount && !amountError && (
                  <div className="bg-blue-100 rounded-xl p-3 text-center">
                    <p className="text-xs font-mono font-bold text-blue-700">
                      Total (All): ₹{parseInt(amount || "0", 10) * availableNumbers.length}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pending Entries */}
        {entries.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono font-bold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-600" />
                PENDING ENTRIES
              </p>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
              </div>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {entries.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border-l-4 border-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="text-xs font-mono font-semibold">
                      <span className="text-blue-600 font-bold">#{i + 1}</span>{" "}
                      <span className="text-gray-900">{e.gameType}</span> - <span className="text-gray-700 font-bold">{e.number}</span>
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 mt-1">
                      👤 {e.playerName} | 💰 ₹{e.amount}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(i)}
                    disabled={submitting}
                    className="text-red-400 hover:text-red-600 disabled:opacity-40 transition-all duration-200 hover:scale-110 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
              <span className="text-xs font-mono font-bold text-gray-700">Total Amount:</span>
              <span className="text-xl font-mono font-bold text-blue-600">₹{totalAmount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-5 shadow-lg">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3.5 font-mono text-sm font-semibold text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={entries.length === 0 || submitting}
            className="flex-1 py-3.5 font-mono text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            {submitting ? "⏳ Submitting..." : `✅ Submit (${entries.length})`}
          </button>
        </div>
      </div>

      {/* Error Popup */}
      {errorPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[200] animate-fadeIn">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-mono text-sm font-bold shadow-2xl transform animate-bounce">
            ⚠️ {errorPopup}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTypeSelector;