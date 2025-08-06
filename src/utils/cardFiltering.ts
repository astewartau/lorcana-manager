import { ConsolidatedCard, FilterOptions, SortOption } from '../types';
import { rarityOrder, sets, costRange, strengthRange, willpowerRange, loreRange } from '../data/allCards';
import { consolidatedCardMatchesFilters } from './cardConsolidation';

// Filter cards based on search term and filters
export const filterCards = (
  cards: ConsolidatedCard[],
  searchTerm: string,
  filters: FilterOptions,
  staleCardIds: Set<number>,
  getVariantQuantities: (fullName: string) => { regular: number; foil: number; enchanted: number; special: number },
  getCardQuantity: (cardId: number) => number
): ConsolidatedCard[] => {
  return cards.filter(consolidatedCard => {
    const { baseCard } = consolidatedCard;
    
    // If this card is in our stale cards set, always include it
    if (staleCardIds.has(baseCard.id)) {
      console.log('Including stale card:', baseCard.name);
      return true;
    }
    
    const matchesSearch = baseCard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (baseCard.version?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         (baseCard.story?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesSet = filters.sets.length === 0 || filters.sets.includes(baseCard.setCode);
    const matchesColor = filters.colors.length === 0 || filters.colors.includes(baseCard.color);
    const matchesType = filters.types.length === 0 || filters.types.includes(baseCard.type);
    const matchesStory = filters.stories.length === 0 || (baseCard.story && filters.stories.includes(baseCard.story));
    const matchesSubtype = filters.subtypes.length === 0 || (baseCard.subtypes && baseCard.subtypes.some(st => filters.subtypes.includes(st)));
    
    const matchesCostList = filters.costs.length === 0 || filters.costs.includes(baseCard.cost);
    const matchesCostRange = baseCard.cost >= filters.costMin && baseCard.cost <= filters.costMax;
    
    const matchesStrength = baseCard.strength === undefined || (baseCard.strength >= filters.strengthMin && baseCard.strength <= filters.strengthMax);
    const matchesWillpower = baseCard.willpower === undefined || (baseCard.willpower >= filters.willpowerMin && baseCard.willpower <= filters.willpowerMax);
    const matchesLore = baseCard.lore === undefined || (baseCard.lore >= filters.loreMin && baseCard.lore <= filters.loreMax);
    
    const matchesInkwell = filters.inkwellOnly === null || baseCard.inkwell === filters.inkwellOnly;
    
    // Check if card is in collection
    const matchesInCollection = filters.inMyCollection === null || (() => {
      const quantities = getVariantQuantities(consolidatedCard.fullName);
      const totalOwned = quantities.regular + quantities.foil + quantities.enchanted + quantities.special;
      const legacyQuantity = getCardQuantity(baseCard.id);
      const isInCollection = totalOwned > 0 || legacyQuantity > 0;
      return filters.inMyCollection ? isInCollection : !isInCollection;
    })();
    
    // Check card count filter
    const matchesCardCount = filters.cardCountOperator === null || (() => {
      const quantities = getVariantQuantities(consolidatedCard.fullName);
      const totalOwned = quantities.regular + quantities.foil + quantities.enchanted + quantities.special;
      const legacyQuantity = getCardQuantity(baseCard.id);
      const totalCount = totalOwned + legacyQuantity;
      
      switch (filters.cardCountOperator) {
        case 'eq': return totalCount === filters.cardCountValue;
        case 'gte': return totalCount >= filters.cardCountValue;
        case 'lte': return totalCount <= filters.cardCountValue;
        default: return true;
      }
    })();
    
    // Check consolidated card specific filters
    const matchesConsolidatedFilters = consolidatedCardMatchesFilters(consolidatedCard, filters);

    return matchesSearch && matchesSet && matchesColor && matchesType && 
           matchesStory && matchesSubtype && matchesCostList && matchesCostRange &&
           matchesStrength && matchesWillpower && matchesLore && matchesInkwell &&
           matchesInCollection && matchesCardCount && matchesConsolidatedFilters;
  });
};

// Sort cards based on sort criteria
export const sortCards = (cards: ConsolidatedCard[], sortBy: SortOption): ConsolidatedCard[] => {
  return cards.sort((a, b) => {
    let aValue: any, bValue: any;
    const aCard = a.baseCard;
    const bCard = b.baseCard;

    switch (sortBy.field) {
      case 'name':
        aValue = aCard.name;
        bValue = bCard.name;
        break;
      case 'cost':
        aValue = aCard.cost;
        bValue = bCard.cost;
        break;
      case 'rarity':
        aValue = rarityOrder.indexOf(aCard.rarity);
        bValue = rarityOrder.indexOf(bCard.rarity);
        break;
      case 'set':
        aValue = aCard.setCode;
        bValue = bCard.setCode;
        break;
      case 'number':
        aValue = aCard.number;
        bValue = bCard.number;
        break;
      case 'color':
        aValue = aCard.color;
        bValue = bCard.color;
        break;
      case 'type':
        aValue = aCard.type;
        bValue = bCard.type;
        break;
      case 'story':
        aValue = aCard.story || '';
        bValue = bCard.story || '';
        break;
      case 'strength':
        aValue = aCard.strength || 0;
        bValue = bCard.strength || 0;
        break;
      case 'willpower':
        aValue = aCard.willpower || 0;
        bValue = bCard.willpower || 0;
        break;
      case 'lore':
        aValue = aCard.lore || 0;
        bValue = bCard.lore || 0;
        break;
      default:
        aValue = aCard.name;
        bValue = bCard.name;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortBy.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

// Group cards by specified field
export const groupCards = (
  cards: ConsolidatedCard[], 
  groupBy: string
): Record<string, ConsolidatedCard[]> => {
  if (groupBy === 'none') return {};
  
  const groupedCards: Record<string, ConsolidatedCard[]> = {};
  
  cards.forEach(card => {
    let groupKey = '';
    const baseCard = card.baseCard;
    
    switch (groupBy) {
      case 'set':
        const setInfo = sets.find(s => s.code === baseCard.setCode);
        groupKey = setInfo?.name || baseCard.setCode;
        break;
      case 'color':
        groupKey = baseCard.color || 'No Ink Color';
        break;
      case 'rarity':
        groupKey = baseCard.rarity;
        break;
      case 'type':
        groupKey = baseCard.type;
        break;
      case 'story':
        groupKey = baseCard.story || 'No Story';
        break;
      case 'cost':
        groupKey = `Cost ${baseCard.cost}`;
        break;
      default:
        groupKey = 'Unknown';
    }
    
    if (!groupedCards[groupKey]) {
      groupedCards[groupKey] = [];
    }
    groupedCards[groupKey].push(card);
  });
  
  return groupedCards;
};

// Count active filters
export const countActiveFilters = (filters: FilterOptions): number => {
  return (
    filters.sets.length +
    filters.colors.length +
    filters.rarities.length +
    filters.types.length +
    filters.stories.length +
    filters.subtypes.length +
    filters.costs.length +
    (filters.costMin !== costRange.min || filters.costMax !== costRange.max ? 1 : 0) +
    (filters.strengthMin !== strengthRange.min || filters.strengthMax !== strengthRange.max ? 1 : 0) +
    (filters.willpowerMin !== willpowerRange.min || filters.willpowerMax !== willpowerRange.max ? 1 : 0) +
    (filters.loreMin !== loreRange.min || filters.loreMax !== loreRange.max ? 1 : 0) +
    (filters.inkwellOnly !== null ? 1 : 0) +
    (filters.hasEnchanted !== null ? 1 : 0) +
    (filters.hasSpecial !== null ? 1 : 0) +
    (filters.inMyCollection !== null ? 1 : 0) +
    (filters.cardCountOperator !== null ? 1 : 0)
  );
};