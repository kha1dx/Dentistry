import { Globe, Instagram, Mail, MessageCircle, PhoneCall, Store } from "lucide-react";
import type { Channel, OrderStage, RepairStage } from "@/data/types";
import { cn } from "@/lib/cn";
import { invoiceStatus, type InvoiceStatus } from "@/lib/metrics";
import type { Invoice } from "@/data/types";
import { Badge, type Tone } from "./primitives";

export const CHANNEL_META: Record<Channel, { label: string; Icon: typeof Globe; tint: string }> = {
  whatsapp: { label: "WhatsApp", Icon: MessageCircle, tint: "text-good" },
  webchat: { label: "Website", Icon: Globe, tint: "text-info" },
  instagram: { label: "Instagram", Icon: Instagram, tint: "text-violet" },
  call: { label: "Call", Icon: PhoneCall, tint: "text-warn" },
  email: { label: "Email", Icon: Mail, tint: "text-ink-2" },
  walkin: { label: "Campus", Icon: Store, tint: "text-primary" },
};

export function ChannelIcon({ channel, className, withLabel }: { channel: Channel; className?: string; withLabel?: boolean }) {
  const m = CHANNEL_META[channel];
  return (
    <span className={cn("relative inline-flex items-center gap-1 text-[12px] text-ink-muted", className)} title={m.label}>
      <m.Icon className={cn("h-3.5 w-3.5", m.tint)} aria-hidden />
      {withLabel ? m.label : <span className="sr-only">{m.label}</span>}
    </span>
  );
}

const ORDER_TONE: Record<OrderStage, Tone> = {
  new: "info",
  quoted: "violet",
  confirmed: "primary",
  sourcing: "warn",
  ready: "primary",
  out: "info",
  delivered: "good",
  cancelled: "neutral",
};
const ORDER_LABEL: Record<OrderStage, string> = {
  new: "New",
  quoted: "Quoted",
  confirmed: "Confirmed",
  sourcing: "Sourcing",
  ready: "Ready",
  out: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export function OrderStagePill({ stage }: { stage: OrderStage }) {
  return (
    <Badge tone={ORDER_TONE[stage]} dot>
      {ORDER_LABEL[stage]}
    </Badge>
  );
}

const REPAIR_TONE: Record<RepairStage, Tone> = {
  received: "info",
  at_partner: "violet",
  diagnosis: "violet",
  approval: "warn",
  repairing: "primary",
  qc: "primary",
  returned: "good",
};
const REPAIR_LABEL: Record<RepairStage, string> = {
  received: "Received",
  at_partner: "At partner",
  diagnosis: "Diagnosis",
  approval: "Needs approval",
  repairing: "Repairing",
  qc: "Back with us",
  returned: "Returned",
};
export function RepairStagePill({ stage }: { stage: RepairStage }) {
  return (
    <Badge tone={REPAIR_TONE[stage]} dot>
      {REPAIR_LABEL[stage]}
    </Badge>
  );
}

export function PaymentPill({ total, paid }: { total: number; paid: number }) {
  if (total <= 0) return <Badge tone="neutral">No charge</Badge>;
  if (paid >= total) return <Badge tone="good">Paid</Badge>;
  if (paid > 0) return <Badge tone="warn">Part paid</Badge>;
  return <Badge tone="neutral">Unpaid</Badge>;
}

const INV: Record<InvoiceStatus, { tone: Tone; label: string }> = {
  paid: { tone: "good", label: "Paid" },
  partial: { tone: "warn", label: "Part paid" },
  due: { tone: "neutral", label: "Due" },
  overdue: { tone: "bad", label: "Overdue" },
};
export function InvoicePill({ invoice }: { invoice: Invoice }) {
  const s = INV[invoiceStatus(invoice)];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[12.5px] tracking-tight text-ink-2", className)}>{children}</span>;
}

/** Endo-file ISO colour stripe (15 white, 20 yellow, 25 red, 30 blue, 35 green, 40 black). Used as a subtle brand mark. */
export function IsoStripe({ className }: { className?: string }) {
  const c = ["#f4f4f1", "#f2c230", "#d8423b", "#2f6fdb", "#2e9e6a", "#1d1f1e"];
  return (
    <span className={cn("inline-flex overflow-hidden rounded-[3px] ring-1 ring-black/10", className)} aria-hidden>
      {c.map((x) => (
        <span key={x} className="h-full w-[5px]" style={{ background: x }} />
      ))}
    </span>
  );
}
