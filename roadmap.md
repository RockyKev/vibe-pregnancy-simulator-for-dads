# Alter Life — Development Checklist

## ✅ Global Rules
- [x] Node state is derived: `requires[]` → unlocked/completed logic
- [x] 15 stats initialized at 0
- [x] All stat changes in early phases are +1
- [x] Inventory item = emoji icon + 1–3 sentence blurb
- [x] Achievements = badge + name + description
- [x] Save system: versioned `localStorage`
- [ ] Title screen shows Load if save exists, otherwise New Game
- [x] Game is English-only

---

## 🟦 Phase 1 — Core Loop (5-node vertical slice)

### Engineering
- [x] Project bootstrapped (TypeScript + web stack)
- [ ] Title screen: New Game / Load / Options (volume sliders)
- [x] Game UI with 3 tabs:
  - [x] Story Navigator
  - [x] Dialog + Choice
  - [x] Stats / Inventory / Achievements
- [x] Navigator renders 5-node graph with correct locking
  - [x] N1: requires []
  - [x] N2: requires [N1]
  - [x] N3: requires [N1]
  - [x] N4: requires [N3]
  - [x] N5: requires [N3]
- [x] Dialog engine: prose → radio groups → resolve
- [x] Resolve applies +1 to stat, grants item, unlocks achievement
- [x] Autosave after node resolve
- [x] Load restores last state (save schema v1)

### Content
- [x] 5 story scenes (one per node)
- [x] 1 inventory item (emoji + blurb)
- [x] 1 achievement ("Started the Game")

### Acceptance
- [x] Player completes N1 → unlocks N2 & N3
- [x] Player completes N3 → unlocks N4 & N5
- [x] Stats increase correctly
- [x] Item granted
- [x] Achievement unlocks
- [x] Reloading continues gameplay

---

## 🟧 Phase 2 — Tools + Full Act (21 nodes)

### Engineering
- [x] Move all content to JSON
- [ ] Review src
- [ ] Add schema validation (Zod or JSON Schema)
- [ ] Add Debug menu:
  - [ ] Ignore Node Locks (toggle)
  - [ ] Unlock All (this act)
- [ ] Navigator: zoom, pan, progress display
- [x] Options expanded:
  - [x] Dark Mode (Yes/No)
  - [x] Text Size (S/M/L)
  - [x] Reduce Motion (Yes/No)
- [ ] Save schema updated to v2 (migrates from v1)

### Content
- [ ] Full 21-node act authored using simple `requires[]` rule
- [ ] Several inventory items added
- [ ] Several achievements added

### Acceptance
- [ ] Full act can be completed start to finish
- [ ] JSON validation catches missing/wrong content
- [ ] Debug tools work without corrupting saves
- [ ] UI reflects options (dark mode, text size)

---

## 🟩 Phase 3 — Multi-Act Expansion + Polish

### Engineering
- [ ] Add remaining acts (same node system)
- [ ] Act Transition Screen between acts
- [ ] Finalize and lock down stat definitions + deltas
- [ ] Visual polish: layout, icons, badges
- [ ] Integrate audio:
  - [ ] Music (your selected tracks)
  - [ ] Sound effects
- [ ] Add controller support
- [ ] Final performance and accessibility pass

### Acceptance
- [ ] Full playthrough across all acts is stable
- [ ] All assets present (no placeholders)
- [ ] Audio system fully integrated
- [ ] Controller works for navigation and decisions
- [ ] Accessibility features pass basic usability
