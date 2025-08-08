import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://sqrkhwauozrwxqmqvyoi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcmtod2F1b3pyd3hxbXF2eW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjAwNDQsImV4cCI6MjA3MDIzNjA0NH0.tCjss8McZsgQOAuiyLiemgnRq2DseB5M79t7QUOap78'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  USER_COLLECTIONS: 'user_collections',
  USER_DECKS: 'user_decks',
} as const

// Types for Supabase
export interface UserCollection {
  id: string
  user_id: string
  card_name: string
  regular_count: number
  foil_count: number
  enchanted_count: number
  special_count: number
  created_at: string
  updated_at: string
}

export interface UserDeck {
  id: string
  user_id: string
  name: string
  description?: string
  cards: any[] // JSON array of deck cards
  is_public: boolean
  created_at: string
  updated_at: string
}