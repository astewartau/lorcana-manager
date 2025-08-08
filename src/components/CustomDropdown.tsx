import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onChange,
  className = '',
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`custom-dropdown relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full
          ${compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'}
          border-2 border-lorcana-gold rounded-sm
          bg-lorcana-cream text-lorcana-ink
          hover:bg-white hover:border-lorcana-navy
          focus:ring-2 focus:ring-lorcana-gold focus:border-lorcana-navy
          transition-all duration-200
          shadow-sm hover:shadow-md
        `}
        type="button"
      >
        <span className="truncate">{selectedOption?.label || 'Select...'}</span>
        {isOpen ? (
          <ChevronUp size={compact ? 12 : 16} className="ml-1 flex-shrink-0" />
        ) : (
          <ChevronDown size={compact ? 12 : 16} className="ml-1 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className={`
          dropdown-menu absolute z-[9999] w-full mt-1
          bg-white border-2 border-lorcana-gold rounded-sm shadow-xl
          ${compact ? 'text-xs' : 'text-sm'}
        `}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                dropdown-option w-full text-left px-3 py-2
                hover:bg-lorcana-gold hover:text-lorcana-ink
                transition-all duration-150
                ${value === option.value 
                  ? 'bg-lorcana-navy text-lorcana-gold font-semibold shadow-inner' 
                  : 'text-lorcana-ink'
                }
                ${compact ? 'py-1.5' : 'py-2'}
                first:rounded-t-sm last:rounded-b-sm
                relative overflow-hidden
              `}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;