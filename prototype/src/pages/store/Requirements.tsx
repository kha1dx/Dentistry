import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { BRAND } from "@/config/brand";
import { KITS, REQUIREMENTS, UNIVERSITIES, YEAR_LABEL, kitRawPrice, product } from "@/data/catalog";
import type { Subject, YearOfStudy } from "@/data/types";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/store/useStore";
import { Button, Select } from "@/components/ui/primitives";
import { ProductArt } from "@/components/art/ProductArt";

export default function Requirements() {
  const [params, setParams] = useSearchParams();
  const me = useStore((s) => s.clients.find((c) => c.id === s.meId)!);
  const products = useStore((s) => s.products);
  const add = useStore((s) => s.addToCart);
  const startChat = useStore((s) => s.startChat);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const year = (Number(params.get("year")) || 3) as YearOfStudy;
  const [uniId, setUniId] = useState(params.get("uni") ?? "asu");
  const [have, setHave] = useState<Set<string>>(new Set(["p18", "p34"]));
  const list = REQUIREMENTS[year];
  const live = (id: string) => products.find((p) => p.id === id)!;

  const groups = useMemo(() => {
    const m = new Map<Subject, typeof list>();
    for (const r of list) {
      const s = product(r.productId).subject;
      m.set(s, [...(m.get(s) ?? []), r]);
    }
    return [...m.entries()];
  }, [list]);

  const needed = list.filter((r) => !have.has(r.productId));
  const requiredNeeded = needed.filter((r) => r.required);
  const total = requiredNeeded.reduce((s, r) => s + live(r.productId).price * r.qty, 0);
  // suggest kits fully covering still-needed items
  const kitTips = KITS.filter((k) => k.year === year)
    .map((k) => ({ k, covered: k.items.filter((i) => needed.some((n) => n.productId === i.productId)).length, saves: kitRawPrice(k) - k.price }))
    .filter((x) => x.covered >= Math.ceil(x.k.items.length * 0.75));

  const setYear = (y: YearOfStudy) => {
    const p = new URLSearchParams(params);
    p.set("year", String(y));
    setParams(p, { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6">
      <div className="max-w-2xl">
        <div className="eyebrow">Requirements list</div>
        <h1 className="mt-3 font-display text-[46px] leading-[0.98] text-ink sm:text-[60px]">Tick what you have. We'll handle the rest.</h1>
        <p className="mt-4 text-[15.5px] text-ink-2">Pick your faculty and year. Everything you still need goes in your bag in one tap, or send the list to {BRAND.owner.name} for a quote.</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center">
        <Select className="sm:w-72" value={uniId} onChange={(e) => setUniId(e.target.value)} aria-label="University">
          {UNIVERSITIES.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {([1, 2, 3, 4, 5, 6] as YearOfStudy[]).map((y) => (
            <button key={y} type="button" onClick={() => setYear(y)} className={cn("h-9 shrink-0 rounded-full border px-3.5 text-[13.5px] font-medium", y === year ? "border-ink bg-ink text-surface" : "border-line text-ink-2 hover:border-line-strong")}>
              {YEAR_LABEL[y]}
            </button>
          ))}
        </div>
        <span className="text-[12.5px] text-ink-muted sm:ml-auto">Updated for term 1, 2026 with class reps</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          {groups.map(([subject, rows]) => (
            <div key={subject} className="rounded-2xl border border-line bg-surface shadow-card">
              <div className="flex items-baseline justify-between border-b border-line px-5 py-3.5">
                <h2 className="font-display text-[24px] text-ink">{subject}</h2>
                <span className="text-[12.5px] text-ink-muted">
                  {rows.filter((r) => have.has(r.productId)).length} of {rows.length} ticked
                </span>
              </div>
              <ul>
                {rows.map((r) => {
                  const p = live(r.productId);
                  const ok = have.has(r.productId);
                  return (
                    <li key={r.productId} className="border-b border-line last:border-0">
                      <label className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-surface-2">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={ok}
                          onChange={() =>
                            setHave((h) => {
                              const n = new Set(h);
                              if (n.has(r.productId)) n.delete(r.productId);
                              else n.add(r.productId);
                              return n;
                            })
                          }
                        />
                        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary", ok ? "border-primary bg-primary text-primary-ink" : "border-line-strong")}>
                          {ok && <Check className="h-4 w-4" />}
                        </span>
                        <ProductArt kind={p.art} category={p.category} size={48} />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-[14.5px]", ok ? "text-ink-muted line-through decoration-line-strong" : "text-ink")}>
                            {r.qty > 1 && `${r.qty}× `}
                            {p.name}
                          </span>
                          <span className="text-[12.5px] text-ink-muted">
                            {p.brand}
                            {!r.required && " · optional"}
                            {ok && " · you have this"}
                          </span>
                        </span>
                        <span className={cn("text-[14px] font-medium tnum", ok ? "text-ink-muted" : "text-ink")}>{money(p.price * r.qty)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-pop">
            <div className="text-[13px] text-ink-muted">
              {UNIVERSITIES.find((u) => u.id === uniId)?.short} · {YEAR_LABEL[year]}
            </div>
            <div className="mt-1 font-display text-[30px] leading-tight text-ink">
              {requiredNeeded.length} {requiredNeeded.length === 1 ? "item" : "items"} to go
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${((list.length - needed.length) / list.length) * 100}%` }} />
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-ink-2">Required items</span>
              <span className="text-[22px] font-semibold text-ink tnum">{money(total)}</span>
            </div>
            {kitTips.map(({ k, saves }) => (
              <div key={k.id} className="mt-3 flex gap-2.5 rounded-xl bg-primary-soft px-3 py-2.5 text-[13px] text-ink-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  The <b className="font-medium text-ink">{k.name}</b> covers most of this and saves you {money(saves)}.{" "}
                  <button type="button" className="font-medium text-primary hover:underline" onClick={() => add(`kit:${k.id}`)}>
                    Add the kit
                  </button>
                </span>
              </div>
            ))}
            <Button
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              icon={<ShoppingBag className="h-4 w-4" />}
              disabled={!requiredNeeded.length}
              onClick={() => {
                requiredNeeded.forEach((r) => useStore.setState((s) => ({ cart: s.cart.some((c) => c.key === r.productId) ? s.cart : [...s.cart, { key: r.productId, qty: r.qty }] })));
                toast(`${requiredNeeded.length} items added to your bag`);
                nav("/shop/checkout");
              }}
            >
              Add all and check out
            </Button>
            <Button
              size="lg"
              className="mt-2 w-full"
              icon={<MessageCircle className="h-4 w-4" />}
              onClick={() => {
                startChat(`Hi ${BRAND.owner.name}, can I get a quote for my ${YEAR_LABEL[year]} list? I still need ${requiredNeeded.length} items (${money(total)} at list prices).`);
                toast(`Sent to ${BRAND.owner.name}. He'll reply with a quote shortly`, "info");
              }}
            >
              Send to {BRAND.owner.name} for a quote
            </Button>
            <p className="mt-3 text-center text-[12px] text-ink-muted">
              Signed in as {me.name}. <Link to="/shop/account" className="underline">Your account</Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
