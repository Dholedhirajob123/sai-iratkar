import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  Shield,
  ArrowRight,
  AlertCircle,
  KeyRound
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { loginUser, getCurrentUser } from "@/lib/gameApi";

const AdminSecretLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const validateForm = () => {
    if (phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 4) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 4 characters.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = await loginUser({
        mobileNumber: phone,
        password: password,
      });

      if (!data?.token) {
        toast({
          title: "Login Failed",
          description: "Invalid login response from server.",
          variant: "destructive",
        });
        return;
      }

      const user = await getCurrentUser(data.token);

      if (!user) {
        toast({
          title: "Login Failed",
          description: "Unable to fetch logged in user details.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is admin
      const role = String(user.role || data.role || "").toUpperCase();
      
      if (role !== "ADMIN") {
        toast({
          title: "Access Denied",
          description: "This portal is for administrators only.",
          variant: "destructive",
        });
        return;
      }

      login(user, data.token);

      toast({
        title: "Admin Access Granted!",
        description: `Welcome back, ${user.name}`,
      });

      navigate("/admin", { replace: true });
    } catch (error: any) {
      console.error("ADMIN LOGIN ERROR:", error);
      toast({
        title: "Login Failed",
        description: error?.message || "Invalid credentials or server error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Secret Admin Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-xl mb-4 overflow-hidden">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-mono font-black text-white">Admin Portal</h1>
          <p className="text-xs font-mono text-gray-400 mt-2">Secure administrator access</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-mono font-bold text-white">Admin Login</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Number Field */}
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10 digit mobile number"
                    className="w-full bg-gray-700 border-2 border-gray-600 pl-10 pr-4 py-3 text-sm font-mono font-semibold text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:bg-gray-700 rounded-xl transition-all duration-200"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-mono font-bold text-gray-300 mb-1.5 block">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-gray-700 border-2 border-gray-600 pl-10 pr-10 py-3 text-sm font-mono font-semibold text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:bg-gray-700 rounded-xl transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-mono font-bold py-3.5 text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Admin Panel
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Back to User Login */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-center text-xs font-mono text-gray-400">
                <button
                  onClick={() => navigate("/login")}
                  className="text-red-500 hover:text-red-400 font-mono font-bold hover:underline transition-colors"
                >
                  ← Back to User Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecretLogin;