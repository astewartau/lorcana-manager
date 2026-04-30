import { Deck, LorcanaCard } from '../types';
import { CORE_CONSTRUCTED_LEGAL_SETS } from './cardFiltering';

export function getDeckColors(deck: Deck, allCards: LorcanaCard[]): string[] {
  const colors = new Set<string>();
  for (const entry of deck.cards) {
    const card = allCards.find(c => c.id === entry.cardId);
    if (!card || !card.color) continue;
    const parts = card.color.includes('-') ? card.color.split('-') : [card.color];
    parts.forEach(c => colors.add(c));
  }
  return Array.from(colors).sort();
}

export function getDeckFranchiseBreakdown(deck: Deck, allCards: LorcanaCard[]): Record<string, number> {
  const storyCounts: Record<string, number> = {};
  let totalCards = 0;

  for (const entry of deck.cards) {
    const card = allCards.find(c => c.id === entry.cardId);
    if (!card) continue;
    const story = card.story || 'No Story';
    storyCounts[story] = (storyCounts[story] || 0) + entry.quantity;
    totalCards += entry.quantity;
  }

  if (totalCards === 0) return {};

  const breakdown: Record<string, number> = {};
  for (const [story, count] of Object.entries(storyCounts)) {
    breakdown[story] = (count / totalCards) * 100;
  }
  return breakdown;
}

export function isDeckFormatLegal(deck: Deck, allCards: LorcanaCard[], format: 'any' | 'core' | 'infinity'): boolean {
  if (format === 'any' || format === 'infinity') return true;
  return deck.cards.every(entry => {
    const card = allCards.find(c => c.id === entry.cardId);
    if (!card) return false;
    return CORE_CONSTRUCTED_LEGAL_SETS.includes(card.setCode);
  });
}

export function getAvailableDeckStories(decks: Deck[], allCards: LorcanaCard[]): string[] {
  const stories = new Set<string>();
  for (const deck of decks) {
    for (const entry of deck.cards) {
      const card = allCards.find(c => c.id === entry.cardId);
      if (card?.story) stories.add(card.story);
    }
  }
  return Array.from(stories).sort();
}
