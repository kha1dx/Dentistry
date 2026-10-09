import { useState } from "react";
import { Bell, Building2, Check, CreditCard, Globe, Instagram, Mail, MapPin, MessageCircle, Receipt, CalendarDays, Shield, UserPlus } from "lucide-react";
import { BRAND } from "@/config/brand";
import { UNIVERSITIES } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { useStore } from "@/store/useStore";
import { Avatar, Badge, Button, Card, CardHeader, Field, Input, PageHeader, Segmented, Toggle } from "@/components/ui/primitives";

const ROLES = [
  { role: "Owner", who: BRAND.owner.fullName, desc: "Everything, including costs, margins and settings", active: true },
  { role: "Assistant", who: "Invite someone", desc: "Inbox, orders, repairs and clients. No costs or margins." },
  { role: "Delivery", who: "Invite someone", desc: "Today's route and hand-over confirmations only" },
  { role: "Accountant", who: "Invite someone", desc: "Read-only invoices, payments and reports" },
];

const PERMS = [
  ["Reply to clients", true, true, false, false],
  ["Create and move orders", true, true, false, false],
  ["See cost and margin", true, false, false, true],
  ["Change prices", true, false, false, false],
  ["Record payments", true, true, true, false],
  ["Reports", true, false, false, true],
] as const;

const INTEGRATIONS = [
  { name: "WhatsApp Business", desc: "Official API number with shared inbox, templates and automations", Icon: MessageCircle, on: true },
  { name: "Your invoicing app", desc: "Invoices created here are copied over, so your existing subscription keeps working", Icon: Receipt, on: true },
  { name: "Instagram messages", desc: "DMs from your shop page land in the same inbox", Icon: Instagram, on: true },
  { name: "Email", desc: "For class reps, suppliers and receipts", Icon: Mail, on: true },
  { name: "Online payments", desc: "Card and wallet payment links (e.g. Paymob or Fawry); InstaPay stays manual", Icon: CreditCard, on: false },
  { name: "Google Calendar", desc: "Deliveries and partner drops on your phone's calendar", Icon: CalendarDays, on: false },
];

export default function SettingsPage() {
  const toast = useStore((s) => s.toast);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [notify, setNotify] = useState({ wait: true, late: true, pay: true, digest: true });
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <PageHeader title="Settings" sub="Built for one person today, ready for a helper tomorrow." />
      <div className="mt-5 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-ink-muted" />Business</span>} sub="Shown on invoices, the storefront and tracking pages" />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <Field label="Business name">
              <Input id="biz-name" defaultValue={BRAND.legalName} />
            </Field>
            <Field label="WhatsApp number">
              <Input id="biz-wa" defaultValue={BRAND.whatsapp} className="font-mono" />
            </Field>
            <Field label="Working hours">
              <Input id="biz-hours" defaultValue={BRAND.hours} />
            </Field>
            <Field label="Payment terms" hint="Used for due dates and reminders">
              <Input id="biz-terms" defaultValue="7 days after confirmation" />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={<span className="flex items-center gap-2"><Shield className="h-4 w-4 text-ink-muted" />Team and roles</span>}
            sub="Add a helper during the term rush without handing over your margins"
            action={<Button size="sm" variant="soft" icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => toast("Invite link copied", "info")}>Invite</Button>}
          />
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <div key={r.role} className={cn("rounded-xl border p-3.5", r.active ? "border-primary/40 bg-primary-soft/40" : "border-dashed border-line-strong")}>
                <div className="flex items-center gap-2">
                  {r.active ? <Avatar name={r.who} size={26} /> : <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-surface-3 text-ink-muted"><UserPlus className="h-3.5 w-3.5" /></span>}
                  <span className="font-medium text-ink">{r.role}</span>
                </div>
                <div className="mt-1 text-[12.5px] text-ink-2">{r.who}</div>
                <div className="mt-1 text-[12px] text-ink-muted">{r.desc}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto px-5 pb-5 scroll-thin">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead className="text-[12px] text-ink-muted">
                <tr>
                  <th className="py-2 text-left font-medium">Can…</th>
                  {ROLES.map((r) => (
                    <th key={r.role} className="py-2 text-center font-medium">
                      {r.role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMS.map(([label, ...vals]) => (
                  <tr key={label} className="border-t border-line">
                    <td className="py-2 text-ink-2">{label}</td>
                    {vals.map((v, i) => (
                      <td key={i} className="py-2 text-center">
                        {v ? <Check className="mx-auto h-4 w-4 text-good" /> : <span className="text-ink-muted">–</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Globe className="h-4 w-4 text-ink-muted" />Connected apps</span>} sub="Keep what already works; connect the rest when you're ready" />
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
            {INTEGRATIONS.map((i) => (
              <div key={i.name} className="flex items-start gap-3 rounded-xl border border-line p-3.5">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", i.on ? "bg-good-soft text-good" : "bg-surface-3 text-ink-muted")}>
                  <i.Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{i.name}</span>
                    {i.on && <Badge tone="good">Connected</Badge>}
                  </div>
                  <div className="text-[12.5px] text-ink-muted">{i.desc}</div>
                </div>
                {!i.on && (
                  <Button size="sm" onClick={() => toast(`${i.name}: setup started`, "info")}>
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-muted" />Campus delivery points</span>} sub="Free hand-over at the faculty gate; courier elsewhere for EGP 75" />
            <ul className="px-5 pb-4 pt-3">
              {UNIVERSITIES.map((u) => (
                <li key={u.id} className="flex items-center justify-between border-b border-line py-2 text-[13px] last:border-0">
                  <span className="text-ink">{u.short}</span>
                  <span className="text-ink-muted">{u.campus}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title={<span className="flex items-center gap-2"><Bell className="h-4 w-4 text-ink-muted" />Alerts on your phone</span>} sub="Only the things that cost you a client if you miss them" />
            <div className="grid grid-cols-1 gap-1 px-5 pb-4 pt-3">
              {(
                [
                  ["wait", "Someone waited more than 15 minutes for a reply"],
                  ["late", "An order or repair is about to miss its promised date"],
                  ["pay", "A payment screenshot arrives"],
                  ["digest", "Morning summary at 9:00"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex items-center justify-between gap-3 border-b border-line py-2.5 text-[13px] text-ink-2 last:border-0">
                  {label}
                  <Toggle checked={notify[k]} onChange={(v) => setNotify((n) => ({ ...n, [k]: v }))} label={label} />
                </label>
              ))}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[13px] text-ink-2">Storefront language</span>
                <Segmented
                  size="sm"
                  value={lang}
                  onChange={(v) => {
                    setLang(v);
                    if (v === "ar") toast("Arabic storefront is on the roadmap (right-to-left layout ready)", "info");
                  }}
                  options={[
                    { id: "en", label: "English" },
                    { id: "ar", label: "العربية" },
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
