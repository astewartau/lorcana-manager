import React from 'react';
import { ConsolidatedCard } from '../../types';
import ConsolidatedCardComponent from '../ConsolidatedCard';

interface CardGridViewProps {
  cards: ConsolidatedCard[];
  onQuantityChange: (card: ConsolidatedCard, variantType: 'regular' | 'foil' | 'enchanted' | 'special', change: number) => void;
  getVariantQuantities: (fullName: string) => {
    regular: number;
    foil: number;
    enchanted: number;
    special: number;
  };
}

const CardGridView: React.FC<CardGridViewProps> = ({
  cards,
  onQuantityChange,
  getVariantQuantities
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-8">
      {cards.map((consolidatedCard) => {
        const quantities = getVariantQuantities(consolidatedCard.fullName);
        return (
          <div key={consolidatedCard.baseCard.id} className="relative mb-3">
            <ConsolidatedCardComponent
              consolidatedCard={consolidatedCard}
              quantities={quantities}
              onQuantityChange={(variantType, change) => 
                onQuantityChange(consolidatedCard, variantType, change)
              }
            />
          </div>
        );
      })}
    </div>
  );
};

export default CardGridView;