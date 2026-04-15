import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  Sparkles,
} from "lucide-react";
import { getUserTransactions, Transaction } from "@/lib/gameApi";
import BottomNav from "@/components/BottomNav";

const WalletPage = () => {
const { user, loading, refreshUser } = useAuth();
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

const hasFetched = useRef(false);

useEffect(() => {
  if (!user?.id) return;

  if (hasFetched.current) return;

  hasFetched.current = true;
  loadTransactions();
}, [user?.id, loadTransactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm font-mono text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Transaction Icons with enhanced styling
  const txIcon = (type: string) => {
    if (type === "deposit") {
      return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
    }
    if (type === "win") {
      return <Award className="w-5 h-5 text-yellow-500" />;
    }
    if (type === "withdraw") {
      return <ArrowUpCircle className="w-5 h-5 text-red-500" />;
    }
    if (type === "bet") {
      return <TrendingUp className="w-5 h-5 text-orange-500" />;
    }
    return <CreditCard className="w-5 h-5 text-gray-400" />;
  };

  // Transaction colors
  const txColor = (type: string) => {
    if (type === "deposit" || type === "win") {
      return "text-green-600";
    }
    return "text-red-600";
  };

  // Transaction label
  const txLabel = (type: string) => {
    if (type === "deposit") return "Deposit";
    if (type === "win") return "Winnings";
    if (type === "withdraw") return "Withdrawal";
    if (type === "bet") return "Bet Placed";
    return "Transaction";
  };

  // Format date nicely
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-20">
      {/* Header with Gradient Background */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs font-mono text-blue-100 mb-1 tracking-wider">
            YOUR BALANCE
          </p>
          <p className="text-5xl font-mono font-black mb-2">
            ₹{user.balance.toLocaleString()}
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-100 text-[10px] font-mono">
            <Clock className="w-3 h-3" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <button
  type="button"
  onClick={async () => {
    await refreshUser();
    await loadTransactions();
  }}
  disabled={txLoading}
  className="absolute bottom-4 right-4 z-[999] flex items-center gap-2 px-3 py-2 text-xs font-mono font-semibold bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
>
          <RefreshCw
            className={`w-4 h-4 ${txLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Transactions Section */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Recent Transactions
          </h2>
          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
          </span>
        </div>

        {txLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-xs font-mono text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-mono text-gray-500">No transactions yet</p>
            <p className="text-[10px] font-mono text-gray-400 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => {
              const txDate = new Date(tx.createdAt);
              const dateLabel = formatDate(txDate);
              const timeLabel = txDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              return (
                <div
                  key={tx.id}
                  className="group bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        tx.type === "deposit" ? "bg-green-100" :
                        tx.type === "win" ? "bg-yellow-100" :
                        tx.type === "withdraw" ? "bg-red-100" :
                        "bg-orange-100"
                      }`}>
                        {txIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-sm font-mono font-bold text-gray-800">
                          {txLabel(tx.type)}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-[9px] font-mono text-gray-400">
                            {dateLabel} at {timeLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-lg ${txColor(tx.type)}`}
                      >
                        {tx.type === "deposit" || tx.type === "win" ? "+" : "-"}₹
                        {Math.abs(tx.amount).toLocaleString()}
                      </span>
                      <div className="text-[9px] font-mono text-gray-400 mt-1">
                        {tx.type === "deposit" ? "Added to wallet" :
                         tx.type === "win" ? "Won from game" :
                         tx.type === "withdraw" ? "Withdrawn" :
                         "Bet placed"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {transactions.length > 0 && (
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[10px] font-mono text-gray-500 mb-1">Total Deposits</p>
                <p className="text-sm font-mono font-bold text-green-600">
                  ₹{transactions
                    .filter(t => t.type === "deposit")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono text-gray-500 mb-1">Total Winnings</p>
                <p className="text-sm font-mono font-bold text-yellow-600">
                  ₹{transactions
                    .filter(t => t.type === "win")
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default WalletPage;