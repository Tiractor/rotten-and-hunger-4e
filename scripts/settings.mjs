// scripts/settings.mjs
import { MODULE_ID, DEFAULT_SIZE_REQUIREMENTS } from './constants.mjs';
import { SizeRequirementsConfig } from './apps/size-requirements-config.mjs';

export function registerSettings() {
  game.settings.register(MODULE_ID, 'sizeRequirements', {
    scope: 'world', config: false, type: Object,
    default: foundry.utils.deepClone(DEFAULT_SIZE_REQUIREMENTS)
  });

  game.settings.register(MODULE_ID, 'spoiledFoodItem', {
    scope: 'world', config: false, type: String, default: ''
  });

  game.settings.register(MODULE_ID, 'spoiledDrinkItem', {
    scope: 'world', config: false, type: String, default: ''
  });

  game.settings.registerMenu(MODULE_ID, 'sizeRequirementsMenu', {
    name: 'Настройки еды и воды',
    label: 'Настроить',
    hint: 'Потребности по размерам и предметы-замены.',
    icon: 'fas fa-cogs',
    type: SizeRequirementsConfig,
    restricted: true
  });
}