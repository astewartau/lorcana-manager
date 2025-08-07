import { sets, colors, costRange, strengthRange, willpowerRange, loreRange } from '../data/allCards';
import { FilterOptions } from '../types';

export const getDefaultFilters = (): FilterOptions => {
  const defaultSetCodes = sets
    .filter(s => ['Shimmering Skies', 'Azurite Sea', "Archazia's Island", 'The Reign of Jafar', 'Fabled'].includes(s.name))
    .map(s => s.code);
  
  const nonEmptyColors = colors.filter(color => color);

  return {
    search: '',
    sets: defaultSetCodes,
    colors: nonEmptyColors,
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