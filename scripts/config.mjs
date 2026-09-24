import { CONSUMABLE_TYPES } from './constants.mjs';

export function registerConsumableTypes() {
  // Добавляем тип "Напиток" в конфигурацию D&D 4e
  CONFIG.DND4E.consumableTypes[CONSUMABLE_TYPES.DRINK] = {
    label: 'ROTTEN_HUNGER.ConsumableTypes.drink'
  };
}