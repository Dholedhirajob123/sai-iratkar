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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-pulse-slow">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-card border-2 border-primary/40 rounded-lg mb-6">
          <Star className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-foreground mb-4">
          STAR MATKA
        </h1>
        <p className="font-mono text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
