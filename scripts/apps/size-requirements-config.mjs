import { MODULE_ID, DEFAULT_SIZE_REQUIREMENTS, SIZE_KEYS } from '../constants.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class SizeRequirementsConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'size-requirements-config',
    tag: 'form',
    window: {
      title: 'ROTTEN_HUNGER.Config.WindowTitle',
      resizable: true
    },
    position: { width: 760, height: 'auto' },
    form: {
      handler: SizeRequirementsConfig.#onSubmit,
      closeOnSubmit: false,
      submitOnChange: false
    }
  };

  static PARTS = {
    form: { template: `modules/${MODULE_ID}/templates/apps/size-requirements-config.hbs` }
  };

  async _prepareContext(options) {
    let stored = game.settings.get(MODULE_ID, 'sizeRequirements');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) stored = {};

    const foodTpl  = game.settings.get(MODULE_ID, 'spoiledFoodItem')  ?? '';
    const drinkTpl = game.settings.get(MODULE_ID, 'spoiledDrinkItem') ?? '';

    const worldItems = game.items.contents
      .filter(i => i.type === 'consumable')
      .map(i => ({
        id: i.id,
        name: i.name,
        selectedFood:  i.id === foodTpl,
        selectedDrink: i.id === drinkTpl
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      sizes: SIZE_KEYS.map(key => {
        const def = DEFAULT_SIZE_REQUIREMENTS[key];
        const val = stored[key] ?? {};
        return {
          key,
          labelKey: `ROTTEN_HUNGER.Config.Sizes.${key}`,
          food: Number.isFinite(val.food) ? val.food : def.food,
          water: Number.isFinite(val.water) ? val.water : def.water,
          daysWithoutFood:  Number.isFinite(val.daysWithoutFood)  ? val.daysWithoutFood  : def.daysWithoutFood,
          daysWithoutWater: Number.isFinite(val.daysWithoutWater) ? val.daysWithoutWater : def.daysWithoutWater
        };
      }),
      worldItems
    };
  }

  static async #onSubmit(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);

    const result = {};
    for (const key of SIZE_KEYS) {
      const entry = data[key] ?? {};
      result[key] = {
        food:             Number(entry.food)             || 0,
        water:            Number(entry.water)            || 0,
        daysWithoutFood:  Number(entry.daysWithoutFood)  || 0,
        daysWithoutWater: Number(entry.daysWithoutWater) || 0
      };
    }
    await game.settings.set(MODULE_ID, 'sizeRequirements', result);
    await game.settings.set(MODULE_ID, 'spoiledFoodItem',  data.spoiledFoodItem  ?? '');
    await game.settings.set(MODULE_ID, 'spoiledDrinkItem', data.spoiledDrinkItem ?? '');

    ui.notifications.info(game.i18n.localize('ROTTEN_HUNGER.Config.SavedNotification'));
    this.close();
  }
}