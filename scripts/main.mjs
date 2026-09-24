import { MODULE_ID } from './constants.mjs';
import { registerConsumableTypes } from './config.mjs';
import { registerSettings } from './settings.mjs';
import { registerItemSheetHooks } from './sheets/item-sheet.mjs';
import { installLongRestPatch } from './hooks/long-rest-hook.mjs';
import { registerLongRestDialogHooks } from './sheets/long-rest-dialog.mjs';
import { registerRestHandlers } from './hooks/rest-handler.mjs';
import { registerChatMessageHooks } from './hooks/chat-message.mjs';
import { registerItemGuards } from './hooks/item-guards.mjs';

Hooks.once('init', () => {
  console.log(`${MODULE_ID} | Initializing`);
  Handlebars.registerHelper('eq', (a, b) => a === b);
  registerConsumableTypes();
  registerSettings();
  installLongRestPatch();
});

Hooks.once('ready', () => {
  console.log(`${MODULE_ID} | Ready`);
  registerItemSheetHooks();
  registerLongRestDialogHooks();
  registerRestHandlers();
  registerChatMessageHooks();
  registerItemGuards();
});