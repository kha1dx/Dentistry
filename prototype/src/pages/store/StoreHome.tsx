import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, Clock3, MapPin, MessageCircle, PhoneCall, ShieldCheck, Smartphone, Wrench } from "lucide-react";
import { BRAND } from "@/config/brand";
import { KITS, PRODUCTS, REQUIREMENTS, YEAR_LABEL, product } from "@/data/catalog";
import type { YearOfStudy } from "@/data/types";
import { cn } from "@/lib/cn";
import { money, shortName } from "@/lib/format";
import { ProductArt } from "@/components/art/ProductArt";
import { Avatar } from "@/components/ui/primitives";
import { KitCard, ProductCard, Section } from "./parts";

const YEAR_NOTE: Record<YearOfStudy, string> = {
  1: "Carving, wax, your first coat",
  2: "Typodont, operative and prosth labs",
  3: "Fixed prosth and endodontics",
  4: "Your first patients",
  5: "Surgery and endo clinic",
  6: "Loupes, turbine, scrubs",
};

export default function StoreHome() {
  return (
    <>
      <Hero />
      <TrustRow />

      <Section className="mt-20" eyebrow="Shop by year" title="Start from where you are" sub="Each year's list is built from what faculties actually ask for, term by term.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {([1, 2, 3, 4, 5, 6] as YearOfStudy[]).map((y) => (
            <Link key={y} to={`/shop/requirements?year=${y}`} className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary">
              <div className="font-display text-[44px] leading-none text-ink">{y === 6 ? "Int." : `${y}${["st", "nd", "rd", "th", "th"][y - 1]}`}</div>
              <div className="mt-6">
                <div className="text-[13.5px] font-medium text-ink">{YEAR_LABEL[y]}</div>
                <div className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">{YEAR_NOTE[y]}</div>
                <div className="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-primary">
                  {REQUIREMENTS[y].length} items <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        className="mt-20"
        eyebrow="Kits"
        title="Whole kits, priced below the parts"
        sub="Everything a course asks for in one box, checked before it leaves."
        action={
          <Link to="/shop/catalog" className="inline-flex items-center gap-1 text-[14px] font-medium text-primary hover:underline">
            All products <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[KITS[1], KITS[3], KITS[4], KITS[5]].map((k) => (
            <KitCard key={k.id} k={k} />
          ))}
        </div>
      </Section>

      <RepairBlock />

      <Section className="mt-20" eyebrow="Most asked for this week" title="Back-to-term favourites">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {["p04", "p22", "p01", "p36", "p33", "p06", "p38", "p39"].map((id) => (
            <ProductCard key={id} p={PRODUCTS.find((p) => p.id === id)!} />
          ))}
        </div>
      </Section>

      <Reviews />
      <Faq />
      <ContactStrip />
    </>
  );
}

function Hero() {
  const req = REQUIREMENTS[3].slice(0, 6);
  return (
    <section className="relative overflow-hidden">
      <div className="dot-ground absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="relative mx-auto grid grid-cols-1 max-w-[1240px] gap-12 px-4 pb-10 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-20">
        <div>
          <div className="eyebrow">For dental students in Cairo</div>
          <h1 className="mt-4 font-display text-[52px] leading-[0.95] tracking-[-0.015em] text-ink sm:text-[68px] lg:text-[76px]">
            Your requirements list, <em className="text-primary">handled.</em>
          </h1>
          <p className="mt-6 max-w-[34rem] text-[16.5px] leading-relaxed text-ink-2">
            Instruments, materials and kits for every year of dental school, delivered to your faculty gate. When a handpiece breaks, we take it to the service centre, lend you one meanwhile, and bring it back fixed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop/requirements" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-medium text-primary-ink shadow-card hover:bg-primary-hover">
              Build my requirements list <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop/catalog" className="inline-flex h-12 items-center rounded-xl border border-line bg-surface px-6 text-[15px] font-medium text-ink hover:border-line-strong">
              Browse the shop
            </Link>
          </div>
        </div>

        {/* composite: list + tracking + reply */}
        <div className="relative mx-auto w-full max-w-[460px]">
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-pop sm:pb-20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] text-ink-muted">Ain Shams · 3rd year</div>
                <div className="font-display text-[26px] leading-tight text-ink">Requirements</div>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-semibold text-ink">9/12</div>
                <div className="text-[12px] text-ink-muted">ready</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-surface-3">
              <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-1">
              {req.map((r, i) => {
                const p = product(r.productId);
                const done = i !== 2 && i !== 4;
                return (
                  <li key={r.productId} className="flex items-center gap-3 rounded-xl px-1 py-1.5">
                    <ProductArt kind={p.art} category={p.category} size={38} />
                    <span className={cn("min-w-0 flex-1 truncate text-[13.5px]", done ? "text-ink-muted" : "text-ink")}>{shortName(p.name)}</span>
                    {done ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-good-soft text-good">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="text-[13px] font-medium text-ink tnum">{money(p.price * r.qty)}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="absolute -left-4 bottom-[-26px] hidden w-[250px] rotate-[-2deg] rounded-2xl border border-line bg-surface p-3.5 shadow-pop sm:block lg:-left-14">
            <div className="flex items-center gap-2 text-[12px] text-ink-muted">
              <Wrench className="h-3.5 w-3.5 text-primary" /> <span className="font-mono">RP-1209</span>
            </div>
            <div className="mt-1 text-[14px] font-medium text-ink">Pana-Max handpiece</div>
            <div className="mt-2 flex gap-1">
              {[1, 1, 1, 1, 0, 0].map((x, i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full", x ? "bg-primary" : "bg-surface-3")} />
              ))}
            </div>
            <div className="mt-1.5 text-[12px] text-ink-2">Being repaired · back Saturday</div>
          </div>
          <div className="absolute -right-3 -top-[88px] hidden max-w-[220px] rotate-[2deg] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[13px] text-primary-ink shadow-pop sm:block lg:-right-10">
            Yes, it's covered by warranty. I'll pick it up at 1pm and leave you a loaner.
            <div className="mt-1 text-right text-[10.5px] opacity-75">{BRAND.owner.name} · replied in 4 min</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRow() {
  const items = [
    { Icon: MapPin, title: "Delivered to your gate", body: "7 faculties, free hand-over" },
    { Icon: Wrench, title: "Repairs handled for you", body: "Pickup, loaner, approval, return" },
    { Icon: ShieldCheck, title: "Genuine, with warranty", body: "NSK, Woodpecker, Medesy and more" },
    { Icon: Clock3, title: "A real person answers", body: "Usually within 6 minutes" },
  ];
  return (
    <div className="mx-auto mt-10 max-w-[1240px] px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.title} className="flex items-start gap-3 bg-surface p-4 sm:p-5">
            <i.Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <div className="text-[14px] font-medium text-ink">{i.title}</div>
              <div className="text-[12.5px] text-ink-muted">{i.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepairBlock() {
  const steps = [
    { t: "We collect it", b: "From your faculty gate, the same day when you message before 2pm." },
    { t: "You keep working", b: "Take a loaner turbine so you don't miss a practical." },
    { t: "You approve the price", b: "The service centre diagnoses it. Nothing is repaired until you say yes." },
    { t: "Back in your hands", b: "Tested on our bench, returned to your gate, with a repair warranty." },
  ];
  return (
    <section className="mt-24 bg-side py-16 text-side-ink sm:py-20">
      <div className="mx-auto grid grid-cols-1 max-w-[1240px] gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-side-active">Repair concierge</div>
          <h2 className="mt-3 font-display text-[40px] leading-[1.02] sm:text-[54px]">Broken handpiece the week before your practical?</h2>
          <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-side-muted">This is the part nobody else does. We deal with the service centre, chase them, and keep you updated, so you don't have to.</p>
          <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.t} className="flex gap-3">
                <span className="font-display text-[30px] leading-none text-side-active">{i + 1}</span>
                <div>
                  <div className="text-[15px] font-medium">{s.t}</div>
                  <div className="mt-1 text-[13.5px] leading-relaxed text-side-muted">{s.b}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/shop/repair" className="inline-flex h-12 items-center gap-2 rounded-xl bg-side-active px-6 text-[15px] font-medium text-side hover:brightness-105">
              Start a repair <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop/track" className="inline-flex h-12 items-center rounded-xl border border-side-2 px-6 text-[15px] font-medium text-side-ink hover:border-side-muted">
              Track a repair
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[440px] rounded-3xl bg-surface p-6 text-ink shadow-pop">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[12.5px] text-ink-muted">RP-1204</div>
              <div className="mt-0.5 text-[17px] font-semibold">Pana-Max high-speed handpiece</div>
            </div>
            <ProductArt kind="handpiece" category="Handpieces & motors" size={56} />
          </div>
          <div className="mt-5 rounded-2xl bg-warn-soft p-4">
            <div className="text-[13.5px] font-medium">The service centre found a worn water line</div>
            <div className="mt-1 text-[13px] text-ink-2">New O-rings and line, 3-month repair warranty. Ready 2 days after you approve.</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[20px] font-semibold tnum">EGP 850</span>
              <span className="flex gap-2">
                <span className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px]">Call me</span>
                <span className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-ink">Approve</span>
              </span>
            </div>
          </div>
          <ol className="mt-5 grid grid-cols-1 gap-3 text-[13.5px]">
            {[
              ["Picked up at MSA", "Tue 13:10", true],
              ["At NSK authorised service", "Tue 18:00", true],
              ["Diagnosed · waiting for your OK", "Wed 15:40", true],
              ["Repaired and tested", "Expected Fri", false],
            ].map(([t, d, done]) => (
              <li key={t as string} className="flex items-center gap-3">
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", done ? "bg-primary text-primary-ink" : "border border-line-strong")}>{done && <Check className="h-3 w-3" />}</span>
                <span className={cn("flex-1", done ? "text-ink" : "text-ink-muted")}>{t}</span>
                <span className="text-[12px] text-ink-muted">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const r = [
    { q: "My micromotor died two days before the prosth practical. He picked it up from Kasr Al Ainy, gave me a loaner and had it back by Sunday.", n: "Nour H.", m: "Cairo University · 2nd year" },
    { q: "I sent a photo of our requirements list and had a full quote in half an hour. Everything came in one box, labelled.", n: "Omar F.", m: "Ain Shams · 3rd year" },
    { q: "Not the cheapest, and I don't care. When something's wrong he answers, and he sorts it out.", n: "Yasmin H.", m: "Cairo University · 5th year" },
  ];
  return (
    <Section className="mt-24" eyebrow="Sample reviews" title="Why students pay a little more">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {r.map((x) => (
          <figure key={x.n} className="flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-card">
            <blockquote className="flex-1 font-display text-[22px] leading-snug text-ink">“{x.q}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <Avatar name={x.n} size={34} />
              <span>
                <span className="block text-[13.5px] font-medium text-ink">{x.n}</span>
                <span className="text-[12.5px] text-ink-muted">{x.m}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

function Faq() {
  const items = [
    ["How do I pay?", "InstaPay, Vodafone Cash, card, or cash when you receive your order. You get a receipt on WhatsApp either way."],
    ["When will my order arrive?", "Items in stock reach your faculty gate within 48 hours. If something needs ordering from a supplier, you'll see the exact date before you confirm."],
    ["What if something is faulty?", "Message us. Anything under warranty is replaced or repaired at no cost, and we handle the service centre for you."],
    ["Our class wants to order together", "Class reps get one quote for the whole batch, a group price, and a single delivery to the faculty. Message us with the number of students."],
    ["Do you deliver outside campus?", "Yes, by courier anywhere in Greater Cairo for EGP 75."],
  ];
  const [open, setOpen] = useState(0);
  return (
    <Section className="mt-24" eyebrow="Questions" title="Before you ask">
      <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {items.map(([q, a], i) => (
          <div key={q}>
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={open === i}>
              <span className="text-[15.5px] font-medium text-ink">{q}</span>
              <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-muted transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i && <p className="max-w-3xl px-5 pb-5 text-[14.5px] leading-relaxed text-ink-2">{a}</p>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function ContactStrip() {
  return (
    <section className="mx-auto mt-24 max-w-[1240px] px-4 sm:px-6">
      <div className="grid grid-cols-1 gap-6 rounded-3xl border border-line bg-surface p-8 shadow-card md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="flex items-center gap-4">
          <Avatar name={BRAND.owner.fullName} size={64} />
          <div>
            <h2 className="font-display text-[34px] leading-tight text-ink">Talk to {BRAND.owner.name}</h2>
            <p className="text-[14.5px] text-ink-2">Not a call centre. The same person who packs your order.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex flex-col items-start gap-1 rounded-xl border border-line p-3.5">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="text-[13.5px] font-medium text-ink">Chat</span>
            <span className="text-[12px] text-ink-muted">Bottom right of any page</span>
          </div>
          <div className="flex flex-col items-start gap-1 rounded-xl border border-line p-3.5">
            <PhoneCall className="h-5 w-5 text-primary" />
            <span className="text-[13.5px] font-medium text-ink">Call back</span>
            <span className="text-[12px] text-ink-muted">Pick a time in the chat</span>
          </div>
          <div className="flex flex-col items-start gap-1 rounded-xl border border-line p-3.5">
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="text-[13.5px] font-medium text-ink">WhatsApp</span>
            <span className="select-all font-mono text-[12px] text-ink-2">{BRAND.whatsapp}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
