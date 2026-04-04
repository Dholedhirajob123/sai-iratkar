import { useCallback, useEffect, useState, useRef } from "react";
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
  Menu,
  Eye,
  EyeOff,
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
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  
  const initialLoadRef = useRef(false);
  const isFetchingRef = useRef(false);

  const token = localStorage.getItem("token");

  const getHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const fetchUsers = useCallback(async (showRefreshToast = false) => {
    if (isFetchingRef.current) return;
    if (initialLoadRef.current && !showRefreshToast) return;
    
    try {
      isFetchingRef.current = true;
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
      const filteredData = data.filter((u: User) => u.role?.toUpperCase() !== "ADMIN");
      setUsers(filteredData);
      initialLoadRef.current = true;
      
      if (showRefreshToast) {
        toast({ title: "Refreshed", description: `Loaded ${filteredData.length} users` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load users";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [toast, getHeaders]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleApprove = async (id: number, name: string) => {
    try {
      const response = await fetch(`http://localhost:5003/admin/approve/${id}`, {
        method: "PUT", headers: getHeaders(),
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message || "Failed to approve user");
      toast({ title: "Success", description: message || `${name} approved successfully` });
      fetchUsers(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to approve user";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleReject = async (id: number, name: string) => {
    try {
      const response = await fetch(`http://localhost:5003/admin/reject/${id}`, {
        method: "PUT", headers: getHeaders(),
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message || "Failed to reject user");
      toast({ title: "Success", description: message || `${name} rejected successfully` });
      fetchUsers(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reject user";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const togglePlayerNamePermission = async (user: User) => {
    try {
      const newValue = !user.canAddPlayerName;
      const response = await fetch(
        `http://localhost:5003/admin/player-permission/${user.id}?value=${newValue}`,
        { method: "PUT", headers: getHeaders() }
      );
      const message = await response.text();
      if (!response.ok) throw new Error(message || "Failed to update permission");
      toast({ title: newValue ? "Permission Granted" : "Permission Revoked", description: message });
      fetchUsers(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update permission";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleResetPassword = async (id: number, name: string) => {
    const newPassword = resetPasswordInputs[id];
    if (!newPassword || !/^\d{4}$/.test(newPassword)) {
      toast({ title: "Invalid Password", description: "Password must be exactly 4 digits", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5003/admin/reset-password/${id}`, {
        method: "PUT", headers: getHeaders(),
        body: JSON.stringify({ password: newPassword }),
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message || "Failed to reset password");
      toast({ title: "Password Reset", description: message || `Password for ${name} has been reset successfully` });
      setResetPasswordInputs((prev) => ({ ...prev, [id]: "" }));
      fetchUsers(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reset password";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const response = await fetch(`http://localhost:5003/admin/delete/${id}`, {
        method: "DELETE", headers: getHeaders(),
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message || "Failed to delete user");
      toast({ title: "Success", description: message || `${name} deleted successfully` });
      fetchUsers(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete user";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleAddBalance = async (id: number, name: string) => {
    const amount = Number(balanceInputs[id]);
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5003/admin/add-balance/${id}?amount=${amount}`, {
        method: "PUT", headers: getHeaders(),
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message || "Failed to add balance");
      toast({ title: "Success", description: message || `₹${amount} added to ${name}` });
      setBalanceInputs((prev) => ({ ...prev, [id]: "" }));
      fetchUsers(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add balance";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleRemoveBalance = async (id: number, name: string) => {
    const amount = Number(balanceInputs[id]);
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5003/admin/remove-balance/${id}?amount=${amount}`, {
        method: "PUT", headers: getHeaders(),
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message || "Failed to remove balance");
      toast({ title: "Success", description: message || `₹${amount} removed from ${name}` });
      setBalanceInputs((prev) => ({ ...prev, [id]: "" }));
      fetchUsers(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove balance";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const toggleMobileMenu = (userId: number) => {
    setMobileMenuOpen(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const togglePasswordVisibility = (userId: number) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.mobileNumber.includes(searchQuery);
      const matchesStatus = statusFilter === "all" || user.status?.toUpperCase() === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];
      if (sortField === "balance") { aVal = a.balance; bVal = b.balance; }
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

  const handleRefresh = () => fetchUsers(true);

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] sm:text-xs font-mono opacity-80">Total Users</p>
              <p className="text-xl sm:text-3xl font-mono font-black mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] sm:text-xs font-mono opacity-80">Approved</p>
              <p className="text-xl sm:text-3xl font-mono font-black mt-1">{stats.approved}</p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
              <UserCheck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] sm:text-xs font-mono opacity-80">Pending</p>
              <p className="text-xl sm:text-3xl font-mono font-black mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] sm:text-xs font-mono opacity-80">Rejected</p>
              <p className="text-xl sm:text-3xl font-mono font-black mt-1">{stats.rejected}</p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
              <UserX className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] sm:text-xs font-mono opacity-80">Total Balance</p>
              <p className="text-sm sm:text-3xl font-mono font-black mt-1 truncate">₹{stats.totalBalance.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar - Responsive */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-200 pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3.5 text-xs sm:text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-lg sm:rounded-xl transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-gray-50 border-2 border-gray-200 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-mono font-semibold text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 sm:px-5 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View - Visible on Mobile/Tablet */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-gray-100 p-4 rounded-full">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-mono text-gray-500">No users found</p>
            </div>
          </div>
        ) : (
          filteredUsers.map((u, index) => (
            <div key={u.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-mono font-bold text-blue-600">{u.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-mono font-bold text-gray-900">{u.name}</h3>
                      <p className="text-xs font-mono text-gray-500">{u.mobileNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold ${statusColor(u.status)}`}>
                    {u.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-gray-600">Balance:</span>
                  <span className="text-lg font-mono font-bold text-blue-600">₹{u.balance.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-gray-600">Permission:</span>
                  <button
                    onClick={() => togglePlayerNamePermission(u)}
                    disabled={u.status?.toUpperCase() !== "APPROVED"}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      u.canAddPlayerName ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    } ${u.status?.toUpperCase() !== "APPROVED" ? "opacity-50" : ""}`}
                  >
                    {u.canAddPlayerName ? "Can Add Name" : "Cannot Add Name"}
                  </button>
                </div>

                {u.status?.toUpperCase() !== "APPROVED" && u.status?.toUpperCase() !== "REJECTED" && (
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => handleApprove(u.id, u.name)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => handleReject(u.id, u.name)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2">
                      <XIcon className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}

                <button onClick={() => toggleMobileMenu(u.id)} className="w-full flex items-center justify-between py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all px-2">
                  <span className="text-xs font-mono font-semibold">More Options</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen[u.id] ? "rotate-180" : ""}`} />
                </button>

                {mobileMenuOpen[u.id] && (
                  <div className="space-y-3 pt-2 border-t border-gray-100 animate-fadeIn">
                    <div>
                      <label className="text-[10px] font-mono font-semibold text-gray-600 mb-1 block">Reset Password</label>
                      <div className="flex gap-2">
                        <input
                          type={showPassword[u.id] ? "text" : "password"}
                          value={resetPasswordInputs[u.id] || ""}
                          onChange={(e) => setResetPasswordInputs(prev => ({ ...prev, [u.id]: e.target.value }))}
                          placeholder="New password"
                          className="flex-1 bg-gray-50 border-2 border-gray-200 px-3 py-2 text-xs font-mono rounded-lg focus:outline-none focus:border-blue-500"
                          disabled={u.status?.toUpperCase() !== "APPROVED"}
                        />
                        <button onClick={() => togglePasswordVisibility(u.id)} className="p-2 bg-gray-100 rounded-lg">
                          {showPassword[u.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleResetPassword(u.id, u.name)} className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-mono font-bold transition-all" disabled={u.status?.toUpperCase() !== "APPROVED"}>
                          Reset
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-semibold text-gray-600 mb-1 block">Adjust Balance</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={balanceInputs[u.id] || ""}
                          onChange={(e) => setBalanceInputs(prev => ({ ...prev, [u.id]: e.target.value.replace(/\D/g, "") }))}
                          placeholder="Amount"
                          className="flex-1 bg-gray-50 border-2 border-gray-200 px-3 py-2 text-xs font-mono text-center rounded-lg focus:outline-none focus:border-blue-500"
                          disabled={u.status?.toUpperCase() !== "APPROVED"}
                        />
                        <button onClick={() => handleAddBalance(u.id, u.name)} className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1" disabled={u.status?.toUpperCase() !== "APPROVED"}>
                          <Plus className="w-3 h-3" /> Add
                        </button>
                        <button onClick={() => handleRemoveBalance(u.id, u.name)} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1" disabled={u.status?.toUpperCase() !== "APPROVED"}>
                          <Minus className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>

                    <button onClick={() => handleDeleteUser(u.id, u.name)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-mono font-bold hover:bg-red-200 transition-all">
                      <Trash2 className="w-3 h-3" /> Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View - Hidden on Mobile */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="text-left py-4 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-600">Sr. No <SortIcon field="id" /></div>
                </th>
                <th className="text-left py-4 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-600">Name <SortIcon field="name" /></div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Phone</th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">User Action</th>
                <th className="text-left py-4 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-600">Status <SortIcon field="status" /></div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Approve/Reject</th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Reset Password</th>
                <th className="text-left py-4 px-4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort("balance")}>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-600">Balance <SortIcon field="balance" /></div>
                </th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Amount</th>
                <th className="text-left py-4 px-4 text-xs font-mono font-bold text-gray-600">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={10} className="py-12 text-center"><div className="flex flex-col items-center gap-3"><div className="bg-gray-100 p-4 rounded-full"><Users className="w-8 h-8 text-gray-400" /></div><p className="text-sm font-mono text-gray-500">No users found</p></div></td></tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200 group">
                    <td className="py-4 px-4 text-xs font-mono font-semibold text-gray-500">{index + 1}</td>
                    <td className="py-4 px-4"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center"><span className="text-xs font-mono font-bold text-blue-600">{u.name.charAt(0).toUpperCase()}</span></div><span className="text-sm font-mono font-bold text-gray-900">{u.name}</span></div></td>
                    <td className="py-4 px-4 text-xs font-mono font-semibold text-gray-600">{u.mobileNumber}</td>
                    <td className="py-4 px-4">
                      <button onClick={() => togglePlayerNamePermission(u)} disabled={u.status?.toUpperCase() !== "APPROVED"} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 w-full justify-center ${u.canAddPlayerName ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"} ${u.status?.toUpperCase() !== "APPROVED" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        {u.canAddPlayerName ? <><Shield className="w-3.5 h-3.5" /> Can Add Name</> : <><ShieldOff className="w-3.5 h-3.5" /> Cannot Add Name</>}
                      </button>
                    </td>
                    <td className="py-4 px-4"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-mono font-bold ${statusColor(u.status)}`}>{u.status}</span></td>
                    <td className="py-4 px-4"><div className="flex items-center gap-2"><button onClick={() => handleApprove(u.id, u.name)} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600 transition-all disabled:opacity-50" disabled={u.status?.toUpperCase() === "APPROVED"}><Check className="w-4 h-4" /></button><button onClick={() => handleReject(u.id, u.name)} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-all disabled:opacity-50" disabled={u.status?.toUpperCase() === "REJECTED"}><XIcon className="w-4 h-4" /></button></div></td>
                    <td className="py-4 px-4"><div className="flex items-center gap-1.5"><input type="text" value={resetPasswordInputs[u.id] || ""} onChange={(e) => setResetPasswordInputs(prev => ({ ...prev, [u.id]: e.target.value }))} placeholder="New password" className="w-28 bg-gray-50 border-2 border-gray-200 px-2 py-2 text-xs font-mono font-bold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-lg" disabled={u.status?.toUpperCase() !== "APPROVED"} /><button onClick={() => handleResetPassword(u.id, u.name)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all disabled:opacity-50" disabled={u.status?.toUpperCase() !== "APPROVED"}><KeyRound className="w-4 h-4" /></button></div></td>
                    <td className="py-4 px-4"><div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-green-600" /><span className="text-base font-mono font-bold text-gray-900">{u.balance.toLocaleString()}</span></div></td>
                    <td className="py-4 px-4"><div className="flex items-center gap-1.5"><input type="text" value={balanceInputs[u.id] || ""} onChange={(e) => setBalanceInputs(prev => ({ ...prev, [u.id]: e.target.value.replace(/\D/g, "") }))} placeholder="Amount" className="w-24 bg-gray-50 border-2 border-gray-200 px-2 py-2 text-xs font-mono font-bold text-gray-900 text-center focus:outline-none focus:border-blue-500 rounded-lg" disabled={u.status?.toUpperCase() !== "APPROVED"} /><button onClick={() => handleAddBalance(u.id, u.name)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50" disabled={u.status?.toUpperCase() !== "APPROVED"}><Plus className="w-4 h-4" /></button><button onClick={() => handleRemoveBalance(u.id, u.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" disabled={u.status?.toUpperCase() !== "APPROVED"}><Minus className="w-4 h-4" /></button></div></td>
                    <td className="py-4 px-4"><button onClick={() => handleDeleteUser(u.id, u.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all group-hover:scale-110"><Trash2 className="w-4 h-4" /></button></td>
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