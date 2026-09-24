// scripts/hooks/rest-handler.mjs
import { MODULE_ID, FLAGS } from '../constants.mjs';
import { processExpiration } from '../helpers/expiration.mjs';
import { buildRestNote } from '../helpers/consumption.mjs';

export const restNoteStore = new Map();

export function registerRestHandlers() {
  // ФАЗА 1 — до longRest. Только читаем и запоминаем.
  Hooks.on(`${MODULE_ID}.longRestBefore`, ({ actor }) => {
    if (!actor) return;
    if (!actor.isOwner) return;

    const consumption = actor.getFlag(MODULE_ID, 'pendingConsumption') ?? null;
    const note = buildRestNote(actor, consumption);

    restNoteStore.set(actor.id, note);
    setTimeout(() => {
      const entry = restNoteStore.get(actor.id);
      if (entry && Date.now() - entry.at > 14000) restNoteStore.delete(actor.id);
    }, 15000);

    console.log(`${MODULE_ID} | Rest note queued`, note);
  });

  // ФАЗА 2 — после longRest. Здесь всё, что меняет документы.
  Hooks.on(`${MODULE_ID}.longRestAfter`, async ({ actor }) => {
    if (!actor) return;
    if (!actor.isOwner) return;

    const note = restNoteStore.get(actor.id);
    const consumption = actor.getFlag(MODULE_ID, 'pendingConsumption') ?? null;

    try {
      // 1. Списываем еду и воду
      if (consumption) {
        await actor.unsetFlag(MODULE_ID, 'pendingConsumption');

        const allItems = actor.items.filter(i => i.type === 'consumable');
        const updates = [];
        const deletions = [];
        const entries = [
          ...(consumption.foodConsumed ?? []),
          ...(consumption.waterConsumed ?? [])
        ];

        for (const entry of entries) {
          const item = allItems.find(i => i.id === entry.itemId);
          if (!item) continue;
          const currentQty = Number(item.system.quantity) || 0;
          const newQty = currentQty - entry.qty;
          if (newQty <= 0) deletions.push(item.id);
          else updates.push({ _id: item.id, 'system.quantity': newQty });
        }

        if (deletions.length) await actor.deleteEmbeddedDocuments('Item', deletions);
        if (updates.length)   await actor.updateEmbeddedDocuments('Item', updates);
      }

      // 2. Обновляем счётчики
      if (note) {
        await actor.update({
          [`flags.${MODULE_ID}.daysWithoutFood`]:  note.daysWithoutFood,
          [`flags.${MODULE_ID}.daysWithoutWater`]: note.daysWithoutWater,
          [`flags.${MODULE_ID}.${FLAGS.LAST_CONSUMPTION}`]: {
            ate: !!consumption?.ate,
            drank: !!consumption?.drank,
            daysWithoutFood:  note.daysWithoutFood,
            daysWithoutWater: note.daysWithoutWater
          }
        });
      }

      // 3. Порча еды
      await processExpiration(actor);
    } catch (err) {
      console.error(`${MODULE_ID} | Rest post-processing error`, err);
    }
  });
}