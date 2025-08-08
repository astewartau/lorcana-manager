import React, { useState } from 'react';
import { Search, Grid, List, Filter, RotateCcw, X } from 'lucide-react';
import { sets } from '../data/allCards';
import FilterPanel from './shared/FilterPanel';
import PaginationControls from './shared/PaginationControls';
import { CardGridView, CardListView, GroupedView } from './card-views';
import { useCardBrowser } from '../hooks';
import QuickFilters from './QuickFilters';
import { RARITY_ICONS, COLOR_ICONS } from '../constants/icons';
import CardPreviewModal from './CardPreviewModal';
import { ConsolidatedCard } from '../types';


const CardBrowser: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<ConsolidatedCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
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
    
    // Collection functions
    getVariantQuantities,
    
    // Computed
    groupedCards,
    totalCards,
    activeFiltersCount,
    paginatedCards,
    pagination
  } = useCardBrowser();

  const handleCardClick = (card: ConsolidatedCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  return (
    <div className="space-y-0">
      {/* Search section - connects to header */}
      <div className="bg-white border-2 border-lorcana-gold border-t-0 rounded-b-sm shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lorcana-navy" size={20} />
            <input
              type="text"
              placeholder="Search cards by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-lorcana-gold rounded-sm focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy bg-lorcana-cream"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={`${sortBy.field}-${sortBy.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy({ field: field as any, direction: direction as 'asc' | 'desc' });
              }}
              className="px-4 py-2 border-2 border-lorcana-gold rounded-sm focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy bg-white hover:bg-lorcana-cream transition-colors"
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
              className="px-4 py-2 border-2 border-lorcana-gold rounded-sm focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy bg-white hover:bg-lorcana-cream transition-colors"
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
              onClick={refreshStaleCards}
              disabled={!showFilterNotification}
              className={`px-3 py-2 border-2 rounded-sm focus:ring-2 focus:ring-lorcana-gold transition-colors ${
                showFilterNotification 
                  ? 'hover:bg-lorcana-gold text-lorcana-navy border-lorcana-gold bg-lorcana-cream' 
                  : 'text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
              title={showFilterNotification ? 'Refresh view to apply current filters' : 'No stale cards to refresh'}
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border-2 rounded-sm focus:ring-2 focus:ring-lorcana-gold flex items-center space-x-2 transition-colors ${
                activeFiltersCount > 0 ? 'bg-lorcana-gold border-lorcana-navy text-lorcana-ink' : 'border-lorcana-gold hover:bg-lorcana-cream'
              }`}
            >
              <Filter size={20} />
              {activeFiltersCount > 0 && (
                <span className="bg-lorcana-navy text-lorcana-gold text-xs font-bold px-2 py-1 rounded-sm">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 border-2 border-lorcana-gold rounded-sm hover:bg-lorcana-cream focus:ring-2 focus:ring-lorcana-gold transition-colors"
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

      {/* Content section with proper spacing */}
      <div className="space-y-6">
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

        {groupBy !== 'none' ? (
          <div className="flex justify-between items-center mb-4">
            <div className="text-lorcana-ink font-medium">
              Showing {totalCards} cards in {Object.keys(groupedCards).length} groups
            </div>
          </div>
        ) : (
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
        )}

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
            onCardClick={handleCardClick}
          />
        ) : viewMode === 'grid' ? (
          <CardGridView
            cards={paginatedCards}
            onQuantityChange={handleVariantQuantityChange}
            getVariantQuantities={getVariantQuantities}
            onCardClick={handleCardClick}
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
            onCardClick={handleCardClick}
          />
        )}

        {groupBy === 'none' && (
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={totalCards}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={pagination.setCurrentPage}
            onPrevPage={pagination.goToPrevPage}
            onNextPage={pagination.goToNextPage}
          />
        )}

        {/* Filter notification bubble */}
        {showFilterNotification && (
          <div className="fixed bottom-4 right-4 bg-white border-2 border-lorcana-gold rounded-sm shadow-xl p-4 max-w-sm z-50 art-deco-corner">
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
                onClick={dismissFilterNotification}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={refreshStaleCards}
              className="w-full px-3 py-2 bg-lorcana-navy text-lorcana-gold text-sm font-medium rounded-sm hover:bg-opacity-90 transition-all"
            >
              Refresh View
            </button>
          </div>
        )}
      </div>

      {/* Card Preview Modal */}
      <CardPreviewModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CardBrowser;