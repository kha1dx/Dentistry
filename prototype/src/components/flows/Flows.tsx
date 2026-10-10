import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock3, FileText, MessageSquareText, Search, Send, ShoppingBag, Sparkles, Wrench } from "lucide-react";
import { BRAND, NOW } from "@/config/brand";
import { PRODUCTS, YEAR_LABEL, uni } from "@/data/catalog";
import type { Client, PaymentMethod } from "@/data/types";
import { cn } from "@/lib/cn";
import { addDays, dueLabel, money, shortDate, shortName } from "@/lib/format";
import { daysOverdue, invoiceStatus, outstanding } from "@/lib/metrics";
import { useStore, type Flow } from "@/store/useStore";
import { Avatar, Button, Input, Select, Textarea, Toggle } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/overlays";
import { ProductArt } from "@/components/art/ProductArt";

/** Renders whichever quick action is open. Lives once in the console layout. */
export function FlowHost() {
  const flow = useStore((s) => s.flow);
  const close = useStore((s) => s.closeFlow);
  if (!flow) return null;
  const key = JSON.stringify(flow);
  if (flow.kind === "payment") return <PaymentFlow key={key} flow={flow} onClose={close} />;
  if (flow.kind === "invoice") return <InvoiceFlow key={key} flow={flow} onClose={close} />;
  if (flow.kind === "order") return <OrderFlow key={key} flow={flow} onClose={close} />;
  return <RepairFlow key={key} flow={flow} onClose={close} />;
}

/* ------------------------------------------------------------- shared bits */

const METHODS: PaymentMethod[] = ["InstaPay", "Cash", "Vodafone Cash", "Card", "Bank transfer"];

function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: ReactNode }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
            value === o.id ? "border-ink bg-ink text-surface" : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
          )}
        >
          {value === o.id && <Check className="h-3.5 w-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[12px] font-extrabold text-primary-soft-ink">{n}</span>
        <span className="text-[14px] font-bold text-ink">{title}</span>
      </div>
      {children}
    </div>
  );
}

/** Pick a client by name or phone. Shows a short list of likely clients before anything is typed. */
function ClientPicker({ value, onChange, suggest }: { value?: string; onChange: (id: string) => void; suggest: string[] }) {
  const clients = useStore((s) => s.clients);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(!value);
  const selected = clients.find((c) => c.id === value);
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return suggest.map((id) => clients.find((c) => c.id === id)).filter((c): c is Client => !!c).slice(0, 5);
    const digits = t.replace(/\D/g, "");
    return clients.filter((c) => c.name.toLowerCase().includes(t) || (digits.length > 2 && c.phone.replace(/\D/g, "").includes(digits))).slice(0, 6);
  }, [q, clients, suggest]);

  if (selected && !editing)
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3">
        <Avatar name={selected.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-bold text-ink">{selected.name}</div>
          <div className="truncate text-[12.5px] font-medium text-ink-muted">
            {uni(selected.universityId).short} · {YEAR_LABEL[selected.year]} · {selected.phone}
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Change
        </Button>
      </div>
    );

  return (
    <div className="rounded-2xl border border-line">
      <div className="relative border-b border-line">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          autoFocus
          id="client-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a name or phone number"
          className="h-11 w-full rounded-t-2xl bg-transparent pl-10 pr-3 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </div>
      <ul className="p-1.5">
        {!q && matches.length > 0 && <li className="px-2.5 pb-1 pt-1 text-[12px] font-semibold text-ink-muted">Suggested</li>}
        {matches.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                onChange(c.id);
                setEditing(false);
                setQ("");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-surface-3"
            >
              <Avatar name={c.name} size={30} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-ink">{c.name}</span>
                <span className="block truncate text-[12px] text-ink-muted">
                  {uni(c.universityId).short} · {YEAR_LABEL[c.year]}
                </span>
              </span>
              <span className="shrink-0 text-[12px] text-ink-muted">{c.phone}</span>
            </button>
          </li>
        ))}
        {!matches.length && <li className="px-3 py-4 text-center text-[13px] text-ink-muted">No client matches “{q}”</li>}
      </ul>
    </div>
  );
}

function useRecentClients() {
  const orders = useStore((s) => s.orders);
  return useMemo(() => {
    const ids: string[] = [];
    for (let i = orders.length - 1; i >= 0 && ids.length < 5; i--) if (!ids.includes(orders[i].clientId)) ids.push(orders[i].clientId);
    return ids;
  }, [orders]);
}

/* ---------------------------------------------------------- record payment */

function PaymentFlow({ flow, onClose }: { flow: Extract<Flow, { kind: "payment" }>; onClose: () => void }) {
  const invoices = useStore((s) => s.invoices);
  const record = useStore((s) => s.recordPayment);
  const start = invoices.find((i) => i.id === flow.invoiceId);
  const [clientId, setClientId] = useState(flow.clientId ?? start?.clientId);
  const unpaid = useMemo(() => invoices.filter((i) => i.clientId === clientId && outstanding(i) > 0).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime()), [invoices, clientId]);
  const [invoiceId, setInvoiceId] = useState<string | undefined>(start?.id ?? unpaid[0]?.id);
  const inv = invoices.find((i) => i.id === invoiceId && i.clientId === clientId) ?? unpaid[0];
  const left = inv ? outstanding(inv) : 0;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("InstaPay");
  const [receipt, setReceipt] = useState(true);
  const value = Math.min(left, Number(amount) || left);

  // who owes money, oldest first, for the empty search
  const owing = useMemo(() => {
    const ids: string[] = [];
    for (const i of [...invoices].filter((x) => outstanding(x) > 0).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())) if (!ids.includes(i.clientId)) ids.push(i.clientId);
    return ids;
  }, [invoices]);

  return (
    <Modal
      open
      onClose={onClose}
      title="Record a payment"
      width={560}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!inv || !value}
            onClick={() => {
              record(inv!.id, value, method, receipt);
              onClose();
            }}
          >
            Record {value ? money(value) : "payment"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 p-5">
        <Step n={1} title="Who paid?">
          <ClientPicker
            value={clientId}
            suggest={owing}
            onChange={(id) => {
              setClientId(id);
              setInvoiceId(undefined);
              setAmount("");
            }}
          />
        </Step>
        {clientId && (
          <Step n={2} title="For which invoice?">
            {unpaid.length ? (
              <ul className="grid grid-cols-1 gap-2">
                {unpaid.map((i) => {
                  const od = daysOverdue(i);
                  const on = inv?.id === i.id;
                  return (
                    <li key={i.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setInvoiceId(i.id);
                          setAmount("");
                        }}
                        className={cn("flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors", on ? "border-primary bg-primary-soft/50" : "border-line hover:border-line-strong")}
                      >
                        <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", on ? "border-primary bg-primary text-primary-ink" : "border-line-strong")}>{on && <Check className="h-3 w-3" />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-bold text-ink">
                            {i.id} · {i.ref || i.note}
                          </span>
                          <span className={cn("block text-[12.5px] font-medium", invoiceStatus(i) === "overdue" ? "text-bad" : "text-ink-muted")}>
                            {od > 0 ? `${od} days overdue` : od === 0 ? "Due today" : `Due ${shortDate(i.dueAt)}`}
                            {i.paid > 0 && ` · ${money(i.paid)} already paid`}
                          </span>
                        </span>
                        <span className="shrink-0 text-[14px] font-extrabold text-ink tnum">{money(outstanding(i))}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl bg-surface-2 px-4 py-3 text-[13px] font-medium text-ink-2">Nothing unpaid for this client.</p>
            )}
          </Step>
        )}
        {inv && (
          <Step n={3} title="How much, and how?">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-ink-muted">EGP</span>
                  <Input id="pay-amount" inputMode="numeric" className="h-11 pl-12 text-[16px] font-bold tnum" placeholder={String(left)} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Amount" />
                </div>
                <Button size="sm" variant="ghost" onClick={() => setAmount(String(Math.round(left / 2)))}>
                  Half
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAmount("")}>
                  Full
                </Button>
              </div>
              <Chips value={method} onChange={setMethod} options={METHODS.map((m) => ({ id: m, label: m }))} />
              <label className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3.5 py-3">
                <span className="text-[13.5px] font-semibold text-ink">Send a receipt on WhatsApp</span>
                <Toggle checked={receipt} onChange={setReceipt} label="Send a receipt on WhatsApp" />
              </label>
              {value < left && <p className="text-[12.5px] font-medium text-ink-muted">{money(left - value)} will stay open. Reminders keep going for the rest.</p>}
            </div>
          </Step>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------- new invoice */

function InvoiceFlow({ flow, onClose }: { flow: Extract<Flow, { kind: "invoice" }>; onClose: () => void }) {
  const create = useStore((s) => s.createInvoice);
  const recent = useRecentClients();
  const [clientId, setClientId] = useState(flow.clientId);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState<"0" | "7" | "14" | "30">("7");
  const [send, setSend] = useState(true);
  const ok = clientId && note.trim() && Number(amount) > 0;
  return (
    <Modal
      open
      onClose={onClose}
      title="New invoice"
      width={560}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon={<FileText className="h-4 w-4" />}
            disabled={!ok}
            onClick={() => {
              create({ clientId: clientId!, note: note.trim(), amount: Number(amount), dueInDays: Number(due), send });
              onClose();
            }}
          >
            {send ? "Create and send" : "Create invoice"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 p-5">
        <p className="rounded-2xl bg-primary-soft px-4 py-3 text-[13px] font-medium text-ink-2">Orders and repairs get their invoice automatically. Use this for anything else.</p>
        <Step n={1} title="Who is it for?">
          <ClientPicker value={clientId} onChange={setClientId} suggest={recent} />
        </Step>
        <Step n={2} title="What for, and how much?">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
            <Input id="invoice-note" placeholder="e.g. Loupes 3.5x, first instalment" value={note} onChange={(e) => setNote(e.target.value)} aria-label="What for" />
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-ink-muted">EGP</span>
              <Input id="invoice-amount" inputMode="numeric" className="pl-12 font-bold tnum" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} aria-label="Amount" />
            </div>
          </div>
        </Step>
        <Step n={3} title="When is it due?">
          <Chips
            value={due}
            onChange={setDue}
            options={[
              { id: "0", label: "Today" },
              { id: "7", label: "In 7 days" },
              { id: "14", label: "In 14 days" },
              { id: "30", label: "In 30 days" },
            ]}
          />
          <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3.5 py-3">
            <span>
              <span className="block text-[13.5px] font-semibold text-ink">Send it on WhatsApp now</span>
              <span className="block text-[12.5px] text-ink-muted">Reminders go out on {shortDate(addDays(NOW, Number(due)))}, then after 7 and 14 days, and stop once it's paid.</span>
            </span>
            <Toggle checked={send} onChange={setSend} label="Send it on WhatsApp now" />
          </label>
        </Step>
      </div>
    </Modal>
  );
}

/* --------------------------------------------------------------- new order */

const SAMPLE = "Hi! I need 2 K-files 15-40, the rubber dam kit and one set of typodont teeth please. Delivery to Ain Shams Saturday?";
const RULES: [RegExp, string][] = [
  [/k-?files?/, "p33"],
  [/rubber dam/, "p36"],
  [/typodont teeth|replacement teeth/, "p23"],
  [/typodont(?! teeth)/, "p22"],
  [/micromotor|strong/, "p04"],
  [/diamond bur|burs?/, "p18"],
  [/composite kit|composite/, "p26"],
  [/alginate/, "p28"],
  [/loupes?/, "p38"],
  [/coat/, "p39"],
  [/gutta|gp/, "p34"],
  [/paper points/, "p35"],
  [/handpiece|turbine/, "p01"],
];

function detectItems(msg: string) {
  const t = msg.toLowerCase();
  const out: { productId: string; qty: number }[] = [];
  for (const [re, id] of RULES) {
    const m = t.match(re);
    if (!m || out.some((o) => o.productId === id)) continue;
    const before = t.slice(Math.max(0, (m.index ?? 0) - 8), m.index);
    const qm = before.match(/(\d+)\s*(x|×)?\s*$/) ?? before.match(/(\d+)\s+\w*\s*$/);
    out.push({ productId: id, qty: qm ? Math.min(10, Number(qm[1])) : 1 });
  }
  return out;
}

function OrderFlow({ flow, onClose }: { flow: Extract<Flow, { kind: "order" }>; onClose: () => void }) {
  const products = useStore((s) => s.products);
  const clients = useStore((s) => s.clients);
  const create = useStore((s) => s.createOrder);
  const post = useStore((s) => s.postToChat);
  const nav = useNavigate();
  const recent = useRecentClients();
  const [msg, setMsg] = useState(flow.message ?? (flow.convId ? "" : SAMPLE));
  const [clientId, setClientId] = useState(flow.clientId ?? (flow.convId ? undefined : "c002"));
  const detected = useMemo(() => detectItems(msg), [msg]);
  const total = detected.reduce((s, d) => s + (products.find((p) => p.id === d.productId)?.price ?? 0) * d.qty, 0);
  const c = clients.find((x) => x.id === clientId);
  return (
    <Modal
      open
      onClose={onClose}
      title={flow.convId ? "New order from this chat" : "New order"}
      width={600}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon={<ShoppingBag className="h-4 w-4" />}
            disabled={!detected.length || !clientId}
            onClick={() => {
              const id = create({ clientId: clientId!, items: detected, channel: "whatsapp", promisedAt: addDays(NOW, 2) });
              onClose();
              if (flow.convId) {
                const list = detected.map((d) => `${d.qty > 1 ? `${d.qty}× ` : ""}${shortName(products.find((p) => p.id === d.productId)!.name)}`).join(", ");
                post(flow.convId, `Here's your quote ${id}: ${list}. Total ${money(total)}, delivered to ${c ? uni(c.universityId).campus : "your campus"}. Reply OK and I'll book it.`, id);
              } else nav(`/admin/orders?o=${id}`);
            }}
          >
            Create and send quote
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 p-5">
        <Step n={1} title="Client">
          <ClientPicker value={clientId} onChange={setClientId} suggest={recent} />
        </Step>
        <Step n={2} title={flow.convId ? "What they asked for" : "Paste what they wrote"}>
          <div className="relative">
            <MessageSquareText className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <Textarea id="order-message" rows={3} className="pl-9" value={msg} onChange={(e) => setMsg(e.target.value)} />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Products and quantities are picked out for you.
          </p>
        </Step>
        <Step n={3} title="Check the items">
          <ul className="overflow-hidden rounded-2xl border border-line">
            {detected.map((d) => {
              const p = products.find((x) => x.id === d.productId)!;
              return (
                <li key={d.productId} className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-0">
                  <ProductArt kind={p.art} category={p.category} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-ink">{p.name}</span>
                    <span className={cn("text-[12px]", p.stock < d.qty ? "font-semibold text-bad" : "text-ink-muted")}>{p.stock < d.qty ? `Only ${p.stock} in stock` : `${p.stock} in stock`}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-ink-2 tnum">
                    {d.qty} × {money(p.price)}
                  </span>
                </li>
              );
            })}
            {!detected.length && <li className="px-3 py-4 text-center text-[13px] text-ink-muted">No products recognised yet. Type a product name.</li>}
          </ul>
          <div className="mt-2 flex justify-between text-[14px]">
            <span className="font-medium text-ink-muted">Delivery to {c ? uni(c.universityId).campus : "campus"}</span>
            <span className="font-extrabold text-ink tnum">{money(total)}</span>
          </div>
        </Step>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------- new repair */

function RepairFlow({ flow, onClose }: { flow: Extract<Flow, { kind: "repair" }>; onClose: () => void }) {
  const submit = useStore((s) => s.submitRepair);
  const post = useStore((s) => s.postToChat);
  const nav = useNavigate();
  const recent = useRecentClients();
  const [clientId, setClientId] = useState(flow.clientId ?? (flow.convId ? undefined : "c002"));
  const [productId, setProductId] = useState("p01");
  const [issue, setIssue] = useState("");
  const [loaner, setLoaner] = useState(true);
  const devices = PRODUCTS.filter((p) => p.serviceable);
  return (
    <Modal
      open
      onClose={onClose}
      title="New repair"
      width={560}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon={<Wrench className="h-4 w-4" />}
            disabled={!clientId}
            onClick={() => {
              const id = submit({ clientId: clientId!, productId, issue: issue || "To be diagnosed", handover: "picked up on campus", loaner, photos: 0 });
              onClose();
              if (flow.convId) post(flow.convId, `Repair ${id} is booked. You can follow it here: ${BRAND.trackingDomain}/${id}`, id);
              else nav(`/admin/repairs?r=${id}`);
            }}
          >
            Create and send tracking link
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 p-5">
        <Step n={1} title="Client">
          <ClientPicker value={clientId} onChange={setClientId} suggest={recent} />
        </Step>
        <Step n={2} title="Which device, and what's wrong?">
          <div className="grid grid-cols-1 gap-3">
            <Select value={productId} onChange={(e) => setProductId(e.target.value)} aria-label="Device">
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.brand} · {d.name}
                </option>
              ))}
            </Select>
            <Textarea id="repair-issue" rows={2} placeholder="e.g. bur slips, noisy turbine" value={issue} onChange={(e) => setIssue(e.target.value)} aria-label="What's wrong" />
          </div>
        </Step>
        <Step n={3} title="Loaner">
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3.5 py-3">
            <span>
              <span className="block text-[13.5px] font-semibold text-ink">Give a loaner while it's away</span>
              <span className="text-[12.5px] text-ink-muted">3 of 4 loaner turbines are out right now</span>
            </span>
            <Toggle checked={loaner} onChange={setLoaner} label="Give a loaner" />
          </label>
        </Step>
      </div>
    </Modal>
  );
}


/* ------------------------------------------------------ late: send new date */

const atFour = (days: number) => {
  const d = addDays(NOW, days);
  d.setHours(16, 0, 0, 0);
  return d;
};

export const lateTitle = (what: string, promised: Date) => {
  const l = dueLabel(promised);
  return l === "Today" ? `This ${what} was due earlier today` : `This ${what} is ${l}`;
};

/** Shown on anything past its promised date: pick a new date and the client is told in one tap. */
export function NewDatePrompt({ title, who, onSend, extra }: { title: string; who: string; onSend: (d: Date) => void; extra?: ReactNode }) {
  const [days, setDays] = useState<"1" | "2" | "3">("1");
  const label = (n: number) => (n === 1 ? "Tomorrow" : atFour(n).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }));
  return (
    <div className="rounded-2xl border border-bad/25 bg-bad-soft p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-bad">
          <Clock3 className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <div className="text-[15px] font-extrabold text-ink">{title}</div>
          <div className="text-[13px] font-medium text-ink-2">Pick a new date. {who} gets a short apology and the date on WhatsApp.</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Chips
          value={days}
          onChange={setDays}
          options={[
            { id: "1", label: label(1) },
            { id: "2", label: label(2) },
            { id: "3", label: label(3) },
          ]}
        />
        <Button variant="primary" size="sm" className="h-9" icon={<Send className="h-3.5 w-3.5" />} onClick={() => onSend(atFour(Number(days)))}>
          Send new date
        </Button>
        {extra}
      </div>
    </div>
  );
}
