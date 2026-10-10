import { useMemo } from "react";
import { create } from "zustand";
import { NOW } from "@/config/brand";
import { PRODUCTS, kit, product, uni } from "@/data/catalog";
import {
  AUTOMATIONS,
  CAMPAIGNS,
  CLIENTS,
  CONVERSATIONS,
  INVOICES,
  NOTIFICATIONS,
  ORDERS,
  REPAIRS,
  TEMPLATES,
  orderTotal,
} from "@/data/seed";
import type {
  Automation,
  Campaign,
  Client,
  Conversation,
  Invoice,
  LineItem,
  Notification,
  Order,
  OrderStage,
  PaymentMethod,
  Product,
  Repair,
  RepairStage,
  Template,
  YearOfStudy,
} from "@/data/types";
import { addDays, addMinutes, money } from "@/lib/format";

/* The prototype's clock: real elapsed time is added to the fixed NOW so new events sort correctly. */
const BOOT = Date.now();
export const clock = () => new Date(NOW.getTime() + (Date.now() - BOOT));

export interface CartLine {
  key: string; // productId or kit:<id>
  qty: number;
}

export interface Toast {
  id: number;
  text: string;
  tone?: "good" | "info" | "warn";
}

/** The quick actions that can be opened from anywhere in the console, already filled in. */
export type Flow =
  | { kind: "payment"; clientId?: string; invoiceId?: string }
  | { kind: "invoice"; clientId?: string }
  | { kind: "order"; clientId?: string; message?: string; convId?: string }
  | { kind: "repair"; clientId?: string; convId?: string };

export const ORDER_STAGES: { id: OrderStage; label: string; hint: string }[] = [
  { id: "new", label: "New request", hint: "Not answered or priced yet" },
  { id: "quoted", label: "Quoted", hint: "Waiting for the client to confirm" },
  { id: "confirmed", label: "Confirmed", hint: "Invoice sent, preparing" },
  { id: "sourcing", label: "Sourcing", hint: "Waiting on a supplier" },
  { id: "ready", label: "Ready", hint: "Packed, slot offered" },
  { id: "out", label: "Out for delivery", hint: "On the way" },
  { id: "delivered", label: "Delivered", hint: "Done" },
];

export const REPAIR_STAGES: { id: RepairStage; label: string; short: string; client: string }[] = [
  { id: "received", label: "Received", short: "Received", client: "We have your device" },
  { id: "at_partner", label: "At service partner", short: "At partner", client: "At the service centre" },
  { id: "diagnosis", label: "Diagnosis", short: "Diagnosis", client: "Being diagnosed" },
  { id: "approval", label: "Awaiting approval", short: "Approval", client: "Waiting for your OK on the price" },
  { id: "repairing", label: "Repairing", short: "Repairing", client: "Being repaired" },
  { id: "qc", label: "Back with us", short: "Quality check", client: "Tested and ready to return" },
  { id: "returned", label: "Returned", short: "Returned", client: "Back in your hands" },
];

const AUTO_MSG: Partial<Record<OrderStage, string>> = {
  confirmed: "Order confirmation + invoice sent (auto)",
  ready: "Ready notice + delivery slots sent (auto)",
  out: "On-the-way message sent (auto)",
  delivered: "Rating request scheduled for tomorrow (auto)",
};

interface State {
  clients: Client[];
  orders: Order[];
  repairs: Repair[];
  invoices: Invoice[];
  conversations: Conversation[];
  automations: Automation[];
  campaigns: Campaign[];
  templates: Template[];
  notifications: Notification[];
  products: Product[];
  toasts: Toast[];
  cart: CartLine[];
  /** the signed-in client on the storefront demo */
  meId: string;
  flow: Flow | null;

  openFlow: (f: Flow) => void;
  closeFlow: () => void;

  toast: (text: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;

  setOrderStage: (id: string, stage: OrderStage) => void;
  createOrder: (p: { clientId: string; items: { productId: string; qty: number }[]; channel: Order["channel"]; promisedAt: Date }) => string;
  recordPayment: (invoiceOrRef: string, amount: number, method: PaymentMethod, receipt?: boolean) => void;
  createInvoice: (p: { clientId: string; note: string; amount: number; dueInDays: number; send: boolean }) => string;
  sendReminder: (invoiceId: string) => void;
  delayOrder: (id: string, promisedAt: Date) => void;
  delayRepair: (id: string, promisedAt: Date) => void;
  postToChat: (convId: string, text: string, link?: string) => void;
  setRepairStage: (id: string, stage: RepairStage) => void;
  sendEstimate: (id: string, partnerCost: number, price: number) => void;
  approveRepair: (id: string) => void;
  sendMessage: (convId: string, text: string) => void;
  closeConversation: (convId: string) => void;
  toggleAutomation: (id: string) => void;
  applyPrices: (changes: { id: string; price: number }[]) => void;
  markAllRead: () => void;
  addCampaign: (c: Campaign) => void;

  addToCart: (key: string, qty?: number) => void;
  setCartQty: (key: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: (p: { name: string; phone: string; universityId: string; year: YearOfStudy; delivery: Order["delivery"]; method: PaymentMethod; notes?: string }) => string;
  submitRepair: (p: { productId: string; issue: string; handover: string; loaner: boolean; photos: number; clientId?: string }) => string;
  startChat: (text: string) => string;
  clientSays: (convId: string, text: string) => void;
  autoReply: (convId: string, text: string) => void;
  requestCall: (slot: string, topic: string) => void;
}

let toastId = 0;

export const useStore = create<State>((set, get) => ({
  clients: CLIENTS,
  orders: ORDERS,
  repairs: REPAIRS,
  invoices: INVOICES,
  conversations: CONVERSATIONS,
  automations: AUTOMATIONS,
  campaigns: CAMPAIGNS,
  templates: TEMPLATES,
  notifications: NOTIFICATIONS,
  products: PRODUCTS,
  toasts: [],
  cart: [
    { key: "kit:k4", qty: 1 },
    { key: "p03", qty: 1 },
  ],
  meId: "c003",
  flow: null,

  openFlow: (flow) => set({ flow }),
  closeFlow: () => set({ flow: null }),

  toast: (text, tone = "good") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, text, tone }] }));
    setTimeout(() => get().dismissToast(id), 3800);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  setOrderStage: (id, stage) => {
    const now = clock();
    const auto = get().automations;
    const autoOn = (aid: string) => auto.find((a) => a.id === aid)?.enabled;
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== id || o.stage === stage) return o;
        const label = ORDER_STAGES.find((x) => x.id === stage)?.label ?? stage;
        const tl = [...o.timeline, { at: now, kind: "status" as const, text: `Moved to ${label}` }];
        const map: Partial<Record<OrderStage, string>> = { confirmed: "a2", ready: "a3", out: "a4", delivered: "a5" };
        const aid = map[stage];
        if (aid && autoOn(aid) && AUTO_MSG[stage]) tl.push({ at: addMinutes(now, 0.1), kind: "auto", text: AUTO_MSG[stage]! });
        return { ...o, stage, deliveredAt: stage === "delivered" ? now : o.deliveredAt, timeline: tl };
      }),
    }));
    const msg = { confirmed: "Confirmation and invoice sent", ready: "Client notified: delivery slots offered", out: "Client notified: on the way", delivered: "Marked delivered. Rating request goes out tomorrow" } as Partial<Record<OrderStage, string>>;
    get().toast(`${id} · ${msg[stage] ?? "Stage updated"}`);
  },

  createOrder: ({ clientId, items, channel, promisedAt }) => {
    const now = clock();
    const s = get();
    const c = s.clients.find((x) => x.id === clientId)!;
    const n = Math.max(...s.orders.map((o) => Number(o.id.slice(3)))) + 1;
    const id = `CU-${n}`;
    const lines: LineItem[] = items.map((i) => {
      const p = s.products.find((x) => x.id === i.productId)!;
      return { productId: p.id, name: p.name, qty: i.qty, price: p.price, cost: p.cost };
    });
    const order: Order = {
      id,
      clientId,
      createdAt: now,
      promisedAt,
      stage: "quoted",
      channel,
      items: lines,
      deliveryFee: 0,
      discount: 0,
      paid: 0,
      delivery: { type: "campus", place: uni(c.universityId).campus },
      timeline: [
        { at: now, kind: "status", text: "Order created from chat" },
        { at: addMinutes(now, 0.1), kind: "auto", text: "Quote sent on WhatsApp (auto)" },
      ],
    };
    set({ orders: [...s.orders, order] });
    get().toast(`${id} created and quote sent to ${c.name.split(" ")[0]}`);
    return id;
  },

  recordPayment: (ref, amount, method, receipt = true) => {
    const now = clock();
    set((s) => {
      const inv = s.invoices.find((i) => i.id === ref || i.ref === ref);
      const invoices = inv
        ? s.invoices.map((i) => (i === inv ? { ...i, paid: Math.min(i.amount, i.paid + amount), method, paidAt: i.paid + amount >= i.amount ? now : i.paidAt } : i))
        : s.invoices;
      const orderRef = inv?.ref ?? ref;
      const orders = s.orders.map((o) =>
        o.id === orderRef
          ? { ...o, paid: Math.min(orderTotal(o), o.paid + amount), paymentMethod: method, timeline: [...o.timeline, { at: now, kind: "payment" as const, text: `EGP ${amount.toLocaleString()} received via ${method}` }] }
          : o,
      );
      const repairs = s.repairs.map((r) => (r.id === orderRef ? { ...r, paid: Math.min(r.price ?? 0, r.paid + amount) } : r));
      return { invoices, orders, repairs };
    });
    get().toast(receipt ? `${money(amount)} recorded · receipt sent on WhatsApp` : `${money(amount)} recorded`);
  },

  createInvoice: ({ clientId, note, amount, dueInDays, send }) => {
    const now = clock();
    const s = get();
    const n = Math.max(...s.invoices.map((i) => Number(i.id.slice(4)))) + 1;
    const id = `INV-${n}`;
    const inv: Invoice = { id, clientId, ref: "", note, issuedAt: now, dueAt: addDays(now, dueInDays), amount, paid: 0, reminders: 0 };
    set({ invoices: [...s.invoices, inv] });
    const first = s.clients.find((c) => c.id === clientId)?.name.split(" ")[0] ?? "the client";
    get().toast(send ? `${id} sent to ${first} on WhatsApp · reminders scheduled` : `${id} saved`);
    return id;
  },

  sendReminder: (invoiceId) => {
    set((s) => ({ invoices: s.invoices.map((i) => (i.id === invoiceId ? { ...i, reminders: i.reminders + 1 } : i)) }));
    get().toast("Reminder sent with InstaPay details", "info");
  },

  delayOrder: (id, promisedAt) => {
    const now = clock();
    const day = promisedAt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id
          ? { ...o, promisedAt, timeline: [...o.timeline, { at: now, kind: "status" as const, text: `New delivery date: ${day}` }, { at: addMinutes(now, 0.1), kind: "auto" as const, text: "Apology and new date sent to the client (auto)" }] }
          : o,
      ),
    }));
    get().toast(`${id} · client told the new date: ${day}`);
  },

  delayRepair: (id, promisedAt) => {
    const now = clock();
    const day = promisedAt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
    set((s) => ({
      repairs: s.repairs.map((r) =>
        r.id === id
          ? { ...r, promisedAt, timeline: [...r.timeline, { at: now, kind: "status" as const, text: `New return date: ${day}` }, { at: addMinutes(now, 0.1), kind: "auto" as const, text: "Tracking page updated, client told the new date (auto)" }] }
          : r,
      ),
    }));
    get().toast(`${id} · client told the new date: ${day}`);
  },

  postToChat: (convId, text, link) => {
    const now = clock();
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId ? { ...c, status: "open", links: link ? [...(c.links ?? []), link] : c.links, messages: [...c.messages, { id: `m${now.getTime()}q`, from: "me", text, at: now }] } : c,
      ),
    }));
  },

  setRepairStage: (id, stage) => {
    const now = clock();
    set((s) => ({
      repairs: s.repairs.map((r) => {
        if (r.id !== id) return r;
        const label = REPAIR_STAGES.find((x) => x.id === stage)!.label;
        return {
          ...r,
          stage,
          stageSince: now,
          returnedAt: stage === "returned" ? now : r.returnedAt,
          loaner: stage === "returned" ? undefined : r.loaner,
          timeline: [...r.timeline, { at: now, kind: "status" as const, text: `Moved to ${label}` }, { at: addMinutes(now, 0.1), kind: "auto" as const, text: "Tracking page updated, client notified (auto)" }],
        };
      }),
    }));
    get().toast(`${id} · client sees the new status on their tracking page`);
  },

  sendEstimate: (id, partnerCost, price) => {
    const now = clock();
    set((s) => ({
      repairs: s.repairs.map((r) =>
        r.id === id
          ? { ...r, partnerCost, price, stage: "approval", stageSince: now, timeline: [...r.timeline, { at: now, kind: "auto" as const, text: `Approval request sent: EGP ${price.toLocaleString()} (auto)` }] }
          : r,
      ),
    }));
    get().toast("Estimate sent. The client can approve from WhatsApp or the tracking page", "info");
  },

  approveRepair: (id) => {
    const now = clock();
    set((s) => ({
      repairs: s.repairs.map((r) =>
        r.id === id ? { ...r, approved: true, stage: "repairing", stageSince: now, timeline: [...r.timeline, { at: now, kind: "message" as const, text: "Client approved the price" }, { at: addMinutes(now, 0.1), kind: "partner" as const, text: "Partner told to go ahead" }] } : r,
      ),
    }));
    get().toast("Approved. Partner told to start the repair");
  },

  sendMessage: (convId, text) => {
    const now = clock();
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === convId ? { ...c, status: "open", messages: [...c.messages, { id: `m${now.getTime()}`, from: "me", text, at: now }] } : c)),
    }));
  },

  closeConversation: (convId) => {
    set((s) => ({ conversations: s.conversations.map((c) => (c.id === convId ? { ...c, status: "closed" } : c)) }));
    get().toast("Conversation marked as resolved", "info");
  },

  toggleAutomation: (id) => {
    const a = get().automations.find((x) => x.id === id)!;
    set((s) => ({ automations: s.automations.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)) }));
    get().toast(`${a.name} ${a.enabled ? "paused" : "turned on"}`, "info");
  },

  applyPrices: (changes) => {
    const m = new Map(changes.map((c) => [c.id, c.price]));
    set((s) => ({ products: s.products.map((p) => (m.has(p.id) ? { ...p, price: m.get(p.id)! } : p)) }));
    get().toast(`${changes.length} prices updated · storefront and price list refreshed`);
  },

  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  addCampaign: (c) => {
    set((s) => ({ campaigns: [c, ...s.campaigns] }));
    get().toast(c.status === "scheduled" ? "Broadcast scheduled" : "Broadcast sent", "good");
  },

  /* ----------------------------------------------------------- storefront */

  addToCart: (key, qty = 1) => {
    set((s) => {
      const ex = s.cart.find((c) => c.key === key);
      return { cart: ex ? s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + qty } : c)) : [...s.cart, { key, qty }] };
    });
    const name = key.startsWith("kit:") ? kit(key.slice(4)).name : product(key).name;
    get().toast(`Added to your bag: ${name}`, "good");
  },
  setCartQty: (key, qty) => set((s) => ({ cart: qty <= 0 ? s.cart.filter((c) => c.key !== key) : s.cart.map((c) => (c.key === key ? { ...c, qty } : c)) })),
  clearCart: () => set({ cart: [] }),

  placeOrder: (p) => {
    const now = clock();
    const s = get();
    let client = s.clients.find((c) => c.phone.replace(/\s/g, "") === p.phone.replace(/\s/g, ""));
    const clients = [...s.clients];
    if (!client) {
      client = { id: `c${900 + clients.length}`, name: p.name || "New client", phone: p.phone, universityId: p.universityId, year: p.year, joinedAt: now, source: "Website", tags: ["New"] };
      clients.push(client);
    }
    const items: LineItem[] = [];
    for (const line of s.cart) {
      if (line.key.startsWith("kit:")) {
        const k = kit(line.key.slice(4));
        const raw = k.items.reduce((t, i) => t + product(i.productId).price * i.qty, 0);
        const f = k.price / raw;
        for (const i of k.items) {
          const pr = s.products.find((x) => x.id === i.productId)!;
          items.push({ productId: pr.id, name: pr.name, qty: i.qty * line.qty, price: Math.round((pr.price * f) / 5) * 5, cost: pr.cost });
        }
      } else {
        const pr = s.products.find((x) => x.id === line.key)!;
        items.push({ productId: pr.id, name: pr.name, qty: line.qty, price: pr.price, cost: pr.cost });
      }
    }
    const n = Math.max(...s.orders.map((o) => Number(o.id.slice(3)))) + 1;
    const id = `CU-${n}`;
    const order: Order = {
      id,
      clientId: client.id,
      createdAt: now,
      promisedAt: addDays(now, 2),
      stage: "new",
      channel: "webchat",
      items,
      deliveryFee: p.delivery.type === "courier" ? 75 : 0,
      discount: 0,
      paid: 0,
      delivery: p.delivery,
      notes: p.notes,
      timeline: [
        { at: now, kind: "status", text: "Order placed on the website" },
        { at: addMinutes(now, 0.1), kind: "auto", text: `Order received message sent (auto) · pay by ${p.method}` },
      ],
    };
    const conv: Conversation = {
      id: `cv${now.getTime()}`,
      clientId: client.id,
      channel: "webchat",
      status: "open",
      topic: `New website order ${id}`,
      links: [id],
      messages: [
        { id: `m${now.getTime()}`, from: "client", text: `I just placed order ${id} on the website (${items.length} items). Paying by ${p.method}.${p.notes ? ` Note: ${p.notes}` : ""}`, at: now },
        { id: `m${now.getTime() + 1}`, from: "auto", ack: true, text: `Thanks ${client.name.split(" ")[0]}! Your order ${id} is in. Youssef will confirm availability and delivery within 15 minutes.`, at: addMinutes(now, 0.1) },
      ],
    };
    set({
      clients,
      orders: [...s.orders, order],
      conversations: [conv, ...s.conversations],
      cart: [],
      notifications: [{ id: `n${now.getTime()}`, at: now, text: `New website order ${id} from ${client.name}`, tone: "good", to: "/admin/orders", read: false }, ...s.notifications],
    });
    return id;
  },

  submitRepair: (p) => {
    const now = clock();
    const s = get();
    const me = s.clients.find((c) => c.id === (p.clientId ?? s.meId))!;
    const pr = product(p.productId);
    const n = Math.max(...s.repairs.map((r) => Number(r.id.slice(3)))) + 1;
    const id = `RP-${n}`;
    const rep: Repair = {
      id,
      clientId: me.id,
      device: pr.name,
      brand: pr.brand,
      art: pr.art,
      serial: "To be checked",
      issue: p.issue || "Not described",
      receivedAt: now,
      promisedAt: addDays(now, 6),
      stage: "received",
      stageSince: now,
      partnerId: pr.brand === "Woodpecker" ? "r2" : pr.art === "micromotor" ? "r4" : "r3",
      warranty: false,
      paid: 0,
      loaner: p.loaner ? "Requested" : undefined,
      timeline: [
        { at: now, kind: "status", text: p.clientId ? `Picked up · ${p.handover}` : `Repair requested online · ${p.handover}` },
        { at: addMinutes(now, 0.1), kind: "auto", text: "Tracking link sent (auto)" },
      ],
    };
    set({
      repairs: [...s.repairs, rep],
      notifications: [{ id: `n${now.getTime()}`, at: now, text: `Repair request ${id}: ${pr.name} (${me.name})`, tone: "info", to: "/admin/repairs", read: false }, ...s.notifications],
    });
    return id;
  },

  startChat: (text) => {
    const now = clock();
    const s = get();
    const id = `cv${now.getTime()}`;
    const conv: Conversation = {
      id,
      clientId: s.meId,
      channel: "webchat",
      status: "open",
      topic: "Website chat",
      messages: [{ id: `m${now.getTime()}`, from: "client", text, at: now }],
    };
    set({
      conversations: [conv, ...s.conversations],
      notifications: [{ id: `n${now.getTime()}`, at: now, text: `Website chat: “${text.slice(0, 48)}”`, tone: "info", to: `/admin/inbox?c=${id}`, read: false }, ...s.notifications],
    });
    return id;
  },

  clientSays: (convId, text) => {
    const now = clock();
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === convId ? { ...c, status: "open", messages: [...c.messages, { id: `m${now.getTime()}`, from: "client", text, at: now }] } : c)),
    }));
  },

  autoReply: (convId, text) => {
    const now = clock();
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, { id: `m${now.getTime()}a`, from: "auto", ack: true, text, at: now }] } : c)),
    }));
  },

  requestCall: (slot, topic) => {
    const now = clock();
    const s = get();
    const id = `cv${now.getTime()}`;
    set({
      conversations: [
        { id, clientId: s.meId, channel: "call", status: "open", topic: `Call back requested · ${slot}`, messages: [{ id: `m${now.getTime()}`, from: "client", text: `Please call me ${slot}. Topic: ${topic}`, at: now }] },
        ...s.conversations,
      ],
      notifications: [{ id: `n${now.getTime()}`, at: now, text: `Call-back requested for ${slot}`, tone: "warn", to: `/admin/inbox?c=${id}`, read: false }, ...s.notifications],
    });
  },
}));

/* ----------------------------------------------------------------- helpers */

export const useClientMap = () => {
  const clients = useStore((s) => s.clients);
  return useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
};

export const clientName = (clients: Client[], id?: string) => clients.find((c) => c.id === id)?.name ?? "Unknown";

export function cartLines(cart: CartLine[], products: Product[]) {
  return cart.map((c) => {
    if (c.key.startsWith("kit:")) {
      const k = kit(c.key.slice(4));
      return { ...c, name: k.name, sub: `Kit · ${k.items.length} items`, price: k.price, art: "kit" as const };
    }
    const p = products.find((x) => x.id === c.key)!;
    return { ...c, name: p.name, sub: p.brand, price: p.price, art: p.art };
  });
}

export const campusFor = (universityId: string) => uni(universityId).campus;
