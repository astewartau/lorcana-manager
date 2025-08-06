import React, { useState, useMemo } from 'react';
import { Search, Grid, List, ChevronLeft, ChevronRight, Filter, RotateCcw, ChevronDown, ChevronUp, X, Plus, Minus } from 'lucide-react';
import { FilterOptions, SortOption, ConsolidatedCard } from '../types';
import { consolidatedCards, rarityOrder, rarities, colors, cardTypes, stories, subtypes, costs, sets, costRange, strengthRange, willpowerRange, loreRange } from '../data/allCards';
import { useCollection } from '../contexts/CollectionContext';
import { consolidatedCardMatchesFilters } from '../utils/cardConsolidation';
import ConsolidatedCardComponent from './ConsolidatedCard';
import MultiSelectFilter from './MultiSelectFilter';
import RangeFilter from './RangeFilter';

interface CollectionFilterProps {
  inMyCollection: boolean | null;
  cardCountOperator: 'eq' | 'gte' | 'lte' | null;
  cardCountValue: number;
  onChange: (inMyCollection: boolean | null, cardCountOperator: 'eq' | 'gte' | 'lte' | null, cardCountValue: number) => void;
  defaultCollapsed?: boolean;
}

const CollectionFilter: React.FC<CollectionFilterProps> = ({
  inMyCollection,
  cardCountOperator,
  cardCountValue,
  onChange,
  defaultCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const hasFilter = inMyCollection !== null || cardCountOperator !== null;

  const handleClear = () => {
    onChange(null, null, 1);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Collection</h3>
          {hasFilter && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasFilter && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear filter"
            >
              <X size={16} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-3">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="collection"
                  checked={inMyCollection === null}
                  onChange={() => onChange(null, cardCountOperator, cardCountValue)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">All Cards</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="collection"
                  checked={inMyCollection === true}
                  onChange={() => onChange(true, cardCountOperator, cardCountValue)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">In My Collection</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="collection"
                  checked={inMyCollection === false}
                  onChange={() => onChange(false, cardCountOperator, cardCountValue)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Not In My Collection</span>
              </label>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Card Count</h4>
              <div className="flex items-center space-x-2">
                <select
                  value={cardCountOperator || ''}
                  onChange={(e) => onChange(
                    inMyCollection,
                    e.target.value === '' ? null : e.target.value as 'eq' | 'gte' | 'lte',
                    cardCountValue
                  )}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="eq">Exactly</option>
                  <option value="gte">At least</option>
                  <option value="lte">At most</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={cardCountValue}
                  onChange={(e) => onChange(inMyCollection, cardCountOperator, parseInt(e.target.value) || 0)}
                  disabled={cardCountOperator === null}
                  className="w-16 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                />
                <span className="text-xs text-gray-600">copies</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface InkwellFilterProps {
  inkwellOnly: boolean | null;
  onChange: (inkwellOnly: boolean | null) => void;
  defaultCollapsed?: boolean;
}

const InkwellFilter: React.FC<InkwellFilterProps> = ({
  inkwellOnly,
  onChange,
  defaultCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const hasFilter = inkwellOnly !== null;

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Inkwell</h3>
          {hasFilter && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {inkwellOnly ? 'Inkable' : 'Non-Inkable'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasFilter && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear filter"
            >
              <X size={16} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-3">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === null}
                onChange={() => onChange(null)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">All Cards</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === true}
                onChange={() => onChange(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Inkable Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === false}
                onChange={() => onChange(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Non-Inkable Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

interface SpecialVariantsFilterProps {
  hasEnchanted: boolean | null;
  hasSpecial: boolean | null;
  onChange: (hasEnchanted: boolean | null, hasSpecial: boolean | null) => void;
  defaultCollapsed?: boolean;
}

const SpecialVariantsFilter: React.FC<SpecialVariantsFilterProps> = ({
  hasEnchanted,
  hasSpecial,
  onChange,
  defaultCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const hasFilter = hasEnchanted !== null || hasSpecial !== null;

  const handleClear = () => {
    onChange(null, null);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Special Variants</h3>
          {hasFilter && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {[hasEnchanted && 'E', hasSpecial && 'S'].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasFilter && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear filter"
            >
              <X size={16} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-3">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasEnchanted === true}
                onChange={(e) => onChange(e.target.checked ? true : null, hasSpecial)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Has Enchanted Version</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSpecial === true}
                onChange={(e) => onChange(hasEnchanted, e.target.checked ? true : null)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Has Special Version</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

const CardBrowser: React.FC = () => {
  const { getVariantQuantities, getCardQuantity, addVariantToCollection, removeVariantFromCollection } = useCollection();
  
  // Icon mapping for rarities
  const rarityIconMap: Record<string, string> = {
    'Common': '/imgs/common.svg',
    'Uncommon': '/imgs/uncommon.svg',
    'Rare': '/imgs/rare.svg',
    'Super Rare': '/imgs/super_rare.svg',
    'Legendary': '/imgs/legendary.svg',
    'Enchanted': '/imgs/enchanted.png',
    'Special': '/imgs/promo.webp'
  };
  
  // Icon mapping for ink colors
  const colorIconMap: Record<string, string> = {
    'Amber': '/imgs/amber.svg',
    'Amethyst': '/imgs/amethyst.svg',
    'Emerald': '/imgs/emerald.svg',
    'Ruby': '/imgs/ruby.svg',
    'Sapphire': '/imgs/sapphire.svg',
    'Steel': '/imgs/steel.svg'
  };
  
  // Get background gradient based on ink color(s)
  const getInkColorBackground = (color: string): { className: string; style?: React.CSSProperties } => {
    // Official Lorcana ink colors
    const officialColors: Record<string, string> = {
      'Amber': '#F5B202',
      'Amethyst': '#81377B',
      'Emerald': '#2A8934',
      'Ruby': '#D3082F',
      'Sapphire': '#0189C4',
      'Steel': '#9FA8B4'
    };
    
    // Check for dual colors (e.g., "Amber-Ruby")
    if (color.includes('-')) {
      const [color1, color2] = color.split('-');
      
      const color1Hex = officialColors[color1] || '#6b7280';
      const color2Hex = officialColors[color2] || '#6b7280';
      
      console.log(`Dual-ink gradient for ${color}: ${color1Hex} to ${color2Hex}`);
      
      return {
        className: '',
        style: {
          background: `linear-gradient(to right, ${color1Hex}, ${color2Hex})`
        }
      };
    }
    
    // Single colors - use inline styles with official colors
    if (officialColors[color]) {
      return {
        className: '',
        style: {
          background: officialColors[color]
        }
      };
    }
    
    // No ink color fallback
    return { 
      className: '',
      style: {
        background: '#f9fafb' // light gray for no ink color
      }
    };
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'name', direction: 'asc' });
  const [groupBy, setGroupBy] = useState<string>('none');
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 100;
  // Get default set codes for the desired sets
  const defaultSetCodes = sets
    .filter(s => ['Shimmering Skies', 'Azurite Sea', "Archazia's Island", 'The Reign of Jafar', 'Fabled'].includes(s.name))
    .map(s => s.code);
  
  // Get colors excluding empty string (manually filtering known colors)
  const nonEmptyColors = colors.filter(color => color);

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sets: defaultSetCodes,
    colors: nonEmptyColors,
    rarities: [],
    types: [],
    stories: [],
    subtypes: [],
    costs: [],
    costMin: costRange.min,
    costMax: costRange.max,
    strengthMin: strengthRange.min,
    strengthMax: strengthRange.max,
    willpowerMin: willpowerRange.min,
    willpowerMax: willpowerRange.max,
    loreMin: loreRange.min,
    loreMax: loreRange.max,
    inkwellOnly: null,
    hasEnchanted: null,
    hasSpecial: null,
    inMyCollection: null,
    cardCountOperator: null,
    cardCountValue: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { filteredAndSortedCards, groupedCards, totalPages, totalCards, activeFiltersCount } = useMemo(() => {
    let filtered = consolidatedCards.filter(consolidatedCard => {
      const { baseCard } = consolidatedCard;
      
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

    const sorted = filtered.sort((a, b) => {
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

    const totalCards = sorted.length;
    
    // Group cards if groupBy is not 'none'
    let groupedCards: { [key: string]: ConsolidatedCard[] } = {};
    if (groupBy !== 'none') {
      sorted.forEach(card => {
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
    }
    
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedCards = sorted.slice(startIndex, endIndex);

    // Count active filters
    const activeFiltersCount = (
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

    return {
      filteredAndSortedCards: paginatedCards,
      groupedCards,
      totalPages,
      totalCards,
      activeFiltersCount
    };
  }, [searchTerm, filters, sortBy, groupBy, currentPage, cardsPerPage, getVariantQuantities, getCardQuantity]);

  // Reset to page 1 when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy, groupBy]);

  const clearAllFilters = () => {
    setFilters({
      search: '',
      sets: defaultSetCodes,
      colors: nonEmptyColors,
      rarities: [],
      types: [],
      stories: [],
      subtypes: [],
      costs: [],
      costMin: costRange.min,
      costMax: costRange.max,
      strengthMin: strengthRange.min,
      strengthMax: strengthRange.max,
      willpowerMin: willpowerRange.min,
      willpowerMax: willpowerRange.max,
      loreMin: loreRange.min,
      loreMax: loreRange.max,
      inkwellOnly: null,
      hasEnchanted: null,
      hasSpecial: null,
      inMyCollection: null,
      cardCountOperator: null,
      cardCountValue: 1,
    });
    setSearchTerm('');
  };

  const handleVariantQuantityChange = (
    consolidatedCard: ConsolidatedCard, 
    variantType: 'regular' | 'foil' | 'enchanted' | 'special', 
    change: number
  ) => {
    if (change > 0) {
      addVariantToCollection(consolidatedCard, variantType, change);
    } else {
      removeVariantFromCollection(consolidatedCard.fullName, variantType, Math.abs(change));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search cards by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={`${sortBy.field}-${sortBy.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy({ field: field as any, direction: direction as 'asc' | 'desc' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="cost-asc">Cost Low-High</option>
              <option value="cost-desc">Cost High-Low</option>
              <option value="rarity-asc">Rarity Low-High</option>
              <option value="rarity-desc">Rarity High-Low</option>
              <option value="set-asc">Set (Oldest First)</option>
              <option value="set-desc">Set (Newest First)</option>
              <option value="color-asc">Color A-Z</option>
              <option value="color-desc">Color Z-A</option>
              <option value="type-asc">Type A-Z</option>
              <option value="type-desc">Type Z-A</option>
              <option value="story-asc">Story A-Z</option>
              <option value="story-desc">Story Z-A</option>
              <option value="strength-asc">Strength Low-High</option>
              <option value="strength-desc">Strength High-Low</option>
              <option value="willpower-asc">Willpower Low-High</option>
              <option value="willpower-desc">Willpower High-Low</option>
              <option value="lore-asc">Lore Low-High</option>
              <option value="lore-desc">Lore High-Low</option>
            </select>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">No Grouping</option>
              <option value="set">Group by Set</option>
              <option value="color">Group by Ink Color</option>
              <option value="rarity">Group by Rarity</option>
              <option value="type">Group by Type</option>
              <option value="story">Group by Story</option>
              <option value="cost">Group by Cost</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center space-x-2 ${
                activeFiltersCount > 0 ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <Filter size={20} />
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <div className="flex items-center space-x-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw size={14} />
                  <span>Clear All</span>
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <MultiSelectFilter
              title="Rarity"
              options={rarities}
              selectedValues={filters.rarities}
              onChange={(values) => setFilters({...filters, rarities: values as string[]})}
              defaultCollapsed={true}
              iconMap={rarityIconMap}
            />
            
            <MultiSelectFilter
              title="Ink Color"
              options={colors.map(color => color === '' ? 'None' : color)}
              selectedValues={filters.colors.map(color => color === '' ? 'None' : color)}
              onChange={(values) => {
                const actualColors = (values as string[]).map(value => value === 'None' ? '' : value);
                setFilters({...filters, colors: actualColors});
              }}
              defaultCollapsed={true}
              iconMap={colorIconMap}
            />
            
            <MultiSelectFilter
              title="Type"
              options={cardTypes}
              selectedValues={filters.types}
              onChange={(values) => setFilters({...filters, types: values as string[]})}
              defaultCollapsed={true}
            />
            
            <MultiSelectFilter
              title="Franchise"
              options={stories}
              selectedValues={filters.stories}
              onChange={(values) => setFilters({...filters, stories: values as string[]})}
              maxHeight="max-h-64"
              defaultCollapsed={true}
            />
            
            <MultiSelectFilter
              title="Set"
              options={sets.map(s => s.name)}
              selectedValues={filters.sets.map(setCode => sets.find(s => s.code === setCode)?.name || setCode)}
              onChange={(values) => {
                const setCodes = (values as string[]).map(name => sets.find(s => s.name === name)?.code || name);
                setFilters({...filters, sets: setCodes});
              }}
              defaultCollapsed={true}
            />
            
            <MultiSelectFilter
              title="Subtype"
              options={subtypes}
              selectedValues={filters.subtypes}
              onChange={(values) => setFilters({...filters, subtypes: values as string[]})}
              maxHeight="max-h-64"
              defaultCollapsed={true}
            />
            
            <MultiSelectFilter
              title="Ink Cost"
              options={costs}
              selectedValues={filters.costs}
              onChange={(values) => setFilters({...filters, costs: values as number[]})}
              defaultCollapsed={true}
            />

            <RangeFilter
              title="Cost Range"
              min={costRange.min}
              max={costRange.max}
              selectedMin={filters.costMin}
              selectedMax={filters.costMax}
              onChange={(min, max) => setFilters({...filters, costMin: min, costMax: max})}
              defaultCollapsed={true}
            />
            
            <RangeFilter
              title="Strength"
              min={strengthRange.min}
              max={strengthRange.max}
              selectedMin={filters.strengthMin}
              selectedMax={filters.strengthMax}
              onChange={(min, max) => setFilters({...filters, strengthMin: min, strengthMax: max})}
              defaultCollapsed={true}
            />

            <RangeFilter
              title="Willpower"
              min={willpowerRange.min}
              max={willpowerRange.max}
              selectedMin={filters.willpowerMin}
              selectedMax={filters.willpowerMax}
              onChange={(min, max) => setFilters({...filters, willpowerMin: min, willpowerMax: max})}
              defaultCollapsed={true}
            />
            
            <RangeFilter
              title="Lore"
              min={loreRange.min}
              max={loreRange.max}
              selectedMin={filters.loreMin}
              selectedMax={filters.loreMax}
              onChange={(min, max) => setFilters({...filters, loreMin: min, loreMax: max})}
              defaultCollapsed={true}
            />
            <CollectionFilter
              inMyCollection={filters.inMyCollection}
              cardCountOperator={filters.cardCountOperator}
              cardCountValue={filters.cardCountValue}
              onChange={(inMyCollection, cardCountOperator, cardCountValue) => 
                setFilters({...filters, inMyCollection, cardCountOperator, cardCountValue})
              }
              defaultCollapsed={true}
            />

            <InkwellFilter
              inkwellOnly={filters.inkwellOnly}
              onChange={(inkwellOnly) => setFilters({...filters, inkwellOnly})}
              defaultCollapsed={true}
            />

            <SpecialVariantsFilter
              hasEnchanted={filters.hasEnchanted}
              hasSpecial={filters.hasSpecial}
              onChange={(hasEnchanted, hasSpecial) => 
                setFilters({...filters, hasEnchanted, hasSpecial})
              }
              defaultCollapsed={true}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-600">
          {groupBy !== 'none' ? (
            `Showing ${totalCards} cards in ${Object.keys(groupedCards).length} groups`
          ) : (
            `Showing ${((currentPage - 1) * cardsPerPage) + 1}-${Math.min(currentPage * cardsPerPage, totalCards)} of ${totalCards} cards`
          )}
        </div>
        {groupBy === 'none' && totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {groupBy !== 'none' ? (
        // Grouped view
        <div className="space-y-6">
          {Object.entries(groupedCards).map(([groupName, cards]) => (
            <div key={groupName}>
              {/* Group Header */}
              <div className="flex items-center mb-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <h3 className="px-4 text-lg font-semibold text-gray-700 bg-white">{groupName}</h3>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
              
              {/* Cards in this group */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                  {cards.map((consolidatedCard) => {
                    const quantities = getVariantQuantities(consolidatedCard.fullName);
                    return (
                      <div key={consolidatedCard.baseCard.id} className="relative mb-3">
                        <ConsolidatedCardComponent
                          consolidatedCard={consolidatedCard}
                          quantities={quantities}
                          onQuantityChange={(variantType, change) => 
                            handleVariantQuantityChange(consolidatedCard, variantType, change)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-1 mb-8">
                  {cards.map((consolidatedCard) => {
                    const { baseCard, hasEnchanted, hasSpecial } = consolidatedCard;
                    const quantities = getVariantQuantities(consolidatedCard.fullName);
                    const totalOwned = quantities.regular + quantities.foil + quantities.enchanted + quantities.special;
                    const setInfo = sets.find(s => s.code === baseCard.setCode);
                    
                    // Ultra-compact quantity control
                    const renderMiniControl = (
                      variantType: 'regular' | 'foil' | 'enchanted' | 'special',
                      quantity: number,
                      isAvailable: boolean,
                      label: string
                    ) => {
                      if (!isAvailable) return null;
                      return (
                        <div className="flex items-center space-x-0.5 text-xs">
                          <span className="text-gray-500 font-medium">{label}:</span>
                          <button
                            onClick={() => handleVariantQuantityChange(consolidatedCard, variantType, -1)}
                            disabled={quantity <= 0}
                            className="px-1 hover:bg-black hover:bg-opacity-10 rounded disabled:opacity-50 text-gray-600"
                          >
                            -
                          </button>
                          <span className="min-w-[16px] text-center font-semibold">{quantity}</span>
                          <button
                            onClick={() => handleVariantQuantityChange(consolidatedCard, variantType, 1)}
                            className="px-1 hover:bg-black hover:bg-opacity-10 rounded text-gray-600"
                          >
                            +
                          </button>
                        </div>
                      );
                    };
                    
                    return (
                      <div 
                        key={baseCard.id} 
                        className="bg-white p-2 rounded hover:shadow-md transition-shadow flex items-center space-x-2 text-xs border border-gray-200"
                      >
                        {/* Card Number */}
                        <span className="font-mono text-gray-700 font-semibold w-12 text-center">#{baseCard.number}</span>
                        
                        {/* Rarity */}
                        {rarityIconMap[baseCard.rarity] && (
                          <img 
                            src={rarityIconMap[baseCard.rarity]} 
                            alt={baseCard.rarity}
                            className="w-3 h-3 flex-shrink-0"
                          />
                        )}
                        
                        {/* Ink Color Icon */}
                        {baseCard.color && (
                          <div className="flex-shrink-0 w-4 h-4 relative">
                            {baseCard.color.includes('-') ? (
                              // Dual-ink cards: show both icons split diagonally
                              (() => {
                                const [color1, color2] = baseCard.color.split('-');
                                const icon1 = colorIconMap[color1];
                                const icon2 = colorIconMap[color2];
                                if (icon1 && icon2) {
                                  return (
                                    <div className="relative w-4 h-4">
                                      {/* First color (top-left triangle) */}
                                      <div className="absolute inset-0 overflow-hidden">
                                        <img 
                                          src={icon1} 
                                          alt={color1}
                                          className="w-4 h-4"
                                          style={{
                                            clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                                          }}
                                        />
                                      </div>
                                      {/* Second color (bottom-right triangle) */}
                                      <div className="absolute inset-0 overflow-hidden">
                                        <img 
                                          src={icon2} 
                                          alt={color2}
                                          className="w-4 h-4"
                                          style={{
                                            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                                          }}
                                        />
                                      </div>
                                      {/* Diagonal separator line */}
                                      <div 
                                        className="absolute inset-0 border-black border-opacity-20"
                                        style={{
                                          borderWidth: '0 0 1px 0',
                                          transform: 'rotate(45deg)',
                                          transformOrigin: 'center'
                                        }}
                                      />
                                    </div>
                                  );
                                }
                                return null;
                              })()
                            ) : (
                              // Single ink cards: show normal icon
                              colorIconMap[baseCard.color] && (
                                <img 
                                  src={colorIconMap[baseCard.color]} 
                                  alt={baseCard.color}
                                  className="w-4 h-4"
                                />
                              )
                            )}
                          </div>
                        )}
                        
                        {/* Set */}
                        <span className="text-gray-600 text-xs w-10 truncate" title={setInfo?.name || baseCard.setCode}>
                          {setInfo?.code || baseCard.setCode}
                        </span>
                        
                        {/* Main Info Section - Flexible Width */}
                        <div className="flex-1 flex items-center space-x-2 min-w-0">
                          {/* Card Name */}
                          <span className="font-semibold text-gray-900 truncate">{baseCard.name}</span>
                          
                          {/* Version if exists */}
                          {baseCard.version && (
                            <span className="text-gray-600 truncate">- {baseCard.version}</span>
                          )}
                        </div>
                        
                        {/* Stats with emojis */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {baseCard.strength !== undefined && (
                            <span className="text-gray-700 font-medium" title="Strength">
                              💪{baseCard.strength}
                            </span>
                          )}
                          {baseCard.willpower !== undefined && (
                            <span className="text-gray-700 font-medium" title="Willpower">
                              🛡️{baseCard.willpower}
                            </span>
                          )}
                          {baseCard.lore !== undefined && (
                            <span className="text-gray-700 font-medium" title="Lore">
                              ◆{baseCard.lore}
                            </span>
                          )}
                        </div>
                        
                        {/* Controls Section - Fixed Width */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {renderMiniControl('regular', quantities.regular, consolidatedCard.variants.regular !== null, 'R')}
                          {renderMiniControl('foil', quantities.foil, consolidatedCard.variants.foil !== null, 'F')}
                          {hasEnchanted && renderMiniControl('enchanted', quantities.enchanted, true, 'E')}
                          {hasSpecial && renderMiniControl('special', quantities.special, true, 'S')}
                          
                          {/* Total */}
                          <div className="ml-2 pl-2 border-l border-gray-400">
                            <span className="font-semibold text-gray-700">T:{totalOwned}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-8">
          {filteredAndSortedCards.map((consolidatedCard) => {
            const quantities = getVariantQuantities(consolidatedCard.fullName);
            return (
              <div key={consolidatedCard.baseCard.id} className="relative mb-3">
                <ConsolidatedCardComponent
                  consolidatedCard={consolidatedCard}
                  quantities={quantities}
                  onQuantityChange={(variantType, change) => 
                    handleVariantQuantityChange(consolidatedCard, variantType, change)
                  }
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-1">
          {filteredAndSortedCards.map((consolidatedCard) => {
            const { baseCard, hasEnchanted, hasSpecial } = consolidatedCard;
            const quantities = getVariantQuantities(consolidatedCard.fullName);
            const totalOwned = quantities.regular + quantities.foil + quantities.enchanted + quantities.special;
            const setInfo = sets.find(s => s.code === baseCard.setCode);
            
            // Ultra-compact quantity control
            const renderMiniControl = (
              variantType: 'regular' | 'foil' | 'enchanted' | 'special',
              quantity: number,
              isAvailable: boolean,
              label: string
            ) => {
              if (!isAvailable) return null;
              return (
                <div className="flex items-center space-x-0.5 text-xs">
                  <span className="text-gray-500 font-medium">{label}:</span>
                  <button
                    onClick={() => handleVariantQuantityChange(consolidatedCard, variantType, -1)}
                    disabled={quantity <= 0}
                    className="px-1 hover:bg-black hover:bg-opacity-10 rounded disabled:opacity-50 text-gray-600"
                  >
                    -
                  </button>
                  <span className="min-w-[16px] text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleVariantQuantityChange(consolidatedCard, variantType, 1)}
                    className="px-1 hover:bg-black hover:bg-opacity-10 rounded text-gray-600"
                  >
                    +
                  </button>
                </div>
              );
            };
            
            return (
              <div 
                key={baseCard.id} 
                className="bg-white p-2 rounded hover:shadow-md transition-shadow flex items-center space-x-2 text-xs border border-gray-200"
              >
                {/* Card Number */}
                <span className="font-mono text-gray-700 font-semibold w-12 text-center">#{baseCard.number}</span>
                
                {/* Rarity */}
                {rarityIconMap[baseCard.rarity] && (
                  <img 
                    src={rarityIconMap[baseCard.rarity]} 
                    alt={baseCard.rarity}
                    className="w-3 h-3 flex-shrink-0"
                  />
                )}
                
                {/* Ink Color Icon */}
                {baseCard.color && (
                  <div className="flex-shrink-0 w-4 h-4 relative">
                    {baseCard.color.includes('-') ? (
                      // Dual-ink cards: show both icons split diagonally
                      (() => {
                        const [color1, color2] = baseCard.color.split('-');
                        const icon1 = colorIconMap[color1];
                        const icon2 = colorIconMap[color2];
                        if (icon1 && icon2) {
                          return (
                            <div className="relative w-4 h-4">
                              {/* First color (top-left triangle) */}
                              <div className="absolute inset-0 overflow-hidden">
                                <img 
                                  src={icon1} 
                                  alt={color1}
                                  className="w-4 h-4"
                                  style={{
                                    clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                                  }}
                                />
                              </div>
                              {/* Second color (bottom-right triangle) */}
                              <div className="absolute inset-0 overflow-hidden">
                                <img 
                                  src={icon2} 
                                  alt={color2}
                                  className="w-4 h-4"
                                  style={{
                                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                                  }}
                                />
                              </div>
                              {/* Diagonal separator line */}
                              <div 
                                className="absolute inset-0 border-black border-opacity-20"
                                style={{
                                  borderWidth: '0 0 1px 0',
                                  transform: 'rotate(45deg)',
                                  transformOrigin: 'center'
                                }}
                              />
                            </div>
                          );
                        }
                        return null;
                      })()
                    ) : (
                      // Single ink cards: show normal icon
                      colorIconMap[baseCard.color] && (
                        <img 
                          src={colorIconMap[baseCard.color]} 
                          alt={baseCard.color}
                          className="w-4 h-4"
                        />
                      )
                    )}
                  </div>
                )}
                
                {/* Set */}
                <span className="text-gray-600 text-xs w-10 truncate" title={setInfo?.name || baseCard.setCode}>
                  {setInfo?.code || baseCard.setCode}
                </span>
                
                {/* Main Info Section - Flexible Width */}
                <div className="flex-1 flex items-center space-x-2 min-w-0">
                  {/* Card Name */}
                  <span className="font-semibold text-gray-900 truncate">{baseCard.name}</span>
                  
                  {/* Version if exists */}
                  {baseCard.version && (
                    <span className="text-gray-600 truncate">- {baseCard.version}</span>
                  )}
                </div>
                
                {/* Stats with emojis */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {baseCard.strength !== undefined && (
                    <span className="text-gray-700 font-medium" title="Strength">
                      💪{baseCard.strength}
                    </span>
                  )}
                  {baseCard.willpower !== undefined && (
                    <span className="text-gray-700 font-medium" title="Willpower">
                      🛡️{baseCard.willpower}
                    </span>
                  )}
                  {baseCard.lore !== undefined && (
                    <span className="text-gray-700 font-medium" title="Lore">
                      ◆{baseCard.lore}
                    </span>
                  )}
                </div>
                
                {/* Controls Section - Fixed Width */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {renderMiniControl('regular', quantities.regular, consolidatedCard.variants.regular !== null, 'R')}
                  {renderMiniControl('foil', quantities.foil, consolidatedCard.variants.foil !== null, 'F')}
                  {hasEnchanted && renderMiniControl('enchanted', quantities.enchanted, true, 'E')}
                  {hasSpecial && renderMiniControl('special', quantities.special, true, 'S')}
                  
                  {/* Total */}
                  <div className="ml-2 pl-2 border-l border-gray-400">
                    <span className="font-semibold text-gray-700">T:{totalOwned}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {groupBy === 'none' && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CardBrowser;