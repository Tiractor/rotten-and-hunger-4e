import { MODULE_ID, DEFAULT_SIZE_REQUIREMENTS } from './constants.mjs';
import { SizeRequirementsConfig } from './apps/size-requirements-config.mjs';

export function registerSettings() {
  game.settings.register(MODULE_ID, 'sizeRequirements', {
    name: 'ROTTEN_HUNGER.Settings.SizeRequirements.Name',
    hint: 'ROTTEN_HUNGER.Settings.SizeRequirements.Hint',
    scope: 'world',
    config: false,
    type: Object,
    default: foundry.utils.deepClone(DEFAULT_SIZE_REQUIREMENTS)
  });

  game.settings.register(MODULE_ID, 'spoiledFoodItem', {
    name: 'ROTTEN_HUNGER.Settings.SpoiledFood.Name',
    hint: 'ROTTEN_HUNGER.Settings.SpoiledFood.Hint',
    scope: 'world',
    config: false,
    type: String,
    default: ''
  });

  game.settings.register(MODULE_ID, 'spoiledDrinkItem', {
    name: 'ROTTEN_HUNGER.Settings.SpoiledDrink.Name',
    hint: 'ROTTEN_HUNGER.Settings.SpoiledDrink.Hint',
    scope: 'world',
    config: false,
    type: String,
    default: ''
  });

  game.settings.registerMenu(MODULE_ID, 'sizeRequirementsMenu', {
    name: 'ROTTEN_HUNGER.Settings.Menu.Name',
    label: 'ROTTEN_HUNGER.Settings.Menu.Label',
    hint: 'ROTTEN_HUNGER.Settings.Menu.Hint',
    icon: 'fas fa-cogs',
    type: SizeRequirementsConfig,
    restricted: true
  });
}