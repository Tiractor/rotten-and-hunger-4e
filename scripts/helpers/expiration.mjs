import { MODULE_ID, FLAGS, CONSUMABLE_TYPES } from '../constants.mjs';

export async function processExpiration(actor) {
  const items = actor.items.filter(i =>
    i.type === 'consumable' &&
    (i.system.consumableType === CONSUMABLE_TYPES.FOOD ||
     i.system.consumableType === CONSUMABLE_TYPES.DRINK)
  );

  const spoiledFoodId  = game.settings.get(MODULE_ID, 'spoiledFoodItem');
  const spoiledDrinkId = game.settings.get(MODULE_ID, 'spoiledDrinkItem');

  const updates = [];

  for (const item of items) {
    let expiration = item.getFlag(MODULE_ID, FLAGS.EXPIRATION) ?? 0;
    if (expiration <= 0) continue;

    expiration -= 1;

    if (expiration <= 0) {
      const isFood = item.system.consumableType === CONSUMABLE_TYPES.FOOD;
      const templateId = isFood ? spoiledFoodId : spoiledDrinkId;
      const template = templateId ? game.items.get(templateId) : null;

      const currentQty = Number(item.system.quantity) || 1;
      const newQty = Math.max(0, currentQty - 1);

      if (newQty <= 0) {
        await actor.deleteEmbeddedDocuments('Item', [item.id]);
      } else {
        await item.update({ 'system.quantity': newQty });
      }

      if (template) {
        const data = template.toObject();
        data.system = foundry.utils.mergeObject(data.system ?? {}, { quantity: 1 }, { inplace: false });
        delete data._id;
        await actor.createEmbeddedDocuments('Item', [data]);
      }
    } else {
      updates.push({ _id: item.id, [`flags.${MODULE_ID}.${FLAGS.EXPIRATION}`]: expiration });
    }
  }

  if (updates.length) await actor.updateEmbeddedDocuments('Item', updates);
}