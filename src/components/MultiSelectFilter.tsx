import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface MultiSelectFilterProps {
  title: string;
  options: string[] | number[];
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  maxHeight?: string;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  iconMap?: Record<string, string>;
  customHeaderContent?: React.ReactNode;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  maxHeight = 'max-h-48',
  isCollapsible = true,
  defaultCollapsed = false,
  iconMap,
  customHeaderContent
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);

  const handleToggle = (value: string | number) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="border-2 border-lorcana-gold rounded-sm bg-white shadow-sm">
      <div 
        className={`flex justify-between items-center p-3 ${isCollapsible ? 'cursor-pointer hover:bg-lorcana-cream' : ''}`}
        onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-lorcana-ink">{title}</h3>
          {selectedValues.length > 0 && (
            <span className="bg-lorcana-gold text-lorcana-ink text-xs font-medium px-2 py-1 rounded-sm">
              {selectedValues.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedValues.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-lorcana-navy hover:text-lorcana-ink transition-colors"
              title="Clear all"
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
        <div className="border-t border-lorcana-gold">
          {customHeaderContent && (
            <div className="p-3 border-b border-gray-100 bg-lorcana-cream">
              {customHeaderContent}
            </div>
          )}
          <div className="p-3 border-b border-lorcana-gold/30 bg-gray-50">
            <button
              onClick={handleSelectAll}
              className="text-sm text-lorcana-navy hover:text-lorcana-ink font-medium"
            >
              {selectedValues.length === options.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className={`${maxHeight} overflow-y-auto`}>
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 p-2 hover:bg-lorcana-cream cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="rounded border-lorcana-gold text-lorcana-navy focus:ring-lorcana-gold"
                />
                {iconMap && iconMap[option.toString()] && (
                  <img 
                    src={iconMap[option.toString()]} 
                    alt={option.toString()}
                    className="w-4 h-4 flex-shrink-0"
                  />
                )}
                <span className="text-sm text-lorcana-ink">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilter;