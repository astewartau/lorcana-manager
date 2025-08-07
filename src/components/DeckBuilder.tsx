import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Grid, List, Filter, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { FilterOptions, SortOption, ConsolidatedCard } from '../types';
import { consolidatedCards, sets } from '../data/allCards';
import { useDeck } from '../contexts/DeckContext';
import { useCollection } from '../contexts/CollectionContext';
import FilterPanel from './shared/FilterPanel';
import PaginationControls from './shared/PaginationControls';
import { filterCards, sortCards, countActiveFilters } from '../utils/cardFiltering';
import { getDefaultFilters } from '../utils/filterDefaults';
import { usePagination } from '../hooks/usePagination';
import DeckPanel from './deck/DeckPanel';
import DeckBuilderCardGrid from './deck/DeckBuilderCardGrid';
import DeckBuilderCardList from './deck/DeckBuilderCardList';
import QuickFilters from './QuickFilters';
import { RARITY_ICONS, COLOR_ICONS } from '../constants/icons';

interface DeckBuilderProps {
  onBack: () => void;
  onViewDeck: () => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({ onBack, onViewDeck }) => {
  const { currentDeck, updateDeck, addCardToDeck, removeCardFromDeck, updateCardQuantity, validateDeck } = useDeck();
  const { getVariantQuantities } = useCollection();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [deckName, setDeckName] = useState(currentDeck?.name || '');

  const [filters, setFilters] = useState<FilterOptions>(getDefaultFilters());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const cardsPerPage = 100;

  // Update deck name in state when current deck changes
  useEffect(() => {
    if (currentDeck) {
      setDeckName(currentDeck.name);
    }
  }, [currentDeck]);

  // Get card quantity in current deck
  const getCardQuantityInDeck = (cardId: number): number => {
    if (!currentDeck) return 0;
    const deckCard = currentDeck.cards.find(c => c.id === cardId);
    return deckCard?.quantity || 0;
  };

  // Filter and sort cards
  const { sortedCards, activeFiltersCount, totalCards } = useMemo(() => {
    const filtered = filterCards(consolidatedCards, searchTerm, filters, new Set(), getVariantQuantities);
    const sorted = sortCards(filtered, sortBy);
    const activeCount = countActiveFilters(filters);
    
    return {
      sortedCards: sorted,
      activeFiltersCount: activeCount,
      totalCards: sorted.length
    };
  }, [searchTerm, filters, sortBy, getVariantQuantities]);

  // Pagination
  const pagination = usePagination({
    totalItems: totalCards,
    itemsPerPage: cardsPerPage,
    resetTriggers: [searchTerm, filters, sortBy]
  });

  // Get paginated cards for current page
  const paginatedCards = useMemo(() => {
    return sortedCards.slice(pagination.startIndex, pagination.endIndex);
  }, [sortedCards, pagination.startIndex, pagination.endIndex]);

  const clearAllFilters = () => {
    setFilters(getDefaultFilters());
    setSearchTerm('');
  };

  const handleAddCard = (card: ConsolidatedCard) => {
    addCardToDeck(card.baseCard);
  };

  const handleRemoveCard = (cardId: number) => {
    removeCardFromDeck(cardId);
  };

  const canAddCard = (deckQuantity: number): boolean => {
    if (!currentDeck) return false;
    const totalCards = currentDeck.cards.reduce((sum, c) => sum + c.quantity, 0);
    return deckQuantity < 4 && totalCards < 60;
  };

  // Get total collection quantity for a card (all variants combined)
  const getCollectionQuantity = (consolidatedCard: ConsolidatedCard): number => {
    const variantQuantities = getVariantQuantities(consolidatedCard.fullName);
    return variantQuantities.regular + variantQuantities.foil + variantQuantities.enchanted + variantQuantities.special;
  };

  const handleUpdateName = () => {
    if (currentDeck && deckName.trim() !== currentDeck.name) {
      updateDeck({
        ...currentDeck,
        name: deckName.trim(),
        updatedAt: new Date()
      });
    }
  };

  const handleSave = () => {
    if (currentDeck) {
      handleUpdateName();
      // Could add additional save logic here
    }
  };

  const clearDeck = () => {
    if (currentDeck) {
      updateDeck({
        ...currentDeck,
        cards: [],
        updatedAt: new Date()
      });
    }
  };

  if (!currentDeck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No deck selected</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My Decks
          </button>
        </div>
      </div>
    );
  }

  const validation = validateDeck(currentDeck);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to My Decks</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                onBlur={handleUpdateName}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateName()}
                className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                placeholder="Deck Name"
              />
              <div className={`px-2 py-1 rounded text-sm font-medium ${
                validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {validation.isValid ? 'Valid' : 'Invalid'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex relative">
          {/* Cards Panel */}
          <div className={`transition-all duration-300 ease-in-out p-6 ${sidebarCollapsed ? 'pr-20' : 'pr-6'}`} style={{ width: sidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 320px)' }}>
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

            {/* Top Pagination Info */}
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={totalCards}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.setCurrentPage}
              onPrevPage={pagination.goToPrevPage}
              onNextPage={pagination.goToNextPage}
              showCompact={true}
              showBottomControls={false}
            />

            {/* Cards Display */}
            {viewMode === 'grid' ? (
              <DeckBuilderCardGrid
                cards={paginatedCards}
                getCardQuantityInDeck={getCardQuantityInDeck}
                getCollectionQuantity={getCollectionQuantity}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                canAddCard={canAddCard}
              />
            ) : (
              <DeckBuilderCardList
                cards={paginatedCards}
                getCardQuantityInDeck={getCardQuantityInDeck}
                getCollectionQuantity={getCollectionQuantity}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                canAddCard={canAddCard}
                colorIconMap={COLOR_ICONS}
                rarityIconMap={RARITY_ICONS}
                sets={sets}
              />
            )}
            
            {/* Pagination Controls */}
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={totalCards}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.setCurrentPage}
              onPrevPage={pagination.goToPrevPage}
              onNextPage={pagination.goToNextPage}
              showTopInfo={false}
              showBottomControls={true}
            />
          </div>

          {/* Deck Panel - Sticky Sidebar */}
          <div className={`fixed top-0 right-0 h-screen transition-all duration-300 ease-in-out z-40 ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
            {/* Collapse/Expand Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-50 w-8 h-12 bg-white border border-gray-300 rounded-l-lg shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              {sidebarCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {/* Sidebar Content */}
            <div className={`h-full transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <DeckPanel
                deck={currentDeck}
                onRemoveCard={handleRemoveCard}
                onUpdateQuantity={updateCardQuantity}
                onClearDeck={clearDeck}
                onViewDeck={onViewDeck}
                validation={validation}
                isCollapsed={sidebarCollapsed}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;