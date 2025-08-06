export interface LorcanaCard {
  id: number;
  name: string;
  version?: string;
  fullName: string;
  setCode: string;
  number: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Legendary' | 'Enchanted' | 'Special';
  color: 'Amber' | 'Amethyst' | 'Emerald' | 'Ruby' | 'Sapphire' | 'Steel' | '';
  cost: number;
  type: 'Character' | 'Action' | 'Item' | 'Song' | 'Location';
  strength?: number;
  willpower?: number;
  lore?: number;
  inkwell: boolean;
  abilities?: any[];
  flavorText?: string;
  artists?: string[];
  images: {
    full: string;
    thumbnail: string;
    foilMask?: string;
  };
  story?: string;
  subtypes?: string[];
  foilTypes?: string[];
}

export interface CollectionCard extends LorcanaCard {
  quantity: number;
  foil: boolean;
}

export interface ConsolidatedCard {
  baseCard: LorcanaCard;  // Always the regular version for display
  variants: {
    regular: LorcanaCard | null;
    foil: LorcanaCard | null; 
    enchanted: LorcanaCard | null;
    special: LorcanaCard[] | null; // Multiple special versions possible
  };
  fullName: string;
  hasEnchanted: boolean;
  hasSpecial: boolean;
}

export interface CollectionCardVariants {
  cardId: number; // Base card ID
  fullName: string;
  regular: number; // Quantity of regular non-foil
  foil: number;    // Quantity of regular foil  
  enchanted: number; // Quantity of enchanted
  special: number;   // Quantity of special/promo
}

export interface DeckCard extends LorcanaCard {
  quantity: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: DeckCard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  search: string;
  sets: string[];
  colors: string[];
  rarities: string[];
  types: string[];
  stories: string[];
  subtypes: string[];
  costs: number[];
  costMin: number;
  costMax: number;
  strengthMin: number;
  strengthMax: number;
  willpowerMin: number;
  willpowerMax: number;
  loreMin: number;
  loreMax: number;
  inkwellOnly: boolean | null;
  hasEnchanted: boolean | null;
  hasSpecial: boolean | null;
  inMyCollection: boolean | null;
  cardCountOperator: 'eq' | 'gte' | 'lte' | null;
  cardCountValue: number;
}

export interface SortOption {
  field: 'name' | 'cost' | 'rarity' | 'set' | 'number' | 'color' | 'type' | 'story' | 'strength' | 'willpower' | 'lore';
  direction: 'asc' | 'desc';
}

export interface CardDatabase {
  metadata: {
    formatVersion: string;
    generatedOn: string;
    language: string;
  };
  sets: Record<string, {
    prereleaseDate: string | null;
    releaseDate: string | null;
    hasAllCards: boolean;
    type: string;
    number: number;
    name: string;
  }>;
  cards: LorcanaCard[];
}