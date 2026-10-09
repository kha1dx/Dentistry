import { BRAND } from "@/config/brand";
import { cn } from "@/lib/cn";

/** Wordmark: a molar cusp outline + name. */
export function LogoMark({ className, size = 28, ink = "var(--primary-ink)" }: { className?: string; size?: number; ink?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M9 12.5c0-2.6 1.9-4.5 4.4-4.5 1.3 0 2 .8 2.6.8s1.3-.8 2.6-.8c2.5 0 4.4 1.9 4.4 4.5 0 2.6-1 3.8-1.5 6-.5 2.3-1 5.5-2.7 5.5-1.4 0-1.6-3.4-2.8-3.4s-1.4 3.4-2.8 3.4c-1.7 0-2.2-3.2-2.7-5.5C10 16.3 9 15.1 9 12.5z"
        fill="none"
        stroke={ink}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, tone = "brand", sub }: { className?: string; tone?: "brand" | "light"; sub?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={tone === "light" ? "text-side-active" : "text-primary"} ink={tone === "light" ? "var(--side)" : "var(--primary-ink)"} />
      <span className="flex flex-col leading-none">
        <span className={cn("text-[17px] font-semibold tracking-[-0.02em]", tone === "light" ? "text-side-ink" : "text-ink")}>{BRAND.name}</span>
        {sub && <span className={cn("mt-1 text-[10.5px] font-medium uppercase tracking-[0.12em]", tone === "light" ? "text-side-muted" : "text-ink-muted")}>{sub}</span>}
      </span>
    </span>
  );
}
