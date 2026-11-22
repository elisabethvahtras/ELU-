import { createFileRoute } from "@tanstack/react-router";
import { Home, Sparkles, Target, Gift, Users, MonitorSmartphone, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CreateLife } from "@/components/game/CreateLife";
import { EventSheet, IntroSheet, RewardCelebration } from "@/components/game/Overlays";
import type { ObjKey } from "@/components/game/LifeScene";
import { FutureTab, GoalTab, LivesTab, MyLifeTab, RewardsTab } from "@/components/game/Tabs";
import { useLife } from "@/lib/game/store";
import { BrandMark } from "@/components/game/BrandMark";
import { cn } from "@/lib/utils";
import { GuidedDemo } from "@/components/game/GuidedDemo";
import qrCode from "@/assets/elu-qr.svg";
import { GameGuide, type GuideDestination } from "@/components/game/GameGuide";
import { GameHelpActions } from "@/components/game/GameHelpActions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELU+ — Millist elu tahad sina ehitada?" },
      { name: "description", content: "Rahaotsuste mäng noortele: proovi auto, kodu, laenu ja investeerimise otsuseid turvaliselt enne päriselu." },
      { property: "og:title", content: "ELU+ — Millist elu tahad sina ehitada?" },
      { property: "og:description", content: "Proovi suuri ja väikeseid rahaotsuseid turvaliselt — enne kui need päriselus teed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

const TABS = [
  { k: "life", l: "Minu elu", I: Home },
  { k: "future", l: "Tulevik", I: Sparkles },
  { k: "goal", l: "Eesmärk", I: Target },
  { k: "rewards", l: "Preemiad", I: Gift },
  { k: "lives", l: "Minu elud", I: Users },
] as const;

function Game() {
  const life = useLife();
  const [tab, setTab] = useState<(typeof TABS)[number]["k"]>("life");
  const [obj, setObj] = useState<ObjKey | "finances" | null>(null);
  const [creating, setCreating] = useState(false);
  const [monthReviewOpen, setMonthReviewOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const openDemo = () => { setPresenting(true); setDemoOpen(true); };
  const closeDemo = () => { setDemoOpen(false); setPresenting(false); };
  const openFromGuide = (destination: GuideDestination) => {
    setGuideOpen(false);
    setObj(null);
    if (destination === "future" || destination === "goal" || destination === "life") setTab(destination);
    else { setTab("life"); setObj(destination); }
  };
  if (demoOpen) return presenting ? <PresentationFrame onExit={closeDemo}><GuidedDemo onExit={closeDemo} /></PresentationFrame> : <GuidedDemo onExit={closeDemo} />;
  if (!life || creating)
    return (
      <div className="mx-auto max-w-[480px]">
        <GameGuide open={guideOpen} onClose={() => setGuideOpen(false)} onOpen={openFromGuide} hasLife={false} />
        <CreateLife headerActions={<GameHelpActions inverse onGuide={() => setGuideOpen(true)} onDemo={openDemo} />} onDemo={openDemo} onCancel={life ? () => setCreating(false) : undefined} key={creating ? "new" : "first"} />
        {creating && <AfterCreate onDone={() => { setCreating(false); setTab("life"); }} />}
      </div>
    );
  const shell = (
    <div className="app-shell game-width mx-auto bg-background">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-2">
        <div className="min-w-0">
          <BrandMark />
        </div>
        <div className="flex items-center gap-1.5">
          <GameHelpActions onGuide={() => { setObj(null); setGuideOpen(true); }} onDemo={openDemo} />
          <button onClick={() => setPresenting(true)} aria-label="Esitlusrežiim" title="Esitlusrežiim — mäng telefoniraamis" className="flex min-h-11 items-center justify-center rounded-lg px-2 text-muted-foreground transition hover:bg-secondary hover:text-primary"><MonitorSmartphone className="size-4" /></button>
        </div>
      </header>
      <main className={cn("min-h-0 px-4", tab === "life" ? "" : "pt-3")}>
        <div key={tab} className={tab === "life" ? "h-full min-h-0" : "tab-panel"}>
          {tab === "life" && <MyLifeTab life={life} obj={obj} setObj={setObj} onMonthOpenChange={setMonthReviewOpen} />}
          {tab === "future" && <FutureTab life={life} />}
          {tab === "goal" && <GoalTab life={life} onOpen={(next) => { setObj(next); setTab("life"); }} />}
          {tab === "rewards" && <RewardsTab life={life} />}
          {tab === "lives" && <LivesTab onNew={() => setCreating(true)} />}
        </div>
      </main>
      <nav className="z-30 grid w-full grid-cols-5 border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        {TABS.map(({ k, l, I }) => (
          <button key={k} onClick={() => setTab(k)} className={cn("flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold transition", tab === k ? "bg-secondary text-primary" : "text-muted-foreground")}>
            <I className="size-[18px]" />
            {l}
          </button>
        ))}
      </nav>
      <IntroSheet life={life} />
      <GameGuide open={guideOpen} onClose={() => setGuideOpen(false)} onOpen={openFromGuide} hasLife />
      {!monthReviewOpen && <EventSheet life={life} />}
      <RewardCelebration onView={() => setTab("rewards")} />
    </div>
  );
  if (!presenting) return shell;
  return <PresentationFrame onExit={() => setPresenting(false)}>{shell}</PresentationFrame>;
}

// Full-screen black stage with the game inside a phone cutout. Escape or "Sulge" exits.
function PresentationFrame({ onExit, children }: { onExit: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onExit(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);
  return (
    <div className="presentation-mode" role="dialog" aria-label="Esitlusrežiim">
      <aside className="presentation-qr" aria-label="Proovi mängu ise">
        <img src={qrCode} alt="QR-kood aadressile elupluss2.lovable.app" />
        <p>Proovi ise</p>
      </aside>
      <div className="phone-frame">
        <div className="phone-notch" aria-hidden="true" />
        {children}
      </div>
      <aside className="presentation-qr" aria-label="Proovi mängu ise">
        <img src={qrCode} alt="QR-kood aadressile elupluss2.lovable.app" />
        <p>Proovi ise</p>
      </aside>
      <button onClick={onExit} aria-label="Sulge esitlusrežiim" className="presentation-exit"><X className="size-4" />Sulge</button>
    </div>
  );
}

// Closes the create screen once a new life becomes active.
function AfterCreate({ onDone }: { onDone: () => void }) {
  const life = useLife();
  const [initial] = useState(life?.id);
  if (life && life.id !== initial) queueMicrotask(onDone);
  return null;
}
