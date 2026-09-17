# FULL Visio-faithful redraw — PFD-STA-RIG

Date: 2026-09-17 (CT)
Source: `/workspace/pfs-visio-full-1.png` (+ `pfs-ref-a-1.png`, layout crops)
Scope: `src/components/pid/*` only. **No** `src/lib/sim/*` edits.

## What changed

### Dual choke → Visio 2×2 CrossBlock grid
Visio topology restored (was mid-rail CrossBlocks only):

```
        C-3 ↑    Chk A    ↑ C-4
       [TL]────── C-5 ──────[TR]     ← upper equalize rail
         │  inlet@RET_Y  │
       [BL]────── C-8 ──────[BR]     ← lower equalize rail (peer to C-5)
        C-6 ↓    Chk B    ↓ C-7
```

- **C-5** on top CrossBlock row; **C-8** on bottom CrossBlock row (NOT Ck-B isolation).
- Inlet/outlet at **RET_Y** mid-spine between TL/BL and TR/BR.
- `linedB = C-1 ∧ C-6 ∧ C-7`; bypass = C-5 ∨ C-8 (physics unchanged).

### Equipment / sheet proportions
- Sheet **2580×1680**; anchors nudged toward Visio A–I / 1–6 grid.
- FL column `FL_X=760` (adjacent to BOP); Dual choke `LX/RX=1090/1310`; FM `1600`; MGS `2200/270`.
- Skid boxes retitled bounds for pumps, standpipe, trip tank, FL, dual choke, FM-01.
- `pan-zoom` CONTENT_* → **40,24 / 2380×1280** so fit-to-view frames pumps→MGS + manifold.

### Pipe routes / Visio details
- **MGS→FL**: hopper bottom → drop → right stub → climb at `MGS_OUT_DROP_X` → left to F-3/FL (Sergio override; Visio top-lateral ignored for the outlet).
- **FL laterals**: F3 = MGS→FL, F4 = FL→MGS, F5 = D-4/D-5 corridor; To Shakers at column top.
- **Hose zigzags**: trip-tank fill-up drop; E-4 drop into E-6/E-5 (new `hoseZigzagD` + `Hose`).
- **PipeJump**: MGS→FL climb × package inlet; flare × F3; SP × FL tee.
- Manifold outlets unchanged: To Trip Tank / To MGS / To Panic Line / To Shakers.
- Kill line left into BOP spool; WC mute + E-5 template swap + M-0/K-1 visibility preserved.
- All existing ValveIds remain clickable with prior live={…} semantics.

### Symbols (`symbols.tsx`)
- `hoseZigzagD()` — orthogonal zigzag path builder.
- `Hose` — wraps Pipe (optional muted).
- `PipeJump` — semicircle non-connecting cross.

### Equipment (`equipment.tsx`)
- MGS F-4 nozzle local Y nudged to match F4_Y.

## Intentional approximations (interactive HMI constraints)

1. **Rig choke manifold** internal Visio tree (many untagged gates, remote/manual legs) stays simplified to M-1…M-8 + Remote choke — four labeled outlets preserved.
2. **ProcessChoke** glyph (vertical stubs) sits on horizontal Chk A/B rails — same interactive control as before; Visio choke body is more “in-line horizontal.”
3. **Hose zigzags** are approximate square-wave paths, not Visio polyline fidelity.
4. **Jumps** only at key crossings (not every Visio jump).
5. **BOP / RCD** artwork is the existing interactive stack, not a Visio bit-for-bit redraw.
6. **FM-01** Coriolis glyph stays the loop icon; Visio may show a simpler meter block.
7. Visio **grid letters/numbers / title block / valve legend** not reproduced (HMI chrome).

## ValveId gaps for Code Ninja

Do **not** invent UI ids. Visio tags seen that map or need consideration:

| Visio tag | Status |
|-----------|--------|
| **E-5b** | Already mapped → our **E-6** (stacked on E-4 drop). |
| Extra untagged manifold gates | Visio shows more bow-ties than M-1…M-8; keep decorative or add ids later. |
| RCD “CR” style actuators (some crops) | Not in ValveId union — cosmetic only unless Ninja adds. |
| Standpipe spare dead-leg valves | S-5 present; Visio may show additional unlabeled stubs. |

No new ValveIds added in this pass.

## Physics deltas

**None.** Geometry / live stub lighting only. Bypass still `C-5 ∨ C-8`; `linedB` unchanged; D-4∧D-5 = to-FL; D-6 = to-MGS.

Optional future sim nicety (not done): dedicated `choke-bypass` LiveSegment so equalize rails light from physics bits instead of `primLive && v(C-5|C-8)`.

## Files changed

- `src/components/pid/schematic.tsx` — full Visio-faithful layout + routes
- `src/components/pid/symbols.tsx` — hose zigzag + PipeJump
- `src/components/pid/equipment.tsx` — MGS nozzle Y
- `src/components/pid/pan-zoom.tsx` — CONTENT_* bbox
- `FULL_REDRAW_NOTES.md` — this file

## PFD training HMI pass (2026-09-17 CT) — Lucid/PIC001 frame

Still a PFD / training HMI (`PFD-STA-RIG-01`), not a construction P&ID.

1. **Flow chevrons** on primary paths: returns (C-1→chokes→FM→D-6→MGS), kill drop, FL↔MGS laterals, D-5→FL. MGS→F-3 uses `FlowChevron` (path order already MGS→FL).
2. **DrawingLegend** (bottom-left): open/closed, live dash, hose vs hard pipe, jump, WC/Kill mute note.
3. **ISA S5.1 bubbles** (field): WHP=`PI`, SPP=`PI`, FM-01=`FT`+`FI` beside existing numeric chips. No new ValveId / LiveSegment.
4. **LineClassTag**: `5K RET`, `10K CK`, `FILL-UP`.
5. **SpecBreak** consistency: F-3/F-4 laterals, E-4 hose drop, meter riser (D-1), existing FL/F-5/fill marks kept.

Skipped: root valves, tubing, every elbow/tee, dense P/T tables, inventing manifold ValveIds.

<!-- pages-retrigger: Cate ISA UI on main -->
