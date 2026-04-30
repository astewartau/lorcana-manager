import React from 'react';
import ReactDOM from 'react-dom';
import { Deck, LorcanaCard } from '../../types';

interface CardWithQuantity extends LorcanaCard {
  quantity: number;
}

interface DeckPrintViewProps {
  deck: Deck;
  cards: CardWithQuantity[];
  mode: 'text' | 'images';
  sortedGroups: [string, CardWithQuantity[]][];
  columns?: number;
}

const DeckPrintView: React.FC<DeckPrintViewProps> = ({ deck, cards, mode, sortedGroups, columns = 4 }) => {
  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

  const content = (
    <div>
      <div className="print-deck-header">
        <h1>{deck.name}</h1>
        {deck.description && <p className="print-deck-description">{deck.description}</p>}
        <p className="print-deck-meta">{totalCards} cards</p>
        {deck.tags && deck.tags.length > 0 && (
          <p className="print-deck-meta">Tags: {deck.tags.join(', ')}</p>
        )}
      </div>

      {mode === 'text' ? (
        <div className="print-card-list">
          {sortedGroups.map(([groupName, groupCards]) => (
            <div key={groupName} className="print-group">
              {groupName !== 'All Cards' && (
                <div className="print-group-header">
                  {groupName} ({groupCards.reduce((s, c) => s + c.quantity, 0)})
                </div>
              )}
              {groupCards.map(card => (
                <div key={card.id} className="print-card-row">
                  <span className="print-card-set">{card.setCode} #{card.number}</span>
                  <span className="print-card-name">{card.fullName}</span>
                  <span className="print-card-qty-text">{card.quantity}x</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {sortedGroups.map(([groupName, groupCards]) => (
            <div key={groupName}>
              {groupName !== 'All Cards' && (
                <div className="print-group-header" style={{ marginTop: '12px', marginBottom: '8px' }}>
                  {groupName} ({groupCards.reduce((s, c) => s + c.quantity, 0)})
                </div>
              )}
              <div className="print-image-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {groupCards.map(card => (
                  <div key={card.id} className="print-card-image">
                    <img src={card.images.full} alt={card.fullName} />
                    <div className="print-card-qty">x{card.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="print-footer">Generated using Lorebook (lorebook.ink)</div>
    </div>
  );

  const printRoot = document.getElementById('print-root');
  if (!printRoot) return null;
  return ReactDOM.createPortal(content, printRoot);
};

export default DeckPrintView;
