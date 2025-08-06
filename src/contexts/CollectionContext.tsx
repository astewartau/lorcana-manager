import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CollectionCard, LorcanaCard, CollectionCardVariants, ConsolidatedCard } from '../types';

// localStorage keys - structured for future online account compatibility
const STORAGE_KEYS = {
  COLLECTION_LEGACY: 'lorcana_collection_legacy',
  COLLECTION_VARIANTS: 'lorcana_collection_variants',
  COLLECTION_VERSION: 'lorcana_collection_version',
  USER_SETTINGS: 'lorcana_user_settings' // For future account linking
};

const CURRENT_COLLECTION_VERSION = '1.0';

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
  collection: CollectionCard[];
  variantCollection: CollectionCardVariants[];
  getCardQuantity: (cardId: number) => number;
  getVariantQuantities: (fullName: string) => { regular: number; foil: number; enchanted: number; special: number };
  addCardToCollection: (card: LorcanaCard, quantity?: number) => void;
  addVariantToCollection: (consolidatedCard: ConsolidatedCard, variantType: 'regular' | 'foil' | 'enchanted' | 'special', quantity?: number) => void;
  removeCardFromCollection: (cardId: number, quantity?: number) => void;
  removeVariantFromCollection: (fullName: string, variantType: 'regular' | 'foil' | 'enchanted' | 'special', quantity?: number) => void;
  updateCardQuantity: (cardId: number, quantity: number) => void;
  toggleFoil: (cardId: number) => void;
  totalCards: number;
  uniqueCards: number;
  // Future account integration methods
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
  const [collection, setCollection] = useState<CollectionCard[]>(() => 
    loadFromStorage(STORAGE_KEYS.COLLECTION_LEGACY, [])
  );
  const [variantCollection, setVariantCollection] = useState<CollectionCardVariants[]>(() => 
    loadFromStorage(STORAGE_KEYS.COLLECTION_VARIANTS, [])
  );

  // Save to localStorage whenever collections change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COLLECTION_LEGACY, collection);
  }, [collection]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COLLECTION_VARIANTS, variantCollection);
  }, [variantCollection]);

  // Save version info for future migrations
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COLLECTION_VERSION, CURRENT_COLLECTION_VERSION);
  }, []);

  const getCardQuantity = (cardId: number): number => {
    const card = collection.find(c => c.id === cardId);
    return card ? card.quantity : 0;
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

  const addCardToCollection = (card: LorcanaCard, quantity: number = 1) => {
    setCollection(prev => {
      const existing = prev.find(c => c.id === card.id);
      if (existing) {
        return prev.map(c =>
          c.id === card.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      } else {
        return [...prev, { ...card, quantity, foil: false }];
      }
    });
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

  const removeCardFromCollection = (cardId: number, quantity: number = 1) => {
    setCollection(prev => 
      prev.map(card => {
        if (card.id === cardId) {
          const newQuantity = Math.max(0, card.quantity - quantity);
          return newQuantity === 0 
            ? null 
            : { ...card, quantity: newQuantity };
        }
        return card;
      }).filter(Boolean) as CollectionCard[]
    );
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

  const updateCardQuantity = (cardId: number, quantity: number) => {
    if (quantity <= 0) {
      setCollection(prev => prev.filter(card => card.id !== cardId));
    } else {
      setCollection(prev => 
        prev.map(card =>
          card.id === cardId ? { ...card, quantity } : card
        )
      );
    }
  };

  const toggleFoil = (cardId: number) => {
    setCollection(prev =>
      prev.map(card =>
        card.id === cardId ? { ...card, foil: !card.foil } : card
      )
    );
  };

  const totalCards = collection.reduce((sum, card) => sum + card.quantity, 0) + 
    variantCollection.reduce((sum, card) => sum + card.regular + card.foil + card.enchanted + card.special, 0);
  const uniqueCards = collection.length + variantCollection.length;

  // Future account integration methods
  const exportCollection = (): string => {
    const exportData = {
      version: CURRENT_COLLECTION_VERSION,
      timestamp: new Date().toISOString(),
      legacy: collection,
      variants: variantCollection,
      metadata: {
        totalCards,
        uniqueCards,
        exportedBy: 'lorcana-manager-v1.0'
      }
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importCollection = (data: string): boolean => {
    try {
      const importData = JSON.parse(data);
      if (importData.legacy && Array.isArray(importData.legacy)) {
        setCollection(importData.legacy);
      }
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
    setCollection([]);
    setVariantCollection([]);
    // Clear localStorage as well
    localStorage.removeItem(STORAGE_KEYS.COLLECTION_LEGACY);
    localStorage.removeItem(STORAGE_KEYS.COLLECTION_VARIANTS);
  };

  const value: CollectionContextType = {
    collection,
    variantCollection,
    getCardQuantity,
    getVariantQuantities,
    addCardToCollection,
    addVariantToCollection,
    removeCardFromCollection,
    removeVariantFromCollection,
    updateCardQuantity,
    toggleFoil,
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