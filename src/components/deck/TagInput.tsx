import React, { useState, useRef, useEffect } from 'react';
import { X as XIcon } from 'lucide-react';
import { normalizeTag } from '../../utils/tagUtils';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  allUserTags?: string[];
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  allUserTags = [],
  placeholder = 'Add tag...',
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (tag && !tags.includes(tag) && tags.length < maxTags) {
      onChange([...tags, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Don't allow commas in the input (they're a delimiter)
    if (val.includes(',')) {
      const parts = val.split(',');
      parts.forEach(part => {
        if (part.trim()) addTag(part);
      });
      return;
    }
    setInputValue(val);
    setShowSuggestions(val.length > 0);
  };

  // Filter suggestions: match prefix, exclude already-added tags
  const suggestions = inputValue.trim()
    ? allUserTags.filter(
        t => t.startsWith(normalizeTag(inputValue)) && !tags.includes(t)
      ).slice(0, 5)
    : [];

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs font-medium text-lorcana-navy mb-1 block">Tags</label>
      <div className="flex flex-wrap gap-1 mb-1">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-lorcana-navy text-lorcana-gold px-2 py-0.5 rounded-sm text-xs"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-white transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <XIcon size={10} />
            </button>
          </span>
        ))}
      </div>
      {tags.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full text-xs border-2 border-lorcana-gold rounded-sm px-2 py-1 bg-lorcana-cream focus:outline-none focus:ring-2 focus:ring-lorcana-gold"
          aria-label="Add tag"
        />
      )}

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-lorcana-gold rounded-sm shadow-lg max-h-32 overflow-y-auto">
          {suggestions.map(suggestion => (
            <button
              key={suggestion}
              onClick={() => addTag(suggestion)}
              className="block w-full text-left px-2 py-1 text-xs hover:bg-lorcana-cream transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
