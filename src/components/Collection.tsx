import React, { useState, useMemo } from 'react';
import { Search, Package, Upload, Trash2 } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';
import { consolidatedCards } from '../data/allCards';
import ConsolidatedCardComponent from './ConsolidatedCard';
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredCollection = useMemo(() => {
    // Get only consolidated cards that have variants in our collection
    const ownedConsolidatedCards = consolidatedCards.filter(consolidatedCard => {
      const quantities = getVariantQuantities(consolidatedCard.fullName);
      return quantities.regular > 0 || quantities.foil > 0 || quantities.enchanted > 0 || quantities.special > 0;
    });
    
    // Filter by search term
    return ownedConsolidatedCards.filter(consolidatedCard =>
      consolidatedCard.baseCard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consolidatedCard.baseCard.version?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
  }, [searchTerm, getVariantQuantities]);

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

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search your collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredCollection.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No matching cards found' : 'Your collection is empty'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms.' : 'Start building your collection by browsing cards and adding them from the Browse Cards tab.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredCollection.map((consolidatedCard) => {
            const quantities = getVariantQuantities(consolidatedCard.fullName);
            return (
              <div key={consolidatedCard.baseCard.id} className="relative">
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