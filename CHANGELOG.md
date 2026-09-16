# Changelog

## 1.4.1.0 — 2026-08-26

Standpipe, MGS, and fit-view.

- S-3 / S-7 gate SPP bleed. S-4 gates the kill line.
- D-4–D-5 line. C-2 tees into RCD–C-1. MGS dual inlets. Brown flow dashes. SPP gauge. Fit shows the whole sheet.

## 1.4.0.0 — 2026-08-26

Every valve actuates.

- Flow line F-1–F-6, trip tank T-1/T-2, spool HCRs B-1/B-2, kill check K-1, manifold M-0–M-8, E-6.

## 1.3.9.0 — 2026-08-26

Standpipe valves.

- S-1 / S-2 / S-3 header, S-4 kill wing, S-5 spare, S-6 drill string are clickable.
- S-6 closed = no downhole. S-4 closed = no kill line.

## 1.3.8.0 — 2026-08-26

Full-panel layout.

- Sheet is 2480×1760 — not a landscape PFD page.
- Camera fills the panel using the browser aspect.

## 1.3.7.0 — 2026-08-26

Square routing.

- All process lines use right-angle corners (E-4 to E-5, C-2 into the RCD, fill-up drop).

## 1.3.6.0 — 2026-08-26

E-4 ties into E-5.

- E-4 hose drops from the MPD header and ties into E-5 from above (same inlet as the spool choke line).

## 1.3.5.0 — 2026-08-26

Performance.

- PFD no longer redraws on every sim tick.
- Ticker 10 Hz, pauses when the tab is hidden.
- SVG sparklines instead of Recharts.

## 1.3.4.0 — 2026-08-26

Choke line to manifold.

- Spool right-hand HCR jogs up through E-5 into the rig choke manifold.
- Well-control template: E-5 takes returns down the choke line.

## 1.3.3.0 — 2026-08-26

Drill string downhole.

- Drill-string drop on the RCD centerline, through the trip-tank box into the bore.
- Trip tank sits left of that drop.

## 1.3.2.0 — 2026-08-26

Left-side spacing.

- Standpipe, trip tank, flow line, fill-up, and RCD given real estate.
- Drill string drops through the trip-tank box into the RCD.
- C-2 on the flow-line drop with a spec break, then a diagonal into the RCD.
- Fill-up: hose → spec → E-3 → E-2 → E-1 strainer.

## 1.3.1.0 — 2026-08-26

Standpipe, trip tank, flow line.

- Rig pumps, standpipe manifold, SPP bleed off, drill string, kill drop.
- Trip-tank fill-up: hose → spec break → E-3 → E-2 check → E-1 strainer into the RCD.
- Rig flow line header with To Shakers, three laterals, D-5, and C-2.

## 1.3.0.0 — 2026-08-26

PFD templates.

- Drawing simplified to the process flow diagram.
- Toggle Well control (manifold via E-4) vs Kill line (into the BOP spool).
- E-5 moves with the template. C-8 removed.

## 1.2.0.0 — 2026-08-26

Source-sheet topology.

- Dual choke: Chk A over Chk B, two header blocks, C-3/C-4/C-6/C-7 on the legs.
- C-5 and C-8 equalize / bypass. C-7 is Ck-B downstream.
- FM-01 Coriolis loop: D-1 drain, D-2 meter outlet, D-3 bypass, D-4 package outlet.
- MGS: dome, cone, manway, inlet check, bottom loop, flare stack.

## 1.1.0.0 — 2026-08-26

P&ID drawing pass.

- Paper-style drawing sheet so process lines read against a light field.
- One pipe class system (main / branch / fill). Solid lines with a live overlay.
- RCD on top of the annular, with fill-up from the trip tank.
- BOP stack: annular, three rams, drilling spool, wellhead. Kill line into the spool.
- Rig choke manifold as a two-leg 10K well-control manifold.
- Well / client names removed.

## 1.0.0.0 — 2026-08-26

Initial dual-choke MPD simulator.

- Start/stop circulation, clickable valves, adjustable chokes.
- Coriolis FM-01 readings and WHP / density trends.
