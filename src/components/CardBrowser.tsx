import React, { useState, useMemo } from 'react';
import { Search, Grid, List, ChevronLeft, ChevronRight, Filter, RotateCcw, X } from 'lucide-react';
import { FilterOptions, SortOption, ConsolidatedCard } from '../types';
import { consolidatedCards, colors, sets, costRange, strengthRange, willpowerRange, loreRange } from '../data/allCards';
import { useCollection } from '../contexts/CollectionContext';
import FilterPanel from './shared/FilterPanel';
import { CardGridView, CardListView, GroupedView } from './card-views';
import { usePagination } from '../hooks';
import { filterCards, sortCards, groupCards, countActiveFilters } from '../utils/cardFiltering';
import QuickFilters from './QuickFilters';
import { RARITY_ICONS, COLOR_ICONS } from '../constants/icons';


const CardBrowser: React.FC = () => {
  const { getVariantQuantities, getCardQuantity, addVariantToCollection, removeVariantFromCollection } = useCollection();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'name', direction: 'asc' });
  const [groupBy, setGroupBy] = useState<string>('none');
  // Filter state memory for handling cards that no longer match filters
  const [staleCardIds, setStaleCardIds] = useState<Set<number>>(new Set());
  const [showFilterNotification, setShowFilterNotification] = useState(false);
  const [staleCardCount, setStaleCardCount] = useState(0);
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
    showAnyWithColors: true, // Default to inclusive mode
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

  // Filter and sort cards using utility functions
  const { sortedCards, groupedCards, totalCards, activeFiltersCount } = useMemo(() => {
    const filtered = filterCards(consolidatedCards, searchTerm, filters, staleCardIds, getVariantQuantities, getCardQuantity);
    const sorted = sortCards(filtered, sortBy);
    const grouped = groupCards(sorted, groupBy);
    const activeCount = countActiveFilters(filters);
    
    return {
      sortedCards: sorted,
      groupedCards: grouped,
      totalCards: sorted.length,
      activeFiltersCount: activeCount
    };
  }, [searchTerm, filters, sortBy, groupBy, getVariantQuantities, getCardQuantity, staleCardIds]);
  
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
  React.useEffect(() => {
    setStaleCardIds(new Set());
    setShowFilterNotification(false);
    setStaleCardCount(0);
  }, [filters, searchTerm, sortBy, groupBy]);

  const clearAllFilters = () => {
    setFilters({
      search: '',
      sets: defaultSetCodes,
      colors: nonEmptyColors,
      showAnyWithColors: true, // Default to inclusive mode
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
    // Get current quantities before the change (for potential future use)
    // const currentQuantities = getVariantQuantities(consolidatedCard.fullName);
    // const currentTotal = currentQuantities.regular + currentQuantities.foil + currentQuantities.enchanted + currentQuantities.special;
    // const currentLegacyQuantity = getCardQuantity(consolidatedCard.baseCard.id);
    // const currentTotalOwned = currentTotal + currentLegacyQuantity;
    
    // Apply the change
    if (change > 0) {
      addVariantToCollection(consolidatedCard, variantType, change);
    } else {
      removeVariantFromCollection(consolidatedCard.fullName, variantType, Math.abs(change));
    }
    
    // Check if this card would now be filtered out due to collection filters
    if (filters.inMyCollection !== null) {
      console.log('Checking if card would be filtered out...', {
        cardName: consolidatedCard.baseCard.name,
        filter: filters.inMyCollection,
        change
      });
      
      // Get current quantities before the change to predict future state
      const currentQuantities = getVariantQuantities(consolidatedCard.fullName);
      const currentTotal = currentQuantities.regular + currentQuantities.foil + currentQuantities.enchanted + currentQuantities.special;
      const currentLegacyQuantity = getCardQuantity(consolidatedCard.baseCard.id);
      const currentTotalOwned = currentTotal + currentLegacyQuantity;
      
      // Predict what the state will be after this change
      const predictedTotalOwned = currentTotalOwned + change;
      const willBeInCollection = predictedTotalOwned > 0;
      
      // Check if card would be filtered out after the change
      const wouldBeFilteredOut = (
        (filters.inMyCollection === true && !willBeInCollection) ||  // Filter wants "in collection" but card will not be in collection
        (filters.inMyCollection === false && willBeInCollection)     // Filter wants "not in collection" but card will be in collection
      );
      
      console.log('Stale card prediction:', {
        cardName: consolidatedCard.baseCard.name,
        currentTotalOwned,
        change,
        predictedTotalOwned,
        willBeInCollection,
        filterWantsInCollection: filters.inMyCollection,
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

  return (
    <div className="space-y-6">
      <div>
        <div className="bg-white rounded-t-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
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
                onClick={() => {
                  setStaleCardIds(new Set());
                  setShowFilterNotification(false);
                  setStaleCardCount(0);
                }}
                disabled={!showFilterNotification}
                className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  showFilterNotification 
                    ? 'hover:bg-blue-50 text-blue-600 border-blue-300 bg-blue-50' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={showFilterNotification ? 'Refresh view to apply current filters' : 'No stale cards to refresh'}
              >
                <RotateCcw size={20} />
              </button>
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
      
      {/* Quick Filters */}
      <QuickFilters
        filters={filters}
        setFilters={setFilters}
        colorIconMap={COLOR_ICONS}
        rarityIconMap={RARITY_ICONS}
      />

      {showFilters && (
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          activeFiltersCount={activeFiltersCount}
          onClearAllFilters={clearAllFilters}
          onClose={() => setShowFilters(false)}
          rarityIconMap={RARITY_ICONS}
          colorIconMap={COLOR_ICONS}
          showCollectionFilters={true}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-600">
          {groupBy !== 'none' ? (
            `Showing ${totalCards} cards in ${Object.keys(groupedCards).length} groups`
          ) : (
            `Showing ${pagination.startIndex + 1}-${Math.min(pagination.endIndex, totalCards)} of ${totalCards} cards`
          )}
        </div>
        {groupBy === 'none' && pagination.totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={pagination.goToPrevPage}
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={pagination.goToNextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {groupBy !== 'none' ? (
        <GroupedView
          groupedCards={groupedCards}
          viewMode={viewMode}
          onQuantityChange={handleVariantQuantityChange}
          getVariantQuantities={getVariantQuantities}
          staleCardIds={staleCardIds}
          rarityIconMap={RARITY_ICONS}
          colorIconMap={COLOR_ICONS}
          sets={sets}
        />
      ) : viewMode === 'grid' ? (
        <CardGridView
          cards={paginatedCards}
          onQuantityChange={handleVariantQuantityChange}
          getVariantQuantities={getVariantQuantities}
        />
      ) : (
        <CardListView
          cards={paginatedCards}
          onQuantityChange={handleVariantQuantityChange}
          getVariantQuantities={getVariantQuantities}
          staleCardIds={staleCardIds}
          rarityIconMap={RARITY_ICONS}
          colorIconMap={COLOR_ICONS}
          sets={sets}
        />
      )}

      {groupBy === 'none' && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={pagination.goToPrevPage}
            disabled={pagination.currentPage === 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    pageNum === pagination.currentPage
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
            onClick={pagination.goToNextPage}
            disabled={pagination.currentPage === pagination.totalPages}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Filter notification bubble */}
      {showFilterNotification && (
        <div className="fixed bottom-4 right-4 bg-white border border-orange-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-orange-500">⚠️</span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {staleCardCount} card{staleCardCount !== 1 ? 's' : ''} no longer match
                </p>
                <p className="text-xs text-gray-600">your current filters</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilterNotification(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <X size={16} />
            </button>
          </div>
          <button
            onClick={() => {
              setStaleCardIds(new Set());
              setShowFilterNotification(false);
              setStaleCardCount(0);
            }}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh View
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default CardBrowser;