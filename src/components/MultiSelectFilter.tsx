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
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  maxHeight = 'max-h-48',
  isCollapsible = true,
  defaultCollapsed = false,
  iconMap
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
    <div className="border border-gray-200 rounded-lg bg-white">
      <div 
        className={`flex justify-between items-center p-3 ${isCollapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {selectedValues.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
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
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
        <div className="border-t border-gray-200">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedValues.length === options.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className={`${maxHeight} overflow-y-auto`}>
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {iconMap && iconMap[option.toString()] && (
                  <img 
                    src={iconMap[option.toString()]} 
                    alt={option.toString()}
                    className="w-4 h-4 flex-shrink-0"
                  />
                )}
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilter;