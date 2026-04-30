import { Deck, DeckFilterOptions, DeckSortMode, DeckSummary, LorcanaCard } from '../types';
import { getDeckColors, getDeckFranchiseBreakdown, isDeckFormatLegal } from './deckAnalysis';

export const DEFAULT_DECK_FILTERS: DeckFilterOptions = {
  colors: [],
  tags: [],
  format: 'any',
  franchiseFilters: [],
};

export function filterDecks(
  decks: Deck[],
  searchTerm: string,
  filters: DeckFilterOptions,
  allCards: LorcanaCard[]
): Deck[] {
  let result = decks;

  // Text search
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    result = result.filter(deck => {
      if (deck.name.toLowerCase().includes(term)) return true;
      if (deck.description?.toLowerCase().includes(term)) return true;
      if (deck.tags?.some(tag => tag.includes(term))) return true;
      return false;
    });
  }

  // Color filter
  if (filters.colors.length > 0) {
    result = result.filter(deck => {
      const deckColors = getDeckColors(deck, allCards);
      return filters.colors.some(c => deckColors.includes(c));
    });
  }

  // Tag filter
  if (filters.tags.length > 0) {
    result = result.filter(deck =>
      deck.tags?.some(tag => filters.tags.includes(tag))
    );
  }

  // Format filter
  if (filters.format !== 'any') {
    result = result.filter(deck => isDeckFormatLegal(deck, allCards, filters.format));
  }

  // Franchise percentage filters
  for (const ff of filters.franchiseFilters) {
    if (!ff.story || ff.minPercent <= 0) continue;
    result = result.filter(deck => {
      const breakdown = getDeckFranchiseBreakdown(deck, allCards);
      return (breakdown[ff.story] || 0) >= ff.minPercent;
    });
  }

  return result;
}

export function sortDecks(
  decks: Deck[],
  sortBy: DeckSortMode,
  sortTagCategory: string,
  getDeckSummary: (deckId: string) => DeckSummary | null
): Deck[] {
  const sorted = [...decks];
  switch (sortBy) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'updated':
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'tag': {
      if (!sortTagCategory) break;
      const prefix = sortTagCategory + ':';
      sorted.sort((a, b) => {
        const tagA = a.tags?.find(t => t.startsWith(prefix));
        const tagB = b.tags?.find(t => t.startsWith(prefix));
        const valA = tagA ? tagA.slice(prefix.length) : '';
        const valB = tagB ? tagB.slice(prefix.length) : '';
        if (valA && !valB) return -1;
        if (!valA && valB) return 1;
        if (valA !== valB) return valA.localeCompare(valB);
        return a.name.localeCompare(b.name);
      });
      break;
    }
  }
  return sorted;
}

export function countActiveDeckFilters(filters: DeckFilterOptions): number {
  let count = 0;
  if (filters.colors.length > 0) count++;
  if (filters.tags.length > 0) count++;
  if (filters.format !== 'any') count++;
  count += filters.franchiseFilters.filter(ff => ff.story && ff.minPercent > 0).length;
  return count;
}
