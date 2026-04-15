import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center animate-pulse-slow">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-6 overflow-hidden">
            <img 
              src="/icons/launchericon-192x192.png" 
              alt="SR BOSS Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
        <h1 className="text-3xl font-mono font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          SR BOSS
        </h1>
        <p className="font-mono text-gray-500 text-sm">Loading...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;