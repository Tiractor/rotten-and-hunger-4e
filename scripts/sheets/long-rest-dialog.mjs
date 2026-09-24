// scripts/sheets/long-rest-dialog.mjs
import { MODULE_ID, CONSUMABLE_TYPES } from '../constants.mjs';

export function registerLongRestDialogHooks() {
  Hooks.on('renderLongRestDialog', (app, html, data) => {
    const root = toElement(html);
    if (!root) return;
    const actor = app.document ?? app.actor ?? app.object;
    if (!actor || actor.documentName !== 'Actor') return;
    if (root.querySelector('.my-module-rest-section')) return;

    const foodItems = actor.items.filter(i =>
      i.type === 'consumable' && i.system.consumableType === CONSUMABLE_TYPES.FOOD
    );
    const drinkItems = actor.items.filter(i =>
      i.type === 'consumable' && i.system.consumableType === CONSUMABLE_TYPES.DRINK
    );

    const size = actor.system.details?.size || 'med';
    const req = game.settings.get(MODULE_ID, 'sizeRequirements')?.[size] || {};
    const reqFood  = Number(req.food)  || 0;
    const reqWater = Number(req.water) || 0;

    const section = document.createElement('div');
    section.className = 'my-module-rest-section';

    const renderRow = (item, kind) => {
      const weight = Number(item.system.weight) || 1;
      const qty = Number(item.system.quantity) || 0;
      return `
        <div class="my-module-item-row" data-item-id="${item.id}" data-weight="${weight}">
          <label>
            <input type="checkbox" class="my-module-item-check">
            <span class="my-module-item-name">${escapeHtml(item.name)}</span>
            <span class="my-module-item-avail">${qty} шт × ${weight.toFixed(2)} ф = ${(qty * weight).toFixed(2)} ф</span>
          </label>
          <input type="number" class="my-module-item-amount"
                 data-kind="${kind}" data-item-id="${item.id}"
                 min="0" step="1" value="0" disabled>
          <span class="my-module-item-unit">шт</span>
          <span class="my-module-item-subtotal">0.00 ф</span>
        </div>
      `;
    };

    section.innerHTML = `
      <h3>Питание и вода</h3>
      <div class="my-module-block">
        <div class="my-module-block-header">
          <strong>Еда</strong> — требуется: ${reqFood} ф. | Выбрано: <span class="my-module-total-food">0.00</span> ф.
        </div>
        ${foodItems.length ? foodItems.map(i => renderRow(i, 'food')).join('') : '<em>Нет еды в инвентаре</em>'}
      </div>
      <div class="my-module-block">
        <div class="my-module-block-header">
          <strong>Вода</strong> — требуется: ${reqWater} ф. | Выбрано: <span class="my-module-total-water">0.00</span> ф.
        </div>
        ${drinkItems.length ? drinkItems.map(i => renderRow(i, 'drink')).join('') : '<em>Нет напитков в инвентаре</em>'}
      </div>
    `;

    const form = root.querySelector('form') ?? root;
    form.appendChild(section);

    // --- вспомогательные функции ---

    const readForm = () => {
      const foodConsumed = [];
      const waterConsumed = [];
      section.querySelectorAll('.my-module-item-row').forEach(row => {
        const check = row.querySelector('.my-module-item-check');
        if (!check.checked) return;
        const input = row.querySelector('.my-module-item-amount');
        const qty = Math.max(0, Math.floor(Number(input.value) || 0));
        if (qty <= 0) return;
        const weight = Number(row.dataset.weight) || 1;
        const entry = { itemId: input.dataset.itemId, qty, weight };
        if (input.dataset.kind === 'food') foodConsumed.push(entry);
        else waterConsumed.push(entry);
      });
      return {
        foodConsumed,
        waterConsumed,
        ate: foodConsumed.length > 0,
        drank: waterConsumed.length > 0
      };
    };

    const recompute = () => {
      let totalFood = 0, totalWater = 0;
      section.querySelectorAll('.my-module-item-row').forEach(row => {
        const check = row.querySelector('.my-module-item-check');
        const input = row.querySelector('.my-module-item-amount');
        const subtotalEl = row.querySelector('.my-module-item-subtotal');

        if (!check.checked) {
          input.disabled = true;
          input.value = '0';
          subtotalEl.textContent = '0.00 ф';
          return;
        }

        input.disabled = false;
        const weight = Number(row.dataset.weight) || 1;
        const qty = Math.max(0, Math.floor(Number(input.value) || 0));
        input.value = String(qty);
        const subtotal = qty * weight;
        subtotalEl.textContent = `${subtotal.toFixed(2)} ф`;

        if (input.dataset.kind === 'food') totalFood += subtotal;
        else totalWater += subtotal;
      });
      section.querySelector('.my-module-total-food').textContent = totalFood.toFixed(2);
      section.querySelector('.my-module-total-water').textContent = totalWater.toFixed(2);
    };

    const savePending = () => {
      const data = readForm();
      if (!data.foodConsumed.length && !data.waterConsumed.length) {
        actor.unsetFlag(MODULE_ID, 'pendingConsumption');
      } else {
        actor.setFlag(MODULE_ID, 'pendingConsumption', { ...data, reqFood, reqWater });
      }
      return data;
    };

    // --- подтверждение отдыха ---
    // Перехватываем submit формы и клик по кнопке отправки ДО системного обработчика.
    // Здесь мы вычисляем итоговый текст для чата и сохраняем флаг для createChatMessage.

    // --- live-обновление UI ---
    section.addEventListener('change', () => { recompute(); savePending(); });
    section.addEventListener('input',  () => { recompute(); savePending(); });
  });
}

function toElement(html) {
  if (!html) return null;
  if (html instanceof HTMLElement) return html;
  if (html[0] instanceof HTMLElement) return html[0];
  return null;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}