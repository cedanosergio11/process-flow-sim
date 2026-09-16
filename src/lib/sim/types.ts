export type ValveId =
  | "C-1" | "C-2" | "C-3" | "C-4" | "C-5" | "C-6" | "C-7" | "C-8"
  | "D-1" | "D-2" | "D-3" | "D-4" | "D-5" | "D-6"
  | "E-1" | "E-2" | "E-3" | "E-4" | "E-5" | "E-6"
  | "S-1" | "S-2" | "S-3" | "S-4" | "S-5" | "S-6" | "S-7"
  | "F-1" | "F-2" | "F-3" | "F-4" | "F-5" | "F-6"
  | "T-1" | "T-2"
  | "B-1" | "B-2"
  | "K-1"
  | "M-0" | "M-1" | "M-2" | "M-3" | "M-4" | "M-5" | "M-6" | "M-7" | "M-8";


export type ValveState = "open" | "closed";
export type ValveKind = "ball" | "gate" | "check";
export type Rating = "5K" | "10K";

export type PumpId = "T1" | "T2" | "T3";

export type Selection =
  | { kind: "valve"; id: ValveId }
  | { kind: "choke"; id: "CK-A" | "CK-B" | "CK-M" }
  | { kind: "meter"; id: "FM-01" }
  | { kind: "pump"; id: PumpId }
  | { kind: "bop" }
  | { kind: "mgs" }
  | null;

export type AlarmCode =
  | "HI-P"
  | "HIHI-P"
  | "NO-PATH"
  | "METER-ISOL"
  | "CHOKE-SHUT"
  | "SPLIT-RET"
  | "ESD";

export type Alarm = {
  code: AlarmCode;
  label: string;
  severity: "warn" | "alarm" | "trip";
};

export type LiveSegment =
  | "pumps"
  | "standpipe"
  | "drillstring"
  | "annulus"
  | "to-c1"
  | "primary"
  | "choke-a"
  | "choke-b"
  | "choke-out"
  | "meter-run"
  | "meter-bypass"
  | "to-mgs"
  | "mgs-out"
  | "to-fl"
  | "manifold"
  | "kill";

export const LIVE: Record<LiveSegment, number> = {
  pumps: 1 << 0,
  standpipe: 1 << 1,
  drillstring: 1 << 2,
  annulus: 1 << 3,
  "to-c1": 1 << 4,
  primary: 1 << 5,
  "choke-a": 1 << 6,
  "choke-b": 1 << 7,
  "choke-out": 1 << 8,
  "meter-run": 1 << 9,
  "meter-bypass": 1 << 10,
  "to-mgs": 1 << 11,
  "mgs-out": 1 << 12,
  "to-fl": 1 << 13,
  manifold: 1 << 14,
  kill: 1 << 15,
};

export function isLive(mask: number, id: LiveSegment) {
  return (mask & LIVE[id]) !== 0;
}

export type LogEntry = {
  t: number;
  msg: string;
};

export type TrendSample = {
  t: number;
  q: number;
  p: number;
  dens: number;
  choke: number;
};

export type Pump = {
  id: PumpId;
  name: string;
  on: boolean;
  spm: number;
};

export type TemplateId = "wc" | "kill";

export type SimState = {
  running: boolean;
  template: TemplateId;
  valves: Record<ValveId, ValveState>;
  ckA: number;
  ckB: number;
  ckM: number;
  pumps: Pump[];
  mudWeight: number;
  simTime: number;
  qGpm: number;
  qFm: number;
  massLbMin: number;
  densityPpg: number;
  tempF: number;
  pWh: number;
  pStandpipe: number;
  pChokeDown: number;
  pMgs: number;
  cvA: number;
  cvB: number;
  cvM: number;
  liveMask: number;
  meterQuality: "GOOD" | "NO FLOW" | "ISOLATED" | "BYPASS";
  alarms: Alarm[];
  esd: boolean;
  selected: Selection;
  log: LogEntry[];
  trend: TrendSample[];
  sampleAcc: number;
  hintDismissed: boolean;
};

export type PresetId =
  | "cka"
  | "ckb"
  | "dual"
  | "tofl"
  | "split"
  | "bypass"
  | "manifold"
  | "shutin";
