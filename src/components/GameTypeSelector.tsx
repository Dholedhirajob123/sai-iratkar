import { useState } from "react";
import { X, Trash2, User } from "lucide-react";
import { Game } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const GAME_TYPES = ["SINGLE", "JODI", "SINGLE PANA", "DOUBLE PANA", "TRIPLE PATTI", "SP-DP-TP"];

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
}

const GameTypeSelector = ({ game, playType, onClose, onSubmit, userBalance }: GameTypeSelectorProps) => {
  const [selectedType, setSelectedType] = useState("");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [entries, setEntries] = useState<PendingEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [errorPopup, setErrorPopup] = useState("");
  const totalAmount = entries.reduce((s, e) => s + e.amount, 0);

  // Number Single double triple
  const SINGLE_PANA_NUMBERS = [
    '128','129','120','130','140','123','124','125','126','127',
    '137','138','139','149','159','150','160','134','135','136',
    '146','147','148','158','168','169','179','170','180','145',
    '236','156','157','167','230','178','250','189','270','190',
    '245','237','238','239','249','240','269','260','234','280',
    '290','146','247','248','258','259','278','279','289','235',
    '380','345','256','257','267','268','340','350','360','370',
    '470','390','346','347','348','349','359','369','379','389',
    '489','480','490','356','357','358','368','378','450','460',
    '560','570','580','590','456','367','458','459','469','479',
    '579','589','670','680','690','457','467','468','478','569',
    '678','679','689','789','780','790','890','567','568','578'
  ];

  const DOUBLE_PANA_NUMBERS = [
    '100','200','300','400','500','600','700','800','900','550',
    '119','110','166','112','113','114','115','116','117','118',
    '155','228','229','220','122','277','133','224','144','226',
    '227','255','337','266','177','330','188','233','199','244',
    '335','336','355','338','339','448','223','288','225','299',
    '344','499','445','446','366','466','377','440','388','334',
    '399','660','599','455','447','556','449','477','559','488',
    '588','688','779','699','799','880','557','558','577','668',
    '669','778','788','770','889','899','566','990','667','677'
  ];

  const TRIPLE_PATTI_NUMBERS = [
    '777','444','111','888','555','222','999','666','333','000'
  ];

  const handleAddEntry = () => {
    // Validate player name
    if (!playerName.trim()) {
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

    const maxLen = getMaxLength(selectedType);

    if (number.length !== maxLen) {
      toast({ title: "Error", description: `Number must be ${maxLen} digit(s).`, variant: "destructive" });
      return;
    }

    // SINGLE PANA VALIDATION
    if (selectedType === "SINGLE PANA" && !SINGLE_PANA_NUMBERS.includes(number)) {
      setErrorPopup("Invalid Single Pana Number");
      setTimeout(() => setErrorPopup(""), 2000);
      return;
    }

    // DOUBLE PANA
    if (selectedType === "DOUBLE PANA" && !DOUBLE_PANA_NUMBERS.includes(number)) {
      setErrorPopup("Invalid Double Pana Number");
      setTimeout(() => setErrorPopup(""), 2000);
      return;
    }

    // TRIPLE PATTI
    if (selectedType === "TRIPLE PATTI" && !TRIPLE_PATTI_NUMBERS.includes(number)) {
      setErrorPopup("Invalid Triple Patti Number");
      setTimeout(() => setErrorPopup(""), 2000);
      return;
    }

    const amt = parseInt(amount);

    if (!amt || amt <= 0) {
      toast({ title: "Error", description: "Enter a valid amount.", variant: "destructive" });
      return;
    }

    setEntries([...entries, { 
      gameType: selectedType, 
      number, 
      amount: amt,
      playerName: playerName.trim()
    }]);

    setNumber("");
    setAmount("");
    // Keep player name for next entries

    toast({ 
      title: "Added", 
      description: `${selectedType} - ${number} @ ₹${amt} for ${playerName}` 
    });
  };

  const removeEntry = (idx: number) => setEntries(entries.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (entries.length === 0) { 
      toast({ title: "Error", description: "Add at least one entry.", variant: "destructive" }); 
      return; 
    }
    
    // Verify all entries have player names
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
          {/* Player Name Input - Required */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">
              PLAYER NAME <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name"
                className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                required
              />
            </div>
            {!playerName.trim() && (
              <p className="text-[8px] font-mono text-destructive mt-1">Player name is required</p>
            )}
          </div>

          {/* Game types */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground mb-2 tracking-wider">GAME TYPE</p>
            <div className="grid grid-cols-3 gap-2">
              {GAME_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setNumber(""); }}
                  className={`py-2 px-1 text-[10px] font-mono font-semibold border-2 transition-colors ${
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

          {/* Inputs */}
          {selectedType && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground mb-1 block">
                  Number ({getMaxLength(selectedType)} digits)
                </label>
                <input
                  type="text"
                  maxLength={getMaxLength(selectedType)}
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter number"
                  className="w-full bg-input border-2 border-foreground/10 px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground mb-1 block">Enter Amount (₹)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter amount"
                  className="w-full bg-input border-2 border-foreground/10 px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <button 
                onClick={handleAddEntry} 
                className="w-full border-2 border-primary text-primary font-mono text-xs font-semibold py-2.5 hover:bg-primary/10 transition-colors"
              >
                Add Entry
              </button>
            </div>
          )}

          {/* Pending Entries */}
          {entries.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-muted-foreground mb-2 tracking-wider">PENDING ENTRIES</p>
              <div className="space-y-2">
                {entries.map((e, i) => (
                  <div key={i} className="flex items-center justify-between surface-raised px-3 py-2">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {e.gameType}
                      </span>
                      <p className="text-xs font-mono text-foreground">
                        #{i + 1} - {e.playerName} - {e.number} | ₹{e.amount}
                      </p>
                    </div>
                    <button onClick={() => removeEntry(i)} className="text-destructive hover:opacity-70">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 px-1">
                <span className="text-xs font-mono text-muted-foreground">Total:</span>
                <span className="text-sm font-mono font-bold text-primary">₹{totalAmount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex border-t-2 border-foreground/10">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 font-mono text-xs font-semibold text-muted-foreground hover:text-foreground border-r-2 border-foreground/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={entries.length === 0 || submitting}
            className="flex-1 py-3 font-mono text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Submit ({entries.length})
          </button>
        </div>

        {errorPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-[200]">
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-mono text-sm shadow-lg">
              {errorPopup}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameTypeSelector;