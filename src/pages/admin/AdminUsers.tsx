import { useState, useEffect } from "react";
import { getUsers, updateUser, updateUserBalance, addTransaction, deleteUser, User, migrateUsersWithPlayerNamePermission } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X as XIcon, Plus, Trash2, Eye, EyeOff, Shield, ShieldOff } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => { 
    // Migrate existing users to add canAddPlayerName field
    migrateUsersWithPlayerNamePermission();
    // Filter out admin users, only show regular users
    const allUsers = getUsers();
    const regularUsers = allUsers.filter((u) => u.role !== "admin");
    setUsers(regularUsers);
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (u: User, status: "approved" | "rejected") => {
    const updated = { ...u, status };
    updateUser(updated);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    toast({ title: "Updated", description: `${u.name} has been ${status}.` });
  };

  // Toggle player name permission
  const togglePlayerNamePermission = (u: User) => {
    const updated = { ...u, canAddPlayerName: !u.canAddPlayerName };
    updateUser(updated);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    toast({ 
      title: updated.canAddPlayerName ? "Permission Granted" : "Permission Revoked", 
      description: `${u.name} can ${updated.canAddPlayerName ? "now" : "no longer"} add player names.` 
    });
  };

  const handleAddBalance = (u: User) => {
    const amount = parseInt(balanceInputs[u.id] || "0");
    if (!amount || amount <= 0) { 
      toast({ title: "Error", description: "Enter a valid amount.", variant: "destructive" }); 
      return; 
    }
    updateUserBalance(u.id, amount);
    addTransaction({ userId: u.id, type: "deposit", amount, description: "Admin deposit" });
    const fresh = { ...u, balance: u.balance + amount };
    setUsers((prev) => prev.map((x) => (x.id === u.id ? fresh : x)));
    setBalanceInputs((prev) => ({ ...prev, [u.id]: "" }));
    toast({ title: "Balance Added", description: `₹${amount} added to ${u.name}'s wallet.` });
  };

  const handleRemoveBalance = (u: User) => {
    const amount = parseInt(balanceInputs[u.id] || "0");
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Enter a valid amount.", variant: "destructive" });
      return;
    }
    if (amount > u.balance) {
      toast({ title: "Error", description: "User does not have enough balance.", variant: "destructive" });
      return;
    }
    updateUserBalance(u.id, -amount);
    addTransaction({ userId: u.id, type: "withdraw", amount, description: "Admin removed balance" });
    const fresh = { ...u, balance: u.balance - amount };
    setUsers((prev) => prev.map((x) => (x.id === u.id ? fresh : x)));
    setBalanceInputs((prev) => ({ ...prev, [u.id]: "" }));
    toast({ title: "Balance Removed", description: `₹${amount} removed from ${u.name}` });
  };
  
  const handleDelete = (u: User) => {
    deleteUser(u.id);
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    toast({ title: "Deleted", description: `${u.name} has been removed.` });
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "text-success";
    if (s === "rejected") return "text-destructive";
    return "text-primary";
  };

  const maskPassword = (password: string) => {
    if (!password) return "—";
    return "•".repeat(Math.min(password.length, 8));
  };

  return (
    <div>
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-foreground/10">
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Sr. No</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Name</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Phone</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Password</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Balance</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Status</th>
              {/* User Action Column - Player Name Permission */}
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">User Action</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Approve/Reject</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Amount</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, index) => (
              <tr key={u.id} className="border-b border-foreground/5 hover:bg-accent/5">
                <td className="py-3 px-2 text-xs font-mono text-muted-foreground">{index + 1}</td>
                <td className="py-3 px-2 text-xs font-mono text-foreground">{u.name}</td>
                <td className="py-3 px-2 text-xs font-mono text-muted-foreground">{u.phone}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {showPasswords[u.id] ? u.password || "—" : maskPassword(u.password || "")}
                    </span>
                    {u.password && (
                      <button onClick={() => togglePasswordVisibility(u.id)} className="text-muted-foreground hover:text-primary">
                        {showPasswords[u.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 text-xs font-mono text-foreground">₹{u.balance}</td>
                <td className={`py-3 px-2 text-xs font-mono font-semibold uppercase ${statusColor(u.status)}`}>{u.status}</td>
                
                {/* User Action - Player Name Permission Toggle */}
                <td className="py-3 px-2">
                  <button
                    onClick={() => togglePlayerNamePermission(u)}
                    disabled={u.status !== "approved"}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-semibold border w-full justify-center ${
                      u.canAddPlayerName 
                        ? 'bg-success/10 text-success border-success/30 hover:bg-success/20' 
                        : 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20'
                    } ${u.status !== "approved" ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={
                      u.status !== "approved" 
                        ? "User must be approved first" 
                        : u.canAddPlayerName 
                          ? "Revoke permission to add player names" 
                          : "Grant permission to add player names"
                    }
                  >
                    {u.canAddPlayerName ? (
                      <>
                        <Shield className="w-3 h-3" /> Can Add Name SR .NO 
                      </>
                    ) : (
                      <>
                        <ShieldOff className="w-3 h-3" /> Cannot Add Name
                      </>
                    )}
                  </button>
                  {u.status !== "approved" && (
                    <p className="text-[8px] font-mono text-muted-foreground mt-1 text-center">
                      Approve first
                    </p>
                  )}
                </td>

                {/* Approve/Reject Actions */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(u, "approved")}
                      className={`hover:opacity-70 ${u.status === "approved" ? 'text-success' : 'text-muted-foreground'}`}
                      title="Approve User"
                      disabled={u.status === "approved"}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(u, "rejected")}
                      className={`hover:opacity-70 ${u.status === "rejected" ? 'text-destructive' : 'text-muted-foreground'}`}
                      title="Reject User"
                      disabled={u.status === "rejected"}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>

                {/* Amount Add/Remove */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={balanceInputs[u.id] || ""}
                      onChange={(e) => setBalanceInputs(p => ({ ...p, [u.id]: e.target.value.replace(/\D/g, "") }))}
                      placeholder="₹"
                      className="w-16 bg-input border border-foreground/10 px-2 py-1 text-xs font-mono"
                    />
                    <button 
                      onClick={() => handleAddBalance(u)} 
                      className="text-success hover:opacity-70" 
                      title="Add Balance"
                      disabled={u.status !== "approved"}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleRemoveBalance(u)} 
                      className="text-destructive hover:opacity-70" 
                      title="Remove Balance"
                      disabled={u.status !== "approved"}
                    >
                      <span className="text-lg font-bold">−</span>
                    </button>
                  </div>
                </td>

                {/* Delete */}
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => handleDelete(u)}
                    className="text-destructive hover:opacity-70"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;