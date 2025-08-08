import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CollectionCardVariants, ConsolidatedCard } from '../types';
import { supabase, UserCollection, TABLES } from '../lib/supabase';
import { useAuth } from './AuthContext';

// localStorage keys (for offline backup)
const STORAGE_KEYS = {
  COLLECTION_VARIANTS: 'lorcana_collection_variants'
};


// Helper functions for localStorage operations
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

interface CollectionContextType {
  variantCollection: CollectionCardVariants[];
  getVariantQuantities: (fullName: string) => { regular: number; foil: number; enchanted: number; special: number };
  addVariantToCollection: (consolidatedCard: ConsolidatedCard, variantType: 'regular' | 'foil' | 'enchanted' | 'special', quantity?: number) => void;
  removeVariantFromCollection: (fullName: string, variantType: 'regular' | 'foil' | 'enchanted' | 'special', quantity?: number) => void;
  totalCards: number;
  uniqueCards: number;
  exportCollection: () => string;
  importCollection: (data: string) => boolean;
  clearCollection: () => void;
  syncStatus: 'idle' | 'loading' | 'error' | 'offline';
  migrateFromLocalStorage: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

interface CollectionProviderProps {
  children: ReactNode;
}

export const CollectionProvider: React.FC<CollectionProviderProps> = ({ children }) => {
  const { user, session } = useAuth();
  const [variantCollection, setVariantCollection] = useState<CollectionCardVariants[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'error' | 'offline'>('idle');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load collection data when user changes
  useEffect(() => {
    if (user && session) {
      loadCollectionFromSupabase();
    } else {
      // Load from localStorage when not authenticated
      setVariantCollection(loadFromStorage(STORAGE_KEYS.COLLECTION_VARIANTS, []));
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session]);

  // Save to localStorage as backup whenever collection changes
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.COLLECTION_VARIANTS, variantCollection);
    }
  }, [variantCollection, isInitialized]);

  const loadCollectionFromSupabase = async () => {
    if (!user) return;
    
    setSyncStatus('loading');
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_COLLECTIONS)
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading collection:', error);
        setSyncStatus('error');
        // Fallback to localStorage
        setVariantCollection(loadFromStorage(STORAGE_KEYS.COLLECTION_VARIANTS, []));
      } else {
        // Convert UserCollection[] to CollectionCardVariants[]
        const converted = data.map((item: UserCollection) => ({
          cardId: 0, // We don't store cardId in Supabase, it's derived
          fullName: item.card_name,
          regular: item.regular_count,
          foil: item.foil_count,
          enchanted: item.enchanted_count,
          special: item.special_count
        }));
        
        setVariantCollection(converted);
        setSyncStatus('idle');
        
        // Mark migration as completed since we've loaded from cloud
        localStorage.setItem(`migration_completed_${user.id}`, 'true');
      }
    } catch (error) {
      console.error('Network error loading collection:', error);
      setSyncStatus('offline');
      // Fallback to localStorage
      setVariantCollection(loadFromStorage(STORAGE_KEYS.COLLECTION_VARIANTS, []));
    }
    setIsInitialized(true);
  };

  const syncCardToSupabase = async (card: CollectionCardVariants) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from(TABLES.USER_COLLECTIONS)
        .upsert({
          user_id: user.id,
          card_name: card.fullName,
          regular_count: card.regular,
          foil_count: card.foil,
          enchanted_count: card.enchanted,
          special_count: card.special
        }, {
          onConflict: 'user_id,card_name'
        });

      if (error) {
        console.error('Error syncing card to Supabase:', error);
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Network error syncing card:', error);
      setSyncStatus('offline');
    }
  };

  const removeCardFromSupabase = async (cardName: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from(TABLES.USER_COLLECTIONS)
        .delete()
        .eq('user_id', user.id)
        .eq('card_name', cardName);

      if (error) {
        console.error('Error removing card from Supabase:', error);
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Network error removing card:', error);
      setSyncStatus('offline');
    }
  };

  const migrateFromLocalStorage = async () => {
    if (!user) return;
    
    const localData = loadFromStorage<CollectionCardVariants[]>(STORAGE_KEYS.COLLECTION_VARIANTS, []);
    if (localData.length === 0) return;
    
    setSyncStatus('loading');
    try {
      // Upload all local data to Supabase
      const supabaseData = localData.map(card => ({
        user_id: user.id,
        card_name: card.fullName,
        regular_count: card.regular,
        foil_count: card.foil,
        enchanted_count: card.enchanted,
        special_count: card.special
      }));

      const { error } = await supabase
        .from(TABLES.USER_COLLECTIONS)
        .upsert(supabaseData, {
          onConflict: 'user_id,card_name'
        });

      if (error) {
        console.error('Error migrating collection:', error);
        setSyncStatus('error');
      } else {
        setSyncStatus('idle');
        console.log(`Migrated ${localData.length} cards to cloud`);
        // Mark migration as completed for this user
        localStorage.setItem(`migration_completed_${user.id}`, 'true');
      }
    } catch (error) {
      console.error('Network error during migration:', error);
      setSyncStatus('offline');
    }
  };

  const getVariantQuantities = (fullName: string) => {
    const variantCard = variantCollection.find(c => c.fullName === fullName);
    return variantCard ? {
      regular: variantCard.regular,
      foil: variantCard.foil,
      enchanted: variantCard.enchanted,
      special: variantCard.special
    } : { regular: 0, foil: 0, enchanted: 0, special: 0 };
  };


  const addVariantToCollection = (
    consolidatedCard: ConsolidatedCard, 
    variantType: 'regular' | 'foil' | 'enchanted' | 'special', 
    quantity: number = 1
  ) => {
    setVariantCollection(prev => {
      const existing = prev.find(c => c.fullName === consolidatedCard.fullName);
      let updatedCard: CollectionCardVariants;
      
      if (existing) {
        updatedCard = { ...existing, [variantType]: existing[variantType] + quantity };
        // Sync to Supabase
        syncCardToSupabase(updatedCard);
        return prev.map(c =>
          c.fullName === consolidatedCard.fullName ? updatedCard : c
        );
      } else {
        updatedCard = {
          cardId: consolidatedCard.baseCard.id,
          fullName: consolidatedCard.fullName,
          regular: 0,
          foil: 0,
          enchanted: 0,
          special: 0,
          [variantType]: quantity
        };
        // Sync to Supabase
        syncCardToSupabase(updatedCard);
        return [...prev, updatedCard];
      }
    });
  };


  const removeVariantFromCollection = (
    fullName: string, 
    variantType: 'regular' | 'foil' | 'enchanted' | 'special', 
    quantity: number = 1
  ) => {
    setVariantCollection(prev => 
      prev.map(card => {
        if (card.fullName === fullName) {
          const newQuantity = Math.max(0, card[variantType] - quantity);
          const updatedCard = { ...card, [variantType]: newQuantity };
          
          // Remove the card entirely if all variants are 0
          if (updatedCard.regular === 0 && updatedCard.foil === 0 && 
              updatedCard.enchanted === 0 && updatedCard.special === 0) {
            // Remove from Supabase
            removeCardFromSupabase(fullName);
            return null;
          }
          
          // Sync to Supabase
          syncCardToSupabase(updatedCard);
          return updatedCard;
        }
        return card;
      }).filter(Boolean) as CollectionCardVariants[]
    );
  };



  const totalCards = variantCollection.reduce((sum, card) => sum + card.regular + card.foil + card.enchanted + card.special, 0);
  const uniqueCards = variantCollection.length;

  const exportCollection = (): string => {
    const exportData = {
      timestamp: new Date().toISOString(),
      variants: variantCollection,
      metadata: {
        totalCards,
        uniqueCards,
        exportedBy: 'lorcana-manager-v2.0'
      }
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importCollection = (data: string): boolean => {
    try {
      const importData = JSON.parse(data);
      if (importData.variants && Array.isArray(importData.variants)) {
        setVariantCollection(importData.variants);
      }
      return true;
    } catch (error) {
      console.error('Failed to import collection:', error);
      return false;
    }
  };

  const clearCollection = async () => {
    setVariantCollection([]);
    localStorage.removeItem(STORAGE_KEYS.COLLECTION_VARIANTS);
    
    // Clear from Supabase if user is authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from(TABLES.USER_COLLECTIONS)
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error clearing collection from Supabase:', error);
          setSyncStatus('error');
        }
      } catch (error) {
        console.error('Network error clearing collection:', error);
        setSyncStatus('offline');
      }
    }
  };

  const value: CollectionContextType = {
    variantCollection,
    getVariantQuantities,
    addVariantToCollection,
    removeVariantFromCollection,
    totalCards,
    uniqueCards,
    exportCollection,
    importCollection,
    clearCollection,
    syncStatus,
    migrateFromLocalStorage,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};