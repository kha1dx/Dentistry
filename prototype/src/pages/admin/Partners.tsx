import { Phone, Star, Truck, Wrench } from "lucide-react";
import { PARTNERS, PRODUCTS, SUPPLIERS } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { money, pct } from "@/lib/format";
import { isActiveRepair } from "@/lib/metrics";
import { useStore } from "@/store/useStore";
import { Badge, Button, Card, Meter, PageHeader } from "@/components/ui/primitives";

export default function PartnersPage() {
  const repairs = useStore((s) => s.repairs);
  const products = useStore((s) => s.products);
  const toast = useStore((s) => s.toast);
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader title="Suppliers & partners" sub="Who you buy from and who fixes devices for you, with the numbers that tell you who to trust when term starts." />

      <h2 className="mt-6 flex items-center gap-2 text-[15px] font-semibold">
        <Truck className="h-4 w-4 text-ink-muted" /> Suppliers
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SUPPLIERS.map((s) => {
          const low = products.filter((p) => p.supplierId === s.id && p.stock <= p.reorderPoint).length;
          const range = PRODUCTS.filter((p) => p.supplierId === s.id).length;
          return (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-ink">{s.name}</div>
                  <div className="text-[12.5px] text-ink-muted">{s.categories.join(" · ")}</div>
                </div>
                {low > 0 ? <Badge tone="warn">{low} to reorder</Badge> : <Badge tone="good">Stock OK</Badge>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
                <div>
                  <div className="text-ink-muted">Lead time</div>
                  <div className="text-[14px] font-semibold text-ink">{s.leadDays} days</div>
                </div>
                <div>
                  <div className="text-ink-muted">Spent this year</div>
                  <div className="text-[14px] font-semibold text-ink tnum">{money(s.spendYtd).replace("EGP ", "")}</div>
                </div>
                <div>
                  <div className="text-ink-muted">Products</div>
                  <div className="text-[14px] font-semibold text-ink">{range}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-ink-muted">Delivers on time</span>
                  <span className={cn("font-medium", s.onTime < 0.85 ? "text-warn" : "text-ink")}>{pct(s.onTime)}</span>
                </div>
                <Meter value={s.onTime} tone={s.onTime < 0.85 ? "warn" : "primary"} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
                  <Phone className="h-3.5 w-3.5" /> {s.contact} · <span className="font-mono">{s.phone}</span>
                </span>
                <Button size="sm" onClick={() => toast(`Purchase order started for ${s.name}`, "info")}>
                  New PO
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <h2 className="mt-8 flex items-center gap-2 text-[15px] font-semibold">
        <Wrench className="h-4 w-4 text-ink-muted" /> Service partners
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        {PARTNERS.map((p) => {
          const active = repairs.filter((r) => isActiveRepair(r) && r.partnerId === p.id).length;
          const done = repairs.filter((r) => r.partnerId === p.id && r.stage === "returned").length;
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-ink">{p.name}</div>
                  <div className="text-[12.5px] text-ink-muted">
                    {p.area} · {p.brands.join(", ")}
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[13px] font-medium text-ink">
                  <Star className="h-4 w-4 fill-[var(--chart-4)] text-[var(--chart-4)]" /> {p.rating}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-[12px]">
                <div>
                  <div className="text-ink-muted">Average</div>
                  <div className="text-[14px] font-semibold text-ink">{p.avgDays} d</div>
                </div>
                <div>
                  <div className="text-ink-muted">On time</div>
                  <div className={cn("text-[14px] font-semibold", p.onTime < 0.85 ? "text-warn" : "text-ink")}>{pct(p.onTime)}</div>
                </div>
                <div>
                  <div className="text-ink-muted">With them</div>
                  <div className="text-[14px] font-semibold text-ink">{active}</div>
                </div>
                <div>
                  <div className="text-ink-muted">Repaired</div>
                  <div className="text-[14px] font-semibold text-ink">{done}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[12.5px] text-ink-2">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {p.contact} · <span className="font-mono">{p.phone}</span>
                </span>
                {p.loaners ? <Badge tone="info">Lends devices</Badge> : <Badge tone="neutral">No loaners</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
