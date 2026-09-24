// scripts/helpers/consumption.mjs
import { MODULE_ID } from '../constants.mjs';

/**
 * Считает итоговые дни без еды/воды и формирует текст для чата.
 * @param {Actor} actor
 * @param {Object|null} consumption — pendingConsumption из флага
 * @returns {{text:string, critical:boolean, daysWithoutFood:number, daysWithoutWater:number, maxFood:number, maxWater:number, at:number}}
 */
export function buildRestNote(actor, consumption) {
  const prevFood  = actor.getFlag(MODULE_ID, 'daysWithoutFood')  || 0;
  const prevWater = actor.getFlag(MODULE_ID, 'daysWithoutWater') || 0;

  const ate   = !!consumption?.ate;
  const drank = !!consumption?.drank;

  const daysWithoutFood  = ate   ? 0 : prevFood + 1;
  const daysWithoutWater = drank ? 0 : prevWater + 1;

  const size = actor.system.details?.size || 'med';
  const req = game.settings.get(MODULE_ID, 'sizeRequirements')?.[size] || {};
  const maxFood  = Number(req.daysWithoutFood)  || 3;
  const maxWater = Number(req.daysWithoutWater) || 2;

  let text;
  if (ate && drank) {
    text = 'Персонаж сегодня поел и напился.';
  } else if (ate && !drank) {
    text = `Персонаж поел и ${daysWithoutWater} дней без воды.`;
  } else if (!ate && drank) {
    text = `Персонаж ${daysWithoutFood} дней без еды и напился.`;
  } else {
    text = `Персонаж ${daysWithoutFood} дней без еды и ${daysWithoutWater} дней без воды.`;
  }

  const critical = ((daysWithoutFood >= maxFood) || (daysWithoutWater >= maxWater));
  return {
    text,
    critical,
    daysWithoutFood,
    daysWithoutWater,
    maxFood,
    maxWater,
    at: Date.now()
  };
}