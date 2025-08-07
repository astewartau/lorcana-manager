import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { ConsolidatedCard } from '../../types';

interface DeckBuilderCardListProps {
  cards: ConsolidatedCard[];
  getCardQuantityInDeck: (cardId: number) => number;
  getCollectionQuantity: (card: ConsolidatedCard) => number;
  onAddCard: (card: ConsolidatedCard) => void;
  onRemoveCard: (cardId: number) => void;
  canAddCard: (deckQuantity: number) => boolean;
  colorIconMap: Record<string, string>;
  rarityIconMap: Record<string, string>;
  sets: Array<{code: string; name: string}>;
}

const DeckBuilderCardList: React.FC<DeckBuilderCardListProps> = ({
  cards,
  getCardQuantityInDeck,
  getCollectionQuantity,
  onAddCard,
  onRemoveCard,
  canAddCard,
  colorIconMap,
  rarityIconMap,
  sets
}) => {
  const getSetName = (setCode: string) => {
    return sets.find(s => s.code === setCode)?.name || setCode;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600';
      case 'Uncommon': return 'text-green-600';
      case 'Rare': return 'text-blue-600';
      case 'Super Rare': return 'text-purple-600';
      case 'Legendary': return 'text-orange-600';
      case 'Enchanted': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-2">
      {cards.map((consolidatedCard) => {
        const { baseCard } = consolidatedCard;
        const deckQuantity = getCardQuantityInDeck(baseCard.id);
        const collectionQuantity = getCollectionQuantity(consolidatedCard);
        const canAdd = canAddCard(deckQuantity);
        
        return (
          <div key={baseCard.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              {/* Card Thumbnail */}
              <div className="w-16 h-20 flex-shrink-0">
                <img
                  src={baseCard.images.thumbnail}
                  alt={baseCard.fullName}
                  className="w-full h-full object-cover rounded"
                />
              </div>

              {/* Card Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {baseCard.name}
                    </h3>
                    {baseCard.version && (
                      <p className="text-xs text-gray-600 truncate">{baseCard.version}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg font-bold text-blue-600">{baseCard.cost}</span>
                      {baseCard.color && colorIconMap[baseCard.color] && (
                        <img 
                          src={colorIconMap[baseCard.color]} 
                          alt={baseCard.color}
                          className="w-4 h-4"
                        />
                      )}
                      <span className={`text-xs font-medium ${getRarityColor(baseCard.rarity)}`}>
                        {baseCard.rarity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {baseCard.type} • {getSetName(baseCard.setCode)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end space-y-1 text-xs text-gray-600">
                    {baseCard.strength !== undefined && (
                      <div>STR: {baseCard.strength}</div>
                    )}
                    {baseCard.willpower !== undefined && (
                      <div>WIL: {baseCard.willpower}</div>
                    )}
                    {baseCard.lore !== undefined && (
                      <div>LORE: {baseCard.lore}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deck Controls */}
              <div className="flex items-center space-x-2">
                <div className="text-sm font-semibold text-gray-800">
                  {deckQuantity}{collectionQuantity > 0 ? `/${Math.min(collectionQuantity, 4)}` : ''}
                </div>
                <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => onRemoveCard(baseCard.id)}
                    disabled={deckQuantity <= 0}
                    className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors rounded"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-semibold min-w-[1.5rem] text-center">
                    {deckQuantity}
                  </span>
                  <button
                    onClick={() => onAddCard(consolidatedCard)}
                    disabled={!canAdd}
                    className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors rounded"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Variant Indicators */}
            {(consolidatedCard.hasEnchanted || consolidatedCard.hasSpecial) && (
              <div className="flex space-x-2 mt-2">
                {consolidatedCard.hasEnchanted && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Enchanted Available
                  </span>
                )}
                {consolidatedCard.hasSpecial && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Special Available
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DeckBuilderCardList;