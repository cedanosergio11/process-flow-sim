import { X } from "lucide-react";
import { ControlDock } from "./control-dock";
import { HeaderBar } from "./header-bar";
import { SimTicker } from "./sim-ticker";
import { TrendStrip } from "./trend-strip";
import { PanZoom } from "@/components/pid/pan-zoom";
import { Schematic } from "@/components/pid/schematic";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSim } from "@/lib/sim/store";

export function AppShell() {
  const hint = useSim((s) => s.hintDismissed);
  const dismiss = useSim((s) => s.dismissHint);

  return (
    <TooltipProvider delayDuration={250}>
      <SimTicker />
      <div className="flex h-dvh min-h-0 flex-col bg-bg text-fg">
        <HeaderBar />
        {!hint && (
          <div className="flex items-start gap-3 border-b border-border border-l-2 border-l-gold bg-elevated px-4 py-2 text-sm text-muted">
            <p className="min-w-0 flex-1 font-mono text-xs leading-relaxed tracking-wide">
              Switch Well control / Kill line to pick a PFD template. Click valves, start flow, set chokes —
              WHP and FM-01 follow the lineup.
            </p>
            <Button variant="ghost" size="icon-sm" aria-label="Dismiss" onClick={dismiss}>
              <X className="size-4" />
            </Button>
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="relative min-h-0 min-h-72 flex-1">
              <PanZoom>
                <Schematic />
              </PanZoom>
            </div>
            <TrendStrip />
          </div>
          <div className="relative z-10 flex h-[min(42dvh,24rem)] min-h-0 w-full shrink-0 flex-col overflow-hidden lg:h-auto lg:w-96">
            <ControlDock />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
