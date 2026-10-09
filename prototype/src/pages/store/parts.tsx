import { Plus } from "lucide-react";
import { YEAR_LABEL, kitRawPrice, product } from "@/data/catalog";
import type { Kit, Product } from "@/data/types";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/store/useStore";
import { ProductArt } from "@/components/art/ProductArt";

export function ProductCard({ p, onOpen }: { p: Product; onOpen?: () => void }) {
  const add = useStore((s) => s.addToCart);
  const live = useStore((s) => s.products.find((x) => x.id === p.id) ?? p);
  return (
    <div className="group flex flex-col">
      <button type="button" onClick={onOpen} className="relative overflow-hidden rounded-2xl" aria-label={`View ${p.name}`}>
        <ProductArt kind={p.art} category={p.category} fluid className="aspect-[4/3.4] w-full rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]" />
        {live.stock <= 3 && <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2 py-0.5 text-[11.5px] font-medium text-warn">Only {live.stock} left</span>}
        {p.serviceable && <span className="absolute right-3 top-3 rounded-full bg-surface/90 px-2 py-0.5 text-[11.5px] font-medium text-primary">Repairs included</span>}
      </button>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] uppercase tracking-[0.08em] text-ink-muted">{p.brand}</div>
          <button type="button" onClick={onOpen} className="mt-0.5 text-left text-[15px] font-medium leading-snug text-ink hover:underline">
            {p.name}
          </button>
          <div className="mt-1 text-[12.5px] text-ink-muted">{p.years.length === 6 ? "All years" : p.years.map((y) => (y === 6 ? "Interns" : YEAR_LABEL[y].replace(" year", ""))).join(" · ")}</div>
        </div>
        <button
          type="button"
          onClick={() => add(p.id)}
          aria-label={`Add ${p.name} to bag`}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-primary hover:bg-primary hover:text-primary-ink"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-1.5 text-[15px] font-semibold text-ink tnum">{money(live.price)}</div>
    </div>
  );
}

export function KitCard({ k, className }: { k: Kit; className?: string }) {
  const add = useStore((s) => s.addToCart);
  const saves = kitRawPrice(k) - k.price;
  return (
    <div className={cn("flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[12px] font-medium text-primary-soft-ink">{YEAR_LABEL[k.year]}</span>
          <h3 className="mt-2 font-display text-[26px] leading-[1.05] text-ink">{k.name}</h3>
        </div>
        <ProductArt kind="kit" category="Kit" size={64} />
      </div>
      <p className="mt-2 text-[13.5px] text-ink-2">{k.blurb}</p>
      <ul className="mt-3 flex-1 space-y-1 text-[13px] text-ink-2">
        {k.items.slice(0, 4).map((i) => (
          <li key={i.productId} className="flex gap-2">
            <span className="text-ink-muted">{i.qty}×</span>
            <span className="truncate">{product(i.productId).name}</span>
          </li>
        ))}
        {k.items.length > 4 && <li className="text-ink-muted">+ {k.items.length - 4} more</li>}
      </ul>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
        <div>
          <div className="text-[20px] font-semibold text-ink tnum">{money(k.price)}</div>
          <div className="text-[12.5px] text-good">You save {money(saves)}</div>
        </div>
        <button type="button" onClick={() => add(`kit:${k.id}`)} className="h-10 rounded-xl bg-primary px-4 text-[13.5px] font-medium text-primary-ink hover:bg-primary-hover">
          Add kit
        </button>
      </div>
    </div>
  );
}

export function Section({ eyebrow, title, sub, children, className, action }: { eyebrow?: string; title: React.ReactNode; sub?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("mx-auto max-w-[1240px] px-4 sm:px-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
          <h2 className="font-display text-[36px] leading-[1.02] tracking-[-0.01em] text-ink sm:text-[44px]">{title}</h2>
          {sub && <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
