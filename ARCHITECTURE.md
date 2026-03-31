# Architecture – Rory's Sword Shop

## Project Overview
Hybrid e-commerce + gaming project.
- **Shop** (`index.html` + product pages) – HTML/CSS storefront with localStorage cart.
- **Sword Slash** (`game.html`) – 30-second click-reaction mini-game.
- **Knight's Quest** (`game2.html`) – Tile-based top-down RPG (main game).

---

## Player Position System

The RPG uses **two parallel coordinate systems** for every entity:

| Property | System | Unit | Purpose |
|----------|--------|------|---------|
| `tileX`, `tileY` | Tile grid | Integer (0–29 × 0–15) | Game logic: collision, pathfinding, door checks, NPC proximity |
| `pxX`, `pxY` | Pixel canvas | Float px (0–1200 × 0–640) | Rendering: canvas `drawRect`, smooth walk interpolation |

**Conversion** (`TILE = 40` pixels per tile):
```js
pxX = tileX * TILE;          // tile → pixel
tileX = Math.floor(pxX / TILE); // pixel → tile
```

**Walk animation flow:**
1. Input received → `targetX/targetY` set to adjacent tile.
2. `moving = true`, `walkTimer` runs 0 → `WALK_DUR` (0.143 s).
3. Each frame: `pxX/pxY` interpolated smoothly toward target pixel.
4. At `t ≥ 1`: tile coords (`tileX/tileY`) updated, door/transition checks run, next queued path step starts.

Tile coords stay at the **previous** tile until animation completes; pixel coords update every frame for smooth visuals.

---

## Main Systems

### Player
- Object: `tileX/Y`, `pxX/Y`, `targetX/Y`, `facing`, `path[]`, `walkTimer`, `walkFrame`, `moving`, `hp/maxHp`, `coins`, `level`.
- **Movement**: WASD/arrows → immediate 1-tile step; mouse click → BFS path queued.
- **Inventory**: 5-slot hotbar (`inventory[]`). Coins auto-add to `player.coins`; items take slots. Bread restores 3 HP.

### NPCs (Enemies / Characters)
> There are no hostile enemies. All characters are friendly NPCs.

- 6 NPCs defined in `NPCS[]`: Farmer, Blacksmith, Barkeeper, Cook (Village Square), Angry Farmer (Farmland), Farm Boy (Planter's Farm).
- Each NPC has: `id`, `name`, `tileX/Y`, `room`, `dialog[]`, `outfitColor`, `hairColor`, optional `shop[]`.
- Blocking: NPCs block their tile (`isBlockedByNpc()`).
- Interaction: E key or click when adjacent opens dialog sidebar; Cook sells bread (3 coins).

### Map
- 8 rooms, each a **30 × 16 tile grid** (`ROOMS[]`).
- **42 tile type constants** in `T{}` (FLOOR, WALL, DOOR_*, GRASS, CHEST_C/O, TREE, …).
- `WALKABLE` Set determines passable tiles.
- Door tiles trigger `startTransition()` → fade out → swap room → fade in.
- Rooms: Storeroom (0), Village Square (1), Farmland (2), Rowanoak Village (3), Riverside Bridge (4), Forest (5), Deep Forest (6), Planter's Farm (7).

### Rendering
- **Game loop**: `requestAnimationFrame` → `update(dt)` → `render()`.
- `dt` capped at 0.05 s (minimum 20 FPS; time steps never exceed 50 ms).
- Draw order each frame:
  1. Room background fill
  2. All 30×16 tiles (`drawTile()`) – pixel-art shapes via `fr()` helper
  3. Footsteps (fade over 1 s)
  4. Click-target highlight
  5. NPCs (`drawNPC()`) + building labels
  6. Player knight (`drawKnight()`) – legs animated with `walkFrame 0/1`
  7. Interaction hints
  8. Hotbar (5 inventory slots)
  9. Room name label + stats sidebar
  10. Fade overlay (room transition)

### Input
- **Keyboard**: `keydown/keyup` populate `keys{}`. WASD/arrows → move; 1–5 → select hotbar slot; E → interact (chest or NPC); Escape → close modal.
- **Mouse**: Click on canvas → if adjacent to NPC/chest triggers dialog/chest modal; otherwise BFS pathfind to clicked tile. Hotbar area click → select/use item.
- `modalOpen` flag pauses movement input while dialogs are open.

### Pathfinding
- BFS from player tile to click target; outputs `{x,y}[]` path (excludes start).
- Blocked by non-WALKABLE tiles and NPC positions.
- Path stored in `player.path[]`; one tile consumed per animation step.

---

## File Responsibilities

| File | Responsibility |
|------|---------------|
| `index.html` | Shop homepage – product grid, navigation to games |
| `product1–4.html` | Product detail pages – image, price, Add-to-Cart |
| `checkout.html` | Shopping cart review and checkout |
| `cart.js` | `getCart()` / `saveCart()` – localStorage cart persistence |
| `cursor.js` | `createSlash(x,y)` – SVG slash animation on mouse click |
| `game.html` | Sword Slash mini-game – click-reaction, 30 s timer, 3 lives |
| `game2.html` | Knight's Quest RPG – entire game: map data, rendering, input, game loop |
| `images/` | All assets: product photos, backgrounds, tile/sprite graphics |

---

## Key Constants (game2.html)

```js
const TILE = 40;      // px per tile
const COLS = 30;      // tiles wide per room
const ROWS = 16;      // tiles tall per room
const WALK_DUR = 0.143; // seconds per tile step (~143 ms)
```

## State Variables (game2.html)

```js
let roomIdx          // current room index (0–7)
let modalOpen        // blocks input when dialog/chest open
const player         // player object (see Player section)
const inventory      // [null × 5] hotbar slots
const keys           // held-key map
const footsteps      // [{x,y,age,facing}] trailing footprints
const fade           // {active, alpha, phase, targetRoom, spawnX, spawnY}
```
