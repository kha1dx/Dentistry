import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, CircleDollarSign, CreditCard, Inbox, Languages, ListChecks, MessageCircle, Moon, PackageCheck, Receipt, Store, Sun, Truck, Users, Wrench, Zap } from "lucide-react";
import { BRAND } from "@/config/brand";
import { cn } from "@/lib/cn";
import { money, moneyCompact } from "@/lib/format";
import { isOpen, moneyIn, rangeFor, receivables, repairStats } from "@/lib/metrics";
import { useTheme } from "@/lib/theme";
import { useStore } from "@/store/useStore";
import { Logo } from "@/components/ui/Logo";

type Tint = "mint" | "peach" | "sky" | "lavender" | "lemon" | "rose";
const TINT: Record<Tint, string> = {
  mint: "bg-tint-mint",
  peach: "bg-tint-peach",
  sky: "bg-tint-sky",
  lavender: "bg-tint-lavender",
  lemon: "bg-tint-lemon",
  rose: "bg-tint-rose",
};

const HOME_ITEMS: { Icon: typeof Inbox; tint: Tint; name: string; why: string }[] = [
  { Icon: ListChecks, tint: "rose", name: "To do", why: "What needs you now, most urgent first. One tap takes you to the fix." },
  { Icon: CircleDollarSign, tint: "sky", name: "Sales this month", why: "Compared with the same month last year, because term starts always beat summer." },
  { Icon: CreditCard, tint: "peach", name: "Money owed to you", why: "With what's overdue. Reminders go out on their own." },
  { Icon: PackageCheck, tint: "lavender", name: "Open orders", why: "How many, and how many you've promised for today." },
  { Icon: Wrench, tint: "mint", name: "Repairs", why: "The service nobody else offers, so it gets watched closely: what's late, what needs an OK." },
  { Icon: MessageCircle, tint: "lemon", name: "People waiting", why: "Premium means fast replies. You see who has waited longest." },
];

const AUTOMATIONS = ["Order confirmed", "Ready for delivery", "On the way", "Repair tracking link", "Price approval", "Payment reminders", "Restock orders", "Term-start lists"];

const PHASES = [
  ["Weeks 1–3", "The console", "Clients, orders, repairs and invoices in one place, with WhatsApp in a shared inbox."],
  ["Weeks 4–6", "The storefront", "Shop by year, requirement lists, checkout and tracking pages."],
  ["Weeks 7–8", "Automations", "Status messages, payment reminders, broadcasts and reports."],
  ["Later", "Growing", "Helper accounts, card payments, Arabic, group orders for class reps."],
];

const SOURCES = [
  ["Shopify: home page metrics", "https://help.shopify.com/en/manual/shopify-admin/shopify-home"],
  ["Shopify app design guidelines", "https://shopify.dev/docs/apps/design-guidelines"],
  ["NN/g: managing visual complexity", "https://www.nngroup.com/videos/managing-visual-complexity/"],
  ["Improvado: dashboard design guide", "https://improvado.io/blog/dashboard-design-guide"],
  ["Penn State: beware light weight fonts", "https://accessibility.psu.edu/2021/10/beware-light-weight-fonts"],
  ["Baymard: ecommerce best practices", "https://baymard.com/learn/ecommerce-best-practices"],
  ["Stripe: aging reports", "https://stripe.com/en-se/resources/more/what-is-an-aging-report-what-is-in-one-and-how-to-use-it"],
  ["RepairDesk: ticket statuses", "https://help.repairdesk.co/portal/en/kb/articles/how-to-manage-ticket-status"],
  ["Gorgias: service benchmarks", "https://www.gorgias.com/blog/customer-service-benchmarks"],
  ["WATI vs respond.io", "https://www.wati.io/en/blog/wati-vs-respond-io-for-growing-businesses/"],
  ["Claimlane: “where is my order”", "https://www.claimlane.com/resources/blog/reduce-where-is-my-order-queries"],
  ["Payments in Egypt", "https://www.orchestrapay.com/coverage/africa/egypt"],
];

export default function Overview() {
  const { isDark, cycle } = useTheme();
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const automations = useStore((s) => s.automations);
  const live = useMemo(() => {
    const r = rangeFor("mtd");
    return { m: moneyIn(orders, repairs, r.start, r.end), rc: receivables(invoices), rs: repairStats(repairs), open: orders.filter(isOpen).length };
  }, [orders, repairs, invoices]);
  const hours = Math.round(automations.filter((a) => a.enabled).reduce((s, a) => s + a.runs30d * a.minutesSavedPerRun, 0) / 60);

  return (
    <div className="min-h-full bg-enamel pb-10">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Logo sub="System proposal" />
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Toggle theme" onClick={cycle} className="flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface-3">
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <Link to="/shop" className="hidden h-10 items-center rounded-full bg-surface px-4 text-[14px] font-bold text-ink shadow-card hover:bg-surface-2 sm:inline-flex">
            Storefront
          </Link>
          <Link to="/admin" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[14px] font-bold text-surface hover:opacity-90">
            Console <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="hero-ground grid grid-cols-1 gap-10 rounded-[32px] p-7 sm:p-12 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1.5 text-[12.5px] font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-primary" /> A clickable prototype with sample data
            </span>
            <h1 className="mt-5 text-[42px] font-extrabold leading-[1] tracking-[-0.045em] text-ink sm:text-[62px]">
              One place to run the <span className="text-primary">whole business.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[16.5px] font-medium leading-relaxed text-ink-2">
              Today everything lives in WhatsApp, an invoicing app and your memory. This puts it in one simple app for you, and gives students a shop where they can order, book repairs and track them without asking.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/admin" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-bold text-surface hover:opacity-90">
                See the console <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" className="inline-flex h-12 items-center rounded-full bg-surface px-6 text-[15px] font-bold text-ink hover:bg-surface/80">
                See the storefront
              </Link>
            </div>
          </div>
          <div className="hidden flex-col gap-2.5 lg:flex" aria-label="Example of the console's to-do list">
            {[
              { Icon: MessageCircle, tint: "rose" as Tint, t: "Reply to Nour", s: "Waited 2 h · micromotor question" },
              { Icon: Wrench, tint: "lemon" as Tint, t: "Malak's repair needs an OK", s: "EGP 850 · nudge sent" },
              { Icon: CreditCard, tint: "mint" as Tint, t: "Confirm Ziad's payment", s: "InstaPay screenshot · EGP 9,430" },
              { Icon: Truck, tint: "sky" as Tint, t: "Deliver 5 orders today", s: "Kasr Al Ainy gate, 14:00" },
            ].map((x, i) => (
              <div key={x.t} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card" style={{ transform: `translateX(${i % 2 ? 16 : 0}px)` }}>
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink", TINT[x.tint])}>
                  <x.Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-bold text-ink">{x.t}</span>
                  <span className="block truncate text-[12.5px] font-semibold text-ink-muted">{x.s}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* two sides */}
      <section className="mx-auto mt-4 grid max-w-[1180px] grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-2">
        <Link to="/admin" className="group flex flex-col rounded-[28px] bg-ink p-7 text-surface transition-transform hover:-translate-y-0.5 sm:p-8">
          <span className="w-fit rounded-full bg-surface/15 px-3 py-1 text-[12px] font-bold">For you</span>
          <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-[-0.035em]">The console</h2>
          <p className="mt-2 text-[15px] font-medium text-surface/70">Every chat, order, repair and payment in one place.</p>
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {[
              ["Sales this month", moneyCompact(live.m.revenue)],
              ["Owed to you", moneyCompact(live.rc.total)],
              ["Open orders", String(live.open)],
              ["Repairs", String(live.rs.active)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-surface/10 px-4 py-3">
                <div className="text-[12px] font-semibold text-surface/60">{k}</div>
                <div className="mt-0.5 text-[20px] font-extrabold tracking-[-0.02em]">{v}</div>
              </div>
            ))}
          </div>
          <span className="mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-surface px-5 text-[14px] font-bold text-ink">
            Open the console <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link to="/shop" className="group flex flex-col rounded-[28px] bg-tint-lavender p-7 transition-transform hover:-translate-y-0.5 sm:p-8">
          <span className="w-fit rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-ink">For students</span>
          <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-[-0.035em] text-ink">The storefront</h2>
          <p className="mt-2 text-[15px] font-medium text-ink-2">A shop that feels as premium as your service.</p>
          <ul className="mt-6 grid grid-cols-1 gap-2.5">
            {[
              [Store, "Shop by year, with kits"],
              [ListChecks, "Requirements list that fills the bag"],
              [Wrench, "Book a repair, get a loaner"],
              [Truck, "Track every order and repair"],
            ].map(([I, t]) => {
              const Icon = I as typeof Inbox;
              return (
                <li key={t as string} className="flex items-center gap-3 rounded-2xl bg-surface/70 px-4 py-3 text-[14.5px] font-bold text-ink">
                  <Icon className="h-[18px] w-[18px] shrink-0 text-primary" /> {t as string}
                </li>
              );
            })}
          </ul>
          <span className="mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-bold text-surface">
            Open the storefront <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      {/* before / after */}
      <Block title="What changes when a student messages you">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] bg-surface p-6 shadow-card">
            <div className="text-[14px] font-extrabold text-ink-muted">Today</div>
            <ul className="mt-4 grid grid-cols-1 gap-3">
              {["Message gets lost between 40 other chats", "Stock and prices checked from memory", "Invoice typed separately", "“Any update?” answered by hand", "Payments chased when you remember"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[15px] font-semibold text-ink-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-line-strong" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] bg-tint-mint p-6">
            <div className="text-[14px] font-extrabold text-good">With the system</div>
            <ul className="mt-4 grid grid-cols-1 gap-3">
              {["One inbox with the student's history beside it", "One tap turns a message into an order", "Invoice made and synced for you", "Updates and a tracking link go out on their own", "Reminders sent, and stopped once they pay"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[15px] font-bold text-ink">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-good" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Block>

      {/* home screen */}
      <Block title="What you see first every morning" sub="Only a few things, picked from small-business dashboard research. Everything else is one tap away.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_ITEMS.map((m) => (
            <div key={m.name} className={cn("rounded-[24px] p-6", TINT[m.tint])}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-ink shadow-card">
                <m.Icon className="h-5 w-5" />
              </span>
              <div className="mt-4 text-[18px] font-extrabold tracking-[-0.02em] text-ink">{m.name}</div>
              <p className="mt-1 text-[14px] font-medium leading-relaxed text-ink-2">{m.why}</p>
            </div>
          ))}
        </div>
      </Block>

      {/* automations */}
      <section className="mx-auto mt-16 max-w-[1180px] px-4 sm:px-6">
        <div className="relative grid grid-cols-1 gap-8 overflow-hidden rounded-[32px] bg-side p-8 text-side-ink sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[28px] border-white/5" aria-hidden />
          <div className="relative">
            <h2 className="text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[40px]">The messages you send fifty times a day, sent for you.</h2>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-[56px] font-extrabold leading-none tracking-[-0.05em]">{hours}h</span>
              <span className="text-[14px] font-semibold text-side-muted">of typing saved a month (sample data)</span>
            </div>
          </div>
          <div className="relative flex flex-wrap gap-2">
            {AUTOMATIONS.map((a) => (
              <span key={a} className="inline-flex h-11 items-center gap-2 rounded-full bg-side-2 px-4 text-[14px] font-bold">
                <Zap className="h-4 w-4 text-side-active" /> {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* growth */}
      <Block title="Starts with one person. Ready for the next.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Users, "Helper accounts", "Add someone for the term rush. They don't see your margins."],
            [Receipt, "Keeps your invoicing app", "Invoices sync to the app you already pay for."],
            [Bell, "More channels later", "Instagram, email and calls in the same inbox."],
            [Languages, "Arabic-ready", "The shop can switch to Arabic without a redesign."],
          ].map(([I, t, b]) => {
            const Icon = I as typeof Users;
            return (
              <div key={t as string} className="rounded-[24px] bg-surface p-6 shadow-card">
                <Icon className="h-6 w-6 text-primary" />
                <div className="mt-3 text-[16px] font-extrabold text-ink">{t as string}</div>
                <p className="mt-1 text-[14px] font-medium text-ink-2">{b as string}</p>
              </div>
            );
          })}
        </div>
      </Block>

      {/* rollout */}
      <Block title="How it could roll out" sub="In order of what saves you the most time. Timings are a rough guide for one developer.">
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {PHASES.map(([when, t, b], i) => (
            <li key={t} className="flex flex-col rounded-[24px] bg-surface p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[16px] font-extrabold text-primary-ink">{i + 1}</span>
                <span className="text-[12.5px] font-bold text-ink-muted">{when}</span>
              </div>
              <div className="mt-4 text-[17px] font-extrabold text-ink">{t}</div>
              <p className="mt-1 text-[14px] font-medium text-ink-2">{b}</p>
            </li>
          ))}
        </ol>
      </Block>

      <footer className="mx-auto mt-16 max-w-[1180px] px-4 sm:px-6">
        <details className="rounded-[24px] bg-surface p-6 shadow-card">
          <summary className="cursor-pointer text-[15px] font-bold text-ink">Research behind the design ({SOURCES.length} sources)</summary>
          <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-[13.5px] font-medium sm:grid-cols-2 lg:grid-cols-3">
            {SOURCES.map(([t, u]) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noreferrer" className="text-ink-2 underline decoration-line-strong underline-offset-2 hover:text-ink">
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </details>
        <p className="mt-6 text-center text-[12.5px] font-semibold text-ink-muted">
          {BRAND.legalName} is a placeholder name. All people, numbers and reviews are sample data. Sales this month: {money(live.m.revenue)}.
        </p>
      </footer>
    </div>
  );
}

function Block({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-16 max-w-[1180px] px-4 sm:px-6">
      <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[36px]">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-[15px] font-medium text-ink-muted">{sub}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
