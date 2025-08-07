import React from 'react';
import { ConsolidatedCard } from '../../types';
import DeckBuilderCard from './DeckBuilderCard';

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
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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