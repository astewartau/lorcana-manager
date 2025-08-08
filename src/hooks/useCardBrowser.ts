import { useState, useMemo, useEffect } from 'react';
import { FilterOptions, SortOption, ConsolidatedCard } from '../types';
import { consolidatedCards } from '../data/allCards';
import { useCollection } from '../contexts/CollectionContext';
import { usePagination } from './usePagination';
import { filterCards, sortCards, groupCards, countActiveFilters } from '../utils/cardFiltering';
import { getDefaultFilters } from '../utils/filterDefaults';

export const useCardBrowser = () => {
  const { getVariantQuantities, addVariantToCollection, removeVariantFromCollection } = useCollection();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'set', direction: 'desc' });
  const [groupBy, setGroupBy] = useState<string>('none');
  const [filters, setFilters] = useState<FilterOptions>(getDefaultFilters());
  const [showFilters, setShowFilters] = useState(false);
  
  // Stale card state for handling cards that no longer match filters
  const [staleCardIds, setStaleCardIds] = useState<Set<number>>(new Set());
  const [showFilterNotification, setShowFilterNotification] = useState(false);
  const [staleCardCount, setStaleCardCount] = useState(0);
  
  const cardsPerPage = 100;

  // Computed values using utility functions
  const { sortedCards, groupedCards, totalCards, activeFiltersCount } = useMemo(() => {
    const filtered = filterCards(consolidatedCards, searchTerm, filters, staleCardIds, getVariantQuantities);
    const sorted = sortCards(filtered, sortBy);
    const grouped = groupCards(sorted, groupBy);
    const activeCount = countActiveFilters(filters);
    
    return {
      sortedCards: sorted,
      groupedCards: grouped,
      totalCards: sorted.length,
      activeFiltersCount: activeCount
    };
  }, [searchTerm, filters, sortBy, groupBy, getVariantQuantities, staleCardIds]);
  
  // Pagination
  const pagination = usePagination({
    totalItems: totalCards,
    itemsPerPage: cardsPerPage,
    resetTriggers: [searchTerm, filters, sortBy, groupBy]
  });
  
  // Get paginated cards for current page
  const paginatedCards = useMemo(() => {
    return sortedCards.slice(pagination.startIndex, pagination.endIndex);
  }, [sortedCards, pagination.startIndex, pagination.endIndex]);

  // Clear stale cards when filters change (user is intentionally refreshing)
  useEffect(() => {
    setStaleCardIds(new Set());
    setShowFilterNotification(false);
    setStaleCardCount(0);
  }, [filters, searchTerm, sortBy, groupBy]);

  // Event handlers
  const clearAllFilters = () => {
    setFilters(getDefaultFilters());
    setSearchTerm('');
  };

  const handleVariantQuantityChange = (
    consolidatedCard: ConsolidatedCard, 
    variantType: 'regular' | 'foil' | 'enchanted' | 'special', 
    change: number
  ) => {
    // Apply the change
    if (change > 0) {
      addVariantToCollection(consolidatedCard, variantType, change);
    } else {
      removeVariantFromCollection(consolidatedCard.fullName, variantType, Math.abs(change));
    }
    
    // Check if this card would now be filtered out due to collection filters
    if (filters.collectionFilter !== 'all') {
      console.log('Checking if card would be filtered out...', {
        cardName: consolidatedCard.baseCard.name,
        filter: filters.collectionFilter,
        change
      });
      
      // Get current quantities before the change to predict future state
      const currentQuantities = getVariantQuantities(consolidatedCard.fullName);
      const currentTotalOwned = currentQuantities.regular + currentQuantities.foil + currentQuantities.enchanted + currentQuantities.special;
      
      // Predict what the state will be after this change
      const predictedTotalOwned = currentTotalOwned + change;
      const willBeInCollection = predictedTotalOwned > 0;
      
      // Check if card would be filtered out after the change
      const wouldBeFilteredOut = (
        (filters.collectionFilter === 'owned' && !willBeInCollection) ||  // Filter wants "in collection" but card will not be in collection
        (filters.collectionFilter === 'not-owned' && willBeInCollection)     // Filter wants "not in collection" but card will be in collection
      );
      
      console.log('Stale card prediction:', {
        cardName: consolidatedCard.baseCard.name,
        currentTotalOwned,
        change,
        predictedTotalOwned,
        willBeInCollection,
        filterWantsInCollection: filters.collectionFilter,
        wouldBeFilteredOut,
        currentStaleIds: Array.from(staleCardIds)
      });
      
      if (wouldBeFilteredOut && !staleCardIds.has(consolidatedCard.baseCard.id)) {
        console.log('Adding card to stale list:', consolidatedCard.baseCard.name);
        setStaleCardIds(prev => {
          const newSet = new Set(prev);
          newSet.add(consolidatedCard.baseCard.id);
          return newSet;
        });
        setStaleCardCount(prev => prev + 1);
        setShowFilterNotification(true);
      }
    }
  };

  const refreshStaleCards = () => {
    setStaleCardIds(new Set());
    setShowFilterNotification(false);
    setStaleCardCount(0);
  };

  const dismissFilterNotification = () => {
    setShowFilterNotification(false);
  };

  // Return clean interface
  return {
    // State
    searchTerm,
    filters,
    sortBy,
    groupBy,
    viewMode,
    showFilters,
    staleCardIds,
    showFilterNotification,
    staleCardCount,
    
    // Actions
    setSearchTerm,
    setFilters,
    setSortBy,
    setGroupBy,
    setViewMode,
    setShowFilters,
    clearAllFilters,
    handleVariantQuantityChange,
    refreshStaleCards,
    dismissFilterNotification,
    
    // Collection functions (needed by child components)
    getVariantQuantities,
    
    // Computed
    sortedCards,
    groupedCards,
    totalCards,
    activeFiltersCount,
    paginatedCards,
    pagination
  };
};