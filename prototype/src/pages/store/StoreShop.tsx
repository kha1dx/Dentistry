import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, Wrench } from "lucide-react";
import { CATEGORIES, KITS, YEAR_LABEL } from "@/data/catalog";
import type { Product, YearOfStudy } from "@/data/types";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/store/useStore";
import { Button, SearchInput, Select } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/overlays";
import { ProductArt } from "@/components/art/ProductArt";
import { KitCard, ProductCard } from "./parts";

export default function StoreShop() {
  const [params, setParams] = useSearchParams();
  const products = useStore((s) => s.products);
  const add = useStore((s) => s.addToCart);
  const year = params.get("year") ? (Number(params.get("year")) as YearOfStudy) : null;
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [view, setView] = useState<Product | null>(null);

  const list = useMemo(() => {
    let l = products.filter((p) => (!year || p.years.includes(year)) && (cat === "all" || p.category === cat) && (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase())));
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [products, year, cat, q, sort]);
  const kits = KITS.filter((k) => !year || k.year === year);
  const setYear = (y: YearOfStudy | null) => {
    const p = new URLSearchParams(params);
    if (y) p.set("year", String(y));
    else p.delete("year");
    setParams(p, { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6">
      <h1 className="font-display text-[48px] leading-none text-ink sm:text-[60px]">{year ? `${YEAR_LABEL[year]} shop` : "The shop"}</h1>
      <p className="mt-3 max-w-xl text-[15px] text-ink-2">Genuine instruments and materials, priced fairly and backed by a person who picks up the phone.</p>

      <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[null, 1, 2, 3, 4, 5, 6].map((y) => (
          <button
            key={String(y)}
            type="button"
            onClick={() => setYear(y as YearOfStudy | null)}
            className={cn("h-10 shrink-0 rounded-full border px-4 text-[14px] font-medium transition-colors", year === y ? "border-ink bg-ink text-surface" : "border-line bg-surface text-ink-2 hover:border-line-strong")}
          >
            {y ? YEAR_LABEL[y as YearOfStudy] : "All years"}
          </button>
        ))}
      </div>

      {kits.length > 0 && year && (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {kits.map((k) => (
            <KitCard key={k.id} k={k} />
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SearchInput placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-5 hidden lg:block">
            <div className="eyebrow mb-2">Category</div>
            <ul className="grid grid-cols-1 gap-0.5">
              {["all", ...CATEGORIES].map((c) => (
                <li key={c}>
                  <button type="button" onClick={() => setCat(c)} className={cn("w-full rounded-lg px-2.5 py-2 text-left text-[14px]", cat === c ? "bg-primary-soft font-medium text-primary-soft-ink" : "text-ink-2 hover:bg-surface-3")}>
                    {c === "all" ? "Everything" : c}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
            <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
              <option value="all">Everything</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="popular">Most popular</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </Select>
          </div>
        </aside>
        <div>
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <span className="text-[13.5px] text-ink-muted">{list.length} products</span>
            <Select className="w-52" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="popular">Most popular</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} onOpen={() => setView(p)} />
            ))}
          </div>
          {!list.length && <p className="py-16 text-center text-ink-muted">Nothing matches. Try another year or category, or ask in the chat.</p>}
        </div>
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={view?.brand ?? ""} width={760}>
        {view && (
          <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
            <ProductArt kind={view.art} category={view.category} fluid className="aspect-square w-full rounded-2xl" />
            <div className="flex flex-col">
              <h2 className="font-display text-[34px] leading-[1.05] text-ink">{view.name}</h2>
              <div className="mt-2 text-[22px] font-semibold text-ink tnum">{money(view.price)}</div>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{view.description}</p>
              <ul className="mt-4 grid grid-cols-1 gap-2 text-[13.5px] text-ink-2">
                <li>For: {view.years.length === 6 ? "all years" : view.years.map((y) => YEAR_LABEL[y]).join(", ")}</li>
                {view.warrantyMonths && (
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-good" /> {view.warrantyMonths}-month warranty, claims handled by us
                  </li>
                )}
                {view.serviceable && (
                  <li className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" /> Repairs with pickup and a loaner
                  </li>
                )}
                <li className={view.stock <= 3 ? "text-warn" : ""}>{view.stock <= 3 ? `Only ${view.stock} left` : "In stock · at your gate in 48 hours"}</li>
              </ul>
              <Button
                variant="primary"
                size="lg"
                className="mt-6"
                onClick={() => {
                  add(view.id);
                  setView(null);
                }}
              >
                Add to bag
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
