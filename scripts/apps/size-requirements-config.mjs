// scripts/apps/size-requirements-config.mjs
import { MODULE_ID, DEFAULT_SIZE_REQUIREMENTS, SIZE_KEYS } from '../constants.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const SIZE_LABELS = {
  tiny: 'Крошечный', sm: 'Маленький', med: 'Средний',
  lg: 'Большой', huge: 'Огромный', garg: 'Громадный'
};

export class SizeRequirementsConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'size-requirements-config',
    tag: 'form',
    window: { title: 'Настройки еды и воды', resizable: true },
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

    const worldItems = game.items.contents
      .filter(i => i.type === 'consumable')
      .map(i => ({ id: i.id, name: i.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      sizes: SIZE_KEYS.map(key => {
        const def = DEFAULT_SIZE_REQUIREMENTS[key];
        const val = stored[key] ?? {};
        return {
          key,
          label: SIZE_LABELS[key] ?? key,
          food: Number.isFinite(val.food) ? val.food : def.food,
          water: Number.isFinite(val.water) ? val.water : def.water,
          daysWithoutFood:  Number.isFinite(val.daysWithoutFood)  ? val.daysWithoutFood  : def.daysWithoutFood,
          daysWithoutWater: Number.isFinite(val.daysWithoutWater) ? val.daysWithoutWater : def.daysWithoutWater
        };
      }),
      worldItems,
      spoiledFoodItem:  game.settings.get(MODULE_ID, 'spoiledFoodItem')  ?? '',
      spoiledDrinkItem: game.settings.get(MODULE_ID, 'spoiledDrinkItem') ?? ''
    };
  }

  static async #onSubmit(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);

    // sizes
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

    // spoiled items
    await game.settings.set(MODULE_ID, 'spoiledFoodItem',  data.spoiledFoodItem  ?? '');
    await game.settings.set(MODULE_ID, 'spoiledDrinkItem', data.spoiledDrinkItem ?? '');

    ui.notifications.info('Настройки сохранены.');
    this.close();
  }
}