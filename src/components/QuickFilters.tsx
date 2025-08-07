import React from 'react';
import { FilterOptions } from '../types';

interface QuickFiltersProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  colorIconMap: Record<string, string>;
  rarityIconMap: Record<string, string>;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  setFilters,
  colorIconMap,
  rarityIconMap
}) => {
  const inkColors = ['Amber', 'Amethyst', 'Emerald', 'Ruby', 'Sapphire', 'Steel'];
  const inkCosts = [1, 2, 3, 4, 5, 6, 7];
  const rarities = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Legendary', 'Enchanted'];

  const toggleColorFilter = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    setFilters({ ...filters, colors: newColors });
  };

  const toggleCostFilter = (cost: number) => {
    if (cost === 7) {
      // Handle 7+ costs (7, 8, 9, 10+)
      const highCosts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      const hasAnyHighCost = highCosts.some(c => filters.costs.includes(c));
      
      if (hasAnyHighCost) {
        // Remove all high costs
        const newCosts = filters.costs.filter(c => !highCosts.includes(c));
        setFilters({ ...filters, costs: newCosts });
      } else {
        // Add all high costs
        const newCosts = [...filters.costs, ...highCosts.filter(c => !filters.costs.includes(c))];
        setFilters({ ...filters, costs: newCosts });
      }
    } else {
      const newCosts = filters.costs.includes(cost)
        ? filters.costs.filter(c => c !== cost)
        : [...filters.costs, cost];
      setFilters({ ...filters, costs: newCosts });
    }
  };

  const toggleRarityFilter = (rarity: string) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter(r => r !== rarity)
      : [...filters.rarities, rarity];
    setFilters({ ...filters, rarities: newRarities });
  };

  const toggleMyCollectionFilter = () => {
    const newInMyCollection = filters.inMyCollection === true ? null : true;
    setFilters({ ...filters, inMyCollection: newInMyCollection });
  };

  const toggleInkwellFilter = (inkwellOnly: boolean) => {
    const newInkwellOnly = filters.inkwellOnly === inkwellOnly ? null : inkwellOnly;
    setFilters({ ...filters, inkwellOnly: newInkwellOnly });
  };

  return (
    <div className="bg-gray-800 rounded-b-lg shadow-md p-2 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* Show any with colours checkbox */}
        <label className="flex items-center space-x-1 text-sm">
          <input
            type="checkbox"
            checked={filters.showAnyWithColors}
            onChange={(e) => setFilters({...filters, showAnyWithColors: e.target.checked})}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Show any with colours</span>
        </label>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600"></div>

        {/* Ink Colors */}
        <div className="flex gap-1">
          {inkColors.map(color => (
            <button
              key={color}
              onClick={() => toggleColorFilter(color)}
              className={`p-1 rounded transition-all hover:scale-110 ${
                filters.colors.includes(color)
                  ? 'bg-blue-500 shadow-lg'
                  : 'bg-transparent hover:bg-gray-700'
              }`}
              title={color}
            >
              <img
                src={colorIconMap[color]}
                alt={color}
                className="w-6 h-6"
              />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600"></div>

        {/* Ink Costs */}
        <div className="flex gap-1">
          {inkCosts.map(cost => {
            const isSelected = cost === 7 
              ? [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].some(c => filters.costs.includes(c))
              : filters.costs.includes(cost);
            
            return (
              <button
                key={cost}
                onClick={() => toggleCostFilter(cost)}
                className={`relative p-1 rounded transition-all hover:scale-110 ${
                  isSelected
                    ? 'bg-blue-500 shadow-lg'
                    : 'bg-transparent hover:bg-gray-700'
                }`}
                title={`Cost ${cost}${cost === 7 ? '+' : ''}`}
              >
                <img
                  src="/imgs/uninkable.png"
                  alt="Ink Cost"
                  className="w-6 h-6"
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {cost === 7 ? '7+' : cost}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600"></div>

        {/* Inkwell */}
        <div className="flex gap-1">
          <button
            onClick={() => toggleInkwellFilter(true)}
            className={`p-1 rounded transition-all hover:scale-110 ${
              filters.inkwellOnly === true
                ? 'bg-blue-500 shadow-lg'
                : 'bg-transparent hover:bg-gray-700'
            }`}
            title="Inkable"
          >
            <img
              src="/imgs/inkable.png"
              alt="Inkable"
              className="w-6 h-6"
            />
          </button>
          <button
            onClick={() => toggleInkwellFilter(false)}
            className={`p-1 rounded transition-all hover:scale-110 ${
              filters.inkwellOnly === false
                ? 'bg-blue-500 shadow-lg'
                : 'bg-transparent hover:bg-gray-700'
            }`}
            title="Uninkable"
          >
            <img
              src="/imgs/uninkable.png"
              alt="Uninkable"
              className="w-6 h-6"
            />
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600"></div>

        {/* Rarities */}
        <div className="flex gap-1">
          {rarities.map(rarity => (
            <button
              key={rarity}
              onClick={() => toggleRarityFilter(rarity)}
              className={`p-1 rounded transition-all hover:scale-110 ${
                filters.rarities.includes(rarity)
                  ? 'bg-blue-500 shadow-lg'
                  : 'bg-transparent hover:bg-gray-700'
              }`}
              title={rarity}
            >
              <img
                src={rarityIconMap[rarity]}
                alt={rarity}
                className="w-6 h-6"
              />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-600"></div>

        {/* My Collection */}
        <label className="flex items-center space-x-1 text-sm">
          <input
            type="checkbox"
            checked={filters.inMyCollection === true}
            onChange={toggleMyCollectionFilter}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">My collection</span>
        </label>
      </div>
    </div>
  );
};

export default QuickFilters;