import React, { useState, useEffect } from 'react';
import { Upload, X, AlertTriangle } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';
import { useAuth } from '../contexts/AuthContext';

const MigrationPrompt: React.FC = () => {
  const { user } = useAuth();
  const { migrateFromLocalStorage, syncStatus } = useCollection();
  const [showPrompt, setShowPrompt] = useState(false);
  const [localCardCount, setLocalCardCount] = useState(0);

  useEffect(() => {
    if (user && syncStatus === 'idle') {
      // Check if we've already shown migration prompt for this user
      const migrationKey = `migration_completed_${user.id}`;
      const alreadyMigrated = localStorage.getItem(migrationKey);
      
      if (alreadyMigrated) {
        return; // Don't show prompt again
      }
      
      // Check if there's local data to migrate
      try {
        const localData = localStorage.getItem('lorcana_collection_variants');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocalCardCount(parsed.length);
            setShowPrompt(true);
          }
        }
      } catch (error) {
        console.error('Error checking local data:', error);
      }
    }
  }, [user, syncStatus]);

  const handleMigrate = async () => {
    await migrateFromLocalStorage();
    // Mark migration as completed for this user
    if (user) {
      localStorage.setItem(`migration_completed_${user.id}`, 'true');
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    // Mark migration as completed (user chose to skip)
    if (user) {
      localStorage.setItem(`migration_completed_${user.id}`, 'true');
    }
    setShowPrompt(false);
  };

  if (!showPrompt || !user) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border-2 border-lorcana-gold rounded-sm shadow-xl p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 p-2 bg-orange-100 rounded-full">
          <AlertTriangle size={20} className="text-orange-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Local Collection Found
            </h3>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            We found {localCardCount} cards in your local storage. 
            Would you like to sync them to the cloud?
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleMigrate}
              disabled={syncStatus === 'loading'}
              className="flex items-center space-x-1 px-3 py-1.5 bg-lorcana-navy text-lorcana-gold text-sm font-medium rounded-sm hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              <Upload size={14} />
              <span>{syncStatus === 'loading' ? 'Syncing...' : 'Sync to Cloud'}</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationPrompt;