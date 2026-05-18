import { useState, useMemo, useEffect, useCallback } from 'react';
import { DeckFilterOptions, DeckSortMode, DeckViewMode } from '../types';
import { useDeck } from '../contexts/DeckContext';
import { useCardData } from '../contexts/CardDataContext';
import { useDebounce } from './useDebounce';
import { useInfiniteScroll } from './useInfiniteScroll';
import { filterDecks, sortDecks, countActiveDeckFilters, DEFAULT_DECK_FILTERS } from '../utils/deckFiltering';
import { getAvailableDeckStories } from '../utils/deckAnalysis';

const SORT_STORAGE_KEY = 'lorebook-deck-sort';
const VIEW_MODE_STORAGE_KEY = 'lorebook-deck-view-mode';

function loadSortPreference(): { sortBy: DeckSortMode; sortTagCategory: string } {
  try {
    const stored = localStorage.getItem(SORT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.sortBy) return parsed;
    }
  } catch { /* ignore */ }
  return { sortBy: 'newest', sortTagCategory: '' };
}

function loadViewMode(): DeckViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === 'grid' || stored === 'table') return stored;
  } catch { /* ignore */ }
  return 'grid';
}

export function useDeckBrowser(activeTab: 'my' | 'public') {
  const { decks, publicDecks, getDeckSummary, allUserTags, loadMorePublicDecks, hasMorePublicDecks, publicDecksLoading } = useDeck();
  const { allCards } = useCardData();

  const savedSort = useMemo(() => loadSortPreference(), []);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [filters, setFilters] = useState<DeckFilterOptions>(DEFAULT_DECK_FILTERS);
  const [sortBy, setSortBy] = useState<DeckSortMode>(savedSort.sortBy);
  const [sortTagCategory, setSortTagCategory] = useState(savedSort.sortTagCategory);
  const [viewMode, setViewMode] = useState<DeckViewMode>(loadViewMode);
  const [showFilters, setShowFilters] = useState(false);

  // Persist sort preference
  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify({ sortBy, sortTagCategory }));
  }, [sortBy, sortTagCategory]);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  // Clear search when switching tabs
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  const activeDeckList = activeTab === 'my' ? decks : publicDecks;

  const filteredDecks = useMemo(() => {
    const filtered = filterDecks(activeDeckList, debouncedSearchTerm, filters, allCards);
    return sortDecks(filtered, sortBy, sortTagCategory, getDeckSummary);
  }, [activeDeckList, debouncedSearchTerm, filters, allCards, sortBy, sortTagCategory, getDeckSummary]);

  const activeFiltersCount = useMemo(() => countActiveDeckFilters(filters), [filters]);

  const { visibleCount, sentinelRef, hasMore: hasMoreLocal, reset: resetScroll } = useInfiniteScroll({
    totalItems: filteredDecks.length,
  });

  // Reset scroll when filters/search/sort change
  useEffect(() => {
    resetScroll();
  }, [debouncedSearchTerm, filters, sortBy, sortTagCategory, resetScroll]);

  // Load more public decks from server when local items are exhausted
  useEffect(() => {
    if (activeTab === 'public' && !hasMoreLocal && hasMorePublicDecks && !publicDecksLoading) {
      loadMorePublicDecks();
    }
  }, [activeTab, hasMoreLocal, hasMorePublicDecks, publicDecksLoading, loadMorePublicDecks]);

  const hasMore = activeTab === 'public' ? (hasMoreLocal || hasMorePublicDecks) : hasMoreLocal;

  const visibleDecks = useMemo(
    () => filteredDecks.slice(0, visibleCount),
    [filteredDecks, visibleCount]
  );

  const availableStories = useMemo(
    () => getAvailableDeckStories(activeDeckList, allCards),
    [activeDeckList, allCards]
  );

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_DECK_FILTERS);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortTagCategory,
    setSortTagCategory,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    filteredDecks,
    visibleDecks,
    activeFiltersCount,
    sentinelRef,
    hasMore,
    availableStories,
    allUserTags,
    clearAllFilters,
  };
}
