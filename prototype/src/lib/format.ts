import { NOW } from "@/config/brand";

const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export const num = (n: number) => nf0.format(Math.round(n));
export const num1 = (n: number) => nf1.format(n);

/** EGP 12,450 */
export const money = (n: number) => `EGP ${nf0.format(Math.round(n))}`;

/** 12.4K / 1.2M — for tiles and axes */
export const compact = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${nf1.format(n / 1_000_000)}M`;
  if (a >= 10_000) return `${nf0.format(n / 1_000)}K`;
  if (a >= 1_000) return `${nf1.format(n / 1_000)}K`;
  return nf0.format(n);
};
export const moneyCompact = (n: number) => `EGP ${compact(n)}`;

export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;

const DAY = 86_400_000;
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY);

export const shortDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const longDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
export const monthLabel = (d: Date) => d.toLocaleDateString("en-GB", { month: "short" });
export const time = (d: Date) =>
  d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const dateTime = (d: Date) => `${shortDate(d)}, ${time(d)}`;

/** "4 min", "2 h 10 min", "3 d" */
export const duration = (ms: number) => {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
};

/** "just now", "12 min ago", "Yesterday", "3 Oct" */
export const ago = (d: Date, now = NOW) => {
  const ms = now.getTime() - d.getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.round(ms / 60000)} min ago`;
  if (ms < 86_400_000 && d.getDate() === now.getDate()) return `${Math.round(ms / 3_600_000)} h ago`;
  const days = Math.floor((startOfDay(now).getTime() - startOfDay(d).getTime()) / DAY);
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en-GB", { weekday: "short" });
  return shortDate(d);
};

/** relative due label: "Today", "Tomorrow", "In 3 days", "2 days late" */
export const dueLabel = (d: Date, now = NOW) => {
  const days = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `In ${days} days`;
  if (days === -1) return "1 day late";
  return `${-days} days late`;
};

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
export const addHours = (d: Date, n: number) => new Date(d.getTime() + n * 3_600_000);
export const addMinutes = (d: Date, n: number) => new Date(d.getTime() + n * 60_000);

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export const firstName = (name: string) => name.split(" ")[0];

/** "EX-203 low-speed set (contra, …)" -> "EX-203 low-speed set" */
export const shortName = (n: string) => n.split(/[,:(]/)[0].trim();
