import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, UserPlus } from "lucide-react";
import { NOW } from "@/config/brand";
import { UNIVERSITIES, YEAR_LABEL, uni } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { addDays, ago, money, num, pct } from "@/lib/format";
import { TERM_START, clientStats, repeatRate } from "@/lib/metrics";
import { useStore } from "@/store/useStore";
import { Avatar, Badge, Button, Card, PageHeader, SearchInput, Segmented, Select, Stat } from "@/components/ui/primitives";

type Seg = "all" | "top" | "owes" | "new" | "quiet" | "reps";

export default function ClientsPage() {
  const clients = useStore((s) => s.clients);
  const orders = useStore((s) => s.orders);
  const invoices = useStore((s) => s.invoices);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const [seg, setSeg] = useState<Seg>("all");
  const [q, setQ] = useState("");
  const [u, setU] = useState("all");
  const [y, setY] = useState("all");
  const stats = useMemo(() => clientStats(orders, invoices), [orders, invoices]);
  const rr = useMemo(() => repeatRate(orders), [orders]);
  const activeTerm = useMemo(() => new Set(orders.filter((o) => o.createdAt >= TERM_START).map((o) => o.clientId)).size, [orders]);
  const ltvs = [...stats.values()].filter((s) => s.orders > 0).map((s) => s.ltv);
  const avgLtv = ltvs.reduce((a, b) => a + b, 0) / Math.max(1, ltvs.length);
  const topCut = [...ltvs].sort((a, b) => b - a)[Math.floor(ltvs.length * 0.1)] ?? 0;

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return clients
      .map((c) => ({ c, s: stats.get(c.id) ?? { orders: 0, ltv: 0, balance: 0, last: undefined } }))
      .filter(({ c, s }) => {
        if (t && !c.name.toLowerCase().includes(t) && !c.phone.replace(/\s/g, "").includes(t.replace(/\s/g, ""))) return false;
        if (u !== "all" && c.universityId !== u) return false;
        if (y !== "all" && String(c.year) !== y) return false;
        if (seg === "top") return s.ltv >= topCut && s.ltv > 0;
        if (seg === "owes") return s.balance > 0;
        if (seg === "new") return c.joinedAt >= TERM_START;
        if (seg === "quiet") return !!s.last && s.last < addDays(NOW, -120);
        if (seg === "reps") return c.tags.includes("Class rep") || c.tags.includes("Referrer");
        return true;
      })
      .sort((a, b) => b.s.ltv - a.s.ltv);
  }, [clients, stats, q, u, y, seg, topCut]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader
        title="Clients"
        sub="Every student you've sold to, with what they bought, what they owe and what they'll need next."
        actions={
          <>
            <Button icon={<Download className="h-4 w-4" />} onClick={() => toast("Export prepared (CSV)", "info")}>
              Export
            </Button>
            <Button variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={() => toast("New client form opened", "info")}>
              Add client
            </Button>
          </>
        }
      />
      <Card className="mt-5 grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
        <Stat label="Clients" value={num(clients.length)} sub={`${activeTerm} bought this term`} />
        <Stat label="Come back for more" value={pct(rr.rate)} sub={`${rr.repeat} of ${rr.buyers} bought twice or more`} tone="good" />
        <Stat label="Average lifetime spend" value={money(avgLtv)} sub="Per buying client" />
        <Stat label="Owe you money" value={num([...stats.values()].filter((s) => s.balance > 0).length)} sub="See invoices" />
      </Card>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Segmented
          value={seg}
          onChange={setSeg}
          options={[
            { id: "all", label: "All" },
            { id: "top", label: "Top 10%" },
            { id: "owes", label: "Owes money" },
            { id: "new", label: "New this term" },
            { id: "quiet", label: "Quiet 120+ days" },
            { id: "reps", label: "Class reps & referrers" },
          ]}
        />
        <div className="flex flex-1 flex-wrap gap-2 lg:justify-end">
          <SearchInput className="w-full sm:w-64" placeholder="Name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-40" value={u} onChange={(e) => setU(e.target.value)} aria-label="University">
            <option value="all">All universities</option>
            {UNIVERSITIES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.short}
              </option>
            ))}
          </Select>
          <Select className="w-32" value={y} onChange={(e) => setY(e.target.value)} aria-label="Year">
            <option value="all">All years</option>
            {Object.entries(YEAR_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[880px] text-left text-[13px]">
            <thead className="border-b border-line bg-surface-2 text-[12px] text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">University</th>
                <th className="px-4 py-2.5 font-medium">Year</th>
                <th className="px-4 py-2.5 text-right font-medium">Orders</th>
                <th className="px-4 py-2.5 text-right font-medium">Spent</th>
                <th className="px-4 py-2.5 text-right font-medium">Owes</th>
                <th className="px-4 py-2.5 font-medium">Last order</th>
                <th className="px-4 py-2.5 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 60).map(({ c, s }) => (
                <tr key={c.id} onClick={() => nav(`/admin/clients/${c.id}`)} className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} size={30} />
                      <div>
                        <div className="font-medium text-ink">{c.name}</div>
                        <div className="font-mono text-[11.5px] text-ink-muted">{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-2">{uni(c.universityId).short}</td>
                  <td className="px-4 py-2.5 text-ink-2">{YEAR_LABEL[c.year]}</td>
                  <td className="px-4 py-2.5 text-right text-ink tnum">{s.orders}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-ink tnum">{s.ltv ? money(s.ltv) : "—"}</td>
                  <td className={cn("px-4 py-2.5 text-right tnum", s.balance ? "font-medium text-bad" : "text-ink-muted")}>{s.balance ? money(s.balance) : "—"}</td>
                  <td className="px-4 py-2.5 text-ink-2">{s.last ? ago(s.last) : "Never"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge key={t} tone={t === "Late payer" ? "bad" : t === "VIP" ? "violet" : t === "Class rep" ? "info" : "neutral"}>
                          {t}
                        </Badge>
                      ))}
                      {c.joinedAt >= TERM_START && <Badge tone="primary">New</Badge>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-2.5 text-[12.5px] text-ink-muted">
          Showing {Math.min(60, rows.length)} of {rows.length} clients
        </div>
      </Card>
    </div>
  );
}
