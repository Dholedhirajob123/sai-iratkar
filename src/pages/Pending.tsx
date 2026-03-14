import { Link } from "react-router-dom";
import { Star, Clock, ArrowLeft } from "lucide-react";

const Pending = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-card border-2 border-primary/40 rounded-lg mb-4">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">STAR MATKA</h1>
        </div>

        <div className="surface-card p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent border-2 border-foreground/10 mb-6">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-mono font-bold text-foreground mb-3">Pending Approval</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your account is pending admin approval. Please wait for the administrator to review and approve your registration.
          </p>
          <div className="surface-raised p-3 mb-6">
            <p className="text-xs font-mono text-muted-foreground">
              This usually takes a few hours.<br />You will be able to login once approved.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground font-mono font-semibold py-3 text-sm hover:opacity-90 transition-opacity gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pending;
