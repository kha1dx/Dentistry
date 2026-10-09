import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Plus, Star } from "lucide-react";
import { YEAR_LABEL, kitRawPrice } from "@/data/catalog";
import type { ArtKind, Category, Kit, Product } from "@/data/types";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/store/useStore";
import { ProductArt } from "@/components/art/ProductArt";

/** Soft background per category, like the tinted product tiles in the references. */
export const CAT_TINT: Record<Category | "Kit", string> = {
  "Handpieces & motors": "bg-tint-sky",
  "Hand instruments": "bg-tint-lavender",
  "Burs & rotary": "bg-tint-peach",
  "Typodonts & teeth": "bg-tint-rose",
  Materials: "bg-tint-lavender",
  Endo: "bg-tint-lemon",
  "Lab & PPE": "bg-tint-mint",
  Kit: "bg-tint-lavender",
};

/* Sample ratings so cards look like a real shop; derived from the product id so they stay stable. */
const rating = (id: string) => 4.5 + ((id.charCodeAt(id.length - 1) % 5) / 10);

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(value) ? "fill-[#f5a524] text-[#f5a524]" : "text-line-strong")} />
      ))}
    </span>
  );
}

export function ProductCard({ p, onOpen }: { p: Product; onOpen?: () => void }) {
  const add = useStore((s) => s.addToCart);
  const live = useStore((s) => s.products.find((x) => x.id === p.id) ?? p);
  return (
    <div className="group flex flex-col">
      <div className={cn("relative overflow-hidden rounded-[22px]", CAT_TINT[p.category])}>
        <button type="button" onClick={onOpen} className="block w-full" aria-label={`View ${p.name}`}>
          <ProductArt kind={p.art} category={p.category} fluid tile={false} className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.04]" />
        </button>
        {live.stock <= 3 ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#f2683c] px-2.5 py-1 text-[11.5px] font-bold text-white">Only {live.stock} left</span>
        ) : (
          p.serviceable && <span className="absolute left-3 top-3 rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-bold text-ink">Repairs included</span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-surface px-2.5 py-1 text-[12.5px] font-extrabold text-ink tnum">{money(live.price)}</span>
        <button
          type="button"
          onClick={() => add(p.id)}
          className="absolute inset-x-3 bottom-3 flex h-10 items-center justify-center gap-1.5 rounded-full bg-surface text-[13.5px] font-bold text-ink shadow-card transition-all hover:bg-ink hover:text-surface sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <Plus className="h-4 w-4" /> Add to bag
        </button>
      </div>
      <button type="button" onClick={onOpen} className="mt-3 text-left text-[15px] font-bold leading-snug text-ink hover:underline">
        {p.name}
      </button>
      <div className="mt-1 flex items-center gap-2 text-[12.5px] font-semibold text-ink-muted">
        <Stars value={rating(p.id)} />
        <span>{p.brand}</span>
      </div>
    </div>
  );
}

export function KitCard({ k, className }: { k: Kit; className?: string }) {
  const add = useStore((s) => s.addToCart);
  const saves = kitRawPrice(k) - k.price;
  return (
    <div className={cn("group relative flex flex-col overflow-hidden rounded-[22px] bg-tint-lavender p-5", className)}>
      <span className="w-fit rounded-full bg-surface px-2.5 py-1 text-[12px] font-bold text-ink">{YEAR_LABEL[k.year]}</span>
      <ProductArt kind="kit" category="Kit" fluid tile={false} className="mx-auto my-2 aspect-[4/3] w-4/5" />
      <h3 className="text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{k.name}</h3>
      <p className="mt-1 text-[13px] font-semibold text-ink-2">
        {k.items.length} items · you save {money(saves)}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[20px] font-extrabold text-ink tnum">{money(k.price)}</span>
        <button type="button" onClick={() => add(`kit:${k.id}`)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13.5px] font-bold text-surface hover:opacity-90">
          <Plus className="h-4 w-4" /> Add kit
        </button>
      </div>
    </div>
  );
}

export function CategoryCard({ to, label, art, category, sub, active }: { to: string; label: string; art: ArtKind; category: Category; sub?: string; active?: boolean }) {
  return (
    <Link to={to} className={cn("group relative flex flex-col items-center overflow-hidden rounded-[22px] px-4 pb-5 pt-4 text-center transition-transform hover:-translate-y-1", CAT_TINT[category])}>
      <span className={cn("absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors", active ? "bg-primary text-primary-ink" : "bg-surface text-ink group-hover:bg-primary group-hover:text-primary-ink")}>
        <ArrowUpRight className="h-4 w-4" />
      </span>
      <ProductArt kind={art} category={category} fluid tile={false} className="aspect-square w-[78%]" />
      <span className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">{label}</span>
      {sub && <span className="mt-0.5 text-[12.5px] font-semibold text-ink-muted">{sub}</span>}
    </Link>
  );
}

export function Section({ title, sub, children, className, action }: { eyebrow?: string; title: ReactNode; sub?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("mx-auto max-w-[1240px] px-4 sm:px-6", className)}>
      <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-[30px]">{title}</h2>
          {sub && <p className="mt-1 text-[14.5px] font-medium text-ink-muted">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function SeeAll({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ink hover:text-primary">
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
