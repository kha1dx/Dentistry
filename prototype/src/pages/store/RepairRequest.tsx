import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Check, X } from "lucide-react";
import { BRAND } from "@/config/brand";
import { PRODUCTS, uni } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { useStore } from "@/store/useStore";
import { Button, Field, Textarea, Toggle } from "@/components/ui/primitives";
import { ProductArt } from "@/components/art/ProductArt";

const QUICK = ["Bur slips", "Noisy or vibrating", "Weak water spray", "Won't turn on", "Battery doesn't charge", "Dropped it"];

export default function RepairRequest() {
  const me = useStore((s) => s.clients.find((c) => c.id === s.meId)!);
  const submit = useStore((s) => s.submitRepair);
  const devices = PRODUCTS.filter((p) => p.serviceable);
  const [productId, setProductId] = useState("p04");
  const [issue, setIssue] = useState("");
  const [handover, setHandover] = useState("campus");
  const [day, setDay] = useState("Tomorrow, 12:00–14:00");
  const [loaner, setLoaner] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);
  const campus = uni(me.universityId).campus;

  if (done)
    return (
      <div className="mx-auto max-w-[680px] px-4 pt-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-good-soft text-good">
          <Check className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-display text-[48px] leading-none text-ink">Repair booked</h1>
        <p className="mt-3 text-[15.5px] text-ink-2">
          Your code is <span className="font-mono font-medium text-ink">{done}</span>. {BRAND.owner.name} will confirm the pickup on WhatsApp.
        </p>
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-line bg-surface p-5 text-left shadow-card">
          <div className="eyebrow mb-3">What happens next</div>
          <ol className="grid grid-cols-1 gap-3 text-[14px] text-ink-2">
            <li>1. Pickup {handover === "campus" ? `at ${campus}, ${day.toLowerCase()}` : "at the Dokki pickup point"}{loaner ? ", with a loaner for you" : ""}.</li>
            <li>2. The service partner diagnoses it within 1–2 days.</li>
            <li>3. You get the price on WhatsApp and approve it. Nothing is done before you say yes.</li>
            <li>4. Repaired, tested, and returned to you.</li>
          </ol>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={`/shop/track/${done}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[14.5px] font-medium text-primary-ink hover:bg-primary-hover">
            Track it <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/admin/repairs" className="inline-flex h-11 items-center rounded-xl border border-dashed border-violet/40 bg-violet-soft px-5 text-[13.5px] font-medium text-violet">
            Prototype: see it on the owner's repair board ↗
          </Link>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-10 sm:px-6">
      <div className="max-w-2xl">
        <div className="eyebrow">Repairs</div>
        <h1 className="mt-3 font-display text-[46px] leading-[0.98] text-ink sm:text-[58px]">Tell us what broke. We'll take it from here.</h1>
        <p className="mt-4 text-[15.5px] text-ink-2">We collect it, lend you one if you need it, deal with the service centre, and only repair it once you approve the price.</p>
      </div>

      <form
        className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]"
        onSubmit={(e) => {
          e.preventDefault();
          const id = submit({ productId, issue: issue || "Not described", handover: handover === "campus" ? `pickup at ${campus}, ${day}` : "drop-off at Dokki", loaner, photos: photos.length });
          setDone(id);
          window.scrollTo({ top: 0 });
        }}
      >
        <div className="grid grid-cols-1 gap-8">
          <div>
            <div className="mb-3 text-[15px] font-medium text-ink">Which device?</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {devices.map((d) => (
                <button key={d.id} type="button" onClick={() => setProductId(d.id)} className={cn("flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-colors", productId === d.id ? "border-primary bg-primary-soft/50 ring-1 ring-primary" : "border-line bg-surface hover:border-line-strong")}>
                  <ProductArt kind={d.art} category={d.category} size={64} />
                  <span className="text-[12.5px] font-medium leading-tight text-ink">{d.name.split(/[,(]/)[0]}</span>
                  <span className="text-[11.5px] text-ink-muted">{d.brand}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-[15px] font-medium text-ink">What's wrong?</div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => setIssue((v) => (v ? `${v}, ${q.toLowerCase()}` : q))} className="rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-ink-2 hover:border-primary hover:text-primary">
                  {q}
                </button>
              ))}
            </div>
            <Textarea id="issue" rows={3} placeholder="Describe it in your words. When did it start? Did it fall?" value={issue} onChange={(e) => setIssue(e.target.value)} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-line">
                  <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" aria-label="Remove photo" onClick={() => setPhotos((p) => p.filter((_, k) => k !== i))} className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex h-16 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line-strong px-4 text-[13px] text-ink-2 hover:border-primary hover:text-primary">
                <Camera className="h-4 w-4" /> Add photos or a short video
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []).slice(0, 4);
                    files.forEach((f) => {
                      const rd = new FileReader();
                      rd.onload = () => setPhotos((p) => [...p, String(rd.result)].slice(0, 4));
                      rd.readAsDataURL(f);
                    });
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <div className="mb-3 text-[15px] font-medium text-ink">How do we get it?</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["campus", "Pickup at your faculty", campus],
                ["dropoff", "Drop it off yourself", "Pickup point, Dokki · any day 12–8pm"],
              ].map(([id, t, s]) => (
                <button key={id} type="button" onClick={() => setHandover(id)} className={cn("rounded-2xl border p-4 text-left", handover === id ? "border-primary bg-primary-soft/50 ring-1 ring-primary" : "border-line bg-surface hover:border-line-strong")}>
                  <div className="text-[14.5px] font-medium text-ink">{t}</div>
                  <div className="text-[13px] text-ink-muted">{s}</div>
                </button>
              ))}
            </div>
            {handover === "campus" && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Today, 16:00–18:00", "Tomorrow, 12:00–14:00", "Tomorrow, 16:00–18:00", "Sunday, 12:00–14:00"].map((d) => (
                  <button key={d} type="button" onClick={() => setDay(d)} className={cn("rounded-full border px-3 py-1.5 text-[13px]", day === d ? "border-primary bg-primary-soft text-primary-soft-ink" : "border-line bg-surface text-ink-2")}>
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-pop">
            <label className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-[14.5px] font-medium text-ink">I need a loaner</span>
                <span className="text-[13px] text-ink-muted">Free while yours is away. Handpieces and micromotors.</span>
              </span>
              <Toggle checked={loaner} onChange={setLoaner} label="I need a loaner" />
            </label>
            <div className="mt-4 border-t border-line pt-4">
              <Field label="We'll contact you on">
                <div className="rounded-[10px] border border-line bg-surface-2 px-3 py-2 font-mono text-[13.5px] text-ink-2">{me.phone}</div>
              </Field>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-1.5 text-[13px] text-ink-2">
              <li>· Pickup and return: EGP 150, free under warranty</li>
              <li>· You approve the price before any work</li>
              <li>· 3-month warranty on the repair</li>
            </ul>
            <Button type="submit" variant="primary" size="lg" className="mt-5 w-full">
              Book the repair
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
