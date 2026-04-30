import React from 'react';
import { Eye, Copy, User } from 'lucide-react';
import { Deck } from '../types';
import { COLOR_ICONS } from '../constants/icons';
import { useCardData } from '../contexts/CardDataContext';
import { useCollection } from '../contexts/CollectionContext';
import AvatarImage from './AvatarImage';
import { TagPills } from './deck/TagPill';

interface PublishedDeckCardProps {
  deck: Deck;
  authorName?: string;
  onView: (deckId: string) => void;
  onDuplicate?: (deckId: string) => void;
  onViewProfile?: (userId: string) => void;
  canDuplicate?: boolean;
}

const PublishedDeckCard: React.FC<PublishedDeckCardProps> = ({
  deck,
  authorName,
  onView,
  onDuplicate,
  onViewProfile,
  canDuplicate = false
}) => {
  const { allCards } = useCardData();
  const { getCardQuantity } = useCollection();
  const getInkColorBg = (color: string) => {
    switch (color) {
      case 'Amber': return 'bg-yellow-400';
      case 'Amethyst': return 'bg-purple-400';
      case 'Emerald': return 'bg-green-400';
      case 'Ruby': return 'bg-red-400';
      case 'Sapphire': return 'bg-blue-400';
      case 'Steel': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  // Calculate ink colors from deck cards
  const inkDistribution: Record<string, number> = {};
  deck.cards?.forEach(deckCard => {
    const card = allCards.find(c => c.id === deckCard.cardId);
    if (card && card.color) {
      // Only count primary colors, not dual colors
      const primaryColors = ['Amber', 'Amethyst', 'Emerald', 'Ruby', 'Sapphire', 'Steel'];
      if (primaryColors.includes(card.color)) {
        inkDistribution[card.color] = (inkDistribution[card.color] || 0) + deckCard.quantity;
      }
    }
  });

  const inkColors = Object.entries(inkDistribution)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const cardCount = deck.cards?.reduce((sum, c) => sum + c.quantity, 0) || 0;

  // Calculate collection coverage percentage
  const calculateCollectionCoverage = () => {
    if (!deck.cards || deck.cards.length === 0) return 0;
    
    let totalCardsNeeded = 0;
    let totalCardsOwned = 0;
    
    deck.cards.forEach(deckCard => {
      const cardNeeded = deckCard.quantity;
      const cardQuantities = getCardQuantity(deckCard.cardId);
      const cardOwned = cardQuantities.total;
      
      totalCardsNeeded += cardNeeded;
      totalCardsOwned += Math.min(cardOwned, cardNeeded); // Cap at what's needed
    });
    
    return totalCardsNeeded > 0 ? (totalCardsOwned / totalCardsNeeded) * 100 : 0;
  };

  const collectionCoverage = calculateCollectionCoverage();


  return (
    <div className="card-lorcana art-deco-corner group">
      {/* Header with deck name and author */}
      <div className="p-4 border-b border-lorcana-gold/20">
        <div className="flex items-start justify-between mb-2">
          {/* Avatar area */}
          <div className="flex-shrink-0 mr-3">
            <div className="relative">
              {deck.avatar ? (
                <AvatarImage
                  cardId={deck.avatar.cardId}
                  cropData={deck.avatar.cropData}
                  className="w-16 h-16 rounded-full border-2 border-lorcana-gold"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-lorcana-gold overflow-hidden">
                  <img
                    src="/imgs/lorebook-icon-profile.png"
                    alt="Default Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Ink colors and card count */}
            <div className="flex items-center space-x-2 mb-1">
              {inkColors.length > 0 && (
                <div className="flex space-x-1">
                  {inkColors.map(([color]) => (
                    <div
                      key={color}
                      className="flex items-center"
                      title={color}
                    >
                      {COLOR_ICONS[color] ? (
                        <img
                          src={COLOR_ICONS[color]}
                          alt={color}
                          className="w-5 h-5"
                        />
                      ) : (
                        <div className={`w-4 h-4 rounded-full ${getInkColorBg(color)} border-2 border-white shadow-sm`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-1 text-lorcana-navy">
                <Copy size={14} />
                <span className="text-xs font-medium">{cardCount}</span>
              </div>
            </div>

            {/* Deck name */}
            <h3
              className="text-lg font-bold text-lorcana-ink cursor-pointer hover:text-lorcana-navy transition-colors truncate"
              onClick={() => onView(deck.id)}
            >
              {deck.name}
            </h3>

            {/* Author information and updated date */}
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-lorcana-navy">by</p>
              {deck.userId && onViewProfile ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(deck.userId!);
                  }}
                  className="flex items-center space-x-1 text-xs text-lorcana-gold hover:text-lorcana-navy hover:underline transition-colors"
                >
                  <User size={12} />
                  <span>{authorName || 'Unknown'}</span>
                </button>
              ) : (
                <span className="text-xs text-lorcana-navy flex items-center space-x-1">
                  <User size={12} />
                  <span>{authorName || 'Unknown'}</span>
                </span>
              )}
              <span className="text-xs text-lorcana-navy/50">·</span>
              <span className="text-xs text-lorcana-navy/70">
                {new Date(deck.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {deck.description && (
          <p className="text-sm text-lorcana-navy line-clamp-2">{deck.description}</p>
        )}

        {/* Tags */}
        {deck.tags && deck.tags.length > 0 && (
          <TagPills tags={deck.tags} className="mt-2" />
        )}

        {/* Collection coverage progress bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-lorcana-cream border border-lorcana-gold/40 rounded-sm overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                collectionCoverage >= 100
                  ? 'bg-green-500'
                  : collectionCoverage >= 75
                  ? 'bg-lorcana-gold'
                  : collectionCoverage >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(collectionCoverage, 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-lorcana-navy whitespace-nowrap">
            {collectionCoverage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(deck.id);
            }}
            className="btn-lorcana-gold-sm flex items-center gap-1 flex-1 min-w-0 justify-center"
          >
            <Eye size={14} />
            <span className="truncate">View Deck</span>
          </button>
          
          {canDuplicate && onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(deck.id);
              }}
              className="btn-lorcana-navy-sm flex items-center gap-1"
              title="Copy to My Decks"
            >
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishedDeckCard;