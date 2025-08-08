import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterOptions, SortOption, ConsolidatedCard } from '../types';
import { consolidatedCards } from '../data/allCards';
import { useCollection } from '../contexts/CollectionContext';
import { usePagination } from './usePagination';
import { filterCards, sortCards, groupCards, countActiveFilters } from '../utils/cardFiltering';
import { getDefaultFilters } from '../utils/filterDefaults';

export const useCardBrowser = () => {
  const { getVariantQuantities, addVariantToCollection, removeVariantFromCollection } = useCollection();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [searchTerm, setSearchTermState] = useState(() => searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => (searchParams.get('view') as 'grid' | 'list') || 'grid');
  const [sortBy, setSortByState] = useState<SortOption>(() => {
    const field = (searchParams.get('sortField') as SortOption['field']) || 'set';
    const direction = (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc';
    return { field, direction };
  });
  const [groupBy, setGroupByState] = useState<string>(() => searchParams.get('groupBy') || 'none');
  const [filters, setFiltersState] = useState<FilterOptions>(() => {
    const defaultFilters = getDefaultFilters();
    // Parse filters from URL params
    const urlFilters = { ...defaultFilters };
    
    // Parse specific filter parameters
    const sets = searchParams.getAll('set');
    if (sets.length > 0) urlFilters.sets = sets;
    
    const colors = searchParams.getAll('color');
    if (colors.length > 0) urlFilters.colors = colors;
    
    const rarities = searchParams.getAll('rarity');
    if (rarities.length > 0) urlFilters.rarities = rarities;
    
    const types = searchParams.getAll('type');
    if (types.length > 0) urlFilters.types = types;
    
    const collectionFilter = searchParams.get('collection');
    if (collectionFilter) urlFilters.collectionFilter = collectionFilter as any;
    
    const inkable = searchParams.get('inkable');
    if (inkable === 'true') urlFilters.inkwellOnly = true;
    if (inkable === 'false') urlFilters.inkwellOnly = false;
    
    const minCost = searchParams.get('minCost');
    if (minCost) urlFilters.costMin = parseInt(minCost);
    
    const maxCost = searchParams.get('maxCost');
    if (maxCost) urlFilters.costMax = parseInt(maxCost);
    
    return urlFilters;
  });
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

  // Functions to update state and URL params
  const setSearchTerm = (term: string) => {
    setSearchTermState(term);
    updateURLParams({ search: term || undefined });
  };

  const setSortBy = (sort: SortOption) => {
    setSortByState(sort);
    updateURLParams({ 
      sortField: sort.field, 
      sortDirection: sort.direction 
    });
  };

  const setGroupBy = (group: string) => {
    setGroupByState(group);
    updateURLParams({ groupBy: group === 'none' ? undefined : group });
  };

  const setFilters = (newFilters: FilterOptions) => {
    setFiltersState(newFilters);
    const defaultFilters = getDefaultFilters();
    
    const params: Record<string, string | string[] | undefined> = {
      set: newFilters.sets.length > 0 && JSON.stringify(newFilters.sets) !== JSON.stringify(defaultFilters.sets) ? newFilters.sets : undefined,
      color: newFilters.colors.length > 0 && JSON.stringify(newFilters.colors) !== JSON.stringify(defaultFilters.colors) ? newFilters.colors : undefined,
      rarity: newFilters.rarities.length > 0 && JSON.stringify(newFilters.rarities) !== JSON.stringify(defaultFilters.rarities) ? newFilters.rarities : undefined,
      type: newFilters.types.length > 0 && JSON.stringify(newFilters.types) !== JSON.stringify(defaultFilters.types) ? newFilters.types : undefined,
      collection: newFilters.collectionFilter !== defaultFilters.collectionFilter ? newFilters.collectionFilter : undefined,
      inkable: newFilters.inkwellOnly !== defaultFilters.inkwellOnly ? String(newFilters.inkwellOnly) : undefined,
      minCost: newFilters.costMin !== defaultFilters.costMin ? String(newFilters.costMin) : undefined,
      maxCost: newFilters.costMax !== defaultFilters.costMax ? String(newFilters.costMax) : undefined,
    };
    
    updateURLParams(params);
  };

  const updateURLParams = (params: Record<string, string | string[] | undefined>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(params).forEach(([key, value]) => {
        // Remove existing parameters with this key
        newParams.delete(key);
        
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => newParams.append(key, v));
          } else {
            newParams.set(key, value);
          }
        }
      });
      
      return newParams;
    });
  };

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