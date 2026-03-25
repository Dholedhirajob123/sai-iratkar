import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { getUserTransactions, Transaction } from "@/lib/gameApi";
import BottomNav from "@/components/BottomNav";

const WalletPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const loadTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setTxLoading(true);
      const txData = await getUserTransactions(user.id);

      const sortedTransactions = [...(txData || [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground">
          Loading wallet...
        </p>
      </div>
    );
  }

  if (!user) return null;

  // ✅ ICON FIX
  const txIcon = (type: string) => {
    if (type === "deposit" || type === "win") {
      return <ArrowDownCircle className="w-5 h-5 text-success" />;
    }

    if (type === "withdraw" || type === "bet") {
      return <ArrowUpCircle className="w-5 h-5 text-destructive" />;
    }

    return <CreditCard className="w-5 h-5 text-muted-foreground" />;
  };

  // ✅ COLOR FIX
  const txColor = (type: string) => {
    if (type === "deposit" || type === "win") {
      return "text-success";
    }
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* HEADER */}
      <div className="surface-card border-t-0 border-x-0 p-6 text-center">
        <Wallet className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-xs font-mono text-muted-foreground mb-1">
          Your Balance
        </p>
        <p className="text-4xl font-mono font-bold text-foreground">
          ₹{user.balance}
        </p>

        <button
          type="button"
          onClick={loadTransactions}
          disabled={txLoading}
          className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-xs font-mono text-primary border border-primary/20 rounded-lg hover:bg-primary/10 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${txLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* TRANSACTIONS */}
      <div className="p-4">
        <h2 className="text-sm font-mono font-semibold text-foreground mb-3">
          Recent Transactions
        </h2>

        {txLoading ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">
            Loading transactions...
          </p>
        ) : transactions.length === 0 ? (
          <p className="text-center font-mono text-sm text-muted-foreground py-10">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="surface-card p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {txIcon(tx.type)}
                  <div>
                    <p className="text-xs font-mono text-foreground">
                      {tx.description}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("en-GB")}{" "}
                      {new Date(tx.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                </div>

                {/* ✅ SIGN + COLOR FIX */}
                <span
                  className={`font-mono font-semibold text-sm ${txColor(
                    tx.type
                  )}`}
                >
                  {tx.type === "deposit" || tx.type === "win" ? "+" : "-"}₹
                  {Math.abs(tx.amount)}
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