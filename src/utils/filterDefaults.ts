import { costRange, strengthRange, willpowerRange, loreRange } from '../data/allCards';
import { FilterOptions } from '../types';

export const getDefaultFilters = (): FilterOptions => {
  return {
    search: '',
    sets: [],
    colors: [],
    colorMatchMode: 'any',
    rarities: [],
    types: [],
    stories: [],
    subtypes: [],
    costs: [],
    costMin: costRange.min,
    costMax: costRange.max,
    strengthMin: strengthRange.min,
    strengthMax: strengthRange.max,
    willpowerMin: willpowerRange.min,
    willpowerMax: willpowerRange.max,
    loreMin: loreRange.min,
    loreMax: loreRange.max,
    inkwellOnly: null,
    hasEnchanted: null,
    hasSpecial: null,
    includeIllumineerQuest: false,
    collectionFilter: 'all',
    cardCountOperator: null,
    cardCountValue: 1,
  };
};