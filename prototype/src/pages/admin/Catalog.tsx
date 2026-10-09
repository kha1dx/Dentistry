import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Percent, Plus, Share2, ShoppingCart } from "lucide-react";
import { CATEGORIES, KITS, YEAR_LABEL, kitCost, kitRawPrice, product, supplier } from "@/data/catalog";
import type { Category, Product } from "@/data/types";
import { cn } from "@/lib/cn";
import { money, num, num1, pct, shortName } from "@/lib/format";
import { lowStock, unitsSold } from "@/lib/metrics";
import { useStore } from "@/store/useStore";
import { Badge, Button, Card, Field, Input, PageHeader, SearchInput, Segmented, Select, Stat } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/overlays";
import { ProductArt } from "@/components/art/ProductArt";

type Tab = "products" | "kits" | "stock";

const marginTone = (m: number) => (m < 0.2 ? "text-bad" : m < 0.25 ? "text-warn" : "text-good");

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const products = useStore((s) => s.products);
  const orders = useStore((s) => s.orders);
  const toast = useStore((s) => s.toast);
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) ?? "products");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState<string>(params.get("cat") ?? "all");
  const [pricing, setPricing] = useState(false);
  const sold = useMemo(() => unitsSold(orders, 30), [orders]);
  const stockValue = products.reduce((s, p) => s + p.cost * p.stock, 0);
  const avgMargin = products.reduce((s, p) => s + (p.price - p.cost) / p.price, 0) / products.length;
  const low = lowStock(products, sold);

  const list = products.filter((p) => (cat === "all" || p.category === cat) && (!q || `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader
        title="Catalog & pricing"
        sub="One price list for the storefront, your quotes and the kits. Change a price once and it's right everywhere."
        actions={
          <>
            <Button icon={<Share2 className="h-4 w-4" />} onClick={() => toast("Price list PDF ready to send on WhatsApp", "info")}>
              Share price list
            </Button>
            <Button icon={<Percent className="h-4 w-4" />} onClick={() => setPricing(true)}>
              Change prices
            </Button>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => toast("New product form opened", "info")}>
              Add product
            </Button>
          </>
        }
      />
      <Card className="mt-5 grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
        <Stat label="Products" value={products.length} sub={`${KITS.length} kits`} />
        <Stat label="Stock value at cost" value={money(stockValue)} />
        <Stat label="Average margin" value={pct(avgMargin, 1)} sub="Across the price list" />
        <Stat label="Below reorder point" value={low.length} tone={low.length ? "warn" : "good"} sub="Before the term rush" />
      </Card>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented
          value={tab}
          onChange={(t) => {
            setTab(t);
            const p = new URLSearchParams(params);
            p.set("tab", t);
            setParams(p, { replace: true });
          }}
          options={[
            { id: "products", label: "Products", count: products.length },
            { id: "kits", label: "Kits", count: KITS.length },
            { id: "stock", label: "Stock", count: low.length },
          ]}
        />
        {tab === "products" && (
          <div className="flex gap-2">
            <SearchInput className="w-full sm:w-64" placeholder="Name, SKU or brand" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select className="w-48 shrink-0" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {tab === "products" && (
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead className="border-b border-line bg-surface-2 text-[12px] text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 text-right font-medium">Cost</th>
                  <th className="px-4 py-2.5 text-right font-medium">Price</th>
                  <th className="px-4 py-2.5 text-right font-medium">Margin</th>
                  <th className="px-4 py-2.5 text-right font-medium">In stock</th>
                  <th className="px-4 py-2.5 text-right font-medium">Sold 30d</th>
                  <th className="px-4 py-2.5 font-medium">Years</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const m = (p.price - p.cost) / p.price;
                  return (
                    <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <ProductArt kind={p.art} category={p.category} size={40} />
                          <div className="min-w-0">
                            <div className="font-medium text-ink">{p.name}</div>
                            <div className="text-[12px] text-ink-muted">
                              {p.brand} · <span className="font-mono">{p.sku}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-ink-2">{p.category}</td>
                      <td className="px-4 py-2 text-right text-ink-muted tnum">{money(p.cost)}</td>
                      <td className="px-4 py-2 text-right font-medium text-ink tnum">{money(p.price)}</td>
                      <td className={cn("px-4 py-2 text-right font-medium tnum", marginTone(m))}>{pct(m)}</td>
                      <td className={cn("px-4 py-2 text-right tnum", p.stock <= p.reorderPoint ? "font-medium text-warn" : "text-ink-2")}>{p.stock}</td>
                      <td className="px-4 py-2 text-right text-ink-2 tnum">{sold.get(p.id) ?? 0}</td>
                      <td className="px-4 py-2">
                        <span className="text-[12px] text-ink-muted">{p.years.length === 6 ? "All years" : p.years.map((y) => (y === 6 ? "Intern" : `Y${y}`)).join(" · ")}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "kits" && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {KITS.map((k) => {
            const raw = kitRawPrice(k);
            const cost = kitCost(k);
            const m = (k.price - cost) / k.price;
            return (
              <Card key={k.id} className="flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <ProductArt kind="kit" category="Kit" size={52} />
                  <div className="min-w-0 flex-1">
                    <Badge tone="primary">{YEAR_LABEL[k.year]}</Badge>
                    <div className="mt-1 font-semibold text-ink">{k.name}</div>
                    <div className="text-[12.5px] text-ink-muted">{k.blurb}</div>
                  </div>
                </div>
                <ul className="mt-3 flex-1 border-t border-line pt-2 text-[12.5px] text-ink-2">
                  {k.items.map((i) => (
                    <li key={i.productId} className="flex justify-between gap-2 py-1">
                      <span className="truncate">
                        {i.qty > 1 && `${i.qty}× `}
                        {product(i.productId).name}
                      </span>
                      <span className="shrink-0 text-ink-muted tnum">{money(product(i.productId).price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-[12px]">
                  <div>
                    <div className="text-ink-muted">Kit price</div>
                    <div className="text-[14px] font-semibold text-ink tnum">{money(k.price)}</div>
                  </div>
                  <div>
                    <div className="text-ink-muted">Student saves</div>
                    <div className="text-[14px] font-semibold text-good tnum">{money(raw - k.price)}</div>
                  </div>
                  <div>
                    <div className="text-ink-muted">Your margin</div>
                    <div className={cn("text-[14px] font-semibold tnum", marginTone(m))}>{pct(m)}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "stock" && <StockTable products={products} sold={sold} />}

      <PricingModal open={pricing} onClose={() => setPricing(false)} />
    </div>
  );
}

function StockTable({ products, sold }: { products: Product[]; sold: Map<string, number> }) {
  const toast = useStore((s) => s.toast);
  const rows = products
    .map((p) => {
      const perWeek = (sold.get(p.id) ?? 0) / 4.3;
      const cover = perWeek ? p.stock / perWeek : Infinity;
      const lead = supplier(p.supplierId).leadDays;
      // keep 3 weeks of term-start demand on hand after the supplier lead time
      const target = Math.ceil(perWeek * (lead / 7 + 3));
      const suggest = Math.max(0, Math.max(target, p.reorderPoint * 2) - p.stock);
      return { p, perWeek, cover, lead, suggest };
    })
    .sort((a, b) => a.cover - b.cover);
  const bySupplier = new Map<string, number>();
  for (const r of rows) if (r.p.stock <= r.p.reorderPoint && r.suggest) bySupplier.set(r.p.supplierId, (bySupplier.get(r.p.supplierId) ?? 0) + r.suggest * r.p.cost);
  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[...bySupplier.entries()].map(([sid, value]) => (
          <Card key={sid} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="truncate font-medium text-ink">{supplier(sid).name}</div>
              <div className="text-[12.5px] text-ink-muted">
                Suggested order {money(value)} · {supplier(sid).leadDays} days lead
              </div>
            </div>
            <Button size="sm" variant="soft" icon={<ShoppingCart className="h-3.5 w-3.5" />} onClick={() => toast(`Purchase order sent to ${supplier(sid).name} on WhatsApp`, "good")}>
              Order
            </Button>
          </Card>
        ))}
      </div>
      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead className="border-b border-line bg-surface-2 text-[12px] text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 text-right font-medium">In stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Reorder at</th>
                <th className="px-4 py-2.5 text-right font-medium">Sells / week</th>
                <th className="px-4 py-2.5 text-right font-medium">Weeks left</th>
                <th className="px-4 py-2.5 font-medium">Supplier</th>
                <th className="px-4 py-2.5 text-right font-medium">Suggested order</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, perWeek, cover, lead, suggest }) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <ProductArt kind={p.art} category={p.category} size={34} />
                      <span className="font-medium text-ink">{shortName(p.name)}</span>
                    </div>
                  </td>
                  <td className={cn("px-4 py-2 text-right font-medium tnum", p.stock <= p.reorderPoint ? "text-warn" : "text-ink")}>{p.stock}</td>
                  <td className="px-4 py-2 text-right text-ink-muted tnum">{p.reorderPoint}</td>
                  <td className="px-4 py-2 text-right text-ink-2 tnum">{num1(perWeek)}</td>
                  <td className={cn("px-4 py-2 text-right tnum", cover < 2 ? "font-medium text-bad" : cover < 4 ? "text-warn" : "text-ink-2")}>{cover === Infinity ? "—" : num1(cover)}</td>
                  <td className="px-4 py-2 text-ink-2">
                    {supplier(p.supplierId).name} <span className="text-ink-muted">· {lead} d</span>
                  </td>
                  <td className="px-4 py-2 text-right tnum">{p.stock <= p.reorderPoint && suggest ? <Badge tone="warn">+{num(suggest)}</Badge> : <span className="text-ink-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function PricingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const products = useStore((s) => s.products);
  const apply = useStore((s) => s.applyPrices);
  const [scope, setScope] = useState<Category | "all">("Handpieces & motors");
  const [change, setChange] = useState(8);
  const [round, setRound] = useState(50);
  const [floor, setFloor] = useState(25);
  const preview = useMemo(
    () =>
      products
        .filter((p) => scope === "all" || p.category === scope)
        .map((p) => {
          let next = p.price * (1 + change / 100);
          const minByMargin = p.cost / (1 - floor / 100);
          next = Math.max(next, minByMargin);
          next = Math.round(next / round) * round;
          return { p, next, m0: (p.price - p.cost) / p.price, m1: (next - p.cost) / next };
        }),
    [products, scope, change, round, floor],
  );
  const changed = preview.filter((r) => r.next !== r.p.price);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change prices"
      width={720}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!changed.length}
            onClick={() => {
              apply(changed.map((r) => ({ id: r.p.id, price: r.next })));
              onClose();
            }}
          >
            Apply to {changed.length} products
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-4">
        <Field label="Which products">
          <Select value={scope} onChange={(e) => setScope(e.target.value as Category | "all")}>
            <option value="all">All products</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Change by %">
          <Input id="pct-change" type="number" value={change} onChange={(e) => setChange(Number(e.target.value))} className="tnum" />
        </Field>
        <Field label="Never below margin %">
          <Input id="floor" type="number" value={floor} onChange={(e) => setFloor(Number(e.target.value))} className="tnum" />
        </Field>
        <Field label="Round to">
          <Select value={round} onChange={(e) => setRound(Number(e.target.value))}>
            {[5, 10, 50, 100].map((r) => (
              <option key={r} value={r}>
                EGP {r}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="mx-5 mb-5 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2 text-[12px] text-ink-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Product</th>
              <th className="px-3 py-2 text-right font-medium">Now</th>
              <th className="px-3 py-2 text-right font-medium">New</th>
              <th className="px-3 py-2 text-right font-medium">Margin</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((r) => (
              <tr key={r.p.id} className="border-t border-line">
                <td className="px-3 py-2 text-ink">{shortName(r.p.name)}</td>
                <td className="px-3 py-2 text-right text-ink-muted tnum">{money(r.p.price)}</td>
                <td className={cn("px-3 py-2 text-right font-medium tnum", r.next > r.p.price ? "text-ink" : "text-ink-2")}>{money(r.next)}</td>
                <td className="px-3 py-2 text-right tnum">
                  <span className="text-ink-muted">{pct(r.m0)}</span> → <span className={cn("font-medium", marginTone(r.m1))}>{pct(r.m1)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
