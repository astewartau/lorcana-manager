import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface CollectionFilterProps {
  inMyCollection: boolean | null;
  cardCountOperator: 'eq' | 'gte' | 'lte' | null;
  cardCountValue: number;
  onChange: (inMyCollection: boolean | null, cardCountOperator: 'eq' | 'gte' | 'lte' | null, cardCountValue: number) => void;
  defaultCollapsed?: boolean;
}

const CollectionFilter: React.FC<CollectionFilterProps> = ({
  inMyCollection,
  cardCountOperator,
  cardCountValue,
  onChange,
  defaultCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const hasFilter = inMyCollection !== null || cardCountOperator !== null;

  const handleClear = () => {
    onChange(null, null, 1);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Collection</h3>
          {hasFilter && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Active
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
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="collection"
                  checked={inMyCollection === null}
                  onChange={() => onChange(null, cardCountOperator, cardCountValue)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">All Cards</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="collection"
                  checked={inMyCollection === true}
                  onChange={() => onChange(true, cardCountOperator, cardCountValue)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">In My Collection</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="collection"
                  checked={inMyCollection === false}
                  onChange={() => onChange(false, cardCountOperator, cardCountValue)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Not In My Collection</span>
              </label>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Card Count</h4>
              <div className="flex items-center space-x-2">
                <select
                  value={cardCountOperator || ''}
                  onChange={(e) => onChange(
                    inMyCollection,
                    e.target.value === '' ? null : e.target.value as 'eq' | 'gte' | 'lte',
                    cardCountValue
                  )}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="eq">Exactly</option>
                  <option value="gte">At least</option>
                  <option value="lte">At most</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={cardCountValue}
                  onChange={(e) => onChange(inMyCollection, cardCountOperator, parseInt(e.target.value) || 0)}
                  disabled={cardCountOperator === null}
                  className="w-16 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                />
                <span className="text-xs text-gray-600">copies</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionFilter;