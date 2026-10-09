import type { ArtKind, Category } from "@/data/types";
import { cn } from "@/lib/cn";

/* Simple instrument line drawings, 64x64, stroked in currentColor.
   They stand in for product photography in the prototype. */

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ACCENT = "var(--primary)";
const SOFT = "var(--primary-soft)";
const ISO = ["#f4f4f1", "#f2c230", "#d8423b", "#2f6fdb", "#2e9e6a", "#1d1f1e"];

const tooth = "M0 4C0 1.5 2 0 4.5 0c2 0 2.7 1.2 4.5 1.2S11.5 0 13.5 0C16 0 18 1.5 18 4c0 3.5-1.4 5.5-2 9-.6 3.4-1.2 7-3.4 7-1.8 0-2-4.5-3.6-4.5S7.2 20 5.4 20C3.2 20 2.6 16.4 2 13 1.4 9.5 0 7.5 0 4z";

function Teeth({ n = 3 }: { n?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={tooth} transform={`translate(${8 + i * 17} ${20 + (i % 2) * 4}) scale(${n > 2 ? 0.85 : 1})`} {...S} fill={i === 1 ? SOFT : "var(--surface)"} />
      ))}
    </g>
  );
}

function Arch() {
  const teeth = Array.from({ length: 14 }, (_, i) => {
    const a = Math.PI + (i / 13) * Math.PI;
    return { x: 32 + Math.cos(a) * 21, y: 42 + Math.sin(a) * 26, rot: (a * 180) / Math.PI + 90 };
  });
  return (
    <g>
      <path d="M8 46c0-20 10-32 24-32s24 12 24 32" fill="none" stroke="var(--bad-soft)" strokeWidth="9" strokeLinecap="round" />
      {teeth.map((t, i) => (
        <rect key={i} x={-2.6} y={-3.2} width={5.2} height={6.4} rx={2} transform={`translate(${t.x} ${t.y}) rotate(${t.rot})`} {...S} strokeWidth={1.2} fill="var(--surface)" />
      ))}
      <path d="M14 50h36" {...S} />
      <path d="M18 54h28" {...S} opacity={0.5} />
    </g>
  );
}

function Art({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case "handpiece":
      return (
        <g transform="rotate(-38 32 32)">
          <path d="M6 29.5h30l8 1v3l-8 1H6a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 6 29.5z" {...S} fill="var(--surface)" />
          <path d="M12 29.5v5M16 29.5v5M20 29.5v5" {...S} opacity={0.5} />
          <path d="M44 30.5h6" {...S} />
          <rect x="49" y="25" width="9" height="11" rx="3" {...S} fill={SOFT} />
          <path d="M53.5 36v7" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="53.5" cy="44" r="1.3" fill={ACCENT} />
        </g>
      );
    case "contra":
      return (
        <g transform="rotate(-30 32 32)">
          <path d="M5 30h24l6 1.2v3.6L29 36H5a3 3 0 0 1 0-6z" {...S} fill="var(--surface)" />
          <path d="M35 31.5l9-4 3 2-8 6" {...S} fill="var(--surface)" />
          <rect x="45" y="22" width="8" height="9" rx="2.5" transform="rotate(-24 49 26)" {...S} fill={SOFT} />
          <path d="M51 30l2.5 6" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 30v6M14 30v6" {...S} opacity={0.5} />
        </g>
      );
    case "micromotor":
      return (
        <g>
          <rect x="6" y="30" width="24" height="22" rx="4" {...S} fill="var(--surface)" />
          <circle cx="18" cy="43" r="5" {...S} fill={SOFT} />
          <path d="M18 43l3-3" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="11" y="33.5" width="14" height="3.5" rx="1.2" {...S} strokeWidth={1.2} />
          <path d="M30 36c8 0 6-18 16-18" {...S} />
          <path d="M44 20l12-10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M44 20l12-10" stroke="var(--surface)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M56 10l3-2.5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    case "curing":
      return (
        <g>
          <path d="M14 22h26a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H24l-4 18h-7l2-19a6 6 0 0 1-1-3v-3a4 4 0 0 1 0-4z" {...S} fill="var(--surface)" />
          <path d="M44 26l10-8" {...S} strokeWidth={3} />
          <path d="M54 18l2.5-2" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M58 12l3-3M60 17l3.5-.5M55 9.5l.5-3.5" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" opacity={0.8} />
          <rect x="20" y="25.5" width="8" height="4" rx="1.2" fill={SOFT} stroke="currentColor" strokeWidth={1.2} />
        </g>
      );
    case "endomotor":
      return (
        <g transform="rotate(-35 32 32)">
          <rect x="6" y="26" width="34" height="12" rx="5" {...S} fill="var(--surface)" />
          <rect x="12" y="29" width="12" height="6" rx="1.5" fill={SOFT} stroke="currentColor" strokeWidth={1.2} />
          <path d="M40 30l10-1.5v7L40 34" {...S} />
          <rect x="49" y="27" width="6" height="10" rx="2" {...S} fill="var(--surface)" />
          <path d="M52 37v7" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    case "scaler":
      return (
        <g>
          <rect x="6" y="32" width="26" height="20" rx="4" {...S} fill="var(--surface)" />
          <circle cx="19" cy="42" r="4.5" {...S} fill={SOFT} />
          <path d="M32 40c10 0 6-20 16-22" {...S} />
          <path d="M47 19l9-9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M47 19l9-9" stroke="var(--surface)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M56 10c2-2 4-1 4 1" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>
      );
    case "burs":
      return (
        <g>
          {[14, 25, 36, 47].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 52V26`} {...S} />
              <rect x={x - 1.8} y="44" width="3.6" height="9" rx="1" fill="var(--surface)" stroke="currentColor" strokeWidth={1.2} />
              {i === 0 && <circle cx={x} cy="22" r="4" fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />}
              {i === 1 && <path d={`M${x - 3.5} 26c0-6 1.5-10 3.5-10s3.5 4 3.5 10z`} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />}
              {i === 2 && <path d={`M${x - 3} 27l3-14 3 14z`} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} strokeLinejoin="round" />}
              {i === 3 && <path d={`M${x - 2} 26h4l2-8h-8z`} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} strokeLinejoin="round" />}
            </g>
          ))}
        </g>
      );
    case "typodont":
      return <Arch />;
    case "teeth":
      return <Teeth />;
    case "mirror":
      return (
        <g>
          <path d="M20 54L38 22" {...S} strokeWidth={3} />
          <path d="M20 54L38 22" stroke="var(--surface)" strokeWidth={1} />
          <circle cx="42" cy="15" r="8" {...S} fill={SOFT} />
          <circle cx="42" cy="15" r="5" fill="none" stroke={ACCENT} strokeWidth={1.2} opacity={0.6} />
          <path d="M46 54l4-30c.3-2.5 3-3.5 4.5-1.5" {...S} />
        </g>
      );
    case "instruments":
      return (
        <g>
          {[16, 30, 44].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 56V18`} stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d={`M${x} 56V18`} stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" />
              <path d={i === 0 ? `M${x} 18c0-5 4-6 5-10` : i === 1 ? `M${x} 18v-6l3-3` : `M${x} 18c0-4-4-5-3-10`} stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d={`M${x - 2} 44h4M${x - 2} 40h4`} {...S} strokeWidth={1} opacity={0.6} />
            </g>
          ))}
        </g>
      );
    case "carver":
      return (
        <g>
          <path d="M14 54L44 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M14 54L44 14" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M44 14l6-6c1 3 0 6-3 8z" fill={SOFT} stroke={ACCENT} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M28 56l20-26c1.5-2 5-2 6 0" {...S} />
          <rect x="10" y="42" width="16" height="12" rx="2" fill="#f2b8c6" opacity={0.55} transform="rotate(-8 18 48)" />
        </g>
      );
    case "forceps":
      return (
        <g>
          <path d="M18 56c2-12 8-20 12-28M46 56c-2-12-8-20-12-28" {...S} strokeWidth={2.2} />
          <circle cx="32" cy="27" r="2.4" {...S} fill={SOFT} />
          <path d="M30 26c-3-4-4-10-2-15 1.5 3 3.5 5 4 8M34 26c3-4 4-10 2-15-1.5 3-3.5 5-4 8" {...S} stroke={ACCENT} />
        </g>
      );
    case "files":
      return (
        <g>
          {ISO.map((c, i) => {
            const x = 12 + i * 8;
            return (
              <g key={c}>
                <path d={`M${x} 32V56`} {...S} strokeWidth={1.2} />
                <path d={`M${x} 34l-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4 2`} stroke="currentColor" strokeWidth={0.9} fill="none" opacity={0.6} />
                <rect x={x - 3} y="12" width="6" height="18" rx="2" fill={c} stroke="currentColor" strokeWidth={1.2} />
                <path d={`M${x - 3} 18h6M${x - 3} 22h6`} stroke="currentColor" strokeWidth={0.6} opacity={0.4} />
              </g>
            );
          })}
        </g>
      );
    case "syringe":
      return (
        <g transform="rotate(-35 32 32)">
          <rect x="12" y="27" width="28" height="10" rx="2" {...S} fill="var(--surface)" />
          <rect x="16" y="29" width="14" height="6" rx="1" fill={SOFT} />
          <path d="M40 30h6l4 1.5v1L46 34h-6" {...S} />
          <path d="M12 32H4M4 27v10" {...S} />
          <path d="M50 32h4" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    case "jar":
      return (
        <g>
          <rect x="16" y="18" width="32" height="8" rx="2" {...S} fill={SOFT} />
          <path d="M18 26h28v24a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" {...S} fill="var(--surface)" />
          <rect x="22" y="33" width="20" height="12" rx="1.5" {...S} strokeWidth={1.2} />
          <path d="M26 38h12M26 41h8" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    case "wax":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={12 + i * 2} y={22 + i * 7} width="38" height="12" rx="2" fill="#f2b8c6" fillOpacity={0.35 + i * 0.2} stroke="currentColor" strokeWidth={1.4} />
          ))}
        </g>
      );
    case "dam":
      return (
        <g>
          <path d="M14 14v26a18 18 0 0 0 36 0V14" {...S} strokeWidth={2} />
          <rect x="18" y="16" width="28" height="28" rx="2" fill="#7bc4a7" fillOpacity={0.35} stroke="currentColor" strokeWidth={1.2} />
          <circle cx="32" cy="30" r="2.2" fill="var(--surface)" stroke={ACCENT} strokeWidth={1.4} />
          <circle cx="25" cy="27" r="1.6" fill="var(--surface)" stroke="currentColor" strokeWidth={1} />
          <circle cx="39" cy="27" r="1.6" fill="var(--surface)" stroke="currentColor" strokeWidth={1} />
        </g>
      );
    case "loupes":
      return (
        <g>
          <path d="M6 30c2-6 8-8 14-8h24c6 0 12 2 14 8" {...S} />
          <path d="M24 30h16" {...S} />
          <rect x="12" y="28" width="12" height="16" rx="4" {...S} fill={SOFT} />
          <rect x="40" y="28" width="12" height="16" rx="4" {...S} fill={SOFT} />
          <circle cx="32" cy="20" r="2.5" fill={ACCENT} />
          <path d="M28 14l-2-3M36 14l2-3M32 13v-4" stroke={ACCENT} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case "coat":
      return (
        <g>
          <path d="M24 12l8 6 8-6 10 5 6 14-6 3v20H14V34l-6-3 6-14z" {...S} fill="var(--surface)" />
          <path d="M32 18v36" {...S} />
          <path d="M24 12l-2 12 10 4M40 12l2 12-10 4" {...S} opacity={0.6} />
          <rect x="36" y="34" width="8" height="6" rx="1" fill={SOFT} stroke={ACCENT} strokeWidth={1.2} />
        </g>
      );
    case "case":
      return (
        <g>
          <path d="M24 20v-4a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4" {...S} />
          <rect x="8" y="20" width="48" height="32" rx="4" {...S} fill="var(--surface)" />
          <path d="M8 32h48" {...S} />
          <rect x="28" y="29" width="8" height="7" rx="1.5" fill={SOFT} stroke={ACCENT} strokeWidth={1.4} />
        </g>
      );
    case "kit":
    default:
      return (
        <g>
          <path d="M10 26l22-10 22 10" {...S} fill={SOFT} />
          <rect x="10" y="26" width="44" height="26" rx="3" {...S} fill="var(--surface)" />
          <path d="M16 26V18M22 26V12M28 26V16" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="22" cy="11" r="2" fill={ACCENT} />
          <rect x="26" y="34" width="12" height="7" rx="1.5" {...S} strokeWidth={1.2} />
          {ISO.slice(1, 5).map((c, i) => (
            <rect key={c} x={38 + i * 3.4} y={14} width="2.6" height="12" rx="1" fill={c} stroke="currentColor" strokeWidth={0.6} />
          ))}
        </g>
      );
  }
}

const TILE: Record<Category | "Kit", string> = {
  "Handpieces & motors": "var(--tile-1)",
  "Hand instruments": "var(--tile-2)",
  "Burs & rotary": "var(--tile-3)",
  "Typodonts & teeth": "var(--tile-4)",
  Materials: "var(--tile-5)",
  Endo: "var(--tile-6)",
  "Lab & PPE": "var(--tile-7)",
  Kit: "var(--tile-8)",
};

export function ProductArt({ kind, category, size = 64, className, tile = true, fluid = false }: { kind: ArtKind; category?: Category | "Kit"; size?: number; className?: string; tile?: boolean; fluid?: boolean }) {
  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center overflow-hidden text-ink-2", tile && "rounded-xl", className)}
      style={{ ...(fluid ? {} : { width: size, height: size }), ...(tile ? { background: TILE[category ?? "Kit"] } : {}) }}
    >
      <svg viewBox="0 0 64 64" width={fluid ? undefined : size * 0.78} height={fluid ? undefined : size * 0.78} aria-hidden className={cn("relative", fluid && "h-auto w-[58%]")}>
        <Art kind={kind} />
      </svg>
    </div>
  );
}
