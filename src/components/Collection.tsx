import React, { useState, useMemo } from 'react';
import { Package, Upload, Trash2, TrendingUp, Star } from 'lucide-react';
import { useCollection } from '../contexts/CollectionContext';
import { consolidatedCards, sets } from '../data/allCards';
import DreambornImport from './DreambornImport';

interface SetSummary {
  code: string;
  name: string;
  number: number;
  totalCards: number;
  ownedCards: number;
  ownedPercentage: number;
  totalOwned: number; // Total quantity owned including duplicates
  rarityBreakdown: Record<string, { owned: number; playable: number; total: number }>;
}

const Collection: React.FC = () => {
  const {
    getVariantQuantities,
    totalCards,
    uniqueCards,
    clearCollection
  } = useCollection();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate set summaries
  const setSummaries = useMemo((): SetSummary[] => {
    return sets.map(set => {
      // Get all cards in this set
      const setCards = consolidatedCards.filter(card => card.baseCard.setCode === set.code);
      const totalCardsInSet = setCards.length;

      // Calculate owned cards and quantities
      let ownedCards = 0;
      let totalOwnedQuantity = 0;
      const rarityBreakdown: Record<string, { owned: number; playable: number; total: number }> = {};

      setCards.forEach(consolidatedCard => {
        const quantities = getVariantQuantities(consolidatedCard.fullName);
        const totalCardQuantity = quantities.regular + quantities.foil + quantities.enchanted + quantities.special;
        
        if (totalCardQuantity > 0) {
          ownedCards++;
          totalOwnedQuantity += totalCardQuantity;
        }

        // Track rarity breakdown
        const rarity = consolidatedCard.baseCard.rarity;
        if (!rarityBreakdown[rarity]) {
          rarityBreakdown[rarity] = { owned: 0, playable: 0, total: 0 };
        }
        rarityBreakdown[rarity].total++;
        
        // Master set: at least one copy
        if (totalCardQuantity > 0) {
          rarityBreakdown[rarity].owned++;
        }
        
        // Playable set: 4 or more copies
        if (totalCardQuantity >= 4) {
          rarityBreakdown[rarity].playable++;
        }
      });

      const ownedPercentage = totalCardsInSet > 0 ? (ownedCards / totalCardsInSet) * 100 : 0;

      return {
        code: set.code,
        name: set.name,
        number: set.number,
        totalCards: totalCardsInSet,
        ownedCards,
        ownedPercentage,
        totalOwned: totalOwnedQuantity,
        rarityBreakdown
      };
    }).sort((a, b) => a.number - b.number); // Sort by set number
  }, [getVariantQuantities]);

  const handleDeleteAll = () => {
    clearCollection();
    setShowDeleteConfirm(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600';
      case 'Uncommon': return 'text-green-600';
      case 'Rare': return 'text-blue-600';
      case 'Super Rare': return 'text-purple-600';
      case 'Legendary': return 'text-yellow-600';
      case 'Enchanted': return 'text-pink-600';
      case 'Special': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
      </div>

      {/* Set Summaries */}
      {totalCards === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your collection is empty</h3>
          <p className="text-gray-600 mb-6">
            Start building your collection by browsing cards and adding them from the Browse Cards tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {setSummaries.map((setData) => (
            <div key={setData.code} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Set Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{setData.name}</h3>
                <p className="text-sm text-gray-600">Set {setData.number} • {setData.code}</p>
              </div>

              {/* Progress Overview */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Master Set</span>
                  <span className="text-sm font-bold text-gray-900">
                    {setData.ownedCards}/{setData.totalCards} ({setData.ownedPercentage.toFixed(1)}%)
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(setData.ownedPercentage)}`}
                    style={{ width: `${setData.ownedPercentage}%` }}
                  />
                </div>

                {/* Total Owned */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <TrendingUp size={14} />
                    <span>Total owned: {setData.totalOwned}</span>
                  </div>
                  {setData.ownedPercentage === 100 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Star size={14} />
                      <span className="font-medium">Complete!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rarity Breakdown Table */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Rarity Breakdown</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Rarity</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">Master Set</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">Playable Set</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(setData.rarityBreakdown)
                        .filter(([, data]) => data.total > 0)
                        .sort(([a], [b]) => {
                          const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Legendary', 'Enchanted', 'Special'];
                          return rarityOrder.indexOf(a) - rarityOrder.indexOf(b);
                        })
                        .map(([rarity, data]) => (
                          <tr key={rarity} className="hover:bg-gray-50">
                            <td className="px-3 py-2">
                              <span className={`font-medium ${getRarityColor(rarity)}`}>{rarity}</span>
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600">
                              {data.owned}/{data.total} ({data.total > 0 ? ((data.owned / data.total) * 100).toFixed(0) : 0}%)
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600">
                              {data.playable}/{data.total} ({data.total > 0 ? ((data.playable / data.total) * 100).toFixed(0) : 0}%)
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <DreambornImport onClose={() => setShowImportModal(false)} />
      )}
      
      {/* Delete Confirmation Modal */}
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