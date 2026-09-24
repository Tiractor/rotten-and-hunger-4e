import { CONSUMABLE_TYPES } from '../constants.mjs';

export function getFoodAndDrink(actor) {
  const foodItems = actor.items.filter(i =>
    i.type === 'consumable' && i.system.consumableType === CONSUMABLE_TYPES.FOOD
  );
  const drinkItems = actor.items.filter(i =>
    i.type === 'consumable' && i.system.consumableType === CONSUMABLE_TYPES.DRINK
  );
  return { foodItems, drinkItems };
}