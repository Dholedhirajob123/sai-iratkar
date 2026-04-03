import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Star, 
  LogOut, 
  Users, 
  Gamepad2, 
  FileText, 
  History, 
  Trophy,
  Menu,
  X,
  Bell,
  UserCircle,
  ChevronDown
} from "lucide-react";

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      if (!isAdmin) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading || !user || !isAdmin) return null;

  const tabs = [
    { id: "users", label: "Users", icon: Users, path: "/admin/users", color: "blue"  },
    { id: "games", label: "Games", icon: Gamepad2, path: "/admin/games", color: "green" },
    { id: "entries", label: "Entries", icon: FileText, path: "/admin/entries", color: "purple" },
    { id: "history", label: "History", icon: History, path: "/admin/history", color: "orange" },
    { id: "results", label: "Results", icon: Trophy, path: "/admin/results", color: "yellow" },
  ];

  const currentTab = tabs.find((tab) => location.pathname === tab.path)?.id || "users";

  const getTabColor = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                {/* Logo Icon with Image */}
                <div className="relative">
                  {/* Remove the gradient blur and use image instead */}
                  <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br ">
                    <img 
                      src="/icons/launchericon-192x192.png" 
                      alt="Matka King Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-mono font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-[10px] font-mono text-gray-500">Control Center</p>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                    {user?.name ? (
                      <span className="text-white font-mono font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <UserCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-mono font-semibold text-gray-900">{user.name}</p>
                    <p className="text-[9px] font-mono text-gray-500">Administrator</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-mono font-semibold text-gray-900">{user.name}</p>
                        <p className="text-[10px] font-mono text-gray-500">{user.mobileNumber}</p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          navigate("/login", { replace: true });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-mono text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden animate-slideInLeft">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                    <img 
                      src="/icons/launchericon-192x192.png" 
                      alt="Matka King Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className="text-base font-mono font-bold text-gray-900">Admin Panel</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {tabs.map(({ id, label, icon: Icon, path, description }) => (
                <button
                  key={id}
                  onClick={() => {
                    navigate(path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 mb-1 ${
                    currentTab === id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-mono font-semibold">{label}</p>
                    <p className="text-[9px] font-mono text-gray-500">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Desktop Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(({ id, label, icon: Icon, path, color, description }) => (
              <button
                key={id}
                onClick={() => navigate(path)}
                className={`group relative flex items-center gap-2 px-5 py-4 font-mono text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  currentTab === id
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-4 h-4 transition-all duration-200 ${
                  currentTab === id ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                }`} />
                {label}
                {currentTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                )}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${getTabColor(color)} whitespace-nowrap`}>
                    {description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;