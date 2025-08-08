import React from 'react';
import { Plus, Minus } from 'lucide-react';
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
  sets: Array<{code: string; name: string; number: number}>;
  onCardClick?: (card: ConsolidatedCard) => void;
}

const CardListView: React.FC<CardListViewProps> = ({
  cards,
  onQuantityChange,
  getVariantQuantities,
  staleCardIds,
  rarityIconMap,
  colorIconMap,
  sets,
  onCardClick
}) => {
  // Get variant background styling like the full view
  const getVariantBackground = (variantType: 'regular' | 'foil' | 'enchanted' | 'special') => {
    switch (variantType) {
      case 'regular':
        return 'bg-lorcana-cream border-lorcana-gold';
      case 'foil':
        return 'bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-300 border-blue-500';
      case 'enchanted':
        return 'bg-gradient-to-r from-pink-200 via-purple-200 to-pink-300 border-pink-500';
      case 'special':
        return 'bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-300 border-orange-500';
      default:
        return 'bg-lorcana-cream border-lorcana-gold';
    }
  };

  // Compact quantity control with proper button styling
  const renderMiniControl = (
    consolidatedCard: ConsolidatedCard,
    variantType: 'regular' | 'foil' | 'enchanted' | 'special',
    quantity: number,
    isAvailable: boolean
  ) => {
    if (!isAvailable) return null;
    return (
      <div className={`flex items-center justify-between px-1.5 py-0.5 rounded border ${getVariantBackground(variantType)} transition-all`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuantityChange(consolidatedCard, variantType, -1);
          }}
          disabled={quantity <= 0}
          className="p-0.5 rounded text-red-600 hover:text-red-800 transition-colors disabled:text-gray-400"
        >
          <Minus size={8} />
        </button>
        <span className="font-semibold text-xs min-w-[1rem] text-center text-lorcana-ink">
          {quantity}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuantityChange(consolidatedCard, variantType, 1);
          }}
          className="p-0.5 rounded text-green-600 hover:text-green-800 transition-colors"
        >
          <Plus size={8} />
        </button>
      </div>
    );
  };

  return (
    <div className="columns-1 xl:columns-2 gap-0">
      {cards.map((consolidatedCard) => {
        const { baseCard, hasEnchanted, hasSpecial } = consolidatedCard;
        const quantities = getVariantQuantities(consolidatedCard.fullName);
        const setInfo = sets.find(s => s.code === baseCard.setCode);
        
        return (
          <div 
            key={baseCard.id} 
            className={`bg-lorcana-navy p-2 rounded-sm hover:shadow-xl transition-all duration-300 ease-out border-2 border-lorcana-gold hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer transform-gpu break-inside-avoid ${
              staleCardIds.has(baseCard.id) ? 'bg-orange-200 border-orange-400' : ''
            }`}
            onClick={() => onCardClick?.(consolidatedCard)}
          >
            {/* Mobile Layout - Two Lines */}
            <div className="sm:hidden">
              {/* First Line - Icons and Name */}
              <div className="flex items-center gap-1.5 text-xs mb-1">
                {/* Set/Card Number */}
                <span className="font-mono text-lorcana-cream font-semibold text-center flex-shrink-0">
                  {setInfo?.number || '?'}/#{baseCard.number}
                </span>
                
                {/* Rarity */}
                {rarityIconMap[baseCard.rarity] && (
                  <img 
                    src={rarityIconMap[baseCard.rarity]} 
                    alt={baseCard.rarity}
                    className="w-4 h-4 flex-shrink-0"
                  />
                )}
                
                {/* Ink Color Icon */}
                {baseCard.color && (
                  <div className="flex-shrink-0 w-5 h-5 relative">
                    {baseCard.color.includes('-') ? (
                      // Dual-ink cards: show both icons split diagonally
                      (() => {
                        const [color1, color2] = baseCard.color.split('-');
                        const icon1 = colorIconMap[color1];
                        const icon2 = colorIconMap[color2];
                        if (icon1 && icon2) {
                          return (
                            <div className="relative w-5 h-5">
                              {/* First color (top-left triangle) */}
                              <div className="absolute inset-0 overflow-hidden">
                                <img 
                                  src={icon1} 
                                  alt={color1}
                                  className="w-5 h-5"
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
                                  className="w-5 h-5"
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
                          className="w-5 h-5"
                        />
                      )
                    )}
                  </div>
                )}
                
                {/* Ink Cost */}
                <div className="relative flex-shrink-0">
                  <img
                    src={baseCard.inkwell ? "/imgs/inkable.png" : "/imgs/uninkable.png"}
                    alt={baseCard.inkwell ? "Inkable" : "Uninkable"}
                    className="w-5 h-5"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {baseCard.cost}
                  </span>
                </div>

                {/* Card Name - Now on first line */}
                <div className="flex-1 min-w-0 truncate">
                  <span className="font-semibold text-white">{baseCard.name}</span>
                  {baseCard.version && (
                    <span className="font-normal italic text-lorcana-cream"> - {baseCard.version}</span>
                  )}
                </div>
              </div>
              
              {/* Second Line - Quantity Controls */}
              <div className="flex items-center gap-1">
                {renderMiniControl(consolidatedCard, 'regular', quantities.regular, consolidatedCard.hasRegular)}
                {renderMiniControl(consolidatedCard, 'foil', quantities.foil, consolidatedCard.hasFoil)}
                {hasEnchanted && renderMiniControl(consolidatedCard, 'enchanted', quantities.enchanted, true)}
                {hasSpecial && renderMiniControl(consolidatedCard, 'special', quantities.special, true)}
              </div>
            </div>

            {/* Desktop Layout - Single Line (Original) */}
            <div className="hidden sm:flex items-center space-x-2 text-xs">
              {/* Set/Card Number */}
              <span className="font-mono text-lorcana-cream font-semibold w-16 text-center">
                {setInfo?.number || '?'}/#{baseCard.number}
              </span>
              
              {/* Rarity */}
              {rarityIconMap[baseCard.rarity] && (
                <img 
                  src={rarityIconMap[baseCard.rarity]} 
                  alt={baseCard.rarity}
                  className="w-4 h-4 flex-shrink-0"
                />
              )}
              
              {/* Ink Color Icon */}
              {baseCard.color && (
                <div className="flex-shrink-0 w-5 h-5 relative">
                  {baseCard.color.includes('-') ? (
                    // Dual-ink cards: show both icons split diagonally
                    (() => {
                      const [color1, color2] = baseCard.color.split('-');
                      const icon1 = colorIconMap[color1];
                      const icon2 = colorIconMap[color2];
                      if (icon1 && icon2) {
                        return (
                          <div className="relative w-5 h-5">
                            {/* First color (top-left triangle) */}
                            <div className="absolute inset-0 overflow-hidden">
                              <img 
                                src={icon1} 
                                alt={color1}
                                className="w-5 h-5"
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
                                className="w-5 h-5"
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
                        className="w-5 h-5"
                      />
                    )
                  )}
                </div>
              )}
              
              {/* Ink Cost */}
              <div className="relative flex-shrink-0">
                <img
                  src={baseCard.inkwell ? "/imgs/inkable.png" : "/imgs/uninkable.png"}
                  alt={baseCard.inkwell ? "Inkable" : "Uninkable"}
                  className="w-5 h-5"
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {baseCard.cost}
                </span>
              </div>

              
              {/* Main Info Section - Flexible Width */}
              <div className="flex-1 flex items-center min-w-0">
                <span className="truncate">
                  <span className="font-semibold text-white">{baseCard.name}</span>
                  {baseCard.version && (
                    <span className="font-normal italic text-lorcana-cream"> - {baseCard.version}</span>
                  )}
                </span>
              </div>
              
              
              {/* Controls Section - Fixed Width */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {renderMiniControl(consolidatedCard, 'regular', quantities.regular, consolidatedCard.hasRegular)}
                {renderMiniControl(consolidatedCard, 'foil', quantities.foil, consolidatedCard.hasFoil)}
                {hasEnchanted && renderMiniControl(consolidatedCard, 'enchanted', quantities.enchanted, true)}
                {hasSpecial && renderMiniControl(consolidatedCard, 'special', quantities.special, true)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardListView;