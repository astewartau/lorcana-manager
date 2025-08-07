import { LorcanaCard, ConsolidatedCard } from '../types';

export const consolidateCards = (cards: LorcanaCard[]): ConsolidatedCard[] => {
  // Group cards by fullName
  const groupedCards = new Map<string, LorcanaCard[]>();
  
  cards.forEach(card => {
    const key = card.fullName;
    if (!groupedCards.has(key)) {
      groupedCards.set(key, []);
    }
    groupedCards.get(key)!.push(card);
  });

  // Process each group into a consolidated card
  const consolidatedCards: ConsolidatedCard[] = [];

  groupedCards.forEach((cardGroup, fullName) => {
    // Find the base card (regular version, lowest rarity, non-enchanted)
    const baseCard = findBaseCard(cardGroup);
    
    // Find all variants
    const regularCard = findRegularCard(cardGroup);
    const foilCard = findFoilCard(cardGroup);
    const enchantedCard = findEnchantedCard(cardGroup);
    const specialCards = findSpecialCards(cardGroup);

    const consolidatedCard: ConsolidatedCard = {
      baseCard,
      fullName,
      hasRegular: regularCard !== null,
      hasFoil: foilCard !== null,
      hasEnchanted: enchantedCard !== null,
      hasSpecial: specialCards !== null && specialCards.length > 0,
      regularCard: regularCard || undefined,
      foilCard: foilCard || undefined,
      enchantedCard: enchantedCard || undefined,
      specialCards: specialCards || undefined
    };

    consolidatedCards.push(consolidatedCard);
  });

  return consolidatedCards;
};

const findBaseCard = (cards: LorcanaCard[]): LorcanaCard => {
  // Priority: Regular (non-enchanted, non-special) cards first, then lowest rarity
  const regularCards = cards.filter(card => 
    card.rarity !== 'Enchanted' && card.rarity !== 'Special'
  );
  
  if (regularCards.length > 0) {
    // Return the first regular card (they should all be the same for display purposes)
    return regularCards[0];
  }
  
  // Fallback to any card if no regular version exists
  return cards[0];
};

const findRegularCard = (cards: LorcanaCard[]): LorcanaCard | null => {
  // Find regular non-foil version
  return cards.find(card => 
    card.rarity !== 'Enchanted' && 
    card.rarity !== 'Special' &&
    (card.foilTypes?.includes('None') || !card.foilTypes)
  ) || null;
};

const findFoilCard = (cards: LorcanaCard[]): LorcanaCard | null => {
  // Find regular foil version (same card but foil)
  return cards.find(card => 
    card.rarity !== 'Enchanted' && 
    card.rarity !== 'Special' &&
    card.foilTypes?.includes('Cold')
  ) || null;
};

const findEnchantedCard = (cards: LorcanaCard[]): LorcanaCard | null => {
  return cards.find(card => card.rarity === 'Enchanted') || null;
};

const findSpecialCards = (cards: LorcanaCard[]): LorcanaCard[] | null => {
  const specialCards = cards.filter(card => card.rarity === 'Special');
  return specialCards.length > 0 ? specialCards : null;
};

// Helper function to get all available rarities for a consolidated card
export const getAvailableRarities = (consolidatedCard: ConsolidatedCard): string[] => {
  const rarities: string[] = [];
  
  if (consolidatedCard.regularCard) {
    rarities.push(consolidatedCard.regularCard.rarity);
  }
  
  if (consolidatedCard.enchantedCard) {
    rarities.push('Enchanted');
  }
  
  if (consolidatedCard.specialCards) {
    rarities.push('Special');
  }
  
  return Array.from(new Set(rarities)); // Remove duplicates
};

// Helper function to check if a consolidated card matches filter criteria
export const consolidatedCardMatchesFilters = (
  consolidatedCard: ConsolidatedCard,
  filters: any
): boolean => {
  const { hasEnchanted, hasSpecial } = consolidatedCard;
  
  // Check hasEnchanted filter
  if (filters.hasEnchanted !== null && filters.hasEnchanted !== hasEnchanted) {
    return false;
  }
  
  // Check hasSpecial filter
  if (filters.hasSpecial !== null && filters.hasSpecial !== hasSpecial) {
    return false;
  }
  
  // Check rarity filters - card matches if ANY of its variants match the selected rarities
  if (filters.rarities && filters.rarities.length > 0) {
    const availableRarities = getAvailableRarities(consolidatedCard);
    const hasMatchingRarity = availableRarities.some(rarity => 
      filters.rarities.includes(rarity)
    );
    if (!hasMatchingRarity) {
      return false;
    }
  }
  
  // All other filters use the base card properties
  return true;
};