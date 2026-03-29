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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-all duration-200 ${
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              activeClassName="text-blue-600"
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
              <span className={`text-[10px] font-mono font-bold ${isActive ? "text-blue-600" : "text-gray-600"}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-1 px-3 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
          <span className="text-[10px] font-mono font-bold text-gray-600 group-hover:text-red-600 transition-colors">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;