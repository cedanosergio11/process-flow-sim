import { ChokeSymbol, Flange, Instrument, Tag } from "./symbols";
import { liveInt } from "@/lib/sim/readout";
import { useSim } from "@/lib/sim/store";
import { cn } from "@/lib/utils";

export function WellControlStack({
  x,
  y,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {selected && (
        <rect x={-120} y={-24} width={240} height={430} className="stroke-flow fill-flow/5" strokeWidth={1.1} />
      )}
      <Rcd />
      <Annular />
      <Ram y={128} label="PIPE RAM" />
      <Ram y={178} label="SHEAR RAM" />
      <Ram y={228} label="PIPE RAM" />
      <DrillingSpool />
      <Wellhead />
      <text x={0} y={408} textAnchor="middle" className="fill-drawing-muted" fontSize={10} fontFamily="var(--font-sans)">
        *Rig BOP
      </text>
    </g>
  );
}

function Rcd() {
  return (
    <g>
      {/* drill pipe through the bore */}
      <rect x={-6} y={-28} width={12} height={18} className="fill-drawing-steel-dk" />
      <rect x={-4} y={-30} width={8} height={4} className="fill-drawing-steel" />
      {/* bearing cap */}
      <rect x={-22} y={-12} width={44} height={10} className="fill-drawing-steel stroke-drawing-steel-dk" strokeWidth={1} />
      {/* bowl / housing */}
      <path
        d="M -34 -2 L -28 -8 L 28 -8 L 34 -2 L 38 28 L 30 38 L -30 38 L -38 28 Z"
        className="fill-drawing-steel stroke-drawing-steel-dk"
        strokeWidth={1.4}
      />
      <rect x={-22} y={2} width={44} height={26} className="fill-drawing-steel-dk/30" />
      {/* dual stripper packers */}
      <ellipse cx={0} cy={10} rx={14} ry={4} className="fill-bop-dk" />
      <ellipse cx={0} cy={22} rx={14} ry={4} className="fill-bop-dk" />
      {/* bore */}
      <rect x={-5} y={-8} width={10} height={46} className="fill-drawing-card/80" />
      {/* fill-up nozzle — left */}
      <rect x={-58} y={12} width={20} height={10} className="fill-drawing-steel stroke-drawing-steel-dk" strokeWidth={1} />
      <rect x={-64} y={14} width={6} height={6} className="fill-drawing-steel-dk" />
      {/* returns outlet — right */}
      <rect x={38} y={14} width={22} height={12} className="fill-drawing-steel stroke-drawing-steel-dk" strokeWidth={1} />
      <rect x={60} y={16} width={8} height={8} className="fill-drawing-steel-dk" />
      <text x={0} y={18} textAnchor="middle" className="fill-drawing-fg" fontSize={9} fontWeight={700} fontFamily="var(--font-sans)">
        RCD 3K
      </text>
      <Flange y={38} w={76} />
    </g>
  );
}

function Annular() {
  return (
    <g transform="translate(0 52)">
      <Flange y={0} w={108} />
      <path
        d="M -54 6 Q -58 6 -58 14 L -58 46 Q -58 54 -46 54 L 46 54 Q 58 54 58 46 L 58 14 Q 58 6 54 6 Z"
        className="fill-bop stroke-bop-dk"
        strokeWidth={1.4}
      />
      <ellipse cx={0} cy={30} rx={36} ry={14} className="fill-bop-dk/50" />
      <rect x={-8} y={16} width={6} height={28} className="fill-bop-hi/40" />
      {/* hydraulic closing operator */}
      <rect x={58} y={18} width={36} height={22} className="fill-drawing-steel stroke-drawing-steel-dk" strokeWidth={1} />
      <circle cx={94} cy={29} r={10} className="fill-drawing-steel-dk stroke-drawing-line" strokeWidth={1} />
      <circle cx={94} cy={29} r={4} className="fill-drawing-steel" />
      <text x={0} y={34} textAnchor="middle" className="fill-paper" fontSize={9} fontWeight={700} fontFamily="var(--font-sans)">
        ANNULAR
      </text>
      <text x={0} y={46} textAnchor="middle" className="fill-paper/80" fontSize={7} fontFamily="var(--font-mono)">
        13-5/8" 5K
      </text>
      {/* equalize stub left */}
      <rect x={-78} y={24} width={20} height={10} className="fill-drawing-steel stroke-drawing-steel-dk" strokeWidth={1} />
      <Flange y={54} w={108} />
    </g>
  );
}

function Ram({ y, label }: { y: number; label: string }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={-44} y={0} width={88} height={38} className="fill-bop stroke-bop-dk" strokeWidth={1.3} />
      <rect x={-34} y={8} width={68} height={22} className="fill-bop-dk/45" />
      <rect x={-40} y={3} width={7} height={32} className="fill-bop-hi/35" />
      <text x={0} y={23} textAnchor="middle" className="fill-paper" fontSize={7} fontWeight={700} fontFamily="var(--font-sans)">
        {label}
      </text>
      <RamOperator side={-1} />
      <RamOperator side={1} />
      <Flange y={38} w={92} />
    </g>
  );
}

function RamOperator({ side }: { side: 1 | -1 }) {
  const dir = side;
  const x = dir * 44;
  const bodyX = dir === 1 ? x : x - 48;
  const capX = dir === 1 ? x + 48 : x - 48;
  return (
    <g>
      <rect
        x={bodyX}
        y={8}
        width={48}
        height={22}
        className="fill-drawing-steel stroke-drawing-steel-dk"
        strokeWidth={1}
      />
      <line
        x1={dir === 1 ? x + 6 : x - 6}
        y1={12}
        x2={dir === 1 ? x + 42 : x - 42}
        y2={12}
        className="stroke-drawing-steel-dk"
        strokeWidth={0.8}
      />
      <line
        x1={dir === 1 ? x + 6 : x - 6}
        y1={26}
        x2={dir === 1 ? x + 42 : x - 42}
        y2={26}
        className="stroke-drawing-steel-dk"
        strokeWidth={0.8}
      />
      <circle cx={capX} cy={19} r={11} className="fill-drawing-steel-dk stroke-drawing-line" strokeWidth={1.1} />
      <circle cx={capX} cy={19} r={4.5} className="fill-drawing-steel" />
    </g>
  );
}

function DrillingSpool() {
  return (
    <g transform="translate(0 280)">
      <rect x={-38} y={0} width={76} height={42} className="fill-drawing-steel-dk stroke-drawing-line" strokeWidth={1.2} />
      <rect x={-30} y={8} width={60} height={26} className="fill-drawing-steel/40" />
      {/* kill inlet left */}
      <rect x={-64} y={14} width={26} height={14} className="fill-drawing-steel stroke-drawing-steel-dk" strokeWidth={1} />
      <rect x={-72} y={16} width={8} height={10} className="fill-drawing-steel-dk" />
      {/* choke outlet right */}
      <rect x={38} y={14} width={26} height={14} className="fill-drawing-steel stroke-drawing-steel-dk" strokeWidth={1} />
      <rect x={64} y={16} width={8} height={10} className="fill-drawing-steel-dk" />
      <text x={0} y={26} textAnchor="middle" className="fill-drawing-card" fontSize={8} fontFamily="var(--font-sans)">
        SPOOL
      </text>
      <Flange y={42} w={84} />
    </g>
  );
}

function Wellhead() {
  return (
    <g transform="translate(0 330)">
      <rect x={-32} y={0} width={64} height={16} className="fill-drawing-steel stroke-drawing-steel-dk" strokeWidth={1.2} />
      <rect x={-26} y={16} width={52} height={18} className="fill-drawing-steel-dk" />
      <rect x={-20} y={34} width={40} height={12} className="fill-drawing-steel" />
      <rect x={-14} y={46} width={28} height={10} className="fill-drawing-steel-dk" />
      <line x1={-8} y1={56} x2={-8} y2={68} className="stroke-drawing-line" strokeWidth={3.2} />
      <line x1={8} y1={56} x2={8} y2={68} className="stroke-drawing-line" strokeWidth={3.2} />
      <rect x={-18} y={68} width={36} height={8} className="fill-drawing-steel-dk" />
      <text x={0} y={90} textAnchor="middle" className="fill-drawing-muted" fontSize={8} fontFamily="var(--font-mono)">
        WELL HEAD
      </text>
    </g>
  );
}

export function MgsVessel({
  x,
  y,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {selected && (
        <rect x={-92} y={-168} width={184} height={500} className="stroke-flow fill-flow/5" strokeWidth={1.1} />
      )}
      <rect
        x={-86}
        y={-150}
        width={172}
        height={470}
        fill="none"
        className="stroke-drawing-muted"
        strokeWidth={1}
        strokeDasharray="6 4"
      />
      {/* cylinder */}
      <path
        d="M -48 -88 L -48 150 L 0 228 L 48 150 L 48 -88"
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1.6}
      />
      {/* dome */}
      <path
        d="M -48 -88 Q -48 -128 0 -138 Q 48 -128 48 -88"
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1.6}
      />
      {/* cone already in body path; reinforce hopper flange */}
      <rect x={-16} y={218} width={32} height={8} className="fill-drawing-steel-dk stroke-drawing-line" strokeWidth={1} />
      {/* manway */}
      <circle cx={22} cy={-40} r={11} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.3} />
      <circle cx={22} cy={-40} r={4} className="fill-drawing-hatch stroke-drawing-line" strokeWidth={1} />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={22 + Math.cos(a) * 8}
            cy={-40 + Math.sin(a) * 8}
            r={1.2}
            className="fill-drawing-steel-dk"
          />
        );
      })}
      <text x={0} y={40} textAnchor="middle" className="fill-drawing-fg" fontSize={12} fontFamily="var(--font-sans)">
        *Rig MGS
      </text>
      {/* F-4 FL to MGS — left upper */}
      <rect x={-62} y={-14} width={14} height={12} className="fill-drawing-steel stroke-drawing-line" strokeWidth={1} />
      {/* D-6 — left lower */}
      <rect x={-62} y={34} width={14} height={12} className="fill-drawing-steel stroke-drawing-line" strokeWidth={1} />
      {/* MGS to FL — right */}
      <rect x={48} y={34} width={14} height={12} className="fill-drawing-steel stroke-drawing-line" strokeWidth={1} />
    </g>
  );
}

export function Coriolis({ x, y, liveNow }: { x: number; y: number; liveNow: boolean }) {
  const stroke = liveNow ? "stroke-flow" : "stroke-drawing-line";
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={-34} y1={0} x2={-18} y2={0} className={cn(stroke)} strokeWidth={3.2} />
      <path
        d="M -18 0 L -18 -16 C -18 -30 -4 -30 -4 -16 L -4 0"
        fill="none"
        className={cn(stroke)}
        strokeWidth={2.6}
      />
      <path
        d="M 4 0 L 4 -16 C 4 -30 18 -30 18 -16 L 18 0"
        fill="none"
        className={cn(stroke)}
        strokeWidth={2.6}
      />
      <line x1={18} y1={0} x2={34} y2={0} className={cn(stroke)} strokeWidth={3.2} />
      <text x={0} y={-36} textAnchor="middle" className="fill-flow" fontSize={9} fontFamily="var(--font-mono)" fontWeight={600}>
        FM-01
      </text>
    </g>
  );
}

export function RigChokeManifold({
  ckM,
  inService,
  selectedChoke,
  live,
  onSelectChoke,
  onNudge,
}: {
  ckM: number;
  inService: boolean;
  selectedChoke: boolean;
  live: boolean;
  onSelectChoke: () => void;
  onNudge: (d: number) => void;
}) {
  const stroke = live ? "stroke-flow" : "stroke-drawing-line";
  return (
    <g>
      <rect
        x={600}
        y={618}
        width={700}
        height={292}
        fill="none"
        className="stroke-drawing-muted"
        strokeWidth={1}
        strokeDasharray="6 4"
      />
      <text x={612} y={634} className="fill-drawing-muted" fontSize={10} fontFamily="var(--font-sans)" letterSpacing="0.06em">
        *RIG CHOKE MANIFOLD  ·  10K
      </text>

      {/* inlet after E-5 */}
      <line x1={670} y1={720} x2={710} y2={720} className={cn(stroke)} strokeWidth={3.2} strokeLinecap="round" />
      <line x1={710} y1={688} x2={710} y2={752} className={cn(stroke)} strokeWidth={3.2} />
      <line x1={710} y1={688} x2={940} y2={688} className={cn(stroke)} strokeWidth={3.2} />
      <line x1={710} y1={752} x2={940} y2={752} className="stroke-drawing-line" strokeWidth={3.2} />

      {/* upper (remote) leg */}
      <line x1={720} y1={688} x2={940} y2={688} className={cn(stroke)} strokeWidth={3.2} />
      <ChokeSymbol
        x={820}
        y={688}
        position={ckM}
        inService={inService}
        selected={selectedChoke}
        tag="Remote"
        onClick={onSelectChoke}
        onNudge={onNudge}
      />

      {/* lower (manual) leg */}
      <line x1={720} y1={752} x2={940} y2={752} className="stroke-drawing-line" strokeWidth={3.2} />
      <g transform="translate(820 752)">
        <circle r={13} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.4} />
        <line x1={-6} y1={0} x2={6} y2={0} className="stroke-drawing-line" strokeWidth={1.3} />
        <line x1={0} y1={-6} x2={0} y2={6} className="stroke-drawing-line" strokeWidth={1.3} />
        <Tag x={0} y={26}>Manual</Tag>
      </g>

      {/* header / buffer */}
      <line x1={940} y1={688} x2={940} y2={752} className={cn(stroke)} strokeWidth={3.2} />
      <rect x={928} y={700} width={24} height={40} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.2} />
      <ManifoldPsi live={live} />

      {/* outlet header and destinations — two columns of gates like the source sheet */}
      <line x1={940} y1={720} x2={1008} y2={720} className="stroke-drawing-line" strokeWidth={3.2} />
      {[
        { y: 676, label: "To Trip Tank" },
        { y: 706, label: "To MGS" },
        { y: 736, label: "To Panic Line" },
        { y: 766, label: "To Shakers" },
      ].map((o) => (
        <g key={o.label}>
          <line x1={1008} y1={720} x2={1008} y2={o.y} className="stroke-drawing-line" strokeWidth={3.2} />
          <line x1={1008} y1={o.y} x2={1074} y2={o.y} className="stroke-drawing-line" strokeWidth={3.2} />
          <polygon
            points={`1074,${o.y - 7} 1112,${o.y - 7} 1124,${o.y} 1112,${o.y + 7} 1074,${o.y + 7}`}
            className="fill-drawing-card stroke-drawing-line"
            strokeWidth={1}
          />
          <text x={1132} y={o.y + 4} className="fill-drawing-fg" fontSize={10} fontFamily="var(--font-sans)">
            {o.label}
          </text>
        </g>
      ))}
    </g>
  );
}

function ManifoldPsi({ live }: { live: boolean }) {
  const pWh = useSim((s) => liveInt(s.pWh, s.simTime, 1.1, 1.5));
  return <Instrument x={940} y={666} tag="10K" value={`${pWh}`} unit="psi" live={live} />;
}
