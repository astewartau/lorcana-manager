import React, { useState, useMemo } from 'react';
import { Search, Package, Upload, Trash2, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';
import { consolidatedCards, sets } from '../data/allCards';
import { SortOption } from '../types';
import { CardGridView, CardListView, GroupedView } from './card-views';
import { usePagination } from '../hooks';
import { sortCards, groupCards } from '../utils/cardFiltering';
import DreambornImport from './DreambornImport';

const Collection: React.FC = () => {
  const {
    getVariantQuantities,
    addVariantToCollection,
    removeVariantFromCollection,
    totalCards,
    uniqueCards,
    clearCollection
  } = useCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>({ field: 'name', direction: 'asc' });
  const [groupBy, setGroupBy] = useState<string>('none');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const cardsPerPage = 100;
  
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

  // Filter, sort and group collection cards
  const { sortedCards, groupedCards, totalFilteredCards } = useMemo(() => {
    // Get only consolidated cards that have variants in our collection
    const ownedConsolidatedCards = consolidatedCards.filter(consolidatedCard => {
      const quantities = getVariantQuantities(consolidatedCard.fullName);
      return quantities.regular > 0 || quantities.foil > 0 || quantities.enchanted > 0 || quantities.special > 0;
    });
    
    // Filter by search term
    const filtered = ownedConsolidatedCards.filter(consolidatedCard =>
      consolidatedCard.baseCard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consolidatedCard.baseCard.version?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (consolidatedCard.baseCard.story?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
    
    // Sort cards
    const sorted = sortCards(filtered, sortBy);
    
    // Group cards
    const grouped = groupCards(sorted, groupBy);
    
    return {
      sortedCards: sorted,
      groupedCards: grouped,
      totalFilteredCards: sorted.length
    };
  }, [searchTerm, getVariantQuantities, sortBy, groupBy]);
  
  // Pagination
  const pagination = usePagination({
    totalItems: totalFilteredCards,
    itemsPerPage: cardsPerPage,
    resetTriggers: [searchTerm, sortBy, groupBy]
  });
  
  // Get paginated cards for current page
  const paginatedCards = useMemo(() => {
    return sortedCards.slice(pagination.startIndex, pagination.endIndex);
  }, [sortedCards, pagination.startIndex, pagination.endIndex]);

  const handleVariantQuantityChange = (
    consolidatedCard: any, 
    variantType: 'regular' | 'foil' | 'enchanted' | 'special', 
    change: number
  ) => {
    if (change > 0) {
      addVariantToCollection(consolidatedCard, variantType, change);
    } else {
      removeVariantFromCollection(consolidatedCard.fullName, variantType, Math.abs(change));
    }
  };

  const handleDeleteAll = () => {
    clearCollection();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Collection</h2>
            <div className="flex gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Package size={16} />
                <span>{totalCards} total cards</span>
              </div>
              <div>
                <span>{uniqueCards} unique cards</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              <span>Import Dreamborn Collection</span>
            </button>
            {totalCards > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete All</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your collection..."
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
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-600">
          {groupBy !== 'none' ? (
            `Showing ${totalFilteredCards} cards in ${Object.keys(groupedCards).length} groups`
          ) : (
            `Showing ${pagination.startIndex + 1}-${Math.min(pagination.endIndex, totalFilteredCards)} of ${totalFilteredCards} cards`
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

      {totalFilteredCards === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No matching cards found' : 'Your collection is empty'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms.' : 'Start building your collection by browsing cards and adding them from the Browse Cards tab.'}
          </p>
        </div>
      ) : groupBy !== 'none' ? (
        <GroupedView
          groupedCards={groupedCards}
          viewMode={viewMode}
          onQuantityChange={handleVariantQuantityChange}
          getVariantQuantities={getVariantQuantities}
          staleCardIds={new Set()}
          rarityIconMap={rarityIconMap}
          colorIconMap={colorIconMap}
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
          staleCardIds={new Set()}
          rarityIconMap={rarityIconMap}
          colorIconMap={colorIconMap}
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
      
      {showImportModal && (
        <DreambornImport onClose={() => setShowImportModal(false)} />
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete All Cards</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete all {totalCards} cards from your collection? 
              This will permanently remove all cards and cannot be recovered.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;