import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { CustomBinder, BinderCardEntry } from '../types';
import { supabase, TABLES } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

function convertSupabaseBinder(d: any): CustomBinder {
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    cards: (d.cards || []).map((c: any) => ({
      cardId: c.cardId,
      quantity: c.quantity
    })),
    isPublic: d.is_public,
    userId: d.user_id,
    createdAt: new Date(d.created_at),
    updatedAt: new Date(d.updated_at)
  };
}

interface BinderContextType {
  binders: CustomBinder[];
  currentBinder: CustomBinder | null;
  loading: boolean;
  setCurrentBinder: (binder: CustomBinder | null) => void;
  createBinder: (name: string, description?: string) => Promise<CustomBinder>;
  deleteBinder: (binderId: string) => Promise<void>;
  updateBinder: (binder: CustomBinder) => Promise<void>;
  addCardToBinder: (binderId: string, cardId: number) => void;
  removeCardFromBinder: (binderId: string, cardId: number) => void;
  setCardQuantity: (binderId: string, cardId: number, quantity: number) => void;
  setBinderCards: (binderId: string, cards: BinderCardEntry[]) => void;
}

const BinderContext = createContext<BinderContextType | undefined>(undefined);

interface BinderProviderProps {
  children: ReactNode;
}

export const BinderProvider: React.FC<BinderProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [binders, setBinders] = useState<CustomBinder[]>([]);
  const [currentBinder, setCurrentBinder] = useState<CustomBinder | null>(null);
  const [loading, setLoading] = useState(false);

  // Refs for latest state (avoids stale closures in rapid card operations)
  const bindersRef = useRef<CustomBinder[]>([]);
  const currentBinderRef = useRef<CustomBinder | null>(null);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Keep refs in sync with React state
  bindersRef.current = binders;
  currentBinderRef.current = currentBinder;

  // Cleanup pending save timers on unmount
  useEffect(() => {
    const timers = saveTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Load user's custom binders when authenticated
  useEffect(() => {
    if (user) {
      loadBinders();
    } else {
      setBinders([]);
      setCurrentBinder(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadBinders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_BINDERS)
        .select('*')
        .eq('user_id', user.id)
        .eq('binder_type', 'custom')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading binders:', error);
      } else if (data) {
        setBinders(data.map(convertSupabaseBinder));
      }
    } catch (error) {
      console.error('Error loading binders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced DB save for card operations
  const scheduleBinderSave = (binder: CustomBinder) => {
    if (saveTimersRef.current[binder.id]) {
      clearTimeout(saveTimersRef.current[binder.id]);
    }
    saveTimersRef.current[binder.id] = setTimeout(async () => {
      delete saveTimersRef.current[binder.id];
      if (!user) return;
      try {
        const { error } = await supabase
          .from(TABLES.USER_BINDERS)
          .update({
            cards: binder.cards,
            updated_at: new Date().toISOString()
          })
          .eq('id', binder.id)
          .eq('user_id', user.id);
        if (error) console.error('Error saving binder cards:', error);
      } catch (error) {
        console.error('Error saving binder cards:', error);
      }
    }, 500);
  };

  const applyBinderUpdate = (updatedBinder: CustomBinder) => {
    bindersRef.current = bindersRef.current.map(b => b.id === updatedBinder.id ? updatedBinder : b);
    if (currentBinderRef.current?.id === updatedBinder.id) {
      currentBinderRef.current = updatedBinder;
      setCurrentBinder(updatedBinder);
    }
    setBinders(prev => prev.map(b => b.id === updatedBinder.id ? updatedBinder : b));
    scheduleBinderSave(updatedBinder);
  };

  const createBinder = async (name: string, description?: string): Promise<CustomBinder> => {
    if (!user) throw new Error('Authentication required');

    const newBinder: CustomBinder = {
      id: uuidv4(),
      name,
      description,
      cards: [],
      isPublic: false,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { error } = await supabase
      .from(TABLES.USER_BINDERS)
      .insert({
        id: newBinder.id,
        user_id: user.id,
        name: newBinder.name,
        description: newBinder.description,
        binder_type: 'custom',
        set_code: null,
        cards: newBinder.cards,
        is_public: false
      });

    if (error) {
      console.error('Error creating binder:', error);
      throw error;
    }

    setBinders(prev => [newBinder, ...prev]);
    return newBinder;
  };

  const deleteBinder = async (binderId: string): Promise<void> => {
    if (!user) throw new Error('Authentication required');

    // Cancel any pending save
    if (saveTimersRef.current[binderId]) {
      clearTimeout(saveTimersRef.current[binderId]);
      delete saveTimersRef.current[binderId];
    }

    const { error } = await supabase
      .from(TABLES.USER_BINDERS)
      .delete()
      .eq('id', binderId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting binder:', error);
      throw error;
    }

    setBinders(prev => prev.filter(b => b.id !== binderId));
    if (currentBinder?.id === binderId) {
      setCurrentBinder(null);
    }
  };

  const updateBinder = async (binder: CustomBinder): Promise<void> => {
    if (!user) throw new Error('Authentication required');

    // Cancel any pending debounced save
    if (saveTimersRef.current[binder.id]) {
      clearTimeout(saveTimersRef.current[binder.id]);
      delete saveTimersRef.current[binder.id];
    }

    // Capture previous state from refs for rollback
    const previousBinders = [...bindersRef.current];
    const previousCurrentBinder = currentBinderRef.current;

    // Optimistic update
    bindersRef.current = bindersRef.current.map(b => b.id === binder.id ? binder : b);
    if (currentBinderRef.current?.id === binder.id) {
      currentBinderRef.current = binder;
    }
    setBinders(prev => prev.map(b => b.id === binder.id ? binder : b));
    if (previousCurrentBinder?.id === binder.id) {
      setCurrentBinder(binder);
    }

    try {
      const { error } = await supabase
        .from(TABLES.USER_BINDERS)
        .update({
          name: binder.name,
          description: binder.description,
          cards: binder.cards,
          is_public: binder.isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', binder.id)
        .eq('user_id', user.id);

      if (error) {
        // Revert
        bindersRef.current = previousBinders;
        currentBinderRef.current = previousCurrentBinder;
        setBinders(previousBinders);
        if (previousCurrentBinder?.id === binder.id) {
          setCurrentBinder(previousCurrentBinder);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating binder:', error);
      throw error;
    }
  };

  const addCardToBinder = (binderId: string, cardId: number) => {
    const binder = bindersRef.current.find(b => b.id === binderId);
    if (!binder) return;

    const existing = binder.cards.find(c => c.cardId === cardId);
    const updatedBinder: CustomBinder = {
      ...binder,
      cards: existing
        ? binder.cards.map(c => c.cardId === cardId ? { ...c, quantity: c.quantity + 1 } : c)
        : [...binder.cards, { cardId, quantity: 1 }],
      updatedAt: new Date()
    };

    applyBinderUpdate(updatedBinder);
  };

  const removeCardFromBinder = (binderId: string, cardId: number) => {
    const binder = bindersRef.current.find(b => b.id === binderId);
    if (!binder) return;

    const existing = binder.cards.find(c => c.cardId === cardId);
    if (!existing) return;

    const updatedBinder: CustomBinder = {
      ...binder,
      cards: existing.quantity <= 1
        ? binder.cards.filter(c => c.cardId !== cardId)
        : binder.cards.map(c => c.cardId === cardId ? { ...c, quantity: c.quantity - 1 } : c),
      updatedAt: new Date()
    };

    applyBinderUpdate(updatedBinder);
  };

  const setCardQuantity = (binderId: string, cardId: number, quantity: number) => {
    const binder = bindersRef.current.find(b => b.id === binderId);
    if (!binder) return;

    const updatedBinder: CustomBinder = {
      ...binder,
      cards: quantity <= 0
        ? binder.cards.filter(c => c.cardId !== cardId)
        : binder.cards.some(c => c.cardId === cardId)
          ? binder.cards.map(c => c.cardId === cardId ? { ...c, quantity } : c)
          : [...binder.cards, { cardId, quantity }],
      updatedAt: new Date()
    };

    applyBinderUpdate(updatedBinder);
  };

  const setBinderCards = (binderId: string, cards: BinderCardEntry[]) => {
    const binder = bindersRef.current.find(b => b.id === binderId);
    if (!binder) return;

    const updatedBinder: CustomBinder = {
      ...binder,
      cards,
      updatedAt: new Date()
    };

    applyBinderUpdate(updatedBinder);
  };

  const value: BinderContextType = {
    binders,
    currentBinder,
    loading,
    setCurrentBinder,
    createBinder,
    deleteBinder,
    updateBinder,
    addCardToBinder,
    removeCardFromBinder,
    setCardQuantity,
    setBinderCards
  };

  return <BinderContext.Provider value={value}>{children}</BinderContext.Provider>;
};

export const useBinder = (): BinderContextType => {
  const context = useContext(BinderContext);
  if (context === undefined) {
    throw new Error('useBinder must be used within a BinderProvider');
  }
  return context;
};
