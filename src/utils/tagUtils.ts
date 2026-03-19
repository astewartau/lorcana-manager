/**
 * Normalize a tag string:
 * - Force lowercase
 * - Replace spaces with dashes
 * - Replace underscores with dashes
 * - Collapse multiple dashes into one
 * - Remove anything that isn't alphanumeric or dash
 * - Trim leading/trailing dashes
 * - Max 30 characters
 */
export function normalizeTag(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

/**
 * Parse a comma/Enter-separated input into an array of normalized, deduplicated tags.
 */
export function parseTags(input: string): string[] {
  const tags = input
    .split(/[,\n]/)
    .map(t => normalizeTag(t.trim()))
    .filter(t => t.length > 0);
  return tags.filter((tag, index) => tags.indexOf(tag) === index);
}
