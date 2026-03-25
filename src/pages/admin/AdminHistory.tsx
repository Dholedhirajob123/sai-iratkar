import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  getAllGameEntries,
  getAllTransactions,
  GameEntry,
  Transaction,
} from "@/lib/gameApi";

const AdminHistory = () => {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"entries" | "transactions">("entries");

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entriesData, transactionsData] = await Promise.all([
          getAllGameEntries(),
          getAllTransactions(),
        ]);

        setEntries(
          entriesData.sort(
            (a, b) =>
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
          )
        );

        setTransactions(
          transactionsData.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
        );
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    fetchData();
  }, []);

  // =========================
  // FILTERS
  // =========================
  const filteredEntries = entries.filter((e) => {
    const text =
      (e.playerName || "") +
      (e.gameName || "") +
      (e.gameType || "");

    return text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredTransactions = transactions.filter((t: any) => {
    const text =
      (t.user?.name || "") +
      (t.type || "");

    return text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // =========================
  // GROUP BY USER
  // =========================
  const grouped: Record<string, GameEntry[]> = {};

  entries.forEach((e: any) => {
    const userName = e.user?.name || "Unknown";
    if (!grouped[userName]) grouped[userName] = [];
    grouped[userName].push(e);
  });

  return (
    <div>
      {/* ========================= */}
      {/* BUTTONS + SEARCH */}
      {/* ========================= */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("entries")}
            className={`px-4 py-2 rounded text-sm ${
              activeTab === "entries"
                ? "bg-primary text-white"
                : "bg-muted"
            }`}
          >
            Game History
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 rounded text-sm ${
              activeTab === "transactions"
                ? "bg-primary text-white"
                : "bg-muted"
            }`}
          >
            Transactions
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border text-sm"
          />
        </div>
      </div>

      {/* ========================= */}
      {/* GAME HISTORY */}
      {/* ========================= */}
      {activeTab === "entries" && (
        <>
          {filteredEntries.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">
              No history found
            </p>
          ) : (
            <Accordion type="multiple">
              {Object.entries(grouped).map(([user, list]) => {
                const total = list.reduce((s, e) => s + e.amount, 0);

                return (
                  <AccordionItem key={user} value={user}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full pr-4">
                        <span>{user}</span>
                        <span>
                          {list.length} bets · ₹{total}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <table className="w-full text-left">
                        <thead>
                          <tr>
                            <th>Player</th>
                            <th>No</th>
                            <th>Game</th>
                            <th>Amt</th>
                            <th>Result</th>
                            <th>Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {list.map((e) => (
                            <tr key={e.id}>
                              <td>{e.playerName}</td>
                              <td>{e.number}</td>
                              <td>{e.gameName}</td>
                              <td>₹{e.amount}</td>
                              <td>
                                {e.result
                                  ? e.result === "won"
                                    ? `WON ₹${e.winAmount}`
                                    : "LOST"
                                  : "Pending"}
                              </td>
                              <td>
                                {new Date(
                                  e.createdAt || ""
                                ).toLocaleDateString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </>
      )}

      {/* ========================= */}
      {/* TRANSACTIONS */}
      {/* ========================= */}
      {activeTab === "transactions" && (
        <>
          {filteredTransactions.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">
              No transactions found
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((t: any) => (
                  <tr key={t.id}>
                    <td>{t.user?.name || "Unknown"}</td>
                    <td>{t.type}</td>
                    <td>₹{t.amount}</td>
                    <td>
                      {new Date(t.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default AdminHistory;