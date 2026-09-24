// scripts/sheets/item-sheet.mjs
import { MODULE_ID, FLAGS, CONSUMABLE_TYPES } from '../constants.mjs';

// Поле срока годности показываем и для еды, и для напитков
const EXPIRATION_TYPES = [CONSUMABLE_TYPES.FOOD, CONSUMABLE_TYPES.DRINK];

export function registerItemSheetHooks() {
  // Регистрируем несколько хуков, чтобы поймать лист предмета в любой версии системы
  Hooks.on('renderItemSheet',        (app, html) => injectExpirationField(app, html));
  Hooks.on('renderItemSheet4e',      (app, html) => injectExpirationField(app, html));
  Hooks.on('renderDocumentSheet4e',  (app, html) => injectExpirationField(app, html));
  Hooks.on('renderDocumentSheetV2',  (app, html) => injectExpirationField(app, html));
}

function injectExpirationField(app, html) {
  // Получаем документ из app (в v14 у ApplicationV2 это app.document)
  const item = app.document ?? app.item ?? app.object;
  if (!item || item.documentName !== 'Item') return;
  if (item.type !== 'consumable') return;

  const consumableType = item.system?.consumableType;
  if (!EXPIRATION_TYPES.includes(consumableType)) return;

  // Получаем корневой HTMLElement (v14 отдаёт нативный элемент, старые версии — jQuery)
  const root = toElement(html);
  if (!root) return;

  // Защита от повторной вставки (хуки могут срабатывать несколько раз)
  if (root.querySelector('.my-module-expiration')) return;

  const isEditable = game.user.isGM;
  const currentValue = item.getFlag(MODULE_ID, FLAGS.EXPIRATION) ?? 0;

  const wrapper = document.createElement('div');
  wrapper.className = 'form-group my-module-expiration';
  wrapper.innerHTML = `
    <label>Срок годности (дней)</label>
    <input type="number" name="flags.${MODULE_ID}.${FLAGS.EXPIRATION}"
           value="${currentValue}" min="0" step="1" ${isEditable ? '' : 'disabled'}>
  `;

  // Пытаемся найти select с типом расходника и вставить поле сразу после его .form-group
  const typeSelect = root.querySelector('[name="system.consumableType"]');
  if (typeSelect) {
    const formGroup = typeSelect.closest('.form-group');
    if (formGroup && formGroup.parentElement) {
      formGroup.parentElement.insertBefore(wrapper, formGroup.nextSibling);
      return;
    }
  }

  // Fallback 1: любая форма внутри листа
  const form = root.querySelector('form');
  if (form) {
    form.appendChild(wrapper);
    return;
  }

  // Fallback 2: сам корень
  root.appendChild(wrapper);
}

// Утилита: приводим html к нативному HTMLElement (поддержка jQuery и v14)
function toElement(html) {
  if (!html) return null;
  if (html instanceof HTMLElement) return html;
  // jQuery-объект
  if (html[0] instanceof HTMLElement) return html[0];
  return null;
}