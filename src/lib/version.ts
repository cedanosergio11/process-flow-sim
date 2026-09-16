export const APP_VERSION = "1.4.2.0";

export type ChangeEntry = {
  version: string;
  date: string;
  title: string;
  notes: string[];
};

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "1.4.2.0",
    date: "2026-09-15",
    title: "Exclusive returns + CK-M SoT",
    notes: [
      "Default Well control returns to MGS only (D-6); D-4∧D-5 closed. Presets: To flow line, Split returns.",
      "Kill/rig side closed on WC circulating default. CK-M service = schematic E-4∧E-5∧M-1∧M-2.",
      "SPLIT-RET warn when FL and MGS both open with flow. Bench fidelity limits documented in dock.",
    ],
  },
  {
    version: "1.4.1.0",
    date: "2026-08-26",
    title: "Standpipe, MGS, and fit-view",
    notes: [
      "S-3 and S-7 gate the SPP bleed-off. S-4 gates kill-line charge from the header.",
      "D-4 to D-5 line added. C-2 tees into the RCD–C-1 header. S-7 added on the bleed.",
      "MGS has separate D-6 and F-3 inlets. Fit view shows the whole sheet. SPP gauge at the pumps. Live dashes are brown.",
    ],
  },
  {
    version: "1.4.0.0",
    date: "2026-08-26",
    title: "Every valve actuates",
    notes: [
      "Flow line (F-1–F-6), trip tank (T-1/T-2), spool HCRs (B-1/B-2), kill check (K-1), and rig-manifold gates (M-0–M-8) are now clickable.",
      "E-6 is the stacked gate on the E-4 drop into E-5.",
    ],
  },
  {
    version: "1.3.9.0",
    date: "2026-08-26",
    title: "Standpipe valves",
    notes: [
      "S-1 / S-2 / S-3 (header), S-4 (kill wing), S-5 (spare stub), and S-6 (drill string) are now clickable gates.",
      "Closing S-6 blocks downhole circulation. Closing S-4 blocks the kill line. T1/T2 need S-2 open to reach the drill string.",
    ],
  },
  {
    version: "1.3.8.0",
    date: "2026-08-26",
    title: "Full-panel layout",
    notes: [
      "Drawing is no longer locked to a landscape PFD page. Sheet is 2480×1760 with real gaps between standpipe, trip tank, RCD, dual choke, FM-01, and MGS.",
      "Camera fills the panel using the browser aspect — pan and zoom to see the rest.",
    ],
  },
  {
    version: "1.3.7.0",
    date: "2026-08-26",
    title: "Square routing",
    notes: [
      "All process lines use right-angle routing — no curves on E-4/E-5, C-2 into the RCD, or the fill-up drop.",
    ],
  },
  {
    version: "1.3.6.0",
    date: "2026-08-26",
    title: "E-4 ties into E-5",
    notes: [
      "E-4 hose drops from the MPD header and ties into E-5 from above, same as the choke-line inlet to the rig manifold.",
    ],
  },
  {
    version: "1.3.5.0",
    date: "2026-08-26",
    title: "Performance",
    notes: [
      "Sim loop no longer redraws the whole PFD every tick — live flow is a bit mask, readings are isolated chips.",
      "Ticker dropped to 10 Hz and pauses when the tab is hidden.",
      "Trend strip uses a light SVG sparkline instead of Recharts.",
    ],
  },
  {
    version: "1.3.4.0",
    date: "2026-08-26",
    title: "Choke line to manifold",
    notes: [
      "Choke line drawn from the spool right-hand HCR, jogged up through E-5, into the rig choke manifold.",
      "Well-control template: opening E-5 takes returns down the choke line (does not require C-1).",
    ],
  },
  {
    version: "1.3.3.0",
    date: "2026-08-26",
    title: "Drill string downhole",
    notes: [
      "Drill-string drop shifted onto the RCD centerline so it reads as going downhole through the bore.",
      "Trip tank sits left of that drop; the flow-line connection crosses past it without a tee.",
    ],
  },
  {
    version: "1.3.2.0",
    date: "2026-08-26",
    title: "Left-side spacing",
    notes: [
      "Standpipe, trip tank, flow line, fill-up, and RCD given real estate — no more stacked symbols.",
      "Drill string is a long drop through the trip-tank box into the RCD. C-2 sits on the flow-line drop with a spec break, then a diagonal into the RCD.",
      "Fill-up is hose → spec → E-3 → E-2 → E-1 strainer on a clear run into the RCD.",
    ],
  },
  {
    version: "1.3.1.0",
    date: "2026-08-26",
    title: "Standpipe, trip tank, flow line",
    notes: [
      "Left side of the PFD completed: rig pumps, standpipe manifold, SPP bleed off, drill string, kill drop.",
      "Trip-tank fill-up drawn as hose → spec break → E-3 → E-2 check → E-1 strainer into the RCD.",
      "Rig flow line header with To Shakers, three laterals, D-5, and C-2 on the drop to returns.",
    ],
  },
  {
    version: "1.3.0.0",
    date: "2026-08-26",
    title: "PFD templates",
    notes: [
      "Drawing simplified to the process flow diagram (less instrumentation clutter).",
      "Two templates with a header toggle: Well control (E-4 hose to the rig choke manifold) and Kill line (isolation into the BOP spool).",
      "E-5 moves with the template. C-8 removed — C-5 is the single equalize / bypass.",
    ],
  },
  {
    version: "1.2.0.0",
    date: "2026-08-26",
    title: "Source-sheet topology",
    notes: [
      "Dual choke redrawn to the source sheet: Chk A over Chk B, two header blocks, C-3/C-4/C-6/C-7 on the legs.",
      "C-5 and C-8 are header equalize / choke bypass. C-7 is Ck-B downstream.",
      "FM-01 run matches the Coriolis loop: D-1 drain, D-2 on the meter outlet, D-3 bypass, D-4 package outlet.",
      "MGS redrawn as a dome-and-cone vessel with manway, inlet check, bottom loop, and flare stack.",
    ],
  },
  {
    version: "1.1.0.0",
    date: "2026-08-26",
    title: "P&ID drawing",
    notes: [
      "Paper-style drawing sheet so process lines read against a light field.",
      "One pipe class system (main / branch / fill) — solid lines with a live overlay, no mixed stroke weights on a run.",
      "RCD drawn on top of the annular, with a dedicated fill-up line from the trip tank.",
      "BOP stack redrawn as annular, three rams, drilling spool, and wellhead. Kill line ties into the spool.",
      "Rig choke manifold redrawn as a two-leg 10K well-control manifold with buffer and outlets.",
      "Well / client names removed from the HMI and title block.",
    ],
  },
  {
    version: "1.0.0.0",
    date: "2026-08-26",
    title: "Initial release",
    notes: [
      "Dual-choke MPD bench with start/stop circulation.",
      "Clickable isolation valves and adjustable Ck-A / Ck-B / manifold chokes.",
      "Coriolis FM-01: volume, mass, density, temperature, quality.",
      "Wellhead pressure, standpipe, and density trends. ESD on annular HI-HI.",
    ],
  },
];
