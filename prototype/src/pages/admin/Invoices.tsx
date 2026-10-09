import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BellRing, CheckCircle2, RefreshCw } from "lucide-react";
import { NOW } from "@/config/brand";
import type { Invoice, PaymentMethod } from "@/data/types";
import { cn } from "@/lib/cn";
import { money, moneyCompact, num1, shortDate } from "@/lib/format";
import { aging, daysOverdue, daysToPay, invoiceStatus, outstanding, paymentMix, receivables } from "@/lib/metrics";
import { useClientMap, useStore } from "@/store/useStore";
import { Button, Card, CardHeader, PageHeader, SearchInput, Segmented, Stat } from "@/components/ui/primitives";
import { StackedBar } from "@/components/charts/charts";
import { InvoicePill, Mono } from "@/components/ui/domain";

type F = "open" | "overdue" | "paid" | "all";
const AGE_COLORS = ["var(--chart-1)", "var(--age-1)", "var(--age-2)", "var(--age-3)", "var(--age-4)"];
const METHOD_COLORS: Record<PaymentMethod, string> = {
  InstaPay: "var(--chart-1)",
  Cash: "var(--chart-2)",
  "Vodafone Cash": "var(--chart-3)",
  Card: "var(--chart-4)",
  "Bank transfer": "var(--chart-5)",
};

export default function InvoicesPage() {
  const [params] = useSearchParams();
  const invoices = useStore((s) => s.invoices);
  const remind = useStore((s) => s.sendReminder);
  const record = useStore((s) => s.recordPayment);
  const toast = useStore((s) => s.toast);
  const clients = useClientMap();
  const [f, setF] = useState<F>(params.get("f") === "overdue" ? "overdue" : "open");
  const [q, setQ] = useState("");
  const rc = useMemo(() => receivables(invoices), [invoices]);
  const monthStart = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  const collected = invoices.filter((i) => i.paidAt && i.paidAt >= monthStart).reduce((s, i) => s + i.paid, 0);
  const mix = paymentMix(invoices, new Date(NOW.getFullYear() - 1, NOW.getMonth(), 1), NOW);
  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return invoices
      .filter((i) => {
        const st = invoiceStatus(i);
        if (f === "open" && st === "paid") return false;
        if (f === "overdue" && st !== "overdue") return false;
        if (f === "paid" && st !== "paid") return false;
        if (t && !(`${i.id} ${i.ref} ${clients.get(i.clientId)?.name ?? ""}`.toLowerCase().includes(t))) return false;
        return true;
      })
      .sort((a, b) => (f === "paid" || f === "all" ? b.issuedAt.getTime() - a.issuedAt.getTime() : a.dueAt.getTime() - b.dueAt.getTime()));
  }, [invoices, f, q, clients]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader title="Invoices & payments" sub="Who owes what, how old it is, and what's already being chased automatically." />

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card sm:flex-row sm:items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-good-soft text-good">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-[13px]">
          <div className="font-medium text-ink">Connected to your invoicing app</div>
          <div className="text-ink-muted">Invoices are created here when an order is confirmed and copied there, so your existing records and subscription keep working. Last sync 4 min ago.</div>
        </div>
        <Button size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => toast("Synced. Nothing new since 10:20", "info")}>
          Sync now
        </Button>
      </div>

      <Card className="mt-4 grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
        <Stat label="Owed to you" value={money(rc.total)} sub={`${rc.clients} clients`} />
        <Stat label="Overdue" value={money(rc.overdue)} tone={rc.overdue ? "bad" : "good"} sub={`${money(rc.overdue30)} over 30 days`} />
        <Stat label="Collected in October" value={money(collected)} tone="good" />
        <Stat label="Days to get paid" value={`${num1(daysToPay(invoices))} days`} sub="Average, last 90 days" />
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="How old the unpaid money is" sub="Days past the due date. Payment terms are 7 days." />
          <div className="px-5 pb-5 pt-4">
            <StackedBar format={moneyCompact} height={16} segments={aging(invoices).map((a, i) => ({ key: a.id, label: a.label, value: a.amount, color: AGE_COLORS[i] }))} />
          </div>
        </Card>
        <Card>
          <CardHeader title="How students pay" sub="Share of money received, last 12 months" />
          <div className="px-5 pb-5 pt-4">
            <StackedBar format={moneyCompact} height={16} segments={mix.map(([m, v]) => ({ key: m, label: m, value: v, color: METHOD_COLORS[m] }))} />
          </div>
        </Card>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={f}
          onChange={setF}
          options={[
            { id: "open", label: "Unpaid", count: invoices.filter((i) => outstanding(i) > 0).length },
            { id: "overdue", label: "Overdue", count: invoices.filter((i) => invoiceStatus(i) === "overdue").length },
            { id: "paid", label: "Paid" },
            { id: "all", label: "All" },
          ]}
        />
        <SearchInput className="w-full sm:w-72" placeholder="Invoice, order or client" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[920px] text-left text-[13px]">
            <thead className="border-b border-line bg-surface-2 text-[12px] text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Invoice</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Due</th>
                <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                <th className="px-4 py-2.5 text-right font-medium">Left to pay</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Reminders</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 60).map((i) => (
                <Row key={i.id} i={i} name={clients.get(i.clientId)?.name ?? ""} onRemind={() => remind(i.id)} onPaid={() => record(i.id, outstanding(i), "InstaPay")} />
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <div className="py-12 text-center text-ink-muted">No invoices here.</div>}
      </Card>

      <Card className="mt-4 p-5">
        <div className="flex items-start gap-3">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-violet" />
          <div className="text-[13px] text-ink-2">
            <div className="font-medium text-ink">How reminders work</div>
            A friendly WhatsApp message with InstaPay and Vodafone Cash details goes out on the due date, then after 7 and 14 days. It stops the moment a payment is recorded, and skips clients you've paused (like an agreed instalment plan). Anything more than 30 days overdue lands in “Needs you today” for a personal call.
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({ i, name, onRemind, onPaid }: { i: Invoice; name: string; onRemind: () => void; onPaid: () => void }) {
  const st = invoiceStatus(i);
  const od = daysOverdue(i);
  const left = outstanding(i);
  return (
    <tr className="border-b border-line last:border-0 hover:bg-surface-2">
      <td className="px-4 py-2.5">
        <Mono>{i.id}</Mono>
        <div className="text-[12px] text-ink-muted">
          for{" "}
          <Link className="hover:underline" to={i.ref.startsWith("RP") ? `/admin/repairs?r=${i.ref}` : `/admin/orders?o=${i.ref}`}>
            {i.ref}
          </Link>{" "}
          · {shortDate(i.issuedAt)}
        </div>
      </td>
      <td className="px-4 py-2.5">
        <Link to={`/admin/clients/${i.clientId}`} className="font-medium text-ink hover:underline">
          {name}
        </Link>
      </td>
      <td className={cn("px-4 py-2.5", st === "overdue" ? "font-medium text-bad" : "text-ink-2")}>{st === "paid" ? shortDate(i.dueAt) : od > 0 ? `${od} days overdue` : od === 0 ? "Today" : `In ${-od} days`}</td>
      <td className="px-4 py-2.5 text-right text-ink-2 tnum">{money(i.amount)}</td>
      <td className={cn("px-4 py-2.5 text-right font-medium tnum", left ? "text-ink" : "text-ink-muted")}>{left ? money(left) : "—"}</td>
      <td className="px-4 py-2.5">
        <InvoicePill invoice={i} />
        {st === "paid" && i.method && <div className="mt-0.5 text-[11.5px] text-ink-muted">{i.method}</div>}
      </td>
      <td className="px-4 py-2.5">
        <span className="flex items-center gap-1" title={`${i.reminders} of 3 reminders sent`}>
          {[0, 1, 2].map((k) => (
            <span key={k} className={cn("h-2 w-2 rounded-full", k < i.reminders ? "bg-violet" : "bg-surface-3 ring-1 ring-line")} />
          ))}
        </span>
      </td>
      <td className="px-4 py-2.5 text-right">
        {left > 0 && (
          <div className="flex justify-end gap-1.5">
            {st === "overdue" && (
              <Button size="sm" variant="ghost" onClick={onRemind}>
                Remind
              </Button>
            )}
            <Button size="sm" onClick={onPaid}>
              Mark paid
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
