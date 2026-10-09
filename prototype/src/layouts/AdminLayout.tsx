import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Contact,
  FileText,
  Handshake,
  Inbox,
  LayoutGrid,
  Menu,
  Moon,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Sun,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { BRAND } from "@/config/brand";
import { cn } from "@/lib/cn";
import { ago } from "@/lib/format";
import { isActiveRepair, isOpen, outstanding, daysOverdue, waitingSince } from "@/lib/metrics";
import { useTheme } from "@/lib/theme";
import { useStore } from "@/store/useStore";
import { Avatar, Badge, Kbd } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/Logo";
import { Modal, Popover } from "@/components/ui/overlays";
import { ProductArt } from "@/components/art/ProductArt";

interface NavItem {
  to: string;
  label: string;
  Icon: typeof Inbox;
  count?: number;
  alert?: boolean;
  end?: boolean;
}

function useNav(): NavItem[][] {
  const conversations = useStore((s) => s.conversations);
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  return useMemo(() => {
    const waiting = conversations.filter((c) => waitingSince(c)).length;
    const open = orders.filter(isOpen).length;
    const active = repairs.filter(isActiveRepair).length;
    const overdue = invoices.filter((i) => outstanding(i) > 0 && daysOverdue(i) > 0).length;
    return [
      [
        { to: "/admin", label: "Today", Icon: LayoutGrid, end: true },
        { to: "/admin/inbox", label: "Inbox", Icon: Inbox, count: waiting, alert: waiting > 0 },
        { to: "/admin/orders", label: "Orders", Icon: ShoppingBag, count: open },
        { to: "/admin/repairs", label: "Repairs", Icon: Wrench, count: active },
      ],
      [
        { to: "/admin/clients", label: "Clients", Icon: Contact },
        { to: "/admin/catalog", label: "Catalog & pricing", Icon: Package },
        { to: "/admin/invoices", label: "Invoices & payments", Icon: Receipt, count: overdue, alert: overdue > 0 },
        { to: "/admin/messaging", label: "Messages & automations", Icon: Zap },
        { to: "/admin/partners", label: "Suppliers & partners", Icon: Handshake },
        { to: "/admin/reports", label: "Reports", Icon: BarChart3 },
      ],
      [{ to: "/admin/settings", label: "Settings", Icon: Settings }],
    ];
  }, [conversations, orders, repairs, invoices]);
}

function SideLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group flex h-9 items-center gap-3 rounded-[10px] px-2.5 text-[13.5px] font-medium transition-colors",
          isActive ? "bg-side-2 text-side-ink" : "text-side-muted hover:bg-side-2/60 hover:text-side-ink",
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.Icon className={cn("h-[17px] w-[17px] shrink-0", isActive ? "text-side-active" : "")} />
          <span className="flex-1 truncate">{item.label}</span>
          {!!item.count && (
            <span
              className={cn(
                "min-w-[22px] rounded-full px-1.5 py-px text-center text-[11px] font-semibold tnum",
                item.alert ? "bg-side-active text-side" : "bg-side-2 text-side-muted group-hover:text-side-ink",
              )}
            >
              {item.count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const groups = useNav();
  return (
    <div className="flex h-full flex-col bg-side px-3 pb-3" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}>
      <div className="flex items-center justify-between px-2 pb-5">
        <Link to="/admin" onClick={onNavigate}>
          <Logo tone="light" sub="Console" />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto scroll-thin" aria-label="Console">
        {groups.map((g, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            {i === 1 && <div className="px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-side-muted/70">Business</div>}
            {g.map((item) => (
              <SideLink key={item.to} item={item} onClick={onNavigate} />
            ))}
          </div>
        ))}
      </nav>
      <div className="mt-3 flex flex-col gap-2">
        <Link
          to="/shop"
          className="flex items-center gap-2.5 rounded-xl border border-side-2 px-3 py-2.5 text-[13px] text-side-muted transition-colors hover:border-side-muted/40 hover:text-side-ink"
        >
          <Store className="h-4 w-4" />
          <span className="flex-1">Open the storefront</span>
          <span aria-hidden>↗</span>
        </Link>
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <Avatar name={BRAND.owner.fullName} size={32} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] font-medium text-side-ink">{BRAND.owner.fullName}</div>
            <div className="text-[11.5px] text-side-muted">Owner · all access</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- command palette */

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const clients = useStore((s) => s.clients);
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const products = useStore((s) => s.products);
  const groups = useNav();
  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const res = useMemo(() => {
    const t = q.trim().toLowerCase();
    const pages = groups.flat().filter((p) => !t || p.label.toLowerCase().includes(t));
    if (!t) return { pages, clients: [], orders: [], repairs: [], products: [] };
    return {
      pages,
      clients: clients.filter((c) => c.name.toLowerCase().includes(t) || c.phone.replace(/\s/g, "").includes(t.replace(/\s/g, ""))).slice(0, 5),
      orders: orders.filter((o) => o.id.toLowerCase().includes(t)).slice(-4).reverse(),
      repairs: repairs.filter((r) => r.id.toLowerCase().includes(t) || r.device.toLowerCase().includes(t)).slice(-4).reverse(),
      products: products.filter((p) => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)).slice(0, 5),
    };
  }, [q, clients, orders, repairs, products, groups]);

  const go = (to: string) => {
    onClose();
    nav(to);
  };
  const Row = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] text-ink hover:bg-surface-3 focus:bg-surface-3 focus:outline-none">
      {children}
    </button>
  );
  const Group = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="px-2 py-1.5">
      <div className="eyebrow px-3 pb-1">{title}</div>
      {children}
    </div>
  );
  return (
    <Modal open={open} onClose={onClose} title="Search everything" width={600}>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Client name, phone, CU-2481, RP-1203, product…"
            className="h-11 w-full rounded-xl border border-line bg-surface-2 pl-9 pr-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <div className="max-h-[56vh] overflow-y-auto pb-2 scroll-thin">
        {res.clients.length > 0 && (
          <Group title="Clients">
            {res.clients.map((c) => (
              <Row key={c.id} onClick={() => go(`/admin/clients/${c.id}`)}>
                <Avatar name={c.name} size={24} />
                <span className="flex-1">{c.name}</span>
                <span className="font-mono text-xs text-ink-muted">{c.phone}</span>
              </Row>
            ))}
          </Group>
        )}
        {res.orders.length > 0 && (
          <Group title="Orders">
            {res.orders.map((o) => (
              <Row key={o.id} onClick={() => go(`/admin/orders?o=${o.id}`)}>
                <ShoppingBag className="h-4 w-4 text-ink-muted" />
                <span className="font-mono text-[13px]">{o.id}</span>
                <span className="flex-1 truncate text-ink-muted">{o.items[0]?.name}</span>
              </Row>
            ))}
          </Group>
        )}
        {res.repairs.length > 0 && (
          <Group title="Repairs">
            {res.repairs.map((r) => (
              <Row key={r.id} onClick={() => go(`/admin/repairs?r=${r.id}`)}>
                <Wrench className="h-4 w-4 text-ink-muted" />
                <span className="font-mono text-[13px]">{r.id}</span>
                <span className="flex-1 truncate text-ink-muted">{r.device}</span>
              </Row>
            ))}
          </Group>
        )}
        {res.products.length > 0 && (
          <Group title="Products">
            {res.products.map((p) => (
              <Row key={p.id} onClick={() => go(`/admin/catalog?q=${encodeURIComponent(p.name)}`)}>
                <ProductArt kind={p.art} category={p.category} size={26} />
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-xs text-ink-muted tnum">{p.stock} in stock</span>
              </Row>
            ))}
          </Group>
        )}
        <Group title="Go to">
          {res.pages.map((p) => (
            <Row key={p.to} onClick={() => go(p.to)}>
              <p.Icon className="h-4 w-4 text-ink-muted" />
              <span className="flex-1">{p.label}</span>
            </Row>
          ))}
        </Group>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ notifications */

function Notifications() {
  const [open, setOpen] = useState(false);
  const items = useStore((s) => s.notifications);
  const markAll = useStore((s) => s.markAllRead);
  const nav = useNavigate();
  const unread = items.filter((n) => !n.read).length;
  const tone = { info: "bg-info", good: "bg-good", warn: "bg-warn", bad: "bg-bad" } as const;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications, ${unread} unread`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-2 hover:bg-surface-3 hover:text-ink"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bad ring-2 ring-surface" />}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} className="right-0 top-11 w-[min(360px,calc(100vw-24px))]">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-semibold">Notifications</span>
          <button className="text-[12.5px] font-medium text-primary hover:underline" onClick={markAll}>
            Mark all read
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-1 scroll-thin">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-surface-2"
                onClick={() => {
                  setOpen(false);
                  nav(n.to);
                }}
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", tone[n.tone], n.read && "opacity-30")} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[13.5px]", n.read ? "text-ink-2" : "font-medium text-ink")}>{n.text}</span>
                  <span className="text-xs text-ink-muted">{ago(n.at)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  );
}

function NewMenu() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const items = [
    { label: "Order", sub: "From a chat or a call", Icon: ShoppingBag, to: "/admin/orders?new=1" },
    { label: "Repair", sub: "Device picked up", Icon: Wrench, to: "/admin/repairs?new=1" },
    { label: "Invoice", sub: "Synced to your invoicing app", Icon: FileText, to: "/admin/invoices" },
    { label: "Broadcast", sub: "Message a group of students", Icon: Zap, to: "/admin/messaging?tab=broadcasts" },
  ];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary px-3 text-[13.5px] font-medium text-primary-ink shadow-card hover:bg-primary-hover"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} className="right-0 top-11 w-64 p-1.5">
        {items.map((i) => (
          <button
            key={i.label}
            type="button"
            onClick={() => {
              setOpen(false);
              nav(i.to);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-surface-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-ink">
              <i.Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[13.5px] font-medium text-ink">{i.label}</span>
              <span className="block text-xs text-ink-muted">{i.sub}</span>
            </span>
          </button>
        ))}
      </Popover>
    </div>
  );
}

/* --------------------------------------------------------------------- layout */

export default function AdminLayout() {
  const [cmd, setCmd] = useState(false);
  const [more, setMore] = useState(false);
  const { isDark, cycle } = useTheme();
  const loc = useLocation();
  const groups = useNav();
  const primary = groups[0];

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    setMore(false);
    document.querySelector("main")?.scrollTo?.({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-[100dvh] w-[248px] shrink-0 lg:block">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky z-30 flex h-14 items-center gap-2 border-b border-line bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-4 backdrop-blur-md sm:px-6"
          style={{ top: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="lg:hidden">
            <Link to="/admin">
              <Logo />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setCmd(true)}
            className="ml-auto hidden h-9 w-full max-w-[420px] items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-left text-[13.5px] text-ink-muted shadow-card hover:border-line-strong sm:flex lg:ml-0"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1">Search clients, orders, repairs, products</span>
            <Kbd>⌘K</Kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <Badge tone="violet" className="mr-1 hidden xl:inline-flex">
              Prototype · sample data
            </Badge>
            <button type="button" aria-label="Search" onClick={() => setCmd(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-2 hover:bg-surface-3 sm:hidden">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button type="button" aria-label="Toggle theme" onClick={cycle} className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-2 hover:bg-surface-3 hover:text-ink">
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <Notifications />
            <NewMenu />
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* mobile tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Console sections"
      >
        {primary.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn("relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", isActive ? "text-primary" : "text-ink-muted")}>
            <item.Icon className="h-5 w-5" />
            {item.label}
            {!!item.count && item.alert && <span className="absolute right-[calc(50%-18px)] top-2 h-2 w-2 rounded-full bg-bad ring-2 ring-surface" />}
          </NavLink>
        ))}
        <button type="button" onClick={() => setMore(true)} className="flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink-muted">
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      {more && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setMore(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] animate-slide-in">
            <Sidebar onNavigate={() => setMore(false)} />
            <button aria-label="Close" onClick={() => setMore(false)} className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-side-muted hover:text-side-ink" style={{ marginTop: "env(safe-area-inset-top, 0px)" }}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
    </div>
  );
}
