import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ utils */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return ticks;
}

/** Column path with a 4px rounded data-end and a square baseline. */
function colPath(x: number, y: number, w: number, h: number, r = 4) {
  if (h <= 0) return "";
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

function Tip({ x, y, children, width }: { x: number; y: number; children: ReactNode; width: number }) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink shadow-pop"
      style={{ left, top: y - 8 }}
    >
      {children}
    </div>
  );
}

export function LegendKey({ color, label, line, dashed }: { color: string; label: ReactNode; line?: boolean; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
      {line ? (
        <svg width="16" height="8" aria-hidden>
          <line x1="1" y1="4" x2="15" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={dashed ? "3 3" : undefined} />
        </svg>
      ) : (
        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}

/* -------------------------------------------------------------- Sparkline */

export function Sparkline({ values, height = 36, className, accent = "var(--chart-1)" }: { values: number[]; height?: number; className?: string; accent?: string }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const pts = useMemo(() => {
    if (!w || values.length < 2) return [];
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const pad = 4;
    return values.map((v, i) => [pad + (i / (values.length - 1)) * (w - pad * 2), pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2)] as const);
  }, [values, w, height]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  return (
    <div ref={ref} className={cn("w-full", className)} style={{ height }}>
      {w > 0 && pts.length > 1 && (
        <svg width={w} height={height} aria-hidden>
          <path d={`${d}L${last[0]},${height}L${pts[0][0]},${height}Z`} fill="var(--chart-wash)" />
          <path d={d} fill="none" stroke="var(--chart-muted)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={`M${prev[0]},${prev[1]}L${last[0]},${last[1]}`} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <circle cx={last[0]} cy={last[1]} r="3.5" fill={accent} stroke="var(--surface)" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- TrendChart */

export interface Series {
  key: string;
  label: string;
  values: (number | null)[];
  color: string;
  area?: boolean;
  dashed?: boolean;
}

export function TrendChart({
  labels,
  series,
  height = 260,
  format,
  bands,
  partialLast,
  tipTitle,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  format: (n: number) => string;
  bands?: { from: number; to: number; label: string }[];
  partialLast?: boolean;
  tipTitle?: (i: number) => string;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { l: 52, r: 12, t: bands ? 26 : 12, b: 28 };
  const max = Math.max(1, ...series.flatMap((s) => s.values.filter((v): v is number => v !== null)));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const iw = Math.max(0, w - m.l - m.r);
  const ih = height - m.t - m.b;
  const n = labels.length;
  const x = (i: number) => m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => m.t + ih - (v / top) * ih;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round((px / rect.width) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label={series.map((s) => s.label).join(" vs ")}>
          {bands?.map((b) => (
            <g key={b.label}>
              <rect x={x(b.from) - 4} y={m.t} width={x(b.to) - x(b.from) + 8} height={ih} fill="var(--surface-3)" opacity="0.6" rx="6" />
              <text x={(x(b.from) + x(b.to)) / 2} y={m.t - 9} textAnchor="middle" fontSize="11" fill="var(--muted)">
                {b.label}
              </text>
            </g>
          ))}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--chart-axis)" : "var(--chart-grid)"} strokeWidth="1" />
              <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)" className="tnum">
                {format(t)}
              </text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill={hover === i ? "var(--ink)" : "var(--muted)"}>
              {l}
            </text>
          ))}
          {series.map((s) => {
            const pts = s.values.map((v, i) => (v === null ? null : ([x(i), y(v)] as const)));
            const solid = pts.filter(Boolean) as (readonly [number, number])[];
            const cut = partialLast && !s.dashed ? solid.length - 1 : solid.length;
            const main = solid.slice(0, cut);
            const d = main.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("");
            const tail = partialLast && !s.dashed && solid.length > 1 ? `M${solid[solid.length - 2][0]},${solid[solid.length - 2][1]}L${solid[solid.length - 1][0]},${solid[solid.length - 1][1]}` : "";
            return (
              <g key={s.key}>
                {s.area && main.length > 1 && <path d={`${d}L${main[main.length - 1][0]},${y(0)}L${main[0][0]},${y(0)}Z`} fill={s.color} opacity="0.1" />}
                <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? "4 4" : undefined} />
                {tail && <path d={tail} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />}
                {!s.dashed && solid.length > 0 && (
                  <circle cx={solid[solid.length - 1][0]} cy={solid[solid.length - 1][1]} r="4" fill={s.color} stroke="var(--surface)" strokeWidth="2" />
                )}
              </g>
            );
          })}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} stroke="var(--chart-axis)" strokeWidth="1" />
              {series.map((s) =>
                s.values[hover] === null ? null : <circle key={s.key} cx={x(hover)} cy={y(s.values[hover] as number)} r="4.5" fill={s.color} stroke="var(--surface)" strokeWidth="2" />,
              )}
            </g>
          )}
          <rect x={m.l} y={m.t} width={iw} height={ih} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
        </svg>
      )}
      {hover !== null && w > 0 && (
        <Tip x={x(hover)} y={Math.min(...series.map((s) => (s.values[hover] === null ? height : y(s.values[hover] as number))))} width={w}>
          <div className="mb-0.5 font-medium">{tipTitle ? tipTitle(hover) : labels[hover]}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <LegendKey color={s.color} label={s.label} line dashed={s.dashed} />
              <span className="tnum font-medium">{s.values[hover] === null ? "—" : format(s.values[hover] as number)}</span>
            </div>
          ))}
        </Tip>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- ColumnChart */

export function ColumnChart({
  data,
  height = 200,
  format,
  color = "var(--chart-1)",
  labelEvery = 1,
  highlightLast,
}: {
  data: { label: string; value: number; tip?: string }[];
  height?: number;
  format: (n: number) => string;
  color?: string;
  labelEvery?: number;
  highlightLast?: boolean;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { l: 44, r: 8, t: 18, b: 26 };
  const ticks = niceTicks(Math.max(1, ...data.map((d) => d.value)));
  const top = ticks[ticks.length - 1];
  const iw = Math.max(0, w - m.l - m.r);
  const ih = height - m.t - m.b;
  const band = iw / data.length;
  const bw = Math.min(28, band * 0.6);
  const y = (v: number) => m.t + ih - (v / top) * ih;
  const maxI = data.reduce((bi, d, i) => (d.value > data[bi].value ? i : bi), 0);

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Column chart">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--chart-axis)" : "var(--chart-grid)"} />
              <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)" className="tnum">
                {format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = m.l + band * i + band / 2;
            const h = (d.value / top) * ih;
            const dim = hover !== null && hover !== i;
            const rest = highlightLast && i !== data.length - 1;
            const fill = color;
            return (
              <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                <rect x={m.l + band * i} y={m.t} width={band} height={ih} fill="transparent" />
                <path d={colPath(cx - bw / 2, y(d.value), bw, h, 6)} fill={fill} opacity={dim ? 0.2 : rest ? 0.32 : 1} />
                {(i === maxI || (highlightLast && i === data.length - 1)) && d.value > 0 && (
                  <text x={cx} y={y(d.value) - 5} textAnchor="middle" fontSize="11" fill="var(--ink-2)" className="tnum">
                    {format(d.value)}
                  </text>
                )}
                {i % labelEvery === 0 && (
                  <text x={cx} y={height - 8} textAnchor="middle" fontSize="11" fill={hover === i ? "var(--ink)" : "var(--muted)"}>
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <Tip x={m.l + band * hover + band / 2} y={y(data[hover].value)} width={w}>
          <div className="font-medium">{data[hover].tip ?? data[hover].label}</div>
          <div className="tnum">{format(data[hover].value)}</div>
        </Tip>
      )}
    </div>
  );
}

/* ------------------------------------------------------- StackedColumns */

export function StackedColumns({
  data,
  series,
  height = 200,
  format,
}: {
  data: { label: string; values: number[] }[];
  series: { label: string; color: string }[];
  height?: number;
  format: (n: number) => string;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { l: 36, r: 8, t: 10, b: 26 };
  const ticks = niceTicks(Math.max(1, ...data.map((d) => d.values.reduce((a, b) => a + b, 0))));
  const top = ticks[ticks.length - 1];
  const iw = Math.max(0, w - m.l - m.r);
  const ih = height - m.t - m.b;
  const band = iw / data.length;
  const bw = Math.min(24, band * 0.62);
  const y = (v: number) => m.t + ih - (v / top) * ih;
  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height} role="img" aria-label="Stacked column chart">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--chart-axis)" : "var(--chart-grid)"} />
              <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)" className="tnum">
                {format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = m.l + band * i + band / 2;
            let acc = 0;
            const total = d.values.reduce((a, b) => a + b, 0);
            return (
              <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} opacity={hover !== null && hover !== i ? 0.5 : 1}>
                <rect x={m.l + band * i} y={m.t} width={band} height={ih} fill="transparent" />
                {d.values.map((v, k) => {
                  const y0 = y(acc);
                  acc += v;
                  const y1 = y(acc);
                  const isTop = acc === total;
                  const h = Math.max(0, y0 - y1 - (k > 0 ? 2 : 0));
                  return isTop ? (
                    <path key={k} d={colPath(cx - bw / 2, y1, bw, h)} fill={series[k].color} />
                  ) : (
                    <rect key={k} x={cx - bw / 2} y={y1} width={bw} height={Math.max(0, h - 2)} fill={series[k].color} />
                  );
                })}
                <text x={cx} y={height - 8} textAnchor="middle" fontSize="11" fill={hover === i ? "var(--ink)" : "var(--muted)"}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <Tip x={m.l + band * hover + band / 2} y={y(data[hover].values.reduce((a, b) => a + b, 0))} width={w}>
          <div className="mb-0.5 font-medium">{data[hover].label}</div>
          {series.map((s, k) => (
            <div key={s.label} className="flex items-center justify-between gap-4">
              <LegendKey color={s.color} label={s.label} />
              <span className="tnum font-medium">{format(data[hover].values[k])}</span>
            </div>
          ))}
        </Tip>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- BarList */

export function BarList({
  rows,
  format,
  color = "var(--chart-1)",
  onSelect,
}: {
  rows: { key: string; label: ReactNode; value: number; right?: ReactNode; sub?: ReactNode }[];
  format: (n: number) => string;
  color?: string;
  onSelect?: (key: string) => void;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.key}>
          <button
            type="button"
            disabled={!onSelect}
            onClick={() => onSelect?.(r.key)}
            className={cn("group block w-full text-left", onSelect && "cursor-pointer")}
          >
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="min-w-0 truncate text-ink">{r.label}</span>
              <span className="shrink-0 text-ink-2 tnum">
                {r.right ?? format(r.value)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-3">
              <div className="h-full rounded-full transition-[width] duration-500 group-hover:brightness-110" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
            </div>
            {r.sub && <div className="mt-1 text-[12px] text-ink-muted">{r.sub}</div>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ StackedBar */

export function StackedBar({
  segments,
  format,
  height = 14,
  showLegend = true,
}: {
  segments: { key: string; label: string; value: number; color: string }[];
  format: (n: number) => string;
  height?: number;
  showLegend?: boolean;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const [hover, setHover] = useState<string | null>(null);
  const visible = segments.filter((s) => s.value > 0);
  return (
    <div>
      <div className="flex w-full gap-[2px]" style={{ height }}>
        {visible.map((s, i) => (
          <div
            key={s.key}
            title={`${s.label}: ${format(s.value)}`}
            onPointerEnter={() => setHover(s.key)}
            onPointerLeave={() => setHover(null)}
            className={cn("h-full transition-opacity", i === 0 && "rounded-l-[4px]", i === visible.length - 1 && "rounded-r-[4px]")}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color, opacity: hover && hover !== s.key ? 0.45 : 1, minWidth: 3 }}
          />
        ))}
      </div>
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {segments.map((s) => (
            <div key={s.key} className="flex min-w-0 items-center gap-2" onPointerEnter={() => setHover(s.key)} onPointerLeave={() => setHover(null)}>
              <LegendKey color={s.color} label={s.label} />
              <span className="shrink-0 text-[12px] font-medium text-ink tnum">{format(s.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
