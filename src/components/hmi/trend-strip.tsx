import { useSim } from "@/lib/sim/store";

export function TrendStrip() {
  const trend = useSim((s) => s.trend);
  const qFm = useSim((s) => s.qFm);
  const pWh = useSim((s) => s.pWh);
  const dens = useSim((s) => s.densityPpg);
  const choke = useSim((s) => Math.max(s.ckA, s.ckB, s.ckM));
  const seed = { t: 0, q: qFm, p: pWh, dens, choke };
  const data = trend.length > 2 ? trend : [seed, { ...seed, t: 1 }];

  return (
    <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-3">
      <Spark title="FM-01 gpm" color="var(--color-accent)" data={data} datakey="q" digits={0} />
      <Spark title="WHP psi" color="var(--color-warn)" data={data} datakey="p" digits={0} />
      <Spark title="Density ppg" color="var(--color-open)" data={data} datakey="dens" digits={2} />
    </div>
  );
}

function Spark({
  title,
  color,
  data,
  datakey,
  digits,
}: {
  title: string;
  color: string;
  data: { q: number; p: number; dens: number }[];
  datakey: "q" | "p" | "dens";
  digits: number;
}) {
  const last = data[data.length - 1];
  const value = last ? last[datakey] : 0;
  const pts = sparkPoints(data, datakey);
  return (
    <div className="bg-surface px-3 py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-medium tracking-widest text-faint uppercase">{title}</span>
        <span className="font-mono text-base font-semibold tabular-nums leading-none text-fg">
          {value.toFixed(digits)}
        </span>
      </div>
      <svg viewBox="0 0 120 32" className="h-12 w-full" preserveAspectRatio="none" aria-hidden>
        <polyline fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" points={pts} />
      </svg>
    </div>
  );
}

function sparkPoints(
  data: { q: number; p: number; dens: number }[],
  key: "q" | "p" | "dens",
) {
  if (data.length < 2) return "0,16 120,16";
  let min = Infinity;
  let max = -Infinity;
  for (const d of data) {
    const v = d[key];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min || 1;
  return data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 120;
      const y = 30 - ((d[key] - min) / span) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
