import { MODULE_ID, FLAGS, CONSUMABLE_TYPES } from '../constants.mjs';

const EXPIRATION_TYPES = [CONSUMABLE_TYPES.FOOD, CONSUMABLE_TYPES.DRINK];

export function registerItemSheetHooks() {
  Hooks.on('renderItemSheet',       (app, html) => injectExpirationField(app, html));
  Hooks.on('renderItemSheet4e',     (app, html) => injectExpirationField(app, html));
  Hooks.on('renderDocumentSheet4e', (app, html) => injectExpirationField(app, html));
  Hooks.on('renderDocumentSheetV2', (app, html) => injectExpirationField(app, html));
}

function injectExpirationField(app, html) {
  const item = app.document ?? app.item ?? app.object;
  if (!item || item.documentName !== 'Item') return;
  if (item.type !== 'consumable') return;
  if (!EXPIRATION_TYPES.includes(item.system?.consumableType)) return;

  const root = toElement(html);
  if (!root) return;
  if (root.querySelector('.my-module-expiration')) return;

  const isEditable = game.user.isGM;
  const currentValue = item.getFlag(MODULE_ID, FLAGS.EXPIRATION) ?? 0;
  const label = game.i18n.localize('ROTTEN_HUNGER.Item.Expiration');

  const wrapper = document.createElement('div');
  wrapper.className = 'form-group my-module-expiration';
  wrapper.innerHTML = `
    <label>${label}</label>
    <input type="number" name="flags.${MODULE_ID}.${FLAGS.EXPIRATION}"
           value="${currentValue}" min="0" step="1" ${isEditable ? '' : 'disabled'}>
  `;

  const typeSelect = root.querySelector('[name="system.consumableType"]');
  if (typeSelect) {
    const formGroup = typeSelect.closest('.form-group');
    if (formGroup && formGroup.parentElement) {
      formGroup.parentElement.insertBefore(wrapper, formGroup.nextSibling);
      return;
    }
  }
  const form = root.querySelector('form');
  (form ?? root).appendChild(wrapper);
}

function toElement(html) {
  if (!html) return null;
  if (html instanceof HTMLElement) return html;
  if (html[0] instanceof HTMLElement) return html[0];
  return null;
}