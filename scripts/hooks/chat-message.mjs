// scripts/hooks/chat-message.mjs
import { MODULE_ID } from '../constants.mjs';
import { restNoteStore } from './rest-handler.mjs';
import { buildRestNote } from '../helpers/consumption.mjs';

export function registerChatMessageHooks() {
  Hooks.on('createChatMessage', async (message, options, userId) => {
    // В D&D 4e speaker.actor может быть как строкой, так и экземпляром Actor
    const actorRef = message.speaker?.actor;
    const actorId = typeof actorRef === 'string'
      ? actorRef
      : (actorRef?.id ?? null);
    if (!actorId) return;

    const currentContent = typeof message.content === 'string' ? message.content : '';
    if (currentContent.includes('my-module-rest-note')) return;

    const note = takeNote(actorId);
    if (!note) return;

    const isCritical = note.critical === true;
    const cls = isCritical
      ? 'my-module-rest-note my-module-rest-note-critical'
      : 'my-module-rest-note';

    const newContent = currentContent + `<p class="${cls}">${note.text}</p>`;

    try {
      await message.update({ content: newContent });
    } catch (err) {
      console.error(`${MODULE_ID} | Failed to update chat message`, err);
    }
  });
}

function takeNote(actorId) {
  // 1) Быстрый путь — store, заполненный rest-handler'ом
  const stored = restNoteStore.get(actorId);
  if (stored && Date.now() - stored.at < 15000) {
    restNoteStore.delete(actorId);
    return stored;
  }

  // 2) Fallback — считаем из флага актора
  const actor = game.actors.get(actorId);
  if (!actor) return null;
  const consumption = actor.getFlag(MODULE_ID, 'pendingConsumption');
  if (!consumption) return null;
  return buildRestNote(actor, consumption);
}