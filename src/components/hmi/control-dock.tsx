import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { liveFixed, liveInt } from "@/lib/sim/readout";
import { PRESETS, VALVE_META } from "@/lib/sim/catalog";
import { useSim } from "@/lib/sim/store";
import type { PresetId, SimState, ValveId } from "@/lib/sim/types";
import { cn } from "@/lib/utils";

export function ControlDock() {
  return (
    <aside className="flex h-full min-h-0 flex-col border-t border-border bg-surface lg:border-t-0 lg:border-l">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <span className="h-3 w-0.5 shrink-0 rounded-full bg-accent" aria-hidden />
        <span className="text-[10px] font-medium tracking-widest text-faint uppercase">Controls</span>
      </div>
      <Tabs defaultValue="chokes" className="flex min-h-0 flex-1 flex-col">
        <div className="px-3 pt-2.5">
          <TabsList className="w-full">
            <TabsTrigger value="chokes">
              <span className="lg:hidden">Ck</span>
              <span className="hidden lg:inline">Chokes</span>
            </TabsTrigger>
            <TabsTrigger value="meter">FM-01</TabsTrigger>
            <TabsTrigger value="valves">Valves</TabsTrigger>
            <TabsTrigger value="pumps">Pumps</TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <TabsContent value="chokes">
            <ChokePanel />
          </TabsContent>
          <TabsContent value="meter">
            <MeterPanel />
          </TabsContent>
          <TabsContent value="valves">
            <ValvePanel />
          </TabsContent>
          <TabsContent value="pumps">
            <PumpPanel />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}

function ChokePanel() {
  const ckA = useSim((s) => s.ckA);
  const ckB = useSim((s) => s.ckB);
  const ckM = useSim((s) => s.ckM);
  const cvA = useSim((s) => Math.round(s.cvA * 10) / 10);
  const cvB = useSim((s) => Math.round(s.cvB * 10) / 10);
  const cvM = useSim((s) => Math.round(s.cvM * 10) / 10);
  const valves = useSim((s) => s.valves);
  const applyPreset = useSim((s) => s.applyPreset);

  const aSvc = valves["C-3"] === "open" && valves["C-4"] === "open" && valves["C-1"] === "open";
  const bSvc = valves["C-6"] === "open" && valves["C-7"] === "open" && valves["C-1"] === "open";
  const mSvc =
    valves["E-4"] === "open" &&
    valves["E-5"] === "open" &&
    valves["M-1"] === "open" &&
    valves["M-2"] === "open";

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-muted">
        Choke sets WHP; FM-01 ≈ pump rate on the meter path. Not modeling slip,
        compressibility lag, or multiphase. Default returns: MGS only (D-6); use
        To flow line or Split returns for other destinations.
      </p>
      <ChokeCard
        tag="Ck-A"
        id="CK-A"
        pos={ckA}
        cv={cvA}
        inService={aSvc && ckA > 0.5}
        isolated={!aSvc}
      />
      <ChokeCard
        tag="Ck-B"
        id="CK-B"
        pos={ckB}
        cv={cvB}
        inService={bSvc && ckB > 0.5}
        isolated={!bSvc}
      />
      <ChokeCard
        tag="Rig manifold"
        id="CK-M"
        pos={ckM}
        cv={cvM}
        inService={mSvc && ckM > 0.5}
        isolated={!mSvc}
      />
      <ChokeDiff />
      <div>
        <p className="mb-1.5 text-[10px] font-medium tracking-widest text-faint uppercase">Lineups</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(PRESETS) as PresetId[]).map((id) => (
            <Button
              key={id}
              variant="outline"
              size="sm"
              className="h-9 justify-start"
              onClick={() => applyPreset(id)}
            >
              {PRESETS[id].label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChokeDiff() {
  const dP = useSim(
    (s) => liveInt(s.pWh, s.simTime, 1.1, 1.5) - liveInt(s.pChokeDown, s.simTime, 3.2, 0.8),
  );
  return (
    <div className="rounded-md border border-border bg-elevated p-2.5 shadow-[var(--shadow-border)]">
      <div className="mb-1.5 flex justify-between text-[11px] text-muted">
        <span className="tracking-wide uppercase">Differential</span>
        <span className="font-mono tabular-nums text-fg">{dP.toFixed(0)} psi</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
        <div className="h-full bg-accent" style={{ width: `${Math.min(100, (dP / 4000) * 100)}%` }} />
      </div>
    </div>
  );
}

function ChokeCard({
  tag,
  id,
  pos,
  cv,
  inService,
  isolated,
}: {
  tag: string;
  id: "CK-A" | "CK-B" | "CK-M";
  pos: number;
  cv: number;
  inService: boolean;
  isolated: boolean;
}) {
  const setChoke = useSim((s) => s.setChoke);
  const nudgeChoke = useSim((s) => s.nudgeChoke);
  const select = useSim((s) => s.select);

  return (
    <div
      className="rounded-md border border-border bg-elevated p-2.5 shadow-[var(--shadow-border)]"
      onClick={() => select({ kind: "choke", id })}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-wide text-fg uppercase">{tag}</span>
          {isolated ? (
            <Badge tone="closed">Isolated</Badge>
          ) : inService ? (
            <Badge tone="live">In service</Badge>
          ) : (
            <Badge>Standby</Badge>
          )}
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums leading-none text-fg">{pos.toFixed(0)}%</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={`Close ${tag} 2 percent`}
          onClick={(e) => {
            e.stopPropagation();
            nudgeChoke(id, -2);
          }}
        >
          <Minus className="size-3.5" />
        </Button>
        <Slider
          min={0}
          max={100}
          step={0.5}
          value={[pos]}
          onValueChange={(v) => setChoke(id, v[0] ?? 0)}
        />
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={`Open ${tag} 2 percent`}
          onClick={(e) => {
            e.stopPropagation();
            nudgeChoke(id, 2);
          }}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] text-muted">
        <span>Cv {cv.toFixed(1)}</span>
        <div className="flex gap-1">
          {[0, 25, 50, 100].map((n) => (
            <button
              key={n}
              type="button"
              className="rounded-xs px-1.5 py-0.5 text-faint hover:bg-subtle hover:text-fg"
              onClick={(e) => {
                e.stopPropagation();
                setChoke(id, n);
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MeterPanel() {
  const quality = useSim((s) => s.meterQuality);
  const mudWeight = useSim((s) => s.mudWeight);
  const setMudWeight = useSim((s) => s.setMudWeight);
  const valves = useSim((s) => s.valves);

  const tone =
    quality === "GOOD" ? "live" : quality === "NO FLOW" ? "muted" : "warn";

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs tracking-wide text-faint">FM-01</p>
            <p className="text-sm text-muted">Coriolis mass flowmeter</p>
          </div>
          <Badge tone={tone}>{quality}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <LiveMeter label="Volume" unit="gpm" digits={1} pick={(s) => liveFixed(s.qFm, s.simTime, 2.4, 2.2, 1)} />
          <LiveMeter
            label="Volume"
            unit="bbl/min"
            digits={2}
            pick={(s) => liveFixed(s.qFm, s.simTime, 2.4, 2.2, 1) / 42}
          />
          <LiveMeter label="Mass" unit="lb/min" digits={0} pick={(s) => liveInt(s.massLbMin, s.simTime, 4.0, 8)} />
          <LiveMeter label="Density" unit="ppg" digits={2} pick={(s) => liveFixed(s.densityPpg, s.simTime, 1.1, 0.04, 2)} />
          <LiveMeter label="Temperature" unit="°F" digits={1} pick={(s) => liveFixed(s.tempF, s.simTime, 5.1, 0.35, 1)} />
          <LiveMeter label="Returns" unit="gpm" digits={1} pick={(s) => liveFixed(s.qGpm, s.simTime, 2.0, 1.8, 1)} />
        </div>
      </div>
      <div className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-muted">Mud weight (in)</span>
          <span className="font-mono tabular-nums text-fg">{mudWeight.toFixed(2)} ppg</span>
        </div>
        <Slider
          min={8.4}
          max={16}
          step={0.1}
          value={[mudWeight]}
          onValueChange={(v) => setMudWeight(v[0] ?? 10.6)}
        />
        <p className="mt-2 text-xs text-faint">
          Density at FM-01 tracks mud weight when the meter is in line.
        </p>
      </div>
      <div className="rounded-lg bg-elevated p-3 text-xs text-muted shadow-[var(--shadow-border)]">
        <p className="mb-1 font-medium text-fg">Meter run</p>
        <p>
          D-4 {valves["D-4"]} · D-2 {valves["D-2"]} · bypass D-3 {valves["D-3"]} · D-6{" "}
          {valves["D-6"]}
        </p>
      </div>
    </div>
  );
}

function LiveMeter({
  label,
  unit,
  digits,
  pick,
}: {
  label: string;
  unit: string;
  digits: number;
  pick: (s: SimState) => number;
}) {
  const value = useSim(pick);
  return <MeterRead label={label} value={value.toFixed(digits)} unit={unit} />;
}

function MeterRead({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-subtle px-2.5 py-2">
      <p className="text-[10px] font-medium tracking-widest text-faint uppercase">{label}</p>
      <p className="font-mono text-xl font-semibold tabular-nums leading-tight text-fg">{value}</p>
      <p className="text-[11px] text-muted">{unit}</p>
    </div>
  );
}

function ValvePanel() {
  const valves = useSim((s) => s.valves);
  const toggleValve = useSim((s) => s.toggleValve);
  const selected = useSim((s) => s.selected);
  const groups: { title: string; ids: ValveId[] }[] = [
    { title: "Standpipe (S)", ids: ["S-1", "S-2", "S-3", "S-4", "S-5", "S-6", "S-7"] },
    { title: "Flow line (F)", ids: ["F-1", "F-2", "F-3", "F-4", "F-5", "F-6"] },
    { title: "Trip tank (T)", ids: ["T-1", "T-2"] },
    { title: "BOP (B)", ids: ["B-1", "B-2", "K-1"] },
    { title: "Rig manifold (M)", ids: ["M-0", "M-1", "M-2", "M-3", "M-4", "M-5", "M-6", "M-7", "M-8"] },
    { title: "MPD primary (C)", ids: ["C-1", "C-2", "C-3", "C-4", "C-5", "C-6", "C-7"] },
    { title: "Discharge / meter (D)", ids: ["D-1", "D-2", "D-3", "D-4", "D-5", "D-6"] },
    { title: "Equalization (E)", ids: ["E-1", "E-2", "E-3", "E-4", "E-5", "E-6"] },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Click a tag on the drawing or here. Green is open, red is closed.
      </p>
      {groups.map((g) => (
        <div key={g.title}>
          <p className="mb-1.5 text-xs tracking-wide text-faint uppercase">{g.title}</p>
          <div className="space-y-1">
            {g.ids.map((id) => {
              const open = valves[id] === "open";
              const meta = VALVE_META[id];
              const active = selected?.kind === "valve" && selected.id === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleValve(id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors duration-150",
                    active ? "bg-subtle" : "hover:bg-elevated",
                  )}
                >
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      open ? "bg-open" : "bg-closed",
                    )}
                  />
                  <span className="w-10 font-mono text-xs text-fg">{id}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-muted">{meta.title}</span>
                  <span className={cn("font-mono text-xs", open ? "text-open" : "text-closed")}>
                    {open ? "OPEN" : "SHUT"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Inspector />
    </div>
  );
}

function Inspector() {
  const selected = useSim((s) => s.selected);
  const valves = useSim((s) => s.valves);
  if (!selected) return null;
  if (selected.kind !== "valve") return null;
  const meta = VALVE_META[selected.id];
  const open = valves[selected.id] === "open";
  return (
    <div className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
      <p className="font-mono text-sm text-fg">{selected.id}</p>
      <p className="text-sm text-muted">{meta.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-faint">{meta.desc}</p>
      <p className="mt-2 font-mono text-xs text-muted">
        {meta.type} · {meta.rating} · {meta.system} · {open ? "OPEN" : "SHUT"}
      </p>
    </div>
  );
}

function PumpPanel() {
  const pumps = useSim((s) => s.pumps);
  const togglePump = useSim((s) => s.togglePump);
  const setSpm = useSim((s) => s.setSpm);
  const startFlow = useSim((s) => s.startFlow);
  const stopFlow = useSim((s) => s.stopFlow);
  const running = useSim((s) => s.running);
  const log = useSim((s) => s.log);
  const alarms = useSim((s) => s.alarms);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {running ? (
          <Button variant="danger" className="flex-1" onClick={stopFlow}>
            Stop flow
          </Button>
        ) : (
          <Button variant="live" className="flex-1" onClick={startFlow}>
            Start flow
          </Button>
        )}
      </div>
      {pumps.map((p) => (
        <div key={p.id} className="rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-fg">{p.name}</p>
              <p className="font-mono text-xs text-muted">{p.spm.toFixed(0)} spm</p>
            </div>
            <Switch checked={p.on} onCheckedChange={() => togglePump(p.id)} aria-label={p.name} />
          </div>
          <Slider
            min={0}
            max={120}
            step={1}
            value={[p.spm]}
            onValueChange={(v) => setSpm(p.id, v[0] ?? 0)}
            disabled={!p.on}
          />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <LiveMeter label="Pump rate" unit="gpm" digits={0} pick={(s) => liveInt(s.qGpm, s.simTime, 2.0, 1.8)} />
        <LiveMeter label="SPP" unit="psi" digits={0} pick={(s) => liveInt(s.pStandpipe, s.simTime, 3.2, 2.8)} />
      </div>
      {alarms.length > 0 && (
        <div className="space-y-1">
          {alarms.map((a) => (
            <div
              key={a.code}
              className={cn(
                "rounded-md px-2 py-1.5 text-xs",
                a.severity === "trip"
                  ? "bg-closed/15 text-closed"
                  : a.severity === "alarm"
                    ? "bg-warn/15 text-warn"
                    : "bg-subtle text-muted",
              )}
            >
              {a.label}
            </div>
          ))}
        </div>
      )}
      <Separator />
      <div>
        <p className="mb-1 text-xs tracking-wide text-faint uppercase">Event log</p>
        <ul className="max-h-40 space-y-1 overflow-y-auto font-mono text-xs text-muted">
          {[...log].reverse().map((e, i) => (
            <li key={`${e.t}-${i}`}>{e.msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
