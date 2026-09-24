import { MODULE_ID, FLAGS, CONSUMABLE_TYPES } from '../constants.mjs';

export function registerItemGuards() {
  Hooks.on('preUpdateItem', (item, changes, options, userId) => {
    // Защита флага срока годности от изменения игроками
    if (item.type !== 'consumable') return;
    if (item.system.consumableType !== CONSUMABLE_TYPES.FOOD) return;

    if (!game.user.isGM) {
      // Если игрок пытается изменить флаг expiration — удаляем это изменение
      if (changes.flags?.[MODULE_ID]?.[FLAGS.EXPIRATION] !== undefined) {
        delete changes.flags[MODULE_ID][FLAGS.EXPIRATION];
      }
    }
  });
}