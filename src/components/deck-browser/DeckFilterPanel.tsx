import React from 'react';
import { RotateCcw, Plus, X } from 'lucide-react';
import { DeckFilterOptions, FranchiseFilter } from '../../types';
import { INK_COLORS, toggleArrayValue } from '../../utils/filterHelpers';
import { COLOR_ICONS } from '../../constants/icons';
import { FilterSection, IconToggle, CheckboxOption } from '../shared/FilterSection';

interface DeckFilterPanelProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: DeckFilterOptions;
  setFilters: (filters: DeckFilterOptions) => void;
  activeFiltersCount: number;
  clearAllFilters: () => void;
  allTags: string[];
  allStories: string[];
}

const DeckFilterPanel: React.FC<DeckFilterPanelProps> = ({
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  activeFiltersCount,
  clearAllFilters,
  allTags,
  allStories,
}) => {
  if (!showFilters) return null;

  const updateFranchiseFilter = (index: number, update: Partial<FranchiseFilter>) => {
    const updated = [...filters.franchiseFilters];
    updated[index] = { ...updated[index], ...update };
    setFilters({ ...filters, franchiseFilters: updated });
  };

  const addFranchiseFilter = () => {
    if (filters.franchiseFilters.length >= 2) return;
    setFilters({
      ...filters,
      franchiseFilters: [...filters.franchiseFilters, { story: '', minPercent: 20 }],
    });
  };

  const removeFranchiseFilter = (index: number) => {
    setFilters({
      ...filters,
      franchiseFilters: filters.franchiseFilters.filter((_, i) => i !== index),
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 lg:bg-opacity-20 z-40"
        onClick={() => setShowFilters(false)}
      />

      <div className={`
        fixed top-0 left-0 z-50
        w-80 sm:w-96 lg:w-80 xl:w-96
        h-screen
        bg-white border-r-2 border-lorcana-gold shadow-2xl
        overflow-y-auto
        transform transition-transform duration-300
        ${showFilters ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="sticky top-0 z-10 bg-white border-b-2 border-lorcana-gold p-4 lg:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-lorcana-ink">Deck Filters</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearAllFilters}
                disabled={activeFiltersCount === 0}
                className={`flex items-center space-x-1 px-3 py-1 text-sm border-2 border-lorcana-gold rounded-sm transition-colors ${
                  activeFiltersCount > 0
                    ? 'text-lorcana-ink hover:text-lorcana-navy hover:bg-lorcana-cream cursor-pointer'
                    : 'text-gray-400 border-gray-300 cursor-not-allowed'
                }`}
              >
                <RotateCcw size={14} />
                <span>Clear All</span>
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-lorcana-navy hover:text-lorcana-ink transition-colors text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-0">
          {/* Ink Color */}
          <FilterSection
            title="Ink Color"
            activeCount={filters.colors.length}
            onClear={() => setFilters({ ...filters, colors: [] })}
          >
            <div className="flex flex-wrap gap-2">
              {INK_COLORS.map(color => (
                <IconToggle
                  key={color}
                  icon={COLOR_ICONS[color]}
                  label={color}
                  isActive={filters.colors.includes(color)}
                  onClick={() => setFilters({ ...filters, colors: toggleArrayValue(filters.colors, color) })}
                />
              ))}
            </div>
          </FilterSection>

          {/* Format */}
          <FilterSection
            title="Format"
            activeCount={filters.format !== 'any' ? 1 : 0}
            onClear={() => setFilters({ ...filters, format: 'any' })}
          >
            <div className="flex gap-2">
              {(['any', 'core', 'infinity'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFilters({ ...filters, format: fmt })}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    filters.format === fmt
                      ? 'bg-lorcana-navy text-white ring-2 ring-lorcana-gold shadow-md'
                      : 'bg-lorcana-cream hover:bg-lorcana-gold/30 border border-lorcana-gold/50 text-lorcana-ink'
                  }`}
                >
                  {fmt === 'any' ? 'Any' : fmt === 'core' ? 'Core' : 'Infinity'}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Tags */}
          {allTags.length > 0 && (
            <FilterSection
              title="Tags"
              activeCount={filters.tags.length}
              onClear={() => setFilters({ ...filters, tags: [] })}
              defaultExpanded={false}
            >
              <div className="max-h-48 overflow-y-auto">
                {allTags.map(tag => (
                  <CheckboxOption
                    key={tag}
                    label={tag}
                    checked={filters.tags.includes(tag)}
                    onChange={() => setFilters({ ...filters, tags: toggleArrayValue(filters.tags, tag) })}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Franchise Percentage */}
          <FilterSection
            title="Franchise %"
            activeCount={filters.franchiseFilters.filter(f => f.story && f.minPercent > 0).length}
            onClear={() => setFilters({ ...filters, franchiseFilters: [] })}
            defaultExpanded={false}
          >
            <div className="space-y-3">
              {filters.franchiseFilters.map((ff, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={ff.story}
                    onChange={(e) => updateFranchiseFilter(index, { story: e.target.value })}
                    className="flex-1 text-sm border border-lorcana-gold/50 rounded-lg px-2 py-1.5 bg-white text-lorcana-ink focus:ring-lorcana-gold focus:border-lorcana-gold"
                  >
                    <option value="">Select franchise...</option>
                    {allStories.map(story => (
                      <option key={story} value={story}>{story}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={ff.minPercent}
                      onChange={(e) => updateFranchiseFilter(index, { minPercent: Number(e.target.value) })}
                      className="w-16 text-sm border border-lorcana-gold/50 rounded-lg px-2 py-1.5 text-center bg-white text-lorcana-ink focus:ring-lorcana-gold focus:border-lorcana-gold"
                    />
                    <span className="text-sm text-lorcana-navy">%</span>
                  </div>
                  <button
                    onClick={() => removeFranchiseFilter(index)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {filters.franchiseFilters.length < 2 && (
                <button
                  onClick={addFranchiseFilter}
                  className="flex items-center gap-1 text-sm text-lorcana-navy hover:text-lorcana-ink transition-colors"
                >
                  <Plus size={14} />
                  <span>Add franchise filter</span>
                </button>
              )}
              {filters.franchiseFilters.length === 0 && (
                <p className="text-xs text-gray-400">
                  Filter decks by minimum percentage of cards from a franchise.
                </p>
              )}
            </div>
          </FilterSection>
        </div>
      </div>
    </>
  );
};

export default DeckFilterPanel;
