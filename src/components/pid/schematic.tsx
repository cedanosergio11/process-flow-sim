import { Coriolis, MgsVessel, RigChokeManifold, WellControlStack } from "./equipment";
import {
  ArrowFlag,
  CrossBlock,
  DrawingDefs,
  Instrument,
  IsaValve,
  KillFlag,
  Pipe,
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

export const SHEET_W = 2480;
export const SHEET_H = 1760;

const KILL_X = 120;
const P1 = 200;
const P2 = 310;
const P3 = 420;
const SP_Y = 185;
const HANG_Y = 255;
const BOP_X = 500;
const BOP_Y = 660;
const DRILL_X = BOP_X;
const RET_Y = BOP_Y + 20;
const FILL_X = 290;
const TT_Y = 455;
const FL_X = 820;
const SPOOL_Y = BOP_Y + 301;
const RCD_TOP = BOP_Y - 28;
const FILL_Y = BOP_Y + 16;
const RET_X = BOP_X + 68;
const FILL_NOZ = BOP_X - 64;

const C1_X = 700;
const E4_X = 940;
const E5_X = 780;
const E5_Y = SPOOL_Y;
const E5B_Y = E5_Y - 32;

const LX = 1120;
const RX = 1320;
const FM_CX = 1560;
const DROP_X = FM_CX + 215;
const MGS_X = 2120;
const MGS_Y = 250;
/** FL laterals: MGS→FL climbs from MGS bottom to F3_Y, FL→MGS at F4, D-4/D-5 at F5. */
const F3_Y = MGS_Y - 8;
const F4_Y = MGS_Y + 36;
const F5_Y = MGS_Y + 78;
/** Package → MGS inlet nozzle (not on the FL laterals). */
const MGS_IN_Y = MGS_Y + 52;
/** MGS hopper flange (vessel-local y=226) — MGS→FL liquid outlet. */
const MGS_BOTTOM_Y = MGS_Y + 226;
/** Drop column on the right of the MGS for MGS→FL climb to F3_Y. */
const MGS_OUT_DROP_X = MGS_X + 70;

const MAN_DX = E5_X - 640;
const MAN_DY = E5_Y - 720;

const CK_A_Y = RET_Y - 110;
const CK_3_Y = RET_Y - 54;
/** Lower equalize rail (C-8 peer to C-5). */
const CK_6_Y = RET_Y + 56;
/** C-6 / C-7 isolation on Ck-B legs below the equalize tee. */
const CK_B_ISO_Y = RET_Y + 100;
const CK_B_Y = RET_Y + 150;
const FM_LOOP_Y = RET_Y - 58;
const CK_MID_X = (LX + RX) / 2;

const BASE_POS: Record<
  Exclude<ValveId, "E-5">,
  { x: number; y: number; rot?: number; size?: "main" | "fill"; tagX?: number; tagY?: number }
> = {
  "C-1": { x: C1_X, y: RET_Y, tagY: 32 },
  "C-2": { x: FL_X, y: BOP_Y - 90, rot: 90, tagX: 26, tagY: 4 },
  "C-3": { x: LX, y: CK_3_Y, rot: 90, tagX: 22, tagY: 4 },
  "C-4": { x: RX, y: CK_3_Y, rot: 90, tagX: 22, tagY: 4 },
  "C-5": { x: CK_MID_X, y: RET_Y, tagY: -16 },
  "C-6": { x: LX, y: CK_B_ISO_Y, rot: 90, tagX: 22, tagY: 4 },
  "C-7": { x: RX, y: CK_B_ISO_Y, rot: 90, tagX: 22, tagY: 4 },
  "C-8": { x: CK_MID_X, y: CK_6_Y, tagY: -14 },
  "D-1": { x: FM_CX - 85, y: FM_LOOP_Y, rot: 90, tagX: -22, tagY: 4 },
  "D-2": { x: FM_CX + 85, y: FM_LOOP_Y, rot: 90, tagX: 22, tagY: 4 },
  "D-3": { x: FM_CX, y: RET_Y, tagY: 18 },
  "D-4": { x: FM_CX + 175, y: F5_Y, tagY: -16 },
  "D-5": { x: FL_X + 150, y: F5_Y, tagY: 20 },
  "D-6": { x: FM_CX + 255, y: RET_Y, tagY: 18 },
  "E-1": { x: FILL_NOZ - 90, y: FILL_Y, size: "fill", tagY: 30 },
  "E-2": { x: FILL_X, y: FILL_Y - 20, rot: 90, size: "fill", tagX: 24, tagY: 4 },
  "E-3": { x: FILL_X, y: FILL_Y - 90, rot: 90, size: "fill", tagX: 24, tagY: 4 },
  "E-4": { x: E4_X, y: RET_Y, tagY: -16 },
  "E-6": { x: E5_X, y: E5B_Y, rot: 90, tagX: 22, tagY: 4 },
  "S-1": { x: 220, y: SP_Y, tagY: 28 },
  "S-2": { x: 330, y: SP_Y, tagY: 28 },
  "S-3": { x: 400, y: SP_Y, tagY: -18 },
  "S-4": { x: KILL_X, y: HANG_Y, rot: 90, tagX: -24, tagY: 4 },
  "S-5": { x: 240, y: HANG_Y, rot: 90, tagX: 22, tagY: 4 },
  "S-6": { x: 340, y: HANG_Y, rot: 90, tagX: 22, tagY: 4 },
  "S-7": { x: 480, y: SP_Y, tagY: -18 },
  "F-1": { x: FL_X, y: 92, rot: 90, tagX: 22, tagY: 4 },
  "F-2": { x: FL_X, y: 128, rot: 90, tagX: 22, tagY: 4 },
  "F-3": { x: FL_X + 58, y: F3_Y, tagY: 22 },
  "F-4": { x: FL_X + 58, y: F4_Y, tagY: 22 },
  "F-5": { x: FL_X + 58, y: F5_Y, tagY: -16 },
  "F-6": { x: FL_X + 118, y: F5_Y, tagY: 22 },
  "T-1": { x: 518, y: TT_Y, size: "fill", tagY: 28 },
  "T-2": { x: FILL_X, y: TT_Y, size: "fill", tagY: 28 },
  "B-1": { x: BOP_X - 86, y: SPOOL_Y, tagY: 28 },
  "B-2": { x: BOP_X + 86, y: SPOOL_Y, tagY: 28 },
  "K-1": { x: KILL_X + 90, y: SPOOL_Y, tagY: -16 },
  "M-0": { x: E5_X, y: E5_Y, tagY: 32 },
  "M-1": { x: 748 + MAN_DX, y: 688 + MAN_DY, tagY: -16 },
  "M-2": { x: 890 + MAN_DX, y: 688 + MAN_DY, tagY: -16 },
  "M-3": { x: 748 + MAN_DX, y: 752 + MAN_DY, tagY: 28 },
  "M-4": { x: 890 + MAN_DX, y: 752 + MAN_DY, tagY: 28 },
  "M-5": { x: 1040 + MAN_DX, y: 676 + MAN_DY, tagY: -14 },
  "M-6": { x: 1040 + MAN_DX, y: 706 + MAN_DY, tagY: -14 },
  "M-7": { x: 1040 + MAN_DX, y: 736 + MAN_DY, tagY: 18 },
  "M-8": { x: 1040 + MAN_DX, y: 766 + MAN_DY, tagY: 18 },
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

      <Skid x={86} y={40} w={380} h={78} title="*Rig Pumps" />
      <Skid x={76} y={130} w={400} h={155} title="*Rig Stand Pipe MN" />
      <Skid x={230} y={380} w={380} h={150} title="*Trip Tank" />
      <Skid x={FL_X - 70} y={40} w={250} h={F5_Y - 10} title="*Rig Flow Line" />
      <Skid x={LX - 90} y={CK_A_Y - 48} w={RX - LX + 180} h={CK_B_Y - CK_A_Y + 96} title="DUAL CHOKE" hatch />
      <Skid x={d1 - 50} y={FM_LOOP_Y - 50} w={d6 - d1 + 120} h={140} title="FM-01" hatch />

      <Pipe d={`M ${P1} 96 L ${P1} ${SP_Y}`} live={pumps[0]!.on && running} />
      <Pipe d={`M ${P2} 96 L ${P2} ${SP_Y}`} live={pumps[1]!.on && running} />
      <Pipe d={`M ${P3} 96 L ${P3} ${SP_Y}`} live={pumps[2]!.on && running} />
      <Tee x={P1} y={SP_Y} />
      <Tee x={P2} y={SP_Y} />
      <Tee x={P3} y={SP_Y} />

      <Pipe d={`M ${KILL_X} ${SP_Y} L 202 ${SP_Y}`} live={hdrLeft} />
      <Tee x={KILL_X} y={SP_Y} />
      <Pipe d={`M 238 ${SP_Y} L 312 ${SP_Y}`} live={hdrMid} />
      <Pipe d={`M 348 ${SP_Y} L 382 ${SP_Y}`} live={hdrMid || (v("S-3") && t3On)} />
      <Pipe d={`M 418 ${SP_Y} L 462 ${SP_Y}`} live={t3On || (v("S-3") && hdrRight)} />
      <Pipe d={`M 498 ${SP_Y} L ${FL_X} ${SP_Y}`} live={sppLive} />
      <Tee x={FL_X} y={SP_Y} />
      <ArrowFlag x={520} y={SP_Y} label="SPP Bleed Off" />

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

      <Pipe d={`M 240 ${SP_Y} L 240 ${HANG_Y - 18}`} live={false} />
      <Pipe d={`M 240 ${HANG_Y + 18} L 240 ${HANG_Y + 36}`} live={false} />

      <Pipe d={`M 340 ${SP_Y} L 340 ${HANG_Y - 18}`} live={hdrMid} />
      <Pipe d={`M 340 ${HANG_Y + 18} L ${DRILL_X} ${HANG_Y + 18} L ${DRILL_X} ${RCD_TOP}`} live={dsLive} />
      <ArrowFlag x={360} y={HANG_Y + 18} label="Drill String" />
      <Tee x={340} y={SP_Y} />
      <Tee x={DRILL_X} y={HANG_Y + 18} />
      <polygon
        points={`${DRILL_X},${HANG_Y + 46} ${DRILL_X - 7},${HANG_Y + 34} ${DRILL_X + 7},${HANG_Y + 34}`}
        className="fill-drawing-line"
      />

      <Pipe d={`M ${FL_X} ${F5_Y} L ${FL_X} ${F4_Y}`} live={toFlLive || c2Live} />
      <Pipe d={`M ${FL_X} ${F4_Y} L ${FL_X} ${F3_Y}`} live={flLive || toFlLive || c2Live} />
      <Pipe d={`M ${FL_X} ${F3_Y} L ${FL_X} 146`} live={flLive || toFlLive || c2Live} />
      <Pipe d={`M ${FL_X} 74 L ${FL_X} 58`} live={(flLive || toFlLive || c2Live) && v("F-1") && v("F-2")} />
      <polygon
        points={`${FL_X},58 ${FL_X - 7},70 ${FL_X + 7},70`}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1}
      />
      <text
        x={FL_X - 16}
        y={88}
        className="fill-drawing-fg"
        fontSize={9}
        fontFamily="var(--font-sans)"
        transform={`rotate(-90 ${FL_X - 16} 110)`}
      >
        To Shakers
      </text>

      <Pipe d={`M ${FL_X} ${F3_Y} L ${FL_X + 40} ${F3_Y}`} live={flLive && v("F-3")} />
      <Pipe d={`M ${FL_X + 76} ${F3_Y} L ${MGS_OUT_DROP_X} ${F3_Y}`} live={flLive && v("F-3")} />
      <Pipe
        d={`M ${MGS_OUT_DROP_X} ${F3_Y} L ${MGS_OUT_DROP_X} ${MGS_BOTTOM_Y + 24} L ${MGS_X} ${MGS_BOTTOM_Y + 24} L ${MGS_X} ${MGS_BOTTOM_Y}`}
        live={flLive && v("F-3")}
      />
      <Tee x={FL_X} y={F3_Y} />
      <Tee x={MGS_OUT_DROP_X} y={F3_Y} />
      <ArrowFlag x={FL_X + 280} y={F3_Y} label="MGS to FL" dir="left" />

      <Pipe d={`M ${FL_X} ${F4_Y} L ${FL_X + 40} ${F4_Y}`} live={v("F-4")} />
      <Pipe d={`M ${FL_X + 76} ${F4_Y} L ${MGS_X - 48} ${F4_Y}`} live={v("F-4")} />
      <Tee x={FL_X} y={F4_Y} />
      <ArrowFlag x={FL_X + 280} y={F4_Y} label="FL to MGS" dir="right" />

      <Pipe d={`M ${FL_X + 120} ${F5_Y} L ${FL_X} ${F5_Y}`} live={toFlLive && v("F-5")} />
      <SpecBreak x={FL_X + 100} y={F5_Y} />
      <Pipe d={`M ${d4 - 18} ${F5_Y} L ${FL_X + 168} ${F5_Y}`} live={toFlLive} />
      <Pipe d={`M ${DROP_X} ${RET_Y} L ${DROP_X} ${F5_Y} L ${d4 + 18} ${F5_Y}`} live={toFlLive} />
      <Tee x={FL_X} y={F5_Y} />
      <Tee x={DROP_X} y={F5_Y} />
      <Tee x={DROP_X} y={RET_Y} />

      <SpecBreak x={FL_X} y={BOP_Y - 108} rotation={90} />
      <Pipe d={`M ${FL_X} ${BOP_Y - 108} L ${FL_X} ${F5_Y}`} live={c2Live} />
      <Pipe d={`M ${FL_X} ${BOP_Y - 72} L ${FL_X} ${RET_Y - 11}`} live={c2Live} />
      <Tee x={FL_X} y={RET_Y} />

      <rect
        x={370}
        y={TT_Y - 14}
        width={110}
        height={28}
        className="fill-drawing-card stroke-drawing-line"
        strokeWidth={1.3}
      />
      <text
        x={425}
        y={TT_Y + 4}
        textAnchor="middle"
        className="fill-drawing-fg"
        fontSize={11}
        fontFamily="var(--font-sans)"
      >
        Trip Tank
      </text>
      <Pipe d={`M 480 ${TT_Y} L 500 ${TT_Y}`} live={false} size="fill" />
      <Pipe d={`M 536 ${TT_Y} L ${FL_X} ${TT_Y}`} live={v("T-1")} size="fill" />
      <Tee x={FL_X} y={TT_Y} size="fill" />
      <Pipe d={`M ${FILL_X + 18} ${TT_Y} L 370 ${TT_Y}`} live={false} size="fill" />
      <Pipe d={`M ${FILL_X} ${TT_Y} L ${FILL_X} ${FILL_Y - 108}`} live={fillLive} size="fill" />
      <Tee x={FILL_X} y={TT_Y} size="fill" />
      <SpecBreak x={FILL_X} y={FILL_Y - 108} rotation={90} />
      <Pipe d={`M ${FILL_X} ${FILL_Y - 72} L ${FILL_X} ${FILL_Y - 38}`} live={fillLive} size="fill" />
      <Pipe
        d={`M ${FILL_X} ${FILL_Y - 2} L ${FILL_X} ${FILL_Y} L ${FILL_NOZ - 108} ${FILL_Y}`}
        live={fillLive}
        size="fill"
      />
      <Tee x={FILL_X} y={FILL_Y} size="fill" />
      <Pipe d={`M ${FILL_NOZ - 72} ${FILL_Y} L ${FILL_NOZ} ${FILL_Y}`} live={fillLive} size="fill" />

      <Pipe d={`M ${RET_X} ${RET_Y} L ${C1_X - 18} ${RET_Y}`} live={retLive} />
      <Pipe d={`M ${C1_X + 18} ${RET_Y} L ${E4_X - 18} ${RET_Y}`} live={primLive} />
      <Pipe d={`M ${E4_X + 18} ${RET_Y} L ${LX - 11} ${RET_Y}`} live={primLive} />
      <CrossBlock x={LX} y={RET_Y} />
      <CrossBlock x={RX} y={RET_Y} />

      <Pipe d={`M ${LX + 11} ${RET_Y} L ${CK_MID_X - 18} ${RET_Y}`} live={v("C-5") && primLive} />
      <Pipe d={`M ${CK_MID_X + 18} ${RET_Y} L ${RX - 11} ${RET_Y}`} live={v("C-5") && primLive} />

      <Pipe d={`M ${LX} ${RET_Y - 11} L ${LX} ${CK_3_Y + 18}`} live={aLive} />
      <Pipe d={`M ${LX} ${CK_3_Y - 18} L ${LX} ${CK_A_Y}`} live={aLive} />
      <Pipe d={`M ${LX} ${CK_A_Y} L ${RX} ${CK_A_Y} L ${RX} ${CK_3_Y - 18}`} live={aLive} />
      <Pipe d={`M ${RX} ${CK_3_Y + 18} L ${RX} ${RET_Y - 11}`} live={aLive} />
      <Tee x={LX} y={CK_A_Y} />
      <Tee x={RX} y={CK_A_Y} />

      {/* Shared drop to lower equalize (C-8) / Ck-B header */}
      <Pipe
        d={`M ${LX} ${RET_Y + 11} L ${LX} ${CK_6_Y}`}
        live={bLive || (v("C-8") && primLive)}
      />
      <Pipe
        d={`M ${RX} ${RET_Y + 11} L ${RX} ${CK_6_Y}`}
        live={bLive || (v("C-8") && primLive)}
      />
      <Tee x={LX} y={CK_6_Y} />
      <Tee x={RX} y={CK_6_Y} />
      {/* C-8 lower equalize rail — peer to C-5 */}
      <Pipe d={`M ${LX + 11} ${CK_6_Y} L ${CK_MID_X - 18} ${CK_6_Y}`} live={v("C-8") && primLive} />
      <Pipe d={`M ${CK_MID_X + 18} ${CK_6_Y} L ${RX - 11} ${CK_6_Y}`} live={v("C-8") && primLive} />

      {/* Ck-B loop below equalize: C-6 / Chk B / C-7 */}
      <Pipe d={`M ${LX} ${CK_6_Y} L ${LX} ${CK_B_ISO_Y - 18}`} live={bLive} />
      <Pipe d={`M ${LX} ${CK_B_ISO_Y + 18} L ${LX} ${CK_B_Y}`} live={bLive} />
      <Pipe d={`M ${LX} ${CK_B_Y} L ${RX} ${CK_B_Y} L ${RX} ${CK_B_ISO_Y + 18}`} live={bLive} />
      <Pipe d={`M ${RX} ${CK_B_ISO_Y - 18} L ${RX} ${CK_6_Y}`} live={bLive} />
      <Tee x={LX} y={CK_B_Y} />
      <Tee x={RX} y={CK_B_Y} />

      <Pipe d={`M ${RX + 11} ${RET_Y} L ${d1 - 11} ${RET_Y}`} live={outLive} />
      <CrossBlock x={d1} y={RET_Y} />
      <CrossBlock x={d2} y={RET_Y} />

      <Pipe d={`M ${d1} ${RET_Y - 11} L ${d1} ${FM_LOOP_Y + 18}`} live={outLive} />
      <Pipe d={`M ${d1} ${FM_LOOP_Y - 18} L ${d1} ${FM_LOOP_Y} L ${d1 + 50} ${FM_LOOP_Y}`} live={meterLive} />
      <Pipe d={`M ${d2 - 50} ${FM_LOOP_Y} L ${d2} ${FM_LOOP_Y} L ${d2} ${FM_LOOP_Y - 18}`} live={meterLive} />
      <Pipe d={`M ${d2} ${FM_LOOP_Y + 18} L ${d2} ${RET_Y - 11}`} live={meterLive} />
      <Tee x={d1} y={FM_LOOP_Y} />
      <Tee x={d2} y={FM_LOOP_Y} />

      <Pipe d={`M ${d1 + 11} ${RET_Y} L ${d3 - 18} ${RET_Y}`} live={bypLive} />
      <Pipe d={`M ${d3 + 18} ${RET_Y} L ${d2 - 11} ${RET_Y}`} live={bypLive} />
      <Pipe d={`M ${d2 + 11} ${RET_Y} L ${DROP_X} ${RET_Y}`} live={outLive} />
      <Pipe d={`M ${DROP_X} ${RET_Y} L ${d6 - 18} ${RET_Y}`} live={mgsLive} />
      <Pipe
        d={`M ${d6 + 18} ${RET_Y} L ${MGS_X - 70} ${RET_Y} L ${MGS_X - 70} ${MGS_IN_Y} L ${MGS_X - 48} ${MGS_IN_Y}`}
        live={mgsLive}
      />

      <Pipe d={`M ${MGS_X + 8} 182 L ${MGS_X + 8} 48`} live={false} />
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

      <Pipe
        d={`M ${BOP_X + 98} ${SPOOL_Y} L ${E5_X - 18} ${SPOOL_Y}`}
        live={manifoldLive}
        muted={!wc}
      />
      <Pipe d={`M ${E5_X + 18} ${E5_Y} L ${670 + MAN_DX} ${E5_Y}`} live={manifoldLive} muted={!wc} />
      <Tee x={E5_X} y={E5_Y} />

      <Tee x={E4_X} y={RET_Y} />
      <Pipe
        d={`M ${E4_X} ${RET_Y + 18} L ${E4_X} ${E5B_Y} L ${E5_X} ${E5B_Y}`}
        live={primLive && v("E-4")}
      />
      <Tee x={E4_X} y={E5B_Y} />
      <Tee x={E5_X} y={E5B_Y} />
      <Pipe d={`M ${E5_X} ${E5B_Y + 18} L ${E5_X} ${E5_Y}`} live={primLive && v("E-4") && v("E-6")} />

      <PumpSymbol
        x={P1}
        y={80}
        running={pumps[0]!.on}
        tag="T1"
        selected={selected?.kind === "pump" && selected.id === "T1"}
        onClick={() => togglePump("T1")}
      />
      <PumpSymbol
        x={P2}
        y={80}
        running={pumps[1]!.on}
        tag="T2"
        selected={selected?.kind === "pump" && selected.id === "T2"}
        onClick={() => togglePump("T2")}
      />
      <PumpSymbol
        x={P3}
        y={80}
        running={pumps[2]!.on}
        tag="T3"
        selected={selected?.kind === "pump" && selected.id === "T3"}
        onClick={() => togglePump("T3")}
      />
      <SppRead x={510} y={58} live={pumpsLive} />

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

      <WhpRead x={C1_X - 80} y={RET_Y + 48} />
      <FmRead x={FM_CX} y={FM_LOOP_Y - 62} live={meterLive} />

      <g transform={`translate(${MAN_DX} ${MAN_DY})`}>
        <LiveManifold
          wc={wc}
          lined={v("E-4") && v("E-5") && v("M-1") && v("M-2")}
          selected={selected?.kind === "choke" && selected.id === "CK-M"}
          live={manifoldLive}
        />
      </g>

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
