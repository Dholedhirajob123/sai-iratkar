import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Star, LogOut, Users, Gamepad2, FileText, History, Trophy } from "lucide-react";

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) { navigate("/login", { replace: true }); return; }
      if (user.role !== "admin") { navigate("/dashboard", { replace: true }); }
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== "admin") return null;

  const tabs = [
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "games", label: "Games", icon: Gamepad2, path: "/admin/games" },
    { id: "entries", label: "Entries", icon: FileText, path: "/admin/entries" },
    { id: "history", label: "History", icon: History, path: "/admin/history" },
    { id: "results", label: "Results", icon: Trophy, path: "/admin/results" },
  ];

  const currentTab = tabs.find(tab => location.pathname === tab.path)?.id || "users";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="surface-card border-t-0 border-x-0 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border-2 border-primary/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-mono font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage users & games</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-1.5 px-3 py-2 border-2 border-destructive/30 text-destructive font-mono text-xs font-semibold hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-foreground/10 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon, path }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              currentTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;