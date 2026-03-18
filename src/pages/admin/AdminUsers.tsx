import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Check,
  X as XIcon,
  Shield,
  ShieldOff,
  RefreshCw,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  mobileNumber: string;
  role: string;
  status: string;
  balance: number;
  canAddPlayerName: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [balanceInputs, setBalanceInputs] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const token = localStorage.getItem("token");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5003/admin/users", {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to fetch users");
      }

      const data = await response.json();

      const filteredData = data.filter(
        (u: User) => u.role?.toUpperCase() !== "ADMIN"
      );

      setUsers(filteredData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id: number, name: string) => {
    try {
      const response = await fetch(`http://localhost:5003/admin/approve/${id}`, {
        method: "PUT",
        headers: getHeaders(),
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to approve user");
      }

      toast({
        title: "Success",
        description: message || `${name} approved successfully`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to approve user",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: number, name: string) => {
    try {
      const response = await fetch(`http://localhost:5003/admin/reject/${id}`, {
        method: "PUT",
        headers: getHeaders(),
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to reject user");
      }

      toast({
        title: "Success",
        description: message || `${name} rejected successfully`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to reject user",
        variant: "destructive",
      });
    }
  };

  const togglePlayerNamePermission = async (user: User) => {
    try {
      const newValue = !user.canAddPlayerName;

      const response = await fetch(
        `http://localhost:5003/admin/player-permission/${user.id}?value=${newValue}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to update permission");
      }

      toast({
        title: newValue ? "Permission Granted" : "Permission Revoked",
        description:
          message ||
          `${user.name} can ${newValue ? "now" : "no longer"} add player names.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to update permission",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5003/admin/delete/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to delete user");
      }

      toast({
        title: "Success",
        description: message || `${name} deleted successfully`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to delete user",
        variant: "destructive",
      });
    }
  };

  const handleAddBalance = async (id: number, name: string) => {
    const amount = Number(balanceInputs[id]);

    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5003/admin/add-balance/${id}?amount=${amount}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to add balance");
      }

      toast({
        title: "Success",
        description: message || `₹${amount} added to ${name}`,
      });

      setBalanceInputs((prev) => ({ ...prev, [id]: "" }));
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to add balance",
        variant: "destructive",
      });
    }
  };

  const handleRemoveBalance = async (id: number, name: string) => {
    const amount = Number(balanceInputs[id]);

    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5003/admin/remove-balance/${id}?amount=${amount}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to remove balance");
      }

      toast({
        title: "Success",
        description: message || `₹${amount} removed from ${name}`,
      });

      setBalanceInputs((prev) => ({ ...prev, [id]: "" }));
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to remove balance",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (status: string) => {
    const value = status?.toUpperCase();
    if (value === "APPROVED") return "text-success";
    if (value === "REJECTED") return "text-destructive";
    return "text-primary";
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
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

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-3 py-2 border-2 border-foreground/10 text-sm font-mono flex items-center gap-2 hover:bg-accent/10"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-foreground/10">
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Sr. No</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Name</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Phone</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Role</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Balance</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Status</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">User Action</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Approve/Reject</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Amount</th>
              <th className="text-[10px] font-mono text-muted-foreground py-2 px-2">Delete</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-6 text-center text-sm font-mono text-muted-foreground"
                >
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="py-6 text-center text-sm font-mono text-muted-foreground"
                >
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, index) => (
                <tr
                  key={u.id}
                  className="border-b border-foreground/5 hover:bg-accent/5"
                >
                  <td className="py-3 px-2 text-xs font-mono text-muted-foreground">
                    {index + 1}
                  </td>

                  <td className="py-3 px-2 text-xs font-mono text-foreground">
                    {u.name}
                  </td>

                  <td className="py-3 px-2 text-xs font-mono text-muted-foreground">
                    {u.mobileNumber}
                  </td>

                  <td className="py-3 px-2 text-xs font-mono text-foreground">
                    {u.role}
                  </td>

                  <td className="py-3 px-2 text-xs font-mono text-foreground">
                    ₹{u.balance}
                  </td>

                  <td
                    className={`py-3 px-2 text-xs font-mono font-semibold uppercase ${statusColor(
                      u.status
                    )}`}
                  >
                    {u.status}
                  </td>

                  <td className="py-3 px-2">
                    <button
                      onClick={() => togglePlayerNamePermission(u)}
                      disabled={u.status?.toUpperCase() !== "APPROVED"}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-semibold border w-full justify-center ${
                        u.canAddPlayerName
                          ? "bg-success/10 text-success border-success/30 hover:bg-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                      } ${
                        u.status?.toUpperCase() !== "APPROVED"
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {u.canAddPlayerName ? (
                        <>
                          <Shield className="w-3 h-3" />
                          Can Add Name
                        </>
                      ) : (
                        <>
                          <ShieldOff className="w-3 h-3" />
                          Cannot Add Name
                        </>
                      )}
                    </button>

                    {u.status?.toUpperCase() !== "APPROVED" && (
                      <p className="text-[8px] font-mono text-muted-foreground mt-1 text-center">
                        Approve first
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(u.id, u.name)}
                        className={`hover:opacity-70 ${
                          u.status?.toUpperCase() === "APPROVED"
                            ? "text-success"
                            : "text-muted-foreground"
                        }`}
                        title="Approve User"
                        disabled={u.status?.toUpperCase() === "APPROVED"}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleReject(u.id, u.name)}
                        className={`hover:opacity-70 ${
                          u.status?.toUpperCase() === "REJECTED"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                        title="Reject User"
                        disabled={u.status?.toUpperCase() === "REJECTED"}
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={balanceInputs[u.id] || ""}
                        onChange={(e) =>
                          setBalanceInputs((prev) => ({
                            ...prev,
                            [u.id]: e.target.value.replace(/\D/g, ""),
                          }))
                        }
                        placeholder="₹"
                        className="w-16 bg-input border border-foreground/10 px-2 py-1 text-xs font-mono"
                        disabled={u.status?.toUpperCase() !== "APPROVED"}
                      />

                      <button
                        onClick={() => handleAddBalance(u.id, u.name)}
                        className="text-success hover:opacity-70"
                        title="Add Balance"
                        disabled={u.status?.toUpperCase() !== "APPROVED"}
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleRemoveBalance(u.id, u.name)}
                        className="text-destructive hover:opacity-70"
                        title="Remove Balance"
                        disabled={u.status?.toUpperCase() !== "APPROVED"}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="text-destructive hover:opacity-70"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;