# Schematic route notes — PFD-STA-RIG alignment

Date: 2026-09-16 (CT)

## Scope
Geometry-only pass under `src/components/pid/*` (+ `pan-zoom.tsx` CONTENT_*).
No edits to `src/lib/sim/*`. Valve IDs and live={…} segment semantics preserved.

## What moved

### Equipment / skid placement (closer to PDF grid)
- **Pumps / standpipe** nudged left/up (KILL_X 120, P1–P3 200/310/420, SP_Y 185).
- **BOP** to (500, 660); returns at `RET_Y = BOP_Y + 20`.
- **Flow Line** column `FL_X` 940 → **820** (adjacent to BOP like sheet col C).
- **Dual choke** header blocks `LX/RX` 1120/1320 (mid sheet).
- **FM-01** center 1560; **MGS** 2120 / y 250.
- **Trip tank** skid + tank glyph shifted with BOP/FL.
- Skid boxes retitled bounds for pumps, standpipe, trip tank, FL, dual choke, FM-01.
- `pan-zoom` CONTENT_* → 50,30 / 2220×1160 to fit manifold + MGS after the shift.

### Dual choke (sheet-like)
- **C-5** remains upper-center equalize on the RET_Y rail between CrossBlocks.
- **C-8** kept at lower-center peer `(CK_MID_X, CK_6_Y)` per Ninja.
- New **C-8 equalize rail** pipes at `CK_6_Y` with Tees at LX/RX.
- **C-6 / C-7** moved down to `CK_B_ISO_Y` on the Ck-B legs (no longer share Y with C-8).
- Shared vertical stubs RET_Y→CK_6_Y light when `bLive || (C-8 && primLive)` so equalize reads connected without inventing a new LiveSegment.
- **Chk A / Chk B** centered on their rails at `CK_MID_X` (C-3→Chk A→C-4 / C-6→Chk B→C-7).
- `linedB` = C-1 ∧ C-6 ∧ C-7 (C-8 is **not** in the Ck-B lineup).

### FL ↔ MGS long horizontals
- PDF row-2 stack restored: **F3_Y** top = **MGS → FL** (F-3), **F4_Y** = **FL → MGS** (F-4), **F5_Y** = D-4/D-5 returns-to-FL corridor (closer under the laterals).
- FL vertical header order fixed (F5→F4→F3→shakers).
- **D-6** package inlet uses dedicated `MGS_IN_Y` (no longer tee’d into the MGS→FL lateral).
- MGS vessel nozzles in `equipment.tsx` matched: right = MGS→FL, left mid = FL→MGS, left lower = D-6.

### Unchanged (by design)
- Kill-line left vertical into spool; muted in Well control; E-5 template swap; M-0/K-1 visibility.
- Rig choke manifold outlets still **To Trip Tank / To MGS / To Panic Line / To Shakers**.
- Orthogonal HV routing; click handlers / valve IDs untouched.

## C-8 note (for Code Ninja)
- PDF and sim both have **C-8**.
- Role: **lower equalize / bypass**, peer to **C-5** — **not** Ck-B isolation.
- Physics already: `chokeBypass = C-5 ∨ C-8`; `linedB = C-1 ∧ C-6 ∧ C-7`.
- UI now draws the lower equalize rail and places the valve on it. No type/catalog change required for this pass.

## Physics deltas for Ninja
None taken in this pass. Visual-only stub lighting for C-8 on the shared RET→CK_6 drop uses existing valve open state + `primLive` / `bLive` (does not change which LiveSegment bits physics sets).

If Ninja wants a dedicated `choke-bypass` live bit so bypass lights without relying on `primLive` + local `v("C-5"|"C-8")`, that would be a sim change outside this geometry pass.

## Files changed
- `src/components/pid/schematic.tsx` — positions, pipe `d`, dual-choke + FL routes
- `src/components/pid/equipment.tsx` — MGS nozzle Y alignment
- `src/components/pid/pan-zoom.tsx` — CONTENT_* bbox
- `SCHEMATIC_ROUTE_NOTES.md` — this file
