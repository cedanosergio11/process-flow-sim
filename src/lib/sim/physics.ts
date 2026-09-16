import {
  ANNULAR_MAWP,
  CV_MAX_AUTO,
  CV_MAX_MANIFOLD,
  ESD_PSI,
  GAL_PER_STROKE,
  WARN_PSI,
} from "./catalog";
import { LIVE, type Alarm, type LogEntry, type SimState, type TrendSample, type ValveId } from "./types";

function open(s: SimState, id: ValveId) {
  return s.valves[id] === "open";
}

function chokeCv(linedUp: boolean, pos: number, cvMax: number) {
  if (!linedUp) return 0;
  const x = Math.max(0, Math.min(100, pos)) / 100;
  return cvMax * Math.pow(x, 1.55);
}

function jitter(t: number, seed: number, amp: number) {
  return (
    Math.sin(t * 1.73 + seed) * amp * 0.55 +
    Math.sin(t * 4.19 + seed * 1.7) * amp * 0.3 +
    Math.sin(t * 9.04 + seed * 0.4) * amp * 0.15
  );
}

function pushLog(log: LogEntry[], t: number, msg: string): LogEntry[] {
  const next = [...log, { t, msg }];
  return next.length > 48 ? next.slice(next.length - 48) : next;
}

function sameAlarms(a: Alarm[], b: Alarm[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.code !== b[i]!.code || a[i]!.label !== b[i]!.label) return false;
  }
  return true;
}

const NO_ALARMS: Alarm[] = [];

export function stepSim(s: SimState, dt: number): SimState {
  const dtC = Math.min(Math.max(dt, 0), 0.05);
  const t = s.simTime + dtC;

  const qStroke = s.pumps.reduce(
    (sum, p) => sum + (p.on ? p.spm * GAL_PER_STROKE : 0),
    0,
  );
  const gps = GAL_PER_STROKE;
  const t1 = s.pumps[0]!.on ? s.pumps[0]!.spm * gps : 0;
  const t2 = s.pumps[1]!.on ? s.pumps[1]!.spm * gps : 0;
  const t3 = s.pumps[2]!.on ? s.pumps[2]!.spm * gps : 0;
  const s1 = open(s, "S-1");
  const s2 = open(s, "S-2");
  const s3 = open(s, "S-3");
  const s4 = open(s, "S-4");
  const s6 = open(s, "S-6");
  const s7 = open(s, "S-7");
  const qDrill = s6 ? t3 + (s2 ? t2 + (s1 ? t1 : 0) : 0) : 0;
  const qKill = s4 ? t1 + (s1 ? t2 + (s2 ? t3 : 0) : 0) : 0;
  const qCmd = s.template === "kill" ? qKill : qDrill;
  const reachBleed = t3 + (s3 ? (s2 ? t2 + (s1 ? t1 : 0) : 0) : 0);
  const qSpp = s7 ? reachBleed : 0;

  const pathIn = open(s, "C-1");
  const aUp = open(s, "C-3");
  const aDn = open(s, "C-4");
  const bUp = open(s, "C-6");
  const bDn = open(s, "C-7");
  const linedA = pathIn && aUp && aDn;
  const linedB = pathIn && bUp && bDn;
  const linedM = open(s, "E-4") && open(s, "E-5") && open(s, "M-1") && open(s, "M-2");
  const chokeBypass = pathIn && open(s, "C-5");
  const killIn = s.template === "kill" && open(s, "E-5") && s4 && open(s, "B-1") && open(s, "K-1");

  const cvA = chokeCv(linedA, s.ckA, CV_MAX_AUTO);
  const cvB = chokeCv(linedB, s.ckB, CV_MAX_AUTO);
  const cvM = chokeCv(linedM, s.ckM, CV_MAX_MANIFOLD);
  const cvBypass = chokeBypass ? 160 : 0;
  const cvTotal = cvA + cvB + cvM + cvBypass;

  const meterRun = open(s, "D-1") && open(s, "D-2");
  const meterBypass = open(s, "D-3");
  const toFl = open(s, "D-4") && open(s, "D-5");
  const toMgs = open(s, "D-6");
  const meterSectionOpen = (meterRun || meterBypass) && (toMgs || toFl);
  const mpdDownstream = meterSectionOpen;
  const manifoldDownstream = linedM;

  const chokeServiceOpen = cvA + cvB + cvBypass > 0.35;
  const mpdPath = chokeServiceOpen && mpdDownstream;
  const killPath = killIn && qCmd > 0.5;
  const returnsPath =
    (mpdPath || (cvM > 0.35 && manifoldDownstream) || killPath) &&
    (pathIn || killPath || linedM);

  let qTarget = 0;
  if (qCmd > 0.5 && returnsPath) qTarget = qCmd;

  const qGpmRaw = s.qGpm + (qTarget - s.qGpm) * (1 - Math.exp(-dtC / 0.55));
  const qGpm = Math.abs(qTarget - qGpmRaw) < 0.25 ? qTarget : qGpmRaw;

  const qThroughChokes = mpdPath
    ? qGpm * ((cvA + cvB + cvBypass) / Math.max(cvTotal, 1e-6))
    : 0;
  const qManifold = linedM && cvM > 0.35 ? qGpm * (cvM / Math.max(cvTotal, 1e-6)) : 0;

  let qFm = 0;
  let meterQuality: SimState["meterQuality"] = "NO FLOW";
  if (qThroughChokes > 1) {
    if (meterRun && !meterBypass) {
      qFm = qThroughChokes;
      meterQuality = "GOOD";
    } else if (meterRun && meterBypass) {
      qFm = qThroughChokes * 0.12;
      meterQuality = "BYPASS";
    } else if (meterBypass) {
      qFm = 0;
      meterQuality = "BYPASS";
    } else {
      qFm = 0;
      meterQuality = "ISOLATED";
    }
  } else if (!meterRun && (meterBypass || (!toMgs && !toFl))) {
    meterQuality = meterRun ? "NO FLOW" : "ISOLATED";
  }

  const sg = s.mudWeight / 8.337;
  const pDown = 14 + (toMgs ? 8 : 0);
  let pWh = s.pWh;
  const blocked = qCmd > 8 && pathIn && !returnsPath;
  const shutIn = qCmd > 8 && !pathIn;

  if (blocked || shutIn) {
    const ramp = (qCmd / 400) * 210 * dtC;
    pWh = Math.min(ANNULAR_MAWP, pWh + ramp);
  } else if (qGpm < 2) {
    const settle = qCmd < 1 ? 0 : 90;
    pWh += (settle - pWh) * (1 - Math.exp(-dtC / 1.8));
  } else {
    const cvEff = Math.max(cvTotal, 0.35);
    const dP = Math.pow(qGpm / cvEff, 2) * sg * 0.92;
    const friction = 95 + 0.00022 * qGpm * qGpm;
    const target = pDown + dP + friction;
    pWh += (target - pWh) * (1 - Math.exp(-dtC / 0.7));
  }
  pWh = Math.max(0, Math.min(ANNULAR_MAWP, pWh));

  const bitLoss = 0.00048 * qCmd * qCmd;
  const pStandpipeRaw = pWh + bitLoss + 180 * sg;
  const pStandpipe = Math.abs(pStandpipeRaw - s.pStandpipe) < 0.6 ? s.pStandpipe : pStandpipeRaw;
  const pChokeDown = mpdPath ? pDown + 6 : pWh * 0.04;
  const pMgs = toMgs && qThroughChokes > 1 ? 6 + qThroughChokes * 0.012 : 2;

  const densLive = meterQuality === "GOOD" || meterQuality === "BYPASS" ? s.mudWeight : s.densityPpg;
  const qFmLive = qFm;
  const tempF =
    meterQuality === "GOOD" ? 128 + qFmLive * 0.018 : s.tempF + (86 - s.tempF) * 0.15;
  const massLbMin = qFmLive * densLive;

  let liveMask = 0;
  if (qStroke > 4) liveMask |= LIVE.pumps;
  if (qSpp > 4) liveMask |= LIVE.standpipe;
  if (s4 && qStroke > 4) liveMask |= LIVE.kill;
  if (qDrill > 4) liveMask |= LIVE.drillstring | LIVE.annulus;
  if (qGpm > 4 && pathIn) liveMask |= LIVE["to-c1"] | LIVE.primary;
  if (qGpm > 4 && linedA && cvA > 0.4) liveMask |= LIVE["choke-a"];
  if (qGpm > 4 && linedB && cvB > 0.4) liveMask |= LIVE["choke-b"];
  if (qThroughChokes > 4) liveMask |= LIVE["choke-out"];
  if (qFmLive > 2 && meterRun) liveMask |= LIVE["meter-run"];
  if (qThroughChokes > 4 && meterBypass) liveMask |= LIVE["meter-bypass"];
  if (qThroughChokes > 4 && toMgs) liveMask |= LIVE["to-mgs"];
  if (qThroughChokes > 4 && toFl) liveMask |= LIVE["to-fl"];
  if (qThroughChokes > 4 && toMgs && open(s, "F-3") && open(s, "F-1") && open(s, "F-2")) {
    liveMask |= LIVE["mgs-out"];
  }
  if (qManifold > 4) liveMask |= LIVE.manifold;
  if (killPath) liveMask |= LIVE.kill;

  let alarms: Alarm[] = [];
  if (pWh >= ESD_PSI) {
    alarms.push({
      code: "HIHI-P",
      label: `WHP ${pWh.toFixed(0)} psi — annular MAWP`,
      severity: "trip",
    });
  } else if (pWh >= WARN_PSI) {
    alarms.push({
      code: "HI-P",
      label: `WHP ${pWh.toFixed(0)} psi`,
      severity: "alarm",
    });
  }
  if (qCmd > 12 && !returnsPath) {
    alarms.push({
      code: "NO-PATH",
      label: "Pumps on — no returns path",
      severity: "alarm",
    });
  }
  if (qThroughChokes > 8 && meterQuality === "ISOLATED") {
    alarms.push({
      code: "METER-ISOL",
      label: "FM-01 isolated with returns",
      severity: "warn",
    });
  }
  if (qCmd > 12 && pathIn && s.ckA < 1 && s.ckB < 1 && !linedM && !chokeBypass && !killIn) {
    alarms.push({
      code: "CHOKE-SHUT",
      label: "Both MPD chokes shut",
      severity: "warn",
    });
  }
  if (toFl && toMgs && qThroughChokes > 8) {
    alarms.push({
      code: "SPLIT-RET",
      label: "Split returns (FL + MGS)",
      severity: "warn",
    });
  }

  let pumps = s.pumps;
  let running = s.running;
  let esd = s.esd;
  let log = s.log;

  if (!esd && pWh >= ESD_PSI && qCmd > 1) {
    esd = true;
    running = false;
    pumps = s.pumps.map((p) => ({ ...p, on: false }));
    log = pushLog(log, t, "ESD — annular HI-HI. Pumps tripped.");
    alarms.push({
      code: "ESD",
      label: "Emergency shutdown latched",
      severity: "trip",
    });
  }

  if (alarms.length === 0) alarms = NO_ALARMS;
  else if (sameAlarms(alarms, s.alarms)) alarms = s.alarms;

  let sampleAcc = s.sampleAcc + dtC;
  let trend: TrendSample[] = s.trend;
  if (sampleAcc >= 0.5) {
    sampleAcc = 0;
    trend = [
      ...s.trend,
      {
        t,
        q: qFmLive + jitter(t, 2.4, 1.2),
        p: pWh,
        dens: densLive + jitter(t, 1.1, 0.02),
        choke: Math.max(s.ckA, s.ckB, s.ckM),
      },
    ];
    if (trend.length > 48) trend = trend.slice(trend.length - 48);
  }

  return {
    ...s,
    simTime: t,
    qGpm,
    qFm: qFmLive,
    massLbMin,
    densityPpg: densLive,
    tempF,
    pWh,
    pStandpipe,
    pChokeDown,
    pMgs,
    cvA,
    cvB,
    cvM,
    liveMask,
    meterQuality,
    alarms,
    esd,
    running,
    pumps,
    log,
    trend,
    sampleAcc,
  };
}
