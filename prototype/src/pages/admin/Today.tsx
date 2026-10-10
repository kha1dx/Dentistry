import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Boxes, Check, CalendarClock, CircleDollarSign, Clock3, CreditCard, MessageCircle, PackageCheck, Truck, Wrench } from "lucide-react";
import { BRAND, NOW } from "@/config/brand";
import { PARTNERS, product } from "@/data/catalog";
import { orderTotal } from "@/data/seed";
import { cn } from "@/lib/cn";
import { duration, firstName, longDate, money, moneyCompact, monthLabel, pct, shortName, time } from "@/lib/format";
import {
  TERM_START,
  delta,
  isDueToday,
  isLate,
  isOpen,
  lowStock,
  moneyIn,
  monthly,
  rangeFor,
  receivables,
  repairLate,
  repairStats,
  unitsSold,
  waitingSince,
} from "@/lib/metrics";
import { useClientMap, useStore } from "@/store/useStore";
import { Avatar, Card, Segmented } from "@/components/ui/primitives";
import { TrendChart } from "@/components/charts/charts";

type Tint = "mint" | "peach" | "sky" | "lavender" | "lemon" | "rose";
const TINT: Record<Tint, string> = {
  mint: "bg-tint-mint",
  peach: "bg-tint-peach",
  sky: "bg-tint-sky",
  lavender: "bg-tint-lavender",
  lemon: "bg-tint-lemon",
  rose: "bg-tint-rose",
};

export default function Today() {
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const conversations = useStore((s) => s.conversations);

  const range = rangeFor("mtd");
  const cur = useMemo(() => moneyIn(orders, repairs, range.start, range.end), [orders, repairs, range.start, range.end]);
  const prev = useMemo(() => moneyIn(orders, repairs, range.prevStart, range.prevEnd), [orders, repairs, range.prevStart, range.prevEnd]);
  const rc = useMemo(() => receivables(invoices), [invoices]);
  const rs = useMemo(() => repairStats(repairs), [repairs]);
  const open = orders.filter(isOpen);
  const dueToday = orders.filter(isDueToday);
  const waiting = conversations.filter((c) => waitingSince(c));
  const todo = useTodo();
  const weekOfTerm = Math.floor((NOW.getTime() - TERM_START.getTime()) / (7 * 86_400_000)) + 1;
  const d = delta(cur.revenue, prev.revenue);

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-8 pt-2 sm:px-6 lg:px-8">
      <header>
        <p className="text-[14px] font-semibold text-ink-muted">
          {longDate(NOW)} · week {weekOfTerm} of term
        </p>
        <h1 className="mt-1 text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[38px]">Good morning, {BRAND.owner.name}</h1>
        <p className="mt-1 text-[15.5px] font-medium text-ink-2">
          You have <b className="font-bold text-ink">{todo.length} things to do</b> and <b className="font-bold text-ink">{waiting.length} people waiting</b> for a reply.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <SalesCard className="xl:col-span-6" revenue={cur.revenue} change={d} />
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 xl:col-span-6">
          <StatCard to="/admin/invoices" tint="peach" icon={<CreditCard className="h-5 w-5" />} label="Owed to you" value={moneyCompact(rc.total)} note={<span className="text-bad">{moneyCompact(rc.overdue).replace("EGP ", "")} late</span>} />
          <StatCard to="/admin/orders" tint="lavender" icon={<PackageCheck className="h-5 w-5" />} label="Open orders" value={String(open.length)} note={`${dueToday.length} due today`} />
          <StatCard to="/admin/repairs" tint="mint" icon={<Wrench className="h-5 w-5" />} label="Repairs" value={String(rs.active)} note={rs.late ? <span className="text-bad">{rs.late} late</span> : "On time"} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <TodoCard items={todo} className="xl:col-span-8" />
        <div className="grid grid-cols-1 content-start gap-4 xl:col-span-4">
          <WaitingCard />
          <RouteCard />
        </div>
      </div>
    </div>
  );
}

function Up({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-0.5 font-bold text-good">
      <ArrowUpRight className="h-4 w-4" />
      {children}
    </span>
  );
}

function StatCard({ to, tint, icon, label, value, note }: { to: string; tint: Tint; icon: ReactNode; label: string; value: string; note: ReactNode }) {
  return (
    <Link to={to} className={cn("group flex min-h-[150px] flex-col justify-between rounded-[22px] p-3.5 transition-transform hover:-translate-y-0.5 sm:min-h-[190px] sm:p-5", TINT[tint])}>
      <div>
        <div className="text-[19px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[26px]">{value}</div>
        <div className="mt-0.5 text-[12px] font-bold text-ink-2 sm:text-[13.5px]">{label}</div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink shadow-card sm:h-11 sm:w-11">{icon}</span>
        <span className="text-[12px] font-bold text-ink-2 sm:text-[13px]">{note}</span>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------- to do */

interface Todo {
  id: string;
  tint: Tint;
  icon: ReactNode;
  title: string;
  sub: string;
  to: string;
  rank: number;
  /** a one-tap fix, shown as a button next to the item */
  action?: { label: string; run: () => void };
}

function useTodo(): Todo[] {
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const conversations = useStore((s) => s.conversations);
  const products = useStore((s) => s.products);
  const recordPayment = useStore((s) => s.recordPayment);
  const postToChat = useStore((s) => s.postToChat);
  const clients = useClientMap();
  return useMemo(() => {
    const out: Todo[] = [];
    const waiting = conversations
      .map((c) => ({ c, since: waitingSince(c) }))
      .filter((x): x is { c: (typeof conversations)[number]; since: Date } => !!x.since)
      .sort((a, b) => a.since.getTime() - b.since.getTime());
    if (waiting.length) {
      const w = waiting[0];
      const who = w.c.clientId ? clients.get(w.c.clientId)?.name : w.c.leadName;
      out.push({ id: "inbox", tint: "rose", icon: <MessageCircle className="h-5 w-5" />, title: `Reply to ${waiting.length} people`, sub: `${firstName(who ?? "")} has waited ${duration(NOW.getTime() - w.since.getTime())}`, to: `/admin/inbox?c=${w.c.id}`, rank: 0 });
    }
    const late = orders.filter(isLate).filter((o) => !isDueToday(o));
    if (late.length) out.push({ id: "late", tint: "rose", icon: <Clock3 className="h-5 w-5" />, title: `${late.length} ${late.length === 1 ? "order is" : "orders are"} late`, sub: `${firstName(clients.get(late[0].clientId)?.name ?? "")} · ${shortName(late[0].items[0]?.name ?? "")}`, to: "/admin/orders?view=late", rank: 1 });
    const lateRep = repairs.filter(repairLate);
    if (lateRep.length) {
      const r = lateRep[0];
      out.push({ id: "repair-late", tint: "lavender", icon: <CalendarClock className="h-5 w-5" />, title: `Chase ${lateRep.length} late ${lateRep.length === 1 ? "repair" : "repairs"}`, sub: `${shortName(r.device)} at ${PARTNERS.find((p) => p.id === r.partnerId)?.short}`, to: `/admin/repairs?r=${r.id}`, rank: 2 });
    }
    const due = orders.filter(isDueToday);
    if (due.length) {
      const notPacked = due.filter((o) => ["confirmed", "sourcing"].includes(o.stage)).length;
      out.push({ id: "due", tint: "sky", icon: <Truck className="h-5 w-5" />, title: `Deliver ${due.length} orders today`, sub: notPacked ? `${notPacked} still need packing` : "All packed", to: "/admin/orders?view=today", rank: notPacked ? 2 : 4 });
    }
    const approvals = repairs.filter((r) => r.stage === "approval");
    if (approvals.length) out.push({ id: "approval", tint: "lemon", icon: <Wrench className="h-5 w-5" />, title: `${approvals.length} repair prices need an OK`, sub: approvals.map((r) => firstName(clients.get(r.clientId)?.name ?? "")).join(" and "), to: `/admin/repairs?r=${approvals[0].id}`, rank: 3 });
    const receipts = conversations.filter((c) => c.status === "open" && c.messages[c.messages.length - 1]?.attachment?.includes("instapay"));
    if (receipts.length) {
      const o = orders.find((x) => x.id === receipts[0].links?.[0]);
      const who = firstName(clients.get(receipts[0].clientId!)?.name ?? "");
      const left = o ? orderTotal(o) - o.paid : 0;
      out.push({
        id: "receipt",
        tint: "mint",
        icon: <CreditCard className="h-5 w-5" />,
        title: "Confirm a payment",
        sub: `${who} sent an InstaPay screenshot${o ? ` · ${money(left)}` : ""}`,
        to: `/admin/inbox?c=${receipts[0].id}`,
        rank: 0.5,
        action:
          o && left > 0
            ? {
                label: "Confirm",
                run: () => {
                  recordPayment(o.id, left, "InstaPay");
                  postToChat(receipts[0].id, `Received, thank you ${who}! Payment confirmed.`);
                },
              }
            : undefined,
      });
    }
    const rc = receivables(invoices);
    if (rc.overdue > 0) out.push({ id: "overdue", tint: "peach", icon: <CircleDollarSign className="h-5 w-5" />, title: `${money(rc.overdue)} is overdue`, sub: "Reminders go out automatically", to: "/admin/invoices?f=overdue", rank: 5 });
    const sold = unitsSold(orders, 30);
    const low = lowStock(products, sold);
    if (low.length) out.push({ id: "stock", tint: "lemon", icon: <Boxes className="h-5 w-5" />, title: `Restock ${low.length} products`, sub: `${shortName(low[0].name)} first: ${low[0].stock} left`, to: "/admin/catalog?tab=stock", rank: 6 });
    return out.sort((a, b) => a.rank - b.rank);
  }, [orders, repairs, invoices, conversations, products, clients, recordPayment, postToChat]);
}

function TodoCard({ items, className }: { items: Todo[]; className?: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 5);
  return (
    <Card className={cn("p-2", className)}>
      <div className="flex items-baseline justify-between px-4 pb-1 pt-3">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">To do</h2>
        <span className="text-[13px] font-semibold text-ink-muted">{items.length} things</span>
      </div>
      <ul>
        {shown.map((t) => (
          <li key={t.id} className="group flex items-center gap-2 rounded-2xl pr-3 transition-colors hover:bg-surface-2">
            <Link to={t.to} className="flex min-w-0 flex-1 items-center gap-3.5 py-3 pl-4">
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink", TINT[t.tint])}>{t.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold leading-snug text-ink">{t.title}</span>
                <span className="block truncate text-[13px] font-medium text-ink-muted">{t.sub}</span>
              </span>
            </Link>
            {t.action && (
              <button type="button" onClick={t.action.run} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-bold text-surface hover:opacity-90">
                <Check className="h-4 w-4" /> {t.action.label}
              </button>
            )}
            <Link to={t.to} tabIndex={-1} aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink-2 transition-colors group-hover:bg-primary group-hover:text-primary-ink">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
      {items.length > 5 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mx-4 mb-2 mt-1 text-[13.5px] font-bold text-primary hover:underline">
          {all ? "Show less" : `Show ${items.length - 5} more`}
        </button>
      )}
      {!items.length && <p className="px-4 py-10 text-center font-semibold text-ink-muted">All done. Nothing needs you right now.</p>}
    </Card>
  );
}

/* ------------------------------------------------------------ waiting chats */

function WaitingCard({ className }: { className?: string }) {
  const conversations = useStore((s) => s.conversations);
  const clients = useClientMap();
  const list = conversations
    .map((c) => ({ c, since: waitingSince(c) }))
    .filter((x): x is { c: (typeof conversations)[number]; since: Date } => !!x.since)
    .sort((a, b) => a.since.getTime() - b.since.getTime());
  const first = list[0];
  const name = (c: (typeof conversations)[number]) => (c.clientId ? clients.get(c.clientId)?.name ?? "" : c.leadName ?? "");
  return (
    <div className={cn("relative overflow-hidden rounded-[22px] bg-ink p-6 text-surface", className)}>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-white/5" aria-hidden />
      <div className="absolute -bottom-16 right-10 h-40 w-40 rounded-full border-[18px] border-white/5" aria-hidden />
      <h2 className="relative text-[22px] font-extrabold leading-tight tracking-[-0.03em]">
        {list.length ? (
          <>
            <span className="rounded-full border-2 border-surface/80 px-2.5">{list.length} people</span> are waiting for a reply
          </>
        ) : (
          "Nobody is waiting"
        )}
      </h2>
      {first && (
        <>
          <div className="relative mt-4 flex -space-x-2">
            {list.slice(0, 5).map(({ c }) => (
              <span key={c.id} className="rounded-full ring-2 ring-ink">
                <Avatar name={name(c)} size={34} />
              </span>
            ))}
          </div>
          <p className="relative mt-3 text-[13.5px] font-medium text-surface/70">
            {firstName(name(first.c))} has waited the longest: {duration(NOW.getTime() - first.since.getTime())}.
          </p>
          <Link to={`/admin/inbox?c=${first.c.id}`} className="relative mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-surface px-5 text-[13.5px] font-bold text-ink hover:opacity-90">
            Reply now <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- sales */

function SalesCard({ className, revenue, change }: { className?: string; revenue: number; change: number }) {
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const [metric, setMetric] = useState<"revenue" | "profit">("revenue");
  const rows = useMemo(() => monthly(orders, repairs), [orders, repairs]);
  return (
    <Link to="/admin/reports" className={cn("group block rounded-[22px] bg-tint-sky p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[32px]">{money(revenue)}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[13.5px] font-bold text-ink-2">
            Sales this month
            {change > 0 && change < 3 && <Up>{pct(change)}</Up>}
          </div>
        </div>
        <div onClick={(e) => e.preventDefault()}>
          <Segmented
            size="sm"
            value={metric}
            onChange={setMetric}
            className="bg-surface/70"
            options={[
              { id: "revenue", label: "Sales" },
              { id: "profit", label: "Profit" },
            ]}
          />
        </div>
      </div>
      <div className="-mx-2 mt-3">
        <TrendChart
          height={170}
          labels={rows.map((r) => monthLabel(r.month).slice(0, 3))}
          partialLast
          format={(n) => moneyCompact(n).replace("EGP ", "")}
          tipTitle={(i) => rows[i].month.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + (rows[i].partial ? " so far" : "")}
          series={[{ key: "cur", label: metric === "revenue" ? "Sales" : "Profit", values: rows.map((r) => r.cur[metric]), color: "var(--chart-1)", area: true }]}
        />
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------- route */

function RouteCard({ className }: { className?: string }) {
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const clients = useClientMap();
  const runs = useMemo(() => {
    const list: { at: Date; place: string; what: string; detail: string; tint: Tint; icon: ReactNode }[] = [];
    const sourcing = orders.filter((o) => o.stage === "sourcing");
    if (sourcing.length) {
      const at = new Date(NOW);
      at.setHours(11, 15, 0, 0);
      list.push({ at, place: "Nile Dental Supply, Dokki", what: `Pick up stock for ${sourcing.length} orders`, detail: [...new Set(sourcing.flatMap((o) => o.items.map((i) => shortName(product(i.productId).name))))].slice(0, 2).join(", "), tint: "lemon", icon: <Boxes className="h-4 w-4" /> });
    }
    const drop = repairs.filter((r) => r.stage === "received");
    if (drop.length) {
      const at = new Date(NOW);
      at.setHours(12, 30, 0, 0);
      const p = PARTNERS.find((x) => x.id === drop[0].partnerId)!;
      list.push({ at, place: `${p.name}, ${p.area}`, what: `Drop off ${drop.length} ${drop.length === 1 ? "device" : "devices"}`, detail: drop.map((r) => shortName(r.device)).join(", "), tint: "lavender", icon: <Wrench className="h-4 w-4" /> });
    }
    const due = orders.filter((o) => isDueToday(o) && ["ready", "out"].includes(o.stage));
    const byPlace = new Map<string, typeof due>();
    for (const o of due) byPlace.set(o.delivery.place, [...(byPlace.get(o.delivery.place) ?? []), o]);
    for (const [place, os] of byPlace) {
      list.push({ at: os.reduce((a, o) => (o.promisedAt < a ? o.promisedAt : a), os[0].promisedAt), place, what: `Deliver to ${os.map((o) => firstName(clients.get(o.clientId)?.name ?? "")).join(", ")}`, detail: `${os.length} ${os.length === 1 ? "order" : "orders"}`, tint: "sky", icon: <Truck className="h-4 w-4" /> });
    }
    return list.sort((a, b) => a.at.getTime() - b.at.getTime());
  }, [orders, repairs, clients]);
  return (
    <Card className={cn("p-2", className)}>
      <div className="px-4 pb-2 pt-3">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">Today's route</h2>
      </div>
      <ol>
        {runs.map((r, i) => (
          <li key={i} className="flex gap-3.5 rounded-2xl px-4 py-3">
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink", TINT[r.tint])}>{r.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[14.5px] font-bold text-ink">{r.what}</span>
                <span className="shrink-0 text-[13px] font-bold text-ink-2 tnum">{time(r.at)}</span>
              </div>
              <div className="truncate text-[13px] font-medium text-ink-muted">{r.place}</div>
            </div>
          </li>
        ))}
        {!runs.length && <li className="px-4 py-10 text-center font-semibold text-ink-muted">Nothing planned for today.</li>}
      </ol>
    </Card>
  );
}
