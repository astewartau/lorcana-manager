import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface SpecialVariantsFilterProps {
  hasEnchanted: boolean | null;
  hasSpecial: boolean | null;
  onChange: (hasEnchanted: boolean | null, hasSpecial: boolean | null) => void;
  defaultCollapsed?: boolean;
}

const SpecialVariantsFilter: React.FC<SpecialVariantsFilterProps> = ({
  hasEnchanted,
  hasSpecial,
  onChange,
  defaultCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const hasFilter = hasEnchanted !== null || hasSpecial !== null;

  const handleClear = () => {
    onChange(null, null);
  };

  return (
    <div className="border-2 border-lorcana-gold rounded-sm bg-white shadow-sm">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-lorcana-cream"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-lorcana-ink">Special Variants</h3>
          {hasFilter && (
            <span className="bg-lorcana-gold text-lorcana-ink text-xs font-medium px-2 py-1 rounded-sm">
              {[hasEnchanted && 'E', hasSpecial && 'S'].filter(Boolean).join(', ')}
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
                type="checkbox"
                checked={hasEnchanted === true}
                onChange={(e) => onChange(e.target.checked ? true : null, hasSpecial)}
                className="text-lorcana-navy focus:ring-lorcana-gold"
              />
              <span className="text-sm text-lorcana-ink">Has Enchanted Version</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSpecial === true}
                onChange={(e) => onChange(hasEnchanted, e.target.checked ? true : null)}
                className="text-lorcana-navy focus:ring-lorcana-gold"
              />
              <span className="text-sm text-lorcana-ink">Has Special Version</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialVariantsFilter;