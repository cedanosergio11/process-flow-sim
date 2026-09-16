import { create } from "zustand";
import { startTransition } from "react";
import {
  DEFAULT_PUMPS,
  DEFAULT_VALVES,
  PRESETS,
} from "./catalog";
import { stepSim } from "./physics";
import type {
  PresetId,
  PumpId,
  Selection,
  SimState,
  TemplateId,
  ValveId,
} from "./types";

type Actions = {
  tick: (dt: number) => void;
  flushUi: () => void;
  startFlow: () => void;
  stopFlow: () => void;
  toggleValve: (id: ValveId) => void;
  setValve: (id: ValveId, state: "open" | "closed") => void;
  setChoke: (id: "CK-A" | "CK-B" | "CK-M", value: number) => void;
  nudgeChoke: (id: "CK-A" | "CK-B" | "CK-M", delta: number) => void;
  togglePump: (id: PumpId) => void;
  setSpm: (id: PumpId, spm: number) => void;
  setMudWeight: (ppg: number) => void;
  select: (sel: Selection) => void;
  applyPreset: (id: PresetId) => void;
  setTemplate: (id: TemplateId) => void;
  resetLineup: () => void;
  resetEsd: () => void;
  dismissHint: () => void;
};

const initial = (): SimState => ({
  running: true,
  template: "wc",
  valves: { ...DEFAULT_VALVES },
  ckA: 38,
  ckB: 0,
  ckM: 0,
  pumps: DEFAULT_PUMPS.map((p) => ({ ...p })),
  mudWeight: 10.6,
  simTime: 0,
  qGpm: 0,
  qFm: 0,
  massLbMin: 0,
  densityPpg: 10.6,
  tempF: 118,
  pWh: 220,
  pStandpipe: 980,
  pChokeDown: 18,
  pMgs: 4,
  cvA: 0,
  cvB: 0,
  cvM: 0,
  liveMask: 0,
  meterQuality: "NO FLOW",
  alarms: [],
  esd: false,
  selected: null,
  log: [{ t: 0, msg: "Lineup: Ck-A in service · FM-01 in line" }],
  trend: [],
  sampleAcc: 0,
  hintDismissed: false,
});

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function chokeKey(id: "CK-A" | "CK-B" | "CK-M"): "ckA" | "ckB" | "ckM" {
  if (id === "CK-A") return "ckA";
  if (id === "CK-B") return "ckB";
  return "ckM";
}

let engine: SimState | null = null;

function withControls(sim: SimState, ui: SimState): SimState {
  return {
    ...sim,
    valves: ui.valves,
    ckA: ui.ckA,
    ckB: ui.ckB,
    ckM: ui.ckM,
    pumps: sim.esd ? sim.pumps : ui.pumps,
    running: sim.esd ? sim.running : ui.running,
    template: ui.template,
    mudWeight: ui.mudWeight,
    selected: ui.selected,
    hintDismissed: ui.hintDismissed,
    log: ui.log.length >= sim.log.length ? ui.log : sim.log,
  };
}

export const useSim = create<SimState & Actions>()((set, get) => ({
  ...initial(),

  tick: (dt) => {
    const ui = get();
    engine = stepSim(withControls(engine ?? ui, ui), dt);
  },

  flushUi: () => {
    if (!engine) return;
    const snap = engine;
    startTransition(() => {
      set({
        simTime: snap.simTime,
        qGpm: snap.qGpm,
        qFm: snap.qFm,
        massLbMin: snap.massLbMin,
        densityPpg: snap.densityPpg,
        tempF: snap.tempF,
        pWh: snap.pWh,
        pStandpipe: snap.pStandpipe,
        pChokeDown: snap.pChokeDown,
        pMgs: snap.pMgs,
        cvA: snap.cvA,
        cvB: snap.cvB,
        cvM: snap.cvM,
        liveMask: snap.liveMask,
        meterQuality: snap.meterQuality,
        alarms: snap.alarms,
        esd: snap.esd,
        running: snap.running,
        pumps: snap.pumps,
        trend: snap.trend,
        sampleAcc: snap.sampleAcc,
        log: snap.log,
      });
    });
  },

  startFlow: () => {
    const s = get();
    const anyOn = s.pumps.some((p) => p.on);
    const pumps = anyOn
      ? s.pumps
      : s.pumps.map((p, i) => (i < 2 ? { ...p, on: true, spm: p.spm || 68 } : p));
    const patch = {
      running: true,
      esd: false,
      pumps,
      log: [...s.log, { t: s.simTime, msg: "Circulation started" }].slice(-48),
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  stopFlow: () => {
    const s = get();
    const pumps = s.pumps.map((p) => ({ ...p, on: false }));
    const patch = {
      running: false,
      pumps,
      log: [...s.log, { t: s.simTime, msg: "Circulation stopped" }].slice(-48),
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch, esd: false };
  },

  toggleValve: (id) => {
    const s = get();
    const next = s.valves[id] === "open" ? "closed" : "open";
    const valves = { ...s.valves, [id]: next };
    const patch = {
      valves,
      selected: { kind: "valve" as const, id },
      log: [...s.log, { t: s.simTime, msg: `${id} ${next.toUpperCase()}` }].slice(-48),
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  setValve: (id, state) => {
    const s = get();
    if (s.valves[id] === state) {
      set({ selected: { kind: "valve", id } });
      return;
    }
    const valves = { ...s.valves, [id]: state };
    const patch = {
      valves,
      selected: { kind: "valve" as const, id },
      log: [...s.log, { t: s.simTime, msg: `${id} ${state.toUpperCase()}` }].slice(-48),
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  setChoke: (id, value) => {
    const key = chokeKey(id);
    const patch = {
      [key]: clamp(value, 0, 100),
      selected: { kind: "choke" as const, id },
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  nudgeChoke: (id, delta) => {
    const key = chokeKey(id);
    const s = get();
    const patch = {
      [key]: clamp(s[key] + delta, 0, 100),
      selected: { kind: "choke" as const, id },
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  togglePump: (id) => {
    const s = get();
    const pumps = s.pumps.map((p) => (p.id === id ? { ...p, on: !p.on } : p));
    const running = pumps.some((p) => p.on);
    const patch = {
      pumps,
      running,
      esd: running ? false : s.esd,
      selected: { kind: "pump" as const, id },
      log: [
        ...s.log,
        {
          t: s.simTime,
          msg: `${id} ${pumps.find((p) => p.id === id)?.on ? "ON" : "OFF"}`,
        },
      ].slice(-48),
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  setSpm: (id, spm) => {
    const s = get();
    const pumps = s.pumps.map((p) =>
      p.id === id ? { ...p, spm: clamp(spm, 0, 130) } : p,
    );
    const patch = { pumps, selected: { kind: "pump" as const, id } };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  setMudWeight: (ppg) => {
    const mudWeight = clamp(ppg, 8.4, 18);
    set({ mudWeight });
    if (engine) engine = { ...engine, mudWeight };
  },

  select: (sel) => {
    set({ selected: sel });
    if (engine) engine = { ...engine, selected: sel };
  },

  applyPreset: (id) => {
    const p = PRESETS[id];
    const s = get();
    const patch = {
      template: (id === "manifold" ? "wc" : s.template) as TemplateId,
      valves: { ...p.valves },
      ckA: p.ckA,
      ckB: p.ckB,
      ckM: p.ckM,
      log: [...s.log, { t: s.simTime, msg: `Lineup: ${p.label}` }].slice(-48),
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  setTemplate: (id) => {
    const s = get();
    if (s.template === id) return;
    const patch = {
      template: id,
      valves: {
        ...s.valves,
        "E-4": id === "wc" ? s.valves["E-4"] : "closed",
        "E-5": "closed" as const,
      },
      ckM: id === "kill" ? 0 : s.ckM,
      selected: null,
      log: [
        ...s.log,
        {
          t: s.simTime,
          msg: id === "wc" ? "Template: well control" : "Template: kill line",
        },
      ].slice(-48),
    };
    set(patch);
    if (engine) engine = { ...engine, ...patch };
  },

  resetLineup: () => {
    const s = get();
    engine = null;
    set({
      ...initial(),
      hintDismissed: s.hintDismissed,
      log: [{ t: 0, msg: "Lineup reset — Ck-A in service · FM-01 in line" }],
    });
  },

  resetEsd: () => {
    set({ esd: false });
    if (engine) engine = { ...engine, esd: false };
  },

  dismissHint: () => {
    set({ hintDismissed: true });
    if (engine) engine = { ...engine, hintDismissed: true };
  },
}));
