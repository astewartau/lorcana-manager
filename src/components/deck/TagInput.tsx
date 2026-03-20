import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { normalizeTag, getTagCategory, getTagDisplayName, getTagStyle, getKnownCategories } from '../../utils/tagUtils';

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
  placeholder = 'Type tag, then comma or Enter...',
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build suggestions: category prefixes + existing user tags
  const filteredSuggestions = (() => {
    const val = inputValue.trim().toLowerCase();
    if (!val) return [];

    const results: string[] = [];

    // Suggest category prefixes
    if (!val.includes(':')) {
      getKnownCategories().forEach(cat => {
        if (cat.startsWith(val)) {
          results.push(`${cat}:`);
        }
      });
    }

    // Suggest from existing user tags
    const normalized = normalizeTag(val);
    allUserTags.forEach(t => {
      if (t.includes(normalized) && !tags.includes(t) && !results.includes(t)) {
        results.push(t);
      }
    });

    return results.slice(0, 8);
  })();

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag || tag.endsWith(':') || tags.includes(tag) || tags.length >= maxTags) {
      return;
    }
    onChange([...tags, tag]);
    setInputValue('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',');
      parts.slice(0, -1).forEach(part => addTag(part));
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(value);
      setShowSuggestions(value.length > 0);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        const suggestion = filteredSuggestions[highlightedIndex];
        if (suggestion.endsWith(':')) {
          setInputValue(suggestion);
          setHighlightedIndex(-1);
          setShowSuggestions(true);
          return;
        }
        addTag(suggestion);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Container that looks like an input field */}
      <div
        className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 border-2 border-lorcana-gold rounded-sm bg-lorcana-cream focus-within:ring-2 focus-within:ring-lorcana-gold/50 min-h-[38px] cursor-text"
        onClick={(e) => {
          const input = e.currentTarget.querySelector('input');
          input?.focus();
        }}
      >
        {/* Tag chips - keep insertion order */}
        {tags.map(tag => {
          const style = getTagStyle(tag);
          const category = getTagCategory(tag);
          const displayName = getTagDisplayName(tag);

          return (
            <span
              key={tag}
              className={`inline-flex items-center pl-2.5 pr-1 py-0.5 rounded-full text-sm font-medium shadow-sm ${style.bg} ${style.text}`}
            >
              {category && (
                <span className="opacity-60 mr-0.5">{category}:</span>
              )}
              {displayName}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className={`ml-1 p-0.5 rounded-full ${style.hoverBg} transition-colors`}
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        {/* Inline input */}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(true)}
            onBlur={() => {
              if (inputValue.trim() && !inputValue.trim().endsWith(':')) {
                addTag(inputValue);
                setInputValue('');
              }
            }}
            className="flex-1 min-w-[120px] px-1 py-1 bg-transparent text-sm text-lorcana-ink outline-none focus:outline-none focus:ring-0 border-none"
            placeholder={tags.length === 0 ? placeholder : ''}
            aria-label="Add tag"
          />
        )}
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border-2 border-lorcana-gold rounded-sm shadow-lg max-h-32 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => {
            const isCategoryHint = suggestion.endsWith(':');
            return (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (isCategoryHint) {
                    setInputValue(suggestion);
                    setHighlightedIndex(-1);
                    inputRef.current?.focus();
                  } else {
                    addTag(suggestion);
                    inputRef.current?.focus();
                  }
                }}
                className={`w-full text-left px-2 py-1.5 text-sm hover:bg-lorcana-cream transition-colors ${
                  index === highlightedIndex ? 'bg-lorcana-cream' : ''
                }`}
              >
                {isCategoryHint ? (
                  <span className="text-lorcana-purple font-medium">{suggestion}<span className="text-lorcana-ink/40 font-normal ml-1">category</span></span>
                ) : (
                  <TagPillPreview tag={suggestion} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** Tiny inline preview for suggestions dropdown */
const TagPillPreview: React.FC<{ tag: string }> = ({ tag }) => {
  const style = getTagStyle(tag);
  const category = getTagCategory(tag);
  const displayName = getTagDisplayName(tag);
  return (
    <span className={`inline-flex items-center px-2 py-0 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
      {category && <span className="opacity-50 mr-0.5 font-normal">{category}:</span>}
      {displayName}
    </span>
  );
};

export default TagInput;
