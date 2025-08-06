import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterHeaderProps {
  title: string;
  isExpanded: boolean;
  hasFilter: boolean;
  activeLabel?: string;
  onToggle: () => void;
  onClear: () => void;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({
  title,
  isExpanded,
  hasFilter,
  activeLabel,
  onToggle,
  onClear,
}) => {
  return (
    <div 
      className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
      onClick={onToggle}
    >
      <div className="flex items-center space-x-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {hasFilter && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {activeLabel || 'Active'}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {hasFilter && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear filter"
          >
            <X size={16} />
          </button>
        )}
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
    </div>
  );
};

export default FilterHeader;