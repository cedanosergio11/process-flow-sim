import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ValveKind } from "@/lib/sim/types";

export type PipeSize = "main" | "fill";

export const PIPE_W: Record<PipeSize, number> = {
  main: 3.2,
  fill: 1.8,
};

export function DrawingDefs() {
  return (
    <defs>
      <pattern id="skid-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" className="stroke-drawing-hatch" strokeWidth="0.7" />
      </pattern>
    </defs>
  );
}

export function Pipe({
  d,
  live = false,
  size = "main",
  muted = false,
}: {
  d: string;
  live?: boolean;
  size?: PipeSize;
  muted?: boolean;
}) {
  const w = PIPE_W[size];
  return (
    <g className="pointer-events-none">
      <path
        d={d}
        fill="none"
        className={muted ? "stroke-drawing-muted" : "stroke-drawing-line"}
        strokeWidth={w}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {live && (
        <path
          d={d}
          fill="none"
          className="stroke-flow pipe-live"
          strokeWidth={2.2}
          strokeLinejoin="miter"
          strokeLinecap="butt"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </g>
  );
}

export function Tee({ x, y, size = "main" }: { x: number; y: number; size?: PipeSize }) {
  return <circle cx={x} cy={y} r={PIPE_W[size] / 2 + 0.2} className="pointer-events-none fill-drawing-line" />;
}

export function Tag({
  x,
  y,
  children,
  accent = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      className={accent ? "fill-flow" : "fill-drawing-fg"}
      fontSize={15}
      fontFamily="var(--font-mono)"
      fontWeight={600}
    >
      {children}
    </text>
  );
}

export function Hit({
  x,
  y,
  onClick,
  label,
}: {
  x: number;
  y: number;
  onClick: () => void;
  label: string;
}) {
  return (
    <rect
      x={x - 28}
      y={y - 28}
      width={56}
      height={56}
      fill="transparent"
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      role="button"
      aria-label={label}
    />
  );
}

export function IsaValve({
  x,
  y,
  rotation = 0,
  open,
  selected,
  tag,
  kind = "ball",
  onClick,
  size = "main",
  tagX = 0,
  tagY = 30,
}: {
  x: number;
  y: number;
  rotation?: number;
  open: boolean;
  selected: boolean;
  tag: string;
  kind?: ValveKind;
  onClick: () => void;
  size?: PipeSize;
  tagX?: number;
  tagY?: number;
}) {
  const stroke = open ? "stroke-open" : "stroke-closed";
  const stub = PIPE_W[size];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      {selected && (
        <circle r={20} className="fill-flow/10 stroke-flow" strokeWidth={1.2} />
      )}
      <line x1={-18} y1={0} x2={-10} y2={0} className="stroke-drawing-line" strokeWidth={stub} strokeLinecap="butt" />
      <line x1={10} y1={0} x2={18} y2={0} className="stroke-drawing-line" strokeWidth={stub} strokeLinecap="butt" />
      <polygon points="-10,-8 -10,8 0,0" className={cn("fill-drawing-card", stroke)} strokeWidth={1.5} />
      <polygon points="10,-8 10,8 0,0" className={cn("fill-drawing-card", stroke)} strokeWidth={1.5} />
      {kind === "ball" && <circle r={3.2} className={open ? "fill-open" : "fill-closed"} />}
      {kind === "check" && (
        <polygon points="-2,-5 6,0 -2,5" className={open ? "fill-open" : "fill-closed"} />
      )}
      <line x1={0} y1={-8} x2={0} y2={-15} className={stroke} strokeWidth={1.3} />
      <rect x={-5} y={-21} width={10} height={7} rx={1} className={cn("fill-drawing-card", stroke)} strokeWidth={1.1} />
      {tag ? (
        <g transform={`rotate(${-rotation})`}>
          <Tag x={tagX} y={tagY}>
            {tag}
          </Tag>
        </g>
      ) : null}
      <Hit x={0} y={0} onClick={onClick} label={`${tag} ${open ? "open" : "closed"}`} />
    </g>
  );
}

export function DrawnValve({
  x,
  y,
  rotation = 0,
  open = true,
}: {
  x: number;
  y: number;
  rotation?: number;
  open?: boolean;
}) {
  const stroke = open ? "stroke-open" : "stroke-closed";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <line x1={-12} y1={0} x2={-7} y2={0} className="stroke-drawing-line" strokeWidth={3.2} />
      <line x1={7} y1={0} x2={12} y2={0} className="stroke-drawing-line" strokeWidth={3.2} />
      <polygon points="-7,-6 -7,6 0,0" className={cn("fill-drawing-card", stroke)} strokeWidth={1.2} />
      <polygon points="7,-6 7,6 0,0" className={cn("fill-drawing-card", stroke)} strokeWidth={1.2} />
      <line x1={0} y1={-6} x2={0} y2={-12} className={stroke} strokeWidth={1.1} />
      <rect x={-3.5} y={-16} width={7} height={5} className={cn("fill-drawing-card", stroke)} strokeWidth={1} />
    </g>
  );
}

export function ChokeSymbol({
  x,
  y,
  position,
  inService,
  selected,
  tag,
  onClick,
  onNudge,
}: {
  x: number;
  y: number;
  position: number;
  inService: boolean;
  selected: boolean;
  tag: string;
  onClick: () => void;
  onNudge?: (delta: number) => void;
}) {
  const r = 15;
  const ang = -90 + (position / 100) * 360;
  const rad = (ang * Math.PI) / 180;
  const hx = Math.cos(rad) * (r - 3);
  const hy = Math.sin(rad) * (r - 3);
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onWheel={(e) => {
        if (!onNudge) return;
        e.stopPropagation();
        onNudge(e.deltaY < 0 ? 2 : -2);
      }}
    >
      {selected && <circle r={26} className="fill-flow/10 stroke-flow" strokeWidth={1.2} />}
      <circle r={r} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.5} />
      <circle r={r - 3} className="stroke-drawing-hatch" fill="none" strokeWidth={4.5} />
      <circle
        r={r - 3}
        className={inService ? "stroke-flow" : "stroke-drawing-muted"}
        fill="none"
        strokeWidth={4.5}
        strokeDasharray={`${(position / 100) * 2 * Math.PI * (r - 3)} ${2 * Math.PI * (r - 3)}`}
        strokeDashoffset={2 * Math.PI * (r - 3) * 0.25}
        transform="rotate(-90)"
      />
      <line x1={0} y1={0} x2={hx} y2={hy} className="stroke-drawing-fg" strokeWidth={1.5} strokeLinecap="round" />
      <circle r={2} className="fill-drawing-fg" />
      <text y={4} textAnchor="middle" className="fill-drawing-fg" fontSize={8} fontFamily="var(--font-mono)">
        {position.toFixed(0)}
      </text>
      <Tag x={0} y={28} accent={inService}>{tag}</Tag>
      <rect x={-22} y={-22} width={44} height={52} fill="transparent" />
    </g>
  );
}

export function Instrument({
  x,
  y,
  tag,
  value,
  unit,
  live = false,
}: {
  x: number;
  y: number;
  tag: string;
  value: string;
  unit: string;
  live?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={16} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.3} />
      {live && <circle r={16} className="stroke-flow/50 live-dot" fill="none" strokeWidth={1.2} />}
      <text y={-2} textAnchor="middle" className="fill-drawing-muted" fontSize={9} fontFamily="var(--font-mono)">
        {tag}
      </text>
      <text y={9} textAnchor="middle" className="fill-drawing-fg" fontSize={8} fontFamily="var(--font-mono)" fontWeight={500}>
        {value}
      </text>
      <text y={28} textAnchor="middle" className="fill-drawing-muted" fontSize={9} fontFamily="var(--font-sans)">
        {unit}
      </text>
    </g>
  );
}

export function PumpSymbol({
  x,
  y,
  running,
  tag,
  selected,
  onClick,
}: {
  x: number;
  y: number;
  running: boolean;
  tag: string;
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
      {selected && <circle r={26} className="fill-flow/10 stroke-flow" strokeWidth={1.2} />}
      <circle
        r={16}
        className={cn("fill-drawing-card", running ? "stroke-open" : "stroke-drawing-line")}
        strokeWidth={1.7}
      />
      <polygon
        points="-6,-7 6,-7 0,8"
        className={running ? "fill-open/30 stroke-open" : "fill-drawing-hatch stroke-drawing-line"}
        strokeWidth={1.1}
      />
      <polygon
        points="-5,16 5,16 0,24"
        className={running ? "fill-open stroke-open" : "fill-drawing-line"}
      />
      <Tag x={22} y={4}>{tag}</Tag>
      <rect x={-22} y={-22} width={56} height={50} fill="transparent" />
    </g>
  );
}

export function Skid({
  x,
  y,
  w,
  h,
  title,
  hatch = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  hatch?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={hatch ? "url(#skid-hatch)" : "none"}
        className="stroke-drawing-muted"
        strokeWidth={1}
        strokeDasharray="6 4"
      />
      <text
        x={x + 10}
        y={y + 14}
        className="fill-drawing-muted"
        fontSize={11}
        fontFamily="var(--font-sans)"
        letterSpacing="0.06em"
      >
        {title}
      </text>
    </g>
  );
}

export function Flange({ y, w = 72 }: { y: number; w?: number }) {
  const bolts = [-w / 2 + 8, -w / 4, 0, w / 4, w / 2 - 8];
  return (
    <g>
      <rect x={-w / 2} y={y} width={w} height={6} className="fill-drawing-steel-dk" />
      <rect x={-w / 2 + 2} y={y + 1} width={w - 4} height={1.2} className="fill-drawing-steel" />
      {bolts.map((bx) => (
        <circle key={bx} cx={bx} cy={y + 3} r={1.4} className="fill-drawing-steel" />
      ))}
    </g>
  );
}

export function CrossBlock({ x, y, mark }: { x: number; y: number; mark?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-11}
        y={-11}
        width={22}
        height={22}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1.4}
      />
      {mark ? (
        <text y={4} textAnchor="middle" className="fill-drawing-muted" fontSize={9} fontFamily="var(--font-mono)">
          {mark}
        </text>
      ) : null}
    </g>
  );
}

export function ProcessChoke({
  x,
  y,
  position,
  inService,
  selected,
  tag,
  onClick,
  onNudge,
}: {
  x: number;
  y: number;
  position: number;
  inService: boolean;
  selected: boolean;
  tag: string;
  onClick: () => void;
  onNudge?: (delta: number) => void;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onWheel={(e) => {
        if (!onNudge) return;
        e.stopPropagation();
        onNudge(e.deltaY < 0 ? 2 : -2);
      }}
    >
      {selected && <circle r={26} className="fill-flow/10 stroke-flow" strokeWidth={1.1} />}
      <line x1={0} y1={-16} x2={0} y2={-8} className="stroke-drawing-line" strokeWidth={3.2} />
      <line x1={0} y1={8} x2={0} y2={16} className="stroke-drawing-line" strokeWidth={3.2} />
      <circle r={8} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.5} />
      <polygon points="-5,-4 0,0 -5,4" className="fill-drawing-line" />
      <polygon points="5,-4 0,0 5,4" className="fill-drawing-line" />
      <line x1={-8} y1={0} x2={-16} y2={0} className="stroke-drawing-line" strokeWidth={1.3} />
      <rect x={-36} y={-10} width={20} height={20} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.2} />
      <text x={-26} y={4} textAnchor="middle" className="fill-drawing-fg" fontSize={8} fontFamily="var(--font-mono)">
        {position.toFixed(0)}
      </text>
      <Tag x={-26} y={-16} accent={inService}>
        {tag}
      </Tag>
      <rect x={-40} y={-22} width={56} height={54} fill="transparent" />
    </g>
  );
}

export function CheckValve({ x, y, rotation = 0 }: { x: number; y: number; rotation?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <polygon points="-9,-7 -9,7 3,0" className="fill-drawing-card stroke-drawing-line" strokeWidth={1.2} />
      <line x1={3} y1={-8} x2={3} y2={8} className="stroke-drawing-line" strokeWidth={1.4} />
    </g>
  );
}

export function ArrowFlag({
  x,
  y,
  label,
  dir = "right",
}: {
  x: number;
  y: number;
  label: string;
  dir?: "right" | "left" | "up";
}) {
  const w = Math.max(72, label.length * 6.2 + 20);
  if (dir === "left") {
    return (
      <g transform={`translate(${x} ${y})`}>
        <polygon
          points={`0,-8 ${12 - w},-8 ${-w},0 ${12 - w},8 0,8`}
          className="fill-drawing-card stroke-drawing-line"
          strokeWidth={1}
        />
        <text
          x={-(w - 12) / 2}
          y={4}
          textAnchor="middle"
          className="fill-drawing-fg"
          fontSize={9}
          fontFamily="var(--font-sans)"
        >
          {label}
        </text>
      </g>
    );
  }
  const rot = dir === "up" ? -90 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <polygon
        points={`0,-8 ${w - 12},-8 ${w},0 ${w - 12},8 0,8`}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1}
      />
      <text
        x={(w - 12) / 2}
        y={4}
        textAnchor="middle"
        className="fill-drawing-fg"
        fontSize={9}
        fontFamily="var(--font-sans)"
        transform={dir === "up" ? `rotate(90 ${(w - 12) / 2} 0)` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

/** Build an orthogonal zigzag hose path between two axis-aligned points. */
export function hoseZigzagD(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  amp = 9,
  period = 16,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return `M ${x1} ${y1}`;
  const vertical = Math.abs(dx) < Math.abs(dy);
  const steps = Math.max(2, Math.round(len / period));
  const parts: string[] = [`M ${x1} ${y1}`];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const side = i % 2 === 0 ? amp : -amp;
    if (vertical) parts.push(`L ${px + side} ${py}`);
    else parts.push(`L ${px} ${py + side}`);
  }
  parts.push(`L ${x2} ${y2}`);
  return parts.join(" ");
}

export function Hose({
  d,
  live = false,
  size = "main",
  muted = false,
}: {
  d: string;
  live?: boolean;
  size?: PipeSize;
  muted?: boolean;
}) {
  return <Pipe d={d} live={live} size={size} muted={muted} />;
}

/** Semicircle jump where two pipes cross without connecting. */
export function PipeJump({
  x,
  y,
  axis = "h",
  r = 9,
  live = false,
  size = "main",
}: {
  x: number;
  y: number;
  axis?: "h" | "v";
  r?: number;
  live?: boolean;
  size?: PipeSize;
}) {
  const w = PIPE_W[size];
  const d =
    axis === "h"
      ? `M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r} ${y}`
      : `M ${x} ${y - r} A ${r} ${r} 0 0 1 ${x} ${y + r}`;
  return (
    <g className="pointer-events-none">
      <path
        d={d}
        fill="none"
        className="stroke-drawing-line"
        strokeWidth={w}
        strokeLinecap="butt"
      />
      {live && (
        <path
          d={d}
          fill="none"
          className="stroke-flow pipe-live"
          strokeWidth={2.2}
          strokeLinecap="butt"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </g>
  );
}

export function SpecBreak({ x, y, rotation = 0 }: { x: number; y: number; rotation?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <polygon points="-11,-6 0,0 -11,6" className="fill-spec" />
      <polygon points="11,-6 0,0 11,6" className="fill-spec" />
    </g>
  );
}

export function Strainer({
  x,
  y,
  tag,
  open,
  selected,
  onClick,
  tagX = 0,
  tagY = 28,
}: {
  x: number;
  y: number;
  tag: string;
  open: boolean;
  selected: boolean;
  onClick: () => void;
  tagX?: number;
  tagY?: number;
}) {
  const stroke = open ? "stroke-open" : "stroke-closed";
  return (
    <g transform={`translate(${x} ${y})`}>
      {selected && <circle r={20} className="fill-flow/10 stroke-flow" strokeWidth={1.2} />}
      <line x1={-18} y1={0} x2={-10} y2={0} className="stroke-drawing-line" strokeWidth={1.8} />
      <line x1={10} y1={0} x2={18} y2={0} className="stroke-drawing-line" strokeWidth={1.8} />
      <rect x={-10} y={-8} width={20} height={16} className={cn("fill-drawing-card", stroke)} strokeWidth={1.3} />
      <path d="M -8 8 L 0 18 L 8 8" fill="none" className={stroke} strokeWidth={1.3} />
      <line x1={-6} y1={10} x2={6} y2={10} className={stroke} strokeWidth={1} />
      <Tag x={tagX} y={tagY}>
        {tag}
      </Tag>
      <Hit x={0} y={0} onClick={onClick} label={`${tag} ${open ? "open" : "closed"}`} />
    </g>
  );
}

export function KillFlag({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-12} y={-10} width={24} height={20} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.2} />
      <text y={4} textAnchor="middle" className="fill-drawing-fg" fontSize={8} fontFamily="var(--font-mono)">
        KILL
      </text>
    </g>
  );
}

/** Small flow-direction chevron. Tip points along `dir`. */
export function FlowChevron({
  x,
  y,
  dir = "right",
}: {
  x: number;
  y: number;
  dir?: "right" | "left" | "up" | "down";
}) {
  const pts =
    dir === "left"
      ? "0,0 14,-6 14,6"
      : dir === "up"
        ? "0,0 -6,14 6,14"
        : dir === "down"
          ? "0,0 -6,-14 6,-14"
          : "0,0 -14,-6 -14,6";
  return (
    <polygon
      points={pts}
      transform={`translate(${x} ${y})`}
      className="fill-drawing-line"
    />
  );
}

/** ANSI/ISA S5.1-style instrument bubble (letters only). Field = no bar. */
export function IsaBubble({
  x,
  y,
  letters,
  location = "field",
}: {
  x: number;
  y: number;
  letters: string;
  location?: "field" | "primary" | "aux";
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={14} className="fill-drawing-card stroke-drawing-line" strokeWidth={1.4} />
      {location === "primary" && (
        <line x1={-14} y1={0} x2={14} y2={0} className="stroke-drawing-line" strokeWidth={1.2} />
      )}
      {location === "aux" && (
        <>
          <line x1={-14} y1={-2.5} x2={14} y2={-2.5} className="stroke-drawing-line" strokeWidth={1} />
          <line x1={-14} y1={2.5} x2={14} y2={2.5} className="stroke-drawing-line" strokeWidth={1} />
        </>
      )}
      <text
        y={4}
        textAnchor="middle"
        className="fill-drawing-fg"
        fontSize={11}
        fontFamily="var(--font-mono)"
        fontWeight={600}
      >
        {letters}
      </text>
    </g>
  );
}

export function LineClassTag({
  x,
  y,
  label,
}: {
  x: number;
  y: number;
  label: string;
}) {
  const w = Math.max(48, label.length * 6.4 + 14);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-w / 2}
        y={-9}
        width={w}
        height={18}
        rx={2}
        className="fill-drawing-card stroke-drawing-muted"
        strokeWidth={1}
      />
      <text
        y={4}
        textAnchor="middle"
        className="fill-drawing-muted"
        fontSize={9}
        fontFamily="var(--font-mono)"
        letterSpacing="0.04em"
      >
        {label}
      </text>
    </g>
  );
}

/** Compact on-drawing legend (PFD training HMI — not a full P&ID key). */
export function DrawingLegend({ x, y }: { x: number; y: number }) {
  const row = (i: number) => 18 + i * 18;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={0}
        y={0}
        width={220}
        height={128}
        rx={4}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1}
      />
      <text x={10} y={14} className="fill-drawing-fg" fontSize={10} fontFamily="var(--font-sans)" fontWeight={600}>
        Legend
      </text>
      {/* open / closed */}
      <polygon points="10,22 10,34 18,28" className="fill-drawing-card stroke-open" strokeWidth={1.4} />
      <polygon points="26,22 26,34 18,28" className="fill-drawing-card stroke-open" strokeWidth={1.4} />
      <text x={34} y={row(0) + 4} className="fill-drawing-fg" fontSize={9} fontFamily="var(--font-sans)">
        Valve open
      </text>
      <polygon points="10,40 10,52 18,46" className="fill-drawing-card stroke-closed" strokeWidth={1.4} />
      <polygon points="26,40 26,52 18,46" className="fill-drawing-card stroke-closed" strokeWidth={1.4} />
      <text x={34} y={row(1) + 4} className="fill-drawing-fg" fontSize={9} fontFamily="var(--font-sans)">
        Valve closed
      </text>
      {/* live dash */}
      <line x1={10} y1={row(2)} x2={40} y2={row(2)} className="stroke-flow pipe-live" strokeWidth={2.2} />
      <text x={48} y={row(2) + 4} className="fill-drawing-fg" fontSize={9} fontFamily="var(--font-sans)">
        Live flow
      </text>
      {/* hose vs hard */}
      <line
        x1={10}
        y1={row(3)}
        x2={40}
        y2={row(3)}
        className="stroke-drawing-line"
        strokeWidth={2}
        strokeDasharray="3 3"
      />
      <text x={48} y={row(3) + 4} className="fill-drawing-fg" fontSize={9} fontFamily="var(--font-sans)">
        Hose (flex)
      </text>
      <line x1={10} y1={row(4)} x2={40} y2={row(4)} className="stroke-drawing-line" strokeWidth={2.4} />
      <text x={48} y={row(4) + 4} className="fill-drawing-fg" fontSize={9} fontFamily="var(--font-sans)">
        Hard pipe
      </text>
      {/* jump */}
      <path
        d="M 10 108 A 8 8 0 0 1 26 108"
        fill="none"
        className="stroke-drawing-line"
        strokeWidth={1.6}
      />
      <text x={34} y={row(5) + 4} className="fill-drawing-fg" fontSize={9} fontFamily="var(--font-sans)">
        Jump (no connect)
      </text>
      <text x={120} y={row(0) + 4} className="fill-drawing-muted" fontSize={9} fontFamily="var(--font-sans)">
        Dim line = WC/Kill mute
      </text>
    </g>
  );
}
