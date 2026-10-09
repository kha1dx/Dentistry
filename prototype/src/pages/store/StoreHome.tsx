import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, MessageCircle, PhoneCall, Plus, ShieldCheck, Smartphone, Wrench } from "lucide-react";
import { BRAND } from "@/config/brand";
import { KITS, PRODUCTS, YEAR_LABEL, kitRawPrice } from "@/data/catalog";
import type { YearOfStudy } from "@/data/types";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/store/useStore";
import { ProductArt } from "@/components/art/ProductArt";
import { Avatar } from "@/components/ui/primitives";
import { CategoryCard, KitCard, ProductCard, Section, SeeAll, Stars } from "./parts";

export default function StoreHome() {
  return (
    <>
      <Hero />
      <StatsRow />

      <Section className="mt-16" title="Shop by category" sub="Find what your lab asks for in seconds." action={<SeeAll to="/shop/catalog">All products</SeeAll>}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <CategoryCard to="/shop/catalog" label="Handpieces" sub="Turbines, motors, curing lights" art="handpiece" category="Handpieces & motors" />
          <CategoryCard to="/shop/catalog" label="Instruments" sub="Hand sets, carvers, forceps" art="instruments" category="Hand instruments" active />
          <CategoryCard to="/shop/catalog" label="Typodonts" sub="Jaws and practice teeth" art="typodont" category="Typodonts & teeth" />
          <CategoryCard to="/shop/catalog" label="Endo" sub="Files, points, rubber dam" art="files" category="Endo" />
        </div>
      </Section>

      <HotPicks />

      <PromoRow />

      <RepairBlock />

      <Reviews />
      <Faq />
      <ContactStrip />
    </>
  );
}

/* ------------------------------------------------------------------- hero */

function Hero() {
  const add = useStore((s) => s.addToCart);
  const micromotor = PRODUCTS.find((p) => p.id === "p04")!;
  return (
    <section className="mx-auto max-w-[1240px] px-4 pt-4 sm:px-6">
      <div className="hero-ground relative overflow-hidden rounded-[32px] px-6 pb-8 pt-10 sm:px-12 sm:pb-12 sm:pt-14">
        <div className="relative z-10 max-w-[560px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1.5 text-[12.5px] font-bold text-ink">
            <span className="h-2 w-2 rounded-full bg-primary" /> For dental students in Cairo
          </span>
          <h1 className="mt-5 text-[44px] font-extrabold leading-[1] tracking-[-0.045em] text-ink sm:text-[64px]">
            Your requirements list, <span className="text-primary">handled.</span>
          </h1>
          <p className="mt-5 max-w-[30rem] text-[16px] font-medium leading-relaxed text-ink-2">
            Kits and tools for every year, delivered to your faculty gate. If something breaks, we get it fixed for you.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/shop/requirements" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-bold text-surface hover:opacity-90">
              Build my list <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop/catalog" className="inline-flex h-12 items-center rounded-full bg-surface px-6 text-[15px] font-bold text-ink hover:bg-surface/80">
              Shop all
            </Link>
          </div>
        </div>

        {/* big illustration */}
        <div className="pointer-events-none absolute -right-10 bottom-0 top-0 hidden w-[52%] items-center justify-center md:flex" aria-hidden>
          <div className="absolute h-[440px] w-[440px] rounded-full bg-surface/50" />
          <div className="absolute h-[300px] w-[300px] rounded-full bg-surface/70" />
          <ProductArt kind="handpiece" category="Handpieces & motors" fluid tile={false} className="relative aspect-square w-[78%] [&_svg]:w-[80%] text-ink" />
        </div>

        {/* small product card, like the watch card */}
        <div className="absolute bottom-6 right-6 hidden w-[200px] rounded-[22px] bg-surface p-3 shadow-pop lg:block">
          <ProductArt kind={micromotor.art} category={micromotor.category} fluid className="aspect-[4/3] w-full rounded-2xl" />
          <div className="mt-2 px-1 text-[13px] font-bold leading-snug text-ink">Strong 204 micromotor</div>
          <button type="button" onClick={() => add(micromotor.id)} className="pointer-events-auto mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-full bg-ink text-[13px] font-bold text-surface hover:opacity-90">
            <Plus className="h-4 w-4" /> {money(micromotor.price)}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- stats row */

function StatsRow() {
  const stats = [
    ["7", "faculties we deliver to"],
    ["1,200+", "students served"],
    ["4.8", "average rating"],
    ["6 min", "average reply time"],
  ];
  return (
    <section className="mx-auto mt-10 max-w-[1240px] px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-y-6 lg:grid-cols-4">
        {stats.map(([n, l], i) => (
          <div key={l} className={cn("flex items-center gap-3 px-2 sm:px-6", i > 0 && "lg:border-l lg:border-line")}>
            <span className="whitespace-nowrap text-[28px] font-extrabold tracking-[-0.04em] text-ink sm:text-[44px]">{n}</span>
            <span className="max-w-[7rem] text-[13px] font-semibold leading-tight text-ink-muted">{l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- hot picks */

const PICKS: Record<number, string[]> = {
  2: ["p22", "p10", "p04"],
  3: ["p36", "p03", "p33"],
  4: ["p06", "p26", "p14"],
  5: ["p15", "p07", "p08"],
  6: ["p38", "p01", "p40"],
};

function HotPicks() {
  const [year, setYear] = useState<YearOfStudy>(3);
  const kit = KITS.find((k) => k.year === year) ?? KITS[0];
  return (
    <Section
      className="mt-16"
      title="Hot picks for you"
      sub="What students in your year are ordering this week."
      action={
        <div className="no-scrollbar -mb-4 flex gap-5 overflow-x-auto">
          {([2, 3, 4, 5, 6] as YearOfStudy[]).map((y) => (
            <button key={y} type="button" onClick={() => setYear(y)} className={cn("shrink-0 border-b-2 pb-3.5 text-[14px] font-bold transition-colors", year === y ? "border-primary text-primary" : "border-transparent text-ink-muted hover:text-ink")}>
              {YEAR_LABEL[y]}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {PICKS[year].map((id) => (
          <ProductCard key={id} p={PRODUCTS.find((p) => p.id === id)!} />
        ))}
        <Link to={`/shop/catalog?year=${year}`} className="group relative col-span-2 flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[22px] bg-gradient-to-br from-[#7b6cf6] via-[#5b47e6] to-[#2a78d6] p-6 text-white lg:col-span-1">
          <ProductArt kind="kit" category="Kit" fluid tile={false} className="absolute -right-6 -top-4 aspect-square w-[75%] text-white/90 [&_svg]:w-[70%]" />
          <div className="relative">
            <div className="text-[20px] font-extrabold leading-tight tracking-[-0.02em]">The whole {YEAR_LABEL[year]} kit</div>
            <div className="mt-1 text-[13px] font-semibold text-white/80">
              {kit.items.length} items · save {money(kitRawPrice(kit) - kit.price)}
            </div>
            <span className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[13.5px] font-bold text-ink">
              View kit <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- promo row */

function PromoRow() {
  return (
    <section className="mx-auto mt-16 grid max-w-[1240px] grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {KITS.slice(1, 3).map((k) => (
          <KitCard key={k.id} k={k} />
        ))}
      </div>
      <div className="hero-ground flex flex-col justify-between rounded-[22px] p-7">
        <div>
          <div className="text-[12.5px] font-bold text-primary">This term only</div>
          <h3 className="mt-2 text-[30px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink">Save up to 8% when you buy the whole kit.</h3>
          <p className="mt-3 text-[14px] font-medium text-ink-2">Every item your course lists, in one box, checked before it leaves.</p>
        </div>
        <Link to="/shop/requirements" className="mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-bold text-surface hover:opacity-90">
          Find my year's kit <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- repair block */

function RepairBlock() {
  const steps = [
    { t: "We pick it up", b: "From your faculty gate, the same day you message us.", art: "handpiece" as const },
    { t: "You get a loaner", b: "So you never miss a practical while it's away.", art: "contra" as const },
    { t: "You OK the price", b: "Nothing is repaired until you say yes. Then it comes back tested.", art: "micromotor" as const },
  ];
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-4 sm:px-6">
      <div className="rounded-[32px] bg-side p-6 text-side-ink sm:p-10">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[42px]">Something broke? We fix it. You keep studying.</h2>
          <p className="max-w-sm text-[14.5px] font-medium text-side-muted">We deal with the service centre, chase them, and keep you updated. No other supplier does this.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.t} className="rounded-[22px] bg-side-2 p-3">
              <ProductArt kind={s.art} category="Handpieces & motors" fluid className="aspect-[16/10] w-full rounded-2xl" />
              <div className="px-2 pb-2 pt-4">
                <div className="text-[18px] font-extrabold">{s.t}</div>
                <p className="mt-1 text-[13.5px] font-medium leading-relaxed text-side-muted">{s.b}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/shop/repair" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-bold text-[#121218] hover:opacity-90">
            <Wrench className="h-4 w-4" /> Start a repair
          </Link>
          <Link to="/shop/track" className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-[15px] font-bold text-side-ink hover:bg-white/10">
            Track a repair
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- reviews */

function Reviews() {
  const r = [
    { q: "My micromotor died two days before the prosth practical. He picked it up, gave me a loaner and had it back by Sunday.", n: "Nour H.", m: "Cairo University · 2nd year" },
    { q: "I sent a photo of our requirements list and had a full quote in half an hour. Everything came in one box.", n: "Omar F.", m: "Ain Shams · 3rd year" },
    { q: "Not the cheapest, and I don't care. When something's wrong he answers, and he sorts it out.", n: "Yasmin H.", m: "Cairo University · 5th year" },
  ];
  return (
    <Section className="mt-16" title="Students love the service" sub="Sample reviews for the prototype.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {r.map((x, i) => (
          <figure key={x.n} className={cn("flex flex-col rounded-[22px] p-6", ["bg-tint-sky", "bg-tint-lemon", "bg-tint-mint"][i])}>
            <Stars value={5} />
            <blockquote className="mt-3 flex-1 text-[16px] font-semibold leading-relaxed text-ink">“{x.q}”</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <Avatar name={x.n} size={38} />
              <span>
                <span className="block text-[14px] font-bold text-ink">{x.n}</span>
                <span className="text-[12.5px] font-semibold text-ink-muted">{x.m}</span>
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
    ["When will my order arrive?", "Items in stock reach your faculty gate within 48 hours. If something needs ordering, you'll see the exact date before you confirm."],
    ["What if something is faulty?", "Message us. Anything under warranty is replaced or repaired at no cost, and we handle the service centre for you."],
    ["Our class wants to order together", "Class reps get one quote for the whole batch, a group price, and a single delivery to the faculty."],
  ];
  const [open, setOpen] = useState(0);
  return (
    <Section className="mt-16" title="Questions">
      <div className="grid grid-cols-1 gap-3">
        {items.map(([q, a], i) => (
          <div key={q} className="rounded-[22px] bg-surface shadow-card">
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left" aria-expanded={open === i}>
              <span className="text-[16px] font-bold text-ink">{q}</span>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 transition-transform", open === i && "rotate-180")}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
            {open === i && <p className="max-w-3xl px-6 pb-5 text-[14.5px] font-medium leading-relaxed text-ink-2">{a}</p>}
          </div>
        ))}
      </div>
    </Section>
  );
}

function ContactStrip() {
  return (
    <section className="mx-auto mt-16 max-w-[1240px] px-4 sm:px-6">
      <div className="flex flex-col gap-6 rounded-[32px] bg-ink p-8 text-surface md:flex-row md:items-center md:justify-between sm:p-10">
        <div className="flex items-center gap-4">
          <Avatar name={BRAND.owner.fullName} size={60} />
          <div>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.03em]">Talk to {BRAND.owner.name}</h2>
            <p className="text-[14.5px] font-medium text-surface/70">The same person who packs your order. Replies in about 6 minutes.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-11 items-center gap-2 rounded-full bg-surface px-5 text-[14px] font-bold text-ink">
            <MessageCircle className="h-4 w-4" /> Chat (bottom right)
          </span>
          <span className="inline-flex h-11 items-center gap-2 rounded-full border border-surface/25 px-5 text-[14px] font-bold">
            <PhoneCall className="h-4 w-4" /> Call back
          </span>
          <span className="inline-flex h-11 select-all items-center gap-2 rounded-full border border-surface/25 px-5 text-[14px] font-bold">
            <Smartphone className="h-4 w-4" /> {BRAND.whatsapp}
          </span>
        </div>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-ink-muted">
        <ShieldCheck className="h-4 w-4" /> Genuine brands with warranty · free delivery to your faculty gate
      </p>
    </section>
  );
}
