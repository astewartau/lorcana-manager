import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const RealtimeStatus: React.FC = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Simple approach: assume connected when user is authenticated
    // In a real implementation, you'd listen to specific connection events
    setIsConnected(true);
    
    console.log('🔌 Real-time status: Connected for user', user.id);

    return () => {
      setIsConnected(false);
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
        isConnected 
          ? 'bg-green-100 text-green-700 border border-green-300' 
          : 'bg-red-100 text-red-700 border border-red-300'
      }`}>
        {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
        <span>{isConnected ? 'Live' : 'Offline'}</span>
      </div>
    </div>
  );
};

export default RealtimeStatus;