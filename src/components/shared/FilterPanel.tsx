import React from 'react';
import { RotateCcw } from 'lucide-react';
import { FilterOptions } from '../../types';
import { rarities, colors, cardTypes, stories, subtypes, costs, sets, costRange, strengthRange, willpowerRange, loreRange } from '../../data/allCards';
import MultiSelectFilter from '../MultiSelectFilter';
import RangeFilter from '../RangeFilter';
import { CollectionFilter, InkwellFilter, SpecialVariantsFilter } from '../filters';

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
  rarityIconMap = {},
  colorIconMap = {},
  showCollectionFilters = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAllFilters}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
          options={colors.map(color => color === '' ? 'None' : color)}
          selectedValues={filters.colors.map(color => color === '' ? 'None' : color)}
          onChange={(values) => {
            const actualColors = (values as string[]).map(value => value === 'None' ? '' : value);
            setFilters({...filters, colors: actualColors});
          }}
          defaultCollapsed={true}
          iconMap={colorIconMap}
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
            inMyCollection={filters.inMyCollection}
            cardCountOperator={filters.cardCountOperator}
            cardCountValue={filters.cardCountValue}
            onChange={(inMyCollection, cardCountOperator, cardCountValue) => 
              setFilters({...filters, inMyCollection, cardCountOperator, cardCountValue})
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
      </div>
    </div>
  );
};

export default FilterPanel;