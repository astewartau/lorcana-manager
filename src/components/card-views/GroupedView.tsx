import React from 'react';
import { ConsolidatedCard } from '../../types';
import CardGridView from './CardGridView';
import CardListView from './CardListView';

interface GroupedViewProps {
  groupedCards: Record<string, ConsolidatedCard[]>;
  viewMode: 'grid' | 'list';
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
  onCardClick?: (card: ConsolidatedCard) => void;
}

const GroupedView: React.FC<GroupedViewProps> = ({
  groupedCards,
  viewMode,
  onQuantityChange,
  getVariantQuantities,
  staleCardIds,
  rarityIconMap,
  colorIconMap,
  sets,
  onCardClick
}) => {
  return (
    <div className="space-y-6">
      {Object.entries(groupedCards).map(([groupName, cards]) => (
        <div key={groupName}>
          {/* Group Header */}
          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <h3 className="px-4 text-lg font-semibold text-gray-700 bg-white">{groupName}</h3>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          {/* Cards in this group */}
          {viewMode === 'grid' ? (
            <div className="mb-8">
              <CardGridView
                cards={cards}
                onQuantityChange={onQuantityChange}
                getVariantQuantities={getVariantQuantities}
                onCardClick={onCardClick}
              />
            </div>
          ) : (
            <div className="mb-8">
              <CardListView
                cards={cards}
                onQuantityChange={onQuantityChange}
                getVariantQuantities={getVariantQuantities}
                staleCardIds={staleCardIds}
                rarityIconMap={rarityIconMap}
                colorIconMap={colorIconMap}
                sets={sets}
                onCardClick={onCardClick}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupedView;