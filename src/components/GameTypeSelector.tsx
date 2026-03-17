import { useState, useEffect } from "react";
import { X, Trash2, User, Hash } from "lucide-react";
import { Game, getUserById } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

// Game types for OPEN time (ALL types including JODI)
const OPEN_GAME_TYPES = ["SINGLE", "JODI", "SINGLE PANA", "DOUBLE PANA", "TRIPLE PATTI", "SP-DP-TP"];

// Game types for CLOSE time (JODI removed)
const CLOSE_GAME_TYPES = ["SINGLE", "SINGLE PANA", "DOUBLE PANA", "TRIPLE PATTI", "SP-DP-TP"];

// SP, DP, TP options
const SP_DP_TP_OPTIONS = ["SP", "DP", "TP"];

// Complete Single Pana Numbers
const SINGLE_PANA_NUMBERS = [
  '128', '137', '146', '236', '245', '290', '380', '470', '489', '560', '579', '678',
  '129', '138', '147', '156', '237', '146', '345', '390', '480', '570', '589', '679',
  '120', '139', '148', '157', '238', '247', '256', '340', '346', '356', '457', '467',
  '130', '149', '158', '167', '239', '248', '257', '267', '347', '357', '367', '468',
  '140', '159', '168', '230', '249', '258', '259', '268', '348', '358', '368', '378',
  '123', '150', '169', '178', '240', '269', '278', '279', '349', '359', '369', '379',
  '124', '160', '179', '250', '269', '260', '270', '280', '289', '389', '389', '389',
  '125', '134', '170', '189', '260', '280', '290', '360', '370', '450', '460', '470',
  '126', '135', '180', '270', '234', '289', '290', '345', '356', '456', '457', '467',
  '127', '136', '145', '190', '280', '245', '289', '290', '345', '356', '456', '457'
];

// Complete Double Pana Numbers
const DOUBLE_PANA_NUMBERS = [
  '100', '200', '300', '400', '500', '600', '700', '800', '900', '550',
  '119', '110', '166', '112', '113', '114', '115', '116', '117', '118',
  '155', '228', '229', '220', '122', '277', '133', '224', '144', '226',
  '227', '255', '337', '266', '177', '330', '188', '233', '199', '244',
  '335', '336', '355', '338', '339', '448', '223', '288', '225', '299',
  '344', '499', '445', '446', '366', '466', '377', '440', '388', '334',
  '399', '660', '599', '455', '447', '556', '449', '477', '559', '488',
  '588', '688', '779', '699', '799', '880', '557', '558', '577', '668',
  '669', '778', '788', '770', '889', '899', '566', '990', '667', '677'
];

// Complete Triple Patti Numbers from your table
const TRIPLE_PATTI_NUMBERS = [
  '777', '444', '111', '888', '555', '222', '999', '666', '333', '000'
];

// SP Numbers organized by first digit
const SP_NUMBERS: { [key: string]: string[] } = {
  '1': ['128', '137', '146', '236', '245', '290', '380', '470', '489', '560', '579', '678'],
  '2': ['129', '138', '147', '156', '237', '146', '345', '390', '480', '570', '589', '679'],
  '3': ['120', '139', '148', '157', '238', '247', '256', '340', '346', '356', '457', '467'],
  '4': ['130', '149', '158', '167', '239', '248', '257', '267', '347', '357', '367', '468'],
  '5': ['140', '159', '168', '230', '249', '258', '259', '268', '348', '358', '368', '378'],
  '6': ['123', '150', '169', '178', '240', '269', '278', '279', '349', '359', '369', '379'],
  '7': ['124', '160', '179', '250', '269', '260', '270', '280', '289', '389', '389', '389'],
  '8': ['125', '134', '170', '189', '260', '280', '290', '360', '370', '450', '460', '470'],
  '9': ['126', '135', '180', '270', '234', '289', '290', '345', '356', '456', '457', '467'],
  '0': ['127', '136', '145', '190', '280', '245', '289', '290', '345', '356', '456', '457']
};

// DP numbers organized by digit (0-9)
const DP_NUMBERS: { [key: string]: string[] } = {
  '1': ['100', '119', '155', '227', '335', '344', '399', '588', '669'],
  '2': ['200', '110', '228', '255', '336', '499', '660', '688', '778'],
  '3': ['300', '166', '229', '266', '337', '556', '677', '699', '779'],
  '4': ['400', '112', '220', '277', '338', '557', '668', '788', '880'],
  '5': ['500', '113', '221', '288', '339', '558', '669', '789', '889'],
  '6': ['600', '114', '222', '299', '344', '559', '677', '799', '899'],
  '7': ['700', '115', '223', '366', '377', '566', '688', '788', '889'],
  '8': ['800', '116', '224', '377', '388', '567', '669', '778', '899'],
  '9': ['900', '117', '225', '388', '399', '568', '677', '779', '990'],
  '0': ['550', '118', '226', '399', '448', '569', '678', '788', '889']
};

// TP numbers organized by digit (0-9)
const TP_NUMBERS: { [key: string]: string[] } = {
  '1': ['777'],
  '2': ['444'],
  '3': ['111'],
  '4': ['888'],
  '5': ['555'],
  '6': ['222'],
  '7': ['999'],
  '8': ['666'],
  '9': ['333'],
  '0': ['000']
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
  onSubmit: (entries: PendingEntry[]) => void;
  userBalance: number;
  userId: string;
}

const GameTypeSelector = ({ game, playType, onClose, onSubmit, userBalance, userId }: GameTypeSelectorProps) => {
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
  const { toast } = useToast();
  const [errorPopup, setErrorPopup] = useState("");
  const totalAmount = entries.reduce((s, e) => s + e.amount, 0);

  // Check user permission on component mount
  useEffect(() => {
    const user = getUserById(userId);
    if (user) {
      setCanAddPlayerName(user.canAddPlayerName || false);
      setUserName(user.name);
      // If user cannot add player name, set it to their own name
      if (!user.canAddPlayerName) {
        setPlayerName(user.name);
      }
    }
  }, [userId]);

  // Update available numbers when SP/DP/TP and digit are selected
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

  // Get available game types based on playType
  const getAvailableGameTypes = () => {
    return playType === "open" ? OPEN_GAME_TYPES : CLOSE_GAME_TYPES;
  };

  const isValidSinglePana = (num: string): boolean => {
    return SINGLE_PANA_NUMBERS.includes(num);
  };

  const isValidDoublePana = (num: string): boolean => {
    return DOUBLE_PANA_NUMBERS.includes(num);
  };

  const isValidTriplePatti = (num: string): boolean => {
    return TRIPLE_PATTI_NUMBERS.includes(num);
  };

  const handleAddEntry = () => {
    // Validate player name
    if (canAddPlayerName && !playerName.trim()) {
      toast({ 
        title: "Error", 
        description: "Player name is required.", 
        variant: "destructive" 
      });
      return;
    }

    if (!selectedType) {
      toast({ title: "Error", description: "Select a game type.", variant: "destructive" });
      return;
    }

    // For SP-DP-TP, validate selections
    if (selectedType === "SP-DP-TP") {
      if (!selectedSPDPTP) {
        toast({ 
          title: "Error", 
          description: "Please select SP, DP, or TP.", 
          variant: "destructive" 
        });
        return;
      }
      if (!inputDigit || inputDigit.length !== 1) {
        toast({ 
          title: "Error", 
          description: "Please enter a digit (0-9).", 
          variant: "destructive" 
        });
        return;
      }
      if (!selectedNumber) {
        toast({ 
          title: "Error", 
          description: "Please select a number from the table.", 
          variant: "destructive" 
        });
        return;
      }
    } else {
      // Regular validation for other types
      if (!selectedNumber) {
        toast({ title: "Error", description: "Please enter a number.", variant: "destructive" });
        return;
      }

      const maxLen = getMaxLength(selectedType);
      if (selectedNumber.length !== maxLen) {
        toast({ title: "Error", description: `Number must be ${maxLen} digit(s).`, variant: "destructive" });
        return;
      }

      // Validate Single Pana numbers
      if (selectedType === "SINGLE PANA") {
        if (!isValidSinglePana(selectedNumber)) {
          setErrorPopup(`Invalid Single Pana Number: ${selectedNumber}`);
          setTimeout(() => setErrorPopup(""), 2000);
          return;
        }
      }

      // Validate Double Pana numbers
      if (selectedType === "DOUBLE PANA") {
        if (!isValidDoublePana(selectedNumber)) {
          setErrorPopup(`Invalid Double Pana Number: ${selectedNumber}`);
          setTimeout(() => setErrorPopup(""), 2000);
          return;
        }
      }

      // Validate Triple Patti numbers
      if (selectedType === "TRIPLE PATTI") {
        if (!isValidTriplePatti(selectedNumber)) {
          setErrorPopup(`Invalid Triple Patti Number: ${selectedNumber}`);
          setTimeout(() => setErrorPopup(""), 2000);
          return;
        }
      }
    }

    const amt = parseInt(amount);

    if (!amt || amt <= 0) {
      toast({ title: "Error", description: "Enter a valid amount.", variant: "destructive" });
      return;
    }

    // Use user's own name if they don't have permission
    const finalPlayerName = canAddPlayerName ? playerName.trim() : userName;

    // Determine the game type to store
    const gameTypeToStore = selectedType === "SP-DP-TP" ? selectedSPDPTP : selectedType;

    // Add single entry
    setEntries([...entries, { 
      gameType: gameTypeToStore, 
      number: selectedNumber, 
      amount: amt,
      playerName: finalPlayerName
    }]);

    // Reset for next entry
    setSelectedNumber("");
    setAmount("");

    toast({ 
      title: "Added", 
      description: `${gameTypeToStore} - ${selectedNumber} @ ₹${amt} for ${finalPlayerName}` 
    });
  };

  const handleAddAllNumbers = () => {
    // Validate player name
    if (canAddPlayerName && !playerName.trim()) {
      toast({ 
        title: "Error", 
        description: "Player name is required.", 
        variant: "destructive" 
      });
      return;
    }

    if (!selectedType || selectedType !== "SP-DP-TP") {
      toast({ title: "Error", description: "This option is only for SP-DP-TP.", variant: "destructive" });
      return;
    }

    if (!selectedSPDPTP) {
      toast({ 
        title: "Error", 
        description: "Please select SP, DP, or TP.", 
        variant: "destructive" 
      });
      return;
    }

    if (!inputDigit || inputDigit.length !== 1) {
      toast({ 
        title: "Error", 
        description: "Please enter a digit (0-9).", 
        variant: "destructive" 
      });
      return;
    }

    if (availableNumbers.length === 0) {
      toast({ 
        title: "Error", 
        description: `No numbers found for digit ${inputDigit}.`, 
        variant: "destructive" 
      });
      return;
    }

    const amt = parseInt(amount);

    if (!amt || amt <= 0) {
      toast({ title: "Error", description: "Enter a valid amount.", variant: "destructive" });
      return;
    }

    // Use user's own name if they don't have permission
    const finalPlayerName = canAddPlayerName ? playerName.trim() : userName;

    // Create entries for ALL numbers in the table
    const newEntries = availableNumbers.map(num => ({
      gameType: selectedSPDPTP,
      number: num,
      amount: amt,
      playerName: finalPlayerName
    }));

    setEntries([...entries, ...newEntries]);
    
    // Reset but keep digit for next batch
    setAmount("");
    setSelectedNumber("");

    toast({ 
      title: "Added", 
      description: `${newEntries.length} numbers added for ${selectedSPDPTP} digit ${inputDigit} @ ₹${amt} each` 
    });
  };

  const removeEntry = (idx: number) => setEntries(entries.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (entries.length === 0) { 
      toast({ title: "Error", description: "Add at least one entry.", variant: "destructive" }); 
      return; 
    }
    
    const missingPlayerName = entries.some(e => !e.playerName);
    if (missingPlayerName) {
      toast({ 
        title: "Error", 
        description: "All entries must have a player name.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (totalAmount > userBalance) { 
      toast({ title: "Error", description: "Insufficient balance.", variant: "destructive" }); 
      return; 
    }
    
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(entries);
      setSubmitting(false);
    }, 200);
  };

  // Reset when changing main game type
  const handleGameTypeClick = (type: string) => {
    setSelectedType(type);
    setSelectedSPDPTP("");
    setInputDigit("");
    setSelectedNumber("");
    setAvailableNumbers([]);
    setAmount("");
  };

  const availableGameTypes = getAvailableGameTypes();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full bg-card flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground/10">
          <div>
            <h3 className="font-mono font-bold text-sm text-foreground">{game.name}</h3>
            <p className="text-[10px] font-mono text-muted-foreground">Play {playType.toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Player Name */}
          {canAddPlayerName ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono text-muted-foreground">
                  PLAYER NAME <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-1 text-[10px] font-mono bg-accent/30 px-2 py-0.5 rounded">
                  <Hash className="w-3 h-3 text-primary" />
                  <span>Entry #{entries.length + 1}</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2.5 text-sm font-mono"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="surface-raised p-3 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-mono text-muted-foreground">PLAYING AS</p>
                <div className="flex items-center gap-1 text-[10px] font-mono bg-accent/30 px-2 py-0.5 rounded">
                  <Hash className="w-3 h-3 text-primary" />
                  <span>Entry #{entries.length + 1}</span>
                </div>
              </div>
              <p className="text-sm font-mono font-bold text-primary">{userName}</p>
            </div>
          )}

          {/* Game Types */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground mb-2">GAME TYPE</p>
            <div className="grid grid-cols-3 gap-2">
              {availableGameTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleGameTypeClick(type)}
                  className={`py-2 px-1 text-[10px] font-mono font-semibold border-2 ${
                    selectedType === type 
                      ? "border-primary text-primary bg-primary/10" 
                      : "border-foreground/10 text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Regular Number Input for other game types */}
          {selectedType && selectedType !== "SP-DP-TP" && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground mb-1 block">
                  Number ({getMaxLength(selectedType)} digits)
                </label>
                <input
                  type="text"
                  maxLength={getMaxLength(selectedType)}
                  value={selectedNumber}
                  onChange={(e) => setSelectedNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder={`Enter ${getMaxLength(selectedType)} digit number`}
                  className="w-full bg-input border-2 border-foreground/10 px-3 py-2.5 text-sm font-mono"
                />
                {selectedType === "SINGLE PANA" && selectedNumber && !isValidSinglePana(selectedNumber) && (
                  <p className="text-[10px] text-destructive mt-1">
                    Invalid Single Pana Number
                  </p>
                )}
                {selectedType === "DOUBLE PANA" && selectedNumber && !isValidDoublePana(selectedNumber) && (
                  <p className="text-[10px] text-destructive mt-1">
                    Invalid Double Pana Number
                  </p>
                )}
                {selectedType === "TRIPLE PATTI" && selectedNumber && !isValidTriplePatti(selectedNumber) && (
                  <p className="text-[10px] text-destructive mt-1">
                    Invalid Triple Patti Number
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground mb-1 block">Enter Amount (₹)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter amount"
                  className="w-full bg-input border-2 border-foreground/10 px-3 py-2.5 text-sm font-mono"
                />
              </div>
              <button
                onClick={handleAddEntry}
                disabled={!selectedNumber || !amount}
                className="w-full bg-primary text-white py-3 font-mono text-sm font-semibold rounded hover:opacity-90 disabled:opacity-40"
              >
                Add Entry
              </button>
            </div>
          )}

          {/* SP-DP-TP Selection */}
          {selectedType === "SP-DP-TP" && (
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <p className="text-xs font-mono font-bold text-primary mb-3">SP/DP/TP SELECTION</p>
              
              {/* SP/DP/TP Options */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {SP_DP_TP_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedSPDPTP(option);
                      setInputDigit("");
                      setSelectedNumber("");
                      setAvailableNumbers([]);
                    }}
                    className={`py-2 px-1 text-sm font-mono font-semibold border-2 rounded ${
                      selectedSPDPTP === option 
                        ? "border-primary bg-primary text-white" 
                        : "border-foreground/10 text-foreground hover:border-primary/30"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Digit Input */}
              {selectedSPDPTP && (
                <div className="mb-4">
                  <label className="text-[10px] font-mono text-muted-foreground mb-1 block">
                    Enter Digit (0-9) for {selectedSPDPTP}
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
                    className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono"
                  />
                </div>
              )}

              {/* Numbers Table */}
              {inputDigit && availableNumbers.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-mono text-muted-foreground mb-2">
                    {selectedSPDPTP} Numbers Starting with {inputDigit} ({availableNumbers.length} numbers)
                  </p>
                  <div className="border-2 border-foreground/10 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {Array.from({ length: Math.ceil(availableNumbers.length / 4) }).map((_, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-foreground/10">
                            {[0, 1, 2, 3].map((colIndex) => {
                              const numIndex = rowIndex * 4 + colIndex;
                              const num = availableNumbers[numIndex];
                              return (
                                <td key={colIndex} className="p-1 border-r border-foreground/10 last:border-r-0">
                                  {num && (
                                    <button
                                      onClick={() => setSelectedNumber(num)}
                                      className={`w-full py-1 px-1 text-xs font-mono rounded ${
                                        selectedNumber === num 
                                          ? "bg-primary text-white" 
                                          : "hover:bg-accent/20"
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              {inputDigit && availableNumbers.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground mb-1 block">
                      Amount per Number (₹)
                    </label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter amount"
                      className="w-full bg-input border-2 border-foreground/10 px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  
                  {amount && (
                    <div className="flex gap-2">
                      {/* Add Single Number Button */}
                      {selectedNumber && (
                        <button
                          onClick={handleAddEntry}
                          className="flex-1 bg-primary text-white py-2 font-mono text-xs rounded hover:opacity-90"
                        >
                          Add {selectedNumber} @ ₹{amount}
                        </button>
                      )}
                      
                      {/* Add All Numbers Button */}
                      <button
                        onClick={handleAddAllNumbers}
                        className="flex-1 border-2 border-primary text-primary py-2 font-mono text-xs rounded hover:bg-primary/10"
                      >
                        Add All {availableNumbers.length} Numbers
                      </button>
                    </div>
                  )}
                  
                  {amount && (
                    <p className="text-xs font-mono text-center text-primary">
                      Total (All): ₹{parseInt(amount || "0") * availableNumbers.length}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pending Entries */}
          {entries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono text-muted-foreground">PENDING ENTRIES</p>
                <div className="flex items-center gap-1 text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                  <Hash className="w-3 h-3" />
                  <span>{entries.length}</span>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {entries.map((e, i) => (
                  <div key={i} className="flex items-center justify-between surface-raised px-3 py-2 border-l-4 border-primary">
                    <div>
                      <p className="text-xs font-mono">
                        <span className="text-primary font-bold">#{i + 1}</span> {e.gameType} - {e.number}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {e.playerName} | ₹{e.amount}
                      </p>
                    </div>
                    <button onClick={() => removeEntry(i)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 pt-2 border-t">
                <span className="text-xs font-mono">Total:</span>
                <span className="text-sm font-mono font-bold text-primary">₹{totalAmount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex border-t-2">
          <button onClick={onClose} className="flex-1 py-3 font-mono text-xs text-muted-foreground">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={entries.length === 0}
            className="flex-1 py-3 font-mono text-xs bg-primary text-white"
          >
            Submit ({entries.length})
          </button>
        </div>

        {errorPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-mono text-sm">
              {errorPopup}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameTypeSelector;