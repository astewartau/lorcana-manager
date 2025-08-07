import React from 'react';
import { Search, Grid, List, ChevronLeft, ChevronRight, Filter, RotateCcw, X } from 'lucide-react';
import { sets } from '../data/allCards';
import FilterPanel from './shared/FilterPanel';
import { CardGridView, CardListView, GroupedView } from './card-views';
import { useCardBrowser } from '../hooks';
import QuickFilters from './QuickFilters';
import { RARITY_ICONS, COLOR_ICONS } from '../constants/icons';


const CardBrowser: React.FC = () => {
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
                onClick={refreshStaleCards}
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
              onClick={dismissFilterNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <X size={16} />
            </button>
          </div>
          <button
            onClick={refreshStaleCards}
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