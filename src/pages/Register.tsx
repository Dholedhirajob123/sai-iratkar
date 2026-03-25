import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, User, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.length < 2) {
      toast({
        title: "Error",
        description: "Name must be at least 2 characters.",
        variant: "destructive"
      });
      return;
    }

    if (phone.length !== 10) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 4) {
      toast({
        title: "Error",
        description: "Password must be at least 4 characters.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    try {

      const response = await fetch("http://localhost:5003/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          mobileNumber: phone,
          password: password,
          confirmPassword: confirmPassword
        })
      });

      const message = await response.text();

      if (response.ok) {

        toast({
          title: "Success",
          description: message
        });

        navigate("/pending");

      } else {

        toast({
          title: "Registration Failed",
          description: message,
          variant: "destructive"
        });

      }

    } catch (error) {

      toast({
        title: "Server Error",
        description: "Unable to connect to server",
        variant: "destructive"
      });

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
            STAR MATKA
          </h1>
        </div>

        <div className="surface-card p-6">

          <h2 className="text-lg font-mono font-semibold text-foreground mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

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
                  maxLength={20}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full bg-input border-2 border-foreground/10 pl-10 pr-10 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
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
                  maxLength={20}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-input border-2 border-foreground/10 pl-10 pr-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-mono font-semibold py-3 text-sm hover:opacity-90 transition-opacity"
            >
              Register
            </button>

          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-mono">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Register;