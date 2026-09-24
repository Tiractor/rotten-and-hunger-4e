export const MODULE_ID = 'rotten-and-hunger-4e';

export const FLAGS = {
  EXPIRATION: 'expiration',
  LAST_CONSUMPTION: 'lastConsumption'
};

export const CONSUMABLE_TYPES = {
  FOOD: 'food',
  DRINK: 'drink'
};

// Ключи ДОЛЖНЫ совпадать с CONFIG.DND4E.actorSizes
export const SIZE_KEYS = ['tiny', 'sm', 'med', 'lg', 'huge', 'garg'];

export const DEFAULT_SIZE_REQUIREMENTS = {
  tiny: { food: 1, water: 1, daysWithoutFood: 3, daysWithoutWater: 2 },
  sm:   { food: 1, water: 1, daysWithoutFood: 3, daysWithoutWater: 2 },
  med:  { food: 2, water: 2, daysWithoutFood: 3, daysWithoutWater: 2 },
  lg:   { food: 4, water: 4, daysWithoutFood: 3, daysWithoutWater: 2 },
  huge: { food: 8, water: 8, daysWithoutFood: 3, daysWithoutWater: 2 },
  garg: { food: 16, water: 16, daysWithoutFood: 3, daysWithoutWater: 2 }
};