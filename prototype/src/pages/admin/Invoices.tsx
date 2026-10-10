import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BellRing, CheckCircle2, CreditCard, FilePlus2, RefreshCw } from "lucide-react";
import { NOW } from "@/config/brand";
import type { Invoice, PaymentMethod } from "@/data/types";
import { cn } from "@/lib/cn";
import { money, moneyCompact, num1, shortDate } from "@/lib/format";
import { aging, daysOverdue, daysToPay, invoiceStatus, outstanding, paymentMix, receivables } from "@/lib/metrics";
import { useClientMap, useStore } from "@/store/useStore";
import { Avatar, Button, Card, CardHeader, PageHeader, SearchInput, Segmented } from "@/components/ui/primitives";
import { StackedBar } from "@/components/charts/charts";
import { InvoicePill } from "@/components/ui/domain";

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
  const openFlow = useStore((s) => s.openFlow);
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
    <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader
        title="Invoices & payments"
        sub={
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-good" /> Synced with your invoicing app 4 min ago
            <button type="button" className="ml-1 inline-flex items-center gap-1 font-semibold text-primary hover:underline" onClick={() => toast("Synced. Nothing new since 10:20", "info")}>
              <RefreshCw className="h-3.5 w-3.5" /> Sync
            </button>
          </span>
        }
        actions={
          <>
            <Button icon={<FilePlus2 className="h-4 w-4" />} onClick={() => openFlow({ kind: "invoice" })}>
              New invoice
            </Button>
            <Button variant="primary" icon={<CreditCard className="h-4 w-4" />} onClick={() => openFlow({ kind: "payment" })}>
              Record payment
            </Button>
          </>
        }
      />

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <Tile tint="bg-tint-peach" label="Owed to you" value={money(rc.total)} note={`${rc.clients} clients`} onClick={() => setF("open")} />
        <Tile tint="bg-tint-rose" label="Overdue" value={money(rc.overdue)} note={`${money(rc.overdue30)} over 30 days`} onClick={() => setF("overdue")} bad={rc.overdue > 0} />
        <Tile tint="bg-tint-mint" label={`Collected in ${NOW.toLocaleDateString("en-GB", { month: "long" })}`} value={money(collected)} note="Receipts sent automatically" onClick={() => setF("paid")} />
        <Tile tint="bg-tint-sky" label="Days to get paid" value={`${num1(daysToPay(invoices))} days`} note="Average, last 90 days" />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <ul>
          {rows.slice(0, 60).map((i) => (
            <Row key={i.id} i={i} name={clients.get(i.clientId)?.name ?? ""} onRemind={() => remind(i.id)} onPaid={() => openFlow({ kind: "payment", invoiceId: i.id })} />
          ))}
        </ul>
        {!rows.length && <div className="py-12 text-center font-semibold text-ink-muted">No invoices here.</div>}
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

      <div className="mt-4 flex items-start gap-3 rounded-[22px] bg-tint-lavender p-5">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-violet" />
        <div className="text-[13.5px] font-medium text-ink-2">
          <div className="font-bold text-ink">Reminders are automatic</div>
          A friendly WhatsApp message with payment details goes out on the due date, then after 7 and 14 days. It stops as soon as a payment is recorded. Anything over 30 days lands in your to-do list for a personal call.
        </div>
      </div>
    </div>
  );
}

function Tile({ tint, label, value, note, onClick, bad }: { tint: string; label: string; value: string; note: string; onClick?: () => void; bad?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className={cn("flex min-h-[120px] flex-col justify-between rounded-[22px] p-4 text-left transition-transform enabled:hover:-translate-y-0.5 sm:p-5", tint)}>
      <span className="text-[12.5px] font-bold text-ink-2 sm:text-[13.5px]">{label}</span>
      <span>
        <span className={cn("block text-[19px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[24px]", bad ? "text-bad" : "text-ink")}>{value}</span>
        <span className="mt-0.5 block text-[12px] font-semibold text-ink-muted">{note}</span>
      </span>
    </button>
  );
}

function Row({ i, name, onRemind, onPaid }: { i: Invoice; name: string; onRemind: () => void; onPaid: () => void }) {
  const st = invoiceStatus(i);
  const od = daysOverdue(i);
  const left = outstanding(i);
  return (
    <li className="flex flex-col gap-3 border-b border-line px-4 py-3.5 last:border-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={name} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/admin/clients/${i.clientId}`} className="truncate text-[14.5px] font-bold text-ink hover:underline">
              {name}
            </Link>
            <InvoicePill invoice={i} />
          </div>
          <div className="truncate text-[12.5px] font-medium text-ink-muted">
            {i.id} ·{" "}
            {i.ref ? (
              <Link className="hover:underline" to={i.ref.startsWith("RP") ? `/admin/repairs?r=${i.ref}` : `/admin/orders?o=${i.ref}`}>
                {i.ref}
              </Link>
            ) : (
              i.note
            )}{" "}
            · <span className={cn(st === "overdue" && "font-semibold text-bad")}>{st === "paid" ? `paid${i.method ? ` by ${i.method}` : ""}` : od > 0 ? `${od} days overdue` : od === 0 ? "due today" : `due in ${-od} days`}</span>
            {st !== "paid" && i.reminders > 0 && ` · ${i.reminders} ${i.reminders === 1 ? "reminder" : "reminders"} sent`}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pl-[50px] sm:pl-0">
        <div className="text-right">
          <div className="text-[15px] font-extrabold text-ink tnum">{money(left || i.amount)}</div>
          <div className="text-[12px] font-medium text-ink-muted">{left && left < i.amount ? `left of ${money(i.amount)}` : left ? "to pay" : shortDate(i.issuedAt)}</div>
        </div>
        {left > 0 && (
          <div className="flex gap-1.5">
            {st === "overdue" && (
              <Button size="sm" variant="ghost" onClick={onRemind}>
                Remind
              </Button>
            )}
            <Button size="sm" variant="primary" onClick={onPaid}>
              Paid
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
