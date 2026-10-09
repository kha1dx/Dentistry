import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, Boxes, CircleDollarSign, Globe, Inbox, Languages, LayoutGrid, MessageCircle, Moon, PackageCheck, Receipt, ShieldCheck, Store, Sun, Users, Wrench, Zap } from "lucide-react";
import { BRAND } from "@/config/brand";
import { cn } from "@/lib/cn";
import { money, num1, pct } from "@/lib/format";
import { isOpen, moneyIn, rangeFor, receivables, repairStats } from "@/lib/metrics";
import { useTheme } from "@/lib/theme";
import { useStore } from "@/store/useStore";
import { Logo } from "@/components/ui/Logo";
import { IsoStripe } from "@/components/ui/domain";

const METRICS = [
  {
    Icon: LayoutGrid,
    name: "Needs you today",
    why: "A solo operator's scarcest resource is attention. Exceptions come first: who's waiting, what's late, what needs approval.",
    how: "A ranked action list above every number, each item one tap from the fix.",
  },
  {
    Icon: CircleDollarSign,
    name: "Revenue, compared with last year",
    why: "Sales follow the academic calendar. October always beats September, so month-on-month comparisons mislead.",
    how: "Six headline tiles with a delta against the same period last year and a 12-point trend.",
  },
  {
    Icon: Receipt,
    name: "Gross profit and margin",
    why: "You can't compete on price, so the premium has to show up as margin. Revenue can grow while profit shrinks.",
    how: "Margin against a target line, per category and per order. Weak categories are flagged.",
  },
  {
    Icon: Boxes,
    name: "Money to collect, by age",
    why: "Students pay late and in instalments. Cash tied up in old invoices is the quiet killer of small shops.",
    how: "Aging buckets (not due, 1–30, 31–60, 61–90, 90+), top debtors and automatic reminders that stop on payment.",
  },
  {
    Icon: PackageCheck,
    name: "Open orders and on-time rate",
    why: "The promise date is the product. Being on time is what students remember and recommend.",
    how: "A pipeline by stage, late orders in red, and % delivered on the promised day.",
  },
  {
    Icon: Wrench,
    name: "Repairs and turnaround",
    why: "Repairs are the service nobody else offers. They need the closest tracking: days away, partner speed, approvals.",
    how: "Each device shows days used against days promised, loaners out and partner on-time rates.",
  },
  {
    Icon: MessageCircle,
    name: "Reply time and rating",
    why: "Premium means responsive. Benchmarks put live chat replies at minutes, not hours.",
    how: "Median reply time, share answered within 15 minutes, and post-delivery ratings.",
  },
];

const AUTOMATIONS = [
  ["Order confirmed", "Summary, invoice and payment options sent"],
  ["Order ready", "Delivery slots offered, client replies 1 or 2"],
  ["Out for delivery", "ETA and meeting point"],
  ["Repair received", "Tracking link with expected date"],
  ["Partner estimate in", "Client approves the price from WhatsApp"],
  ["Invoice due", "Polite reminders on day 0, 7 and 14; stops when paid"],
  ["Stock below reorder point", "Purchase order drafted for the usual supplier"],
  ["Two weeks before term", "Each year gets its requirements list and kit link"],
];

const PHASES = [
  ["Weeks 1–3", "The console", "Clients, orders, repairs and invoices in one place. WhatsApp Business connected to a shared inbox. Existing clients and invoices imported."],
  ["Weeks 4–6", "The storefront", "Product pages, requirements lists, checkout, and tracking pages for every order and repair."],
  ["Weeks 7–8", "Automations and reports", "Status messages, payment reminders, broadcasts, and the full set of reports."],
  ["Later", "Growing", "Helper accounts with limited access, online card payments, Arabic storefront, group orders for class reps."],
];

const SOURCES = [
  ["Shopify: home page metrics", "https://help.shopify.com/en/manual/shopify-admin/shopify-home"],
  ["Geckoboard: ecommerce KPIs", "https://www.geckoboard.com/blog/ecommerce-kpis-with-tips-from-experts/"],
  ["SaaS UI: KPI card patterns", "https://www.saasui.design/blog/saas-metric-kpi-card-ux-patterns"],
  ["Stripe: aging reports", "https://stripe.com/en-se/resources/more/what-is-an-aging-report-what-is-in-one-and-how-to-use-it"],
  ["Plooto: reading an AR aging report", "https://www.plooto.com/blog/ar-aging-report-how-to-read"],
  ["RepairDesk: ticket statuses", "https://help.repairdesk.co/portal/en/kb/articles/how-to-manage-ticket-status"],
  ["Burkhart: handpiece repair turnaround", "https://www.burkhartdental.com/?p=16736"],
  ["Gorgias: customer service benchmarks", "https://www.gorgias.com/blog/customer-service-benchmarks"],
  ["Zoom: service benchmarks", "https://www.zoom.com/ja/blog/customer-service-benchmarking/"],
  ["WATI vs respond.io: WhatsApp inboxes", "https://www.wati.io/en/blog/wati-vs-respond-io-for-growing-businesses/"],
  ["Claimlane: reducing “where is my order”", "https://www.claimlane.com/resources/blog/reduce-where-is-my-order-queries"],
  ["Egypt payment methods overview", "https://www.orchestrapay.com/coverage/africa/egypt"],
  ["Dentalkart: student section by year", "https://www.dentalkart.com/c/student-section.html"],
  ["University of Malta: instrument list by year", "https://www.um.edu.mt/media/um/docs/faculties/ds/MDSInstrumentsList2026-27FINAL.pdf"],
];

export default function Overview() {
  const { isDark, cycle } = useTheme();
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const automations = useStore((s) => s.automations);
  const live = useMemo(() => {
    const r = rangeFor("mtd");
    const m = moneyIn(orders, repairs, r.start, r.end);
    return { m, rc: receivables(invoices), rs: repairStats(repairs), open: orders.filter(isOpen).length };
  }, [orders, repairs, invoices]);
  const hours = Math.round(automations.filter((a) => a.enabled).reduce((s, a) => s + a.runs30d * a.minutesSavedPerRun, 0) / 60);

  return (
    <div className="min-h-full bg-enamel">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Logo sub="System proposal" />
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Toggle theme" onClick={cycle} className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-3">
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <Link to="/shop" className="hidden h-10 items-center rounded-xl border border-line bg-surface px-4 text-[14px] font-medium text-ink hover:border-line-strong sm:inline-flex">
            Storefront
          </Link>
          <Link to="/admin" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-medium text-primary-ink hover:bg-primary-hover">
            Console <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid grid-cols-1 max-w-[1180px] gap-10 px-4 pb-6 pt-8 sm:px-6 sm:pt-14 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
        <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
          <IsoStripe className="h-3" /> A clickable prototype with sample data
        </div>
        <h1 className="mt-5 max-w-4xl font-display text-[50px] leading-[0.95] tracking-[-0.015em] text-ink sm:text-[72px]">
          Run the whole business from one screen. Give students a reason to <em className="text-primary">choose you.</em>
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-2">
          Today everything lives in WhatsApp chats, an invoicing app and your memory. This is a proposal for one system with two sides: a console where you see and control everything, and a storefront where students order, request repairs and track them without having to ask.
        </p>
        </div>
        <div className="hidden flex-col gap-2.5 lg:flex" aria-label="Example of the console's action list">
          <div className="eyebrow mb-1">Friday morning, in the console</div>
          {[
            { Icon: MessageCircle, tone: "bg-bad-soft text-bad", t: "Nour has waited 2 h for a reply", s: "Micromotor before Sunday's lab" },
            { Icon: Wrench, tone: "bg-warn-soft text-warn", t: "Malak hasn't approved EGP 850", s: "Pana-Max repair · nudge sent" },
            { Icon: CircleDollarSign, tone: "bg-info-soft text-info", t: "Confirm Ziad's InstaPay screenshot", s: "CU-1851 · EGP 9,430" },
            { Icon: Boxes, tone: "bg-warn-soft text-warn", t: "Typodonts run out in 2 weeks", s: "Draft order to Al Fajr ready" },
          ].map((x, i) => (
            <div key={x.t} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card" style={{ transform: `translateX(${i % 2 ? 14 : 0}px)` }}>
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", x.tone)}>
                <x.Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-medium text-ink">{x.t}</span>
                <span className="block truncate text-[12px] text-ink-muted">{x.s}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* two sides */}
      <section className="mx-auto grid grid-cols-1 max-w-[1180px] gap-4 px-4 py-8 sm:px-6 md:grid-cols-2">
        <Link to="/admin" className="group flex flex-col rounded-3xl bg-side p-7 text-side-ink shadow-pop transition-transform hover:-translate-y-0.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-side-active">For you</div>
          <h2 className="mt-2 font-display text-[40px] leading-none">The console</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-side-muted">Every chat, order, repair, invoice and supplier in one place, with the numbers that tell you how the business is really doing.</p>
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {[
              ["October so far", money(live.m.revenue)],
              ["Margin", pct(live.m.margin, 1)],
              ["Open orders", String(live.open)],
              ["Repairs away", `${live.rs.active} · ${num1(live.rs.avgDays)} d avg`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-side-2 px-3.5 py-3">
                <div className="text-[11.5px] text-side-muted">{k}</div>
                <div className="mt-0.5 text-[17px] font-semibold">{v}</div>
              </div>
            ))}
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-2 text-[13.5px] text-side-ink/90">
            {[
              [Inbox, "One inbox: WhatsApp, Instagram, website chat, calls, email"],
              [PackageCheck, "Orders board from first message to paid"],
              [Wrench, "Repairs board with partners, estimates and loaners"],
              [Zap, `Automations: about ${hours} hours of typing saved a month`],
            ].map(([I, t]) => {
              const Icon = I as typeof Inbox;
              return (
                <li key={t as string} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-side-active" /> {t as string}
                </li>
              );
            })}
          </ul>
          <span className="mt-7 inline-flex items-center gap-2 text-[14.5px] font-medium text-side-active">
            Open the console <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
        <Link to="/shop" className="group flex flex-col rounded-3xl border border-line bg-surface p-7 shadow-card transition-transform hover:-translate-y-0.5">
          <div className="eyebrow !text-primary">For students</div>
          <h2 className="mt-2 font-display text-[40px] leading-none text-ink">The storefront</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">A place that feels as premium as your service: shop by year, tick off the requirements list, book a repair, and follow every order without sending “any update?”.</p>
          <ul className="mt-6 grid grid-cols-1 gap-2 text-[13.5px] text-ink-2">
            {[
              [Store, "Shop by year with kits priced below the parts"],
              [ShieldCheck, "Requirements list that fills the bag in one tap"],
              [Wrench, "Repair booking with pickup, loaner and price approval"],
              [Globe, "Tracking page for every order and repair"],
              [MessageCircle, "Chat, call-back requests and WhatsApp, all landing in your inbox"],
            ].map(([I, t]) => {
              const Icon = I as typeof Inbox;
              return (
                <li key={t as string} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-primary" /> {t as string}
                </li>
              );
            })}
          </ul>
          <div className="mt-6 rounded-2xl bg-surface-2 p-4 text-[13px] text-ink-2">
            <b className="font-medium text-ink">Try it:</b> place an order or send a chat message in the storefront, then open the console. It's already there.
          </div>
          <span className="mt-auto inline-flex items-center gap-2 pt-7 text-[14.5px] font-medium text-primary">
            Open the storefront <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      {/* flow */}
      <section className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
        <div className="eyebrow">One request, start to finish</div>
        <h2 className="mt-3 max-w-3xl font-display text-[40px] leading-[1.02] text-ink sm:text-[50px]">What changes when a student messages you</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Today</div>
            <ol className="mt-4 grid grid-cols-1 gap-3 text-[14px] text-ink-2">
              {["Message arrives on WhatsApp, between 40 other chats", "You check stock from memory and type the price", "Invoice made separately in the invoicing app", "Client asks “any update?” and you reply by hand", "A broken handpiece lives in your head and your car", "Payment chased when you remember"].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="w-5 shrink-0 font-mono text-[12.5px] text-ink-muted">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-primary/40 bg-primary-soft/40 p-6">
            <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">With the system</div>
            <ol className="mt-4 grid grid-cols-1 gap-3 text-[14px] text-ink">
              {["Message lands in one inbox with the student's history beside it", "One tap turns it into an order; prices and stock fill in", "Invoice created and copied to your invoicing app", "Status updates and a tracking link go out on their own", "Repairs tracked on a board with partner, price and loaner", "Reminders go out on schedule and stop when paid"].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="w-5 shrink-0 font-mono text-[12.5px] text-primary">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* metrics */}
      <section className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
        <div className="eyebrow">What's on the home screen, and why</div>
        <h2 className="mt-3 max-w-3xl font-display text-[40px] leading-[1.02] text-ink sm:text-[50px]">Seven numbers that run a premium, one-person business</h2>
        <p className="mt-4 max-w-2xl text-[15.5px] text-ink-2">Small-business dashboard research converges on a handful of KPIs tied to the current goal, each shown with a comparison, and exceptions surfaced before totals. Here is how that applies to your business.</p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface">
          {METRICS.map((m, i) => (
            <div key={m.name} className={cn("grid gap-3 p-5 md:grid-cols-[260px_1fr_1fr] md:gap-6", i > 0 && "border-t border-line")}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-ink">
                  <m.Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="pt-1.5 text-[15px] font-semibold text-ink">{m.name}</span>
              </div>
              <p className="text-[14px] leading-relaxed text-ink-2">
                <span className="mr-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Why</span>
                {m.why}
              </p>
              <p className="text-[14px] leading-relaxed text-ink-2">
                <span className="mr-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Shown as</span>
                {m.how}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ["Built for the phone first", "You're on campus, at suppliers and service centres. The console works one-handed, with a bottom tab bar and the same data."],
            ["Every number drills down", `Tap “${money(live.rc.overdue)} overdue” and you're looking at the invoices behind it, with a reminder button.`],
            ["Colour only means something", "Red is late or overdue, amber is at risk, green is good. Everything else stays calm, so problems stand out."],
          ].map(([t, b]) => (
            <div key={t} className="rounded-2xl border border-line bg-surface p-5">
              <div className="text-[15px] font-semibold text-ink">{t}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* automations */}
      <section className="bg-side py-16 text-side-ink">
        <div className="mx-auto grid grid-cols-1 max-w-[1180px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-side-active">What runs itself</div>
            <h2 className="mt-3 font-display text-[40px] leading-[1.02] sm:text-[50px]">The messages you send fifty times a day, sent for you</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-side-muted">Automations handle the predictable updates. You keep the conversations that need a person, which is where the premium experience actually happens.</p>
            <div className="mt-6 inline-flex items-baseline gap-2 rounded-2xl bg-side-2 px-5 py-4">
              <span className="text-[40px] font-semibold leading-none">≈{hours}h</span>
              <span className="text-[14px] text-side-muted">saved per month in the sample data</span>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AUTOMATIONS.map(([w, t]) => (
              <li key={w} className="rounded-2xl bg-side-2 p-4">
                <div className="flex items-center gap-2 text-[13px] font-medium text-side-active">
                  <Zap className="h-4 w-4" /> {w}
                </div>
                <div className="mt-1 text-[14px]">{t}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* scale */}
      <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6">
        <div className="eyebrow">Built to grow</div>
        <h2 className="mt-3 max-w-3xl font-display text-[40px] leading-[1.02] text-ink sm:text-[50px]">Starts with one person. Ready for the next one.</h2>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Users, "Roles from day one", "Add an assistant for the term rush or a delivery helper. They see what they need, not your margins."],
            [Receipt, "Keeps your invoicing app", "Invoices sync to the subscription you already pay for, so nothing breaks while you switch."],
            [Bell, "Channels plug in", "WhatsApp Business API, Instagram, email and calls arrive in one inbox. More can be added without changing how you work."],
            [Languages, "Arabic-ready", "The storefront is designed to switch to Arabic and right-to-left without a redesign."],
          ].map(([I, t, b]) => {
            const Icon = I as typeof Users;
            return (
              <div key={t as string} className="rounded-2xl border border-line bg-surface p-5">
                <Icon className="h-5 w-5 text-primary" />
                <div className="mt-3 text-[15px] font-semibold text-ink">{t as string}</div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{b as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* rollout */}
      <section className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6">
        <div className="eyebrow">How it could roll out</div>
        <h2 className="mt-3 font-display text-[40px] leading-[1.02] text-ink sm:text-[50px]">In order of what saves you most</h2>
        <ol className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-4">
          {PHASES.map(([when, t, b], i) => (
            <li key={t} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-[34px] leading-none text-primary">{i + 1}</span>
                <span className="text-[12.5px] text-ink-muted">{when}</span>
              </div>
              <div className="mt-4 text-[16px] font-semibold text-ink">{t}</div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{b}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[12.5px] text-ink-muted">Timings are a rough guide for one developer and depend on scope decisions.</p>
      </section>

      {/* sources */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6">
          <div className="eyebrow">Research behind the design</div>
          <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-[13.5px] sm:grid-cols-2 lg:grid-cols-3">
            {SOURCES.map(([t, u]) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noreferrer" className="text-ink-2 underline decoration-line-strong underline-offset-2 hover:text-ink">
                  {t}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <span className="text-[12.5px] text-ink-muted">
              {BRAND.legalName} is a placeholder name. All people, numbers and reviews are sample data.
            </span>
            <div className="flex gap-2">
              <Link to="/shop" className="inline-flex h-10 items-center rounded-xl border border-line px-4 text-[14px] font-medium text-ink hover:border-line-strong">
                Storefront
              </Link>
              <Link to="/admin" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[14px] font-medium text-primary-ink hover:bg-primary-hover">
                Console <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
