import { useState } from "react";
import { Crown, Lock, User, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call to localhost:5053
    try {
      // Replace with your actual API endpoint
      const response = await fetch("http://localhost:5053/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token in localStorage for persistence
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", username);
        onLoginSuccess(data.token);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid username or password");
      }
    } catch (err) {
      // For demo purposes - simulate successful login with demo credentials
      if (username === "admin" && password === "admin123") {
        const mockToken = "mock_jwt_token_" + Date.now();
        localStorage.setItem("admin_token", mockToken);
        localStorage.setItem("admin_user", username);
        onLoginSuccess(mockToken);
      } else {
        setError("Invalid username or password. Try: admin / admin123");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20 mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-mono font-bold text-white tracking-wider">STAR MATKA</h1>
          <p className="text-[10px] text-yellow-500/70 font-mono mt-1">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-700">
            <Shield className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-mono font-bold text-white">Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-[10px] font-mono text-gray-400 mb-1.5">USERNAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm font-mono focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-mono text-gray-400 mb-1.5">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm font-mono focus:border-yellow-500/50 focus:outline-none transition-colors"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-[11px] text-red-400 font-mono">{error}</p>
              </div>
            )}

            {/* Demo Credentials Hint */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5">
              <p className="text-[9px] text-blue-400 font-mono text-center">
                Demo credentials: admin / admin123
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl font-mono font-bold text-white text-sm hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  LOGGING IN...
                </span>
              ) : (
                "LOGIN TO ADMIN PANEL"
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-[10px] font-mono text-gray-500 hover:text-yellow-400 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[8px] font-mono text-gray-600 mt-6">
          Secure Admin Access • All activities are logged
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;