import React from 'react';
import { ConsolidatedCard } from '../../types';
import ConsolidatedCardComponent from '../ConsolidatedCard';
import { useDynamicGrid } from '../../hooks';

interface CardGridViewProps {
  cards: ConsolidatedCard[];
  onQuantityChange: (card: ConsolidatedCard, variantType: 'regular' | 'foil' | 'enchanted' | 'special', change: number) => void;
  getVariantQuantities: (fullName: string) => {
    regular: number;
    foil: number;
    enchanted: number;
    special: number;
  };
  onCardClick?: (card: ConsolidatedCard) => void;
}

const CardGridView: React.FC<CardGridViewProps> = ({
  cards,
  onQuantityChange,
  getVariantQuantities,
  onCardClick
}) => {
  const { containerRef, gridStyle } = useDynamicGrid();

  return (
    <div 
      ref={containerRef}
      className="pb-8"
      style={gridStyle}
    >
      {cards.map((consolidatedCard) => {
        const quantities = getVariantQuantities(consolidatedCard.fullName);
        return (
          <div key={consolidatedCard.baseCard.id} className="relative">
            <ConsolidatedCardComponent
              consolidatedCard={consolidatedCard}
              quantities={quantities}
              onQuantityChange={(variantType, change) => 
                onQuantityChange(consolidatedCard, variantType, change)
              }
              onCardClick={onCardClick}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CardGridView;