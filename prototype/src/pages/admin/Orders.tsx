import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Columns3, List, Plus, Send, Truck, Users } from "lucide-react";
import { NOW } from "@/config/brand";
import { UNIVERSITIES, YEAR_LABEL, uni } from "@/data/catalog";
import { orderCost, orderTotal } from "@/data/seed";
import type { Order, OrderStage, PaymentMethod } from "@/data/types";
import { cn } from "@/lib/cn";
import { addDays, ago, dateTime, dueLabel, money, pct, shortDate, shortName } from "@/lib/format";
import { isDueToday, isLate, isOpen } from "@/lib/metrics";
import { ORDER_STAGES, useClientMap, useStore } from "@/store/useStore";
import { Avatar, Badge, Button, Card, Input, PageHeader, SearchInput, Segmented, Select } from "@/components/ui/primitives";
import { Drawer } from "@/components/ui/overlays";
import { ChannelIcon, Mono, OrderStagePill, PaymentPill } from "@/components/ui/domain";
import { NewDatePrompt, lateTitle } from "@/components/flows/Flows";

type View = "board" | "list";
type Quick = "open" | "today" | "late" | "unpaid" | "all";

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const orders = useStore((s) => s.orders);
  const setStage = useStore((s) => s.setOrderStage);
  const clients = useClientMap();
  const [view, setView] = useState<View>(() => (typeof window !== "undefined" && window.innerWidth < 768 ? "list" : "board"));
  const [quick, setQuick] = useState<Quick>(() => (["today", "late", "unpaid"].includes(params.get("view") ?? "") ? (params.get("view") as Quick) : "open"));
  const [q, setQ] = useState("");
  const [uniF, setUniF] = useState("all");
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<OrderStage | null>(null);
  const stageFilter = params.get("stage") as OrderStage | null;
  const openId = params.get("o");
  const openFlow = useStore((s) => s.openFlow);

  const setParam = (k: string, v: string | null) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true });
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (o.stage === "cancelled") return false;
      const c = clients.get(o.clientId);
      if (t && !(o.id.toLowerCase().includes(t) || c?.name.toLowerCase().includes(t) || o.items.some((i) => i.name.toLowerCase().includes(t)))) return false;
      if (uniF !== "all" && c?.universityId !== uniF) return false;
      if (stageFilter && o.stage !== stageFilter) return false;
      if (quick === "open") return isOpen(o) || (o.stage === "delivered" && o.deliveredAt && o.deliveredAt > addDays(NOW, -3));
      if (quick === "today") return isDueToday(o);
      if (quick === "late") return isLate(o);
      if (quick === "unpaid") return o.paid < orderTotal(o) && !["new", "quoted"].includes(o.stage);
      return true;
    });
  }, [orders, clients, q, uniF, quick, stageFilter]);

  const counts = {
    open: orders.filter(isOpen).length,
    today: orders.filter(isDueToday).length,
    late: orders.filter(isLate).length,
    unpaid: orders.filter((o) => o.stage !== "cancelled" && o.paid < orderTotal(o) && !["new", "quoted"].includes(o.stage)).length,
  };
  const selected = orders.find((o) => o.id === openId);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader
        title="Orders"
        sub="From the first message to delivered and paid. Drag a card to move it; the client is updated automatically."
        actions={
          <>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { id: "board", label: <><Columns3 className="h-3.5 w-3.5" /> Board</> },
                { id: "list", label: <><List className="h-3.5 w-3.5" /> List</> },
              ]}
            />
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => openFlow({ kind: "order" })}>
              New order
            </Button>
          </>
        }
      />

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Segmented
          value={quick}
          onChange={(v) => {
            setQuick(v);
            setParam("stage", null);
          }}
          options={[
            { id: "open", label: "In progress", count: counts.open },
            { id: "today", label: "Due today", count: counts.today },
            { id: "late", label: "Late", count: counts.late },
            { id: "unpaid", label: "Unpaid", count: counts.unpaid },
            { id: "all", label: "All orders" },
          ]}
        />
        <div className="flex flex-1 gap-2 lg:justify-end">
          <SearchInput className="w-full lg:max-w-[280px]" placeholder="Order, client or product" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-40 shrink-0" value={uniF} onChange={(e) => setUniF(e.target.value)} aria-label="University">
            <option value="all">All universities</option>
            {UNIVERSITIES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.short}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {quick === "late" && counts.late > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-bad-soft px-4 py-3 text-[13.5px] font-medium text-ink-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-bad" />
          <span>
            <b className="font-bold text-ink">{counts.late} {counts.late === 1 ? "order is" : "orders are"} past the promised date.</b> Open one to send the client a new date in one tap.
          </span>
        </div>
      )}
      {stageFilter && (
        <div className="mt-3 flex items-center gap-2 text-[13px] text-ink-2">
          Showing stage <OrderStagePill stage={stageFilter} />
          <button className="text-primary hover:underline" onClick={() => setParam("stage", null)}>
            Clear
          </button>
        </div>
      )}

      {view === "board" ? (
        <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-4 scroll-thin sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex min-w-max gap-3">
            {ORDER_STAGES.map((st) => {
              const list = filtered.filter((o) => o.stage === st.id).sort((a, b) => a.promisedAt.getTime() - b.promisedAt.getTime());
              const value = list.reduce((s, o) => s + orderTotal(o), 0);
              return (
                <div
                  key={st.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (over !== st.id) setOver(st.id);
                  }}
                  onDragLeave={() => setOver(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain") || drag;
                    if (id) setStage(id, st.id);
                    setDrag(null);
                    setOver(null);
                  }}
                  className={cn("flex w-[272px] shrink-0 flex-col rounded-[22px] transition-colors", over === st.id ? "bg-primary-soft" : "bg-surface-3/70")}
                >
                  <div className="flex items-center justify-between px-4 pb-2 pt-4">
                    <span className="text-[15px] font-extrabold text-ink">{st.label}</span>
                    <span className="rounded-full bg-surface px-2.5 py-0.5 text-[12.5px] font-bold text-ink-2 tnum" title={value ? money(value) : undefined}>
                      {list.length}
                    </span>
                  </div>
                  <div className="flex min-h-[120px] flex-col gap-2 px-2 pb-2">
                    {list.map((o) => (
                      <OrderCard key={o.id} o={o} onOpen={() => setParam("o", o.id)} onDragStart={() => setDrag(o.id)} />
                    ))}
                    {!list.length && <div className="rounded-xl border border-dashed border-line py-6 text-center text-[12.5px] text-ink-muted">Nothing here</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="mt-5 overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead className="border-b border-line bg-surface-2 text-[12px] text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Client</th>
                  <th className="px-4 py-2.5 font-medium">Items</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Payment</th>
                  <th className="px-4 py-2.5 font-medium">Stage</th>
                  <th className="px-4 py-2.5 font-medium">Promised</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered]
                  .reverse()
                  .slice(0, 80)
                  .map((o) => {
                    const c = clients.get(o.clientId);
                    const late = isLate(o);
                    return (
                      <tr key={o.id} onClick={() => setParam("o", o.id)} className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-2">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <Mono>{o.id}</Mono>
                            <ChannelIcon channel={o.channel} />
                          </div>
                          <div className="text-[12px] text-ink-muted">{ago(o.createdAt)}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-ink">{c?.name}</div>
                          <div className="text-[12px] text-ink-muted">
                            {c && `${uni(c.universityId).short} · ${YEAR_LABEL[c.year]}`}
                          </div>
                        </td>
                        <td className="max-w-[260px] px-4 py-2.5">
                          <div className="truncate text-ink-2">{o.group ? `Group order · ${o.group.students} students` : o.items.map((i) => shortName(i.name)).join(", ")}</div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-ink tnum">{money(orderTotal(o))}</td>
                        <td className="px-4 py-2.5">
                          <PaymentPill total={orderTotal(o)} paid={o.paid} />
                        </td>
                        <td className="px-4 py-2.5">
                          <OrderStagePill stage={o.stage} />
                        </td>
                        <td className={cn("px-4 py-2.5 text-[12.5px]", late ? "font-medium text-bad" : "text-ink-2")}>{o.stage === "delivered" ? shortDate(o.deliveredAt ?? o.promisedAt) : dueLabel(o.promisedAt)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {!filtered.length && <div className="py-12 text-center text-ink-muted">No orders match these filters.</div>}
        </Card>
      )}

      <OrderDrawer order={selected} onClose={() => setParam("o", null)} />
    </div>
  );
}

function OrderCard({ o, onOpen, onDragStart }: { o: Order; onOpen: () => void; onDragStart: () => void }) {
  const clients = useClientMap();
  const c = clients.get(o.clientId);
  const total = orderTotal(o);
  const late = isLate(o);
  const today = isDueToday(o);
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", o.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className="group w-full cursor-grab rounded-2xl bg-surface p-3.5 text-left shadow-card transition-all hover:-translate-y-px active:cursor-grabbing"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Mono>{o.id}</Mono>
          <ChannelIcon channel={o.channel} />
        </span>
        {o.stage !== "delivered" && !["new", "quoted"].includes(o.stage) && (
          <span className={cn("text-[11.5px] font-semibold", late ? "rounded-full bg-bad-soft px-2 py-0.5 text-bad" : today ? "text-warn" : "text-ink-muted")}>{dueLabel(o.promisedAt)}</span>
        )}
        {["new", "quoted"].includes(o.stage) && <span className="text-[11.5px] text-ink-muted">{ago(o.createdAt)}</span>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Avatar name={c?.name ?? "?"} size={22} />
        <span className="truncate text-[13.5px] font-medium text-ink">{c?.name}</span>
      </div>
      <div className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-ink-2">
        {o.group ? (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Group order · {o.group.students} students
          </span>
        ) : (
          o.items.map((i) => (i.qty > 1 ? `${i.qty}× ` : "") + shortName(i.name)).join(", ")
        )}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink tnum">{money(total)}</span>
        <PaymentPill total={total} paid={o.paid} />
      </div>
      {o.stage === "out" && o.delivery.slot && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-info-soft px-2 py-1 text-[11.5px] text-info">
          <Truck className="h-3.5 w-3.5" /> {o.delivery.slot}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ drawer */

function OrderDrawer({ order, onClose }: { order?: Order; onClose: () => void }) {
  const clients = useClientMap();
  const setStage = useStore((s) => s.setOrderStage);
  const recordPayment = useStore((s) => s.recordPayment);
  const delayOrder = useStore((s) => s.delayOrder);
  const toast = useStore((s) => s.toast);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("InstaPay");
  if (!order) return null;
  const c = clients.get(order.clientId);
  const total = orderTotal(order);
  const cost = orderCost(order);
  const margin = total ? (total - cost) / total : 0;
  const balance = total - order.paid;
  const idx = ORDER_STAGES.findIndex((s) => s.id === order.stage);
  const next = ORDER_STAGES[idx + 1];

  return (
    <Drawer
      open
      onClose={onClose}
      width={620}
      title={
        <span className="flex items-center gap-2.5">
          <span className="font-mono">{order.id}</span>
          <OrderStagePill stage={order.stage} />
          {order.group && <Badge tone="violet">Group · {order.group.students} students</Badge>}
        </span>
      }
      sub={
        <span className="flex items-center gap-1.5">
          Created {dateTime(order.createdAt)} via <ChannelIcon channel={order.channel} withLabel />
        </span>
      }
      footer={
        <>
          <Button icon={<Send className="h-4 w-4" />} onClick={() => toast(`Status update sent to ${c?.name.split(" ")[0]} on WhatsApp`, "info")}>
            Send update
          </Button>
          {next && order.stage !== "cancelled" && (
            <Button variant="primary" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => setStage(order.id, next.id)}>
              Move to {next.label}
            </Button>
          )}
        </>
      }
    >
      {/* stepper */}
      <div className="border-b border-line px-5 py-4">
        <ol className="flex items-center gap-1">
          {ORDER_STAGES.map((s, i) => (
            <li key={s.id} className="flex flex-1 flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStage(order.id, s.id)}
                title={`Move to ${s.label}`}
                className={cn("h-1.5 w-full rounded-full transition-colors", i <= idx ? "bg-primary" : "bg-surface-3 hover:bg-line-strong")}
              />
              <span className={cn("hidden text-center text-[10.5px] leading-tight sm:block", i === idx ? "font-semibold text-ink" : "text-ink-muted")}>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-5 px-5 py-5">
        {isLate(order) && <NewDatePrompt title={lateTitle("order", order.promisedAt)} who={c?.name.split(" ")[0] ?? "The client"} onSend={(d) => delayOrder(order.id, d)} />}

        {/* client */}
        {c && (
          <Link to={`/admin/clients/${c.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-line-strong">
            <Avatar name={c.name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-ink">{c.name}</div>
              <div className="text-[12.5px] text-ink-muted">
                {uni(c.universityId).name} · {YEAR_LABEL[c.year]} · <span className="font-mono">{c.phone}</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-muted" />
          </Link>
        )}

        {order.notes && <div className="rounded-xl bg-warn-soft px-3 py-2.5 text-[13px] text-ink-2">{order.notes}</div>}

        {/* items */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="eyebrow">Items</span>
            <span className="text-[12px] text-ink-muted">Cost and margin are only visible to you</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-[13px]">
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.productId} className="border-b border-line last:border-0">
                    <td className="px-3 py-2.5">
                      <div className="text-ink">{i.name}</div>
                      <div className="text-[12px] text-ink-muted tnum">
                        {i.qty} × {money(i.price)} · cost {money(i.cost)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="font-medium text-ink tnum">{money(i.qty * i.price)}</div>
                      <div className={cn("text-[12px] tnum", (i.price - i.cost) / i.price < 0.2 ? "text-warn" : "text-ink-muted")}>{pct((i.price - i.cost) / i.price)} margin</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-1 gap-1 border-t border-line bg-surface-2 px-3 py-2.5 text-[13px]">
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-ink-2">
                  <span>Delivery</span>
                  <span className="tnum">{money(order.deliveryFee)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-ink-2">
                  <span>Discount</span>
                  <span className="tnum">−{money(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-ink">
                <span>Total</span>
                <span className="tnum">{money(total)}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>Your profit</span>
                <span className={cn("tnum", margin < 0.2 ? "text-warn" : "text-good")}>
                  {money(total - cost)} · {pct(margin)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* payment + delivery */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line p-3.5">
            <div className="eyebrow mb-2">Payment</div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-2">
                Paid {money(order.paid)} of {money(total)}
              </span>
              <PaymentPill total={total} paid={order.paid} />
            </div>
            {order.paymentMethod && <div className="mt-1 text-[12px] text-ink-muted">Last payment via {order.paymentMethod}</div>}
            {balance > 0 && !["new", "quoted"].includes(order.stage) && (
              <form
                className="mt-3 flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  recordPayment(order.id, Number(amount) || balance, method);
                  setAmount("");
                }}
              >
                <div className="flex gap-2">
                  <Input id="pay-amount" className="tnum" placeholder={String(balance)} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Amount" />
                  <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} aria-label="Method" className="w-40 shrink-0">
                    {["InstaPay", "Cash", "Vodafone Cash", "Card", "Bank transfer"].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </Select>
                </div>
                <Button type="submit" variant="soft" size="sm">
                  Record payment
                </Button>
              </form>
            )}
          </div>
          <div className="rounded-xl border border-line p-3.5">
            <div className="eyebrow mb-2">Delivery</div>
            <div className="text-[13px] font-medium text-ink">{order.delivery.place}</div>
            <div className="text-[12.5px] text-ink-muted">{order.delivery.type === "campus" ? "Campus hand-over" : order.delivery.type === "pickup" ? "Client picks up" : "Courier"}</div>
            <div className="mt-2 text-[12.5px] text-ink-2">
              Promised: <b className={cn("font-medium", isLate(order) ? "text-bad" : "text-ink")}>{order.promisedAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</b>
              {order.delivery.slot && <div>Slot: {order.delivery.slot}</div>}
            </div>
          </div>
        </div>

        {/* timeline */}
        <div>
          <div className="eyebrow mb-3">Timeline</div>
          <Timeline events={order.timeline} />
        </div>
      </div>
    </Drawer>
  );
}

export function Timeline({ events }: { events: Order["timeline"] }) {
  return (
    <ol className="relative">
      {[...events].reverse().map((e, i, arr) => (
        <li key={i} className="relative flex gap-3 pb-3.5 last:pb-0">
          {i < arr.length - 1 && <span className="absolute left-[7px] top-5 h-[calc(100%-12px)] w-px bg-line" aria-hidden />}
          <span
            className={cn(
              "relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-surface ring-1",
              e.kind === "auto" ? "bg-violet ring-violet/40" : e.kind === "payment" ? "bg-good ring-good/40" : e.kind === "partner" ? "bg-warn ring-warn/40" : e.kind === "message" ? "bg-info ring-info/40" : "bg-primary ring-primary/40",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-ink">{e.text}</div>
            <div className="text-[11.5px] text-ink-muted">{dateTime(e.at)}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
