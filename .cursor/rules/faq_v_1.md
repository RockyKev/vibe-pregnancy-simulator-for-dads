# FAQ – Vibe Pregnancy Simulator for Dad (v1)

_Last updated: Sept 1, 2025_

## Purpose
Single-play, narrative game where you play as the dad in a supportive role during pregnancy. Short vertical slice first (first trimester / 5-node graph), then expand.

---

## Technology & Setup
- **Framework:** Vue 3
- **Language:** TypeScript
- **Bundler/Dev:** Vite with HMR
- **Styling:** Minimal hand-rolled CSS (no Tailwind, no full design system for the slice)
- **Component libs:** None by default. Optional later: Headless UI (Vue) or radix-vue for primitives. Avoid full DS (Vuetify/Naive/Quasar) unless we choose one explicitly.

---

## UI / UX
- **Bottom navigation (fixed):** 4 buttons with widths ≈ **30% / 30% / 30% / 10%**
  - **Tab 1 – Story** (decision-tree navigator)
  - **Tab 2 – Dialog** (prose + radio-group choices)
  - **Tab 3 – Stats** (inner tabs: Stats / Inventory / Achievements)
  - **Gear** (settings: mute, reset slice, export/import save)
- **Locking behavior:** When Dialog (Tab 2) is open, **other tabs and gear are disabled** until the node resolves.
- **Visual style:** Minimalist, warm/neutral palette. Emojis for items/achievements.

---

## Tab Specs
### Tab 1 – Story Navigator
- Looks like a **basic decision tree**.
- **Node states:**
  - **Locked** – cannot click (prereqs not completed)
  - **Unlocked** – playable (click to open Dialog)
  - **Completed** – finished story node
- **Goal:** Reach bottom/mainline (~20 nodes start→finish). Optional side nodes for extra story.
- **Unlock rule:** A node becomes **Unlocked** when **all nodes in its `requires`** list are **Completed**.

### Tab 2 – Dialog + Choice
- Flow: **Prose → 1–3 radio groups → Next step → repeat or resolve**.
- Supports multiple groups per step (each group required before continuing).
- **Effects:** Steps/choices can change stats, grant items, and award achievements.
- **Blocking:** While a node is active, bottom nav is disabled until resolve.

### Tab 3 – Stats Hub
- **Inner tabs:**
  1. **Stats** – ~15 bars, each 0–100 (placeholder list below)
  2. **Inventory** – two-column layout
     - **Left:** scrollable emoji tiles
     - **Right:** details panel (name, description, flavor/notes)
  3. **Achievements** – two-column layout
     - **Left:** emoji badges grid (locked show faint/“?”)
     - **Right:** description; optional unlock hint text

---

## Content & Data
- First slice content source: `first-trimester.json` (5-node sample). Use as source of truth for the vertical slice.
- `overview.mdc` and `technical-doc.mdc` contain deeper spec (tabs, rules, etc.). Use when accessible.

### JSON Conventions (slice)
- **Graph:**
  - `nodes[]`: `{ id, title, requires[], sceneId }`
  - A node is playable when **all** `requires` are completed.
- **Scenes/Steps:**
  - `scenes[]`: `{ id, title, steps[], onResolve? }`
  - `steps[]`: `{ id, prose, choices?, next }`
  - **Overloaded `next`:**
    - **String** → linear next step
    - **Map** → `choiceId -> stepId` (supports `default`)
- **Effects:**
  - `statDelta` (e.g., support +1)
  - `onResolve`: `grantItem`, `grantAchievement`

---

## State Management (slice)
- **No external store** (Pinia not required for the slice).
- Single `reactive` game state via a tiny composable or root state:
  - `progress`: `{ completed: Set<NodeID>, unlocked: Set<NodeID>, currentNode?: NodeID }`
  - `stats`: `Record<string, number>`
  - `inventory`: `string[]`
  - `achievements`: `string[]`

---

## Development Approach
- Start with the **5-node vertical slice**.
- **No debug menu**.
- **No test harness** (manual testing for the slice).
- Minimal CSS only.

---

## Stats (placeholder list; 0–100)
Will finalize after docs are accessible. For now:
1. support
2. knowledge
3. communication
4. preparation
5. presence
6. empathy
7. energy
8. finances
9. relationship
10. patience
11. organization
12. resilience
13. attentiveness
14. problemSolving
15. health

---

## Inventory & Achievements (emojis)
- **Inventory:** earned via scenes; emoji-first. Details show on right panel.
- **Achievements:** pool of unlockables; emoji badges. Some awarded via `onResolve`.

---

## Open Items / Next Steps
- Re-upload or paste contents of **overview.mdc** and **technical-doc.mdc** in a way this workspace can read.
- Provide/confirm the **full ~20-node** structure for the first act when ready.
- Confirm final **15 stats** names, ranges, and any cross-effects.
- Provide the full content JSONs for additional acts when available.

---

## How to hand off to Cursor (quick checklist)
- Use Vue 3 + TS + Vite scaffold.
- Implement bottom nav (30/30/30/10) + locking behavior.
- Build Story Navigator, Dialog, and Stats Hub (with inner tabs) as above.
- Wire to `first-trimester.json` for the slice.
- Keep styling minimal; emojis for items/achievements.

