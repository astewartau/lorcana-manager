import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Filter, RotateCcw, X, Eye, ChevronDown } from 'lucide-react';
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
  const [showViewMenu, setShowViewMenu] = useState(false);

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

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && showFilters) {
        // On desktop, keep filters open
        return;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showFilters]);

  return (
    <div className="space-y-0">
      {/* Search section - connects to header */}
      <div className="sticky top-0 z-30 bg-white border-2 border-lorcana-gold border-t-0 rounded-b-sm shadow-lg p-3 sm:p-6">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lorcana-navy" size={18} />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border-2 border-lorcana-gold rounded-sm focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy bg-lorcana-cream text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border-2 rounded-sm focus:ring-2 focus:ring-lorcana-gold flex items-center transition-colors ${
                activeFiltersCount > 0 ? 'bg-lorcana-gold border-lorcana-navy text-lorcana-ink' : 'border-lorcana-gold hover:bg-lorcana-cream'
              }`}
            >
              <Filter size={18} />
              {activeFiltersCount > 0 && (
                <span className="bg-lorcana-navy text-lorcana-gold text-xs font-bold px-1.5 py-0.5 rounded-sm ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowViewMenu(!showViewMenu)}
                className="px-3 py-2 border-2 border-lorcana-gold rounded-sm hover:bg-lorcana-cream focus:ring-2 focus:ring-lorcana-gold transition-colors flex items-center"
              >
                <Eye size={18} />
                <ChevronDown size={14} className="ml-1" />
              </button>
              
              {/* View Menu Dropdown */}
              {showViewMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowViewMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border-2 border-lorcana-gold rounded-sm shadow-xl z-50">
                    <div className="p-3 space-y-3">
                      {/* View Mode */}
                      <div>
                        <label className="block text-xs font-medium text-lorcana-ink mb-1">View</label>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setViewMode('grid');
                              setShowViewMenu(false);
                            }}
                            className={`flex-1 px-2 py-1 rounded-sm border text-xs font-medium transition-colors ${
                              viewMode === 'grid' 
                                ? 'bg-lorcana-gold border-lorcana-navy text-lorcana-ink' 
                                : 'border-lorcana-gold hover:bg-lorcana-cream'
                            }`}
                          >
                            <Grid size={14} className="inline mr-1" />
                            Grid
                          </button>
                          <button
                            onClick={() => {
                              setViewMode('list');
                              setShowViewMenu(false);
                            }}
                            className={`flex-1 px-2 py-1 rounded-sm border text-xs font-medium transition-colors ${
                              viewMode === 'list' 
                                ? 'bg-lorcana-gold border-lorcana-navy text-lorcana-ink' 
                                : 'border-lorcana-gold hover:bg-lorcana-cream'
                            }`}
                          >
                            <List size={14} className="inline mr-1" />
                            List
                          </button>
                        </div>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-xs font-medium text-lorcana-ink mb-1">Sort</label>
                        <select
                          value={`${sortBy.field}-${sortBy.direction}`}
                          onChange={(e) => {
                            const [field, direction] = e.target.value.split('-');
                            setSortBy({ field: field as any, direction: direction as 'asc' | 'desc' });
                          }}
                          className="w-full px-2 py-1 border-2 border-lorcana-gold rounded-sm focus:ring-1 focus:ring-lorcana-gold focus:border-lorcana-navy bg-white text-xs"
                        >
                          <option value="name-asc">Name A-Z</option>
                          <option value="name-desc">Name Z-A</option>
                          <option value="cost-asc">Cost Low-High</option>
                          <option value="cost-desc">Cost High-Low</option>
                          <option value="rarity-asc">Rarity Low-High</option>
                          <option value="rarity-desc">Rarity High-Low</option>
                          <option value="set-asc">Set (Oldest First)</option>
                          <option value="set-desc">Set (Newest First)</option>
                        </select>
                      </div>

                      {/* Group By */}
                      <div>
                        <label className="block text-xs font-medium text-lorcana-ink mb-1">Group</label>
                        <select
                          value={groupBy}
                          onChange={(e) => setGroupBy(e.target.value)}
                          className="w-full px-2 py-1 border-2 border-lorcana-gold rounded-sm focus:ring-1 focus:ring-lorcana-gold focus:border-lorcana-navy bg-white text-xs"
                        >
                          <option value="none">No Grouping</option>
                          <option value="set">Group by Set</option>
                          <option value="color">Group by Ink Color</option>
                          <option value="rarity">Group by Rarity</option>
                          <option value="type">Group by Type</option>
                          <option value="story">Group by Story</option>
                          <option value="cost">Group by Cost</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="flex flex-col gap-4">
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
            <div className="flex flex-wrap gap-2">
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
                <span>Filters</span>
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
      </div>
      
      {/* Quick Filters - hidden on mobile */}
      <div className="hidden md:block">
        <QuickFilters
          filters={filters}
          setFilters={setFilters}
          colorIconMap={COLOR_ICONS}
          rarityIconMap={RARITY_ICONS}
        />
      </div>

      {/* Sidebar Overlay - Both Mobile and Desktop */}
      {showFilters && (
        <>
          {/* Backdrop - lighter on desktop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:bg-opacity-20 z-40"
            onClick={() => setShowFilters(false)}
          />
          
          {/* Sidebar - True overlay for both mobile and desktop */}
          <div className={`
            fixed top-0 left-0 z-50
            w-80 sm:w-96 lg:w-80 xl:w-96
            h-screen
            bg-white border-r-2 border-lorcana-gold shadow-2xl
            overflow-y-auto
            transform transition-transform duration-300
            ${showFilters ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="sticky top-0 bg-white border-b-2 border-lorcana-gold p-4 lg:p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-lorcana-ink">Filters</h3>
                <div className="flex items-center space-x-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-lorcana-ink hover:text-lorcana-navy border-2 border-lorcana-gold rounded-sm hover:bg-lorcana-cream transition-colors"
                    >
                      <RotateCcw size={14} />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-lorcana-navy hover:text-lorcana-ink transition-colors text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 lg:p-6">
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
            </div>
          </div>
        </>
      )}

      {/* Main content area - no layout shifts */}
      <div className="w-full">
          <div className="space-y-6 p-3 sm:p-6">
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
          </div>
      </div>

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