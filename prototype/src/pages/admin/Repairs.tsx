import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Copy, ExternalLink, Phone, Plus, ShieldCheck, Timer, Wrench } from "lucide-react";
import { BRAND, NOW } from "@/config/brand";
import { PARTNERS, PRODUCTS, YEAR_LABEL, partner, uni } from "@/data/catalog";
import type { Repair } from "@/data/types";
import { cn } from "@/lib/cn";
import { ago, dueLabel, duration, money, num1, pct, shortName } from "@/lib/format";
import { isActiveRepair, repairLate, repairStats } from "@/lib/metrics";
import { REPAIR_STAGES, useClientMap, useStore } from "@/store/useStore";
import { Avatar, Badge, Button, Card, Field, Input, Meter, PageHeader, Select, Stat, Textarea, Toggle } from "@/components/ui/primitives";
import { Drawer, Modal } from "@/components/ui/overlays";
import { Mono, RepairStagePill } from "@/components/ui/domain";
import { ProductArt } from "@/components/art/ProductArt";
import { Timeline } from "./Orders";

export default function RepairsPage() {
  const [params, setParams] = useSearchParams();
  const repairs = useStore((s) => s.repairs);
  const setStage = useStore((s) => s.setRepairStage);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const stats = useMemo(() => repairStats(repairs), [repairs]);
  const openId = params.get("r");
  const selected = repairs.find((r) => r.id === openId);
  const setParam = (k: string, v: string | null) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true });
  };
  const visible = repairs.filter((r) => isActiveRepair(r) || (r.returnedAt && r.returnedAt > new Date(NOW.getTime() - 3 * 86_400_000)));

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader
        title="Repairs"
        sub="The part of the service students can't get anywhere else. Every device is tracked from pickup to hand-back."
        actions={
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setParam("new", "1")}>
            New repair
          </Button>
        }
      />

      <Card className="mt-5 grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="In progress" value={stats.active} sub={`${stats.late} past promise`} tone={stats.late ? undefined : "good"} />
        <Stat label="Waiting for approval" value={stats.awaiting} sub="Client must OK the price" />
        <Stat label="Average turnaround" value={`${num1(stats.avgDays)} days`} sub="Pickup to hand-back, 90 days" />
        <Stat label="Back on time" value={pct(stats.onTime)} sub={`${stats.recentCount} repairs, 90 days`} tone={stats.onTime >= 0.9 ? "good" : "warn"} />
        <Stat label="Loaners out" value={stats.loaners} sub="Of 4 loaner devices" />
        <Stat label="Repair margin" value={pct(stats.margin)} sub="After partner cost" />
      </Card>

      <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-4 scroll-thin sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-max gap-3">
          {REPAIR_STAGES.map((st) => {
            const list = visible.filter((r) => r.stage === st.id).sort((a, b) => a.promisedAt.getTime() - b.promisedAt.getTime());
            return (
              <div
                key={st.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (over !== st.id) setOver(st.id);
                }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain") || drag;
                  if (id) setStage(id, st.id);
                  setDrag(null);
                  setOver(null);
                }}
                className={cn("flex w-[264px] shrink-0 flex-col rounded-2xl border bg-surface-2", over === st.id ? "border-primary bg-primary-soft/40" : "border-line")}
              >
                <div className="flex items-center justify-between px-3 pb-2 pt-3">
                  <span className="text-[13.5px] font-semibold text-ink">{st.label}</span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[12px] font-semibold text-ink-2 ring-1 ring-line tnum">{list.length}</span>
                </div>
                <div className="flex min-h-[120px] flex-col gap-2 px-2 pb-2">
                  {list.map((r) => (
                    <RepairCard key={r.id} r={r} onOpen={() => setParam("r", r.id)} onDragStart={() => setDrag(r.id)} />
                  ))}
                  {!list.length && <div className="rounded-xl border border-dashed border-line py-6 text-center text-[12.5px] text-ink-muted">Nothing here</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="mt-6 text-[15px] font-semibold">Service partners right now</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PARTNERS.map((p) => {
          const here = repairs.filter((r) => isActiveRepair(r) && r.partnerId === p.id && ["at_partner", "diagnosis", "approval", "repairing"].includes(r.stage));
          const late = here.filter(repairLate).length;
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-ink">{p.name}</div>
                  <div className="text-[12.5px] text-ink-muted">
                    {p.area} · {p.brands.join(", ")}
                  </div>
                </div>
                <Badge tone={late ? "bad" : here.length ? "primary" : "neutral"}>{here.length} with them</Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                <div>
                  <div className="text-ink-muted">Avg days</div>
                  <div className="font-semibold text-ink">{p.avgDays}</div>
                </div>
                <div>
                  <div className="text-ink-muted">On time</div>
                  <div className={cn("font-semibold", p.onTime < 0.85 ? "text-warn" : "text-ink")}>{pct(p.onTime)}</div>
                </div>
                <div>
                  <div className="text-ink-muted">Rating</div>
                  <div className="font-semibold text-ink">{p.rating}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <RepairDrawer repair={selected} onClose={() => setParam("r", null)} />
      <NewRepairModal open={params.get("new") === "1"} onClose={() => setParam("new", null)} onCreated={(id) => setParam("r", id)} />
    </div>
  );
}

function progress(r: Repair) {
  const total = Math.max(1, (r.promisedAt.getTime() - r.receivedAt.getTime()) / 86_400_000);
  const used = ((r.returnedAt ?? NOW).getTime() - r.receivedAt.getTime()) / 86_400_000;
  return { total, used, ratio: used / total };
}

function RepairCard({ r, onOpen, onDragStart }: { r: Repair; onOpen: () => void; onDragStart: () => void }) {
  const clients = useClientMap();
  const c = clients.get(r.clientId);
  const { ratio } = progress(r);
  const late = repairLate(r);
  const active = isActiveRepair(r);
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", r.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className="w-full cursor-grab rounded-xl border border-line bg-surface p-3 text-left shadow-card transition-all hover:-translate-y-px hover:border-line-strong">
      <div className="flex items-center justify-between">
        <Mono>{r.id}</Mono>
        {active ? (
          <span className={cn("text-[11.5px] font-medium", late ? "text-bad" : ratio > 0.75 ? "text-warn" : "text-ink-muted")}>{dueLabel(r.promisedAt)}</span>
        ) : (
          <span className="text-[11.5px] text-ink-muted">{ago(r.returnedAt!)}</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2.5">
        <ProductArt kind={r.art} category="Handpieces & motors" size={38} />
        <div className="min-w-0">
          <div className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">{shortName(r.device)}</div>
          <div className="truncate text-[12px] text-ink-muted">{c?.name}</div>
        </div>
      </div>
      <div className="mt-2 text-[12px] leading-snug text-ink-2">“{r.issue}”</div>
      {active && <Meter className="mt-2.5" value={Math.min(1, ratio)} tone={late ? "bad" : ratio > 0.75 ? "warn" : "primary"} />}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {r.stage === "approval" && <Badge tone="warn">{money(r.price ?? 0)} to approve</Badge>}
        {r.warranty && (
          <Badge tone="good" icon={<ShieldCheck className="h-3 w-3" />}>
            Warranty
          </Badge>
        )}
        {r.loaner && <Badge tone="info">Loaner out</Badge>}
        {active && ["at_partner", "diagnosis", "repairing"].includes(r.stage) && <Badge tone="neutral">{partner(r.partnerId).short}</Badge>}
      </div>
    </div>
  );
}

function RepairDrawer({ repair, onClose }: { repair?: Repair; onClose: () => void }) {
  const clients = useClientMap();
  const setStage = useStore((s) => s.setRepairStage);
  const sendEstimate = useStore((s) => s.sendEstimate);
  const approve = useStore((s) => s.approveRepair);
  const toast = useStore((s) => s.toast);
  const [cost, setCost] = useState("");
  const [markup, setMarkup] = useState(30);
  if (!repair) return null;
  const c = clients.get(repair.clientId);
  const p = partner(repair.partnerId);
  const idx = REPAIR_STAGES.findIndex((s) => s.id === repair.stage);
  const next = REPAIR_STAGES[idx + 1];
  const { ratio } = progress(repair);
  const partnerCost = Number(cost) || 0;
  const suggested = Math.round((partnerCost * (1 + markup / 100) + 150) / 50) * 50;
  const link = `${BRAND.trackingDomain}/${repair.id}`;

  return (
    <Drawer
      open
      onClose={onClose}
      width={620}
      title={
        <span className="flex items-center gap-2.5">
          <span className="font-mono">{repair.id}</span>
          <RepairStagePill stage={repair.stage} />
        </span>
      }
      sub={`Received ${ago(repair.receivedAt)} · promised ${repair.promisedAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}`}
      footer={
        next && (
          <Button variant="primary" iconRight={<ArrowRight className="h-4 w-4" />} onClick={() => setStage(repair.id, next.id)}>
            Move to {next.label}
          </Button>
        )
      }
    >
      <div className="border-b border-line px-5 py-4">
        <ol className="flex items-center gap-1">
          {REPAIR_STAGES.map((s, i) => (
            <li key={s.id} className="flex flex-1 flex-col items-center gap-1.5">
              <button type="button" onClick={() => setStage(repair.id, s.id)} title={`Move to ${s.label}`} className={cn("h-1.5 w-full rounded-full", i <= idx ? "bg-primary" : "bg-surface-3 hover:bg-line-strong")} />
              <span className={cn("hidden text-center text-[10.5px] leading-tight sm:block", i === idx ? "font-semibold text-ink" : "text-ink-muted")}>{s.short}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="grid grid-cols-1 gap-5 px-5 py-5">
        <div className="flex gap-4">
          <ProductArt kind={repair.art} category="Handpieces & motors" size={72} />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-ink">{repair.device}</div>
            <div className="text-[12.5px] text-ink-muted">
              {repair.brand} · serial <span className="font-mono">{repair.serial}</span>
            </div>
            <div className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[13px] text-ink-2">“{repair.issue}”</div>
          </div>
        </div>

        {isActiveRepair(repair) && (
          <div className="rounded-xl border border-line p-3.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-1.5 text-ink-2">
                <Timer className="h-4 w-4" /> With us for {duration(NOW.getTime() - repair.receivedAt.getTime())}
              </span>
              <span className={cn("font-medium", repairLate(repair) ? "text-bad" : "text-ink-2")}>{dueLabel(repair.promisedAt)}</span>
            </div>
            <Meter className="mt-2" value={Math.min(1, ratio)} tone={repairLate(repair) ? "bad" : ratio > 0.75 ? "warn" : "primary"} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {c && (
            <Link to={`/admin/clients/${c.id}`} className="rounded-xl border border-line p-3.5 hover:border-line-strong">
              <div className="eyebrow mb-2">Client</div>
              <div className="flex items-center gap-2.5">
                <Avatar name={c.name} size={32} />
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-medium text-ink">{c.name}</div>
                  <div className="text-[12px] text-ink-muted">
                    {uni(c.universityId).short} · {YEAR_LABEL[c.year]}
                  </div>
                </div>
              </div>
              {repair.loaner && <div className="mt-2 text-[12.5px] text-info">Loaner: {repair.loaner}</div>}
            </Link>
          )}
          <div className="rounded-xl border border-line p-3.5">
            <div className="eyebrow mb-2">Service partner</div>
            <div className="text-[13.5px] font-medium text-ink">{p.name}</div>
            <div className="text-[12px] text-ink-muted">
              {p.contact} · {p.area}
            </div>
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[12.5px] text-ink-2">
              <Phone className="h-3.5 w-3.5" /> {p.phone}
            </div>
          </div>
        </div>

        {/* estimate */}
        {["received", "at_partner", "diagnosis"].includes(repair.stage) && !repair.warranty && (
          <div className="rounded-xl border border-line p-3.5">
            <div className="eyebrow mb-2">Estimate</div>
            <p className="text-[13px] text-ink-2">Enter what the partner quoted. The client gets the price on WhatsApp and approves before work starts.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Partner charges (EGP)">
                <Input id="partner-cost" className="tnum" placeholder="650" value={cost} onChange={(e) => setCost(e.target.value.replace(/[^0-9]/g, ""))} />
              </Field>
              <Field label={`Your markup: ${markup}%`}>
                <input id="markup" type="range" min={10} max={60} step={5} value={markup} onChange={(e) => setMarkup(Number(e.target.value))} className="mt-2 w-full accent-[var(--primary)]" />
              </Field>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-[13px]">
              <span className="text-ink-2">Client pays (incl. EGP 150 pickup & return)</span>
              <span className="font-semibold text-ink tnum">{partnerCost ? money(suggested) : "—"}</span>
            </div>
            <Button className="mt-3 w-full" variant="soft" disabled={!partnerCost} onClick={() => sendEstimate(repair.id, partnerCost, suggested)}>
              Send estimate for approval
            </Button>
          </div>
        )}
        {repair.stage === "approval" && (
          <div className="rounded-xl border border-warn/40 bg-warn-soft p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-medium text-ink">Waiting for {c?.name.split(" ")[0]} to approve {money(repair.price ?? 0)}</div>
                <div className="text-[12.5px] text-ink-2">
                  Sent {duration(NOW.getTime() - repair.stageSince.getTime())} ago · partner charges {money(repair.partnerCost ?? 0)}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="primary" onClick={() => approve(repair.id)}>
                Approved by phone
              </Button>
              <Button size="sm" onClick={() => toast("Follow-up sent with the approve link", "info")}>
                Nudge again
              </Button>
            </div>
          </div>
        )}
        {repair.price !== undefined && repair.stage !== "approval" && (
          <div className="flex items-center justify-between rounded-xl border border-line px-3.5 py-3 text-[13px]">
            <span className="text-ink-2">{repair.warranty ? "Warranty repair, no charge to client" : `Client pays ${money(repair.price)} · partner ${money(repair.partnerCost ?? 0)}`}</span>
            {!repair.warranty && <span className="font-medium text-good tnum">+{money((repair.price ?? 0) - (repair.partnerCost ?? 0))}</span>}
          </div>
        )}

        {/* tracking link */}
        <div className="rounded-xl border border-line p-3.5">
          <div className="eyebrow mb-2">Client tracking page</div>
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-[12.5px] text-ink-2">{link}</span>
            <Button
              size="sm"
              icon={<Copy className="h-3.5 w-3.5" />}
              onClick={() => {
                navigator.clipboard?.writeText(link).catch(() => undefined);
                toast("Link copied", "info");
              }}
            >
              Copy
            </Button>
            <Link to={`/shop/track/${repair.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] font-medium text-primary hover:bg-primary-soft">
              View <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="mt-2 text-[12px] text-ink-muted">The client sees “{REPAIR_STAGES[idx].client}” and the expected date. No more “any update?” messages.</p>
        </div>

        <div>
          <div className="eyebrow mb-3">Timeline</div>
          <Timeline events={repair.timeline} />
        </div>
      </div>
    </Drawer>
  );
}

function NewRepairModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const clients = useStore((s) => s.clients);
  const submit = useStore((s) => s.submitRepair);
  const [clientId, setClientId] = useState("c002");
  const [productId, setProductId] = useState("p01");
  const [issue, setIssue] = useState("");
  const [loaner, setLoaner] = useState(true);
  const devices = PRODUCTS.filter((p) => p.serviceable);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New repair"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            icon={<Wrench className="h-4 w-4" />}
            onClick={() => {
              const id = submit({ clientId, productId, issue: issue || "To be diagnosed", handover: "picked up on campus", loaner, photos: 0 });
              onClose();
              setTimeout(() => onCreated(id), 0);
            }}
          >
            Create and send tracking link
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 p-5">
        <Field label="Client">
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.slice(0, 40).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {uni(c.universityId).short}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Device">
          <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.brand} · {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="What's wrong">
          <Textarea id="repair-issue" rows={2} placeholder="e.g. bur slips, noisy turbine" value={issue} onChange={(e) => setIssue(e.target.value)} />
        </Field>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3">
          <span>
            <span className="block text-[13.5px] font-medium text-ink">Give a loaner</span>
            <span className="text-[12.5px] text-ink-muted">3 of 4 loaner turbines are out right now</span>
          </span>
          <Toggle checked={loaner} onChange={setLoaner} label="Give a loaner" />
        </label>
      </div>
    </Modal>
  );
}
