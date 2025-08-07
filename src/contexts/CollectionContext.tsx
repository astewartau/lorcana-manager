import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CollectionCardVariants, ConsolidatedCard } from '../types';

// localStorage keys
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
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

interface CollectionProviderProps {
  children: ReactNode;
}

export const CollectionProvider: React.FC<CollectionProviderProps> = ({ children }) => {
  // Initialize state from localStorage
  const [variantCollection, setVariantCollection] = useState<CollectionCardVariants[]>(() => 
    loadFromStorage(STORAGE_KEYS.COLLECTION_VARIANTS, [])
  );

  // Save to localStorage whenever collection changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COLLECTION_VARIANTS, variantCollection);
  }, [variantCollection]);


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
      if (existing) {
        return prev.map(c =>
          c.fullName === consolidatedCard.fullName 
            ? { ...c, [variantType]: c[variantType] + quantity }
            : c
        );
      } else {
        const newVariantCard: CollectionCardVariants = {
          cardId: consolidatedCard.baseCard.id,
          fullName: consolidatedCard.fullName,
          regular: 0,
          foil: 0,
          enchanted: 0,
          special: 0,
          [variantType]: quantity
        };
        return [...prev, newVariantCard];
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
            return null;
          }
          
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

  const clearCollection = () => {
    setVariantCollection([]);
    localStorage.removeItem(STORAGE_KEYS.COLLECTION_VARIANTS);
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