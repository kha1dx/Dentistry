import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { BRAND } from "@/config/brand";
import { UNIVERSITIES, YEAR_LABEL, uni } from "@/data/catalog";
import type { PaymentMethod, YearOfStudy } from "@/data/types";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { cartLines, useStore } from "@/store/useStore";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { ProductArt } from "@/components/art/ProductArt";

const PAY: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: "InstaPay", label: "InstaPay", sub: "Transfer now, send the screenshot" },
  { id: "Vodafone Cash", label: "Vodafone Cash", sub: "Wallet transfer" },
  { id: "Cash", label: "Cash on delivery", sub: "Pay when you receive it" },
  { id: "Card", label: "Card", sub: "Secure payment link on WhatsApp" },
];

export default function Checkout() {
  const me = useStore((s) => s.clients.find((c) => c.id === s.meId)!);
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const place = useStore((s) => s.placeOrder);
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [uniId, setUniId] = useState(me.universityId);
  const [year, setYear] = useState<YearOfStudy>(me.year);
  const [delivery, setDelivery] = useState<"campus" | "pickup" | "courier">("campus");
  const [slot, setSlot] = useState("Saturday, 14:00–16:00");
  const [method, setMethod] = useState<PaymentMethod>("InstaPay");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const lines = cartLines(cart, products);
  const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const fee = delivery === "courier" ? 75 : 0;

  if (done)
    return (
      <div className="mx-auto max-w-[640px] px-4 pt-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-good-soft text-good">
          <Check className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-display text-[48px] leading-none text-ink">Order received</h1>
        <p className="mt-3 text-[15.5px] text-ink-2">
          Your order <span className="font-mono font-medium text-ink">{done}</span> is in. {BRAND.owner.name} will confirm availability and your delivery slot on WhatsApp within 15 minutes.
        </p>
        {method === "InstaPay" && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line bg-surface p-4 text-left shadow-card">
            <div className="text-[13px] text-ink-muted">Pay by InstaPay to</div>
            <div className="select-all font-mono text-[16px] text-ink">cusp@instapay</div>
            <div className="mt-1 text-[12.5px] text-ink-muted">Send the screenshot in the chat and it's confirmed straight away.</div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={`/shop/track/${done}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14.5px] font-medium text-primary-ink hover:bg-primary-hover">
            Track your order <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/admin/orders?stage=new" className="inline-flex h-11 items-center rounded-xl border border-dashed border-violet/40 bg-violet-soft px-5 text-[13.5px] font-medium text-violet">
            Prototype: see it arrive in the console ↗
          </Link>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-10 sm:px-6">
      <h1 className="font-display text-[46px] leading-none text-ink sm:text-[56px]">Checkout</h1>
      <form
        className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
        onSubmit={(e) => {
          e.preventDefault();
          const place_ = delivery === "campus" ? uni(uniId).campus : delivery === "pickup" ? "Pickup point, Dokki" : "Courier to your address";
          const id = place({ name, phone, universityId: uniId, year, delivery: { type: delivery, place: place_, slot }, method, notes });
          setDone(id);
          window.scrollTo({ top: 0 });
        }}
      >
        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className="mb-3 text-[16px] font-semibold text-ink">You</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <Input id="co-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field label="WhatsApp number">
                <Input id="co-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="font-mono" required />
              </Field>
              <Field label="University">
                <Select value={uniId} onChange={(e) => setUniId(e.target.value)}>
                  {UNIVERSITIES.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Year">
                <Select value={year} onChange={(e) => setYear(Number(e.target.value) as YearOfStudy)}>
                  {Object.entries(YEAR_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-semibold text-ink">Delivery</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  ["campus", "Faculty gate", uni(uniId).campus, "Free"],
                  ["pickup", "Pickup point", "Dokki, 12–8pm", "Free"],
                  ["courier", "Courier", "Anywhere in Cairo", "EGP 75"],
                ] as const
              ).map(([id, t, s, price]) => (
                <button key={id} type="button" onClick={() => setDelivery(id)} className={cn("rounded-2xl border p-4 text-left", delivery === id ? "border-primary bg-primary-soft/50 ring-1 ring-primary" : "border-line bg-surface hover:border-line-strong")}>
                  <div className="flex justify-between gap-2">
                    <span className="text-[14.5px] font-medium text-ink">{t}</span>
                    <span className="text-[12.5px] text-ink-2">{price}</span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-ink-muted">{s}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Saturday, 14:00–16:00", "Saturday, 16:00–18:00", "Sunday, 12:00–14:00", "Monday, 14:00–16:00"].map((s) => (
                <button key={s} type="button" onClick={() => setSlot(s)} className={cn("rounded-full border px-3 py-1.5 text-[13px]", slot === s ? "border-primary bg-primary-soft text-primary-soft-ink" : "border-line bg-surface text-ink-2")}>
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[16px] font-semibold text-ink">Payment</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PAY.map((p) => (
                <button key={p.id} type="button" onClick={() => setMethod(p.id)} className={cn("flex items-center gap-3 rounded-2xl border p-4 text-left", method === p.id ? "border-primary bg-primary-soft/50 ring-1 ring-primary" : "border-line bg-surface hover:border-line-strong")}>
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", method === p.id ? "border-primary" : "border-line-strong")}>{method === p.id && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}</span>
                  <span>
                    <span className="block text-[14.5px] font-medium text-ink">{p.label}</span>
                    <span className="text-[12.5px] text-ink-muted">{p.sub}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Field label="Anything we should know?">
                <Textarea id="co-notes" rows={2} placeholder="e.g. name to embroider on the coat, or a deadline" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-pop">
            <h2 className="font-display text-[26px] text-ink">Your order</h2>
            <ul className="mt-3 grid grid-cols-1 gap-3">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3">
                  <ProductArt kind={l.art} category={products.find((p) => p.id === l.key)?.category ?? "Kit"} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] text-ink">{l.name}</span>
                    <span className="text-[12px] text-ink-muted">× {l.qty}</span>
                  </span>
                  <span className="text-[13.5px] text-ink tnum">{money(l.price * l.qty)}</span>
                </li>
              ))}
              {!lines.length && <li className="text-[13.5px] text-ink-muted">Your bag is empty.</li>}
            </ul>
            <div className="mt-4 grid grid-cols-1 gap-1.5 border-t border-line pt-4 text-[14px]">
              <div className="flex justify-between text-ink-2">
                <span>Items</span>
                <span className="tnum">{money(sub)}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>Delivery</span>
                <span className="tnum">{fee ? money(fee) : "Free"}</span>
              </div>
              <div className="mt-1 flex justify-between text-[18px] font-semibold text-ink">
                <span>Total</span>
                <span className="tnum">{money(sub + fee)}</span>
              </div>
            </div>
            <Button type="submit" variant="primary" size="lg" className="mt-5 w-full" disabled={!lines.length}>
              Place order
            </Button>
            <p className="mt-2 text-center text-[12px] text-ink-muted">Nothing is charged until {BRAND.owner.name} confirms availability.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
