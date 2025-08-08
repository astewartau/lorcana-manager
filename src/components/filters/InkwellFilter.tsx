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
    <div className="border-2 border-lorcana-gold rounded-sm bg-white shadow-sm">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-lorcana-cream"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-lorcana-ink">Inkwell</h3>
          {hasFilter && (
            <span className="bg-lorcana-gold text-lorcana-ink text-xs font-medium px-2 py-1 rounded-sm">
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
              className="text-lorcana-navy hover:text-lorcana-ink transition-colors"
              title="Clear filter"
            >
              <X size={16} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-lorcana-gold p-3">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === null}
                onChange={() => onChange(null)}
                className="text-lorcana-navy focus:ring-lorcana-gold"
              />
              <span className="text-sm text-lorcana-ink">All Cards</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === true}
                onChange={() => onChange(true)}
                className="text-lorcana-navy focus:ring-lorcana-gold"
              />
              <span className="text-sm text-lorcana-ink">Inkable Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="inkwell"
                checked={inkwellOnly === false}
                onChange={() => onChange(false)}
                className="text-lorcana-navy focus:ring-lorcana-gold"
              />
              <span className="text-sm text-lorcana-ink">Non-Inkable Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default InkwellFilter;