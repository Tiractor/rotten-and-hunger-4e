import { MODULE_ID } from '../constants.mjs';

export function installLongRestPatch() {
  const proto = foundry.applications.api?.ApplicationV2?.prototype;
  if (!proto) return console.error(`${MODULE_ID} | ApplicationV2 not found`);
  if (proto._onSubmitForm?.__rottenPatched) return;

  const original = proto._onSubmitForm;

  proto._onSubmitForm = async function (config, event) {
    const isLongRest =
      this?.options?.id === 'long-rest' &&
      this?.document?.documentName === 'Actor';

    // ФАЗА 1: синхронно, ДО системного longRest.
    // Здесь только читаем состояние и кладём note в store.
    if (isLongRest) {
      try {
        Hooks.callAll(`${MODULE_ID}.longRestBefore`, {
          app: this, actor: this.document, event,
        });
      } catch (err) {
        console.error(`${MODULE_ID} | longRestBefore error`, err);
      }
    }

    // Системный longRest (создаёт ChatMessage, обновляет hp/surges и т.д.)
    const result = await original.call(this, config, event);

    // ФАЗА 2: ПОСЛЕ системного longRest.
    // Здесь безопасно менять предметы и флаги актора — race исключён.
    if (isLongRest) {
      try {
        Hooks.callAll(`${MODULE_ID}.longRestAfter`, {
          app: this, actor: this.document, event,
        });
      } catch (err) {
        console.error(`${MODULE_ID} | longRestAfter error`, err);
      }
    }

    return result;
  };

  proto._onSubmitForm.__rottenPatched = true;
  console.log(`${MODULE_ID} | LongRestDialog submit patch installed (2-phase)`);
}