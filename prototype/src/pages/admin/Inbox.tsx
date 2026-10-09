import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck, FileText, ImageIcon, Paperclip, Send, ShoppingBag, Sparkles, Wrench, Zap } from "lucide-react";
import { NOW } from "@/config/brand";
import { YEAR_LABEL, uni } from "@/data/catalog";
import { orderTotal } from "@/data/seed";
import type { Channel, Conversation } from "@/data/types";
import { cn } from "@/lib/cn";
import { ago, duration, firstName, money, time, shortName } from "@/lib/format";
import { clientStats, isActiveRepair, isOpen, waitingSince } from "@/lib/metrics";
import { useClientMap, useStore } from "@/store/useStore";
import { Avatar, Badge, Button, Segmented } from "@/components/ui/primitives";
import { CHANNEL_META, ChannelIcon, Mono, OrderStagePill, RepairStagePill } from "@/components/ui/domain";

type Filter = "waiting" | "all" | Channel;


export default function InboxPage() {
  const [params, setParams] = useSearchParams();
  const conversations = useStore((s) => s.conversations);
  const clients = useClientMap();
  const [filter, setFilter] = useState<Filter>("waiting");
  const selectedId = params.get("c");

  const sorted = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        const wa = waitingSince(a);
        const wb = waitingSince(b);
        if (wa && !wb) return -1;
        if (wb && !wa) return 1;
        if (wa && wb) return wa.getTime() - wb.getTime();
        return b.messages[b.messages.length - 1].at.getTime() - a.messages[a.messages.length - 1].at.getTime();
      }),
    [conversations],
  );
  const list = sorted.filter((c) => (filter === "waiting" ? !!waitingSince(c) : filter === "all" ? true : c.channel === filter));
  const waitingCount = sorted.filter((c) => waitingSince(c)).length;
  const selected = conversations.find((c) => c.id === selectedId) ?? (typeof window !== "undefined" && window.innerWidth >= 1024 ? list[0] : undefined);

  const select = (id: string | null) => {
    const p = new URLSearchParams(params);
    if (id) p.set("c", id);
    else p.delete("c");
    setParams(p, { replace: true });
  };

  return (
    <div className="flex h-[calc(100dvh-64px-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-56px)] min-h-[520px] lg:h-[calc(100dvh-64px-24px-env(safe-area-inset-top,0px))]">
      {/* list */}
      <div className={cn("flex w-full shrink-0 flex-col border-r border-line bg-surface lg:w-[340px]", selected && "hidden lg:flex")}>
        <div className="border-b border-line px-4 pb-3 pt-4">
          <div className="flex items-baseline justify-between">
            <h1 className="text-lg font-semibold tracking-[-0.01em]">Inbox</h1>
            <span className="text-[12px] text-ink-muted">All channels in one place</span>
          </div>
          <Segmented
            className="mt-3 w-full"
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[
              { id: "waiting", label: "Waiting", count: waitingCount },
              { id: "all", label: "All" },
              { id: "whatsapp", label: "WhatsApp" },
              { id: "webchat", label: "Website" },
              { id: "instagram", label: "Instagram" },
              { id: "call", label: "Calls" },
              { id: "email", label: "Email" },
            ]}
          />
        </div>
        <ul className="flex-1 overflow-y-auto scroll-thin">
          {list.map((c) => {
            const client = c.clientId ? clients.get(c.clientId) : undefined;
            const name = client?.name ?? c.leadName ?? "Unknown";
            const real = c.messages.filter((m) => !m.ack);
            const last = real[real.length - 1] ?? c.messages[c.messages.length - 1];
            const w = waitingSince(c);
            const mins = w ? (NOW.getTime() - w.getTime()) / 60000 : 0;
            const active = selected?.id === c.id;
            return (
              <li key={c.id}>
                <button type="button" onClick={() => select(c.id)} className={cn("flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors", active ? "bg-primary-soft/60" : "hover:bg-surface-2")}>
                  <div className="relative">
                    <Avatar name={name} size={38} />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-surface ring-1 ring-line">
                      <ChannelIcon channel={c.channel} />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate text-[13.5px]", w ? "font-semibold text-ink" : "font-medium text-ink-2")}>{name}</span>
                      <span className="shrink-0 text-[11.5px] text-ink-muted">{ago(last.at)}</span>
                    </div>
                    <div className="truncate text-[12.5px] text-ink-muted">{c.topic}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className={cn("min-w-0 flex-1 truncate text-[12.5px]", w ? "text-ink-2" : "text-ink-muted")}>
                        {last.from === "me" ? "You: " : last.from === "auto" ? "Auto: " : ""}
                        {last.attachment ? `📎 ${last.text}` : last.text}
                      </span>
                      {w && (
                        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tnum", mins > 60 ? "bg-bad-soft text-bad" : mins > 15 ? "bg-warn-soft text-warn" : "bg-info-soft text-info")}>
                          {duration(NOW.getTime() - w.getTime())}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
          {!list.length && <li className="px-6 py-14 text-center text-ink-muted">Nobody is waiting. Nice.</li>}
        </ul>
      </div>

      {/* thread */}
      {selected ? <Thread key={selected.id} conv={selected} onBack={() => select(null)} /> : <div className="hidden flex-1 items-center justify-center text-ink-muted lg:flex">Pick a conversation</div>}
    </div>
  );
}

function Thread({ conv, onBack }: { conv: Conversation; onBack: () => void }) {
  const clients = useClientMap();
  const templates = useStore((s) => s.templates);
  const send = useStore((s) => s.sendMessage);
  const close = useStore((s) => s.closeConversation);
  const orders = useStore((s) => s.orders);
  const repairs = useStore((s) => s.repairs);
  const invoices = useStore((s) => s.invoices);
  const recordPayment = useStore((s) => s.recordPayment);
  const approve = useStore((s) => s.approveRepair);
  const toast = useStore((s) => s.toast);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const client = conv.clientId ? clients.get(conv.clientId) : undefined;
  const name = client?.name ?? conv.leadName ?? "Unknown";
  const stats = useMemo(() => clientStats(orders, invoices).get(conv.clientId ?? ""), [orders, invoices, conv.clientId]);
  const myOrders = orders.filter((o) => o.clientId === conv.clientId);
  const openOrders = myOrders.filter(isOpen);
  const myRepairs = repairs.filter((r) => r.clientId === conv.clientId && isActiveRepair(r));
  const linkedOrder = orders.find((o) => conv.links?.includes(o.id));
  const linkedRepair = repairs.find((r) => conv.links?.includes(r.id));
  const receipt = conv.messages[conv.messages.length - 1]?.attachment?.includes("instapay") && linkedOrder && linkedOrder.paid < orderTotal(linkedOrder);

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [conv.messages.length]);

  const suggestions = useMemo(() => {
    const out: string[] = [];
    const first = firstName(name);
    if (conv.id === "cv1") out.push(`Hi ${first}! Yes, the Strong 204 is EGP 5,450 with a 12-month warranty. I have 2 left. I can deliver to Kasr Al Ainy on Saturday at 2pm, shall I reserve one?`);
    if (conv.id === "cv2") out.push(`Hi ${first}! The Fixed prosth kit is ${money(4400)} and includes 2 sets of typodont teeth, burs, alginate and stone. Saturday delivery to Abbasia works. Want me to book it?`);
    if (conv.id === "cv3") out.push(`Yes ${first}, it's still under the 12-month warranty, so there's nothing to pay. I'll pick it up at 1pm and leave the loaner.`);
    if (conv.id === "cv5") out.push(`Updated to 49 kits, Mariam. Same group price. I'll deliver Sunday afternoon once the transfer is in. Thank you for organising it again!`);
    if (conv.id === "cv10") out.push(`Hi Lojain! Welcome. I've read your BUE 2nd-year list. 13 of the 15 items are in stock. Full quote coming in 10 minutes.`);
    if (receipt) out.push(`Received, thank you ${first}! Payment confirmed. See you at 4pm at Kasr Al Ainy gate.`);
    if (!out.length) out.push(`Thanks ${first}! I'll check and get back to you within the hour.`);
    return out;
  }, [conv.id, name, receipt]);

  const doSend = (t = text) => {
    if (!t.trim()) return;
    send(conv.id, t.trim());
    setText("");
  };

  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col bg-bg">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
          <button type="button" onClick={onBack} aria-label="Back to list" className="-ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-3 lg:hidden">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar name={name} size={36} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {client ? (
                <Link to={`/admin/clients/${client.id}`} className="truncate text-[14.5px] font-semibold text-ink hover:underline">
                  {name}
                </Link>
              ) : (
                <span className="truncate text-[14.5px] font-semibold text-ink">{name}</span>
              )}
              {!client && <Badge tone="info">New lead</Badge>}
              {client?.tags.slice(0, 2).map((t) => (
                <Badge key={t} tone={t === "Late payer" ? "bad" : t === "VIP" ? "violet" : "neutral"}>
                  {t}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
              <ChannelIcon channel={conv.channel} withLabel />
              <span>·</span>
              <span className="truncate">{client ? `${uni(client.universityId).short} · ${YEAR_LABEL[client.year]}` : conv.leadMeta}</span>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <Button size="sm" icon={<ShoppingBag className="h-3.5 w-3.5" />} onClick={() => toast("Order draft created from this chat. Items detected from the message", "info")}>
              Create order
            </Button>
            <Button size="sm" icon={<Wrench className="h-3.5 w-3.5" />} onClick={() => toast("Repair ticket created. Tracking link ready to send", "info")}>
              Repair
            </Button>
            <Button size="sm" variant="ghost" icon={<Check className="h-3.5 w-3.5" />} onClick={() => close(conv.id)}>
              Resolve
            </Button>
          </div>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 scroll-thin sm:px-8">
          <div className="mx-auto flex max-w-2xl flex-col gap-2.5">
            {conv.messages.map((m, i) => {
              const showDay = i === 0 || conv.messages[i - 1].at.toDateString() !== m.at.toDateString();
              const mine = m.from !== "client";
              return (
                <div key={m.id}>
                  {showDay && (
                    <div className="my-2 text-center text-[11.5px] text-ink-muted">
                      {m.at.toDateString() === NOW.toDateString() ? "Today" : m.at.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
                    </div>
                  )}
                  <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[82%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-card",
                        m.from === "client" && "rounded-bl-md border border-line bg-surface text-ink",
                        m.from === "me" && "rounded-br-md bg-primary text-primary-ink",
                        m.from === "auto" && "rounded-br-md border border-dashed border-violet/40 bg-violet-soft text-ink",
                      )}
                    >
                      {m.from === "auto" && (
                        <div className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-violet">
                          <Zap className="h-3 w-3" /> Sent automatically
                        </div>
                      )}
                      {m.attachment && (
                        <div className={cn("mb-1.5 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px]", m.from === "client" ? "bg-surface-3" : "bg-black/10")}>
                          {m.attachment.endsWith(".pdf") ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                          {m.attachment}
                        </div>
                      )}
                      {m.text}
                      <div className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10.5px]", m.from === "me" ? "text-primary-ink/70" : "text-ink-muted")}>
                        {time(m.at)}
                        {m.from === "me" && <CheckCheck className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {receipt && linkedOrder && (
              <div className="mx-auto mt-2 flex w-full max-w-md items-center gap-3 rounded-xl border border-good/30 bg-good-soft px-3.5 py-3">
                <div className="min-w-0 flex-1 text-[13px]">
                  <div className="font-medium text-ink">Payment screenshot for {linkedOrder.id}</div>
                  <div className="text-ink-2">Check InstaPay, then confirm. {money(orderTotal(linkedOrder) - linkedOrder.paid)} outstanding.</div>
                </div>
                <Button size="sm" variant="primary" onClick={() => recordPayment(linkedOrder.id, orderTotal(linkedOrder) - linkedOrder.paid, "InstaPay")}>
                  Confirm payment
                </Button>
              </div>
            )}
            {linkedRepair?.stage === "approval" && (
              <div className="mx-auto mt-2 flex w-full max-w-md items-center gap-3 rounded-xl border border-warn/30 bg-warn-soft px-3.5 py-3">
                <div className="min-w-0 flex-1 text-[13px]">
                  <div className="font-medium text-ink">
                    {linkedRepair.id} waiting for approval · {money(linkedRepair.price ?? 0)}
                  </div>
                  <div className="text-ink-2">If the client agrees by phone, approve on their behalf.</div>
                </div>
                <Button size="sm" variant="primary" onClick={() => approve(linkedRepair.id)}>
                  Approve
                </Button>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* composer */}
        <div className="border-t border-line bg-surface px-3 pb-3 pt-2.5 sm:px-5">
          <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => setText(s)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-[12.5px] font-medium text-primary-soft-ink hover:brightness-95">
                <Sparkles className="h-3.5 w-3.5" /> Suggested reply
              </button>
            ))}
            {templates.slice(0, 5).map((t) => (
              <button key={t.id} type="button" onClick={() => setText(t.body.replace("{first_name}", firstName(name)))} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-[12.5px] text-ink-2 hover:border-line-strong hover:text-ink">
                {t.name}
              </button>
            ))}
          </div>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              doSend();
            }}
          >
            <button type="button" aria-label="Attach" className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-3 hover:text-ink">
              <Paperclip className="h-[18px] w-[18px]" />
            </button>
            <textarea
              id="composer"
              rows={text.length > 80 ? 3 : 1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  doSend();
                }
              }}
              placeholder={`Reply on ${CHANNEL_META[conv.channel].label}…`}
              className="min-h-[38px] flex-1 resize-none rounded-xl border border-line bg-surface-2 px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
            <Button type="submit" variant="primary" className="mb-0.5" icon={<Send className="h-4 w-4" />} disabled={!text.trim()}>
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>

      {/* context */}
      <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-line bg-surface scroll-thin xl:block">
        {client ? (
          <div className="p-4">
            <div className="flex flex-col items-center text-center">
              <Avatar name={name} size={56} />
              <div className="mt-2 font-semibold text-ink">{name}</div>
              <Mono className="text-[12px]">{client.phone}</Mono>
              <div className="mt-1 text-[12.5px] text-ink-muted">
                {uni(client.universityId).name} · {YEAR_LABEL[client.year]}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
              <div>
                <div className="text-[11.5px] text-ink-muted">Orders</div>
                <div className="font-semibold text-ink tnum">{stats?.orders ?? 0}</div>
              </div>
              <div>
                <div className="text-[11.5px] text-ink-muted">Spent</div>
                <div className="font-semibold text-ink tnum">{((stats?.ltv ?? 0) / 1000).toFixed(1)}K</div>
              </div>
              <div>
                <div className="text-[11.5px] text-ink-muted">Owes</div>
                <div className={cn("font-semibold tnum", stats?.balance ? "text-bad" : "text-ink")}>{stats?.balance ? `${(stats.balance / 1000).toFixed(1)}K` : "0"}</div>
              </div>
            </div>
            {client.notes && <div className="mt-3 rounded-xl border border-warn/30 bg-warn-soft px-3 py-2 text-[12.5px] text-ink-2">{client.notes}</div>}
            <div className="mt-5">
              <div className="eyebrow mb-2">Open orders</div>
              {openOrders.length ? (
                <ul className="flex flex-col gap-1.5">
                  {openOrders.map((o) => (
                    <li key={o.id}>
                      <Link to={`/admin/orders?o=${o.id}`} className="block rounded-lg border border-line px-3 py-2 hover:border-line-strong">
                        <div className="flex items-center justify-between">
                          <Mono>{o.id}</Mono>
                          <OrderStagePill stage={o.stage} />
                        </div>
                        <div className="mt-1 truncate text-[12.5px] text-ink-2">{o.group ? `Group · ${o.group.students} students` : o.items.map((i) => shortName(i.name)).join(", ")}</div>
                        <div className="text-[12px] text-ink-muted tnum">{money(orderTotal(o))}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12.5px] text-ink-muted">None</p>
              )}
            </div>
            <div className="mt-4">
              <div className="eyebrow mb-2">Repairs</div>
              {myRepairs.length ? (
                <ul className="flex flex-col gap-1.5">
                  {myRepairs.map((r) => (
                    <li key={r.id}>
                      <Link to={`/admin/repairs?r=${r.id}`} className="block rounded-lg border border-line px-3 py-2 hover:border-line-strong">
                        <div className="flex items-center justify-between">
                          <Mono>{r.id}</Mono>
                          <RepairStagePill stage={r.stage} />
                        </div>
                        <div className="mt-1 truncate text-[12.5px] text-ink-2">{r.device}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12.5px] text-ink-muted">None</p>
              )}
            </div>
            <div className="mt-4">
              <div className="eyebrow mb-2">Last purchases</div>
              <ul className="flex flex-col gap-1 text-[12.5px]">
                {myOrders
                  .filter((o) => o.stage === "delivered")
                  .slice(-3)
                  .reverse()
                  .map((o) => (
                    <li key={o.id} className="flex justify-between gap-2 text-ink-2">
                      <span className="truncate">{shortName(o.items[0]?.name)}</span>
                      <span className="shrink-0 text-ink-muted">{ago(o.createdAt)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="eyebrow mb-2">New lead</div>
            <p className="text-[13px] text-ink-2">{conv.leadName} isn't a client yet. Replying fast matters most here: they're comparing suppliers.</p>
            <Button className="mt-3 w-full" variant="soft" onClick={() => toast("Client profile created and linked to this chat", "good")}>
              Save as client
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
