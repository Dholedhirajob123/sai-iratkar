import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, ArrowDownCircle, ArrowUpCircle, CreditCard } from "lucide-react";
import { getUserTransactions, Transaction } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

const WalletPage = () => {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) { navigate("/login", { replace: true }); return; }
      if (user.role === "admin") { navigate("/admin", { replace: true }); }
    }
  }, [user, loading, navigate]);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  if (loading || !user) return null;

  const transactions = getUserTransactions(user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const txIcon = (type: string) => {
    if (type === "deposit") return <ArrowDownCircle className="w-5 h-5 text-success" />;
    if (type === "withdraw" || type === "bet") return <ArrowUpCircle className="w-5 h-5 text-destructive" />;
    return <CreditCard className="w-5 h-5 text-muted-foreground" />;
  };

  const txColor = (type: string) => type === "deposit" ? "text-success" : "text-destructive";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Balance Card */}
      <div className="surface-card border-t-0 border-x-0 p-6 text-center">
        <Wallet className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-xs font-mono text-muted-foreground mb-1">Your Balance</p>
        <p className="text-4xl font-mono font-bold text-foreground">₹{user.balance}</p>
      </div>

      {/* Transactions */}
      <div className="p-4">
        <h2 className="text-sm font-mono font-semibold text-foreground mb-3">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="surface-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {txIcon(tx.type)}
                  <div>
                    <p className="text-xs font-mono text-foreground">{tx.description}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("en-GB")} {new Date(tx.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    </p>
                  </div>
                </div>
                <span className={`font-mono font-semibold text-sm ${txColor(tx.type)}`}>
                  {tx.type === "deposit" ? "+" : ""}₹{Math.abs(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default WalletPage;
