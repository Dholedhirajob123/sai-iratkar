import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Star, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  Sparkles,
  Shield,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { loginUser, getCurrentUser } from "@/lib/gameApi";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 🔥 Secret admin access counter
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // 🔥 Handle secret logo clicks for admin access
// 🔥 Handle secret logo clicks for admin access
const handleSecretLogoClick = () => {
  const now = Date.now();

  let newCount = 1;

  // if clicks are within 2 sec → increment
  if (now - lastClickTime <= 2000) {
    newCount = clickCount + 1;
  }

  setClickCount(newCount);
  setLastClickTime(now);

  // Optional feedback
  if (newCount === 2 || newCount === 3 || newCount === 4) {
    toast({
      title: "🔄 Switching Mode",
      description: `${5 - newCount} more clicks...`,
      duration: 600,
    });
  }

  // ✅ 5 clicks → go to OLD LOGIN PAGE
  if (newCount === 5) {
    toast({
      title: "↩️ Redirecting",
      description: "Going back to user login...",
      duration: 1000,
    });

    setTimeout(() => {
      navigate("/login"); // 👈 your old login page route
      setClickCount(0);
    }, 500);
  }
};

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

      login(user, data.token);

      toast({
        title: "Welcome Back!",
        description: `Hello ${user.name}, you have successfully logged in.`,
      });

     const role = String(user.role || data.role || "").toUpperCase();

// ❌ Block USER here
if (role !== "ADMIN") {
  toast({
    title: "Access Denied",
    description: "Only admins can login here",
    variant: "destructive",
  });

  return; // ⛔ stop execution
}

// ✅ Only ADMIN allowed
navigate("/admin", { replace: true });
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
            <div 
              className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br rounded-2xl shadow-xl mb-4 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={handleSecretLogoClick}
            >
              {/* App Icon Image - NOW CLICKABLE */}
              <img 
                src="/icons/launchericon-192x192.png" 
                alt="Si King Logo" 
                className="w-16 h-16 object-contain"
              />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
              
              {/* 🔥 Secret visual hint (only visible to those who know) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 rounded-2xl">
                <span className="text-[8px] font-mono text-white bg-black/50 px-1 rounded">Admin</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-mono font-black text-gray-900">Si King</h1>
          <p className="text-xs font-mono text-gray-500 mt-2">Login to your account and start playing</p>
          
          {/* 🔥 Secret counter indicator (optional - shows how many clicks remaining) */}
          {clickCount > 0 && clickCount < 4 && (
            <div className="mt-2 text-[8px] font-mono text-blue-500 animate-pulse">
              {5 - clickCount} more clicks for admin...
            </div>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-mono font-bold text-gray-900">Admin Login</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Number Field */}
              <div>
                <label className="text-xs font-mono font-bold text-gray-700 mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10 digit mobile number"
                    className="w-full bg-gray-50 border-2 border-gray-200 pl-10 pr-4 py-3 text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200"
                    autoComplete="off"
                  />
                </div>
                {phone && phone.length !== 10 && phone.length > 0 && (
                  <p className="mt-1 text-[10px] font-mono text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Phone number must be 10 digits
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-mono font-bold text-gray-700 mb-1.5 block">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-gray-50 border-2 border-gray-200 pl-10 pr-10 py-3 text-sm font-mono font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white rounded-xl transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && password.length < 4 && (
                  <p className="mt-1 text-[10px] font-mono text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Password must be at least 4 characters
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-mono font-bold py-3.5 text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;