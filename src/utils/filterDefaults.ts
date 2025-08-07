import { costRange, strengthRange, willpowerRange, loreRange } from '../data/allCards';
import { FilterOptions } from '../types';

export const getDefaultFilters = (): FilterOptions => {
  return {
    search: '',
    sets: [],
    colors: [],
    showAnyWithColors: true,
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
    inMyCollection: null,
    cardCountOperator: null,
    cardCountValue: 1,
  };
};