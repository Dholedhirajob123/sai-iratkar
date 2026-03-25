import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { loginUser, getCurrentUser } from "@/lib/gameApi";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.length !== 10) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 4) {
      toast({
        title: "Error",
        description: "Password must be at least 4 characters.",
        variant: "destructive",
      });
      return;
    }

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
        title: "Login Successful",
        description: "Welcome back!",
      });

      const role = String(user.role || data.role || "").toUpperCase();

      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "USER") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);
      toast({
        title: "Login Failed",
        description: error?.message || "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-card border-2 border-primary/40 rounded-lg mb-4">
            <Star className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
            MATKA KING
          </h1>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-lg font-mono font-semibold text-foreground mb-6">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 10 digit number"
                  className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full bg-input border-2 border-foreground/10 pl-10 pr-10 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-mono font-semibold py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-mono">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;