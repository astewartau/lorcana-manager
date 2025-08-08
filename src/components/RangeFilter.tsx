import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface RangeFilterProps {
  title: string;
  min: number;
  max: number;
  selectedMin: number;
  selectedMax: number;
  onChange: (min: number, max: number) => void;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  step?: number;
}

const RangeFilter: React.FC<RangeFilterProps> = ({
  title,
  min,
  max,
  selectedMin,
  selectedMax,
  onChange,
  isCollapsible = true,
  defaultCollapsed = false,
  step = 1
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const isFiltered = selectedMin !== min || selectedMax !== max;

  const handleReset = () => {
    onChange(min, max);
  };

  return (
    <div className="border-2 border-lorcana-gold rounded-sm bg-white shadow-sm">
      <div 
        className={`flex justify-between items-center p-3 ${isCollapsible ? 'cursor-pointer hover:bg-lorcana-cream' : ''}`}
        onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-lorcana-ink">{title}</h3>
          {isFiltered && (
            <span className="bg-lorcana-gold text-lorcana-ink text-xs font-medium px-2 py-1 rounded-sm">
              {selectedMin}-{selectedMax}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isFiltered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="text-lorcana-navy hover:text-lorcana-ink transition-colors"
              title="Reset range"
            >
              <X size={16} />
            </button>
          )}
          {isCollapsible && (
            isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-lorcana-gold p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-lorcana-ink mb-1">Min</label>
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={selectedMin}
                  onChange={(e) => onChange(Math.max(min, Math.min(parseInt(e.target.value) || min, selectedMax)), selectedMax)}
                  className="w-full px-2 py-1 text-sm border-2 border-lorcana-gold rounded-sm focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy bg-lorcana-cream"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-lorcana-ink mb-1">Max</label>
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={selectedMax}
                  onChange={(e) => onChange(selectedMin, Math.min(max, Math.max(parseInt(e.target.value) || max, selectedMin)))}
                  className="w-full px-2 py-1 text-sm border-2 border-lorcana-gold rounded-sm focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy bg-lorcana-cream"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={selectedMin}
                onChange={(e) => onChange(Math.min(parseInt(e.target.value), selectedMax), selectedMax)}
                className="w-full h-2 bg-lorcana-cream border border-lorcana-gold rounded-sm appearance-none cursor-pointer slider"
              />
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={selectedMax}
                onChange={(e) => onChange(selectedMin, Math.max(parseInt(e.target.value), selectedMin))}
                className="w-full h-2 bg-lorcana-cream border border-lorcana-gold rounded-sm appearance-none cursor-pointer slider"
              />
            </div>
            
            <div className="flex justify-between text-xs text-lorcana-navy">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RangeFilter;