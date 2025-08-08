import React from 'react';
import { Cloud, CloudOff, AlertCircle, Loader } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';
import { useAuth } from '../contexts/AuthContext';

const SyncStatusIndicator: React.FC = () => {
  const { syncStatus } = useCollection();
  const { user } = useAuth();

  // Don't show anything if user is not authenticated
  if (!user) return null;

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'loading':
        return {
          icon: Loader,
          text: 'Syncing...',
          className: 'text-blue-500 animate-spin'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Sync Error',
          className: 'text-red-500'
        };
      case 'offline':
        return {
          icon: CloudOff,
          text: 'Offline',
          className: 'text-gray-500'
        };
      case 'idle':
      default:
        return {
          icon: Cloud,
          text: 'Synced',
          className: 'text-green-500'
        };
    }
  };

  const { icon: Icon, text, className } = getStatusConfig();

  return (
    <div className="flex items-center space-x-1 text-xs">
      <Icon size={14} className={className} />
      <span className={className}>{text}</span>
    </div>
  );
};

export default SyncStatusIndicator;