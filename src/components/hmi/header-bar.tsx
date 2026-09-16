import { Moon, Play, RotateCcw, Square, Sun } from "lucide-react";
import { ChangelogDialog } from "./changelog-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSim } from "@/lib/sim/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { liveInt } from "@/lib/sim/readout";
import type { TemplateId } from "@/lib/sim/types";

export function HeaderBar() {
  const running = useSim((s) => s.running);
  const trip = useSim((s) => s.esd);
  const alarm = useSim((s) => s.alarms.length > 0);
  const template = useSim((s) => s.template);
  const startFlow = useSim((s) => s.startFlow);
  const stopFlow = useSim((s) => s.stopFlow);
  const resetLineup = useSim((s) => s.resetLineup);
  const setTemplate = useSim((s) => s.setTemplate);
  const { theme, toggle } = useTheme();

  return (
    <header className="flex flex-col gap-2.5 border-b border-border bg-surface px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-subtle shadow-[var(--shadow-border)]">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
            <rect x="3" y="5" width="6" height="14" rx="1" className="fill-pipe" />
            <rect x="15" y="5" width="6" height="14" rx="1" className="fill-pipe" />
            <rect x="4" y="4" width="4" height="3" rx="0.5" className="fill-accent" />
            <rect x="16" y="4" width="4" height="3" rx="0.5" className="fill-accent" />
            <circle cx="20" cy="6" r="1.4" className="fill-bop" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h1 className="text-base font-semibold tracking-tight text-fg">Stasis Dual Choke</h1>
            <span className="text-[11px] font-medium tracking-wider text-muted uppercase">MPD bench</span>
            <ChangelogDialog />
          </div>
          <p className="truncate font-mono text-[11px] tracking-wide text-faint">PFD-STA-RIG-01</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TemplateToggle value={template} onChange={setTemplate} />
        <WhpChip />
        <FmChip />
        {trip ? (
          <Badge tone="closed">ESD</Badge>
        ) : alarm ? (
          <Badge tone="warn">Alarm</Badge>
        ) : running ? (
          <Badge tone="live">Circulating</Badge>
        ) : (
          <Badge>Stopped</Badge>
        )}
        {running ? (
          <Button variant="danger" onClick={stopFlow}>
            <Square className="size-3.5" />
            Stop flow
          </Button>
        ) : (
          <Button variant="live" onClick={startFlow}>
            <Play className="size-3.5" />
            Start flow
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={resetLineup} aria-label="Reset lineup">
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>
    </header>
  );
}

function TemplateToggle({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}) {
  return (
    <div className="flex rounded-md bg-subtle p-0.5" role="group" aria-label="PFD template">
      <button
        type="button"
        className={cn(
          "h-11 min-w-11 rounded-sm px-3 text-xs font-medium sm:h-8",
          value === "wc" ? "bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
        )}
        aria-pressed={value === "wc"}
        onClick={() => onChange("wc")}
      >
        Well control
      </button>
      <button
        type="button"
        className={cn(
          "h-11 min-w-11 rounded-sm px-3 text-xs font-medium sm:h-8",
          value === "kill" ? "bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
        )}
        aria-pressed={value === "kill"}
        onClick={() => onChange("kill")}
      >
        Kill line
      </button>
    </div>
  );
}

function WhpChip() {
  const pWh = useSim((s) => liveInt(s.pWh, s.simTime, 1.1, 1.5));
  return <ReadChip label="WHP" value={`${pWh}`} unit="psi" warn={pWh > 3200} />;
}

function FmChip() {
  const qFm = useSim((s) => liveInt(s.qFm, s.simTime, 2.4, 2.2));
  return <ReadChip label="FM-01" value={`${qFm}`} unit="gpm" />;
}

function ReadChip({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: string;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className="hidden items-baseline gap-1.5 rounded-md border border-border bg-elevated px-3 py-1.5 shadow-[var(--shadow-border)] sm:flex">
      <span className="text-[10px] font-medium tracking-widest text-faint uppercase">{label}</span>
      <span className={`font-mono text-base font-semibold tabular-nums leading-none ${warn ? "text-closed" : "text-fg"}`}>
        {value}
      </span>
      <span className="text-[11px] text-muted">{unit}</span>
    </div>
  );
}
