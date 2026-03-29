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
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  DollarSign,
  Crown,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Lock,
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
  const [resetPasswordInputs, setResetPasswordInputs] = useState<Record<number, string>>({});
  const [sortField, setSortField] = useState<keyof User>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const handleResetPassword = async (id: number, name: string) => {
    const newPassword = resetPasswordInputs[id];

    if (!newPassword || !/^\d{4}$/.test(newPassword)) {
  toast({
    title: "Invalid Password",
    description: "Password must be exactly 4 digits",
    variant: "destructive",
  });
  return;
}

    try {
      const response = await fetch(`http://localhost:5003/admin/reset-password/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ password: newPassword }),
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to reset password");
      }

      toast({
        title: "Password Reset",
        description: message || `Password for ${name} has been reset successfully`,
      });

      setResetPasswordInputs((prev) => ({ ...prev, [id]: "" }));
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to reset password",
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

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status?.toUpperCase() === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === "balance") {
        aVal = a.balance;
        bVal = b.balance;
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const statusColor = (status: string) => {
    const value = status?.toUpperCase();
    if (value === "APPROVED") return "bg-green-100 text-green-700";
    if (value === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const stats = {
    total: users.length,
    approved: users.filter(u => u.status?.toUpperCase() === "APPROVED").length,
    pending: users.filter(u => u.status?.toUpperCase() === "PENDING").length,
    rejected: users.filter(u => u.status?.toUpperCase() === "REJECTED").length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
  };

  const SortIcon = ({ field }: { field: keyof User }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 font-mono text-sm text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono opacity-80">Total Users</p>
              <p className="text-3xl font-mono font-black mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono opacity-80">Approved</p>
              <p className="text-3xl font-mono font-black mt-1">{stats.approved}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono opacity-80">Pending</p>
              <p className="text-3xl font-mono font-black mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono opacity-80">Rejected</p>
              <p className="text-3xl font-mono font-black mt-1">{stats.rejected}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono opacity-80">Total Balance</p>
              <p className="text-3xl font-mono font-black mt-1">₹{stats.totalBalance.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 pl-12 pr-4 py-3.5 text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border-2 border-gray-200 px-5 py-3 text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm font-bold rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="text-left py-4 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-600">
                    Sr. No <SortIcon field="id" />
                  </div>
                </th>
                <th className="text-left py-4 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-600">
                    Name <SortIcon field="name" />
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Phone</th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">User Action</th>
                <th className="text-left py-4 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-600">
                    Status <SortIcon field="status" />
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Approve/Reject</th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Reset Password</th>
                <th className="text-left py-4 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort("balance")}>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-600">
                    Balance <SortIcon field="balance" />
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Amount</th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-mono text-gray-500">No users found</p>
                      <p className="text-xs font-mono text-gray-400">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200 group"
                  >
                    <td className="py-4 px-4 text-xs font-mono font-semibold text-gray-500">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-mono font-bold text-blue-600">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-mono font-bold text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono font-semibold text-gray-600">
                      {u.mobileNumber}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => togglePlayerNamePermission(u)}
                        disabled={u.status?.toUpperCase() !== "APPROVED"}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 w-full justify-center ${
                          u.canAddPlayerName
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        } ${
                          u.status?.toUpperCase() !== "APPROVED"
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {u.canAddPlayerName ? (
                          <>
                            <Shield className="w-3.5 h-3.5" />
                            Can Add Name
                          </>
                        ) : (
                          <>
                            <ShieldOff className="w-3.5 h-3.5" />
                            Cannot Add Name
                          </>
                        )}
                      </button>
                      {u.status?.toUpperCase() !== "APPROVED" && (
                        <p className="text-[9px] font-mono font-semibold text-gray-500 mt-1 text-center">
                          Approve first
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-mono font-bold ${statusColor(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(u.id, u.name)}
                          className={`p-2 rounded-lg transition-all ${
                            u.status?.toUpperCase() === "APPROVED"
                              ? "bg-green-100 text-green-400 cursor-not-allowed opacity-50"
                              : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600"
                          }`}
                          title="Approve User"
                          disabled={u.status?.toUpperCase() === "APPROVED"}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(u.id, u.name)}
                          className={`p-2 rounded-lg transition-all ${
                            u.status?.toUpperCase() === "REJECTED"
                              ? "bg-red-100 text-red-400 cursor-not-allowed opacity-50"
                              : "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600"
                          }`}
                          title="Reject User"
                          disabled={u.status?.toUpperCase() === "REJECTED"}
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={resetPasswordInputs[u.id] || ""}
                          onChange={(e) =>
                            setResetPasswordInputs((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                          placeholder="New password"
                          className="w-28 bg-gray-50 border-2 border-gray-200 px-2 py-2 text-xs font-mono font-bold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-lg"
                          disabled={u.status?.toUpperCase() !== "APPROVED"}
                        />
                        <button
                          onClick={() => handleResetPassword(u.id, u.name)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all disabled:opacity-50"
                          title="Reset Password"
                          disabled={u.status?.toUpperCase() !== "APPROVED"}
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-base font-mono font-bold text-gray-900">{u.balance.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={balanceInputs[u.id] || ""}
                          onChange={(e) =>
                            setBalanceInputs((prev) => ({
                              ...prev,
                              [u.id]: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="Amount"
                          className="w-24 bg-gray-50 border-2 border-gray-200 px-2 py-2 text-xs font-mono font-bold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-lg"
                          disabled={u.status?.toUpperCase() !== "APPROVED"}
                        />
                        <button
                          onClick={() => handleAddBalance(u.id, u.name)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                          title="Add Balance"
                          disabled={u.status?.toUpperCase() !== "APPROVED"}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveBalance(u.id, u.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Remove Balance"
                          disabled={u.status?.toUpperCase() !== "APPROVED"}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all group-hover:scale-110"
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
    </div>
  );
};

export default AdminUsers;