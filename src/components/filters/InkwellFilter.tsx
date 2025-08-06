import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface InkwellFilterProps {
  inkwellOnly: boolean | null;
  onChange: (inkwellOnly: boolean | null) => void;
  defaultCollapsed?: boolean;
}

const InkwellFilter: React.FC<InkwellFilterProps> = ({
  inkwellOnly,
  onChange,
  defaultCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const hasFilter = inkwellOnly !== null;

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Inkwell</h3>
          {hasFilter && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {inkwellOnly ? 'Inkable' : 'Non-Inkable'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasFilter && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
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
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-3">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === null}
                onChange={() => onChange(null)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">All Cards</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === true}
                onChange={() => onChange(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Inkable Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === false}
                onChange={() => onChange(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Non-Inkable Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default InkwellFilter;