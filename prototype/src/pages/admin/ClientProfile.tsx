import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, MessageCircle, Phone, Send, ShoppingBag, Wrench } from "lucide-react";
import { REQUIREMENTS, YEAR_LABEL, product, uni } from "@/data/catalog";
import { orderTotal } from "@/data/seed";
import { cn } from "@/lib/cn";
import { ago, money, shortDate, shortName } from "@/lib/format";
import { clientStats, invoiceStatus, isBooked, outstanding, type InvoiceStatus } from "@/lib/metrics";
import type { Invoice } from "@/data/types";

const outstandingLabel = (i: Invoice, st: InvoiceStatus, left: number) =>
  st === "paid" ? `paid ${i.method ? `via ${i.method}` : ""}` : `${money(left)} left · due ${shortDate(i.dueAt)}`;
import { useStore } from "@/store/useStore";
import { Avatar, Badge, Button, Card, CardHeader, Meter, Segmented, Stat } from "@/components/ui/primitives";
import { InvoicePill, Mono, OrderStagePill, RepairStagePill } from "@/components/ui/domain";
import { ProductArt } from "@/components/art/ProductArt";

type Tab = "orders" | "repairs" | "invoices";

export default function ClientProfile() {
  const { id } = useParams();
  const client = useStore((s) => s.clients.find((c) => c.id === id));
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const toast = useStore((s) => s.toast);
  const addOrder = useStore((s) => s.createOrder);
  const [tab, setTab] = useState<Tab>("orders");
  const stats = useMemo(() => clientStats(orders, invoices).get(id ?? ""), [orders, invoices, id]);

  if (!client) return <div className="p-8 text-ink-muted">Client not found.</div>;
  const myOrders = orders.filter((o) => o.clientId === client.id).reverse();
  const myRepairs = repairs.filter((r) => r.clientId === client.id).reverse();
  const myInvoices = invoices.filter((i) => i.clientId === client.id).reverse();
  const bought = new Set(myOrders.filter(isBooked).flatMap((o) => o.items.map((i) => i.productId)));
  const req = REQUIREMENTS[client.year];
  const have = req.filter((r) => bought.has(r.productId));
  const missing = req.filter((r) => !bought.has(r.productId) && r.required);
  const missingValue = missing.reduce((s, r) => s + product(r.productId).price * r.qty, 0);
  const u = uni(client.universityId);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <Link to="/admin/clients" className="inline-flex items-center gap-1 text-[13px] text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Clients
      </Link>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} size={60} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">{client.name}</h1>
              {client.tags.map((t) => (
                <Badge key={t} tone={t === "Late payer" ? "bad" : t === "VIP" ? "violet" : "info"}>
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-0.5 text-[13.5px] text-ink-muted">
              {u.name} · {YEAR_LABEL[client.year]} · <span className="font-mono">{client.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<MessageCircle className="h-4 w-4" />} onClick={() => toast("Opening WhatsApp chat", "info")}>
            Message
          </Button>
          <Button icon={<Phone className="h-4 w-4" />} onClick={() => toast(`Calling ${client.phone}`, "info")}>
            Call
          </Button>
          <Link to="/admin/orders?new=1">
            <Button variant="primary" icon={<ShoppingBag className="h-4 w-4" />}>
              New order
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mt-5 grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Spent with you" value={money(stats?.ltv ?? 0)} />
        <Stat label="Orders" value={stats?.orders ?? 0} />
        <Stat label="Average order" value={money(stats?.orders ? stats.ltv / stats.orders : 0)} />
        <Stat label="Owes" value={money(stats?.balance ?? 0)} tone={stats?.balance ? "bad" : undefined} />
        <Stat label="Client since" value={shortDate(client.joinedAt)} sub={String(client.joinedAt.getFullYear())} />
        <Stat label="Found you via" value={client.source} />
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader
              title={`${YEAR_LABEL[client.year]} requirements`}
              sub={`${u.short} list · ${have.length} of ${req.length} items bought from you`}
              action={
                missing.length > 0 && (
                  <Button size="sm" variant="soft" icon={<Send className="h-3.5 w-3.5" />} onClick={() => {
                    addOrder({ clientId: client.id, items: missing.map((m) => ({ productId: m.productId, qty: m.qty })), channel: "whatsapp", promisedAt: new Date(Date.now() + 2 * 86_400_000) });
                  }}>
                    Quote the rest · {money(missingValue)}
                  </Button>
                )
              }
            />
            <div className="px-5 pt-3">
              <Meter value={have.length / req.length} />
            </div>
            <ul className="grid grid-cols-1 gap-x-6 px-5 pb-4 pt-3 sm:grid-cols-2">
              {req.map((r) => {
                const p = product(r.productId);
                const ok = bought.has(r.productId);
                return (
                  <li key={r.productId} className="flex items-center gap-2.5 border-b border-line py-2 text-[13px]">
                    {ok ? <CheckCircle2 className="h-4 w-4 shrink-0 text-good" /> : <Circle className="h-4 w-4 shrink-0 text-line-strong" />}
                    <span className={cn("min-w-0 flex-1 truncate", ok ? "text-ink-muted line-through decoration-line-strong" : "text-ink")}>
                      {r.qty > 1 ? `${r.qty}× ` : ""}
                      {p.name}
                    </span>
                    {!r.required && <span className="text-[11.5px] text-ink-muted">optional</span>}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-5 pt-4">
              <Segmented
                size="sm"
                value={tab}
                onChange={setTab}
                options={[
                  { id: "orders", label: "Orders", count: myOrders.length },
                  { id: "repairs", label: "Repairs", count: myRepairs.length },
                  { id: "invoices", label: "Invoices", count: myInvoices.length },
                ]}
              />
            </div>
            <ul className="px-3 pb-3 pt-3">
              {tab === "orders" &&
                myOrders.map((o) => (
                  <li key={o.id}>
                    <Link to={`/admin/orders?o=${o.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-2">
                      <ProductArt kind={product(o.items[0].productId).art} category={product(o.items[0].productId).category} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Mono>{o.id}</Mono>
                          <span className="text-[12px] text-ink-muted">{ago(o.createdAt)}</span>
                        </div>
                        <div className="truncate text-[13px] text-ink-2">{o.items.map((i) => shortName(i.name)).join(", ")}</div>
                      </div>
                      <span className="text-[13px] font-medium text-ink tnum">{money(orderTotal(o))}</span>
                      <OrderStagePill stage={o.stage} />
                    </Link>
                  </li>
                ))}
              {tab === "repairs" &&
                myRepairs.map((r) => (
                  <li key={r.id}>
                    <Link to={`/admin/repairs?r=${r.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-2">
                      <Wrench className="h-4 w-4 text-ink-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Mono>{r.id}</Mono>
                          <span className="text-[12px] text-ink-muted">{ago(r.receivedAt)}</span>
                        </div>
                        <div className="truncate text-[13px] text-ink-2">
                          {r.device} · “{r.issue}”
                        </div>
                      </div>
                      <RepairStagePill stage={r.stage} />
                    </Link>
                  </li>
                ))}
              {tab === "invoices" &&
                myInvoices.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                    <Mono>{i.id}</Mono>
                    <span className="flex-1 text-[12.5px] text-ink-muted">
                      for {i.ref} · {outstandingLabel(i, invoiceStatus(i), outstanding(i))}
                    </span>
                    <span className="text-[13px] font-medium text-ink tnum">{money(i.amount)}</span>
                    <InvoicePill invoice={i} />
                  </li>
                ))}
              {((tab === "orders" && !myOrders.length) || (tab === "repairs" && !myRepairs.length) || (tab === "invoices" && !myInvoices.length)) && <li className="py-8 text-center text-ink-muted">Nothing yet</li>}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <div className="eyebrow mb-2">Notes</div>
            <p className="text-[13.5px] leading-relaxed text-ink-2">{client.notes ?? "No notes yet. Add what you'd want to remember next time they message: preferences, deadlines, who referred them."}</p>
          </Card>
          <Card className="p-4">
            <div className="eyebrow mb-2">Delivery</div>
            <div className="text-[13.5px] text-ink">{u.campus}</div>
            <div className="text-[12.5px] text-ink-muted">Usual hand-over point for {u.short}</div>
          </Card>
          <Card className="p-4">
            <div className="eyebrow mb-2">Next year</div>
            <p className="text-[13px] text-ink-2">
              {client.year < 6
                ? `Moves to ${YEAR_LABEL[(client.year + 1) as 2]} next September. Their ${REQUIREMENTS[(client.year + 1) as 2].length}-item list is worth about ${money(REQUIREMENTS[(client.year + 1) as 2].reduce((s, r) => s + product(r.productId).price * r.qty, 0))}.`
                : "Finishing internship. A good moment to offer loupes servicing and clinic setup help."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
