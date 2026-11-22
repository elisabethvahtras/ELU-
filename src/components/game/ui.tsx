import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Sheet({ open, onClose, title, children, full }: { open: boolean; onClose: () => void; title: string; children: ReactNode; full?: boolean | undefined }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn("animate-sheet-up w-full max-w-[480px] overflow-y-auto overscroll-contain rounded-t-3xl bg-card px-5 pb-6 pt-3 shadow-soft", full ? "h-[100dvh] rounded-none" : "max-h-[92dvh]")}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="sticky top-0 z-10 -mx-1 mb-4 flex items-start justify-between gap-3 bg-card px-1 pb-2 pt-1">
          <h2 className="font-display text-xl font-extrabold leading-tight">{title}</h2>
          <button aria-label="Sulge" onClick={onClose} className="shrink-0 rounded-full bg-muted p-2 text-muted-foreground transition hover:bg-secondary">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type BtnProps = { children: ReactNode; onClick?: () => void; variant?: "primary" | "accent" | "ghost" | "outline"; disabled?: boolean; className?: string; type?: "button" | "submit"; "aria-label"?: string; title?: string };
export function Btn({ children, onClick, variant = "primary", disabled, className, type = "button", "aria-label": ariaLabel, title }: BtnProps) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    accent: "bg-accent text-accent-foreground hover:opacity-90",
    ghost: "bg-muted text-foreground hover:bg-secondary",
    outline: "border border-primary/40 bg-card text-primary hover:bg-secondary",
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} title={title} className={cn("flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40", v, className)}>
      {children}
    </button>
  );
}

export function Choice({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: ReactNode; className?: string | undefined }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition active:scale-[0.99]", active ? "border-primary bg-secondary text-secondary-foreground ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/40", className)}>
      {children}
    </button>
  );
}

export function NumField({ label, value, onChange, suffix = "€", step = 1, min = 0, clamp }: { label: string; value: number; onChange: (n: number) => void; suffix?: string; step?: number; min?: number; clamp?: ((n: number) => number) | undefined }) {
  const [raw, setRaw] = useState(String(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setRaw(String(value));
  }, [value]);
  const bad = raw.trim() === "" || !Number.isFinite(Number(raw.replace(",", "."))) || Number(raw.replace(",", ".")) < min;
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      <div className={cn("flex items-center rounded-xl border bg-background px-3 transition focus-within:ring-2 focus-within:ring-primary/10", bad ? "border-destructive" : "border-input focus-within:border-primary")}>
        <input
          aria-label={label}
          inputMode="decimal"
          step={step}
          value={raw}
          onFocus={() => { focused.current = true; }}
          onBlur={() => {
            focused.current = false;
            const n = Number(raw.replace(",", "."));
            if (raw.trim() !== "" && Number.isFinite(n) && n >= min) {
              const accepted = clamp ? clamp(n) : n;
              onChange(accepted);
              setRaw(String(accepted));
            } else {
              setRaw(String(value));
            }
          }}
          onChange={(e) => {
            setRaw(e.target.value);
            const n = Number(e.target.value.replace(",", "."));
            if (e.target.value.trim() !== "" && Number.isFinite(n) && n >= min) {
              onChange(clamp ? clamp(n) : n);
            }
          }}
          className="w-full bg-transparent py-2.5 text-sm font-semibold outline-none"
        />
        <span className="text-xs text-muted-foreground">{suffix}</span>
      </div>
      {bad && <span className="text-xs text-destructive">{raw.trim() === "" || Number.isNaN(Number(raw.replace(",", "."))) ? "Sisesta korrektne arv." : `Väärtus peab olema vähemalt ${min}.`}</span>}
    </label>
  );
}

export function Note({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "warn" }) {
  return <p className={cn("rounded-xl px-3 py-2 text-xs leading-relaxed", tone === "warn" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>{children}</p>;
}

export function AiBubble({ text }: { text: string }) {
  return (
    <div className="animate-tab-in flex gap-2.5 rounded-xl border border-primary/10 bg-secondary/70 p-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">+</div>
      <div>
        <p className="text-[11px] font-bold text-primary">Plussik küsib</p>
        <p className="mt-0.5 text-sm leading-snug text-secondary-foreground">{text}</p>
      </div>
    </div>
  );
}

export function Avatar({ i, size = 56 }: { i: number; size?: number }) {
  const skins = ["oklch(0.82 0.06 60)", "oklch(0.62 0.08 50)", "oklch(0.9 0.04 70)", "oklch(0.48 0.07 45)"];
  const hair = ["oklch(0.3 0.04 40)", "oklch(0.2 0.02 40)", "oklch(0.75 0.12 80)", "oklch(0.45 0.12 30)"];
  const shirt = ["var(--accent)", "var(--primary)", "var(--success)", "var(--sun)"];
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden>
      <circle cx="30" cy="30" r="30" fill="var(--secondary)" />
      <path d="M10 60c2-14 10-19 20-19s18 5 20 19z" fill={shirt[i % 4]} />
      <circle cx="30" cy="26" r="11" fill={skins[i % 4]} />
      {i % 2 === 0 ? <path d="M18 25c0-9 6-13 12-13s12 4 12 13c-3-5-8-6-12-6s-9 1-12 6z" fill={hair[i % 4]} /> : <path d="M17 30c-1-12 6-18 13-18s14 6 13 18c-2-2-2-8-6-10-3 2-11 2-14 0-4 2-4 8-6 10z" fill={hair[i % 4]} />}
    </svg>
  );
}
