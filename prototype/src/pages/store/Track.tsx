import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check, Clock3, MessageCircle, PhoneCall, Search, ShieldCheck } from "lucide-react";
import { BRAND, NOW } from "@/config/brand";
import { orderTotal } from "@/data/seed";
import type { Order, Repair } from "@/data/types";
import { cn } from "@/lib/cn";
import { dateTime, money } from "@/lib/format";
import { ORDER_STAGES, REPAIR_STAGES, useStore } from "@/store/useStore";
import { Avatar, Button } from "@/components/ui/primitives";
import { ProductArt } from "@/components/art/ProductArt";

const ORDER_CLIENT: Record<string, string> = {
  new: "We've got your order",
  quoted: "Quote sent, waiting for you",
  confirmed: "Confirmed and being prepared",
  sourcing: "Getting the last items from the supplier",
  ready: "Packed and ready",
  out: "On the way to you",
  delivered: "Delivered",
};

export default function Track() {
  const { code } = useParams();
  const nav = useNavigate();
  const [q, setQ] = useState(code ?? "");
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const meId = useStore((s) => s.meId);
  const id = (code ?? "").toUpperCase();
  const order = orders.find((o) => o.id === id);
  const repair = repairs.find((r) => r.id === id);
  const mine = [...repairs.filter((r) => r.clientId === meId && r.stage !== "returned"), ...orders.filter((o) => o.clientId === meId && o.stage !== "delivered" && o.stage !== "cancelled")];

  return (
    <div className="mx-auto max-w-[880px] px-4 pt-10 sm:px-6">
      <div className="eyebrow">Tracking</div>
      <h1 className="mt-3 font-display text-[46px] leading-none text-ink sm:text-[56px]">Where's my order?</h1>
      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) nav(`/shop/track/${q.trim().toUpperCase()}`);
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input id="track-code" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order or repair code, e.g. CU-1851 or RP-1209" className="h-12 w-full rounded-xl border border-line bg-surface pl-10 pr-3 font-mono text-[14.5px] text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-primary focus:outline-none" />
        </div>
        <Button type="submit" variant="primary" size="lg">
          Track
        </Button>
      </form>

      {!code && mine.length > 0 && (
        <div className="mt-8">
          <div className="eyebrow mb-3">Yours right now</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mine.map((x) => (
              <Link key={x.id} to={`/shop/track/${x.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card hover:border-primary">
                <ProductArt kind={"art" in x ? x.art : "kit"} category={"art" in x ? "Handpieces & motors" : "Kit"} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[12.5px] text-ink-muted">{x.id}</div>
                  <div className="truncate text-[14.5px] font-medium text-ink">{"device" in x ? x.device : x.items[0]?.name}</div>
                  <div className="text-[12.5px] text-primary">{"device" in x ? REPAIR_STAGES.find((s) => s.id === x.stage)?.client : ORDER_CLIENT[x.stage]}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-muted" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {code && !order && !repair && <p className="mt-8 rounded-xl bg-warn-soft px-4 py-3 text-[14px] text-ink-2">We couldn't find {id}. Check the code in your WhatsApp messages, or ask in the chat.</p>}
      {repair && <RepairTrack r={repair} />}
      {order && <OrderTrack o={order} />}
    </div>
  );
}

function Steps({ steps, idx }: { steps: string[]; idx: number }) {
  return (
    <ol className="mt-6 grid grid-cols-1 gap-0">
      {steps.map((s, i) => (
        <li key={s} className="relative flex gap-4 pb-5 last:pb-0">
          {i < steps.length - 1 && <span className={cn("absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5", i < idx ? "bg-primary" : "bg-line")} aria-hidden />}
          <span className={cn("relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold", i < idx ? "bg-primary text-primary-ink" : i === idx ? "bg-primary-soft text-primary-soft-ink ring-2 ring-primary" : "border border-line-strong bg-surface text-ink-muted")}>
            {i < idx ? <Check className="h-4 w-4" /> : i + 1}
          </span>
          <span className={cn("pt-0.5 text-[15px]", i === idx ? "font-semibold text-ink" : i < idx ? "text-ink" : "text-ink-muted")}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Contact() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <Avatar name={BRAND.owner.fullName} size={44} />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-medium text-ink">{BRAND.owner.name} is looking after this</div>
        <div className="text-[12.5px] text-ink-muted">Replies in about 6 minutes · {BRAND.hours}</div>
      </div>
      <span className="hidden gap-1.5 sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-ink" title="Use the chat button below">
          <MessageCircle className="h-4 w-4" />
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-3 text-ink-2" title={BRAND.phone}>
          <PhoneCall className="h-4 w-4" />
        </span>
      </span>
    </div>
  );
}

function RepairTrack({ r }: { r: Repair }) {
  const approve = useStore((s) => s.approveRepair);
  const toast = useStore((s) => s.toast);
  const idx = REPAIR_STAGES.findIndex((s) => s.id === r.stage);
  const late = r.stage !== "returned" && r.promisedAt < NOW;
  return (
    <div className="mt-8 grid grid-cols-1 gap-5">
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-pop">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[13px] text-ink-muted">{r.id}</div>
            <h2 className="mt-1 font-display text-[34px] leading-tight text-ink">{r.device}</h2>
            <div className="mt-1 text-[14px] text-ink-2">“{r.issue}”</div>
          </div>
          <ProductArt kind={r.art} category="Handpieces & motors" size={84} />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-[12px] text-ink-muted">Status</div>
            <div className="text-[15px] font-semibold text-ink">{REPAIR_STAGES[idx].client}</div>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-[12px] text-ink-muted">{r.stage === "returned" ? "Returned" : "Expected back"}</div>
            <div className={cn("text-[15px] font-semibold", late ? "text-warn" : "text-ink")}>
              {(r.returnedAt ?? r.promisedAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
            </div>
            {late && <div className="text-[12px] text-ink-2">A little later than planned. {BRAND.owner.name} is chasing the service centre.</div>}
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-[12px] text-ink-muted">{r.warranty ? "Cost" : "Price"}</div>
            <div className="text-[15px] font-semibold text-ink">{r.warranty ? "Covered by warranty" : r.price ? money(r.price) : "After diagnosis"}</div>
          </div>
        </div>
        {r.loaner && (
          <div className="mt-3 flex items-center gap-2 text-[13.5px] text-info">
            <ShieldCheck className="h-4 w-4" /> You have a loaner: {r.loaner}
          </div>
        )}
        {r.stage === "approval" && (
          <div className="mt-5 rounded-2xl bg-warn-soft p-4">
            <div className="text-[15px] font-medium text-ink">The service centre needs your OK</div>
            <div className="mt-1 text-[13.5px] text-ink-2">Repair price {money(r.price ?? 0)}, including pickup and return and a 3-month repair warranty.</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => approve(r.id)}>
                Approve {money(r.price ?? 0)}
              </Button>
              <Button onClick={() => toast(`${BRAND.owner.name} will call you about the price`, "info")}>Call me first</Button>
            </div>
          </div>
        )}
        <Steps steps={REPAIR_STAGES.map((s) => s.client)} idx={idx} />
      </div>
      <Contact />
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="eyebrow mb-3">History</div>
        <ul className="grid grid-cols-1 gap-2 text-[13.5px]">
          {[...r.timeline]
            .filter((e) => e.kind !== "partner" || !e.text.includes("EGP"))
            .reverse()
            .map((e, i) => (
              <li key={i} className="flex gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                <span className="flex-1 text-ink-2">{e.text.replace(" (auto)", "")}</span>
                <span className="shrink-0 text-[12px] text-ink-muted">{dateTime(e.at)}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

function OrderTrack({ o }: { o: Order }) {
  const idx = ORDER_STAGES.findIndex((s) => s.id === o.stage);
  const total = orderTotal(o);
  return (
    <div className="mt-8 grid grid-cols-1 gap-5">
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-pop">
        <div className="font-mono text-[13px] text-ink-muted">{o.id}</div>
        <h2 className="mt-1 font-display text-[34px] leading-tight text-ink">{ORDER_CLIENT[o.stage] ?? "Cancelled"}</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-[12px] text-ink-muted">{o.stage === "delivered" ? "Delivered" : "Expected"}</div>
            <div className="text-[15px] font-semibold text-ink">{(o.deliveredAt ?? o.promisedAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}</div>
            {o.delivery.slot && <div className="text-[12.5px] text-ink-2">{o.delivery.slot}</div>}
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-[12px] text-ink-muted">Where</div>
            <div className="text-[14px] font-semibold text-ink">{o.delivery.place}</div>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-[12px] text-ink-muted">Payment</div>
            <div className="text-[15px] font-semibold text-ink">{o.paid >= total ? "Paid" : `${money(total - o.paid)} to pay`}</div>
            {o.paid < total && <div className="text-[12.5px] text-ink-2">InstaPay or cash on delivery</div>}
          </div>
        </div>
        <Steps steps={ORDER_STAGES.filter((s) => s.id !== "sourcing" || o.stage === "sourcing").map((s) => ORDER_CLIENT[s.id])} idx={Math.max(0, ORDER_STAGES.filter((s) => s.id !== "sourcing" || o.stage === "sourcing").findIndex((s) => s.id === o.stage))} />
        <div className="mt-6 border-t border-line pt-4">
          <ul className="grid grid-cols-1 gap-1.5 text-[13.5px]">
            {o.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3 text-ink-2">
                <span className="truncate">
                  {i.qty}× {i.name}
                </span>
                <span className="shrink-0 tnum">{money(i.qty * i.price)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-line pt-2 font-semibold text-ink">
              <span>Total</span>
              <span className="tnum">{money(total)}</span>
            </li>
          </ul>
        </div>
      </div>
      {idx >= 0 && <Contact />}
    </div>
  );
}
