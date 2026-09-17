import { Minus, Plus, Scan } from "lucide-react";
import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Ops area bbox — full Visio-faithful sheet (pumps→MGS, FL→manifold). */
export const CONTENT_X = 40;
export const CONTENT_Y = 24;
export const CONTENT_W = 2380;
export const CONTENT_H = 1280;

type Vb = { x: number; y: number; w: number; h: number };

const MIN_W = 360;
const MAX_W = 5200;
const MARGIN = 40;
const PAN_THRESHOLD = 5;

function fitSheet(el: HTMLElement | null): Vb {
  const cw = el?.clientWidth ?? 960;
  const ch = Math.max(el?.clientHeight ?? 640, 1);
  const aspect = cw / ch;
  const bx = CONTENT_X - MARGIN;
  const by = CONTENT_Y - MARGIN;
  const bw = CONTENT_W + MARGIN * 2;
  const bh = CONTENT_H + MARGIN * 2;
  const contentAspect = bw / bh;
  if (aspect > contentAspect) {
    const h = bh;
    const w = h * aspect;
    return { x: bx + (bw - w) / 2, y: by, w, h };
  }
  const w = bw;
  const h = w / aspect;
  return { x: bx, y: by + (bh - h) / 2, w, h };
}

function toAttr(v: Vb) {
  return `${v.x} ${v.y} ${v.w} ${v.h}`;
}

export function PanZoom({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const vbRef = useRef<Vb>({ x: CONTENT_X - MARGIN, y: CONTENT_Y - MARGIN, w: CONTENT_W + MARGIN * 2, h: CONTENT_H + MARGIN * 2 });
  const drag = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    panned: boolean;
  } | null>(null);
  const skipClick = useRef(false);

  const apply = useCallback(() => {
    svgRef.current?.setAttribute("viewBox", toAttr(vbRef.current));
  }, []);

  const reset = useCallback(() => {
    vbRef.current = fitSheet(wrapRef.current);
    apply();
  }, [apply]);

  useEffect(() => {
    reset();
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastW = el.clientWidth;
    let lastH = el.clientHeight;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      if (Math.abs(cr.width - lastW) < 2 && Math.abs(cr.height - lastH) < 2) return;
      lastW = cr.width;
      lastH = cr.height;
      const aspect = cr.width / Math.max(cr.height, 1);
      const prev = vbRef.current;
      vbRef.current = { ...prev, h: prev.w / aspect };
      apply();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [apply, reset]);

  const zoomAtClient = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const current = vbRef.current;
      const r = svg.getBoundingClientRect();
      const px = current.x + ((clientX - r.left) / Math.max(r.width, 1)) * current.w;
      const py = current.y + ((clientY - r.top) / Math.max(r.height, 1)) * current.h;
      const w = Math.min(MAX_W, Math.max(MIN_W, current.w * factor));
      const h = w * (current.h / current.w);
      vbRef.current = {
        w,
        h,
        x: px - ((px - current.x) / current.w) * w,
        y: py - ((py - current.y) / current.h) * h,
      };
      apply();
    },
    [apply],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const factor = e.deltaY < 0 ? 0.88 : 1.14;
      zoomAtClient(e.clientX, e.clientY, factor);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [zoomAtClient]);

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const v = vbRef.current;
    drag.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y, panned: false };
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const dist = Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y);
    if (!drag.current.panned && dist < PAN_THRESHOLD) return;
    drag.current.panned = true;
    skipClick.current = true;
    const v = vbRef.current;
    const dx = ((e.clientX - drag.current.x) / Math.max(r.width, 1)) * v.w;
    const dy = ((e.clientY - drag.current.y) / Math.max(r.height, 1)) * v.h;
    vbRef.current = {
      w: v.w,
      h: v.h,
      x: drag.current.vx - dx,
      y: drag.current.vy - dy,
    };
    apply();
  };

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    drag.current = null;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (!skipClick.current) return;
    skipClick.current = false;
    e.stopPropagation();
    e.preventDefault();
  };

  const zoomCenter = (factor: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    zoomAtClient(r.left + r.width / 2, r.top + r.height / 2, factor);
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-full min-h-64 w-full touch-none overflow-hidden contain-paint bg-drawing"
    >
      <svg
        ref={svgRef}
        viewBox={toAttr(vbRef.current)}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        role="application"
        aria-label="Process flow diagram — drag to pan, scroll to zoom"
      >
        {children}
      </svg>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-elevated/90 px-2 py-1 text-[11px] text-muted shadow-[var(--shadow-border)]">
        Drag to pan · scroll to zoom
      </div>
      <div className="absolute right-3 bottom-3 flex gap-1">
        <Button variant="secondary" size="icon-sm" aria-label="Zoom in" onClick={() => zoomCenter(0.8)}>
          <Plus className="size-4" />
        </Button>
        <Button variant="secondary" size="icon-sm" aria-label="Zoom out" onClick={() => zoomCenter(1.25)}>
          <Minus className="size-4" />
        </Button>
        <Button variant="secondary" size="icon-sm" aria-label="Fit drawing to view" onClick={reset}>
          <Scan className="size-4" />
        </Button>
      </div>
    </div>
  );
}
