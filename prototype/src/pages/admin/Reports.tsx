import { useMemo, useState } from "react";
import { NOW } from "@/config/brand";
import { PARTNERS, YEAR_LABEL, product } from "@/data/catalog";
import type { Channel } from "@/data/types";
import { cn } from "@/lib/cn";
import { compact, money, moneyCompact, monthLabel, num, num1, pct, shortName } from "@/lib/format";
import {
  byCategory,
  byUniversity,
  byYear,
  channelMix,
  isBooked,
  moneyIn,
  monthly,
  newVsReturning,
  onTimeRate,
  rangeFor,
  repairDays,
  repeatRate,
  type Period,
} from "@/lib/metrics";
import { useClientMap, useStore } from "@/store/useStore";
import { Card, CardHeader, PageHeader, Segmented, Stat } from "@/components/ui/primitives";
import { BarList, ColumnChart, LegendKey, StackedBar, StackedColumns } from "@/components/charts/charts";
import { CHANNEL_META } from "@/components/ui/domain";

const CH_COLOR: Record<Channel, string> = {
  whatsapp: "var(--chart-1)",
  webchat: "var(--chart-2)",
  instagram: "var(--chart-3)",
  walkin: "var(--chart-4)",
  call: "var(--chart-5)",
  email: "var(--chart-6)",
};

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("12m");
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const clients = useClientMap();
  const range = rangeFor(period);
  const m = useMemo(() => moneyIn(orders, repairs, range.start, range.end), [orders, repairs, range.start, range.end]);
  const months = useMemo(() => monthly(orders, repairs), [orders, repairs]);
  const unis = useMemo(() => byUniversity(orders, clients, range.start, range.end), [orders, clients, range.start, range.end]);
  const years = useMemo(() => byYear(orders, clients, range.start, range.end), [orders, clients, range.start, range.end]);
  const cats = useMemo(() => byCategory(orders, range.start, range.end), [orders, range.start, range.end]);
  const nvr = useMemo(() => newVsReturning(orders), [orders]);
  const ch = useMemo(() => channelMix(orders, range.start, range.end), [orders, range.start, range.end]);
  const rr = useMemo(() => repeatRate(orders), [orders]);
  const top = useMemo(() => {
    const mm = new Map<string, { units: number; revenue: number; cost: number }>();
    for (const o of orders) {
      if (!isBooked(o) || o.createdAt < range.start || o.createdAt > range.end || o.group) continue;
      for (const i of o.items) {
        const r = mm.get(i.productId) ?? { units: 0, revenue: 0, cost: 0 };
        r.units += i.qty;
        r.revenue += i.qty * i.price;
        r.cost += i.qty * i.cost;
        mm.set(i.productId, r);
      }
    }
    return [...mm.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8);
  }, [orders, range.start, range.end]);
  const tat = PARTNERS.map((p) => {
    const done = repairs.filter((r) => r.partnerId === p.id && r.stage === "returned" && r.returnedAt && r.returnedAt >= new Date(NOW.getTime() - 180 * 86_400_000));
    return { p, avg: done.length ? done.reduce((s, r) => s + repairDays(r), 0) / done.length : 0, n: done.length };
  });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader
        title="Reports"
        sub="Where the money comes from, who your customers are and how well the service runs."
        actions={
          <Segmented
            value={period}
            onChange={setPeriod}
            options={[
              { id: "mtd", label: "Month" },
              { id: "term", label: "Term" },
              { id: "12m", label: "12 months" },
            ]}
          />
        }
      />

      <Card className="mt-5 grid grid-cols-2 gap-4 p-4 lg:grid-cols-5">
        <Stat label="Revenue" value={money(m.revenue)} sub={range.label} />
        <Stat label="Gross profit" value={money(m.profit)} sub={`${pct(m.margin, 1)} margin`} />
        <Stat label="Orders" value={num(m.orders)} sub={`avg ${money(m.orders ? m.revenue / m.orders : 0)}`} />
        <Stat label="Repeat customers" value={pct(rr.rate)} sub="Bought more than once" tone="good" />
        <Stat label="Delivered on promised day" value={pct(onTimeRate(orders, 90))} sub="Last 90 days" />
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue by month" sub="Last 12 months. October is month to date." />
          <div className="px-3 pb-3 pt-3">
            <ColumnChart height={360} format={(n) => compact(n)} data={months.map((r) => ({ label: monthLabel(r.month), value: r.cur.revenue, tip: `${monthLabel(r.month)} ${r.month.getFullYear()} · ${pct(r.cur.margin)} margin` }))} />
          </div>
        </Card>
        <Card>
          <CardHeader title="By university" sub={range.label} />
          <div className="px-5 pb-5 pt-4">
            <BarList format={moneyCompact} rows={unis.map((u) => ({ key: u.id, label: u.name, value: u.revenue, sub: `${u.clients} buying clients` }))} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="By year of study" sub="2nd and 3rd years buy the most: preclinical kits" />
          <div className="px-3 pb-3 pt-3">
            <ColumnChart height={210} format={(n) => compact(n)} data={years.map((y) => ({ label: y.year === 6 ? "Intern" : `Y${y.year}`, value: y.revenue, tip: YEAR_LABEL[y.year as 1] }))} />
          </div>
        </Card>
        <Card>
          <CardHeader title="New and returning buyers" sub="Clients who ordered each month" />
          <div className="flex gap-4 px-5 pt-2">
            <LegendKey color="var(--chart-1)" label="Returning" />
            <LegendKey color="var(--chart-2)" label="New" />
          </div>
          <div className="px-3 pb-3 pt-1">
            <StackedColumns
              height={200}
              format={(n) => num(n)}
              series={[
                { label: "Returning", color: "var(--chart-1)" },
                { label: "New", color: "var(--chart-2)" },
              ]}
              data={nvr.map((r) => ({ label: monthLabel(r.month).slice(0, 1), values: [r.returning, r.newC] }))}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Where orders start" sub={`${ch.total} orders · ${range.label.toLowerCase()}`} />
          <div className="px-5 pb-5 pt-4">
            <StackedBar
              height={14}
              format={(n) => `${pct(n / Math.max(1, ch.total))}`}
              segments={ch.rows.map(([c, n]) => ({ key: c, label: CHANNEL_META[c as Channel].label, value: n, color: CH_COLOR[c as Channel] }))}
            />
            <p className="mt-4 text-[12.5px] text-ink-muted">WhatsApp stays the front door. The website and tracking pages take the repetitive questions off it.</p>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Best sellers" sub={`${range.label} · revenue, units and margin`} />
          <div className="mt-3 overflow-x-auto scroll-thin">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead className="border-y border-line bg-surface-2 text-[12px] text-ink-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Product</th>
                  <th className="px-4 py-2 text-right font-medium">Units</th>
                  <th className="px-4 py-2 text-right font-medium">Revenue</th>
                  <th className="px-4 py-2 text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {top.map(([id, r]) => {
                  const mg = (r.revenue - r.cost) / r.revenue;
                  return (
                    <tr key={id} className="border-b border-line last:border-0">
                      <td className="px-4 py-2 text-ink">{shortName(product(id).name)}</td>
                      <td className="px-4 py-2 text-right text-ink-2 tnum">{r.units}</td>
                      <td className="px-4 py-2 text-right font-medium text-ink tnum">{money(r.revenue)}</td>
                      <td className={cn("px-4 py-2 text-right tnum", mg < 0.22 ? "text-warn" : "text-ink-2")}>{pct(mg)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader title="Margin by category" sub={range.label} />
            <div className="px-5 pb-5 pt-4">
              <BarList format={(n) => pct(n)} rows={cats.map((c) => ({ key: c.category, label: c.category, value: c.margin, right: <>{pct(c.margin)} <span className="ml-1 text-[12px] text-ink-muted">of {moneyCompact(c.revenue)}</span></> }))} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Repair turnaround by partner" sub="Average days from pickup to hand-back, last 6 months" />
            <div className="px-5 pb-5 pt-4">
              <BarList color="var(--chart-3)" format={(n) => `${num1(n)} days`} rows={tat.map((t) => ({ key: t.p.id, label: t.p.name, value: t.avg, right: `${num1(t.avg)} days · ${t.n} repairs` }))} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
