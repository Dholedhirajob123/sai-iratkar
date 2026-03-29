import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center justify-between gap-2 animate-pulse">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-xs font-mono font-semibold">You are offline</span>
      </div>
      <span className="text-[10px] font-mono">Some features may be limited</span>
    </div>
  );
};

export default OfflineIndicator;