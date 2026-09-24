# Rotten and Hunger 4e
Для русского перейдите [сюда](README.ru.md).

A Foundry Virtual Tabletop module that adds food, water, and expiration tracking to the **D&D 4e** system. Characters must eat and drink during extended rests, and provisions spoil over time, turning into a rotten item.

## ✨ Features

- **New consumable type — "Drink"** (`drink`), alongside the standard "Food" (`food`).
- **Expiration date** for food and drinks. Measured in days, editable only by the GM.
- **"Food & Water" section** right inside the Long Rest dialog — pick food and drinks from the character's inventory.
- **Configurable requirements per creature size.** For each size (Tiny, Small, Medium, Large, Huge, Gargantuan) you can set:
  - how many pounds of food must be eaten;
  - how many pounds of water must be drunk;
  - how many days the creature can survive without food;
  - how many days the creature can survive without water.
- **Hunger and thirst counters.** The module tracks days without food and water, resetting them to 0 when the character eats/drinks.
- **Chat messages** such as:
  - "The character ate and drank today."
  - "The character ate and has gone 3 days without water."
  - "The character has gone 2 days without food and 3 days without water."

  If a threshold from the settings is exceeded, the text is highlighted in **red**.
- **Spoilage.** On every extended rest, expiration decreases by 1. When it reaches 0, the item turns into the one configured in the settings (or is deleted).

## 📦 Installation

### Manual

1. Download the module archive.
2. Extract it into the `Data/modules/` folder of your Foundry VTT installation. The final path should be `Data/modules/rotten-and-hunger-4e/`.
3. Launch Foundry VTT and open your world.
4. Go to **Settings → Manage Modules** and enable **Rotten and Hunger 4e**.

### Via manifest (if published)

1. In Foundry VTT, open **Add-on Modules → Install Module**.
2. Paste the `module.json` URL into the **Manifest URL** field.
3. Click **Install**.

## ⚙️ Configuration

All module settings live under **Settings → Configure Settings → Rotten and Hunger 4e** → click **"Configure"** next to **"Food & Water Settings"**.

### Size requirements

A table where, for each creature size, you specify:

| Column | Description |
|---|---|
| **Food (lb)** | Pounds of food required per extended rest |
| **Water (lb)** | Pounds of water required per extended rest |
| **Days without food** | Threshold: if exceeded, the chat line turns red |
| **Days without water** | Same, for water |

Default values:

| Size | Food (lb) | Water (lb) | Days without food | Days without water |
|---|---|---|---|---|
| Tiny | 1 | 1 | 3 | 2 |
| Small | 1 | 1 | 3 | 2 |
| Medium | 2 | 2 | 3 | 2 |
| Large | 4 | 4 | 3 | 2 |
| Huge | 8 | 8 | 3 | 2 |
| Gargantuan | 16 | 16 | 3 | 2 |

### Spoilage replacement items

Two dropdowns listing every `Consumable` item from the **Items** tab:

- **Spoiled Food** — what expired food turns into.
- **Spoiled Drink** — what an expired drink turns into.

Leave a field empty to simply delete the expired item.

## 🎮 Usage

### Preparing provisions

1. Create an item of type **Consumable**.
2. Set its type to **Food** or **Drink**.
3. Fill in the **Expiration (days)** field (available to GMs only).
4. Fill in the standard **Weight** field — it drives consumption calculations.
5. Give the item to a character.

> **Important:** for the module to work correctly, food and drink items must have a non-zero **Weight**.

### Long Rest

1. Open the character sheet and click the Long Rest button.
2. In the dialog, find the **"Food & Water"** section.
3. Check the items you want to consume and enter the **number of units** the character will eat/drink.
   - The subtotal on the right shows total weight per block (food / water).
   - Quantity is limited only by your stock.
4. Confirm the long rest.

After the rest, the module will:

- deduct the specified number of food and drink units;
- update the days-without-food and days-without-water counters;
- decrease the expiration of **every** food and drink item in the character's inventory by 1;
- turn expired provisions into the configured item (or delete them);
- append a line summarizing the result to the chat message (red if a threshold is exceeded).

## 🧩 Compatibility

- **System:** D&D 4e (`dnd4e`)
- **Foundry VTT:** v14 and above
- **Tested with:** D&D 4e 0.9.3

The module does not conflict with other character sheet or rest dialog extensions — everything hooks in via public APIs and a patch of `ApplicationV2._onSubmitForm`.

## 🔧 For developers


### Custom hook

The module exposes a hook that fires when a long rest is confirmed — **before** the system starts processing the rest:

```javascript
Hooks.on('rotten-and-hunger-4e.longRestConfirmed', ({ app, actor, event }) => {
  console.log('Confirmed long rest for', actor.name);
});
```

The hook is called synchronously. If you want to intervene in the processing, you may return a Promise — but note that the original rest handler does not await it.

### Flags

On **Item**:
- `flags.rotten-and-hunger-4e.expiration` — `number`, expiration in days.

On **Actor**:
- `flags.rotten-and-hunger-4e.daysWithoutFood` — `number`, days without food.
- `flags.rotten-and-hunger-4e.daysWithoutWater` — `number`, days without water.
- `flags.rotten-and-hunger-4e.lastConsumption` — `{ ate, drank, daysWithoutFood, daysWithoutWater }`, summary of the last rest.
- `flags.rotten-and-hunger-4e.pendingConsumption` — temporary flag set during the rest; cleared automatically.

## 🐛 Known limitations

- Hunger and thirst counters are not yet displayed on the character sheet — only via actor flags.
- The module does not track food stored inside containers (bags, backpacks) — only items directly in the actor's inventory.

## ❓ FAQ

**Why isn't the "Expiration" field showing up?**
Make sure that:
- the item type is **Consumable**;
- the consumable type is **Food** or **Drink**;
- module is on.

**Why doesn't food spoil after a rest?**
Check that the food item has an expiration value greater than 0. If the field is empty or 0, the module treats the item as non-perishable.

## 📜 License

See the `LICENSE` file.

## 🙏 Credits

- The developers of the **D&D 4e system for Foundry VTT** for an open API and a clear structure.
- The Foundry VTT community for documentation and examples.

## 📬 Feedback

Found a bug or have an idea? Open an issue in the module's repository or reach out to the author directly.