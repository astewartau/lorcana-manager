import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Deck, LorcanaCard, DeckSummary } from '../types';
import { validateDeck as validateDeckUtil } from '../utils/deckValidation';
// TODO: Implement Supabase sync for decks
// import { supabase, UserDeck, TABLES } from '../lib/supabase';
// import { useAuth } from './AuthContext';

const STORAGE_KEY = 'lorcana_decks';
const CURRENT_DECK_KEY = 'lorcana_current_deck';

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    const parsed = JSON.parse(item);
    if (key === STORAGE_KEY && Array.isArray(parsed)) {
      return parsed.map(deck => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        updatedAt: new Date(deck.updatedAt)
      })) as T;
    }
    if (key === CURRENT_DECK_KEY && parsed) {
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt)
      } as T;
    }
    return parsed;
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

interface DeckContextType {
  decks: Deck[];
  currentDeck: Deck | null;
  createDeck: (name: string, description?: string) => string;
  deleteDeck: (deckId: string) => void;
  duplicateDeck: (deckId: string) => string;
  updateDeck: (deck: Deck) => void;
  setCurrentDeck: (deck: Deck | null) => void;
  addCardToDeck: (card: LorcanaCard, deckId?: string) => boolean;
  removeCardFromDeck: (cardId: number, deckId?: string) => void;
  updateCardQuantity: (cardId: number, quantity: number, deckId?: string) => void;
  getDeckSummary: (deckId: string) => DeckSummary | null;
  validateDeck: (deck: Deck) => { isValid: boolean; errors: string[] };
  clearCurrentDeck: () => void;
  exportDeck: (deckId: string) => string;
  importDeck: (deckData: string) => boolean;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

interface DeckProviderProps {
  children: ReactNode;
}

export const DeckProvider: React.FC<DeckProviderProps> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>(() => 
    loadFromStorage(STORAGE_KEY, [])
  );
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(() =>
    loadFromStorage(CURRENT_DECK_KEY, null)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY, decks);
  }, [decks]);

  useEffect(() => {
    saveToStorage(CURRENT_DECK_KEY, currentDeck);
  }, [currentDeck]);

  const createDeck = (name: string, description?: string): string => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name,
      description,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setDecks(prev => [...prev, newDeck]);
    setCurrentDeck(newDeck);
    return newDeck.id;
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
    if (currentDeck?.id === deckId) {
      setCurrentDeck(null);
    }
  };

  const duplicateDeck = (deckId: string): string => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return '';
    
    const newDeck: Deck = {
      ...deck,
      id: Date.now().toString(),
      name: `${deck.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setDecks(prev => [...prev, newDeck]);
    return newDeck.id;
  };

  const updateDeck = (deck: Deck) => {
    setDecks(prev => prev.map(d => d.id === deck.id ? deck : d));
    if (currentDeck?.id === deck.id) {
      setCurrentDeck(deck);
    }
  };

  const addCardToDeck = (card: LorcanaCard, deckId?: string): boolean => {
    const targetDeck = deckId ? decks.find(d => d.id === deckId) : currentDeck;
    if (!targetDeck) return false;

    const existingCard = targetDeck.cards.find(c => c.id === card.id);
    const currentQuantity = existingCard?.quantity || 0;
    
    if (currentQuantity >= 4) return false;
    
    const totalCards = targetDeck.cards.reduce((sum, c) => sum + c.quantity, 0);
    if (totalCards >= 60) return false;

    const updatedDeck: Deck = {
      ...targetDeck,
      cards: existingCard
        ? targetDeck.cards.map(c =>
            c.id === card.id ? { ...c, quantity: c.quantity + 1 } : c
          )
        : [...targetDeck.cards, { ...card, quantity: 1 }],
      updatedAt: new Date()
    };

    updateDeck(updatedDeck);
    return true;
  };

  const removeCardFromDeck = (cardId: number, deckId?: string) => {
    const targetDeck = deckId ? decks.find(d => d.id === deckId) : currentDeck;
    if (!targetDeck) return;

    const updatedDeck: Deck = {
      ...targetDeck,
      cards: targetDeck.cards
        .map(c => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c)
        .filter(c => c.quantity > 0),
      updatedAt: new Date()
    };

    updateDeck(updatedDeck);
  };

  const updateCardQuantity = (cardId: number, quantity: number, deckId?: string) => {
    const targetDeck = deckId ? decks.find(d => d.id === deckId) : currentDeck;
    if (!targetDeck) return;
    
    if (quantity < 0 || quantity > 4) return;

    const existingCard = targetDeck.cards.find(c => c.id === cardId);
    
    const updatedDeck: Deck = {
      ...targetDeck,
      cards: quantity === 0
        ? targetDeck.cards.filter(c => c.id !== cardId)
        : existingCard
          ? targetDeck.cards.map(c => c.id === cardId ? { ...c, quantity } : c)
          : targetDeck.cards,
      updatedAt: new Date()
    };

    updateDeck(updatedDeck);
  };

  const getDeckSummary = (deckId: string): DeckSummary | null => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return null;

    const cardCount = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
    const inkDistribution: Record<string, number> = {};
    
    deck.cards.forEach(card => {
      const color = card.color || 'None';
      
      // Handle dual-ink cards by splitting them into individual colors
      if (color.includes('-')) {
        const colors = color.split('-');
        colors.forEach(individualColor => {
          inkDistribution[individualColor] = (inkDistribution[individualColor] || 0) + card.quantity;
        });
      } else {
        inkDistribution[color] = (inkDistribution[color] || 0) + card.quantity;
      }
    });

    const { isValid } = validateDeck(deck);

    return {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      cardCount,
      inkDistribution,
      isValid,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt
    };
  };

  const validateDeck = (deck: Deck): { isValid: boolean; errors: string[] } => {
    // Use the validation utility function as single source of truth
    const validationResult = validateDeckUtil(deck);
    return {
      isValid: validationResult.isValid,
      errors: validationResult.errors
    };
  };

  const clearCurrentDeck = () => {
    if (currentDeck) {
      const clearedDeck: Deck = {
        ...currentDeck,
        cards: [],
        updatedAt: new Date()
      };
      updateDeck(clearedDeck);
    }
  };

  const exportDeck = (deckId: string): string => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return '';
    
    const deckList = deck.cards
      .map(card => `${card.quantity}x ${card.name}${card.version ? ` - ${card.version}` : ''}`)
      .join('\n');
    
    return `Deck: ${deck.name}\n${deck.description ? `Description: ${deck.description}\n` : ''}\n${deckList}`;
  };

  const importDeck = (deckData: string): boolean => {
    try {
      const lines = deckData.trim().split('\n');
      const nameLine = lines.find(l => l.startsWith('Deck:'));
      const name = nameLine ? nameLine.replace('Deck:', '').trim() : 'Imported Deck';
      
      const descLine = lines.find(l => l.startsWith('Description:'));
      const description = descLine ? descLine.replace('Description:', '').trim() : undefined;
      
      createDeck(name, description);
      return true;
    } catch (error) {
      console.error('Failed to import deck:', error);
      return false;
    }
  };

  return (
    <DeckContext.Provider value={{
      decks,
      currentDeck,
      createDeck,
      deleteDeck,
      duplicateDeck,
      updateDeck,
      setCurrentDeck,
      addCardToDeck,
      removeCardFromDeck,
      updateCardQuantity,
      getDeckSummary,
      validateDeck,
      clearCurrentDeck,
      exportDeck,
      importDeck
    }}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = () => {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
};