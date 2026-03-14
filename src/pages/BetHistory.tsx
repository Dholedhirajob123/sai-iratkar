import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";
import { getEntriesByUser } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

const BetHistory = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) { navigate("/login", { replace: true }); return; }
      if (user.role === "admin") { navigate("/admin", { replace: true }); }
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const entries = getEntriesByUser(user.id).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="surface-card border-t-0 border-x-0 px-4 py-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <h1 className="text-base font-mono font-bold text-foreground">My Bet History</h1>
        </div>
      </div>

      <div className="p-4">
        {entries.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-20">No bets placed yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-foreground/10">
                  <th className="text-[10px] font-mono text-muted-foreground py-3 px-2">Sr. No</th>
                  <th className="text-[10px] font-mono text-muted-foreground py-3 px-2">Player Name</th>
                  <th className="text-[10px] font-mono text-muted-foreground py-3 px-2">Number</th>
                  <th className="text-[10px] font-mono text-muted-foreground py-3 px-2">Game</th>
                  <th className="text-[10px] font-mono text-muted-foreground py-3 px-2">Type</th>
                  <th className="text-[10px] font-mono text-muted-foreground py-3 px-2">Amount</th>
                  <th className="text-[10px] font-mono text-muted-foreground py-3 px-2">Result</th>
                  <th className="text-[10px] font-mono text-muted-foreground py-3 px-2">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, index) => (
                  <tr key={e.id} className="border-b border-foreground/5 hover:bg-accent/5">
                    <td className="py-3 px-2 text-xs font-mono text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="py-3 px-2 text-xs font-mono font-semibold text-primary">
                      {e.playerName}
                    </td>
                    <td className="py-3 px-2 text-xs font-mono font-bold text-foreground">
                      {e.number}
                    </td>
                    <td className="py-3 px-2 text-xs font-mono text-foreground">
                      {e.gameName}
                    </td>
                    <td className="py-3 px-2 text-xs font-mono text-muted-foreground">
                      {e.gameType}
                    </td>
                    <td className="py-3 px-2 text-xs font-mono font-semibold text-foreground">
                      ₹{e.amount}
                    </td>
                    <td className="py-3 px-2">
                      {e.result ? (
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                          e.result === "won" 
                            ? "text-success bg-success/10 border border-success/30" 
                            : "text-destructive bg-destructive/10 border border-destructive/30"
                        }`}>
                          {e.result === "won" ? `WON ₹${e.winAmount}` : "LOST"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-[10px] font-mono text-muted-foreground">
                      {new Date(e.createdAt).toLocaleDateString("en-GB")},{" "}
                      {new Date(e.createdAt).toLocaleTimeString("en-US", { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: false 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

// ✅ THIS IS CRITICAL - Add this line at the end
export default BetHistory;