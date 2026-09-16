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
