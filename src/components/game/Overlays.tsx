import { Gift, X } from "lucide-react";
import { useEffect } from "react";
import { clearPendingReward, completeIntro, getPendingReward, resolveEvent, type Life, type Reward } from "@/lib/game/store";
import { Btn, Sheet } from "./ui";

export function IntroSheet({ life }: { life: Life }) {
  return (
    <Sheet open={!life.introSeen} onClose={() => { window.__lovableEvents?.track?.("project.intro_completed", { method: "closed" }); completeIntro(); }} title="Kuidas ELU+ mängida?">
      <p className="mb-4 text-sm leading-relaxed">ELU+ on mäng, kus proovid rahaotsuseid ilma päris rahata. Sinu ülesanne: jõua oma eesmärgini nii, et raha jätkub igaks kuuks.</p>
      <div className="mb-4 space-y-3">
        {[
          ["1", "Vajuta pildil asjadele", "Pank, töö, kodu ja ostukott avavad valikud."],
          ["2", "Tee üks valik", "Näiteks pane iga kuu raha kõrvale."],
          ["3", "Liigu kuu edasi", "Näed, mis sinu rahaga juhtus."],
        ].map(([n, title, text]) => (
          <div key={n} className="flex gap-3 rounded-2xl bg-muted p-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">{n}</span>
            <div><p className="text-sm font-extrabold">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{text}</p></div>
          </div>
        ))}
      </div>
      <Btn onClick={() => { window.__lovableEvents?.track?.("project.intro_completed", { method: "button" }); completeIntro(); }}>Selge, alustan</Btn>
    </Sheet>
  );
}

export function EventSheet({ life }: { life: Life }) {
  const ev = life.pendingEvent;
  if (!ev) return null;
  return (
    <Sheet open onClose={() => {}} title={ev.good ? "Hea elusündmus" : "Ootamatu olukord"}>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-primary">{ev.kind === "career" ? "Juhuslik karjäärisündmus" : ev.kind === "money" ? "Juhuslik rahasündmus" : "Juhuslik elusündmus"}</p>
      <p className="font-display text-lg font-bold">{ev.title}</p>
      <p className="mb-4 text-sm text-muted-foreground">{ev.text} Vali, kuidas reageerid — valiku tagajärjed lähevad kohe mängus käima.</p>
      <div className="space-y-2">
        {ev.choices.map((c) => <Btn key={c.label} variant={ev.good ? "accent" : "outline"} onClick={() => resolveEvent(c)}>{c.label}</Btn>)}
      </div>
      {!ev.good && <p className="mt-3 text-xs text-muted-foreground">Halb õnn ei vähenda rahatarkuse punkte. Kui jääd miinusesse: korrigeeri eelarvet, vali odavam alternatiiv või kasuta sääste.</p>}
    </Sheet>
  );
}

export function Coupon({ r }: { r: Reward }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="bg-sun/35 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">ELU+ preemia</p>
        <p className="mt-0.5 font-display text-xl font-extrabold">{r.title}</p>
        <p className="text-sm font-semibold">{r.product}</p>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">Saavutus: {r.achievement}</p>
        <div className="mt-3 flex items-center gap-3">
          <svg width="52" height="52" viewBox="0 0 8 8" className="shrink-0 rounded-lg bg-muted p-1" aria-label="Dekoratiivne kood">
            {Array.from({ length: 64 }).map((_, i) => ((r.code.charCodeAt(i % r.code.length) * (i + 3)) % 3 === 0 ? <rect key={i} x={i % 8} y={Math.floor(i / 8)} width="1" height="1" fill="var(--foreground)" /> : null))}
          </svg>
          <div>
            <p className="font-mono text-xs font-semibold">{r.code}</p>
            <p className="mt-1.5 inline-block rounded-md bg-muted px-2 py-1 text-[10px] font-black text-muted-foreground">DEMO · EI KEHTI POES</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function RewardCelebration({ onView }: { onView: () => void }) {
  const r = getPendingReward();
  useEffect(() => {
    if (!r) return;
    const timer = window.setTimeout(clearPendingReward, 6000);
    return () => window.clearTimeout(timer);
  }, [r?.id]);
  if (!r) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto w-[calc(100%-2rem)] max-w-[408px]">
      <div role="status" className="animate-reward-in pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sun text-foreground">
          <Gift className="size-5" />
        </div>
        <button className="min-w-0 flex-1 text-left" onClick={() => { clearPendingReward(); onView(); }}>
          <span className="block text-xs font-bold text-primary">Uus preemia lisatud</span>
          <span className="block truncate text-sm font-extrabold">{r.title}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{r.product} · vaata preemiaid</span>
        </button>
        <button aria-label="Sulge preemiateade" onClick={clearPendingReward} className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
