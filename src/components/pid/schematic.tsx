import { Coriolis, MgsVessel, RigChokeManifold, WellControlStack } from "./equipment";
import {
  ArrowFlag,
  CrossBlock,
  DrawingDefs,
  DrawingLegend,
  FlowChevron,
  Hose,
  hoseZigzagD,
  Instrument,
  IsaBubble,
  IsaValve,
  KillFlag,
  LineClassTag,
  Pipe,
  PipeJump,
  ProcessChoke,
  PumpSymbol,
  Skid,
  SpecBreak,
  Strainer,
  Tee,
} from "./symbols";
import { VALVE_META } from "@/lib/sim/catalog";
import { APP_VERSION } from "@/lib/version";
import { useSim } from "@/lib/sim/store";
import { liveInt } from "@/lib/sim/readout";
import { isLive, type LiveSegment, type ValveId } from "@/lib/sim/types";

/**
 * Visio-faithful sheet coords (PFD-STA-RIG). Proportions follow
 * /workspace/pfs-visio-full-1.png grid A–I × 1–6 as closely as an
 * interactive SVG HMI allows.
 */
export const SHEET_W = 2580;
export const SHEET_H = 1680;

/* ── left column: pumps / standpipe / kill ── */
const KILL_X = 110;
const P1 = 195;
const P2 = 305;
const P3 = 415;
const SP_Y = 168;
const HANG_Y = 248;

/* ── BOP / returns / spool ── */
const BOP_X = 470;
const BOP_Y = 640;
const DRILL_X = BOP_X;
const RET_Y = BOP_Y + 20; /* RCD returns nozzle */
const SPOOL_Y = BOP_Y + 301;
const RCD_TOP = BOP_Y - 28;
const FILL_X = 275;
const FILL_Y = BOP_Y + 16;
const FILL_NOZ = BOP_X - 64;
const RET_X = BOP_X + 68;
const TT_Y = 430;

/* ── Flow Line column (Visio col C, adjacent to BOP) ── */
const FL_X = 760;

/* ── Dual choke Visio 2×2 CrossBlocks ──
 *   TL──C-5──TR     Chk A above TL/TR via C-3 / C-4
 *   │         │     inlet/outlet at RET_Y mid-spine
 *   BL──C-8──BR     Chk B below BL/BR via C-6 / C-7
 */
const LX = 1090;
const RX = 1310;
const CK_TOP_Y = RET_Y - 72; /* C-5 rail + top CrossBlocks */
const CK_BOT_Y = RET_Y + 72; /* C-8 rail + bottom CrossBlocks */
const CK_A_Y = CK_TOP_Y - 78; /* Chk A horizontal */
const CK_B_Y = CK_BOT_Y + 78; /* Chk B horizontal */
const CK_MID_X = (LX + RX) / 2;
const C3_Y = (CK_TOP_Y + CK_A_Y) / 2;
const C4_Y = C3_Y;
const C6_Y = (CK_BOT_Y + CK_B_Y) / 2;
const C7_Y = C6_Y;

const C1_X = 680;
const E4_X = 960;
const E5_X = 780;
const E5_Y = SPOOL_Y;
const E5B_Y = E5_Y - 36;

/* ── FM-01 + MGS ── */
const FM_CX = 1600;
const FM_LOOP_Y = RET_Y - 62;
const DROP_X = FM_CX + 230;
const MGS_X = 2200;
const MGS_Y = 270;
/** FL laterals — Sergio: MGS→FL from hopper bottom climbs to F3. */
const F3_Y = MGS_Y - 12;
const F4_Y = MGS_Y + 40;
const F5_Y = MGS_Y + 88;
const MGS_IN_Y = MGS_Y + 52;
const MGS_BOTTOM_Y = MGS_Y + 226;
/** Climb column right of MGS for MGS→FL (hopper → drop → climb → left). */
const MGS_OUT_DROP_X = MGS_X + 78;

const MAN_DX = E5_X - 640;
const MAN_DY = E5_Y - 720;

const BASE_POS: Record<
  Exclude<ValveId, "E-5">,
  { x: number; y: number; rot?: number; size?: "main" | "fill"; tagX?: number; tagY?: number }
> = {
  "C-1": { x: C1_X, y: RET_Y, tagY: 32 },
  "C-2": { x: FL_X, y: BOP_Y - 100, rot: 90, tagX: 26, tagY: 4 },
  "C-3": { x: LX, y: C3_Y, rot: 90, tagX: -28, tagY: 4 },
  "C-4": { x: RX, y: C4_Y, rot: 90, tagX: 28, tagY: 4 },
  "C-5": { x: CK_MID_X, y: CK_TOP_Y, tagY: -28 },
  "C-6": { x: LX, y: C6_Y, rot: 90, tagX: -28, tagY: 4 },
  "C-7": { x: RX, y: C7_Y, rot: 90, tagX: 28, tagY: 4 },
  "C-8": { x: CK_MID_X, y: CK_BOT_Y, tagY: 28 },
  "D-1": { x: FM_CX - 90, y: FM_LOOP_Y, rot: 90, tagX: -22, tagY: 4 },
  "D-2": { x: FM_CX + 90, y: FM_LOOP_Y, rot: 90, tagX: 22, tagY: 4 },
  "D-3": { x: FM_CX, y: RET_Y, tagY: 18 },
  "D-4": { x: FM_CX + 185, y: F5_Y, tagY: -22 },
  "D-5": { x: FL_X + 155, y: F5_Y, tagX: 36, tagY: -18 },
  "D-6": { x: FM_CX + 270, y: RET_Y, tagY: 18 },
  "E-1": { x: FILL_NOZ - 90, y: FILL_Y, size: "fill", tagY: 30 },
  "E-2": { x: FILL_X, y: FILL_Y - 18, rot: 90, size: "fill", tagX: 24, tagY: 4 },
  "E-3": { x: FILL_X, y: FILL_Y - 95, rot: 90, size: "fill", tagX: 24, tagY: 4 },
  "E-4": { x: E4_X, y: RET_Y, tagY: -16 },
  "E-6": { x: E5_X, y: E5B_Y, rot: 90, tagX: -30, tagY: 4 },
  "S-1": { x: 215, y: SP_Y, tagY: 28 },
  "S-2": { x: 325, y: SP_Y, tagY: 28 },
  "S-3": { x: 395, y: SP_Y, tagY: -18 },
  "S-4": { x: KILL_X, y: HANG_Y, rot: 90, tagX: -24, tagY: 4 },
  "S-5": { x: 235, y: HANG_Y, rot: 90, tagX: 22, tagY: 4 },
  "S-6": { x: 335, y: HANG_Y, rot: 90, tagX: 22, tagY: 4 },
  "S-7": { x: 475, y: SP_Y, tagY: -18 },
  "F-1": { x: FL_X, y: 88, rot: 90, tagX: 28, tagY: 4 },
  "F-2": { x: FL_X, y: 124, rot: 90, tagX: -28, tagY: 4 },
  "F-3": { x: FL_X + 58, y: F3_Y, tagY: -20 },
  "F-4": { x: FL_X + 58, y: F4_Y, tagX: -42, tagY: 4 },
  "F-5": { x: FL_X + 58, y: F5_Y, tagY: -22 },
  "F-6": { x: FL_X + 118, y: F5_Y, tagY: 26 },
  "T-1": { x: 505, y: TT_Y, size: "fill", tagY: 28 },
  "T-2": { x: FILL_X, y: TT_Y, size: "fill", tagY: 28 },
  "B-1": { x: BOP_X - 86, y: SPOOL_Y, tagY: 28 },
  "B-2": { x: BOP_X + 86, y: SPOOL_Y, tagY: 28 },
  "K-1": { x: KILL_X + 90, y: SPOOL_Y, tagY: -16 },
  "M-0": { x: E5_X, y: E5_Y, tagX: -36, tagY: 28 },
  "M-1": { x: 748 + MAN_DX, y: 688 + MAN_DY, tagY: -24 },
  "M-2": { x: 890 + MAN_DX, y: 688 + MAN_DY, tagY: -24 },
  "M-3": { x: 748 + MAN_DX, y: 752 + MAN_DY, tagY: 28 },
  "M-4": { x: 890 + MAN_DX, y: 752 + MAN_DY, tagY: 28 },
  "M-5": { x: 1040 + MAN_DX, y: 676 + MAN_DY, tagX: 36, tagY: -4 },
  "M-6": { x: 1040 + MAN_DX, y: 706 + MAN_DY, tagX: -36, tagY: -4 },
  "M-7": { x: 1040 + MAN_DX, y: 736 + MAN_DY, tagX: 36, tagY: 4 },
  "M-8": { x: 1040 + MAN_DX, y: 766 + MAN_DY, tagX: -36, tagY: 4 },
};

function live(mask: number, id: LiveSegment) {
  return isLive(mask, id);
}

export function Schematic() {
  const template = useSim((s) => s.template);
  const valves = useSim((s) => s.valves);
  const liveMask = useSim((s) => s.liveMask);
  const pumps = useSim((s) => s.pumps);
  const selected = useSim((s) => s.selected);
  const running = useSim((s) => s.running);
  const toggleValve = useSim((s) => s.toggleValve);
  const select = useSim((s) => s.select);
  const togglePump = useSim((s) => s.togglePump);

  const wc = template === "wc";
  const v = (id: ValveId) => valves[id] === "open";
  const selValve = selected?.kind === "valve" ? selected.id : null;
  const linedA = v("C-1") && v("C-3") && v("C-4");
  const linedB = v("C-1") && v("C-6") && v("C-7");
  const fillLive = v("T-2") && v("E-3") && v("E-2") && v("E-1") && running;
  const manifoldLive = live(liveMask, "manifold");
  const killLive = live(liveMask, "kill");
  const pumpsLive = live(liveMask, "pumps");
  const sppLive = live(liveMask, "standpipe");
  const retLive = live(liveMask, "annulus");
  const primLive = live(liveMask, "primary");
  const aLive = live(liveMask, "choke-a");
  const bLive = live(liveMask, "choke-b");
  const outLive = live(liveMask, "choke-out");
  const meterLive = live(liveMask, "meter-run");
  const bypLive = live(liveMask, "meter-bypass");
  const mgsLive = live(liveMask, "to-mgs");
  const toFlLive = live(liveMask, "to-fl");
  const dsLive = live(liveMask, "drillstring");
  const flLive = live(liveMask, "mgs-out");
  const c2Live = retLive && v("C-2");
  const t1On = pumps[0]!.on && running;
  const t2On = pumps[1]!.on && running;
  const t3On = pumps[2]!.on && running;
  const hdrLeft = t1On || (v("S-1") && (t2On || t3On));
  const hdrMid = t2On || (v("S-1") && t1On) || (v("S-2") && t3On);
  const hdrRight = t3On || (v("S-2") && (t2On || (v("S-1") && t1On)));

  const e5 = wc
    ? { x: E5_X, y: E5_Y, rot: 0 as number | undefined, size: undefined as undefined, tagX: undefined, tagY: undefined }
    : { x: KILL_X, y: SPOOL_Y - 180, rot: 90, size: undefined as undefined, tagX: 22, tagY: 4 };

  const valvePos = { ...BASE_POS, "E-5": e5 };

  const d1 = valvePos["D-1"].x;
  const d2 = valvePos["D-2"].x;
  const d3 = valvePos["D-3"].x;
  const d4 = valvePos["D-4"].x;
  const d6 = valvePos["D-6"].x;

  /* Equalize lighting: C-5/C-8 peer bypass without new LiveSegment */
  const eqTopLive = (v("C-5") && primLive) || aLive;
  const eqBotLive = (v("C-8") && primLive) || bLive;
  const leftSpineLive = primLive || aLive || bLive || (v("C-5") && primLive) || (v("C-8") && primLive);
  const rightSpineLive = outLive || aLive || bLive || (v("C-5") && primLive) || (v("C-8") && primLive);

  return (
    <g className="select-none" onClick={() => select(null)}>
      <DrawingDefs />
      <rect width={SHEET_W} height={SHEET_H} className="fill-drawing" />
      <rect
        x={18}
        y={18}
        width={SHEET_W - 36}
        height={SHEET_H - 36}
        fill="none"
        className="stroke-drawing-line"
        strokeWidth={1.2}
      />

      {/* ── Skids (Visio dashed boxes) ── */}
      <Skid x={80} y={36} w={390} h={78} title="*Rig Pumps" />
      <Skid x={70} y={122} w={420} h={160} title="*Rig Stand Pipe MN" />
      <Skid x={215} y={365} w={400} h={145} title="*Trip Tank" />
      <Skid x={FL_X - 70} y={36} w={260} h={F5_Y + 20} title="*Rig Flow Line" />
      <Skid
        x={LX - 95}
        y={CK_A_Y - 52}
        w={RX - LX + 190}
        h={CK_B_Y - CK_A_Y + 104}
        title="DUAL CHOKE"
        hatch
      />
      <Skid x={d1 - 55} y={FM_LOOP_Y - 55} w={d6 - d1 + 130} h={150} title="FM-01" hatch />

      {/* ── Pumps → standpipe header ── */}
      <Pipe d={`M ${P1} 92 L ${P1} ${SP_Y}`} live={pumps[0]!.on && running} />
      <Pipe d={`M ${P2} 92 L ${P2} ${SP_Y}`} live={pumps[1]!.on && running} />
      <Pipe d={`M ${P3} 92 L ${P3} ${SP_Y}`} live={pumps[2]!.on && running} />
      <Tee x={P1} y={SP_Y} />
      <Tee x={P2} y={SP_Y} />
      <Tee x={P3} y={SP_Y} />

      <Pipe d={`M ${KILL_X} ${SP_Y} L 198 ${SP_Y}`} live={hdrLeft} />
      <Tee x={KILL_X} y={SP_Y} />
      <Pipe d={`M 232 ${SP_Y} L 308 ${SP_Y}`} live={hdrMid} />
      <Pipe d={`M 342 ${SP_Y} L 378 ${SP_Y}`} live={hdrMid || (v("S-3") && t3On)} />
      <Pipe d={`M 412 ${SP_Y} L 458 ${SP_Y}`} live={t3On || (v("S-3") && hdrRight)} />
      <Pipe d={`M 492 ${SP_Y} L ${FL_X} ${SP_Y}`} live={sppLive} />
      <Tee x={FL_X} y={SP_Y} />
      <ArrowFlag x={515} y={SP_Y} label="SPP Bleed Off" />

      {/* Kill drop (muted in Well control) */}
      <Pipe d={`M ${KILL_X} ${SP_Y} L ${KILL_X} ${HANG_Y - 18}`} live={hdrLeft} muted={wc} />
      <Pipe
        d={`M ${KILL_X} ${HANG_Y + 18} L ${KILL_X} ${wc ? SPOOL_Y : SPOOL_Y - 198}`}
        live={v("S-4") && hdrLeft}
        muted={wc}
      />
      {wc ? (
        <Pipe d={`M ${KILL_X} ${SPOOL_Y} L ${BOP_X - 72} ${SPOOL_Y}`} live={false} muted />
      ) : (
        <Pipe
          d={`M ${KILL_X} ${SPOOL_Y - 162} L ${KILL_X} ${SPOOL_Y} L ${BOP_X - 72} ${SPOOL_Y}`}
          live={killLive}
        />
      )}
      <Tee x={BOP_X - 72} y={SPOOL_Y} />
      <KillFlag x={KILL_X} y={SPOOL_Y - 140} />
      <polygon
        points={`${KILL_X},${HANG_Y + 30} ${KILL_X - 6},${HANG_Y + 20} ${KILL_X + 6},${HANG_Y + 20}`}
        className="fill-drawing-line"
      />
      <FlowChevron x={KILL_X} y={SPOOL_Y - 80} dir="down" />
      <FlowChevron x={KILL_X + 40} y={SPOOL_Y} dir="right" />

      <Pipe d={`M 235 ${SP_Y} L 235 ${HANG_Y - 18}`} live={false} />
      <Pipe d={`M 235 ${HANG_Y + 18} L 235 ${HANG_Y + 36}`} live={false} />

      <Pipe d={`M 335 ${SP_Y} L 335 ${HANG_Y - 18}`} live={hdrMid} />
      <Pipe d={`M 335 ${HANG_Y + 18} L ${DRILL_X} ${HANG_Y + 18} L ${DRILL_X} ${RCD_TOP}`} live={dsLive} />
      <ArrowFlag x={355} y={HANG_Y + 18} label="Drill String" />
      <Tee x={335} y={SP_Y} />
      <Tee x={DRILL_X} y={HANG_Y + 18} />
      <polygon
        points={`${DRILL_X},${HANG_Y + 46} ${DRILL_X - 7},${HANG_Y + 34} ${DRILL_X + 7},${HANG_Y + 34}`}
        className="fill-drawing-line"
      />

      {/* ── Rig Flow Line column ── */}
      <Pipe d={`M ${FL_X} ${F5_Y} L ${FL_X} ${F4_Y}`} live={toFlLive || c2Live} />
      <Pipe d={`M ${FL_X} ${F4_Y} L ${FL_X} ${F3_Y}`} live={flLive || toFlLive || c2Live} />
      <Pipe d={`M ${FL_X} ${F3_Y} L ${FL_X} 142`} live={flLive || toFlLive || c2Live} />
      <Pipe d={`M ${FL_X} 70 L ${FL_X} 52`} live={(flLive || toFlLive || c2Live) && v("F-1") && v("F-2")} />
      <polygon
        points={`${FL_X},52 ${FL_X - 7},64 ${FL_X + 7},64`}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1}
      />
      <text
        x={FL_X - 16}
        y={82}
        className="fill-drawing-fg"
        fontSize={9}
        fontFamily="var(--font-sans)"
        transform={`rotate(-90 ${FL_X - 16} 105)`}
      >
        To Shakers
      </text>

      {/* MGS → FL (F-3): hopper bottom → climb → left to F-3 → FL column → up F-2/F-1.
          Path order matches flow so live dashes run MGS → F3 → shakers (not toward MGS). */}
      <Pipe
        d={`M ${MGS_X} ${MGS_BOTTOM_Y} L ${MGS_X} ${MGS_BOTTOM_Y + 28} L ${MGS_OUT_DROP_X} ${MGS_BOTTOM_Y + 28} L ${MGS_OUT_DROP_X} ${F3_Y}`}
        live={flLive && v("F-3")}
      />
      <Pipe d={`M ${MGS_OUT_DROP_X} ${F3_Y} L ${FL_X + 76} ${F3_Y}`} live={flLive && v("F-3")} />
      <Pipe d={`M ${FL_X + 40} ${F3_Y} L ${FL_X} ${F3_Y}`} live={flLive && v("F-3")} />
      <Tee x={FL_X} y={F3_Y} />
      <Tee x={MGS_OUT_DROP_X} y={F3_Y} />
      {/* Jump where MGS→FL climb crosses package→MGS inlet lateral */}
      <PipeJump x={MGS_OUT_DROP_X} y={MGS_IN_Y} axis="v" live={flLive && v("F-3")} />
      <ArrowFlag x={FL_X + 300} y={F3_Y} label="MGS to FL" dir="left" />
      {/* Explicit flow chevrons: lateral toward FL, then up the riser to F-2 / F-1 */}
      <FlowChevron x={FL_X + 200} y={F3_Y} dir="left" />
      <FlowChevron x={FL_X} y={F3_Y - 36} dir="up" />
      <SpecBreak x={FL_X + 160} y={F3_Y} />

      {/* FL → MGS (F-4) */}
      <Pipe d={`M ${FL_X} ${F4_Y} L ${FL_X + 40} ${F4_Y}`} live={v("F-4")} />
      <Pipe d={`M ${FL_X + 76} ${F4_Y} L ${MGS_X - 48} ${F4_Y}`} live={v("F-4")} />
      <Tee x={FL_X} y={F4_Y} />
      <ArrowFlag x={FL_X + 300} y={F4_Y} label="FL to MGS" dir="right" />
      <FlowChevron x={FL_X + 220} y={F4_Y} dir="right" />
      <SpecBreak x={FL_X + 160} y={F4_Y} />

      {/* D-4 / D-5 returns-to-FL corridor */}
      <Pipe d={`M ${FL_X + 136} ${F5_Y} L ${FL_X} ${F5_Y}`} live={toFlLive && v("F-5")} />
      <FlowChevron x={FL_X + 70} y={F5_Y} dir="left" />
      <SpecBreak x={FL_X + 100} y={F5_Y} />
      <Pipe d={`M ${d4 - 18} ${F5_Y} L ${FL_X + 174} ${F5_Y}`} live={toFlLive} />
      <Pipe d={`M ${DROP_X} ${RET_Y} L ${DROP_X} ${F5_Y} L ${d4 + 18} ${F5_Y}`} live={toFlLive} />
      <Tee x={FL_X} y={F5_Y} />
      <Tee x={DROP_X} y={F5_Y} />
      <Tee x={DROP_X} y={RET_Y} />

      {/* C-2 bleed from returns up into FL */}
      <SpecBreak x={FL_X} y={BOP_Y - 118} rotation={90} />
      <Pipe d={`M ${FL_X} ${BOP_Y - 118} L ${FL_X} ${F5_Y}`} live={c2Live} />
      <Pipe d={`M ${FL_X} ${BOP_Y - 82} L ${FL_X} ${RET_Y - 11}`} live={c2Live} />
      <Tee x={FL_X} y={RET_Y} />
      {/* Jump: kill/standpipe horizontals vs FL laterals approximated at SP×FL */}
      <PipeJump x={FL_X} y={SP_Y} axis="h" live={sppLive} />

      {/* ── Trip Tank + fill-up hose ── */}
      <rect
        x={355}
        y={TT_Y - 14}
        width={110}
        height={28}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1.3}
      />
      <text
        x={410}
        y={TT_Y + 4}
        textAnchor="middle"
        className="fill-drawing-fg"
        fontSize={11}
        fontFamily="var(--font-sans)"
      >
        Trip Tank
      </text>
      <Pipe d={`M 465 ${TT_Y} L 488 ${TT_Y}`} live={false} size="fill" />
      <Pipe d={`M 522 ${TT_Y} L ${FL_X} ${TT_Y}`} live={v("T-1")} size="fill" />
      <Tee x={FL_X} y={TT_Y} size="fill" />
      <Pipe d={`M ${FILL_X + 18} ${TT_Y} L 355 ${TT_Y}`} live={false} size="fill" />
      <Tee x={FILL_X} y={TT_Y} size="fill" />
      {/* Visio zigzag hose between trip tank drop and E-3 */}
      <Hose
        d={hoseZigzagD(FILL_X, TT_Y + 14, FILL_X, FILL_Y - 118, 7, 14)}
        live={fillLive}
        size="fill"
      />
      <SpecBreak x={FILL_X} y={FILL_Y - 112} rotation={90} />
      <LineClassTag x={FILL_X + 42} y={FILL_Y - 70} label="FILL-UP" />
      <Pipe d={`M ${FILL_X} ${FILL_Y - 78} L ${FILL_X} ${FILL_Y - 36}`} live={fillLive} size="fill" />
      <Pipe
        d={`M ${FILL_X} ${FILL_Y - 2} L ${FILL_X} ${FILL_Y} L ${FILL_NOZ - 108} ${FILL_Y}`}
        live={fillLive}
        size="fill"
      />
      <Tee x={FILL_X} y={FILL_Y} size="fill" />
      <Pipe d={`M ${FILL_NOZ - 72} ${FILL_Y} L ${FILL_NOZ} ${FILL_Y}`} live={fillLive} size="fill" />

      {/* ── Primary returns → dual choke ── */}
      <Pipe d={`M ${RET_X} ${RET_Y} L ${C1_X - 18} ${RET_Y}`} live={retLive} />
      <Pipe d={`M ${C1_X + 18} ${RET_Y} L ${E4_X - 18} ${RET_Y}`} live={primLive} />
      <Pipe d={`M ${E4_X + 18} ${RET_Y} L ${LX - 11} ${RET_Y}`} live={primLive} />
      <FlowChevron x={C1_X + 90} y={RET_Y} dir="right" />
      <FlowChevron x={(E4_X + LX) / 2} y={RET_Y} dir="right" />
      <LineClassTag x={(RET_X + C1_X) / 2} y={RET_Y - 22} label="5K RET" />
      <LineClassTag x={CK_MID_X} y={CK_A_Y - 36} label="10K CK" />

      {/* Dual choke Visio 2×2 CrossBlocks */}
      <CrossBlock x={LX} y={CK_TOP_Y} />
      <CrossBlock x={RX} y={CK_TOP_Y} />
      <CrossBlock x={LX} y={CK_BOT_Y} />
      <CrossBlock x={RX} y={CK_BOT_Y} />

      {/* Left / right spines (inlet & outlet at RET_Y mid) */}
      <Pipe d={`M ${LX} ${CK_TOP_Y + 11} L ${LX} ${RET_Y}`} live={leftSpineLive} />
      <Pipe d={`M ${LX} ${RET_Y} L ${LX} ${CK_BOT_Y - 11}`} live={leftSpineLive} />
      <Tee x={LX} y={RET_Y} />
      <Pipe d={`M ${RX} ${CK_TOP_Y + 11} L ${RX} ${RET_Y}`} live={rightSpineLive} />
      <Pipe d={`M ${RX} ${RET_Y} L ${RX} ${CK_BOT_Y - 11}`} live={rightSpineLive} />
      <Tee x={RX} y={RET_Y} />

      {/* C-5 upper equalize rail */}
      <Pipe d={`M ${LX + 11} ${CK_TOP_Y} L ${CK_MID_X - 18} ${CK_TOP_Y}`} live={eqTopLive && v("C-5")} />
      <Pipe d={`M ${CK_MID_X + 18} ${CK_TOP_Y} L ${RX - 11} ${CK_TOP_Y}`} live={eqTopLive && v("C-5")} />

      {/* C-8 lower equalize rail — peer to C-5 */}
      <Pipe d={`M ${LX + 11} ${CK_BOT_Y} L ${CK_MID_X - 18} ${CK_BOT_Y}`} live={eqBotLive && v("C-8")} />
      <Pipe d={`M ${CK_MID_X + 18} ${CK_BOT_Y} L ${RX - 11} ${CK_BOT_Y}`} live={eqBotLive && v("C-8")} />

      {/* Chk A loop above top CrossBlocks: C-3 / Chk A / C-4 */}
      <Pipe d={`M ${LX} ${CK_TOP_Y - 11} L ${LX} ${C3_Y + 18}`} live={aLive} />
      <Pipe d={`M ${LX} ${C3_Y - 18} L ${LX} ${CK_A_Y}`} live={aLive} />
      <Pipe d={`M ${LX} ${CK_A_Y} L ${RX} ${CK_A_Y} L ${RX} ${C4_Y - 18}`} live={aLive} />
      <Pipe d={`M ${RX} ${C4_Y + 18} L ${RX} ${CK_TOP_Y - 11}`} live={aLive} />
      <Tee x={LX} y={CK_A_Y} />
      <Tee x={RX} y={CK_A_Y} />

      {/* Chk B loop below bottom CrossBlocks: C-6 / Chk B / C-7 */}
      <Pipe d={`M ${LX} ${CK_BOT_Y + 11} L ${LX} ${C6_Y - 18}`} live={bLive} />
      <Pipe d={`M ${LX} ${C6_Y + 18} L ${LX} ${CK_B_Y}`} live={bLive} />
      <Pipe d={`M ${LX} ${CK_B_Y} L ${RX} ${CK_B_Y} L ${RX} ${C7_Y + 18}`} live={bLive} />
      <Pipe d={`M ${RX} ${C7_Y - 18} L ${RX} ${CK_BOT_Y + 11}`} live={bLive} />
      <Tee x={LX} y={CK_B_Y} />
      <Tee x={RX} y={CK_B_Y} />

      {/* Dual choke outlet → FM-01 */}
      <Pipe d={`M ${RX + 11} ${RET_Y} L ${d1 - 11} ${RET_Y}`} live={outLive} />
      <FlowChevron x={RX + 80} y={RET_Y} dir="right" />
      <SpecBreak x={(RX + d1) / 2} y={RET_Y} />
      <CrossBlock x={d1} y={RET_Y} />
      <CrossBlock x={d2} y={RET_Y} />

      {/* FM meter loop (D-1 / D-2 above) + D-3 bypass on RET_Y */}
      <SpecBreak x={d1} y={(RET_Y + FM_LOOP_Y) / 2} rotation={90} />
      <Pipe d={`M ${d1} ${RET_Y - 11} L ${d1} ${FM_LOOP_Y + 18}`} live={outLive} />
      <Pipe d={`M ${d1} ${FM_LOOP_Y - 18} L ${d1} ${FM_LOOP_Y} L ${d1 + 52} ${FM_LOOP_Y}`} live={meterLive} />
      <Pipe d={`M ${d2 - 52} ${FM_LOOP_Y} L ${d2} ${FM_LOOP_Y} L ${d2} ${FM_LOOP_Y - 18}`} live={meterLive} />
      <Pipe d={`M ${d2} ${FM_LOOP_Y + 18} L ${d2} ${RET_Y - 11}`} live={meterLive} />
      <Tee x={d1} y={FM_LOOP_Y} />
      <Tee x={d2} y={FM_LOOP_Y} />

      <Pipe d={`M ${d1 + 11} ${RET_Y} L ${d3 - 18} ${RET_Y}`} live={bypLive} />
      <Pipe d={`M ${d3 + 18} ${RET_Y} L ${d2 - 11} ${RET_Y}`} live={bypLive} />
      <Pipe d={`M ${d2 + 11} ${RET_Y} L ${DROP_X} ${RET_Y}`} live={outLive} />
      <Pipe d={`M ${DROP_X} ${RET_Y} L ${d6 - 18} ${RET_Y}`} live={mgsLive} />
      <FlowChevron x={(DROP_X + d6) / 2} y={RET_Y} dir="right" />
      <Pipe
        d={`M ${d6 + 18} ${RET_Y} L ${MGS_X - 78} ${RET_Y} L ${MGS_X - 78} ${MGS_IN_Y} L ${MGS_X - 48} ${MGS_IN_Y}`}
        live={mgsLive}
      />
      <FlowChevron x={MGS_X - 100} y={RET_Y} dir="right" />
      <FlowChevron x={MGS_X - 78} y={(RET_Y + MGS_IN_Y) / 2} dir="down" />

      {/* Flare stack */}
      <Pipe d={`M ${MGS_X + 8} 182 L ${MGS_X + 8} 48`} live={false} />
      <PipeJump x={MGS_X + 8} y={F3_Y} axis="v" live={false} />
      <polygon
        points={`${MGS_X + 8},30 ${MGS_X},42 ${MGS_X + 16},42`}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1}
      />
      <text
        x={MGS_X + 22}
        y={44}
        className="fill-drawing-fg"
        fontSize={9}
        fontFamily="var(--font-sans)"
        transform={`rotate(-90 ${MGS_X + 22} 74)`}
      >
        Flare Stack
      </text>

      {/* Spool → manifold (WC); kill mute handled above */}
      <Pipe
        d={`M ${BOP_X + 98} ${SPOOL_Y} L ${E5_X - 18} ${SPOOL_Y}`}
        live={manifoldLive}
        muted={!wc}
      />
      <Pipe d={`M ${E5_X + 18} ${E5_Y} L ${670 + MAN_DX} ${E5_Y}`} live={manifoldLive} muted={!wc} />
      <Tee x={E5_X} y={E5_Y} />

      {/* E-4 drop with Visio hose zigzag into E-6 / E-5 */}
      <Tee x={E4_X} y={RET_Y} />
      <Pipe d={`M ${E4_X} ${RET_Y + 18} L ${E4_X} ${RET_Y + 55}`} live={primLive && v("E-4")} />
      <SpecBreak x={E4_X} y={RET_Y + 55} rotation={90} />
      <Hose
        d={hoseZigzagD(E4_X, RET_Y + 55, E4_X, E5B_Y - 8, 8, 15)}
        live={primLive && v("E-4")}
      />
      <Pipe d={`M ${E4_X} ${E5B_Y - 8} L ${E4_X} ${E5B_Y} L ${E5_X} ${E5B_Y}`} live={primLive && v("E-4")} />
      <Tee x={E4_X} y={E5B_Y} />
      <Tee x={E5_X} y={E5B_Y} />
      <Pipe d={`M ${E5_X} ${E5B_Y + 18} L ${E5_X} ${E5_Y}`} live={primLive && v("E-4") && v("E-6")} />

      <PumpSymbol
        x={P1}
        y={76}
        running={pumps[0]!.on}
        tag="T1"
        selected={selected?.kind === "pump" && selected.id === "T1"}
        onClick={() => togglePump("T1")}
      />
      <PumpSymbol
        x={P2}
        y={76}
        running={pumps[1]!.on}
        tag="T2"
        selected={selected?.kind === "pump" && selected.id === "T2"}
        onClick={() => togglePump("T2")}
      />
      <PumpSymbol
        x={P3}
        y={76}
        running={pumps[2]!.on}
        tag="T3"
        selected={selected?.kind === "pump" && selected.id === "T3"}
        onClick={() => togglePump("T3")}
      />
      <IsaBubble x={460} y={52} letters="PI" location="field" />
      <SppRead x={505} y={52} live={pumpsLive} />

      <WellControlStack
        x={BOP_X}
        y={BOP_Y}
        selected={selected?.kind === "bop"}
        onClick={() => select({ kind: "bop" })}
      />
      <MgsVessel selected={selected?.kind === "mgs"} onClick={() => select({ kind: "mgs" })} x={MGS_X} y={MGS_Y} />

      {(Object.keys(valvePos) as ValveId[])
        .filter((id) => id !== "E-1")
        .filter((id) => (wc ? id !== "M-0" && id !== "K-1" : true))
        .map((id) => {
          const p = valvePos[id];
          return (
            <IsaValve
              key={`${id}-${template}`}
              x={p.x}
              y={p.y}
              rotation={p.rot ?? 0}
              open={v(id)}
              selected={selValve === id}
              tag={id}
              kind={VALVE_META[id].type}
              onClick={() => toggleValve(id)}
              size={p.size ?? "main"}
              tagX={p.tagX}
              tagY={p.tagY}
            />
          );
        })}

      <Strainer
        x={valvePos["E-1"].x}
        y={valvePos["E-1"].y}
        tag="E-1"
        open={v("E-1")}
        selected={selValve === "E-1"}
        onClick={() => toggleValve("E-1")}
        tagX={valvePos["E-1"].tagX}
        tagY={valvePos["E-1"].tagY}
      />

      <LiveProcessChoke
        x={CK_MID_X}
        y={CK_A_Y}
        id="CK-A"
        tag="Chk A"
        lined={linedA}
        selected={selected?.kind === "choke" && selected.id === "CK-A"}
      />
      <LiveProcessChoke
        x={CK_MID_X}
        y={CK_B_Y}
        id="CK-B"
        tag="Chk B"
        lined={linedB}
        selected={selected?.kind === "choke" && selected.id === "CK-B"}
      />

      <g
        transform={`translate(${FM_CX} ${FM_LOOP_Y})`}
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          select({ kind: "meter", id: "FM-01" });
        }}
      >
        <Coriolis x={0} y={0} liveNow={meterLive} />
        {selected?.kind === "meter" && (
          <rect x={-48} y={-44} width={96} height={58} className="stroke-flow fill-none" strokeWidth={1.3} />
        )}
      </g>

      <IsaBubble x={C1_X - 118} y={RET_Y + 48} letters="PI" location="field" />
      <WhpRead x={C1_X - 80} y={RET_Y + 48} />
      <IsaBubble x={FM_CX - 48} y={FM_LOOP_Y - 62} letters="FT" location="field" />
      <IsaBubble x={FM_CX - 48} y={FM_LOOP_Y - 34} letters="FI" location="field" />
      <FmRead x={FM_CX} y={FM_LOOP_Y - 62} live={meterLive} />

      <g transform={`translate(${MAN_DX} ${MAN_DY})`}>
        <LiveManifold
          wc={wc}
          lined={v("E-4") && v("E-5") && v("M-1") && v("M-2")}
          selected={selected?.kind === "choke" && selected.id === "CK-M"}
          live={manifoldLive}
        />
      </g>

      <DrawingLegend x={36} y={SHEET_H - 188} />
      <rect
        x={24}
        y={SHEET_H - 44}
        width={SHEET_W - 48}
        height={22}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1}
      />
      <text x={36} y={SHEET_H - 28} className="fill-drawing-fg" fontSize={10} fontFamily="var(--font-mono)">
        PFD-STA-RIG-01  ·  Process Flow Diagram  ·  {wc ? "Well control" : "Kill line"}  ·  {APP_VERSION}
      </text>
      <text
        x={SHEET_W - 36}
        y={SHEET_H - 28}
        textAnchor="end"
        className="fill-drawing-muted"
        fontSize={10}
        fontFamily="var(--font-sans)"
      >
        STASIS
      </text>
    </g>
  );
}

function LiveProcessChoke({
  x,
  y,
  id,
  tag,
  lined,
  selected,
}: {
  x: number;
  y: number;
  id: "CK-A" | "CK-B";
  tag: string;
  lined: boolean;
  selected: boolean;
}) {
  const pos = useSim((s) => (id === "CK-A" ? s.ckA : s.ckB));
  const select = useSim((s) => s.select);
  const nudgeChoke = useSim((s) => s.nudgeChoke);
  return (
    <ProcessChoke
      x={x}
      y={y}
      position={pos}
      inService={lined && pos > 0.5}
      selected={selected}
      tag={tag}
      onClick={() => select({ kind: "choke", id })}
      onNudge={(d) => nudgeChoke(id, d)}
    />
  );
}

function LiveManifold({
  wc,
  lined,
  selected,
  live,
}: {
  wc: boolean;
  lined: boolean;
  selected: boolean;
  live: boolean;
}) {
  const ckM = useSim((s) => s.ckM);
  const select = useSim((s) => s.select);
  const nudgeChoke = useSim((s) => s.nudgeChoke);
  return (
    <RigChokeManifold
      ckM={ckM}
      inService={wc && lined && ckM > 0.5}
      selectedChoke={selected}
      live={live}
      onSelectChoke={() => select({ kind: "choke", id: "CK-M" })}
      onNudge={(d) => nudgeChoke("CK-M", d)}
    />
  );
}

function WhpRead({ x, y }: { x: number; y: number }) {
  const pWh = useSim((s) => liveInt(s.pWh, s.simTime, 1.1, 1.5));
  return <Instrument x={x} y={y} tag="WHP" value={`${pWh}`} unit="psi" live={pWh > 80} />;
}

function FmRead({ x, y, live }: { x: number; y: number; live: boolean }) {
  const qFm = useSim((s) => liveInt(s.qFm, s.simTime, 2.4, 2.2));
  return <Instrument x={x} y={y} tag="FM-01" value={`${qFm}`} unit="gpm" live={live} />;
}

function SppRead({ x, y, live }: { x: number; y: number; live: boolean }) {
  const p = useSim((s) => liveInt(s.pStandpipe, s.simTime, 3.2, 2.8));
  return <Instrument x={x} y={y} tag="SPP" value={`${p}`} unit="psi" live={live} />;
}
