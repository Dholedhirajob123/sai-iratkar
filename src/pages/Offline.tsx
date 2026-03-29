import { WifiOff, RefreshCw, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Offline = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-sm font-mono text-gray-600">Connection restored! Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gray-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-xl">
            <WifiOff className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-mono font-bold text-gray-900 mb-3">
          You're Offline
        </h1>
        <p className="text-sm font-mono text-gray-600 mb-6">
          Please check your internet connection and try again.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-mono font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-mono font-semibold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        <p className="text-[10px] font-mono text-gray-400 mt-6">
          Previously visited pages may still be available
        </p>
      </div>
    </div>
  );
};

export default Offline;