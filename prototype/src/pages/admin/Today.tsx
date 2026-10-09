import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Boxes,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Info,
  MessageCircle,
  PackageCheck,
  Sparkles,
  Star,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { BRAND, NOW } from "@/config/brand";
import { PARTNERS, product } from "@/data/catalog";
import { orderTotal } from "@/data/seed";
import { cn } from "@/lib/cn";
import { ago, duration, firstName, longDate, money, moneyCompact, monthLabel, num, num1, pct, time, shortName } from "@/lib/format";
import {
  PERIODS,
  TERM_START,
  aging,
  byCategory,
  daysToPay,
  delta,
  isActiveRepair,
  isDueToday,
  isLate,
  isOpen,
  lowStock,
  moneyIn,
  monthly,
  onTimeRate,
  rangeFor,
  ratingStats,
  receivables,
  repairLate,
  repairStats,
  REPLY,
  sparkProfit,
  sparkRevenue,
  unitsSold,
  waitingSince,
  type Period,
} from "@/lib/metrics";
import { ORDER_STAGES, REPAIR_STAGES, useClientMap, useStore } from "@/store/useStore";
import { Badge, Button, Card, CardHeader, Meter, Segmented, type Tone } from "@/components/ui/primitives";
import { BarList, LegendKey, Sparkline, StackedBar, TrendChart } from "@/components/charts/charts";
import { ProductArt } from "@/components/art/ProductArt";
import { Mono } from "@/components/ui/domain";

const AGE_COLORS = ["var(--chart-1)", "var(--age-1)", "var(--age-2)", "var(--age-3)", "var(--age-4)"];

export default function Today() {
  const [period, setPeriod] = useState<Period>("mtd");
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const conversations = useStore((s) => s.conversations);
  const products = useStore((s) => s.products);
  const automations = useStore((s) => s.automations);
  const clients = useClientMap();

  const range = rangeFor(period);
  const cur = useMemo(() => moneyIn(orders, repairs, range.start, range.end), [orders, repairs, range.start, range.end]);
  const prev = useMemo(() => moneyIn(orders, repairs, range.prevStart, range.prevEnd), [orders, repairs, range.prevStart, range.prevEnd]);
  const rc = useMemo(() => receivables(invoices), [invoices]);
  const rs = useMemo(() => repairStats(repairs), [repairs]);
  const rating = useMemo(() => ratingStats(orders), [orders]);
  const open = orders.filter(isOpen);
  const openValue = open.reduce((s, o) => s + orderTotal(o), 0);
  const onTime = onTimeRate(orders);
  const spark = useMemo(() => sparkRevenue(orders, repairs, range.start, range.end, period === "today" ? 10 : 12), [orders, repairs, range.start, range.end, period]);
  const sparkP = useMemo(() => sparkProfit(orders, repairs, range.start, range.end, period === "today" ? 10 : 12), [orders, repairs, range.start, range.end, period]);

  const waiting = conversations.filter((c) => waitingSince(c));
  const weekOfTerm = Math.floor((NOW.getTime() - TERM_START.getTime()) / (7 * 86_400_000)) + 1;
  const hour = NOW.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const attention = useNeedsYou();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="eyebrow mb-1.5">
            {longDate(NOW)} · Week {weekOfTerm} of term 1
          </div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[30px]">
            {greeting}, {BRAND.owner.name}
          </h1>
          <p className="mt-1 max-w-2xl text-[14px] text-ink-muted">
            Term-start rush. {attention.length ? `${attention.length} things need you` : "Nothing urgent"}, and {waiting.length} {waiting.length === 1 ? "person is" : "people are"} waiting for a reply.
          </p>
        </div>
        <div className="flex flex-col items-start gap-1.5 lg:items-end">
          <Segmented value={period} onChange={setPeriod} options={PERIODS} />
          <span className="flex items-center gap-1 text-[12px] text-ink-muted">
            <Info className="h-3.5 w-3.5" />
            Compared with last year, because sales follow the academic calendar
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <NeedsYou items={attention} className="xl:col-span-4" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8 xl:grid-cols-3">
          <Kpi
            to="/admin/reports"
            icon={<CircleDollarSign className="h-4 w-4" />}
            label="Revenue"
            value={money(cur.revenue)}
            d={delta(cur.revenue, prev.revenue)}
            prevText={`${money(prev.revenue)} ${range.compare.replace("vs ", "")}`}
            compare={range.compare}
            spark={spark}
            foot={
              <>
                {num(cur.orders)} orders · avg {money(cur.orders ? cur.revenue / Math.max(1, cur.orders) : 0)}
              </>
            }
          />
          <Kpi
            to="/admin/reports"
            icon={<Banknote className="h-4 w-4" />}
            label="Gross profit"
            value={money(cur.profit)}
            d={delta(cur.profit, prev.profit)}
            prevText={`${money(prev.profit)} ${range.compare.replace("vs ", "")}`}
            compare={range.compare}
            spark={sparkP}
            foot={
              <div className="flex w-full items-center gap-2">
                <span className="shrink-0">Margin {pct(cur.margin, 1)}</span>
                <div className="relative flex-1">
                  <Meter value={cur.margin / 0.4} tone={cur.margin >= 0.25 ? "good" : "warn"} />
                  <span className="absolute -top-0.5 h-2.5 w-px bg-ink-2" style={{ left: `${(0.25 / 0.4) * 100}%` }} title="Target 25%" />
                </div>
                <span className="shrink-0 text-ink-muted">target 25%</span>
              </div>
            }
          />
          <Kpi
            to="/admin/invoices"
            icon={<CreditCard className="h-4 w-4" />}
            label="Money to collect"
            value={money(rc.total)}
            sub={
              <span className={cn(rc.overdue > 0 ? "text-bad" : "text-ink-muted")}>
                {money(rc.overdue)} overdue · {rc.clients} clients owe
              </span>
            }
            chart={
              <div className="pt-3">
                <StackedBar
                  height={8}
                  showLegend={false}
                  format={money}
                  segments={aging(invoices).map((a, i) => ({ key: a.id, label: a.label, value: a.amount, color: AGE_COLORS[i] }))}
                />
              </div>
            }
            foot={<>Paid in {num1(daysToPay(invoices))} days on average</>}
          />
          <Kpi
            to="/admin/orders"
            icon={<PackageCheck className="h-4 w-4" />}
            label="Open orders"
            value={num(open.length)}
            sub={<span className="text-ink-muted">{moneyCompact(openValue)} in progress</span>}
            chart={
              <div className="flex h-9 items-end gap-[2px] pt-2">
                {ORDER_STAGES.slice(0, 6).map((st) => {
                  const n = open.filter((o) => o.stage === st.id).length;
                  return (
                    <div key={st.id} className="flex flex-1 flex-col items-center gap-1" title={`${st.label}: ${n}`}>
                      <div className="w-full rounded-t-[3px] bg-[var(--chart-1)]" style={{ height: Math.max(2, n * 4), opacity: n ? 1 : 0.25 }} />
                    </div>
                  );
                })}
              </div>
            }
            foot={
              <>
                <span className={onTime >= 0.9 ? "text-good" : "text-warn"}>{pct(onTime)}</span> delivered on the promised day (30 days)
              </>
            }
          />
          <Kpi
            to="/admin/repairs"
            icon={<Wrench className="h-4 w-4" />}
            label="Repairs in progress"
            value={num(rs.active)}
            sub={
              <span className="text-ink-muted">
                {rs.late > 0 && <span className="text-bad">{rs.late} late · </span>}
                {rs.awaiting} waiting for approval
              </span>
            }
            chart={
              <div className="flex gap-[2px] pt-3">
                {REPAIR_STAGES.slice(0, 6).map((st) => {
                  const n = repairs.filter((r) => r.stage === st.id).length;
                  return <div key={st.id} title={`${st.label}: ${n}`} className="h-2 rounded-[2px]" style={{ flex: Math.max(n, 0.15), background: n ? "var(--chart-1)" : "var(--chart-grid)" }} />;
                })}
              </div>
            }
            foot={
              <>
                Turnaround {num1(rs.avgDays)} days · {rs.loaners} loaners out
              </>
            }
          />
          <Kpi
            to="/admin/inbox"
            icon={<MessageCircle className="h-4 w-4" />}
            label="Reply time today"
            value={`${REPLY.medianToday} min`}
            sub={<span className="text-ink-muted">median · {pct(REPLY.within15)} answered within 15 min</span>}
            chart={
              <div className="flex items-center gap-1.5 pt-3 text-[13px]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={cn("h-4 w-4", i <= Math.round(rating.avg) ? "fill-[var(--chart-4)] text-[var(--chart-4)]" : "text-line-strong")} />
                ))}
                <span className="ml-1 font-medium text-ink">{rating.avg.toFixed(1)}</span>
              </div>
            }
            foot={<>{rating.count} ratings in 30 days · {rating.fives} gave 5 stars</>}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <RevenueTrend className="xl:col-span-8" />
        <CategoryCard className="xl:col-span-4" start={range.start} end={range.end} label={range.label} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <PipelineCard />
        <RepairsCard />
        <CashCard rc={rc} clients={clients} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <RunsCard />
        <StockCard products={products} />
        <ActivityCard automationsMinutes={automations.reduce((s, a) => s + (a.enabled ? a.runs30d * a.minutesSavedPerRun : 0), 0)} automationRuns={automations.reduce((s, a) => s + (a.enabled ? a.runs30d : 0), 0)} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- KPI tile */

function Kpi({
  to,
  icon,
  label,
  value,
  d,
  compare,
  prevText,
  spark,
  sub,
  chart,
  foot,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  value: string;
  d?: number;
  compare?: string;
  prevText?: string;
  spark?: number[];
  sub?: ReactNode;
  chart?: ReactNode;
  foot?: ReactNode;
}) {
  const showPct = d !== undefined && Math.abs(d) <= 3 && d !== 0;
  return (
    <Link to={to} className="group flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-3 text-ink-2">{icon}</span>
          {label}
        </span>
        <ChevronRight className="h-4 w-4 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-3 text-[26px] font-semibold leading-none tracking-[-0.025em] text-ink">{value}</div>
      <div className="mt-2 min-h-[20px] text-[12.5px]">
        {d !== undefined ? (
          showPct ? (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold", d >= 0 ? "bg-good-soft text-good" : "bg-bad-soft text-bad")}>
                {d >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {pct(Math.abs(d))}
              </span>
              <span className="text-ink-muted">{compare}</span>
            </span>
          ) : (
            <span className="text-ink-muted">{prevText}</span>
          )
        ) : (
          sub
        )}
      </div>
      {spark && (
        <div className="mt-2">
          <Sparkline values={spark} height={34} />
        </div>
      )}
      {chart}
      {foot && (
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-1 border-t border-line pt-2.5 text-[12px] text-ink-2">{foot}</div>
        </div>
      )}
    </Link>
  );
}

/* -------------------------------------------------------------- needs you */

interface Attention {
  id: string;
  tone: Tone;
  icon: ReactNode;
  title: string;
  sub: string;
  to: string;
  rank: number;
}

function useNeedsYou(): Attention[] {
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const conversations = useStore((s) => s.conversations);
  const products = useStore((s) => s.products);
  const clients = useClientMap();
  return useMemo(() => {
    const out: Attention[] = [];
    const waiting = conversations
      .map((c) => ({ c, since: waitingSince(c) }))
      .filter((x): x is { c: (typeof conversations)[number]; since: Date } => !!x.since)
      .sort((a, b) => a.since.getTime() - b.since.getTime());
    if (waiting.length) {
      const w = waiting[0];
      const who = w.c.clientId ? clients.get(w.c.clientId)?.name : w.c.leadName;
      const mins = (NOW.getTime() - w.since.getTime()) / 60000;
      out.push({
        id: "inbox",
        tone: mins > 60 ? "bad" : "warn",
        icon: <MessageCircle className="h-4 w-4" />,
        title: `${waiting.length} ${waiting.length === 1 ? "person is" : "people are"} waiting for a reply`,
        sub: `Longest: ${who}, ${duration(NOW.getTime() - w.since.getTime())}${w.c.topic ? ` · ${w.c.topic}` : ""}`,
        to: `/admin/inbox?c=${w.c.id}`,
        rank: mins > 60 ? 0 : 3,
      });
    }
    const receipts = conversations.filter((c) => c.status === "open" && c.messages[c.messages.length - 1]?.attachment?.includes("instapay"));
    if (receipts.length) {
      const c = receipts[0];
      const o = orders.find((x) => x.id === c.links?.[0]);
      out.push({
        id: "receipt",
        tone: "info",
        icon: <CreditCard className="h-4 w-4" />,
        title: `Confirm ${receipts.length} payment ${receipts.length === 1 ? "screenshot" : "screenshots"}`,
        sub: `${clients.get(c.clientId!)?.name}${o ? ` · ${o.id} · ${money(orderTotal(o))}` : ""}`,
        to: `/admin/inbox?c=${c.id}`,
        rank: 4,
      });
    }
    const due = orders.filter(isDueToday);
    if (due.length) {
      const notPacked = due.filter((o) => ["confirmed", "sourcing"].includes(o.stage)).length;
      out.push({
        id: "due",
        tone: notPacked ? "warn" : "primary",
        icon: <Truck className="h-4 w-4" />,
        title: `${due.length} deliveries promised for today`,
        sub: notPacked ? `${notPacked} not packed yet · ${due.filter((o) => o.stage === "ready").length} ready to go` : "All packed and ready",
        to: "/admin/orders?view=today",
        rank: notPacked ? 2 : 5,
      });
    }
    const late = orders.filter(isLate).filter((o) => !isDueToday(o));
    if (late.length) {
      out.push({
        id: "late",
        tone: "bad",
        icon: <Clock3 className="h-4 w-4" />,
        title: `${late.length} ${late.length === 1 ? "order is" : "orders are"} past the promised date`,
        sub: `${late[0].id} · ${clients.get(late[0].clientId)?.name} · ${late[0].items[0]?.name}`,
        to: `/admin/orders?o=${late[0].id}`,
        rank: 1,
      });
    }
    const approvals = repairs.filter((r) => r.stage === "approval");
    if (approvals.length) {
      const r = approvals.sort((a, b) => a.stageSince.getTime() - b.stageSince.getTime())[0];
      out.push({
        id: "approval",
        tone: "warn",
        icon: <Wrench className="h-4 w-4" />,
        title: `${approvals.length} repair ${approvals.length === 1 ? "estimate needs" : "estimates need"} the client's OK`,
        sub: `${clients.get(r.clientId)?.name} · ${money(r.price ?? 0)} · waiting ${duration(NOW.getTime() - r.stageSince.getTime())}`,
        to: `/admin/repairs?r=${r.id}`,
        rank: 3,
      });
    }
    const lateRep = repairs.filter(repairLate);
    if (lateRep.length) {
      const r = lateRep[0];
      const days = Math.ceil((NOW.getTime() - r.promisedAt.getTime()) / 86_400_000);
      out.push({
        id: "repair-late",
        tone: "bad",
        icon: <CalendarClock className="h-4 w-4" />,
        title: `${lateRep.length} ${lateRep.length === 1 ? "repair is" : "repairs are"} past the promised date`,
        sub: `${shortName(r.device)} at ${PARTNERS.find((p) => p.id === r.partnerId)?.name}, ${days} ${days === 1 ? "day" : "days"} late`,
        to: `/admin/repairs?r=${r.id}`,
        rank: 1,
      });
    }
    const rc = receivables(invoices);
    if (rc.overdue > 0) {
      const n = invoices.filter((i) => i.amount > i.paid && i.dueAt < NOW).length;
      out.push({
        id: "overdue",
        tone: rc.overdue30 > 0 ? "bad" : "warn",
        icon: <CircleDollarSign className="h-4 w-4" />,
        title: `${money(rc.overdue)} overdue`,
        sub: `${n} invoices${rc.debtors30 ? ` · ${rc.debtors30} ${rc.debtors30 === 1 ? "client" : "clients"} past 30 days` : ""} · reminders are automatic`,
        to: "/admin/invoices?f=overdue",
        rank: 6,
      });
    }
    const sold = unitsSold(orders, 30);
    const low = lowStock(products, sold);
    if (low.length) {
      const first = low[0];
      out.push({
        id: "stock",
        tone: "warn",
        icon: <Boxes className="h-4 w-4" />,
        title: `${low.length} products below reorder point`,
        sub: `${shortName(first.name)}: ${first.stock} left, ${sold.get(first.id) ?? 0} sold in 30 days`,
        to: "/admin/catalog?tab=stock",
        rank: 7,
      });
    }
    return out.sort((a, b) => a.rank - b.rank);
  }, [orders, repairs, invoices, conversations, products, clients]);
}

const TONE_BG: Record<Tone, string> = {
  neutral: "bg-surface-3 text-ink-2",
  primary: "bg-primary-soft text-primary-soft-ink",
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
};

function NeedsYou({ items, className }: { items: Attention[]; className?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader title="Needs you today" sub="Sorted by what costs you a client first" action={<Badge tone={items.some((i) => i.tone === "bad") ? "bad" : "warn"}>{items.length}</Badge>} />
      <ul className="mt-2 flex flex-1 flex-col px-2 pb-2">
        {items.map((i) => (
          <li key={i.id}>
            <Link to={i.to} className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2">
              <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", TONE_BG[i.tone])}>{i.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium leading-snug text-ink">{i.title}</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">{i.sub}</span>
              </span>
              <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-ink-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
        {!items.length && <li className="px-3 py-8 text-center text-ink-muted">All clear. Nothing needs you right now.</li>}
      </ul>
    </Card>
  );
}

/* ----------------------------------------------------------- revenue trend */

function RevenueTrend({ className }: { className?: string }) {
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const [metric, setMetric] = useState<"revenue" | "profit" | "orders">("revenue");
  const rows = useMemo(() => monthly(orders, repairs), [orders, repairs]);
  const pick = (m: { revenue: number; profit: number; orders: number }) => (metric === "revenue" ? m.revenue : metric === "profit" ? m.profit : m.orders);
  const fmt = metric === "orders" ? (n: number) => num(n) : (n: number) => moneyCompact(n).replace("EGP ", "");
  const labels = rows.map((r) => monthLabel(r.month));
  const best = rows.slice(0, -1).reduce((b, r) => (pick(r.cur) > pick(b.cur) ? r : b), rows[0]);
  const last = rows[rows.length - 1];
  const daysIn = NOW.getDate() - 1 + NOW.getHours() / 24;
  const pace = (pick(last.cur) / daysIn) * 31;
  const yearTotal = rows.reduce((s, r) => s + pick(r.cur), 0);
  const prevTotal = rows.reduce((s, r) => s + pick(r.prev), 0);
  const jan = labels.indexOf("Jan");
  const jun = labels.indexOf("Jun");
  const aug = labels.indexOf("Aug");
  return (
    <Card className={className}>
      <CardHeader
        title="Sales through the academic year"
        sub={
          <>
            {metric === "orders" ? num(yearTotal) : money(yearTotal)} in 12 months ·{" "}
            <span className={yearTotal >= prevTotal ? "text-good" : "text-bad"}>
              {yearTotal >= prevTotal ? "+" : "−"}
              {pct(Math.abs(delta(yearTotal, prevTotal)))}
            </span>{" "}
            on the year before
          </>
        }
        action={
          <Segmented
            size="sm"
            value={metric}
            onChange={setMetric}
            options={[
              { id: "revenue", label: "Revenue" },
              { id: "profit", label: "Profit" },
              { id: "orders", label: "Orders" },
            ]}
          />
        }
      />
      <div className="mt-2 flex flex-wrap items-center gap-4 px-5">
        <LegendKey color="var(--chart-1)" label="Last 12 months" line />
        <LegendKey color="var(--chart-muted)" label="Year before" line />
        <span className="text-[12px] text-ink-muted">Dotted: October so far</span>
      </div>
      <div className="px-3 pb-2 pt-1">
        <TrendChart
          height={268}
          labels={labels}
          partialLast
          format={fmt}
          tipTitle={(i) => rows[i].month.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + (rows[i].partial ? " (so far)" : "")}
          bands={[
            ...(jan >= 0 ? [{ from: jan, to: jan, label: "Exams" }] : []),
            ...(jun >= 0 && aug >= 0 ? [{ from: jun, to: aug, label: "Summer" }] : []),
          ]}
          series={[
            { key: "prev", label: "Year before", values: rows.map((r) => pick(r.prev)), color: "var(--chart-muted)" },
            { key: "cur", label: "Last 12 months", values: rows.map((r) => pick(r.cur)), color: "var(--chart-1)", area: true },
          ]}
        />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line px-5 py-3 text-[12.5px] text-ink-2">
        <span>
          <span className="text-ink-muted">Best month:</span> {monthLabel(best.month)} {best.month.getFullYear()} ({metric === "orders" ? num(pick(best.cur)) : moneyCompact(pick(best.cur))})
        </span>
        <span>
          <span className="text-ink-muted">October pace:</span> {metric === "orders" ? num(pace) : moneyCompact(pace)} by month end
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Term starts and the week before exams carry the year. Stock up in August and January.
        </span>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------- categories */

function CategoryCard({ className, start, end, label }: { className?: string; start: Date; end: Date; label: string }) {
  const orders = useStore((s) => s.orders);
  const nav = useNavigate();
  const rows = useMemo(() => byCategory(orders, start, end), [orders, start, end]);
  const top = rows.slice(0, 4);
  const weakest = top.length ? top.reduce((a, b) => (b.margin < a.margin ? b : a)) : undefined;
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader title="What's selling" sub={`${label} · revenue and margin by category`} />
      <div className="flex-1 px-5 pb-4 pt-4">
        <BarList
          format={moneyCompact}
          onSelect={(k) => nav(`/admin/catalog?cat=${encodeURIComponent(k)}`)}
          rows={rows.map((r) => ({
            key: r.category,
            label: r.category,
            value: r.revenue,
            right: (
              <>
                {moneyCompact(r.revenue)} <span className={cn("ml-1.5 text-[12px]", r.margin < 0.22 ? "text-warn" : "text-ink-muted")}>{pct(r.margin)}</span>
              </>
            ),
          }))}
        />
        {!rows.length && <p className="py-8 text-center text-ink-muted">No sales in this period yet.</p>}
      </div>
      {weakest && weakest.margin < 0.23 && (
        <div className="mx-5 mb-4 flex gap-2.5 rounded-xl bg-warn-soft px-3 py-2.5 text-[12.5px] text-ink-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
          <span>
            <b className="font-semibold text-ink">{weakest.category}</b> earn the least margin ({pct(weakest.margin)}). Your repair service is the reason students pay more, so price it in: a 12-month service plan on handpieces could lift this.
          </span>
        </div>
      )}
    </Card>
  );
}

/* --------------------------------------------------------------- pipeline */

function PipelineCard() {
  const orders = useStore((s) => s.orders);
  const nav = useNavigate();
  const open = orders.filter(isOpen);
  const stages = ORDER_STAGES.slice(0, 6).map((st) => {
    const list = open.filter((o) => o.stage === st.id);
    return { ...st, n: list.length, value: list.reduce((s, o) => s + orderTotal(o), 0), late: list.filter(isLate).length };
  });
  const max = Math.max(1, ...stages.map((s) => s.n));
  return (
    <Card>
      <CardHeader title="Orders in progress" sub={`${open.length} open · ${money(open.reduce((s, o) => s + orderTotal(o), 0))}`} action={<Button size="sm" variant="ghost" onClick={() => nav("/admin/orders")} iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Board</Button>} />
      <ul className="px-3 pb-3 pt-3">
        {stages.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => nav(`/admin/orders?stage=${s.id}`)} className="grid w-full grid-cols-[110px_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2">
              <span className="truncate text-[13px] text-ink">{s.label}</span>
              <span className="h-2 rounded-full bg-surface-3">
                <span className="block h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${(s.n / max) * 100}%` }} />
              </span>
              <span className="flex items-center gap-2 text-[12.5px] tnum">
                {s.late > 0 && <Badge tone="bad">{s.late} late</Badge>}
                <span className="w-5 text-right font-semibold text-ink">{s.n}</span>
                <span className="w-16 text-right text-ink-muted">{moneyCompact(s.value).replace("EGP ", "")}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------------------------------------------------------------- repairs */

function RepairsCard() {
  const repairs = useStore((s) => s.repairs);
  const clients = useClientMap();
  const nav = useNavigate();
  const active = repairs.filter(isActiveRepair);
  const urgent = [...active]
    .map((r) => {
      const total = Math.max(1, (r.promisedAt.getTime() - r.receivedAt.getTime()) / 86_400_000);
      const used = (NOW.getTime() - r.receivedAt.getTime()) / 86_400_000;
      return { r, total, used, ratio: used / total };
    })
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 4);
  return (
    <Card>
      <CardHeader title="Repairs closest to their promise" sub={`${active.length} devices with you or a partner`} action={<Button size="sm" variant="ghost" onClick={() => nav("/admin/repairs")} iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Board</Button>} />
      <ul className="flex flex-col gap-1 px-3 pb-3 pt-3">
        {urgent.map(({ r, total, used, ratio }) => (
          <li key={r.id}>
            <Link to={`/admin/repairs?r=${r.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
              <ProductArt kind={r.art} category="Handpieces & motors" size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-ink">{shortName(r.device)}</span>
                  <span className={cn("shrink-0 text-[12px] tnum", ratio > 1 ? "font-semibold text-bad" : ratio > 0.75 ? "text-warn" : "text-ink-muted")}>
                    {ratio > 1
                      ? `${Math.max(1, Math.round(used - total))} d late`
                      : r.promisedAt.toDateString() === NOW.toDateString()
                        ? "due today"
                        : `day ${Math.max(1, Math.ceil(used))} of ${Math.max(Math.ceil(used), Math.round(total))}`}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Meter value={Math.min(1, ratio)} tone={ratio > 1 ? "bad" : ratio > 0.75 ? "warn" : "primary"} className="flex-1" />
                </div>
                <div className="mt-1 truncate text-[12px] text-ink-muted">
                  {clients.get(r.clientId)?.name} · {REPAIR_STAGES.find((s) => s.id === r.stage)?.label}
                  {r.loaner ? " · loaner out" : ""}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------- cash */

function CashCard({ rc, clients }: { rc: ReturnType<typeof receivables>; clients: Map<string, { name: string }> }) {
  const invoices = useStore((s) => s.invoices);
  const remind = useStore((s) => s.sendReminder);
  const rows = aging(invoices);
  return (
    <Card className="lg:col-span-2 2xl:col-span-1">
      <CardHeader title="Money owed to you" sub={`${money(rc.total)} across ${rc.clients} clients`} action={<Link to="/admin/invoices" className="text-[13px] font-medium text-primary hover:underline">Invoices</Link>} />
      <div className="px-5 pt-4">
        <StackedBar format={moneyCompact} segments={rows.map((a, i) => ({ key: a.id, label: a.label, value: a.amount, color: AGE_COLORS[i] }))} />
      </div>
      <ul className="mt-3 border-t border-line px-3 py-2">
        {rc.top.slice(0, 3).map(([id, amount]) => {
          const inv = invoices.filter((i) => i.clientId === id && i.amount > i.paid).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())[0];
          const od = inv ? Math.floor((NOW.getTime() - inv.dueAt.getTime()) / 86_400_000) : 0;
          return (
            <li key={id} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="min-w-0 flex-1">
                <Link to={`/admin/clients/${id}`} className="block truncate text-[13px] font-medium text-ink hover:underline">
                  {clients.get(id)?.name}
                </Link>
                <span className={cn("text-[12px]", od > 0 ? "text-bad" : "text-ink-muted")}>{od > 0 ? `${od} days overdue` : "Not due yet"} · {inv?.reminders ?? 0} reminders sent</span>
              </div>
              <span className="text-[13px] font-semibold text-ink tnum">{money(amount)}</span>
              {inv && od > 0 && (
                <Button size="sm" onClick={() => remind(inv.id)}>
                  Remind
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------- runs */

function RunsCard() {
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const clients = useClientMap();
  const runs = useMemo(() => {
    const list: { at: Date; place: string; what: string; detail: string; kind: "deliver" | "partner" | "supplier" }[] = [];
    const due = orders.filter((o) => isDueToday(o) && ["ready", "out"].includes(o.stage));
    const byPlace = new Map<string, typeof due>();
    for (const o of due) byPlace.set(o.delivery.place, [...(byPlace.get(o.delivery.place) ?? []), o]);
    for (const [place, os] of byPlace) {
      list.push({
        at: os.reduce((a, o) => (o.promisedAt < a ? o.promisedAt : a), os[0].promisedAt),
        place,
        kind: "deliver",
        what: `Deliver ${os.length} ${os.length === 1 ? "order" : "orders"}`,
        detail: os.map((o) => `${firstName(clients.get(o.clientId)?.name ?? "")} (${o.id})`).join(", "),
      });
    }
    const drop = repairs.filter((r) => r.stage === "received");
    if (drop.length) {
      const at = new Date(NOW);
      at.setHours(12, 30, 0, 0);
      const p = PARTNERS.find((x) => x.id === drop[0].partnerId)!;
      list.push({ at, place: `${p.name}, ${p.area}`, kind: "partner", what: `Drop off ${drop.length} ${drop.length === 1 ? "device" : "devices"}`, detail: drop.map((r) => r.id).join(", ") });
    }
    const sourcing = orders.filter((o) => o.stage === "sourcing");
    if (sourcing.length) {
      const at = new Date(NOW);
      at.setHours(11, 15, 0, 0);
      list.push({ at, place: "Nile Dental Supply, Dokki", kind: "supplier", what: `Collect items for ${sourcing.length} orders`, detail: [...new Set(sourcing.flatMap((o) => o.items.map((i) => shortName(product(i.productId).name))))].slice(0, 3).join(", ") });
    }
    return list.sort((a, b) => a.at.getTime() - b.at.getTime());
  }, [orders, repairs, clients]);
  const icon = { deliver: <Truck className="h-4 w-4" />, partner: <Wrench className="h-4 w-4" />, supplier: <Boxes className="h-4 w-4" /> };
  return (
    <Card>
      <CardHeader title="Today's route" sub="Deliveries, partner drops and supplier pickups" />
      <ol className="relative px-5 pb-4 pt-4">
        {runs.map((r, i) => (
          <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
            {i < runs.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-line" aria-hidden />}
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-ink-2">{icon[r.kind]}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-medium text-ink">{r.what}</span>
                <span className="shrink-0 text-[12px] text-ink-muted tnum">{time(r.at)}</span>
              </div>
              <div className="text-[12.5px] text-ink-2">{r.place}</div>
              <div className="truncate text-[12px] text-ink-muted">{r.detail}</div>
            </div>
          </li>
        ))}
        {!runs.length && <li className="py-6 text-center text-ink-muted">No runs planned for today.</li>}
      </ol>
    </Card>
  );
}

/* ------------------------------------------------------------------ stock */

function StockCard({ products }: { products: ReturnType<typeof useStore.getState>["products"] }) {
  const orders = useStore((s) => s.orders);
  const toast = useStore((s) => s.toast);
  const sold = unitsSold(orders, 30);
  const low = lowStock(products, sold).slice(0, 4);
  return (
    <Card>
      <CardHeader title="Running low before the rush" sub="Below reorder point, with 30-day sales" action={<Link to="/admin/catalog?tab=stock" className="text-[13px] font-medium text-primary hover:underline">Stock</Link>} />
      <ul className="px-3 pb-3 pt-3">
        {low.map((p) => {
          const perWeek = (sold.get(p.id) ?? 0) / 4.3;
          const cover = perWeek > 0 ? p.stock / perWeek : Infinity;
          return (
            <li key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <ProductArt kind={p.art} category={p.category} size={38} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-ink">{shortName(p.name)}</div>
                <div className="text-[12px] text-ink-muted">
                  <span className={p.stock <= p.reorderPoint / 2 ? "font-medium text-bad" : "text-warn"}>{p.stock} left</span> · reorder at {p.reorderPoint} · {cover === Infinity ? "no recent sales" : `${num1(cover)} weeks cover`}
                </div>
              </div>
              <Button size="sm" onClick={() => toast(`Purchase order drafted for ${shortName(p.name)}`, "info")}>
                Reorder
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* --------------------------------------------------------------- activity */

function ActivityCard({ automationsMinutes, automationRuns }: { automationsMinutes: number; automationRuns: number }) {
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const clients = useClientMap();
  const events = useMemo(() => {
    const ev: { at: Date; text: string; kind: string; ref: string; who: string }[] = [];
    for (const o of orders.slice(-60)) for (const t of o.timeline) ev.push({ at: t.at, text: t.text, kind: t.kind, ref: o.id, who: clients.get(o.clientId)?.name ?? "" });
    for (const r of repairs.slice(-30)) for (const t of r.timeline) ev.push({ at: t.at, text: t.text, kind: t.kind, ref: r.id, who: clients.get(r.clientId)?.name ?? "" });
    return ev.filter((e) => e.at <= new Date()).sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 7);
  }, [orders, repairs, clients]);
  return (
    <Card className="lg:col-span-2 2xl:col-span-1">
      <CardHeader title="Recent activity" sub="Everything that happened, including what ran on its own" />
      <ul className="px-5 pb-2 pt-3">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3 border-b border-line py-2.5 last:border-0">
            <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", e.kind === "auto" ? "bg-violet-soft text-violet" : e.kind === "payment" ? "bg-good-soft text-good" : "bg-surface-3 text-ink-2")}>
              {e.kind === "auto" ? <Zap className="h-3.5 w-3.5" /> : e.kind === "payment" ? <Banknote className="h-3.5 w-3.5" /> : e.kind === "partner" ? <Wrench className="h-3.5 w-3.5" /> : <PackageCheck className="h-3.5 w-3.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-ink">{e.text}</div>
              <div className="text-[12px] text-ink-muted">
                <Mono className="text-[11.5px]">{e.ref}</Mono> · {e.who} · {ago(e.at)}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/admin/messaging" className="mx-5 mb-4 flex items-center gap-2.5 rounded-xl bg-violet-soft px-3 py-2.5 text-[12.5px] text-ink-2 hover:brightness-[0.98]">
        <Zap className="h-4 w-4 shrink-0 text-violet" />
        <span>
          Automations sent <b className="font-semibold text-ink">{num(automationRuns)} messages</b> in 30 days, about <b className="font-semibold text-ink">{Math.round(automationsMinutes / 60)} hours</b> you didn't spend typing.
        </span>
      </Link>
    </Card>
  );
}
