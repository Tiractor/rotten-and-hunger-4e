// scripts/hooks/long-rest-hook.mjs
import { MODULE_ID } from '../constants.mjs';

/**
 * Патчит ApplicationV2._onSubmitForm, чтобы точно ловить подтверждение LongRestDialog.
 * Вызывать из Hooks.once('init') в main.mjs — функция сразу делает патч.
 */
export function installLongRestPatch() {
  const proto = foundry.applications.api?.ApplicationV2?.prototype;
  if (!proto) {
    console.error(`${MODULE_ID} | ApplicationV2 not found, cannot patch LongRestDialog`);
    return;
  }

  // Защита от двойного патча
  if (proto._onSubmitForm?.__rottenPatched) {
    console.log(`${MODULE_ID} | LongRestDialog patch already installed`);
    return;
  }

  const original = proto._onSubmitForm;

  proto._onSubmitForm = async function (config, event) {
    const isLongRest =
      this?.options?.id === 'long-rest' &&
      this?.document?.documentName === 'Actor';

    if (isLongRest) {
      try {
        Hooks.callAll(`${MODULE_ID}.longRestConfirmed`, {
          app: this,
          actor: this.document,
          event,
        });
      } catch (err) {
        console.error(`${MODULE_ID} | Error in longRestConfirmed listeners`, err);
      }
    }

    return original.call(this, config, event);
  };

  proto._onSubmitForm.__rottenPatched = true;
  console.log(`${MODULE_ID} | LongRestDialog submit patch installed`);
}