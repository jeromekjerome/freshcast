// Realistic 14-day sales data for a NYC juice bar
const today = new Date();
const day = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - (14 - n));
  return d.toISOString().split('T')[0];
};

// Base daily volumes with weekend bumps and some variance
const BASE = {
  Spinach:       [28,32,30,35,38,45,42, 29,31,33,36,40,44,41],
  Kale:          [22,25,23,28,30,36,34, 24,26,25,29,32,35,33],
  Banana:        [48,52,50,55,58,68,65, 50,53,51,57,60,66,63],
  Strawberry:    [35,38,36,42,44,52,49, 37,40,38,43,47,50,48],
  Mango:         [25,28,26,30,33,40,37, 27,29,27,32,35,39,36],
  'Coconut Water':[30,34,32,38,40,48,45, 32,35,33,39,42,47,44],
  Acai:          [18,20,19,22,24,30,28, 19,21,20,23,26,29,27],
  Pineapple:     [20,22,21,25,27,33,31, 21,23,22,26,28,32,30],
};

export const INGREDIENTS = Object.keys(BASE);

export const SAMPLE_SALES = INGREDIENTS.flatMap(ingredient =>
  BASE[ingredient].map((units, i) => ({
    ingredient,
    date: day(i + 1),
    units,
  }))
);

export const DEFAULT_CONTEXT = {
  weather: 'Sunny & Warm',
  events: 'NYC Marathon Saturday (large crowd near location)',
  holidays: 'None',
  notes: 'New açaí bowl promotion launching Thursday',
};
