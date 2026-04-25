// import { useState, useEffect } from 'react';
// import { Percent, Edit, Save, X, RefreshCw, Search, Filter, Gamepad2 } from 'lucide-react';
// import { getGames, Game } from '@/lib/gameApi';
// import { useToast } from '@/hooks/use-toast';

// interface BetType {
//   type: string;
//   defaultRate: string;
//   description: string;
// }

// const BET_TYPES: BetType[] = [
//   { type: "SINGLE", defaultRate: "10 = 90", description: "Single digit numbers (0-9)" },
//   { type: "JODI", defaultRate: "10 = 900", description: "Two-digit combinations (00-99)" },
//   { type: "SINGLE PANA", defaultRate: "10 = 1500", description: "Three distinct digits" },
//   { type: "DOUBLE PANA", defaultRate: "10 = 3000", description: "Two same digits" },
//   { type: "TRIPLE PATTI", defaultRate: "10 = 6000", description: "All three digits same" },
// ];

// interface GameCustomRates {
//   [gameId: number]: {
//     [betType: string]: {
//       rate: string;
//       updatedAt: string;
//     };
//   };
// }

// const AdminGameRates = () => {
//   const [games, setGames] = useState<Game[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [editingGameId, setEditingGameId] = useState<number | null>(null);
//   const [editingBetType, setEditingBetType] = useState<string | null>(null);
//   const [editRate, setEditRate] = useState<string>("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedGame, setSelectedGame] = useState<string>("all");
//   const [customRates, setCustomRates] = useState<GameCustomRates>({});
  
//   const { toast } = useToast();

//   const loadGames = async (showRefreshToast = false) => {
//     try {
//       if (!showRefreshToast) setLoading(true);
//       else setRefreshing(true);
      
//       const gamesData = await getGames();
//       setGames(gamesData);
      
//       const savedRates = localStorage.getItem('admin_game_bet_rates_simple');
//       if (savedRates) {
//         setCustomRates(JSON.parse(savedRates));
//       }
      
//       if (showRefreshToast) {
//         toast({
//           title: "Refreshed",
//           description: `Loaded ${gamesData.length} games`,
//         });
//       }
//     } catch (error) {
//       console.error("Failed to load games:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load games",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     loadGames();
//   }, []);

//   const saveCustomRates = (newRates: GameCustomRates) => {
//     setCustomRates(newRates);
//     localStorage.setItem('admin_game_bet_rates_simple', JSON.stringify(newRates));
//   };

//   const getRateForBetType = (gameId: number, betType: string): string => {
//     const custom = customRates[gameId]?.[betType];
//     if (custom) {
//       return custom.rate;
//     }
//     const defaultBet = BET_TYPES.find(b => b.type === betType);
//     return defaultBet?.defaultRate || "10 = 0";
//   };

//   const handleEdit = (gameId: number, betType: string, currentRate: string) => {
//     setEditingGameId(gameId);
//     setEditingBetType(betType);
//     setEditRate(currentRate);
//   };

//   const handleSave = (gameId: number, betType: string) => {
//     const updatedRates = { ...customRates };
    
//     if (!updatedRates[gameId]) {
//       updatedRates[gameId] = {};
//     }
    
//     updatedRates[gameId][betType] = {
//       rate: editRate,
//       updatedAt: new Date().toISOString(),
//     };
    
//     saveCustomRates(updatedRates);
//     setEditingGameId(null);
//     setEditingBetType(null);
    
//     toast({
//       title: "Success",
//       description: `${betType} rate updated to ${editRate}`,
//     });
//   };

//   const handleCancel = () => {
//     setEditingGameId(null);
//     setEditingBetType(null);
//   };

//   const resetToDefault = (gameId: number, betType: string) => {
//     const updatedRates = { ...customRates };
//     if (updatedRates[gameId]) {
//       delete updatedRates[gameId][betType];
//       if (Object.keys(updatedRates[gameId]).length === 0) {
//         delete updatedRates[gameId];
//       }
//     }
//     saveCustomRates(updatedRates);
    
//     const defaultBet = BET_TYPES.find(b => b.type === betType);
//     toast({
//       title: "Reset",
//       description: `${betType} rate reset to ${defaultBet?.defaultRate}`,
//     });
//   };

//   const filteredGames = games.filter(game => {
//     if (selectedGame !== "all" && game.id.toString() !== selectedGame) return false;
//     if (searchQuery && !game.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
//     return true;
//   });

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20">
//         <div className="relative">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <Percent className="w-6 h-6 text-blue-600 animate-pulse" />
//           </div>
//         </div>
//         <p className="mt-4 font-mono text-sm text-gray-500">Loading game rates...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-mono font-bold text-gray-900 flex items-center gap-2">
//             <Percent className="w-6 h-6 text-blue-600" />
//             Game Betting Rates
//           </h1>
//           <p className="text-sm font-mono text-gray-500 mt-1">Configure bet rates for each game type</p>
//         </div>
//         <button
//           onClick={() => loadGames(true)}
//           disabled={refreshing}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
//         >
//           <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
//           Refresh
//         </button>
//       </div>

//       {/* Search and Filter */}
//       <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search games by name..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <Filter className="w-4 h-4 text-gray-500" />
//             <select
//               value={selectedGame}
//               onChange={(e) => setSelectedGame(e.target.value)}
//               className="px-4 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500 bg-white"
//             >
//               <option value="all">All Games</option>
//               {games.map(game => (
//                 <option key={game.id} value={game.id}>{game.name}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Games Rate Cards */}
//       <div className="space-y-6">
//         {filteredGames.length === 0 ? (
//           <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
//             <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//             <p className="text-sm font-mono text-gray-500">No games found</p>
//           </div>
//         ) : (
//           filteredGames.map((game) => (
//             <div key={game.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
//               {/* Game Header */}
//               <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//                       <Gamepad2 className="w-5 h-5 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-mono font-bold text-white">{game.name}</h3>
//                       <p className="text-[10px] font-mono text-white/80">ID: {game.id}</p>
//                     </div>
//                   </div>
//                   <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
//                     (game.isActive || game.active) ? "bg-green-500 text-white" : "bg-red-500 text-white"
//                   }`}>
//                     {(game.isActive || game.active) ? "Active" : "Inactive"}
//                   </div>
//                 </div>
//               </div>

//               {/* Bet Types Table */}
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-50 border-b border-gray-200">
//                     <tr>
//                       <th className="text-left py-3 px-4 text-xs font-mono font-bold text-gray-600">Bet Type</th>
//                       <th className="text-center py-3 px-4 text-xs font-mono font-bold text-gray-600">Rate</th>
//                       <th className="text-left py-3 px-4 text-xs font-mono font-bold text-gray-600 hidden md:table-cell">Description</th>
//                       <th className="text-center py-3 px-4 text-xs font-mono font-bold text-gray-600">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {BET_TYPES.map((betType) => {
//                       const currentRate = getRateForBetType(game.id, betType.type);
//                       const isEditing = editingGameId === game.id && editingBetType === betType.type;
//                       const isCustom = customRates[game.id]?.[betType.type];
                      
//                       return (
//                         <tr key={betType.type} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
//                           <td className="py-3 px-4">
//                             <span className="text-sm font-mono font-bold text-gray-900">{betType.type}</span>
//                           </td>
//                           <td className="py-3 px-4 text-center">
//                             {isEditing ? (
//                               <input
//                                 type="text"
//                                 value={editRate}
//                                 onChange={(e) => setEditRate(e.target.value)}
//                                 className="w-28 text-center px-2 py-1 border-2 border-blue-400 rounded-lg font-mono text-sm"
//                               />
//                             ) : (
//                               <span className="inline-flex px-3 py-1 rounded-full text-sm font-mono font-bold bg-blue-100 text-blue-700">
//                                 {currentRate}
//                               </span>
//                             )}
//                           </td>
//                           <td className="py-3 px-4 hidden md:table-cell">
//                             <p className="text-xs font-mono text-gray-500">{betType.description}</p>
//                           </td>
//                           <td className="py-3 px-4 text-center">
//                             {isEditing ? (
//                               <div className="flex gap-2 justify-center">
//                                 <button onClick={() => handleSave(game.id, betType.type)} className="p-2 bg-green-100 text-green-600 rounded-lg">
//                                   <Save className="w-4 h-4" />
//                                 </button>
//                                 <button onClick={handleCancel} className="p-2 bg-gray-100 text-gray-600 rounded-lg">
//                                   <X className="w-4 h-4" />
//                                 </button>
//                               </div>
//                             ) : (
//                               <div className="flex gap-2 justify-center">
//                                 <button onClick={() => handleEdit(game.id, betType.type, currentRate)} className="p-2 bg-blue-100 text-blue-600 rounded-lg">
//                                   <Edit className="w-4 h-4" />
//                                 </button>
//                                 {isCustom && (
//                                   <button onClick={() => resetToDefault(game.id, betType.type)} className="p-2 bg-orange-100 text-orange-600 rounded-lg">
//                                     <RefreshCw className="w-4 h-4" />
//                                   </button>
//                                 )}
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminGameRates;