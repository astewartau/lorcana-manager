import React from 'react';
import { getTagCategory, getTagDisplayName, getTagStyle, sortTags } from '../../utils/tagUtils';

/** A single read-only tag pill with category-aware coloring. */
export const TagPill: React.FC<{ tag: string }> = ({ tag }) => {
  const style = getTagStyle(tag);
  const category = getTagCategory(tag);
  const displayName = getTagDisplayName(tag);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${style.bg} ${style.text}`}>
      {category && <span className="opacity-50 mr-0.5 font-normal">{category}:</span>}
      {displayName}
    </span>
  );
};

/** Render a sorted list of tag pills. */
export const TagPills: React.FC<{ tags: string[]; className?: string }> = ({ tags, className = '' }) => {
  if (!tags || tags.length === 0) return null;

  const sorted = sortTags(tags);

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {sorted.map(tag => (
        <TagPill key={tag} tag={tag} />
      ))}
    </div>
  );
};
