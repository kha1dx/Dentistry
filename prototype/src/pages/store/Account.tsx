import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Copy } from "lucide-react";
import { BRAND } from "@/config/brand";
import { REQUIREMENTS, YEAR_LABEL, uni } from "@/data/catalog";
import { orderTotal } from "@/data/seed";
import { cn } from "@/lib/cn";
import { money, shortDate } from "@/lib/format";
import { isBooked, outstanding } from "@/lib/metrics";
import { REPAIR_STAGES, useStore } from "@/store/useStore";
import { Avatar, Segmented } from "@/components/ui/primitives";
import { ProductArt } from "@/components/art/ProductArt";
import { product } from "@/data/catalog";

type Tab = "orders" | "repairs" | "payments";

export default function Account() {
  const meId = useStore((s) => s.meId);
  const me = useStore((s) => s.clients.find((c) => c.id === s.meId)!);
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const toast = useStore((s) => s.toast);
  const [tab, setTab] = useState<Tab>("orders");
  const myOrders = useMemo(() => orders.filter((o) => o.clientId === meId).reverse(), [orders, meId]);
  const myRepairs = useMemo(() => repairs.filter((r) => r.clientId === meId).reverse(), [repairs, meId]);
  const myInv = invoices.filter((i) => i.clientId === meId);
  const owed = myInv.reduce((s, i) => s + outstanding(i), 0);
  const bought = new Set(myOrders.filter(isBooked).flatMap((o) => o.items.map((i) => i.productId)));
  const req = REQUIREMENTS[me.year];
  const have = req.filter((r) => bought.has(r.productId)).length;

  return (
    <div className="mx-auto max-w-[1000px] px-4 pt-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar name={me.name} size={64} />
        <div>
          <h1 className="font-display text-[44px] leading-none text-ink">Hi, {me.name.split(" ")[0]}</h1>
          <p className="mt-1 text-[14px] text-ink-muted">
            {uni(me.universityId).name} · {YEAR_LABEL[me.year]}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link to={`/shop/requirements?year=${me.year}&uni=${me.universityId}`} className="rounded-2xl border border-line bg-surface p-4 shadow-card hover:border-primary">
          <div className="text-[12.5px] text-ink-muted">{YEAR_LABEL[me.year]} requirements</div>
          <div className="mt-1 text-[24px] font-semibold text-ink">
            {have} <span className="text-[15px] font-normal text-ink-muted">of {req.length} from us</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(have / req.length) * 100}%` }} />
          </div>
        </Link>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="text-[12.5px] text-ink-muted">Active repairs</div>
          <div className="mt-1 text-[24px] font-semibold text-ink">{myRepairs.filter((r) => r.stage !== "returned").length}</div>
          <div className="text-[12.5px] text-ink-muted">{myRepairs.some((r) => r.loaner && r.stage !== "returned") ? "You have a loaner" : "Nothing away right now"}</div>
        </div>
        <div className={cn("rounded-2xl border p-4 shadow-card", owed ? "border-warn/40 bg-warn-soft" : "border-line bg-surface")}>
          <div className="text-[12.5px] text-ink-muted">Balance</div>
          <div className="mt-1 text-[24px] font-semibold text-ink">{owed ? money(owed) : "All paid"}</div>
          {owed > 0 && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText("cusp@instapay").catch(() => undefined);
                toast("InstaPay address copied", "info");
              }}
              className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-2 hover:text-ink"
            >
              InstaPay: <span className="font-mono">cusp@instapay</span> <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { id: "orders", label: "Orders", count: myOrders.length },
            { id: "repairs", label: "Repairs", count: myRepairs.length },
            { id: "payments", label: "Payments", count: myInv.length },
          ]}
        />
      </div>
      <div className="mt-4 rounded-2xl border border-line bg-surface shadow-card">
        <ul>
          {tab === "orders" &&
            myOrders.map((o) => (
              <li key={o.id} className="border-b border-line last:border-0">
                <Link to={`/shop/track/${o.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                  <ProductArt kind={product(o.items[0].productId).art} category={product(o.items[0].productId).category} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-medium text-ink">{o.items.map((i) => i.name.split(/[,(:]/)[0]).join(", ")}</div>
                    <div className="text-[12.5px] text-ink-muted">
                      <span className="font-mono">{o.id}</span> · {shortDate(o.createdAt)} · {o.stage === "delivered" ? "Delivered" : "In progress"}
                    </div>
                  </div>
                  <span className="text-[14px] font-medium text-ink tnum">{money(orderTotal(o))}</span>
                  <ArrowRight className="h-4 w-4 text-ink-muted" />
                </Link>
              </li>
            ))}
          {tab === "repairs" &&
            myRepairs.map((r) => (
              <li key={r.id} className="border-b border-line last:border-0">
                <Link to={`/shop/track/${r.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                  <ProductArt kind={r.art} category="Handpieces & motors" size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-medium text-ink">{r.device}</div>
                    <div className="text-[12.5px] text-ink-muted">
                      <span className="font-mono">{r.id}</span> · {REPAIR_STAGES.find((s) => s.id === r.stage)?.client}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-muted" />
                </Link>
              </li>
            ))}
          {tab === "payments" &&
            myInv
              .slice()
              .reverse()
              .map((i) => (
                <li key={i.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-medium text-ink">Receipt for {i.ref}</div>
                    <div className="text-[12.5px] text-ink-muted">
                      {shortDate(i.issuedAt)} · {outstanding(i) ? `${money(outstanding(i))} left to pay` : `Paid${i.method ? ` by ${i.method}` : ""}`}
                    </div>
                  </div>
                  <span className="text-[14px] font-medium text-ink tnum">{money(i.amount)}</span>
                </li>
              ))}
        </ul>
      </div>
      <p className="mt-6 text-center text-[13px] text-ink-muted">
        Questions? {BRAND.owner.name} is one message away, bottom right.
      </p>
    </div>
  );
}
