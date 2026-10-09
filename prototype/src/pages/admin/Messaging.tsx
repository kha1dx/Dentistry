import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Clock, Megaphone, MessageSquarePlus, Plus, Send, Zap } from "lucide-react";
import { BRAND, NOW } from "@/config/brand";
import { UNIVERSITIES, YEAR_LABEL } from "@/data/catalog";
import type { Automation, YearOfStudy } from "@/data/types";
import { cn } from "@/lib/cn";
import { addDays, ago, money, num, pct, shortDate } from "@/lib/format";
import { TERM_START } from "@/lib/metrics";
import { useStore } from "@/store/useStore";
import { Badge, Button, Card, CardHeader, Field, Input, PageHeader, Segmented, Select, Stat, Textarea, Toggle } from "@/components/ui/primitives";
import { ChannelIcon } from "@/components/ui/domain";

type Tab = "automations" | "broadcasts" | "templates";

export default function MessagingPage() {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) ?? "automations");
  const automations = useStore((s) => s.automations);
  const on = automations.filter((a) => a.enabled);
  const runs = on.reduce((s, a) => s + a.runs30d, 0);
  const hours = on.reduce((s, a) => s + a.runs30d * a.minutesSavedPerRun, 0) / 60;
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader title="Messages & automations" sub="The updates students expect, sent on time without you typing them. You stay in the conversation for everything that needs a person." />
      <Card className="mt-5 grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
        <Stat label="Automations on" value={`${on.length} of ${automations.length}`} />
        <Stat label="Messages sent for you" value={num(runs)} sub="Last 30 days" />
        <Stat label="Time saved" value={`≈ ${Math.round(hours)} hours`} sub="Last 30 days" tone="good" />
        <Stat label="Status updates sent" value={num(automations.filter((a) => a.enabled && (a.group === "Orders" || a.group === "Repairs")).reduce((s, a) => s + a.runs30d, 0))} sub="Orders and repairs, 30 days" />
      </Card>
      <div className="mt-5">
        <Segmented
          value={tab}
          onChange={(t) => {
            setTab(t);
            const p = new URLSearchParams(params);
            p.set("tab", t);
            setParams(p, { replace: true });
          }}
          options={[
            { id: "automations", label: "Automations" },
            { id: "broadcasts", label: "Broadcasts" },
            { id: "templates", label: "Saved replies" },
          ]}
        />
      </div>
      {tab === "automations" && <Automations />}
      {tab === "broadcasts" && <Broadcasts />}
      {tab === "templates" && <Templates />}
    </div>
  );
}

function Automations() {
  const automations = useStore((s) => s.automations);
  const toggle = useStore((s) => s.toggleAutomation);
  const toast = useStore((s) => s.toast);
  const groups = ["Orders", "Repairs", "Payments", "Messages", "Stock", "Growth"] as Automation["group"][];
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
      {groups.map((g) => (
        <Card key={g}>
          <CardHeader title={g} sub={automations.filter((a) => a.group === g && a.enabled).length + " on"} />
          <ul className="px-2 pb-2 pt-2">
            {automations
              .filter((a) => a.group === g)
              .map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-surface-2">
                  <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", a.enabled ? "bg-violet-soft text-violet" : "bg-surface-3 text-ink-muted")}>
                    <Zap className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("text-[13.5px] font-medium", a.enabled ? "text-ink" : "text-ink-muted")}>{a.name}</span>
                      {a.channel === "internal" ? <Badge tone="neutral">Reminder to you</Badge> : <ChannelIcon channel={a.channel} withLabel />}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-2">
                      <span className="rounded-md bg-surface-3 px-1.5 py-0.5">When: {a.trigger}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                      <span className="rounded-md bg-surface-3 px-1.5 py-0.5">{a.action}</span>
                    </div>
                    <div className="mt-1 text-[12px] text-ink-muted">{a.enabled ? `${a.runs30d} times in 30 days${a.lastRun ? ` · last ${ago(a.lastRun)}` : ""}` : "Off · turn on to start"}</div>
                  </div>
                  <Toggle checked={a.enabled} onChange={() => toggle(a.id)} label={`${a.name} on or off`} />
                </li>
              ))}
          </ul>
        </Card>
      ))}
      <button type="button" onClick={() => toast("Automation builder opened", "info")} className="flex min-h-[120px] items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-[13.5px] font-medium text-ink-2 hover:border-primary hover:text-primary">
        <Plus className="h-4 w-4" /> New automation
      </button>
    </div>
  );
}

function Broadcasts() {
  const campaigns = useStore((s) => s.campaigns);
  const clients = useStore((s) => s.clients);
  const orders = useStore((s) => s.orders);
  const add = useStore((s) => s.addCampaign);
  const [years, setYears] = useState<YearOfStudy[]>([4, 5, 6]);
  const [u, setU] = useState("all");
  const [notBought, setNotBought] = useState(true);
  const [name, setName] = useState("Loupes restock pre-order");
  const [text, setText] = useState("Hi {first_name}! Loupes 2.5x with LED are back on Sunday. Reserve yours today and pay on delivery. Reply YES and I'll hold one for you.");
  const buyers = useMemo(() => new Set(orders.filter((o) => o.createdAt >= TERM_START).map((o) => o.clientId)), [orders]);
  const audience = clients.filter((c) => years.includes(c.year) && (u === "all" || c.universityId === u) && (!notBought || !buyers.has(c.id)));
  const first = audience[0]?.name.split(" ")[0] ?? "Nour";
  const label = `${years.map((y) => YEAR_LABEL[y]).join(", ")}${u !== "all" ? ` · ${UNIVERSITIES.find((x) => x.id === u)?.short}` : ""}${notBought ? " · no order this term" : ""}`;

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h3 className="text-[15px] font-semibold">New broadcast</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <Field label="Name (only you see this)">
              <Input id="bc-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-ink-2">Who gets it</span>
              <div className="flex flex-wrap gap-1.5">
                {([1, 2, 3, 4, 5, 6] as YearOfStudy[]).map((y) => {
                  const active = years.includes(y);
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYears((v) => (active ? v.filter((x) => x !== y) : [...v, y].sort()))}
                      className={cn("h-8 rounded-full border px-3 text-[13px] font-medium transition-colors", active ? "border-primary bg-primary-soft text-primary-soft-ink" : "border-line bg-surface text-ink-2 hover:border-line-strong")}
                    >
                      {YEAR_LABEL[y]}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Select className="w-52" value={u} onChange={(e) => setU(e.target.value)} aria-label="University">
                  <option value="all">All universities</option>
                  {UNIVERSITIES.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </Select>
                <label className="flex items-center gap-2 text-[13px] text-ink-2">
                  <Toggle checked={notBought} onChange={setNotBought} label="Only students with no order this term" />
                  Only students with no order this term
                </label>
              </div>
            </div>
            <Field label="Message" hint="{first_name} is replaced for each student. WhatsApp requires an approved template for broadcasts; this text becomes one.">
              <Textarea id="bc-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3">
              <div className="text-[13px]">
                <span className="text-[20px] font-semibold text-ink tnum">{audience.length}</span> <span className="text-ink-2">students match</span>
                <div className="text-[12px] text-ink-muted">{label}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  icon={<Clock className="h-4 w-4" />}
                  disabled={!audience.length}
                  onClick={() => add({ id: `cp${Date.now()}`, name, audience: label, channel: "whatsapp", scheduledFor: addDays(NOW, 1), recipients: audience.length, read: 0, replied: 0, orders: 0, revenue: 0, status: "scheduled" })}
                >
                  Tomorrow 7pm
                </Button>
                <Button
                  variant="primary"
                  icon={<Send className="h-4 w-4" />}
                  disabled={!audience.length}
                  onClick={() => add({ id: `cp${Date.now()}`, name, audience: label, channel: "whatsapp", sentAt: NOW, recipients: audience.length, read: 0, replied: 0, orders: 0, revenue: 0, status: "sent" })}
                >
                  Send now
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Past and scheduled" sub="Read, replies and orders that came from each broadcast" />
          <div className="mt-3 overflow-x-auto scroll-thin">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="border-y border-line bg-surface-2 text-[12px] text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Broadcast</th>
                  <th className="px-4 py-2.5 text-right font-medium">Sent to</th>
                  <th className="px-4 py-2.5 text-right font-medium">Read</th>
                  <th className="px-4 py-2.5 text-right font-medium">Replied</th>
                  <th className="px-4 py-2.5 text-right font-medium">Orders</th>
                  <th className="px-4 py-2.5 text-right font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-ink">{c.name}</div>
                      <div className="text-[12px] text-ink-muted">
                        {c.audience} · {c.status === "scheduled" ? <Badge tone="info">Scheduled {shortDate(c.scheduledFor!)}</Badge> : `sent ${shortDate(c.sentAt!)}`}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-ink-2 tnum">{c.recipients}</td>
                    <td className="px-4 py-2.5 text-right text-ink-2 tnum">{c.status === "sent" && c.read ? pct(c.read / c.recipients) : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-ink-2 tnum">{c.status === "sent" && c.replied ? pct(c.replied / c.recipients) : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-ink tnum">{c.orders || "—"}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-ink tnum">{c.revenue ? money(c.revenue) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* phone preview */}
      <div className="xl:sticky xl:top-20 xl:self-start">
        <div className="mx-auto w-full max-w-[320px] rounded-[38px] border border-line-strong bg-surface p-3 shadow-pop">
          <div className="overflow-hidden rounded-[28px] border border-line bg-[var(--surface-3)]">
            <div className="flex items-center gap-2.5 bg-primary px-4 py-3 text-primary-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-ink/20 text-[12px] font-semibold">{BRAND.name[0]}</span>
              <div className="leading-tight">
                <div className="text-[13.5px] font-semibold">{BRAND.legalName}</div>
                <div className="text-[11px] opacity-80">Business account</div>
              </div>
            </div>
            <div className="flex min-h-[380px] flex-col justify-end gap-2 p-3">
              <div className="mx-auto rounded-md bg-surface/80 px-2 py-0.5 text-[10.5px] text-ink-muted">Today</div>
              <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface px-3 py-2 text-[13px] leading-relaxed text-ink shadow-card">
                {text.replaceAll("{first_name}", first)}
                <div className="mt-1 text-right text-[10px] text-ink-muted">19:00</div>
              </div>
              <div className="flex gap-1.5">
                <span className="flex-1 rounded-xl bg-surface px-2 py-1.5 text-center text-[12px] font-medium text-info shadow-card">YES</span>
                <span className="flex-1 rounded-xl bg-surface px-2 py-1.5 text-center text-[12px] font-medium text-info shadow-card">Not now</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[12px] text-ink-muted">Preview for {first}</p>
      </div>
    </div>
  );
}

function Templates() {
  const templates = useStore((s) => s.templates);
  const toast = useStore((s) => s.toast);
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((t) => (
        <Card key={t.id} className="flex flex-col p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">{t.name}</span>
            <span className="text-[12px] text-ink-muted">used {t.uses}×</span>
          </div>
          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-2">
            {t.body.split(/(\{[a-z_]+\})/g).map((part, i) =>
              part.startsWith("{") ? (
                <span key={i} className="rounded bg-primary-soft px-1 font-mono text-[11.5px] text-primary-soft-ink">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </p>
        </Card>
      ))}
      <button type="button" onClick={() => toast("New saved reply", "info")} className="flex min-h-[140px] items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-[13.5px] font-medium text-ink-2 hover:border-primary hover:text-primary">
        <MessageSquarePlus className="h-4 w-4" /> New saved reply
      </button>
    </div>
  );
}
