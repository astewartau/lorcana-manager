import React, { useState } from 'react';
import { Trash2, Minus, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Deck } from '../../types';
import { useCollection } from '../../contexts/CollectionContext';

interface DeckPanelProps {
  deck: Deck;
  onRemoveCard: (cardId: number) => void;
  onUpdateQuantity: (cardId: number, quantity: number) => void;
  onClearDeck: () => void;
  validation: { isValid: boolean; errors: string[] };
  isCollapsed?: boolean;
}

const DeckPanel: React.FC<DeckPanelProps> = ({
  deck,
  onRemoveCard,
  onUpdateQuantity,
  onClearDeck,
  validation,
  isCollapsed = false
}) => {
  const { getVariantQuantities } = useCollection();
  const [groupBy, setGroupBy] = useState<'cost' | 'type' | 'color'>('cost');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [statisticsCollapsed, setStatisticsCollapsed] = useState(false);
  const [cardsCollapsed, setCardsCollapsed] = useState(false);
  const [imagePreview, setImagePreview] = useState<{
    show: boolean;
    x: number;
    y: number;
    imageUrl: string;
  }>({ show: false, x: 0, y: 0, imageUrl: '' });

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

  // Calculate color distribution by cost
  const costColorDistribution = deck.cards.reduce((acc, card) => {
    const cost = card.cost;
    const color = card.color || 'None';
    
    if (!acc[cost]) acc[cost] = {};
    acc[cost][color] = (acc[cost][color] || 0) + card.quantity;
    return acc;
  }, {} as Record<number, Record<string, number>>);


  const averageCost = deck.cards.length > 0 
    ? (deck.cards.reduce((sum, card) => sum + (card.cost * card.quantity), 0) / totalCards).toFixed(1)
    : '0';

  // Additional statistics for pie charts
  const inkableDistribution = deck.cards.reduce((acc, card) => {
    const key = card.inkwell ? 'Inkable' : 'Uninkable';
    acc[key] = (acc[key] || 0) + card.quantity;
    return acc;
  }, {} as Record<string, number>);

  const typeDistribution = deck.cards.reduce((acc, card) => {
    const type = card.type || 'Unknown';
    acc[type] = (acc[type] || 0) + card.quantity;
    return acc;
  }, {} as Record<string, number>);

  const storyDistribution = deck.cards.reduce((acc, card) => {
    const story = card.story || 'Unknown';
    acc[story] = (acc[story] || 0) + card.quantity;
    return acc;
  }, {} as Record<string, number>);

  const setDistribution = deck.cards.reduce((acc, card) => {
    const setCode = card.setCode || 'Unknown';
    acc[setCode] = (acc[setCode] || 0) + card.quantity;
    return acc;
  }, {} as Record<string, number>);

  const rarityDistribution = deck.cards.reduce((acc, card) => {
    const rarity = card.rarity || 'Unknown';
    acc[rarity] = (acc[rarity] || 0) + card.quantity;
    return acc;
  }, {} as Record<string, number>);

  const collectionDistribution = deck.cards.reduce((acc, card) => {
    // Check if card is in collection
    const variantQuantities = getVariantQuantities(card.fullName);
    const totalInCollection = variantQuantities.regular + variantQuantities.foil + 
                             variantQuantities.enchanted + variantQuantities.special;
    
    const key = totalInCollection > 0 ? 'In Collection' : 'Not in Collection';
    acc[key] = (acc[key] || 0) + card.quantity;
    return acc;
  }, {} as Record<string, number>);

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

  const getInkColorHex = (color: string) => {
    switch (color) {
      case 'Amber': return '#fbbf24'; // yellow-400
      case 'Amethyst': return '#a855f7'; // purple-500
      case 'Emerald': return '#22c55e'; // green-500
      case 'Ruby': return '#ef4444'; // red-500
      case 'Sapphire': return '#3b82f6'; // blue-500
      case 'Steel': return '#6b7280'; // gray-500
      default: return '#d1d5db'; // gray-300
    }
  };

  const toggleGroup = (groupName: string) => {
    setCollapsed(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // State for custom tooltip
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: '' });

  // Compact pie chart component with instant custom tooltips
  const PieChart: React.FC<{
    data: Record<string, number>;
    title: string;
    colors: string[];
  }> = ({ data, title, colors }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    if (total === 0) return null;

    const dataEntries = Object.entries(data).filter(([, value]) => value > 0);
    
    // Special case: if only one category, show as full circle
    if (dataEntries.length === 1) {
      const [key, value] = dataEntries[0];
      const color = colors[0];
      const radius = 20;
      const centerX = 25;
      const centerY = 25;
      
      return (
        <div className="flex flex-col items-center">
          <div className="text-xs font-medium text-gray-700 mb-1">{title}</div>
          <svg width="50" height="50" viewBox="0 0 50 50" className="cursor-pointer">
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill={color}
              stroke="white"
              strokeWidth="1"
              className="hover:opacity-80 transition-opacity"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  show: true,
                  x: rect.left + rect.width / 2,
                  y: rect.top - 10,
                  content: `${key}: ${value} cards (100.0%)`
                });
              }}
              onMouseLeave={() => setTooltip({ show: false, x: 0, y: 0, content: '' })}
            />
          </svg>
        </div>
      );
    }

    let cumulativePercentage = 0;
    const segments = dataEntries.map(([key, value], index) => {
      const percentage = (value / total) * 100;
      const startAngle = cumulativePercentage * 3.6; // Convert to degrees
      const endAngle = (cumulativePercentage + percentage) * 3.6;
      
      cumulativePercentage += percentage;
      
      const color = colors[index % colors.length];
      
      // Create SVG arc path
      const radius = 20;
      const centerX = 25;
      const centerY = 25;
      
      const startAngleRad = (startAngle - 90) * (Math.PI / 180);
      const endAngleRad = (endAngle - 90) * (Math.PI / 180);
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      const largeArc = percentage > 50 ? 1 : 0;
      
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      return {
        key,
        value,
        percentage: percentage.toFixed(1),
        pathData,
        color
      };
    });

    const handleMouseEnter = (e: React.MouseEvent, segment: typeof segments[0]) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        content: `${segment.key}: ${segment.value} cards (${segment.percentage}%)`
      });
    };

    const handleMouseLeave = () => {
      setTooltip({ show: false, x: 0, y: 0, content: '' });
    };

    return (
      <div className="flex flex-col items-center">
        <div className="text-xs font-medium text-gray-700 mb-1">{title}</div>
        <svg width="50" height="50" viewBox="0 0 50 50" className="cursor-pointer">
          {segments.map(segment => (
            <path
              key={segment.key}
              d={segment.pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
              className="hover:opacity-80 transition-opacity"
              onMouseEnter={(e) => handleMouseEnter(e, segment)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </svg>
      </div>
    );
  };

  return (
    <>
      {/* Custom Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none"
          style={{
            left: tooltip.x - 50, // Center the tooltip
            top: tooltip.y,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Image Preview */}
      {imagePreview.show && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: imagePreview.x + 10,
            top: imagePreview.y - 200,
          }}
        >
          <img
            src={imagePreview.imageUrl}
            alt="Card preview"
            className="w-48 h-auto rounded-lg shadow-2xl border-2 border-white"
          />
        </div>
      )}

      <div className="w-full bg-white shadow-lg border-l border-gray-200 flex flex-col h-screen overflow-hidden">
        {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
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

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Statistics */}
        <div className="border-b border-gray-200">
        <button
          onClick={() => setStatisticsCollapsed(!statisticsCollapsed)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h4 className="font-semibold text-sm text-gray-900">Statistics</h4>
          {statisticsCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
        
        {!statisticsCollapsed && (
          <div className="px-4 pb-4">
        
        {/* Pie Charts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <PieChart 
            data={inkableDistribution} 
            title="Inkwell"
            colors={['#10b981', '#ef4444']} // green for inkable, red for uninkable
          />
          
          <PieChart 
            data={typeDistribution} 
            title="Types"
            colors={['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316']} // blue, amber, purple, cyan, orange
          />
          
          <PieChart 
            data={collectionDistribution} 
            title="Collection"
            colors={['#10b981', '#ef4444']} // green for in collection, red for not in collection
          />
          
          <PieChart 
            data={rarityDistribution} 
            title="Rarity"
            colors={['#6b7280', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899']} // gray, green, blue, purple, amber, pink
          />
          
          <PieChart 
            data={storyDistribution} 
            title="Story"
            colors={['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']}
          />
          
          <PieChart 
            data={inkDistribution} 
            title="Ink"
            colors={Object.keys(inkDistribution).map(color => getInkColorHex(color))} // Use actual ink colors
          />
          
          <PieChart 
            data={setDistribution} 
            title="Set"
            colors={['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db']}
          />
        </div>

        {/* Cost Distribution */}
        <div className="mb-6">
          <div className="text-xs font-medium text-gray-700 mb-2">Cost Curve</div>
          <div className="flex items-end space-x-1 h-24">
            {Array.from({ length: 8 }, (_, i) => i).map(cost => {
              const actualCost = cost === 7 ? '7+' : cost.toString();
              
              // Get color distribution for this cost
              let colorCounts: Record<string, number> = {};
              if (cost === 7) {
                // Aggregate all costs 7 and above
                Object.entries(costColorDistribution)
                  .filter(([c]) => parseInt(c) >= 7)
                  .forEach(([, colors]) => {
                    Object.entries(colors).forEach(([color, count]) => {
                      colorCounts[color] = (colorCounts[color] || 0) + count;
                    });
                  });
              } else {
                colorCounts = costColorDistribution[cost] || {};
              }
              
              const totalCount = Object.values(colorCounts).reduce((sum, count) => sum + count, 0);
              
              // Calculate max count across all costs for scaling
              const maxCount = Math.max(
                ...Object.entries(costDistribution).map(([c, cnt]) => {
                  if (parseInt(c) >= 7) return cnt;
                  return cnt;
                }),
                Object.entries(costDistribution)
                  .filter(([c]) => parseInt(c) >= 7)
                  .reduce((sum, [, cnt]) => sum + cnt, 0)
              );
              
              const maxBarHeight = 64;
              const totalBarHeight = maxCount > 0 && totalCount > 0 
                ? Math.max((totalCount / maxCount) * maxBarHeight, 4)
                : totalCount > 0 ? 4 : 2;
              
              // Create stacked segments
              const colorEntries = Object.entries(colorCounts).sort(([a], [b]) => a.localeCompare(b));
              let currentHeight = 0;
              
              return (
                <div key={cost} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-700 font-medium mb-1 h-4">
                    {totalCount > 0 ? totalCount : ''}
                  </div>
                  <div className="w-full relative" style={{ height: `${totalBarHeight}px` }}>
                    {totalCount > 0 ? (
                      colorEntries.map(([color, count], index) => {
                        const segmentHeight = (count / totalCount) * totalBarHeight;
                        const segment = (
                          <div
                            key={`${cost}-${color}`}
                            className="w-full absolute transition-all"
                            style={{
                              height: `${segmentHeight}px`,
                              bottom: `${currentHeight}px`,
                              backgroundColor: getInkColorHex(color),
                              borderTopLeftRadius: index === colorEntries.length - 1 ? '4px' : '0',
                              borderTopRightRadius: index === colorEntries.length - 1 ? '4px' : '0'
                            }}
                            title={`${actualCost} cost ${color}: ${count} cards`}
                          />
                        );
                        currentHeight += segmentHeight;
                        return segment;
                      })
                    ) : (
                      <div
                        className="w-full absolute bg-gray-200 rounded-t"
                        style={{ height: `${totalBarHeight}px`, bottom: '0px' }}
                        title={`${actualCost} cost: 0 cards`}
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{actualCost}</div>
                </div>
              );
            })}
          </div>
        </div>
          </div>
        )}
      </div>

        {/* Card List */}
        <div className="flex flex-col">
        <div className="border-b border-gray-200">
          <button
            onClick={() => setCardsCollapsed(!cardsCollapsed)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-semibold text-sm text-gray-900">Cards</h4>
            <div className="flex items-center space-x-2">
              {!cardsCollapsed && (
                <select
                  value={groupBy}
                  onChange={(e) => {
                    e.stopPropagation();
                    setGroupBy(e.target.value as 'cost' | 'type' | 'color');
                  }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="cost">By Cost</option>
                  <option value="type">By Type</option>
                  <option value="color">By Color</option>
                </select>
              )}
              {cardsCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </button>
        </div>

        {!cardsCollapsed && (
          <div className="overflow-y-auto max-h-96">
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
                                  className="w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setImagePreview({
                                      show: true,
                                      x: rect.right,
                                      y: rect.top,
                                      imageUrl: card.images.full
                                    });
                                  }}
                                  onMouseLeave={() => setImagePreview({ show: false, x: 0, y: 0, imageUrl: '' })}
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
        )}
        </div>
      </div>
    </div>
    </>
  );
};

export default DeckPanel;