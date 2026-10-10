export type YearOfStudy = 1 | 2 | 3 | 4 | 5 | 6; // 6 = internship year

export type Subject =
  | "Anatomy & carving"
  | "Operative"
  | "Removable prosth"
  | "Fixed prosth"
  | "Endodontics"
  | "Periodontics"
  | "Oral surgery"
  | "Clinic"
  | "Lab";

export type Category =
  | "Handpieces & motors"
  | "Hand instruments"
  | "Burs & rotary"
  | "Typodonts & teeth"
  | "Materials"
  | "Endo"
  | "Lab & PPE";

export type ArtKind =
  | "handpiece"
  | "contra"
  | "micromotor"
  | "curing"
  | "endomotor"
  | "scaler"
  | "burs"
  | "typodont"
  | "teeth"
  | "mirror"
  | "instruments"
  | "carver"
  | "forceps"
  | "files"
  | "syringe"
  | "jar"
  | "wax"
  | "dam"
  | "loupes"
  | "coat"
  | "case"
  | "kit";

export type Channel = "whatsapp" | "webchat" | "instagram" | "call" | "email" | "walkin";
export type PaymentMethod = "Cash" | "InstaPay" | "Vodafone Cash" | "Card" | "Bank transfer";

export interface University {
  id: string;
  name: string;
  short: string;
  campus: string; // delivery spot
  area: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: Category;
  subject: Subject;
  years: YearOfStudy[];
  cost: number;
  price: number;
  stock: number;
  reorderPoint: number;
  supplierId: string;
  art: ArtKind;
  description: string;
  warrantyMonths?: number;
  serviceable?: boolean; // can come back for repair
}

export interface Kit {
  id: string;
  name: string;
  year: YearOfStudy;
  subject: Subject;
  items: { productId: string; qty: number }[];
  price: number;
  blurb: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  universityId: string;
  year: YearOfStudy;
  joinedAt: Date;
  source: "Referral" | "Instagram" | "WhatsApp" | "Campus" | "Website" | "Class rep";
  tags: string[];
  notes?: string;
}

export type OrderStage = "new" | "quoted" | "confirmed" | "sourcing" | "ready" | "out" | "delivered" | "cancelled";

export interface LineItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
}

export interface TimelineEvent {
  at: Date;
  text: string;
  kind: "status" | "message" | "payment" | "note" | "auto" | "partner";
}

export interface Order {
  id: string;
  clientId: string;
  createdAt: Date;
  promisedAt: Date;
  deliveredAt?: Date;
  stage: OrderStage;
  channel: Channel;
  items: LineItem[];
  kitId?: string;
  deliveryFee: number;
  discount: number;
  paid: number;
  paymentMethod?: PaymentMethod;
  delivery: { type: "campus" | "pickup" | "courier"; place: string; slot?: string };
  timeline: TimelineEvent[];
  rating?: number;
  group?: { label: string; students: number };
  notes?: string;
}

export type RepairStage = "received" | "at_partner" | "diagnosis" | "approval" | "repairing" | "qc" | "returned";

export interface Repair {
  id: string;
  clientId: string;
  device: string;
  brand: string;
  art: ArtKind;
  serial: string;
  issue: string;
  receivedAt: Date;
  promisedAt: Date;
  stage: RepairStage;
  stageSince: Date;
  returnedAt?: Date;
  partnerId: string;
  partnerCost?: number; // what the service center charges
  price?: number; // what the client pays
  approved?: boolean;
  loaner?: string;
  warranty: boolean;
  paid: number;
  timeline: TimelineEvent[];
}

export interface Invoice {
  id: string;
  clientId: string;
  ref: string; // order or repair id; empty for a one-off invoice
  /** what a one-off invoice is for */
  note?: string;
  issuedAt: Date;
  dueAt: Date;
  amount: number;
  paid: number;
  method?: PaymentMethod;
  paidAt?: Date;
  reminders: number;
}

export interface Message {
  id: string;
  from: "client" | "me" | "auto";
  text: string;
  at: Date;
  attachment?: string;
  /** automatic "we got your message" acknowledgement; doesn't count as a reply */
  ack?: boolean;
}

export interface Conversation {
  id: string;
  clientId?: string;
  leadName?: string; // not yet a client
  leadMeta?: string;
  channel: Channel;
  messages: Message[];
  status: "open" | "closed";
  topic?: string;
  links?: string[]; // order / repair ids
}

export interface Supplier {
  id: string;
  name: string;
  kind: "supplier";
  categories: string[];
  leadDays: number;
  onTime: number; // 0..1
  contact: string;
  phone: string;
  openPOs: number;
  spendYtd: number;
}

export interface ServicePartner {
  id: string;
  name: string;
  kind: "partner";
  short: string;
  brands: string[];
  area: string;
  avgDays: number;
  onTime: number;
  rating: number;
  contact: string;
  phone: string;
  loaners: boolean;
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  channel: Channel | "internal";
  enabled: boolean;
  runs30d: number;
  minutesSavedPerRun: number;
  lastRun?: Date;
  group: "Orders" | "Repairs" | "Payments" | "Messages" | "Stock" | "Growth";
}

export interface Campaign {
  id: string;
  name: string;
  audience: string;
  channel: Channel;
  sentAt?: Date;
  scheduledFor?: Date;
  recipients: number;
  read: number;
  replied: number;
  orders: number;
  revenue: number;
  status: "sent" | "scheduled" | "draft";
}

export interface Template {
  id: string;
  name: string;
  body: string;
  uses: number;
}

export interface Notification {
  id: string;
  at: Date;
  text: string;
  tone: "info" | "good" | "warn" | "bad";
  to: string;
  read: boolean;
}
