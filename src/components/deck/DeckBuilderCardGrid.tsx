import React from 'react';
import { ConsolidatedCard } from '../../types';
import DeckBuilderCard from './DeckBuilderCard';
import { useDynamicGrid } from '../../hooks';

interface DeckBuilderCardGridProps {
  cards: ConsolidatedCard[];
  getCardQuantityInDeck: (cardId: number) => number;
  getCollectionQuantity: (card: ConsolidatedCard) => number;
  onAddCard: (card: ConsolidatedCard) => void;
  onRemoveCard: (cardId: number) => void;
  canAddCard: (deckQuantity: number) => boolean;
}

const DeckBuilderCardGrid: React.FC<DeckBuilderCardGridProps> = ({
  cards,
  getCardQuantityInDeck,
  getCollectionQuantity,
  onAddCard,
  onRemoveCard,
  canAddCard
}) => {
  const { containerRef, gridStyle } = useDynamicGrid();

  return (
    <div 
      ref={containerRef}
      style={gridStyle}
    >
      {cards.map((consolidatedCard) => {
        const deckQuantity = getCardQuantityInDeck(consolidatedCard.baseCard.id);
        const collectionQuantity = getCollectionQuantity(consolidatedCard);
        const canAdd = canAddCard(deckQuantity);
        
        return (
          <DeckBuilderCard
            key={consolidatedCard.baseCard.id}
            consolidatedCard={consolidatedCard}
            deckQuantity={deckQuantity}
            collectionQuantity={collectionQuantity}
            onAddCard={onAddCard}
            onRemoveCard={onRemoveCard}
            canAdd={canAdd}
          />
        );
      })}
    </div>
  );
};

export default DeckBuilderCardGrid;