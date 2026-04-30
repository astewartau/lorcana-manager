import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

// Reusable collapsible section component
export interface FilterSectionProps {
  title: string;
  activeCount?: number;
  onClear?: () => void;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  activeCount = 0,
  onClear,
  defaultExpanded = true,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-lorcana-gold/40 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 px-1 hover:bg-lorcana-cream/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-lorcana-ink text-sm">{title}</span>
          {activeCount > 0 && (
            <span className="bg-lorcana-gold text-lorcana-ink text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && onClear && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-lorcana-navy hover:text-lorcana-ink transition-colors p-1"
              title="Clear"
            >
              <X size={14} />
            </span>
          )}
          {isExpanded ? (
            <ChevronUp size={16} className="text-lorcana-navy" />
          ) : (
            <ChevronDown size={16} className="text-lorcana-navy" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="pb-4 px-1">
          {children}
        </div>
      )}
    </div>
  );
};

// Icon button for ink colors and similar visual filters
export interface IconToggleProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
  available?: boolean;
  count?: number;
}

export const IconToggle: React.FC<IconToggleProps> = ({ icon, label, isActive, onClick, size = 'md', available = true, count }) => {
  const sizeClasses = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const imgSizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={onClick}
        className={`
          ${sizeClasses} rounded-lg flex items-center justify-center transition-all
          ${isActive
            ? 'bg-lorcana-navy ring-2 ring-lorcana-gold shadow-md scale-105'
            : available
              ? 'bg-lorcana-cream hover:bg-lorcana-gold/30 border border-lorcana-gold/50'
              : 'bg-gray-100 border border-gray-200 opacity-40'
          }
        `}
        title={label}
      >
        <img src={icon} alt={label} className={`${imgSizeClasses} ${!available && !isActive ? 'grayscale' : ''}`} />
      </button>
      {count !== undefined && (
        <span className={`text-[10px] font-medium ${available ? 'text-lorcana-navy' : 'text-gray-400'}`}>
          {count}
        </span>
      )}
    </div>
  );
};

// Checkbox option component
export interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  icon?: string;
  available?: boolean;
  count?: number;
}

export const CheckboxOption: React.FC<CheckboxOptionProps> = ({ label, checked, onChange, icon, available = true, count }) => (
  <label className={`flex items-center gap-2 py-1.5 px-2 rounded transition-colors ${
    available
      ? 'hover:bg-lorcana-cream/50 cursor-pointer'
      : 'opacity-40 cursor-pointer'
  }`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-lorcana-gold text-lorcana-navy focus:ring-lorcana-gold focus:ring-offset-0"
    />
    {icon && <img src={icon} alt="" className={`w-4 h-4 ${!available ? 'grayscale' : ''}`} />}
    <span className={`text-sm flex-1 ${available ? 'text-lorcana-ink' : 'text-gray-400'}`}>{label}</span>
    {count !== undefined && (
      <span className={`text-xs ${available ? 'text-lorcana-navy' : 'text-gray-400'}`}>
        {count}
      </span>
    )}
  </label>
);
