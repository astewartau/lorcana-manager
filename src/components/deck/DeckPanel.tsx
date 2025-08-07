import React, { useState } from 'react';
import { Trash2, Minus, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Deck } from '../../types';

interface DeckPanelProps {
  deck: Deck;
  onRemoveCard: (cardId: number) => void;
  onUpdateQuantity: (cardId: number, quantity: number) => void;
  onClearDeck: () => void;
  validation: { isValid: boolean; errors: string[] };
}

const DeckPanel: React.FC<DeckPanelProps> = ({
  deck,
  onRemoveCard,
  onUpdateQuantity,
  onClearDeck,
  validation
}) => {
  const [groupBy, setGroupBy] = useState<'cost' | 'type' | 'color'>('cost');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const totalCards = deck.cards.reduce((sum, card) => sum + card.quantity, 0);

  // Calculate statistics
  const inkDistribution = deck.cards.reduce((acc, card) => {
    const color = card.color || 'None';
    acc[color] = (acc[color] || 0) + card.quantity;
    return acc;
  }, {} as Record<string, number>);

  const costDistribution = deck.cards.reduce((acc, card) => {
    acc[card.cost] = (acc[card.cost] || 0) + card.quantity;
    return acc;
  }, {} as Record<number, number>);


  const averageCost = deck.cards.length > 0 
    ? (deck.cards.reduce((sum, card) => sum + (card.cost * card.quantity), 0) / totalCards).toFixed(1)
    : '0';

  // Group cards
  const groupedCards = deck.cards.reduce((acc, card) => {
    let groupKey: string;
    switch (groupBy) {
      case 'cost':
        groupKey = `${card.cost} Cost`;
        break;
      case 'type':
        groupKey = card.type;
        break;
      case 'color':
        groupKey = card.color || 'None';
        break;
      default:
        groupKey = 'Other';
    }
    
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(card);
    return acc;
  }, {} as Record<string, typeof deck.cards>);

  // Sort groups
  const sortedGroups = Object.entries(groupedCards).sort(([a], [b]) => {
    if (groupBy === 'cost') {
      const costA = parseInt(a.split(' ')[0]);
      const costB = parseInt(b.split(' ')[0]);
      return costA - costB;
    }
    return a.localeCompare(b);
  });

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

  const toggleGroup = (groupName: string) => {
    setCollapsed(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className="w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Deck Contents</h3>
          <button
            onClick={onClearDeck}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Clear deck"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {/* Card Count */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Cards: {totalCards}/60
            </span>
            <span className="text-sm text-gray-500">
              Avg: {averageCost}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                totalCards === 60 ? 'bg-green-500' : totalCards > 60 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((totalCards / 60) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Validation Status */}
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <ul className="text-xs text-red-600 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-semibold text-sm text-gray-900 mb-3">Statistics</h4>
        
        {/* Ink Distribution */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-700 mb-2">Ink Colors</div>
          <div className="space-y-1">
            {Object.entries(inkDistribution)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([color, count]) => (
                <div key={color} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getInkColorBg(color)}`} />
                    <span className="text-xs text-gray-600">{color}</span>
                  </div>
                  <span className="text-xs font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Cost Distribution */}
        <div className="mb-6">
          <div className="text-xs font-medium text-gray-700 mb-2">Cost Curve</div>
          <div className="flex items-end space-x-1 h-24">
            {Array.from({ length: 8 }, (_, i) => i).map(cost => {
              const actualCost = cost === 7 ? '7+' : cost.toString();
              const count = cost === 7 
                ? Object.entries(costDistribution)
                    .filter(([c]) => parseInt(c) >= 7)
                    .reduce((sum, [, cnt]) => sum + cnt, 0)
                : costDistribution[cost] || 0;
              const maxCount = Math.max(
                ...Object.entries(costDistribution).map(([c, cnt]) => {
                  if (parseInt(c) >= 7) return cnt;
                  return cnt;
                }),
                Object.entries(costDistribution)
                  .filter(([c]) => parseInt(c) >= 7)
                  .reduce((sum, [, cnt]) => sum + cnt, 0)
              );
              // Use pixel height instead of percentage - max height is 64px (h-16 equivalent)
              const maxBarHeight = 64;
              const barHeight = maxCount > 0 && count > 0 
                ? Math.max((count / maxCount) * maxBarHeight, 4)
                : count > 0 ? 4 : 2;
              
              return (
                <div key={cost} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-700 font-medium mb-1 h-4">
                    {count > 0 ? count : ''}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all ${count > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}
                    style={{ height: `${barHeight}px` }}
                    title={`${actualCost} cost: ${count} cards`}
                  />
                  <div className="text-xs text-gray-500 mt-1">{actualCost}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-gray-900">Cards</h4>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'cost' | 'type' | 'color')}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="cost">By Cost</option>
              <option value="type">By Type</option>
              <option value="color">By Color</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {deck.cards.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No cards in deck. Start adding cards to build your deck!
            </div>
          ) : (
            <div className="space-y-1">
              {sortedGroups.map(([groupName, cards]) => {
                const isCollapsed = collapsed[groupName];
                const groupTotal = cards.reduce((sum, card) => sum + card.quantity, 0);
                
                return (
                  <div key={groupName}>
                    <button
                      onClick={() => toggleGroup(groupName)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {isCollapsed ? (
                          <ChevronRight size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {groupName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {groupTotal} cards
                      </span>
                    </button>
                    
                    {!isCollapsed && (
                      <div className="ml-4 space-y-1">
                        {cards
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((card) => (
                            <div key={card.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                              {/* Card Thumbnail */}
                              <div className="w-8 h-10 flex-shrink-0">
                                <img
                                  src={card.images.thumbnail}
                                  alt={card.fullName}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              
                              {/* Card Info */}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {card.name}
                                </div>
                                {card.version && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {card.version}
                                  </div>
                                )}
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs font-bold text-blue-600">{card.cost}</span>
                                  {card.color && (
                                    <div className={`w-3 h-3 rounded-full ${getInkColorBg(card.color)}`} />
                                  )}
                                  <span className="text-xs text-gray-500">{card.type}</span>
                                </div>
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={() => onRemoveCard(card.id)}
                                  className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-800 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-sm font-semibold min-w-[1rem] text-center">
                                  {card.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(card.id, card.quantity + 1)}
                                  disabled={card.quantity >= 4 || totalCards >= 60}
                                  className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckPanel;