import { MODULE_ID } from '../constants.mjs';

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

  const i18n = game.i18n;
  let text;
  if (ate && drank) {
    text = i18n.localize('ROTTEN_HUNGER.Chat.AteAndDrank');
  } else if (ate && !drank) {
    text = i18n.format('ROTTEN_HUNGER.Chat.AteNoWater', { days: daysWithoutWater });
  } else if (!ate && drank) {
    text = i18n.format('ROTTEN_HUNGER.Chat.NoFoodDrank', { days: daysWithoutFood });
  } else {
    text = i18n.format('ROTTEN_HUNGER.Chat.NoFoodNoWater', {
      daysFood: daysWithoutFood,
      daysWater: daysWithoutWater
    });
  }

  const critical = daysWithoutFood > maxFood || daysWithoutWater > maxWater;

  return {
    text, critical,
    daysWithoutFood, daysWithoutWater,
    maxFood, maxWater,
    at: Date.now()
  };
}