// import { useState, useEffect } from 'react';
// import { X, Percent, Gamepad2, Calculator, ChevronDown } from 'lucide-react';
// import { getGames, Game } from '@/lib/gameApi';

// interface BetType {
//   type: string;
//   defaultRate: string;
//   description: string;
//   color: string;
//   bgColor: string;
// }

// const BET_TYPES: BetType[] = [
//   { type: "SINGLE", defaultRate: "10 = 90", description: "Single digit numbers (0-9)", color: "text-green-600", bgColor: "bg-green-50" },
//   { type: "JODI", defaultRate: "10 = 900", description: "Two-digit combinations (00-99)", color: "text-yellow-600", bgColor: "bg-yellow-50" },
//   { type: "SINGLE PANA", defaultRate: "10 = 1500", description: "Three distinct digits", color: "text-orange-600", bgColor: "bg-orange-50" },
//   { type: "DOUBLE PANA", defaultRate: "10 = 3000", description: "Two same digits", color: "text-red-600", bgColor: "bg-red-50" },
//   { type: "TRIPLE PATTI", defaultRate: "10 = 6000", description: "All three digits same", color: "text-purple-600", bgColor: "bg-purple-50" },
// ];

// interface GameCustomRates {
//   [gameId: number]: {
//     [betType: string]: {
//       rate: string;
//       updatedAt: string;
//     };
//   };
// }

// interface GameRatesModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const GameRatesModal = ({ isOpen, onClose }: GameRatesModalProps) => {
//   const [games, setGames] = useState<Game[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
//   const [customRates, setCustomRates] = useState<GameCustomRates>({});

//   useEffect(() => {
//     if (isOpen) {
//       loadGames();
//       loadCustomRates();
//     }
//   }, [isOpen]);

//   const loadGames = async () => {
//     try {
//       setLoading(true);
//       const gamesData = await getGames();
//       setGames(gamesData);
//       if (gamesData.length > 0) {
//         setSelectedGameId(gamesData[0].id);
//       }
//     } catch (error) {
//       console.error("Failed to load games:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCustomRates = () => {
//     const savedRates = localStorage.getItem('admin_game_bet_rates_simple');
//     if (savedRates) {
//       setCustomRates(JSON.parse(savedRates));
//     }
//   };

//   const getRateForBetType = (gameId: number, betType: string): string => {
//     const custom = customRates[gameId]?.[betType];
//     if (custom && custom.rate) {
//       return custom.rate;
//     }
//     const defaultBet = BET_TYPES.find(b => b.type === betType);
//     return defaultBet?.defaultRate || "10 = 0";
//   };

//   const selectedGame = games.find(g => g.id === selectedGameId);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
//       {/* Backdrop */}
//       <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
//       {/* Modal - Bottom sheet on mobile, centered on desktop */}
//       <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-xl animate-slideUp sm:animate-scaleIn">
        
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 sticky top-0 z-10">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//                 <Percent className="w-4 h-4 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-sm font-mono font-bold text-white">Game Betting Rates</h2>
//                 <p className="text-[9px] font-mono text-white/70">Check rates for all games</p>
//               </div>
//             </div>
//             <button 
//               onClick={onClose} 
//               className="p-1.5 hover:bg-white/20 rounded-lg transition-colors active:bg-white/30"
//             >
//               <X className="w-4 h-4 text-white" />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-10">
//               <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 border-t-blue-600"></div>
//               <p className="mt-3 text-xs font-mono text-gray-500">Loading rates...</p>
//             </div>
//           ) : (
//             <>
//               {/* Game Selector */}
//               <div className="mb-4">
//                 <label className="text-[11px] font-mono font-bold text-gray-600 mb-1.5 block">
//                   Select Game
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={selectedGameId || ""}
//                     onChange={(e) => setSelectedGameId(Number(e.target.value))}
//                     className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer active:bg-gray-50"
//                   >
//                     {games.map(game => (
//                       <option key={game.id} value={game.id}>{game.name}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Selected Game Info */}
//               {selectedGame && (
//                 <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
//                       <Gamepad2 className="w-4 h-4 text-white" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-[9px] font-mono text-gray-500">Current Game</p>
//                       <p className="text-xs font-mono font-bold text-gray-900 truncate">{selectedGame.name}</p>
//                     </div>
//                     <div className={`px-2 py-1 rounded-full text-[8px] font-mono font-bold flex-shrink-0 ${
//                       (selectedGame.isActive || selectedGame.active) 
//                         ? "bg-green-100 text-green-700" 
//                         : "bg-red-100 text-red-700"
//                     }`}>
//                       {(selectedGame.isActive || selectedGame.active) ? "Active" : "Inactive"}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Rates List */}
//               <div className="space-y-2.5">
//                 <p className="text-[11px] font-mono font-bold text-gray-600 mb-1">📊 Betting Rates</p>
//                 {BET_TYPES.map((betType) => {
//                   const currentRate = getRateForBetType(selectedGameId || 0, betType.type);
//                   const [betAmount, winAmount] = currentRate.split(" = ");
//                   const isCustom = customRates[selectedGameId || 0]?.[betType.type];
                  
//                   return (
//                     <div key={betType.type} className={`${betType.bgColor} rounded-xl p-3 border border-gray-200 active:bg-opacity-70 transition-all`}>
//                       <div className="flex items-center justify-between gap-2">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-1.5 flex-wrap">
//                             <p className="text-sm font-mono font-bold text-gray-900">{betType.type}</p>
//                             {isCustom && (
//                               <span className="text-[8px] font-mono bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Custom</span>
//                             )}
//                           </div>
//                           <p className="text-[9px] font-mono text-gray-500 mt-0.5 line-clamp-1">{betType.description}</p>
//                         </div>
//                         <div className="text-right flex-shrink-0">
//                           <p className="text-[9px] font-mono text-gray-500">Rate</p>
//                           <p className={`text-sm font-mono font-bold ${betType.color}`}>
//                             {currentRate}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="mt-2 pt-2 border-t border-gray-200">
//                         <p className="text-[9px] font-mono text-gray-600">
//                           💰 Bet ₹{betAmount} = Win ₹{parseInt(winAmount).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* How to Calculate */}
//               <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-300">
//                 <div className="flex items-center gap-1.5 mb-2">
//                   <Calculator className="w-3.5 h-3.5 text-blue-600" />
//                   <h4 className="text-[10px] font-mono font-bold text-blue-800">How to Calculate</h4>
//                 </div>
//                 <div className="grid grid-cols-1 gap-1.5 text-[8px] font-mono">
//                   <div className="bg-white rounded-lg p-2">
//                     <p className="font-bold text-green-600 text-[9px]">SINGLE:</p>
//                     <p className="text-gray-700">₹10 × 9 = ₹90 win</p>
//                   </div>
//                   <div className="bg-white rounded-lg p-2">
//                     <p className="font-bold text-yellow-600 text-[9px]">JODI:</p>
//                     <p className="text-gray-700">₹10 × 90 = ₹900 win</p>
//                   </div>
//                   <div className="bg-white rounded-lg p-2">
//                     <p className="font-bold text-purple-600 text-[9px]">TRIPLE PATTI:</p>
//                     <p className="text-gray-700">₹10 × 600 = ₹6,000 win</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Note */}
//               <div className="mt-3 p-2.5 bg-yellow-50 rounded-xl border border-yellow-200">
//                 <p className="text-[8px] font-mono text-yellow-700 text-center leading-relaxed">
//                   ⚡ Min bet: ₹5 (JODI, PANA, PATTI) | ₹10 (SINGLE) | Max bet: ₹1000
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GameRatesModal;