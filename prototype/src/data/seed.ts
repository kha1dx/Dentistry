import { NOW } from "@/config/brand";
import { addDays, addHours, addMinutes } from "@/lib/format";
import { rng } from "@/lib/random";
import { KITS, PARTNERS, PRODUCTS, REQUIREMENTS, kit, product, uni } from "./catalog";
import type {
  Automation,
  Campaign,
  Channel,
  Client,
  Conversation,
  Invoice,
  LineItem,
  Message,
  Notification,
  Order,
  OrderStage,
  PaymentMethod,
  Repair,
  RepairStage,
  Template,
  TimelineEvent,
  YearOfStudy,
} from "./types";

const r = rng(20261009);

/* ------------------------------------------------------------------ clients */

const FEMALE = ["Mariam", "Nour", "Salma", "Farida", "Habiba", "Malak", "Jana", "Hana", "Yasmin", "Laila", "Rana", "Aya", "Menna", "Sara", "Nada", "Reem", "Dalia", "Rawan", "Lojain", "Tasneem"];
const MALE = ["Omar", "Ahmed", "Mohamed", "Ali", "Karim", "Mostafa", "Hassan", "Seif", "Ziad", "Adham", "Khaled", "Amr", "Tarek", "Hazem", "Marwan", "Abdelrahman", "Yahia", "Hamza", "Mazen", "Ibrahim"];
const LAST = ["Hassan", "Mahmoud", "Ibrahim", "Mostafa", "Saeed", "Fawzy", "El-Sayed", "Abdallah", "Kamal", "Farouk", "Nabil", "Shawky", "Ragab", "Hegazy", "Lotfy", "Mansour", "Gaber", "Zaki", "Salem", "Ashraf", "Fathy", "Helmy", "Ezzat", "Samir", "Badawy", "Sherif", "Naguib", "Wahba"];

const phone = () => `+20 1${r.pick(["0", "1", "2", "5"])}${r.int(0, 9)} ${r.int(100, 999)} ${r.int(1000, 9999)}`;

const curatedClients: Client[] = [
  { id: "c001", name: "Nour Hassan", phone: "+20 101 448 2290", universityId: "cu", year: 2, joinedAt: new Date(2025, 9, 2), source: "Instagram", tags: [] },
  { id: "c002", name: "Omar Farouk", phone: "+20 112 903 5561", universityId: "asu", year: 3, joinedAt: new Date(2025, 1, 11), source: "Referral", tags: [] },
  { id: "c003", name: "Salma Ibrahim", phone: "+20 106 221 8743", universityId: "fue", year: 4, joinedAt: new Date(2024, 9, 14), source: "Website", tags: ["Repair client"] },
  { id: "c004", name: "Ziad Mahmoud", phone: "+20 128 554 0192", universityId: "cu", year: 3, joinedAt: new Date(2024, 10, 3), source: "Referral", tags: [] },
  { id: "c005", name: "Habiba Kamal", phone: "+20 100 731 6625", universityId: "cu", year: 2, joinedAt: new Date(2025, 8, 28), source: "Class rep", tags: [] },
  { id: "c006", name: "Karim Saeed", phone: "+20 115 662 3018", universityId: "bue", year: 5, joinedAt: new Date(2024, 9, 20), source: "Campus", tags: ["VIP"] },
  { id: "c007", name: "Mariam Abdallah", phone: "+20 109 330 7716", universityId: "asu", year: 3, joinedAt: new Date(2024, 9, 6), source: "Referral", tags: ["Class rep", "VIP"], notes: "Class rep for Ain Shams 3rd year. Collects the group order every term. Prefers voice notes." },
  { id: "c008", name: "Malak Zaki", phone: "+20 122 845 1179", universityId: "msa", year: 4, joinedAt: new Date(2025, 2, 2), source: "Instagram", tags: [] },
  { id: "c009", name: "Seif Nabil", phone: "+20 111 207 4436", universityId: "azhar", year: 6, joinedAt: new Date(2024, 10, 18), source: "WhatsApp", tags: [] },
  { id: "c010", name: "Farida Mansour", phone: "+20 127 418 9902", universityId: "fue", year: 2, joinedAt: new Date(2025, 8, 30), source: "Website", tags: [] },
  { id: "c011", name: "Adham Ragab", phone: "+20 102 694 3381", universityId: "miu", year: 4, joinedAt: new Date(2024, 11, 9), source: "Instagram", tags: ["Late payer"], notes: "Pays in instalments. Agreed to clear balance by end of October." },
  { id: "c012", name: "Yasmin Helmy", phone: "+20 106 880 1254", universityId: "cu", year: 5, joinedAt: new Date(2024, 8, 29), source: "Referral", tags: ["VIP", "Referrer"], notes: "Referred 9 classmates. Give priority on loupes restock." },
];

function genClients(): Client[] {
  const list: Client[] = [...curatedClients];
  const uniWeights = [["cu", 26], ["asu", 22], ["azhar", 12], ["fue", 14], ["bue", 9], ["msa", 10], ["miu", 7]] as const;
  const yearWeights = [[1, 10], [2, 26], [3, 25], [4, 18], [5, 13], [6, 8]] as const;
  const used = new Set(list.map((c) => c.name));
  for (let i = list.length; i < 430; i++) {
    let name = "";
    do {
      name = `${r.chance(0.58) ? r.pick(FEMALE) : r.pick(MALE)} ${r.pick(LAST)}`;
    } while (used.has(name) && used.size < 900);
    used.add(name);
    // more joins around term starts
    const monthOffsets = [[0, 9], [1, 4], [4, 6], [5, 3], [11, 6], [12, 12], [13, 5], [16, 7], [17, 3], [23, 11], [24, 6], [8, 2], [20, 2]] as const;
    const mo = r.weighted(monthOffsets);
    const joinedAt = new Date(2024, 8 + mo, r.int(1, 28), r.int(9, 22), r.int(0, 59));
    if (joinedAt > NOW) joinedAt.setTime(addDays(NOW, -r.int(1, 8)).getTime());
    const tags: string[] = [];
    if (r.chance(0.03)) tags.push("Late payer");
    if (r.chance(0.04)) tags.push("Referrer");
    list.push({
      id: `c${String(i + 1).padStart(3, "0")}`,
      name,
      phone: phone(),
      universityId: r.weighted(uniWeights),
      year: r.weighted(yearWeights) as YearOfStudy,
      joinedAt,
      source: r.weighted([["Referral", 34], ["Instagram", 24], ["WhatsApp", 16], ["Campus", 10], ["Website", 11], ["Class rep", 5]] as const),
      tags,
    });
  }
  return list;
}

export const CLIENTS = genClients();

/* ------------------------------------------------------------------- orders */

const MONTH_WEIGHT: Record<number, number> = { 0: 0.45, 1: 1.15, 2: 0.95, 3: 0.7, 4: 0.5, 5: 0.35, 6: 0.25, 7: 0.4, 8: 1.25, 9: 1.6, 10: 0.95, 11: 0.75 };
const PAY_METHODS = [["InstaPay", 38], ["Cash", 30], ["Vodafone Cash", 20], ["Card", 7], ["Bank transfer", 5]] as const;
const CHANNELS = [["whatsapp", 58], ["webchat", 18], ["instagram", 12], ["walkin", 7], ["call", 5]] as const;

export const orderTotal = (o: Pick<Order, "items" | "deliveryFee" | "discount">) =>
  o.items.reduce((s, i) => s + i.price * i.qty, 0) + o.deliveryFee - o.discount;
export const orderCost = (o: Pick<Order, "items">) => o.items.reduce((s, i) => s + i.cost * i.qty, 0);

const line = (productId: string, qty = 1, priceFactor = 1): LineItem => {
  const p = product(productId);
  return { productId, name: p.name, qty, price: Math.round((p.price * priceFactor) / 5) * 5, cost: p.cost };
};

function kitLines(kitId: string): LineItem[] {
  const k = kit(kitId);
  const raw = k.items.reduce((s, i) => s + product(i.productId).price * i.qty, 0);
  const factor = k.price / raw;
  return k.items.map((i) => line(i.productId, i.qty, factor));
}

function deliveryFor(c: Client): Order["delivery"] {
  const u = uni(c.universityId);
  const t = r.weighted([["campus", 65], ["pickup", 15], ["courier", 20]] as const);
  if (t === "campus") return { type: "campus", place: u.campus };
  if (t === "pickup") return { type: "pickup", place: "Pickup point, Dokki" };
  return { type: "courier", place: `Courier to ${r.pick(["Maadi", "Heliopolis", "Nasr City", "Sheikh Zayed", "Mohandessin", "New Cairo", "Zamalek"])}` };
}

const atDeliveryHour = (d: Date) => {
  const x = new Date(d);
  x.setHours(r.pick([11, 13, 14, 16, 18]), 0, 0, 0);
  return x;
};

function stageForAge(ageDays: number): OrderStage {
  if (ageDays < 0.4) return r.weighted([["new", 60], ["quoted", 40]] as const);
  if (ageDays < 1.5) return r.weighted([["quoted", 22], ["confirmed", 45], ["sourcing", 33]] as const);
  if (ageDays < 3) return r.weighted([["confirmed", 18], ["sourcing", 34], ["ready", 32], ["out", 16]] as const);
  if (ageDays < 6) return r.weighted([["sourcing", 5], ["ready", 10], ["out", 4], ["delivered", 81]] as const);
  if (ageDays < 14) return r.weighted([["sourcing", 1], ["delivered", 97], ["cancelled", 2]] as const);
  return r.weighted([["delivered", 97.5], ["cancelled", 2.5]] as const);
}

/** Keep sample events inside working hours (10:00–22:00). */
const workHours = (d: Date) => {
  const h = d.getHours();
  if (h >= 10 && h < 22) return d;
  const x = new Date(d);
  x.setHours(h < 10 ? 10 + (h % 4) : 21, x.getMinutes(), 0, 0);
  return x;
};

const STAGE_ORDER: OrderStage[] = ["new", "quoted", "confirmed", "sourcing", "ready", "out", "delivered"];

function buildTimeline(o: Order, c: Client): TimelineEvent[] {
  const ev: TimelineEvent[] = [];
  const t0 = o.createdAt;
  const chan = o.channel === "webchat" ? "the website" : o.channel === "walkin" ? "campus visit" : o.channel === "instagram" ? "Instagram" : o.channel === "call" ? "a phone call" : "WhatsApp";
  ev.push({ at: t0, kind: "status", text: `Request received via ${chan}` });
  const idx = STAGE_ORDER.indexOf(o.stage);
  if (idx >= 1 || o.stage === "cancelled") ev.push({ at: addMinutes(t0, 9), kind: "message", text: `Quote sent to ${c.name.split(" ")[0]}` });
  if (o.stage === "cancelled") {
    ev.push({ at: addHours(t0, 20), kind: "status", text: "Cancelled by client (bought elsewhere)" });
    return ev;
  }
  if (idx >= 2) {
    ev.push({ at: addMinutes(t0, 41), kind: "status", text: "Order confirmed" });
    ev.push({ at: addMinutes(t0, 42), kind: "auto", text: "Invoice sent on WhatsApp (auto)" });
  }
  if (o.paid > 0) ev.push({ at: addMinutes(t0, 75), kind: "payment", text: `${o.paid >= orderTotal(o) ? "Payment" : "Deposit"} received via ${o.paymentMethod}` });
  if (idx >= 3) ev.push({ at: addHours(t0, 3), kind: "partner", text: "Missing items ordered from supplier" });
  if (idx >= 4) {
    ev.push({ at: addHours(t0, 26), kind: "status", text: "Packed and ready" });
    ev.push({ at: addHours(t0, 26.1), kind: "auto", text: "Ready notice + delivery slots sent (auto)" });
  }
  if (idx >= 5) ev.push({ at: addHours(o.promisedAt, -2), kind: "auto", text: "On-the-way message sent (auto)" });
  if (idx >= 6 && o.deliveredAt) {
    ev.push({ at: o.deliveredAt, kind: "status", text: `Delivered: ${o.delivery.place}` });
    ev.push({ at: addDays(o.deliveredAt, 1), kind: "auto", text: "Rating request sent (auto)" });
    if (o.rating) ev.push({ at: addDays(o.deliveredAt, 1.2), kind: "message", text: `Rated ${o.rating}/5` });
  }
  return ev
    .map((e) => ({ ...e, at: workHours(e.at) }))
    .filter((e) => e.at <= NOW)
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

function genOrders(): Order[] {
  const orders: Order[] = [];
  const start = new Date(2024, 9, 1);
  let monthIndex = 0;
  for (let d = new Date(start); d <= NOW; d = new Date(d.getFullYear(), d.getMonth() + 1, 1), monthIndex++) {
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const isCurrent = d.getFullYear() === NOW.getFullYear() && d.getMonth() === NOW.getMonth();
    const days = isCurrent ? NOW.getDate() - 1 + NOW.getHours() / 24 : daysInMonth;
    const growth = 1 + 0.27 * (monthIndex / 12);
    const n = Math.round(36 * MONTH_WEIGHT[d.getMonth()] * growth * (days / daysInMonth) * (isCurrent ? 0.72 : 1));
    for (let k = 0; k < n; k++) {
      let createdAt: Date;
      if (isCurrent) {
        createdAt = new Date(NOW.getTime() - r.next() ** 0.9 * days * 86_400_000);
      } else {
        createdAt = new Date(d.getFullYear(), d.getMonth(), r.int(1, daysInMonth), r.int(9, 23), r.int(0, 59));
      }
      const pool = CLIENTS.filter((c) => c.joinedAt <= createdAt);
      const c = pool.length ? r.pick(pool) : r.pick(CLIENTS);
      const yearKits = KITS.filter((x) => x.year === c.year);
      let items: LineItem[];
      let kitId: string | undefined;
      if (yearKits.length && r.chance(0.34)) {
        kitId = r.pick(yearKits).id;
        items = kitLines(kitId);
      } else {
        const req = REQUIREMENTS[c.year];
        const count = r.weighted([[1, 45], [2, 30], [3, 17], [4, 8]] as const);
        const ids = new Set<string>();
        for (let j = 0; j < count; j++) ids.add(r.chance(0.82) ? r.pick(req).productId : r.pick(PRODUCTS).id);
        items = [...ids].map((id) => line(id, r.chance(0.12) ? 2 : 1));
      }
      const ageDays = (NOW.getTime() - createdAt.getTime()) / 86_400_000;
      const stage = stageForAge(ageDays);
      const delivery = deliveryFor(c);
      const needsSourcing = items.some((i) => product(i.productId).stock <= 3) || r.chance(0.2);
      const promisedAt = atDeliveryHour(addDays(createdAt, (kitId ? 2 : 1) + (needsSourcing ? r.int(1, 2) : r.int(0, 1))));
      const o: Order = {
        id: "",
        clientId: c.id,
        createdAt,
        promisedAt,
        stage,
        channel: r.weighted(CHANNELS) as Channel,
        items,
        kitId,
        deliveryFee: delivery.type === "courier" ? 75 : 0,
        discount: r.chance(0.08) ? 100 : 0,
        paid: 0,
        delivery,
        timeline: [],
      };
      const total = orderTotal(o);
      if (stage === "delivered") {
        const late = r.chance(0.07);
        const dAt = late ? addDays(promisedAt, r.int(1, 2)) : addHours(promisedAt, -r.int(0, 3));
        o.deliveredAt = dAt > NOW ? addHours(NOW, -2) : dAt;
        const p = ageDays > 45 ? r.weighted([["full", 99.2], ["part", 0.4], ["none", 0.4]] as const) : ageDays > 37 ? r.weighted([["full", 86], ["part", 7], ["none", 7]] as const) : ageDays > 7 ? r.weighted([["full", 86], ["part", 8], ["none", 6]] as const) : r.weighted([["full", 72], ["part", 14], ["none", 14]] as const);
        o.paid = p === "full" ? total : p === "part" ? Math.round((total * 0.5) / 50) * 50 : 0;
        if (r.chance(0.62)) o.rating = r.weighted([[5, 79], [4, 16], [3, 4], [2, 1]] as const);
      } else if (["confirmed", "sourcing", "ready", "out"].includes(stage)) {
        const p = r.weighted([["full", 32], ["dep", 40], ["none", 28]] as const);
        o.paid = p === "full" ? total : p === "dep" ? Math.round((total * 0.5) / 50) * 50 : 0;
      }
      if (o.paid > 0) o.paymentMethod = r.weighted(PAY_METHODS) as PaymentMethod;
      if ((stage === "ready" || stage === "out") && promisedAt < NOW) {
        o.promisedAt = new Date(NOW);
        o.promisedAt.setHours(r.pick([13, 15, 17]), 0, 0, 0);
      }
      if (stage === "out") o.delivery.slot = "Today, 12:00–14:00";
      orders.push(o);
    }
  }
  orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  orders.forEach((o, i) => {
    o.id = `CU-${1001 + i}`;
  });
  return orders;
}

const ORDERS_RAW = genOrders();

// A few hand-written orders that tell the story on the board.
function curatedOrders(): Order[] {
  let next = 1001 + ORDERS_RAW.length;
  const id = () => `CU-${next++}`;
  const mk = (o: Omit<Order, "id" | "timeline">): Order => {
    const full: Order = { ...o, id: id(), timeline: [] };
    return full;
  };
  const today = (h: number, m = 0) => {
    const x = new Date(NOW);
    x.setHours(h, m, 0, 0);
    return x;
  };
  const list: Order[] = [
    mk({ clientId: "c007", createdAt: addHours(NOW, -20), promisedAt: atDeliveryHour(addDays(NOW, 4)), stage: "quoted", channel: "email", items: kitLines("k4").map((l) => ({ ...l, qty: l.qty * 46 })), kitId: "k4", deliveryFee: 0, discount: 9200, paid: 0, delivery: { type: "campus", place: uni("asu").campus }, group: { label: "Ain Shams · 3rd year", students: 46 }, notes: "Group order. Mariam collects the money and sends one InstaPay transfer." }),
    mk({ clientId: "c005", createdAt: addHours(NOW, -27), promisedAt: today(14), stage: "ready", channel: "whatsapp", items: kitLines("k3"), kitId: "k3", deliveryFee: 0, discount: 0, paid: 0, delivery: { type: "campus", place: uni("cu").campus, slot: "Today, 14:00–16:00" } }),
    mk({ clientId: "c004", createdAt: addHours(NOW, -30), promisedAt: today(16), stage: "ready", channel: "whatsapp", items: [line("p03"), line("p33", 2), line("p36")], deliveryFee: 0, discount: 0, paid: 0, paymentMethod: undefined, delivery: { type: "campus", place: uni("cu").campus, slot: "Today, 16:00–18:00" } }),
    mk({ clientId: "c010", createdAt: addHours(NOW, -50), promisedAt: today(13), stage: "sourcing", channel: "webchat", items: [line("p22"), line("p10")], deliveryFee: 0, discount: 0, paid: 3000, paymentMethod: "InstaPay", delivery: { type: "campus", place: uni("fue").campus } }),
    mk({ clientId: "c009", createdAt: addDays(NOW, -5), promisedAt: atDeliveryHour(addDays(NOW, -2)), stage: "sourcing", channel: "whatsapp", items: [line("p38")], deliveryFee: 0, discount: 0, paid: 3800, paymentMethod: "Vodafone Cash", delivery: { type: "courier", place: "Courier to Nasr City" }, notes: "Waiting on Vision Optics restock (ETA Sunday). Told Seif on Wednesday." }),
    mk({ clientId: "c011", createdAt: addDays(NOW, -41), promisedAt: atDeliveryHour(addDays(NOW, -39)), deliveredAt: addDays(NOW, -39), stage: "delivered", channel: "instagram", items: [line("p06")], deliveryFee: 0, discount: 150, paid: 0, delivery: { type: "courier", place: "Courier to Obour" } }),
    mk({ clientId: "c118", createdAt: addMinutes(NOW, -95), promisedAt: atDeliveryHour(addDays(NOW, 1)), stage: "confirmed", channel: "webchat", items: kitLines("k6"), kitId: "k6", deliveryFee: 0, discount: 0, paid: 9450, paymentMethod: "Card", delivery: { type: "campus", place: uni("azhar").campus } }),
    mk({ clientId: "c141", createdAt: addMinutes(NOW, -52), promisedAt: atDeliveryHour(addDays(NOW, 1)), stage: "confirmed", channel: "whatsapp", items: [line("p18"), line("p33", 2), line("p34")], deliveryFee: 0, discount: 0, paid: 1380, paymentMethod: "InstaPay", delivery: { type: "campus", place: uni("asu").campus } }),
    mk({ clientId: "c077", createdAt: addMinutes(NOW, -35), promisedAt: atDeliveryHour(addDays(NOW, 2)), stage: "confirmed", channel: "instagram", items: [line("p39"), line("p13"), line("p30", 2)], deliveryFee: 75, discount: 0, paid: 0, delivery: { type: "courier", place: "Courier to Heliopolis" } }),
    mk({ clientId: "c001", createdAt: addMinutes(NOW, -138), promisedAt: atDeliveryHour(addDays(NOW, 2)), stage: "new", channel: "whatsapp", items: [line("p04")], deliveryFee: 0, discount: 0, paid: 0, delivery: { type: "campus", place: uni("cu").campus } }),
  ];
  list.forEach((o) => {
    const c = CLIENTS.find((x) => x.id === o.clientId)!;
    o.timeline = buildTimeline(o, c);
  });
  // Ziad's payment arrived this morning (matches the inbox thread)
  list[2].timeline.push({ at: addMinutes(NOW, -6), kind: "message", text: "Client says InstaPay transfer sent (screenshot in inbox)" });
  return list;
}

export const ORDERS: Order[] = (() => {
  ORDERS_RAW.forEach((o) => {
    const c = CLIENTS.find((x) => x.id === o.clientId)!;
    o.timeline = buildTimeline(o, c);
  });
  return [...ORDERS_RAW, ...curatedOrders()];
})();

/* ------------------------------------------------------------------ repairs */

const ISSUES: Record<string, string[]> = {
  handpiece: ["Bur slips, chuck not gripping", "Noisy turbine with vibration", "Weak water spray", "Stopped spinning after a drop", "Push button stuck"],
  contra: ["Head overheating", "Latch not holding the bur"],
  micromotor: ["Motor cuts out under load", "Foot pedal not responding", "Handpiece wobble at speed"],
  curing: ["Battery not charging", "Low light output"],
  endomotor: ["Auto-reverse not working", "Won't power on"],
  scaler: ["No vibration on the tip", "Water leaking from handpiece"],
};
const SERVICEABLE = PRODUCTS.filter((p) => p.serviceable && p.art !== "loupes");
const partnerFor = (brand: string, art: string) => {
  if (brand === "NSK") return r.chance(0.6) ? "r1" : "r3";
  if (brand === "Woodpecker") return "r2";
  if (art === "micromotor") return "r4";
  return "r3";
};

const REPAIR_STAGES: RepairStage[] = ["received", "at_partner", "diagnosis", "approval", "repairing", "qc", "returned"];

function repairTimeline(rep: Repair, name: string): TimelineEvent[] {
  const p = PARTNERS.find((x) => x.id === rep.partnerId)!;
  const idx = REPAIR_STAGES.indexOf(rep.stage);
  const t = rep.receivedAt;
  const ev: TimelineEvent[] = [{ at: t, kind: "status", text: `Picked up from ${name.split(" ")[0]}` }];
  ev.push({ at: addMinutes(t, 2), kind: "auto", text: "Tracking link sent (auto)" });
  if (rep.loaner) ev.push({ at: addMinutes(t, 5), kind: "note", text: `Loaner given: ${rep.loaner}` });
  if (idx >= 1) ev.push({ at: addHours(t, 5), kind: "partner", text: `Dropped at ${p.name}` });
  if (idx >= 2) ev.push({ at: addDays(t, 1), kind: "partner", text: "Partner is diagnosing" });
  if (idx >= 3 && rep.partnerCost) ev.push({ at: addDays(t, 1.6), kind: "partner", text: `Estimate from partner: EGP ${rep.partnerCost}` });
  if (idx >= 3 && rep.price) ev.push({ at: addDays(t, 1.62), kind: "auto", text: rep.warranty ? "Covered by warranty, client informed (auto)" : `Approval request sent: EGP ${rep.price} (auto)` });
  if (idx >= 4) ev.push({ at: addDays(t, 1.9), kind: "message", text: rep.warranty ? "Warranty repair started" : "Client approved the price" });
  if (idx >= 5) ev.push({ at: addDays(rep.stageSince, 0), kind: "status", text: "Back with us, tested on the bench" });
  if (idx >= 6 && rep.returnedAt) ev.push({ at: rep.returnedAt, kind: "status", text: "Returned to client" });
  return ev
    .map((e) => ({ ...e, at: workHours(e.at) }))
    .filter((e) => e.at <= NOW)
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

function genRepairs(): Repair[] {
  const list: Repair[] = [];
  const start = new Date(2024, 9, 5);
  for (let d = new Date(start); d < addDays(NOW, -12); d = addDays(d, r.int(2, 6))) {
    const p = r.pick(SERVICEABLE);
    const c = r.pick(CLIENTS.filter((x) => x.joinedAt <= d));
    const partnerId = partnerFor(p.brand, p.art);
    const pt = PARTNERS.find((x) => x.id === partnerId)!;
    const tat = Math.max(2, Math.round(pt.avgDays + (r.next() - 0.4) * 4));
    const warranty = r.chance(0.24);
    const partnerCost = warranty ? 0 : r.int(7, 44) * 50;
    const returnedAt = addDays(d, tat);
    list.push({
      id: "",
      clientId: c.id,
      device: p.name,
      brand: p.brand,
      art: p.art,
      serial: `${p.brand.slice(0, 2).toUpperCase()}${r.int(100000, 999999)}`,
      issue: r.pick(ISSUES[p.art] ?? ISSUES.handpiece),
      receivedAt: d,
      promisedAt: addDays(d, Math.round(pt.avgDays) + 1),
      stage: "returned",
      stageSince: returnedAt,
      returnedAt,
      partnerId,
      partnerCost,
      price: warranty ? 0 : Math.round((partnerCost * 1.3 + 150) / 50) * 50,
      approved: true,
      warranty,
      paid: 0,
      timeline: [],
    });
  }
  list.forEach((x) => (x.paid = x.price ?? 0));
  return list;
}

function curatedRepairs(): Omit<Repair, "id" | "timeline">[] {
  const mk = (
    clientId: string,
    productId: string,
    issue: string,
    stage: RepairStage,
    receivedDaysAgo: number,
    stageDaysAgo: number,
    opts: Partial<Repair> = {},
  ): Omit<Repair, "id" | "timeline"> => {
    const p = product(productId);
    const partnerId = opts.partnerId ?? partnerFor(p.brand, p.art);
    const pt = PARTNERS.find((x) => x.id === partnerId)!;
    const receivedAt = addHours(NOW, -receivedDaysAgo * 24);
    return {
      clientId,
      device: p.name,
      brand: p.brand,
      art: p.art,
      serial: `${p.brand.slice(0, 2).toUpperCase()}${r.int(100000, 999999)}`,
      issue,
      receivedAt,
      promisedAt: atDeliveryHour(addDays(receivedAt, Math.round(pt.avgDays) + 1)),
      stage,
      stageSince: addHours(NOW, -stageDaysAgo * 24),
      partnerId,
      warranty: false,
      paid: 0,
      ...opts,
    };
  };
  return [
    mk("c003", "p01", "Bur slips, chuck not gripping", "received", 0.1, 0.1, { partnerId: "r3", loaner: "Loaner turbine #2" }),
    mk("c021", "p05", "Foot pedal not responding", "received", 0.7, 0.7),
    mk("c044", "p02", "Noisy turbine with vibration", "at_partner", 1.4, 1.1, { loaner: "Loaner turbine #1" }),
    mk("c067", "p06", "Battery not charging", "at_partner", 2.3, 2, { warranty: true }),
    mk("c012", "p03", "Head overheating", "at_partner", 3.1, 2.8, { partnerId: "r1" }),
    mk("c090", "p04", "Motor cuts out under load", "diagnosis", 3.8, 2.5),
    mk("c118", "p07", "Auto-reverse not working", "diagnosis", 11.2, 9.5, { partnerId: "r2" }),
    mk("c008", "p01", "Weak water spray", "approval", 2.9, 1.2, { partnerCost: 650, price: 850, partnerId: "r1" }),
    mk("c133", "p08", "No vibration on the tip", "approval", 5.2, 2.1, { partnerCost: 1400, price: 1850 }),
    mk("c006", "p01", "Stopped spinning after a drop", "repairing", 4.4, 2.6, { partnerCost: 1100, price: 1450, approved: true, partnerId: "r3", loaner: "Loaner turbine #3" }),
    mk("c152", "p04", "Handpiece wobble at speed", "repairing", 9.6, 4.1, { partnerCost: 900, price: 1200, approved: true }),
    mk("c171", "p02", "Push button stuck", "repairing", 2.2, 0.9, { partnerCost: 350, price: 500, approved: true }),
    mk("c188", "p06", "Low light output", "qc", 6.1, 0.3, { partnerCost: 0, price: 0, approved: true, warranty: true }),
    mk("c205", "p03", "Latch not holding the bur", "qc", 5.8, 0.2, { partnerCost: 750, price: 1000, approved: true, partnerId: "r1", paid: 1000 }),
    mk("c024", "p01", "Noisy turbine with vibration", "returned", 7.5, 1.1, { partnerCost: 600, price: 800, approved: true, returnedAt: addDays(NOW, -1.1), paid: 800, partnerId: "r3" }),
    mk("c231", "p05", "Motor cuts out under load", "returned", 8.2, 2.2, { partnerCost: 450, price: 650, approved: true, returnedAt: addDays(NOW, -2.2), paid: 650 }),
  ];
}

export const REPAIRS: Repair[] = (() => {
  const hist = genRepairs();
  const cur = curatedRepairs().map((x) => ({ ...x, id: "", timeline: [] as TimelineEvent[] }));
  const all = [...hist, ...cur].sort((a, b) => a.receivedAt.getTime() - b.receivedAt.getTime());
  all.forEach((x, i) => {
    x.id = `RP-${1001 + i}`;
    const c = CLIENTS.find((k) => k.id === x.clientId)!;
    x.timeline = repairTimeline(x, c.name);
  });
  return all;
})();

/* ----------------------------------------------------------------- invoices */

export const INVOICES: Invoice[] = (() => {
  const list: Invoice[] = [];
  const items: { ref: string; clientId: string; at: Date; amount: number; paid: number; method?: PaymentMethod; doneAt?: Date; settled?: boolean }[] = [];
  // Balances older than about 2.5 months were collected or written off long ago; keep the sample believable.
  const stale = (d: Date) => NOW.getTime() - d.getTime() > 75 * 86_400_000;
  for (const o of ORDERS) {
    if (["new", "quoted", "cancelled"].includes(o.stage)) continue;
    const settled = o.paid < orderTotal(o) && stale(o.createdAt);
    if (settled) {
      o.paid = orderTotal(o);
      o.paymentMethod ??= "Cash";
    }
    items.push({ ref: o.id, clientId: o.clientId, at: addMinutes(o.createdAt, 42), amount: orderTotal(o), paid: o.paid, method: o.paymentMethod, doneAt: o.deliveredAt, settled });
  }
  for (const rp of REPAIRS) {
    if (!rp.price || !rp.approved) continue;
    const settled = rp.paid < rp.price && stale(rp.receivedAt);
    if (settled) rp.paid = rp.price;
    items.push({ ref: rp.id, clientId: rp.clientId, at: rp.returnedAt ?? addDays(rp.receivedAt, 2), amount: rp.price, paid: rp.paid, method: settled ? "Cash" : rp.paid ? (r.weighted(PAY_METHODS) as PaymentMethod) : undefined, settled });
  }
  items.sort((a, b) => a.at.getTime() - b.at.getTime());
  items.forEach((x, i) => {
    const dueAt = addDays(x.at, 7);
    const overdueDays = (NOW.getTime() - dueAt.getTime()) / 86_400_000;
    list.push({
      id: `INV-${3001 + i}`,
      clientId: x.clientId,
      ref: x.ref,
      issuedAt: x.at,
      dueAt,
      amount: x.amount,
      paid: x.paid,
      method: x.method,
      paidAt: x.settled ? addDays(dueAt, 12) : x.paid >= x.amount ? addDays(x.at, Math.min(r.int(0, 9), Math.max(0, (NOW.getTime() - x.at.getTime()) / 86_400_000))) : undefined,
      reminders: x.paid < x.amount && overdueDays > 0 ? Math.min(3, 1 + Math.floor(overdueDays / 7)) : 0,
    });
  });
  return list;
})();

/* ------------------------------------------------------------ conversations */

let mid = 0;
const msg = (from: Message["from"], minutesAgo: number, text: string, attachment?: string): Message => ({
  id: `m${++mid}`,
  from,
  text,
  at: addMinutes(NOW, -minutesAgo),
  attachment,
});

const curatedOrderId = (clientId: string) => ORDERS.filter((o) => o.clientId === clientId).slice(-1)[0]?.id;
const curatedRepairId = (clientId: string) => REPAIRS.filter((x) => x.clientId === clientId).slice(-1)[0]?.id;

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv1", clientId: "c001", channel: "whatsapp", status: "open", topic: "Micromotor before Sunday lab", links: [curatedOrderId("c001")!],
    messages: [
      msg("client", 141, "Hi! Do you have the Strong 204 micromotor?"),
      { ...msg("auto", 140, "Thanks Nour! Youssef will reply shortly. Meanwhile, here's the price list: cusp.example/shop"), ack: true },
      msg("client", 138, "Is it still 5,450? I need it before the Sunday prosth lab please"),
    ],
  },
  {
    id: "cv2", clientId: "c002", channel: "instagram", status: "open", topic: "Fixed prosth kit price",
    messages: [msg("client", 52, "Salam, how much is the 3rd year fixed prosth kit? Does it include the typodont teeth?"), msg("client", 48, "And can you deliver to Abbasia on Saturday?")],
  },
  {
    id: "cv3", clientId: "c003", channel: "webchat", status: "open", topic: "Handpiece repair", links: [curatedRepairId("c003")!],
    messages: [
      msg("client", 31, "My Pana-Max makes a weird noise and the bur slips. Can you check it?"),
      msg("me", 27, "Sorry to hear that Salma. I can pick it up from FUE today at 1pm and leave you a loaner turbine so you don't miss clinic."),
      msg("client", 24, "That would be amazing. Will it be covered by the warranty? I bought it from you in March"),
    ],
  },
  {
    id: "cv4", clientId: "c004", channel: "whatsapp", status: "open", topic: "Payment for order", links: [curatedOrderId("c004")!],
    messages: [
      msg("auto", 975, "Your order is packed and ready. Delivery slots for tomorrow: 14:00–16:00 or 16:00–18:00. Reply 1 or 2."),
      msg("client", 958, "2 please"),
      msg("auto", 957, "Booked: tomorrow 16:00–18:00 at Kasr Al Ainy gate. Pay by InstaPay to cusp@instapay or cash on delivery."),
      msg("client", 6, "Sent the InstaPay transfer for the full amount", "instapay-receipt.jpg"),
    ],
  },
  {
    id: "cv5", clientId: "c007", channel: "email", status: "open", topic: "Group order · 46 students", links: [curatedOrderId("c007")!],
    messages: [
      msg("client", 1260, "Hi Youssef, I'm collecting the fixed prosth kit for our batch again this term. 46 students so far. Same deal as last term?"),
      msg("me", 1190, "Hi Mariam! Yes. I've sent the quote with the group discount. 46 kits, delivered to the faculty gate."),
      msg("client", 95, "Perfect. 3 more students joined, so 49 now. Can you update it? We'll transfer on Sunday."),
    ],
  },
  {
    id: "cv6", clientId: "c008", channel: "whatsapp", status: "open", topic: "Repair approval", links: [curatedRepairId("c008")!],
    messages: [
      msg("auto", 1730, "Update on RP repair: the service centre found a worn water line. Repair cost EGP 850, ready in 2 days. Reply APPROVE or call us."),
      msg("client", 1640, "Hmm let me think, that's a bit much"),
      msg("me", 1600, "Totally fair. It includes new O-rings and a 3-month warranty on the repair. A new handpiece would be 4,950."),
    ],
  },
  {
    id: "cv7", clientId: "c006", channel: "call", status: "open", topic: "Missed calls",
    messages: [msg("client", 75, "Missed call (1st attempt)"), msg("client", 63, "Missed call (2nd attempt)")],
  },
  {
    id: "cv8", clientId: "c005", channel: "whatsapp", status: "open", topic: "Delivery today", links: [curatedOrderId("c005")!],
    messages: [
      msg("auto", 960, "Your Removable prosth lab kit is ready. Delivery to Kasr Al Ainy gate today 14:00–16:00. Reply CHANGE to pick another slot."),
      msg("client", 940, "Perfect thank you!!"),
      msg("me", 935, "See you at 2 😊"),
    ],
  },
  {
    id: "cv9", clientId: "c009", channel: "whatsapp", status: "closed", topic: "Loupes delay", links: [curatedOrderId("c009")!],
    messages: [
      msg("me", 2900, "Seif, quick heads-up: the loupes supplier pushed the restock to Sunday. I'll deliver Sunday evening. Sorry for the wait."),
      msg("client", 2870, "No problem, thanks for telling me"),
    ],
  },
  {
    id: "cv10", leadName: "Lojain Sherif", leadMeta: "BUE · 2nd year", channel: "webchat", status: "open", topic: "Requirements list",
    messages: [msg("client", 12, "Hi, I'm in 2nd year at BUE. Can I send you our requirements list and get a full quote?", "bue-y2-requirements.pdf")],
  },
  {
    id: "cv11", clientId: "c011", channel: "whatsapp", status: "open", topic: "Balance",
    messages: [
      msg("auto", 4320, "Friendly reminder: invoice balance of EGP 3,200 is now 31 days overdue. You can pay by InstaPay to cusp@instapay."),
      msg("client", 4200, "I'll pay half next week inshallah"),
      msg("me", 4150, "No problem Adham, thanks for letting me know. I'll pause the reminders until next Thursday."),
    ],
  },
  {
    id: "cv12", clientId: "c012", channel: "whatsapp", status: "closed", topic: "Referral thanks",
    messages: [msg("me", 7300, "Yasmin, thank you for sending your classmates our way. Your next order has a free embroidered coat on us."), msg("client", 7200, "Aww thank you!! ❤️")],
  },
];

/* --------------------------------------------------------------- automations */

export const AUTOMATIONS: Automation[] = [
  { id: "a1", group: "Messages", name: "After-hours auto reply", trigger: "New message outside working hours", action: "Reply with hours, price list and storefront link", channel: "whatsapp", enabled: true, runs30d: 212, minutesSavedPerRun: 1.5, lastRun: addMinutes(NOW, -140) },
  { id: "a2", group: "Orders", name: "Order confirmation", trigger: "Order marked Confirmed", action: "Send summary, invoice and payment options", channel: "whatsapp", enabled: true, runs30d: 164, minutesSavedPerRun: 4, lastRun: addMinutes(NOW, -35) },
  { id: "a3", group: "Orders", name: "Ready for delivery", trigger: "Order marked Ready", action: "Offer delivery slots, client replies 1 / 2", channel: "whatsapp", enabled: true, runs30d: 151, minutesSavedPerRun: 3, lastRun: addMinutes(NOW, -400) },
  { id: "a4", group: "Orders", name: "On the way", trigger: "Order marked Out for delivery", action: "Send ETA and meeting point", channel: "whatsapp", enabled: true, runs30d: 148, minutesSavedPerRun: 2, lastRun: addHours(NOW, -18) },
  { id: "a5", group: "Orders", name: "Rating request", trigger: "1 day after delivery", action: "Ask for a 1–5 rating, alert me on 3 or less", channel: "whatsapp", enabled: true, runs30d: 139, minutesSavedPerRun: 1.5, lastRun: addHours(NOW, -3) },
  { id: "a6", group: "Repairs", name: "Repair tracking link", trigger: "Repair created", action: "Send tracking link and expected date", channel: "whatsapp", enabled: true, runs30d: 31, minutesSavedPerRun: 3, lastRun: addMinutes(NOW, -146) },
  { id: "a7", group: "Repairs", name: "Estimate approval", trigger: "Partner estimate entered", action: "Ask client to approve; follow up after 24 h", channel: "whatsapp", enabled: true, runs30d: 22, minutesSavedPerRun: 5, lastRun: addHours(NOW, -29) },
  { id: "a8", group: "Repairs", name: "Chase the service partner", trigger: "Repair at partner longer than promised", action: "Remind me to call the partner", channel: "internal", enabled: true, runs30d: 9, minutesSavedPerRun: 2, lastRun: addHours(NOW, -5) },
  { id: "a9", group: "Payments", name: "Payment reminders", trigger: "Invoice due, then +7, +14 days", action: "Polite reminder with InstaPay details; stops when paid", channel: "whatsapp", enabled: true, runs30d: 58, minutesSavedPerRun: 3, lastRun: addHours(NOW, -2) },
  { id: "a10", group: "Payments", name: "Payment received", trigger: "Payment recorded", action: "Send receipt and thank-you", channel: "whatsapp", enabled: true, runs30d: 171, minutesSavedPerRun: 1.5, lastRun: addMinutes(NOW, -52) },
  { id: "a11", group: "Stock", name: "Low stock draft PO", trigger: "Stock falls below reorder point", action: "Draft a purchase order to the usual supplier", channel: "internal", enabled: true, runs30d: 14, minutesSavedPerRun: 10, lastRun: addHours(NOW, -20) },
  { id: "a12", group: "Growth", name: "Term-start requirements", trigger: "2 weeks before each term", action: "Send each year its requirements list and kit link", channel: "whatsapp", enabled: true, runs30d: 6, minutesSavedPerRun: 45, lastRun: addDays(NOW, -17) },
  { id: "a13", group: "Growth", name: "Win-back check-in", trigger: "No order for 120 days", action: "Personal check-in with next-year kit suggestion", channel: "whatsapp", enabled: false, runs30d: 0, minutesSavedPerRun: 3 },
  { id: "a14", group: "Growth", name: "Referral thank-you", trigger: "New client names a referrer", action: "Thank the referrer, add EGP 100 credit", channel: "whatsapp", enabled: false, runs30d: 0, minutesSavedPerRun: 2 },
];

export const CAMPAIGNS: Campaign[] = [
  { id: "cp1", name: "Term 1 requirements · 2nd year", audience: "2nd year · all universities", channel: "whatsapp", sentAt: addDays(NOW, -17), recipients: 214, read: 197, replied: 66, orders: 41, revenue: 172400, status: "sent" },
  { id: "cp2", name: "Term 1 requirements · 3rd year", audience: "3rd year · all universities", channel: "whatsapp", sentAt: addDays(NOW, -17), recipients: 188, read: 171, replied: 52, orders: 33, revenue: 139800, status: "sent" },
  { id: "cp3", name: "Clinic essentials · 4th year", audience: "4th year · bought nothing this term", channel: "whatsapp", sentAt: addDays(NOW, -9), recipients: 96, read: 81, replied: 19, orders: 11, revenue: 61200, status: "sent" },
  { id: "cp4", name: "Loupes restock pre-order", audience: "4th, 5th year and interns", channel: "whatsapp", scheduledFor: addDays(NOW, 2), recipients: 141, read: 0, replied: 0, orders: 0, revenue: 0, status: "scheduled" },
  { id: "cp5", name: "Summer handpiece service", audience: "Bought a handpiece over 9 months ago", channel: "email", sentAt: addDays(NOW, -78), recipients: 122, read: 74, replied: 18, orders: 14, revenue: 13900, status: "sent" },
];

export const TEMPLATES: Template[] = [
  { id: "t1", name: "Payment details", body: "You can pay by InstaPay to cusp@instapay or Vodafone Cash on 0100 555 0142. Send me the screenshot and I'll confirm right away.", uses: 318 },
  { id: "t2", name: "Repair received", body: "Got your {device}. It goes to {partner} today and I'll send you the estimate before any work starts. Track it here: {tracking_link}", uses: 64 },
  { id: "t3", name: "Delivery slots", body: "Your order is ready. I'm at {campus} today 14:00–16:00 or 16:00–18:00. Which works?", uses: 241 },
  { id: "t4", name: "Kit contents", body: "The {kit} includes: {items}. Price {price}, which saves you {saving} compared to buying separately.", uses: 187 },
  { id: "t5", name: "Requirements list", body: "Send me a photo of your faculty's requirements list and I'll prepare a full quote within the hour.", uses: 152 },
  { id: "t6", name: "Thank you", body: "Thank you {first_name}! If anything breaks or doesn't fit, message me and I'll sort it out.", uses: 289 },
];

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", at: addMinutes(NOW, -6), text: "Ziad Mahmoud sent an InstaPay receipt", tone: "good", to: "/admin/inbox?c=cv4", read: false },
  { id: "n2", at: addMinutes(NOW, -12), text: "New website chat from a BUE 2nd-year student", tone: "info", to: "/admin/inbox?c=cv10", read: false },
  { id: "n3", at: addMinutes(NOW, -63), text: "Karim Saeed called twice", tone: "warn", to: "/admin/inbox?c=cv7", read: false },
  { id: "n4", at: addHours(NOW, -5), text: "Endo Smart+ repair is 2 days past promise at Woodpecker", tone: "bad", to: "/admin/repairs", read: false },
  { id: "n5", at: addHours(NOW, -20), text: "Strong 204 micromotor is below reorder point (2 left)", tone: "warn", to: "/admin/catalog?tab=stock", read: true },
  { id: "n6", at: addHours(NOW, -26), text: "Term 1 campaign passed EGP 300K in orders", tone: "good", to: "/admin/messaging?tab=broadcasts", read: true },
];
