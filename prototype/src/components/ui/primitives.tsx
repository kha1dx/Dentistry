import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

/* ------------------------------------------------------------------ Button */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-ink hover:bg-primary-hover shadow-card",
  secondary: "bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2 shadow-card",
  ghost: "text-ink-2 hover:text-ink hover:bg-surface-3",
  danger: "bg-bad text-white hover:opacity-90",
  soft: "bg-primary-soft text-primary-soft-ink hover:brightness-95",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-sm gap-2 rounded-[10px]",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, iconRight, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
});

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn("inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------- Badge */

export type Tone = "neutral" | "primary" | "good" | "warn" | "bad" | "info" | "violet";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-3 text-ink-2",
  primary: "bg-primary-soft text-primary-soft-ink",
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
};
const dots: Record<Tone, string> = {
  neutral: "bg-ink-muted",
  primary: "bg-primary",
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  info: "bg-info",
  violet: "bg-violet",
};

export function Badge({ tone = "neutral", dot, children, className, icon }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn("inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[12px] font-medium leading-none", tones[tone], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {icon}
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", dots[tone], className)} />;
}

/* -------------------------------------------------------------------- Card */

export function Card({ className, children, as: As = "section" }: { className?: string; children: ReactNode; as?: "section" | "div" | "article" }) {
  return <As className={cn("rounded-2xl border border-line bg-surface shadow-card", className)}>{children}</As>;
}

export function CardHeader({ title, sub, action, className }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 pt-4", className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
        {sub && <p className="mt-0.5 text-[13px] text-ink-muted">{sub}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-1.5">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ Avatar */

const AVATAR_HUES = ["#0b6b61", "#2160b8", "#8a4b9c", "#a35a1f", "#3d7a2a", "#b8475e", "#4b5bb3", "#0f7c8c"];
export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const color = AVATAR_HUES[h % AVATAR_HUES.length];
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), background: color }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* --------------------------------------------------------------- Segmented */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: ReactNode; count?: number }[];
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-line bg-surface-2 p-0.5 no-scrollbar", className)}>
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          type="button"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] font-medium transition-colors",
            size === "sm" ? "h-7 px-2.5 text-[12.5px]" : "h-8 px-3 text-[13px]",
            value === o.id ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink",
          )}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={cn("rounded-full px-1.5 text-[11px] tnum", value === o.id ? "bg-primary-soft text-primary-soft-ink" : "bg-surface-3 text-ink-muted")}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Inputs */

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-[10px] border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft",
        className,
      )}
      {...rest}
    />
  );
});

export function SearchInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <Input className="pl-8" {...rest} />
    </div>
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-9 w-full appearance-none rounded-[10px] border border-line bg-surface pl-3 pr-8 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft"
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft",
        className,
      )}
      {...rest}
    />
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-line-strong")}
    >
      <span className={cn("absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[19px]" : "translate-x-[3px]")} />
    </button>
  );
}

/* ---------------------------------------------------------------- Progress */

export function Meter({ value, tone = "primary", className, track = true }: { value: number; tone?: Tone; className?: string; track?: boolean }) {
  const fill: Record<Tone, string> = {
    neutral: "bg-ink-muted",
    primary: "bg-primary",
    good: "bg-good",
    warn: "bg-warn",
    bad: "bg-bad",
    info: "bg-info",
    violet: "bg-violet",
  };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full", track && "bg-surface-3", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-500", fill[tone])} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line bg-surface-2 px-1 font-mono text-[11px] text-ink-muted">{children}</kbd>;
}

export function Empty({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {icon && <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-3 text-ink-muted">{icon}</div>}
      <p className="font-medium text-ink">{title}</p>
      {body && <p className="max-w-sm text-[13px] text-ink-muted">{body}</p>}
      {action}
    </div>
  );
}

export function PageHeader({ title, sub, actions, eyebrow }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[26px]">{title}</h1>
        {sub && <p className="mt-1 text-[13.5px] text-ink-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone }) {
  return (
    <div className="min-w-0">
      <div className="text-[12.5px] text-ink-muted">{label}</div>
      <div className={cn("mt-0.5 text-lg font-semibold tracking-[-0.01em]", tone === "bad" ? "text-bad" : tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-ink")}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>}
    </div>
  );
}
