import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Copy, Menu, MessageCircle, Minus, PhoneCall, Plus, Search, Send, ShoppingBag, Wrench, X } from "lucide-react";
import { BRAND } from "@/config/brand";
import { cn } from "@/lib/cn";
import { money, time } from "@/lib/format";
import { cartLines, useStore } from "@/store/useStore";
import { Logo } from "@/components/ui/Logo";
import { Avatar, Button } from "@/components/ui/primitives";
import { Drawer } from "@/components/ui/overlays";
import { IsoStripe } from "@/components/ui/domain";
import { ProductArt } from "@/components/art/ProductArt";

const NAV = [
  { to: "/shop/catalog", label: "Shop" },
  { to: "/shop/requirements", label: "Requirements list" },
  { to: "/shop/repair", label: "Repairs" },
  { to: "/shop/track", label: "Track" },
];

export default function StoreLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const cart = useStore((s) => s.cart);
  const me = useStore((s) => s.clients.find((c) => c.id === s.meId)!);
  const loc = useLocation();
  const count = cart.reduce((s, c) => s + c.qty, 0);

  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);

  return (
    <div className="min-h-full bg-enamel">
      {/* announcement */}
      <div className="bg-side px-4 text-[12.5px] text-side-ink">
        <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between gap-3">
          <span className="truncate">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-side-active align-middle" />
            First term is here. Order by Thursday for Saturday delivery to your faculty gate.
          </span>
          <Link to="/admin" className="hidden shrink-0 items-center gap-1 text-side-muted hover:text-side-ink sm:inline-flex">
            Prototype: owner console <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* header */}
      <header className="sticky z-30 border-b border-line bg-[color-mix(in_srgb,var(--enamel)_88%,transparent)] backdrop-blur-md" style={{ top: "env(safe-area-inset-top, 0px)" }}>
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4 sm:px-6">
          <Link to="/shop" className="shrink-0">
            <Logo sub="Dental supply" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Store">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cn("rounded-lg px-3 py-2 text-[14px] font-medium transition-colors", isActive ? "text-primary" : "text-ink-2 hover:text-ink")}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <Link to="/shop/catalog" aria-label="Search the shop" className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-3 sm:flex">
              <Search className="h-[19px] w-[19px]" />
            </Link>
            <Link to="/shop/account" className="hidden items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-3 sm:flex">
              <Avatar name={me.name} size={28} />
              <span className="text-[13.5px] font-medium text-ink">{me.name.split(" ")[0]}</span>
            </Link>
            <button type="button" onClick={() => setCartOpen(true)} className="relative flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-[13.5px] font-medium text-primary-ink hover:bg-primary-hover">
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">Bag</span>
              {count > 0 && <span className="rounded-full bg-primary-ink/20 px-1.5 text-[12px] tnum">{count}</span>}
            </button>
            <button type="button" aria-label="Menu" onClick={() => setMenu(true)} className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 hover:bg-surface-3 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-line bg-surface">
        <div className="mx-auto grid grid-cols-1 max-w-[1240px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo sub="Dental supply" />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-2">Instruments, materials and kits for dental students in Cairo, with repairs handled for you. One person who knows your order from start to finish.</p>
            <div className="mt-4 flex items-center gap-2 text-[12px] text-ink-muted">
              <IsoStripe className="h-3" /> ISO 15–40, the colours you'll learn by heart
            </div>
          </div>
          <div>
            <div className="eyebrow mb-3">Shop</div>
            <ul className="grid grid-cols-1 gap-2 text-[13.5px] text-ink-2">
              {["1st year", "2nd year", "3rd year", "4th year", "5th year", "Interns"].map((y, i) => (
                <li key={y}>
                  <Link to={`/shop/catalog?year=${i + 1}`} className="hover:text-ink">
                    {y}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Service</div>
            <ul className="grid grid-cols-1 gap-2 text-[13.5px] text-ink-2">
              <li><Link to="/shop/requirements" className="hover:text-ink">Requirements list</Link></li>
              <li><Link to="/shop/repair" className="hover:text-ink">Repairs and loaners</Link></li>
              <li><Link to="/shop/track" className="hover:text-ink">Track an order or repair</Link></li>
              <li><Link to="/shop/account" className="hover:text-ink">My account</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Talk to us</div>
            <ul className="grid grid-cols-1 gap-2 text-[13.5px] text-ink-2">
              <li className="font-mono text-[13px]">{BRAND.whatsapp}</li>
              <li>{BRAND.email}</li>
              <li>{BRAND.hours}</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["InstaPay", "Vodafone Cash", "Cash on delivery", "Card"].map((m) => (
                <span key={m} className="rounded-md border border-line px-2 py-1 text-[11.5px] text-ink-2">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-line px-4 py-4 text-center text-[12px] text-ink-muted">Prototype with sample data. Names, prices and reviews are illustrative.</div>
      </footer>

      {/* mobile menu */}
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
          <div className="absolute inset-x-0 top-0 animate-fade-up rounded-b-2xl bg-surface p-4 shadow-pop" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
            <div className="flex items-center justify-between">
              <Logo sub="Dental supply" />
              <button aria-label="Close" onClick={() => setMenu(false)} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface-3">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 grid grid-cols-1 gap-1">
              {[...NAV, { to: "/shop/account", label: "My account" }, { to: "/admin", label: "Owner console (prototype)" }].map((n) => (
                <Link key={n.to} to={n.to} className="rounded-xl px-3 py-3 text-[16px] font-medium text-ink hover:bg-surface-3">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SupportWidget />
    </div>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const setQty = useStore((s) => s.setCartQty);
  const nav = useNavigate();
  const lines = cartLines(cart, products);
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Your bag"
      sub={lines.length ? `${lines.reduce((s, l) => s + l.qty, 0)} items` : "Empty"}
      width={460}
      footer={
        lines.length > 0 && (
          <div className="w-full">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-ink-2">Total</span>
              <span className="text-[20px] font-semibold text-ink tnum">{money(total)}</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                onClose();
                nav("/shop/checkout");
              }}
            >
              Checkout
            </Button>
            <p className="mt-2 text-center text-[12px] text-ink-muted">Free delivery to your faculty gate · pay on delivery or by InstaPay</p>
          </div>
        )
      }
    >
      <ul className="px-5 py-3">
        {lines.map((l) => {
          const p = products.find((x) => x.id === l.key);
          return (
            <li key={l.key} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
              <ProductArt kind={l.art} category={p?.category ?? "Kit"} size={56} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium text-ink">{l.name}</div>
                <div className="text-[12.5px] text-ink-muted">{l.sub}</div>
                <div className="mt-1.5 inline-flex items-center rounded-lg border border-line">
                  <button type="button" aria-label="Fewer" onClick={() => setQty(l.key, l.qty - 1)} className="flex h-7 w-7 items-center justify-center text-ink-2 hover:text-ink">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-[13px] tnum">{l.qty}</span>
                  <button type="button" aria-label="More" onClick={() => setQty(l.key, l.qty + 1)} className="flex h-7 w-7 items-center justify-center text-ink-2 hover:text-ink">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-[14px] font-medium text-ink tnum">{money(l.price * l.qty)}</span>
            </li>
          );
        })}
        {!lines.length && (
          <li className="py-16 text-center">
            <p className="font-display text-[28px] text-ink">Nothing here yet</p>
            <p className="mt-1 text-[13.5px] text-ink-muted">Start from your requirements list. It fills the bag for you.</p>
            <Link to="/shop/requirements" onClick={onClose} className="mt-4 inline-block text-[14px] font-medium text-primary hover:underline">
              Build my list
            </Link>
          </li>
        )}
      </ul>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ support */

type Mode = "home" | "chat" | "call" | "done";

function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("home");
  const [convId, setConvId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [slot, setSlot] = useState("Today, 18:00–19:00");
  const [topic, setTopic] = useState("An order");
  const startChat = useStore((s) => s.startChat);
  const clientSays = useStore((s) => s.clientSays);
  const autoReply = useStore((s) => s.autoReply);
  const requestCall = useStore((s) => s.requestCall);
  const toast = useStore((s) => s.toast);
  const conv = useStore((s) => s.conversations.find((c) => c.id === convId));
  const messages = useMemo(() => conv?.messages ?? [], [conv]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    if (!convId) {
      const id = startChat(t);
      setConvId(id);
      setTimeout(() => autoReply(id, `Thanks! ${BRAND.owner.name} has your message and usually replies within 6 minutes. Order or repair codes help (like CU-1851 or RP-1209).`), 900);
    } else clientSays(convId, t);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-primary pl-3 pr-4 text-[14px] font-medium text-primary-ink shadow-pop hover:bg-primary-hover"
          style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <span className="relative">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-side-active ring-2 ring-primary" />
          </span>
          Need help?
        </button>
      )}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[min(620px,100dvh)] w-full animate-pop-in flex-col overflow-hidden border border-line bg-surface shadow-pop sm:bottom-5 sm:right-5 sm:h-[600px] sm:w-[380px] sm:rounded-2xl" role="dialog" aria-label="Support">
          <div className="bg-side px-4 pb-4 pt-3 text-side-ink" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
            <div className="flex items-center justify-between">
              {mode !== "home" ? (
                <button type="button" onClick={() => setMode("home")} className="text-[13px] text-side-muted hover:text-side-ink">
                  ← Back
                </button>
              ) : (
                <span className="text-[13px] text-side-muted">{BRAND.legalName}</span>
              )}
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-side-muted hover:text-side-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="relative">
                <Avatar name={BRAND.owner.fullName} size={40} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#3ad07a] ring-2 ring-side" />
              </span>
              <div>
                <div className="font-display text-[22px] leading-none">Hi, I'm {BRAND.owner.name}.</div>
                <div className="mt-1 text-[12.5px] text-side-muted">Usually replies in about 6 minutes · {BRAND.hours}</div>
              </div>
            </div>
          </div>

          {mode === "home" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-2">
                <button type="button" onClick={() => setMode("chat")} className="flex items-center gap-3 rounded-xl border border-line p-3.5 text-left hover:border-primary">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-ink">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-ink">Chat here</span>
                    <span className="text-[12.5px] text-ink-muted">Prices, availability, your requirements list</span>
                  </span>
                </button>
                <button type="button" onClick={() => setMode("call")} className="flex items-center gap-3 rounded-xl border border-line p-3.5 text-left hover:border-primary">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warn-soft text-warn">
                    <PhoneCall className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-ink">Get a call back</span>
                    <span className="text-[12.5px] text-ink-muted">Pick a time, {BRAND.owner.name} calls you</span>
                  </span>
                </button>
                <div className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-good-soft text-good">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">WhatsApp</span>
                    <span className="select-all font-mono text-[12.5px] text-ink-2">{BRAND.whatsapp}</span>
                  </span>
                  <button
                    type="button"
                    aria-label="Copy number"
                    onClick={() => {
                      navigator.clipboard?.writeText(BRAND.whatsapp).catch(() => undefined);
                      toast("Number copied", "info");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-3 hover:text-ink"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="eyebrow mb-2 mt-5">Quick links</div>
              <div className="grid grid-cols-1 gap-1.5 text-[13.5px]">
                <Link to="/shop/track" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-2 py-2 text-ink-2 hover:bg-surface-2 hover:text-ink">
                  Where's my order or repair? <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/shop/repair" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-2 py-2 text-ink-2 hover:bg-surface-2 hover:text-ink">
                  Something broke <Wrench className="h-4 w-4" />
                </Link>
                <Link to="/shop/requirements" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-2 py-2 text-ink-2 hover:bg-surface-2 hover:text-ink">
                  Get a quote for my whole list <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {mode === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto bg-bg p-4">
                <div className="flex flex-col gap-2">
                  {!messages.length && (
                    <div className="rounded-xl bg-surface p-3 text-[13px] text-ink-2 shadow-card">
                      Ask anything. Your message goes straight to {BRAND.owner.name}'s inbox, the same place as WhatsApp.
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {["Is the Strong 204 in stock?", "Price for the 3rd year endo kit?", "Can you deliver to FUE Saturday?"].map((q) => (
                          <button key={q} type="button" onClick={() => setText(q)} className="rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-2 hover:border-primary hover:text-primary">
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.from === "client" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-[13.5px]", m.from === "client" ? "rounded-br-md bg-primary text-primary-ink" : "rounded-bl-md bg-surface text-ink shadow-card")}>
                        {m.text}
                        <div className={cn("mt-0.5 text-right text-[10.5px]", m.from === "client" ? "text-primary-ink/70" : "text-ink-muted")}>{time(m.at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {messages.length > 0 && (
                  <Link to={`/admin/inbox?c=${convId}`} className="mt-4 block rounded-xl border border-dashed border-violet/40 bg-violet-soft px-3 py-2 text-center text-[12px] text-violet">
                    Prototype: see this message arrive in the owner's inbox ↗
                  </Link>
                )}
              </div>
              <form
                className="flex gap-2 border-t border-line p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <input id="support-chat" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="h-10 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-[14px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none" />
                <Button type="submit" variant="primary" aria-label="Send" disabled={!text.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}

          {mode === "call" && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="eyebrow mb-2">When suits you?</div>
              <div className="grid grid-cols-2 gap-2">
                {["Today, 18:00–19:00", "Today, 20:00–21:00", "Tomorrow, 12:00–13:00", "Tomorrow, 17:00–18:00"].map((s) => (
                  <button key={s} type="button" onClick={() => setSlot(s)} className={cn("rounded-xl border px-3 py-2.5 text-left text-[13px]", slot === s ? "border-primary bg-primary-soft text-primary-soft-ink" : "border-line text-ink-2 hover:border-line-strong")}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="eyebrow mb-2 mt-4">About</div>
              <div className="flex flex-wrap gap-1.5">
                {["An order", "A repair", "My requirements list", "A group order", "Something else"].map((t) => (
                  <button key={t} type="button" onClick={() => setTopic(t)} className={cn("rounded-full border px-3 py-1.5 text-[12.5px]", topic === t ? "border-primary bg-primary-soft text-primary-soft-ink" : "border-line text-ink-2")}>
                    {t}
                  </button>
                ))}
              </div>
              <Button
                variant="primary"
                size="lg"
                className="mt-5 w-full"
                onClick={() => {
                  requestCall(slot, topic);
                  setMode("done");
                }}
              >
                Request the call
              </Button>
            </div>
          )}

          {mode === "done" && (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-good-soft text-good">
                <PhoneCall className="h-6 w-6" />
              </span>
              <p className="mt-3 font-display text-[26px] text-ink">Call booked</p>
              <p className="mt-1 text-[13.5px] text-ink-2">
                {BRAND.owner.name} will call you {slot.toLowerCase()} about {topic.toLowerCase()}.
              </p>
              <Link to="/admin/inbox" className="mt-4 text-[12.5px] text-violet hover:underline">
                Prototype: see it in the owner's inbox ↗
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
