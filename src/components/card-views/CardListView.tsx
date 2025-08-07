import React from 'react';
import { ConsolidatedCard } from '../../types';

interface CardListViewProps {
  cards: ConsolidatedCard[];
  onQuantityChange: (card: ConsolidatedCard, variantType: 'regular' | 'foil' | 'enchanted' | 'special', change: number) => void;
  getVariantQuantities: (fullName: string) => {
    regular: number;
    foil: number;
    enchanted: number;
    special: number;
  };
  staleCardIds: Set<number>;
  rarityIconMap: Record<string, string>;
  colorIconMap: Record<string, string>;
  sets: Array<{code: string; name: string}>;
}

const CardListView: React.FC<CardListViewProps> = ({
  cards,
  onQuantityChange,
  getVariantQuantities,
  staleCardIds,
  rarityIconMap,
  colorIconMap,
  sets
}) => {
  // Ultra-compact quantity control
  const renderMiniControl = (
    consolidatedCard: ConsolidatedCard,
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
          onClick={() => onQuantityChange(consolidatedCard, variantType, -1)}
          disabled={quantity <= 0}
          className="px-1 hover:bg-black hover:bg-opacity-10 rounded disabled:opacity-50 text-gray-600"
        >
          -
        </button>
        <span className="min-w-[16px] text-center font-semibold">{quantity}</span>
        <button
          onClick={() => onQuantityChange(consolidatedCard, variantType, 1)}
          className="px-1 hover:bg-black hover:bg-opacity-10 rounded text-gray-600"
        >
          +
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-1">
      {cards.map((consolidatedCard) => {
        const { baseCard, hasEnchanted, hasSpecial } = consolidatedCard;
        const quantities = getVariantQuantities(consolidatedCard.fullName);
        const totalOwned = quantities.regular + quantities.foil + quantities.enchanted + quantities.special;
        const setInfo = sets.find(s => s.code === baseCard.setCode);
        
        return (
          <div 
            key={baseCard.id} 
            className={`bg-white p-2 rounded hover:shadow-lg transition-all duration-300 ease-out flex items-center space-x-2 text-xs border border-gray-200 hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer transform-gpu ${
              staleCardIds.has(baseCard.id) ? 'bg-orange-50 border-orange-300' : ''
            }`}
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
              {renderMiniControl(consolidatedCard, 'regular', quantities.regular, consolidatedCard.hasRegular, 'R')}
              {renderMiniControl(consolidatedCard, 'foil', quantities.foil, consolidatedCard.hasFoil, 'F')}
              {hasEnchanted && renderMiniControl(consolidatedCard, 'enchanted', quantities.enchanted, true, 'E')}
              {hasSpecial && renderMiniControl(consolidatedCard, 'special', quantities.special, true, 'S')}
              
              {/* Total */}
              <div className="ml-2 pl-2 border-l border-gray-400">
                <span className="font-semibold text-gray-700">T:{totalOwned}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardListView;