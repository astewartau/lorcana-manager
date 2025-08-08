import React from 'react';
import { RotateCcw } from 'lucide-react';
import { FilterOptions } from '../../types';
import { rarities, colors, cardTypes, stories, subtypes, costs, sets, costRange, strengthRange, willpowerRange, loreRange } from '../../data/allCards';
import MultiSelectFilter from '../MultiSelectFilter';
import RangeFilter from '../RangeFilter';
import { CollectionFilter, InkwellFilter, SpecialVariantsFilter } from '../filters';
import { RARITY_ICONS, COLOR_ICONS } from '../../constants/icons';

interface FilterPanelProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  activeFiltersCount: number;
  onClearAllFilters: () => void;
  onClose: () => void;
  rarityIconMap?: Record<string, string>;
  colorIconMap?: Record<string, string>;
  showCollectionFilters?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  activeFiltersCount,
  onClearAllFilters,
  onClose,
  rarityIconMap = RARITY_ICONS,
  colorIconMap = COLOR_ICONS,
  showCollectionFilters = true
}) => {
  return (
    <div className="bg-white border-2 border-lorcana-gold rounded-sm shadow-lg p-6 mb-6 art-deco-corner">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-lorcana-ink">Filters</h3>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAllFilters}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-lorcana-ink hover:text-lorcana-navy border-2 border-lorcana-gold rounded-sm hover:bg-lorcana-cream transition-colors"
            >
              <RotateCcw size={14} />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-lorcana-navy hover:text-lorcana-ink transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MultiSelectFilter
          title="Rarity"
          options={rarities}
          selectedValues={filters.rarities}
          onChange={(values) => setFilters({...filters, rarities: values as string[]})}
          defaultCollapsed={true}
          iconMap={rarityIconMap}
        />
        
        <MultiSelectFilter
          title="Ink Color"
          options={colors.filter(color => color !== '')}
          selectedValues={filters.colors.filter(color => color !== '')}
          onChange={(values) => {
            setFilters({...filters, colors: values as string[]});
          }}
          defaultCollapsed={true}
          iconMap={colorIconMap}
          customHeaderContent={
            <div className="space-y-2">
              <label className="block text-xs font-medium text-lorcana-ink">Color Match Mode</label>
              <select
                value={filters.colorMatchMode}
                onChange={(e) => setFilters({...filters, colorMatchMode: e.target.value as 'any' | 'only' | 'dual-only'})}
                className="w-full text-sm px-2 py-1 border-2 border-lorcana-gold rounded-sm focus:ring-1 focus:ring-lorcana-gold focus:border-lorcana-navy bg-white"
              >
                <option value="any">Match any with colours</option>
                <option value="only">Show only chosen colours</option>
                <option value="dual-only">Show only chosen dual-inks</option>
              </select>
            </div>
          }
        />
        
        <MultiSelectFilter
          title="Type"
          options={cardTypes}
          selectedValues={filters.types}
          onChange={(values) => setFilters({...filters, types: values as string[]})}
          defaultCollapsed={true}
        />
        
        <MultiSelectFilter
          title="Franchise"
          options={stories}
          selectedValues={filters.stories}
          onChange={(values) => setFilters({...filters, stories: values as string[]})}
          maxHeight="max-h-64"
          defaultCollapsed={true}
        />
        
        <MultiSelectFilter
          title="Set"
          options={sets.map(s => s.name)}
          selectedValues={filters.sets.map(setCode => sets.find(s => s.code === setCode)?.name || setCode)}
          onChange={(values) => {
            const setCodes = (values as string[]).map(name => sets.find(s => s.name === name)?.code || name);
            setFilters({...filters, sets: setCodes});
          }}
          defaultCollapsed={true}
        />
        
        <MultiSelectFilter
          title="Subtype"
          options={subtypes}
          selectedValues={filters.subtypes}
          onChange={(values) => setFilters({...filters, subtypes: values as string[]})}
          maxHeight="max-h-64"
          defaultCollapsed={true}
        />
        
        <MultiSelectFilter
          title="Ink Cost"
          options={costs}
          selectedValues={filters.costs}
          onChange={(values) => setFilters({...filters, costs: values as number[]})}
          defaultCollapsed={true}
        />

        <RangeFilter
          title="Cost Range"
          min={costRange.min}
          max={costRange.max}
          selectedMin={filters.costMin}
          selectedMax={filters.costMax}
          onChange={(min, max) => setFilters({...filters, costMin: min, costMax: max})}
          defaultCollapsed={true}
        />
        
        <RangeFilter
          title="Strength"
          min={strengthRange.min}
          max={strengthRange.max}
          selectedMin={filters.strengthMin}
          selectedMax={filters.strengthMax}
          onChange={(min, max) => setFilters({...filters, strengthMin: min, strengthMax: max})}
          defaultCollapsed={true}
        />

        <RangeFilter
          title="Willpower"
          min={willpowerRange.min}
          max={willpowerRange.max}
          selectedMin={filters.willpowerMin}
          selectedMax={filters.willpowerMax}
          onChange={(min, max) => setFilters({...filters, willpowerMin: min, willpowerMax: max})}
          defaultCollapsed={true}
        />
        
        <RangeFilter
          title="Lore"
          min={loreRange.min}
          max={loreRange.max}
          selectedMin={filters.loreMin}
          selectedMax={filters.loreMax}
          onChange={(min, max) => setFilters({...filters, loreMin: min, loreMax: max})}
          defaultCollapsed={true}
        />
        
        {showCollectionFilters && (
          <CollectionFilter
            collectionFilter={filters.collectionFilter}
            cardCountOperator={filters.cardCountOperator}
            cardCountValue={filters.cardCountValue}
            onChange={(collectionFilter, cardCountOperator, cardCountValue) => 
              setFilters({...filters, collectionFilter, cardCountOperator, cardCountValue})
            }
            defaultCollapsed={true}
          />
        )}

        <InkwellFilter
          inkwellOnly={filters.inkwellOnly}
          onChange={(inkwellOnly) => setFilters({...filters, inkwellOnly})}
          defaultCollapsed={true}
        />

        <SpecialVariantsFilter
          hasEnchanted={filters.hasEnchanted}
          hasSpecial={filters.hasSpecial}
          onChange={(hasEnchanted, hasSpecial) => 
            setFilters({...filters, hasEnchanted, hasSpecial})
          }
          defaultCollapsed={true}
        />

        <div className="border-2 border-lorcana-gold rounded-sm bg-white shadow-sm">
          <div className="flex justify-between items-center p-3">
            <h3 className="font-medium text-lorcana-ink">Illumineer's Quest</h3>
          </div>
          <div className="border-t border-lorcana-gold p-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.includeIllumineerQuest}
                onChange={(e) => setFilters({...filters, includeIllumineerQuest: e.target.checked})}
                className="rounded border-lorcana-gold text-lorcana-navy focus:ring-lorcana-gold"
              />
              <span className="text-sm text-lorcana-ink">Include Illumineer's Quest cards</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;