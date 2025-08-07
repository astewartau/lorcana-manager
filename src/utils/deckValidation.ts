import { Deck } from '../types';

export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateDeck = (deck: Deck): DeckValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  
  // Rule 1: Deck must have exactly 60 cards
  if (totalCards !== 60) {
    if (totalCards < 60) {
      errors.push(`Deck needs ${60 - totalCards} more cards (currently ${totalCards}/60)`);
    } else {
      errors.push(`Deck has ${totalCards - 60} too many cards (currently ${totalCards}/60)`);
    }
  }
  
  // Rule 2: No more than 4 copies of any card
  const overLimitCards = deck.cards.filter(card => card.quantity > 4);
  if (overLimitCards.length > 0) {
    overLimitCards.forEach(card => {
      errors.push(`"${card.name}" exceeds 4-copy limit (${card.quantity} copies)`);
    });
  }
  
  // Rule 3: Cards with quantity <= 0 (shouldn't happen but safety check)
  const invalidQuantityCards = deck.cards.filter(card => card.quantity <= 0);
  if (invalidQuantityCards.length > 0) {
    errors.push(`Deck contains cards with invalid quantities`);
  }
  
  // Rule 4: Check ink color restrictions (max 2 colors in competitive play)
  const allColors = deck.cards.map(card => card.color).filter(color => color !== '');
  const baseColors = new Set<string>();
  
  // Extract base colors from both single and dual-ink cards
  allColors.forEach(color => {
    if (color.includes('-')) {
      // Dual-ink card: split and add both colors
      const [color1, color2] = color.split('-');
      baseColors.add(color1);
      baseColors.add(color2);
    } else {
      // Single-ink card
      baseColors.add(color);
    }
  });
  
  // Check if deck has more than 2 base colors
  if (baseColors.size > 2) {
    errors.push(`Deck has more than 2 ink colors (${baseColors.size} colors: ${Array.from(baseColors).join(', ')})`);
  }
  
  // Validate dual-ink cards only use the deck's base colors
  const baseColorArray = Array.from(baseColors);
  const invalidDualInks = allColors.filter(color => {
    if (!color.includes('-')) return false; // Skip single-ink cards
    const [color1, color2] = color.split('-');
    return !baseColorArray.includes(color1) || !baseColorArray.includes(color2);
  });
  
  if (invalidDualInks.length > 0) {
    errors.push(`Deck contains dual-ink cards with colors not in the deck's base colors`);
  }
  
  // Rule 5: Check for sufficient inkwell cards (recommended: at least 12-15)
  const inkwellCards = deck.cards.filter(card => card.inkwell);
  const inkwellCount = inkwellCards.reduce((sum, card) => sum + card.quantity, 0);
  if (inkwellCount < 12) {
    warnings.push(`Only ${inkwellCount} inkwell cards. Consider adding more (recommended: 12-15).`);
  } else if (inkwellCount > 20) {
    warnings.push(`${inkwellCount} inkwell cards might be too many. Consider reducing (recommended: 12-15).`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const getDeckStatistics = (deck: Deck) => {
  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);
  
  // Cost distribution
  const costDistribution: Record<number, number> = {};
  deck.cards.forEach(card => {
    costDistribution[card.cost] = (costDistribution[card.cost] || 0) + card.quantity;
  });
  
  // Ink color distribution
  const inkDistribution: Record<string, number> = {};
  deck.cards.forEach(card => {
    const color = card.color || 'None';
    inkDistribution[color] = (inkDistribution[color] || 0) + card.quantity;
  });
  
  // Type distribution
  const typeDistribution: Record<string, number> = {};
  deck.cards.forEach(card => {
    typeDistribution[card.type] = (typeDistribution[card.type] || 0) + card.quantity;
  });
  
  // Rarity distribution
  const rarityDistribution: Record<string, number> = {};
  deck.cards.forEach(card => {
    rarityDistribution[card.rarity] = (rarityDistribution[card.rarity] || 0) + card.quantity;
  });
  
  // Average cost
  const averageCost = totalCards > 0 
    ? deck.cards.reduce((sum, card) => sum + (card.cost * card.quantity), 0) / totalCards
    : 0;
  
  // Inkwell count
  const inkwellCount = deck.cards
    .filter(card => card.inkwell)
    .reduce((sum, card) => sum + card.quantity, 0);
  
  // Cost curve (0-7+ costs)
  const costCurve = Array.from({ length: 8 }, (_, i) => ({
    cost: i === 7 ? '7+' : i.toString(),
    count: i === 7 
      ? Object.entries(costDistribution)
          .filter(([cost]) => parseInt(cost) >= 7)
          .reduce((sum, [, count]) => sum + count, 0)
      : costDistribution[i] || 0
  }));
  
  return {
    totalCards,
    costDistribution,
    inkDistribution,
    typeDistribution,
    rarityDistribution,
    averageCost: Math.round(averageCost * 10) / 10, // Round to 1 decimal
    inkwellCount,
    inkwellPercentage: totalCards > 0 ? Math.round((inkwellCount / totalCards) * 100) : 0,
    costCurve,
    uniqueCards: deck.cards.length
  };
};

export const compareDeckVersions = (oldDeck: Deck, newDeck: Deck) => {
  const changes: Array<{
    type: 'added' | 'removed' | 'modified';
    cardName: string;
    oldQuantity?: number;
    newQuantity?: number;
  }> = [];
  
  const oldCardMap = new Map(oldDeck.cards.map(card => [card.id, card]));
  const newCardMap = new Map(newDeck.cards.map(card => [card.id, card]));
  
  // Check for added and modified cards
  newDeck.cards.forEach(newCard => {
    const oldCard = oldCardMap.get(newCard.id);
    if (!oldCard) {
      changes.push({
        type: 'added',
        cardName: newCard.name,
        newQuantity: newCard.quantity
      });
    } else if (oldCard.quantity !== newCard.quantity) {
      changes.push({
        type: 'modified',
        cardName: newCard.name,
        oldQuantity: oldCard.quantity,
        newQuantity: newCard.quantity
      });
    }
  });
  
  // Check for removed cards
  oldDeck.cards.forEach(oldCard => {
    if (!newCardMap.has(oldCard.id)) {
      changes.push({
        type: 'removed',
        cardName: oldCard.name,
        oldQuantity: oldCard.quantity
      });
    }
  });
  
  return changes;
};

export const generateDeckHash = (deck: Deck): string => {
  // Create a consistent hash of the deck for comparison
  const sortedCards = [...deck.cards]
    .sort((a, b) => a.id - b.id)
    .map(card => `${card.id}:${card.quantity}`)
    .join(',');
  
  // Simple hash function (not cryptographic, just for comparison)
  let hash = 0;
  for (let i = 0; i < sortedCards.length; i++) {
    const char = sortedCards.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
};

export const isLegalFormat = (deck: Deck, format: 'standard' | 'unlimited' = 'standard'): boolean => {
  // For now, we'll just implement basic validation
  // In the future, this could check against banned/restricted lists for different formats
  
  const validation = validateDeck(deck);
  if (!validation.isValid) return false;
  
  if (format === 'standard') {
    // Add standard format specific rules here
    // For example, checking set legality, banned cards, etc.
  }
  
  return true;
};