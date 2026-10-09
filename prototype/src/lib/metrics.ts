import { NOW } from "@/config/brand";
import { product, uni } from "@/data/catalog";
import { orderCost, orderTotal } from "@/data/seed";
import type { Category, Client, Conversation, Invoice, Order, PaymentMethod, Product, Repair } from "@/data/types";
import { addDays, startOfDay } from "./format";

export type Period = "today" | "7d" | "mtd" | "term" | "12m";

export const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "mtd", label: "Month" },
  { id: "term", label: "Term" },
  { id: "12m", label: "12 months" },
];

/** Academic calendar used for seasonality context (Egyptian public faculties, approx.). */
export const TERM_START = new Date(2026, 8, 26); // Sat 26 Sep 2026
export const LAST_TERM_START = new Date(2025, 8, 27);

export interface Range {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  label: string;
  compare: string;
}

export function rangeFor(p: Period): Range {
  const today = startOfDay(NOW);
  switch (p) {
    case "today":
      return { start: today, end: NOW, prevStart: addDays(today, -7), prevEnd: addDays(NOW, -7), label: "Today", compare: "vs last Friday" };
    case "7d":
      return { start: addDays(NOW, -7), end: NOW, prevStart: addDays(NOW, -371), prevEnd: addDays(NOW, -364), label: "Last 7 days", compare: "vs same week last year" };
    case "mtd": {
      const start = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
      const prevStart = new Date(NOW.getFullYear() - 1, NOW.getMonth(), 1);
      const prevEnd = new Date(prevStart.getTime() + (NOW.getTime() - start.getTime()));
      return { start, end: NOW, prevStart, prevEnd, label: "October so far", compare: "vs Oct 1–9 last year" };
    }
    case "term": {
      const len = NOW.getTime() - TERM_START.getTime();
      return { start: TERM_START, end: NOW, prevStart: LAST_TERM_START, prevEnd: new Date(LAST_TERM_START.getTime() + len), label: "This term", compare: "vs same point last year" };
    }
    case "12m":
      return { start: addDays(NOW, -365), end: NOW, prevStart: addDays(NOW, -730), prevEnd: addDays(NOW, -365), label: "Last 12 months", compare: "vs previous 12 months" };
  }
}

const inRange = (d: Date, s: Date, e: Date) => d >= s && d <= e;
export const isBooked = (o: Order) => !["new", "quoted", "cancelled"].includes(o.stage);
export const isOpen = (o: Order) => !["delivered", "cancelled"].includes(o.stage);
export const isActiveRepair = (r: Repair) => r.stage !== "returned";

export interface Money {
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  margin: number;
}

export function moneyIn(orders: Order[], repairs: Repair[], s: Date, e: Date): Money {
  let revenue = 0;
  let cost = 0;
  let n = 0;
  for (const o of orders) {
    if (!isBooked(o) || !inRange(o.createdAt, s, e)) continue;
    revenue += orderTotal(o);
    cost += orderCost(o);
    n++;
  }
  for (const r of repairs) {
    if (!r.approved || !r.price || !inRange(r.receivedAt, s, e)) continue;
    revenue += r.price;
    cost += r.partnerCost ?? 0;
  }
  const profit = revenue - cost;
  return { revenue, cost, profit, orders: n, margin: revenue ? profit / revenue : 0 };
}

export function buckets(s: Date, e: Date, n = 12) {
  const step = (e.getTime() - s.getTime()) / n;
  return Array.from({ length: n }, (_, i) => [new Date(s.getTime() + i * step), new Date(s.getTime() + (i + 1) * step)] as const);
}

export function sparkRevenue(orders: Order[], repairs: Repair[], s: Date, e: Date, n = 12) {
  return buckets(s, e, n).map(([a, b]) => moneyIn(orders, repairs, a, b).revenue);
}
export function sparkProfit(orders: Order[], repairs: Repair[], s: Date, e: Date, n = 12) {
  return buckets(s, e, n).map(([a, b]) => moneyIn(orders, repairs, a, b).profit);
}

export const delta = (cur: number, prev: number) => (prev ? (cur - prev) / prev : 0);

/* ---------------------------------------------------------- receivables */

export const outstanding = (i: Invoice) => Math.max(0, i.amount - i.paid);
export const daysOverdue = (i: Invoice) => Math.floor((NOW.getTime() - i.dueAt.getTime()) / 86_400_000);

export type InvoiceStatus = "paid" | "partial" | "due" | "overdue";
export function invoiceStatus(i: Invoice): InvoiceStatus {
  if (i.paid >= i.amount) return "paid";
  if (daysOverdue(i) > 0) return "overdue";
  if (i.paid > 0) return "partial";
  return "due";
}

export const AGING = [
  { id: "current", label: "Not due yet", min: -Infinity, max: 0 },
  { id: "1-30", label: "1–30 days", min: 1, max: 30 },
  { id: "31-60", label: "31–60 days", min: 31, max: 60 },
  { id: "61-90", label: "61–90 days", min: 61, max: 90 },
  { id: "90+", label: "90+ days", min: 91, max: Infinity },
] as const;

export function aging(invoices: Invoice[]) {
  const rows = AGING.map((b) => ({ ...b, amount: 0, count: 0 }));
  for (const i of invoices) {
    const o = outstanding(i);
    if (!o) continue;
    const d = daysOverdue(i);
    const row = rows.find((b) => d >= b.min && d <= b.max)!;
    row.amount += o;
    row.count++;
  }
  return rows;
}

export function receivables(invoices: Invoice[]) {
  let total = 0;
  let overdue = 0;
  let overdue30 = 0;
  const debtors = new Map<string, number>();
  const debtors30 = new Set<string>();
  for (const i of invoices) {
    const o = outstanding(i);
    if (!o) continue;
    total += o;
    const d = daysOverdue(i);
    if (d > 0) overdue += o;
    if (d > 30) {
      overdue30 += o;
      debtors30.add(i.clientId);
    }
    debtors.set(i.clientId, (debtors.get(i.clientId) ?? 0) + o);
  }
  const top = [...debtors.entries()].sort((a, b) => b[1] - a[1]);
  return { total, overdue, overdue30, debtors30: debtors30.size, top, clients: debtors.size };
}

/** Average days from invoice to full payment, last 90 days. */
export function daysToPay(invoices: Invoice[]) {
  const recent = invoices.filter((i) => i.paidAt && i.issuedAt >= addDays(NOW, -90));
  if (!recent.length) return 0;
  return recent.reduce((s, i) => s + (i.paidAt!.getTime() - i.issuedAt.getTime()) / 86_400_000, 0) / recent.length;
}

/* ---------------------------------------------------------- operations */

export function onTimeRate(orders: Order[], days = 30) {
  const since = addDays(NOW, -days);
  const done = orders.filter((o) => o.stage === "delivered" && o.deliveredAt && o.deliveredAt >= since);
  if (!done.length) return 1;
  const ok = done.filter((o) => startOfDay(o.deliveredAt!) <= startOfDay(o.promisedAt));
  return ok.length / done.length;
}

export const isLate = (o: Order) => isOpen(o) && o.promisedAt < NOW && !["new", "quoted"].includes(o.stage);
export const isDueToday = (o: Order) =>
  isOpen(o) && startOfDay(o.promisedAt).getTime() === startOfDay(NOW).getTime() && !["new", "quoted"].includes(o.stage);

export const repairDays = (r: Repair) => ((r.returnedAt ?? NOW).getTime() - r.receivedAt.getTime()) / 86_400_000;
export const repairLate = (r: Repair) => isActiveRepair(r) && r.promisedAt < NOW;

export function repairStats(repairs: Repair[]) {
  const active = repairs.filter(isActiveRepair);
  const recent = repairs.filter((r) => r.stage === "returned" && r.returnedAt && r.returnedAt >= addDays(NOW, -90));
  const avg = recent.length ? recent.reduce((s, r) => s + repairDays(r), 0) / recent.length : 0;
  const onTime = recent.length ? recent.filter((r) => r.returnedAt! <= addDays(r.promisedAt, 0.5)).length / recent.length : 1;
  const revenue = recent.reduce((s, r) => s + (r.price ?? 0), 0);
  const cost = recent.reduce((s, r) => s + (r.partnerCost ?? 0), 0);
  return {
    active: active.length,
    late: active.filter(repairLate).length,
    awaiting: active.filter((r) => r.stage === "approval").length,
    loaners: active.filter((r) => r.loaner).length,
    avgDays: avg,
    onTime,
    margin: revenue ? (revenue - cost) / revenue : 0,
    recentCount: recent.length,
  };
}

export function ratingStats(orders: Order[], days = 30) {
  const since = addDays(NOW, -days);
  const rated = orders.filter((o) => o.rating && o.deliveredAt && o.deliveredAt >= since);
  const avg = rated.length ? rated.reduce((s, o) => s + o.rating!, 0) / rated.length : 0;
  return { avg, count: rated.length, fives: rated.filter((o) => o.rating === 5).length };
}

/** Reply-time figures come from inbox history (sample values for the prototype). */
export const REPLY = { medianToday: 6, median30d: 9, within15: 0.87, target: 15 };

/** Products at or below reorder point, most urgent first (fewest weeks of cover at the current sales rate). */
export function lowStock(products: Product[], sold?: Map<string, number>) {
  const cover = (p: Product) => {
    const perWeek = (sold?.get(p.id) ?? 0) / 4.3;
    return perWeek > 0 ? p.stock / perWeek : 1000 + p.stock / Math.max(1, p.reorderPoint);
  };
  return products.filter((p) => p.stock <= p.reorderPoint).sort((a, b) => cover(a) - cover(b));
}

/** Units sold in the last N days per product. */
export function unitsSold(orders: Order[], days = 30) {
  const since = addDays(NOW, -days);
  const m = new Map<string, number>();
  for (const o of orders) {
    if (!isBooked(o) || o.createdAt < since || o.group) continue;
    for (const i of o.items) m.set(i.productId, (m.get(i.productId) ?? 0) + i.qty);
  }
  return m;
}

/* ------------------------------------------------------------- breakdowns */

export function byCategory(orders: Order[], s: Date, e: Date) {
  const m = new Map<Category, { revenue: number; cost: number }>();
  for (const o of orders) {
    if (!isBooked(o) || !inRange(o.createdAt, s, e)) continue;
    for (const i of o.items) {
      const c = product(i.productId).category;
      const row = m.get(c) ?? { revenue: 0, cost: 0 };
      row.revenue += i.price * i.qty;
      row.cost += i.cost * i.qty;
      m.set(c, row);
    }
  }
  return [...m.entries()]
    .map(([category, v]) => ({ category, ...v, margin: v.revenue ? (v.revenue - v.cost) / v.revenue : 0 }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function byUniversity(orders: Order[], clients: Map<string, Client>, s: Date, e: Date) {
  const m = new Map<string, { revenue: number; clients: Set<string> }>();
  for (const o of orders) {
    if (!isBooked(o) || !inRange(o.createdAt, s, e)) continue;
    const c = clients.get(o.clientId);
    if (!c) continue;
    const row = m.get(c.universityId) ?? { revenue: 0, clients: new Set() };
    row.revenue += orderTotal(o);
    row.clients.add(c.id);
    m.set(c.universityId, row);
  }
  return [...m.entries()]
    .map(([id, v]) => ({ id, name: uni(id).short, revenue: v.revenue, clients: v.clients.size }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function byYear(orders: Order[], clients: Map<string, Client>, s: Date, e: Date) {
  const m = new Map<number, number>();
  for (const o of orders) {
    if (!isBooked(o) || !inRange(o.createdAt, s, e)) continue;
    const c = clients.get(o.clientId);
    if (!c) continue;
    m.set(c.year, (m.get(c.year) ?? 0) + orderTotal(o));
  }
  return [1, 2, 3, 4, 5, 6].map((y) => ({ year: y, revenue: m.get(y) ?? 0 }));
}

export function channelMix(orders: Order[], s: Date, e: Date) {
  const m = new Map<string, number>();
  let total = 0;
  for (const o of orders) {
    if (!isBooked(o) || !inRange(o.createdAt, s, e)) continue;
    m.set(o.channel, (m.get(o.channel) ?? 0) + 1);
    total++;
  }
  return { total, rows: [...m.entries()].sort((a, b) => b[1] - a[1]) };
}

export function paymentMix(invoices: Invoice[], s: Date, e: Date) {
  const m = new Map<PaymentMethod, number>();
  for (const i of invoices) {
    if (!i.method || !i.paid || !inRange(i.issuedAt, s, e)) continue;
    m.set(i.method, (m.get(i.method) ?? 0) + i.paid);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Monthly revenue/profit/orders for the 12 months ending this month, and the 12 before. */
export function monthly(orders: Order[], repairs: Repair[]) {
  const rows = [];
  for (let k = 11; k >= 0; k--) {
    const s = new Date(NOW.getFullYear(), NOW.getMonth() - k, 1);
    const e = new Date(NOW.getFullYear(), NOW.getMonth() - k + 1, 0, 23, 59, 59);
    const ps = new Date(s.getFullYear() - 1, s.getMonth(), 1);
    const pe = new Date(e.getFullYear() - 1, e.getMonth() + 1, 0, 23, 59, 59);
    const cur = moneyIn(orders, repairs, s, e);
    const prev = moneyIn(orders, repairs, ps, pe);
    rows.push({ month: s, partial: k === 0, cur, prev });
  }
  return rows;
}

/** New vs returning buying clients per month (last 12 months). */
export function newVsReturning(orders: Order[]) {
  const first = new Map<string, Date>();
  for (const o of [...orders].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
    if (!isBooked(o)) continue;
    if (!first.has(o.clientId)) first.set(o.clientId, o.createdAt);
  }
  const rows = [];
  for (let k = 11; k >= 0; k--) {
    const s = new Date(NOW.getFullYear(), NOW.getMonth() - k, 1);
    const e = new Date(NOW.getFullYear(), NOW.getMonth() - k + 1, 0, 23, 59, 59);
    const buyers = new Set<string>();
    for (const o of orders) if (isBooked(o) && inRange(o.createdAt, s, e)) buyers.add(o.clientId);
    let n = 0;
    for (const id of buyers) if (inRange(first.get(id)!, s, e)) n++;
    rows.push({ month: s, newC: n, returning: buyers.size - n });
  }
  return rows;
}

export function clientStats(orders: Order[], invoices: Invoice[]) {
  const m = new Map<string, { orders: number; ltv: number; last?: Date; balance: number }>();
  for (const o of orders) {
    if (!isBooked(o)) continue;
    const row = m.get(o.clientId) ?? { orders: 0, ltv: 0, balance: 0 };
    row.orders++;
    row.ltv += orderTotal(o);
    if (!row.last || o.createdAt > row.last) row.last = o.createdAt;
    m.set(o.clientId, row);
  }
  for (const i of invoices) {
    const o = outstanding(i);
    if (!o) continue;
    const row = m.get(i.clientId) ?? { orders: 0, ltv: 0, balance: 0 };
    row.balance += o;
    m.set(i.clientId, row);
  }
  return m;
}

export function repeatRate(orders: Order[]) {
  const counts = new Map<string, number>();
  for (const o of orders) if (isBooked(o)) counts.set(o.clientId, (counts.get(o.clientId) ?? 0) + 1);
  const buyers = counts.size;
  const repeat = [...counts.values()].filter((n) => n > 1).length;
  return { buyers, repeat, rate: buyers ? repeat / buyers : 0 };
}

/* ---------------------------------------------------------------- inbox */

/**
 * When the client started waiting for a real reply, or null if they aren't waiting.
 * Automatic acknowledgements ("we got your message") don't stop the clock; other
 * automated messages (status updates, booked slots) and your own replies do.
 */
export function waitingSince(c: Conversation): Date | null {
  if (c.status !== "open") return null;
  const msgs = c.messages.filter((m) => !m.ack);
  if (!msgs.length || msgs[msgs.length - 1].from !== "client") return null;
  let i = msgs.length - 1;
  while (i > 0 && msgs[i - 1].from === "client") i--;
  return msgs[i].at;
}
