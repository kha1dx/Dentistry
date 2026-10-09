import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/store/useStore";
import { IconButton } from "./primitives";

function useEscape(onClose: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
}

export function Drawer({ open, onClose, title, sub, children, footer, width = 560 }: { open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode; footer?: ReactNode; width?: number }) {
  useEscape(onClose, open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button aria-label="Close panel" className="absolute inset-0 bg-[rgba(8,18,16,0.38)] backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative flex h-full w-full animate-slide-in flex-col border-l border-line bg-surface shadow-pop"
        style={{ maxWidth: width, paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</div>
            {sub && <div className="mt-0.5 text-[13px] text-ink-muted">{sub}</div>}
          </div>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Modal({ open, onClose, title, children, footer, width = 520 }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; width?: number }) {
  useEscape(onClose, open);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button aria-label="Close dialog" className="absolute inset-0 bg-[rgba(8,18,16,0.42)] backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full animate-pop-in flex-col rounded-t-2xl border border-line bg-surface shadow-pop sm:rounded-2xl" style={{ maxWidth: width }}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="text-[16px] font-semibold text-ink">{title}</div>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-[18px] w-[18px]" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Toaster() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex max-w-md animate-fade-up items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink shadow-pop">
          {t.tone === "warn" ? <TriangleAlert className="h-4 w-4 shrink-0 text-warn" /> : t.tone === "info" ? <Info className="h-4 w-4 shrink-0 text-info" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-good" />}
          <span>{t.text}</span>
          <button className="ml-1 text-ink-muted hover:text-ink" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}

export function Popover({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  useEscape(onClose, open);
  if (!open) return null;
  return (
    <>
      <button aria-label="Close menu" className="fixed inset-0 z-40 cursor-default" onClick={onClose} />
      <div className={cn("absolute z-50 animate-pop-in rounded-xl border border-line bg-surface shadow-pop", className)}>{children}</div>
    </>
  );
}
