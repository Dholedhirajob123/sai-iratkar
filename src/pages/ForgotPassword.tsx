import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, Phone, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserByPhone, updateUser } from "@/lib/storage";

const ForgotPassword = () => {
  const [step, setStep] = useState<"phone" | "password" | "success">("phone");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle phone verification
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length !== 10) {
      toast({ 
        title: "Error", 
        description: "Please enter a valid 10-digit phone number.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    
    // Check if user exists
    const user = getUserByPhone(phone);
    
    if (!user) {
      toast({ 
        title: "Error", 
        description: "No account found with this phone number.", 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }

    // Move to password reset step
    setStep("password");
    setLoading(false);
  };

  // Handle new password submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 4) {
      toast({ 
        title: "Error", 
        description: "Password must be at least 4 characters.", 
        variant: "destructive" 
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ 
        title: "Error", 
        description: "Passwords do not match.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    // Update user password
    const user = getUserByPhone(phone);
    if (user) {
      const updatedUser = { ...user, password: newPassword };
      updateUser(updatedUser);
    }

    setStep("success");
    setLoading(false);
  };

  // Back to login
  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-card border-2 border-primary/40 rounded-lg mb-4">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">MATKA KING</h1>
        </div>

        {/* Forgot Password Card */}
        <div className="surface-card p-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => step === "phone" ? navigate("/login") : setStep("phone")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-mono font-semibold text-foreground">
              {step === "phone" && "Forgot Password"}
              {step === "password" && "Reset Password"}
              {step === "success" && "Success!"}
            </h2>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex-1 h-1 rounded ${
              step === "phone" ? "bg-primary" : 
              step === "password" || step === "success" ? "bg-primary" : "bg-foreground/10"
            }`} />
            <div className={`flex-1 h-1 rounded mx-1 ${
              step === "password" ? "bg-primary" : 
              step === "success" ? "bg-primary" : "bg-foreground/10"
            }`} />
          </div>

          {/* Step 1: Phone Number */}
          {step === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">
                  Enter Your Phone Number
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
                    autoFocus
                  />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-2">
                  Enter your registered phone number to reset password
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-mono font-semibold py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>
          )}

          {/* Step 2: New Password */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="p-3 bg-accent/10 rounded-lg mb-2">
                <p className="text-xs font-mono text-center">
                  Resetting password for: <span className="text-primary font-bold">{phone}</span>
                </p>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    maxLength={4}
                    className="w-full bg-input border-2 border-foreground/10 pl-10 pr-10 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    maxLength={4}
                    className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-mono font-semibold py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
              >
                ← Use different number
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center border-2 border-success/30">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-mono font-bold text-foreground mb-2">
                  Password Reset Successful!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your password has been changed successfully for {phone}.
                </p>
              </div>

              <button
                onClick={handleBackToLogin}
                className="w-full bg-primary text-primary-foreground font-mono font-semibold py-3 text-sm hover:opacity-90 transition-opacity mt-4"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          {step !== "success" && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:underline font-mono">
                Login
              </Link>
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="surface-card p-4 mt-4">
          <p className="text-xs font-mono text-muted-foreground text-center">
            Enter your registered phone number to reset password
            <br />
            Demo: Use 8888888888 or 9999999999
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;