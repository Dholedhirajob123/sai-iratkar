import { Link } from "react-router-dom";
import { Star, Clock, ArrowLeft, Sparkles, Shield, Bell } from "lucide-react";

const Pending = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r rounded-2xl blur-xl opacity-30 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br  rounded-2xl shadow-xl mb-4 overflow-hidden">
              {/* App Icon Image */}
              <img 
                src="/icons/launchericon-192x192.png" 
                alt="Matka King Logo" 
                className="w-16 h-16 object-contain"
              />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-mono font-black text-gray-900">STAR MATKA</h1>
          <p className="text-xs font-mono text-gray-500 mt-2">Account Verification</p>
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-8 text-center">
            {/* Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg overflow-hidden">
                {/* Optional: Add a small icon image here or keep the clock */}
                <Clock className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-mono font-bold text-gray-900 mb-3">Pending Approval</h2>
            <p className="text-sm font-mono text-gray-600 mb-6 leading-relaxed">
              Your account is pending admin approval. Please wait for the administrator to review and approve your registration.
            </p>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-mono font-bold text-gray-800 mb-1">What happens next?</p>
                  <p className="text-[10px] font-mono text-gray-600 leading-relaxed">
                    Once approved, you'll receive a notification and can log in to start playing. 
                    This process typically takes a few hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Login Button */}
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-mono font-bold py-3.5 text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg gap-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>

            {/* Help Text */}
            <p className="text-[9px] font-mono text-gray-400 mt-4">
              Need help? Contact support
            </p>
          </div>
        </div>

        
     
      </div>
    </div>
  );
};

export default Pending;