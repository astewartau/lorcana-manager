-- Add tags array column to user_decks table
ALTER TABLE user_decks
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create a GIN index for efficient array searches
CREATE INDEX idx_user_decks_tags ON user_decks USING GIN (tags);

-- RPC function to search public decks across name, description, and tags
CREATE OR REPLACE FUNCTION search_public_decks(search_term TEXT)
RETURNS SETOF user_decks AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_decks
  WHERE is_public = true
    AND (
      name ILIKE '%' || search_term || '%'
      OR description ILIKE '%' || search_term || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(tags) AS tag
        WHERE tag ILIKE '%' || search_term || '%'
      )
    )
  ORDER BY updated_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_public_decks(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION search_public_decks(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_public_decks(TEXT) TO service_role;
