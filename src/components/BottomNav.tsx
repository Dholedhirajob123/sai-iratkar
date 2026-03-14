import { useLocation, useNavigate } from "react-router-dom";
import { Home, Wallet, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "./NavLink";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/wallet", icon: Wallet, label: "Balance" },
  { to: "/history", icon: Clock, label: "History" },
];

const BottomNav = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-foreground/20 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 py-1 px-3 text-muted-foreground transition-colors"
              activeClassName="text-primary"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-1 px-3 text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-mono">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
