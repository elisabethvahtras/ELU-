import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, ChevronDown, Check, CircleHelp, GraduationCap, Handshake, Home, Milk, MousePointer2, Pause, Play, RotateCcw, ShoppingBag, Target, TrendingUp, Users, Wallet, Wheat, Coffee, X } from "lucide-react";
import { DEMO_DURATION_SECONDS, DEMO_STEPS, demoForecast, demoLife, demoStepAt } from "@/lib/game/demo";
import { CAREER_XP_PER_LEVEL, eur, shoppingTotals, projectWealth, ANNUAL_INFLATION } from "@/lib/game/finance";
import { defaultBasket } from "@/lib/game/basket";
import { BrandMark } from "./BrandMark";
import { LifeScene, type ObjKey } from "./LifeScene";
import { FutureCity, type FutureCitySection } from "./FutureCity";
import { RiskReview, Row } from "./Frame";
import { MoneyExplanation } from "./MoneyExplanation";
import { Btn, Note, NumField, Sheet } from "./ui";

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const sceneSteps: Record<ObjKey, number> = { car: 0, home: 0, work: 3, bank: 7, invest: 5, household: 4, phone: 0, bag: 2 };

export function GuidedDemo({ onExit }: { onExit: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [detail, setDetail] = useState<FutureCitySection | null>(null);
  const [basket, setBasket] = useState(defaultBasket);
  const [productsOpen, setProductsOpen] = useState(false);
  const finished = elapsed >= DEMO_DURATION_SECONDS;
  const index = demoStepAt(elapsed);
  const step = DEMO_STEPS[index] ?? DEMO_STEPS[0];
  const life = demoLife(index >= 8);
  const atAge = step.kind === "future40" ? 40 : 65;
  const future = demoForecast(atAge);
  const month = projectWealth({ ...demoLife(true), livingCosts: 1175, tuition: 0, tuitionMonthsLeft: 0, incomeGrowthRate: ANNUAL_INFLATION, carValue: 0, homeValue: 0 }, 1, "base");
  const totals = shoppingTotals(basket);

  useEffect(() => {
    if (paused || finished || detail) return;
    let previous = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      const delta = (now - previous) / 1000;
      previous = now;
      setElapsed((value) => Math.min(DEMO_DURATION_SECONDS, value + delta));
    }, 250);
    return () => window.clearInterval(timer);
  }, [paused, finished, detail]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onExit(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit]);
  const go = (next: number) => {
    const nextStep = DEMO_STEPS[next];
    if (nextStep) { setDetail(null); setProductsOpen(false); setElapsed(nextStep.start); }
  };
  const action = (label: string, next: number, icon = <ArrowRight className="size-5 shrink-0" />) => <Btn onClick={() => go(next)} className="demo-action relative mx-auto max-w-sm shrink-0 rounded-lg text-sm"><span>{label}</span>{icon}<MousePointer2 aria-hidden="true" className="demo-pointer absolute -right-2 bottom-0 size-6 text-accent" /></Btn>;
  const isFuture = step.kind === "future40" || step.kind === "future65";

  return <section className="guided-demo fixed inset-0 z-50 bg-background" data-phase={step.kind} role="dialog" aria-modal="true" aria-label="Juhendatud kaheminutiline demo">
    <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 sm:px-6">
      <div className="demo-brand flex min-w-0 items-center gap-3"><BrandMark /><span className="text-xs font-bold text-primary">DEMO</span></div>
      <Btn variant="outline" onClick={onExit} className="w-auto shrink-0 rounded-lg px-3 text-xs" aria-label="Lõpeta demo"><X className="size-4" />Lõpeta demo</Btn>
    </header>
    <main className="demo-main mx-auto flex w-full max-w-5xl min-h-0 flex-col gap-4 px-5 py-4 sm:px-8 sm:py-6">
      <div className="shrink-0" aria-live="polite">
        <p className="mb-2 text-xs font-semibold text-primary">{finished ? "Demo lõppenud" : `Samm ${index + 1} / ${DEMO_STEPS.length}`} · Liisa näidiselu</p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{step.title}</h1>
        <p className="demo-description mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{step.text}</p>
      </div>
      <div className="demo-stage flex min-h-0 flex-1 flex-col justify-center gap-4">
        {step.kind === "life" && <>
          <div className="grid shrink-0 grid-cols-3 gap-3 border-y border-border py-3">
            {[["Netopalk / kuu", "1600 €"], ["Kuus jääb", "425 €"], ["Puhver", "1500 €"]].map(([label, value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 whitespace-nowrap text-xl font-bold tabular-nums text-primary">{value}</p></div>)}
          </div>
          <div className="demo-life-scene"><LifeScene life={life} compact onPick={(object) => go(sceneSteps[object])} /></div>
          <div className="grid shrink-0 grid-cols-3 gap-2">{[{ label: "Töö", Icon: BriefcaseBusiness, next: 3 }, { label: "Investeerimine", Icon: TrendingUp, next: 5 }, { label: "Leibkond", Icon: Users, next: 4 }].map(({ label, Icon, next }) => <Btn key={label} variant="ghost" onClick={() => go(next)} className="flex-col gap-1 rounded-lg px-1 text-[10px]"><Icon className="size-5 text-primary" />{label}</Btn>)}</div>
          {action("Vaata rahaseisu", 1, <Wallet className="size-5" />)}
        </>}
        {step.kind === "budget" && <>
          <div className="demo-detail min-h-0 overflow-y-auto border-y border-border py-3">
            <Row l="Netosissetulek kuus" v={eur(life.income)} strong />
            {[["Elukoht", life.expenses.housing], ["Toit", life.expenses.food], ["Transport", life.expenses.transport], ["Side", life.expenses.phone], ["Vaba aeg", life.expenses.leisure]].map(([label, amount]) => <Row key={label} l={String(label)} v={eur(Number(amount))} />)}
            <div className="mt-2 border-t border-border pt-2"><Row l="Kuus jääb" v="425 €" strong /></div>
            <MoneyExplanation />
          </div>
          {action("Ava ostukott", 2, <ShoppingBag className="size-5" />)}
        </>}
        {step.kind === "basket" && <>
          <div className="demo-detail min-h-0 overflow-y-auto divide-y divide-border">
            {basket.items.map((item, position) => { const Icon = [Milk, Wheat, Coffee][position] ?? ShoppingBag; return <div key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)_64px] items-center gap-3 py-2"><Icon className="size-6 text-primary" /><div className="min-w-0"><p className="text-xs font-bold leading-snug">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{eur(item.price, 2)} / tk</p></div><NumField label="Kogus" suffix="tk" value={item.quantity} onChange={(quantity) => { setPaused(true); setBasket((value) => ({ ...value, items: value.items.map((entry) => entry.id === item.id ? { ...entry, quantity } : entry) })); }} /></div>; })}
            <div className="py-2"><Row l="Üks ostukorv" v={eur(totals.selected, 2)} strong /><p className="text-xs text-muted-foreground">Kontrollitud kliendikaardipakkumisteta kokkuhoid: 0 €. Oma pakkumise saab mängus ise sisestada.</p></div>
          </div>
          {action("Vaata töö ja karjääri valikuid", 3, <BriefcaseBusiness className="size-5" />)}
        </>}
        {step.kind === "career" && <>
          <div className="demo-detail min-h-0 overflow-y-auto border-y border-border py-4"><p className="text-xs font-bold text-primary">Karjääri tase {life.careerLevel}</p><h2 className="mt-2 text-2xl font-bold">{life.job}</h2><Row l="Netopalk" v={eur(life.income)} /><Row l="Kogemus järgmise tasemeni" v={`${life.careerXp} / ${CAREER_XP_PER_LEVEL} XP`} /><Note>Iga töökuu annab kogemust. Kursuste, lisatöö ja uue tööpakkumise mõju saad enne otsust võrrelda.</Note></div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-primary">{["Kursused", "Lisatöö", "Tööpakkumine"].map((label) => <p key={label} className="border-b border-border py-2">{label}</p>)}</div>
          {action("Vaata leibkonda ja õpinguid", 4, <GraduationCap className="size-5" />)}
        </>}
        {step.kind === "household" && <>
          <div className="demo-detail min-h-0 overflow-y-auto divide-y divide-border">{[{ Icon: GraduationCap, title: "Õpingud", text: "Kutseõpe või ülikool · õppemaksu sisestad ise" }, { Icon: Users, title: "Partner", text: "Määra partneri panus ja lisakulud, ka 0 €" }, { Icon: Home, title: "Lapsed", text: "Laste arv muudab igakuiseid elamiskulusid" }].map(({ Icon, title, text }) => <div key={title} className="flex items-start gap-3 py-3"><Icon className="mt-1 size-7 shrink-0 text-primary" /><div><h2 className="text-base font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></div>)}</div>
          {action("Ava investeerimine", 5, <TrendingUp className="size-5" />)}
        </>}
        {step.kind === "invest" && <>
          <div className="demo-detail min-h-0 overflow-y-auto space-y-3">
            <Btn variant="outline" onClick={() => { setProductsOpen((value) => !value); setPaused(true); }} className="justify-between rounded-lg text-left"><span>Laia hajutusega indeksifond</span><ChevronDown className="size-4 shrink-0" /></Btn>
            {productsOpen && <div className="divide-y divide-border text-sm">{["Rahaturufond", "Laia hajutusega indeksifond", "Üksikaktsiad"].map((label) => <p key={label} className="flex items-center gap-2 py-2">{label === "Laia hajutusega indeksifond" && <Check className="size-4 text-success" />}{label}</p>)}<p className="py-2 text-xs text-muted-foreground">Mängus on rohkem valikuid. Demo jätkub indeksifondi näitega.</p></div>}
            <div className="border-y border-border py-3 text-center"><p className="text-sm text-muted-foreground">Igakuine investeerimine</p><p className="my-3 text-4xl font-bold text-primary">100 €<span className="ml-2 text-sm text-muted-foreground">/ kuu</span></p><p className="text-sm text-muted-foreground">325 € jääb kuus vabaks</p></div>
          </div>
          {action("Vaata mõju ja riske", 6)}
        </>}
        {step.kind === "risk" && <>
          <div className="demo-detail min-h-0 overflow-y-auto"><RiskReview risks={["Investeeringu väärtus võib langeda.", "Tootlus ei ole garanteeritud.", "Igapäevaste kulude jaoks peab raha alles jääma."]} /><div className="mt-3"><Row l="Investeerin iga kuu" v="100 €" /><Row l="Kuus jääb vabaks" v="325 €" strong /><Row l="Puhver jääb alles" v="1500 €" /></div></div>
          {action("Alustan 100 € kuus investeerimist", 7, <Check className="size-5" />)}
        </>}
        {step.kind === "lend" && <>
          <div className="demo-detail min-h-0 overflow-y-auto space-y-3">
            <div className="border-y border-border py-3"><p className="text-sm text-muted-foreground">Sõber palub laenu</p><p className="mt-1 text-3xl font-bold text-primary">200 €</p></div>
            <div className="space-y-2">{["Kas ma saan selle raha kindlalt tagasi?", "Mis juhtub, kui sõber ei maksa?", "Kas mulle jääb endale raha küllalt alles?"].map((question) => <p key={question} className="flex items-start gap-2 text-sm font-semibold"><CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />{question}</p>)}</div>
            <div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg border border-border p-2"><p className="font-bold">Lepinguga</p><p className="mt-1 text-muted-foreground">Raha tuleb kindlalt tagasi valitud tähtajaks.</p></div><div className="rounded-lg border border-border p-2"><p className="font-bold">Ilma lepinguta</p><p className="mt-1 text-muted-foreground">Raha ei pruugi tagasi tulla või tuleb osaliselt.</p></div></div>
            <RiskReview risks={["Laenatud raha on sinu kontolt läinud.", "Ilma lepinguta ei pruugi sa raha tagasi saada.", "Laenatud raha tagasi küsida saab alati."]} />
          </div>
          {action("Liisa annab laenu lepinguga", 8, <Handshake className="size-5" />)}
        </>}
        {step.kind === "month" && <>
          <div className="demo-detail min-h-0 overflow-y-auto border-y border-border py-3"><h2 className="mb-2 flex items-center gap-2 text-base font-bold"><CalendarDays className="size-5 text-primary" />Sinu kuu tulemused</h2><Row l="Tulu" v="1600 €" /><Row l="Elamiskulud" v="1175 €" /><Row l="Investeeringutesse" v="100 €" /><Row l="Kontole juurde" v={eur(month.cash - life.account)} strong /><Row l="Kontol pärast kuud" v={eur(month.cash)} /><Row l="Investeeringute väärtus" v={eur(month.inv, 2)} /><Note>Näidiskuu ilma juhusliku sündmuseta. Päris mängus loe ka selle kuu sündmusi ja otsuste mõju.</Note></div>
          {action("Vaata tulevikku", 9)}
        </>}
        {isFuture && <>
          <div className="shrink-0 text-center"><p className="text-base text-muted-foreground">Investeeringud {atAge}-aastaselt</p><p className="demo-amount my-2 text-4xl font-bold tabular-nums text-primary sm:text-5xl">{eur(future.inv)}</p><p className="demo-invest-rate text-sm text-muted-foreground">100 € kuus · eeldatav tootlus 5% aastas</p></div>
          <div className="demo-age-choices grid shrink-0 grid-cols-2 gap-2 self-center"><Btn variant={atAge === 40 ? "primary" : "ghost"} onClick={() => go(9)} className="w-28 rounded-lg">40 a</Btn><Btn variant={atAge === 65 ? "primary" : "ghost"} onClick={() => go(10)} className="w-28 rounded-lg">65 a</Btn></div>
          <div className="future-scene min-h-0 flex-1"><FutureCity life={life} age={atAge} cash={future.cash + future.sav} investments={future.inv} assets={future.assets} shortfall={future.nw < 0} onPick={setDetail} /></div>
          <p className="shrink-0 text-center text-xs leading-snug text-muted-foreground">Prognoos, mitte lubadus. Palk ja kulud: eeldatavalt +2% aastas.</p>
        </>}
        {step.kind === "finish" && <>
          <Target className="mx-auto size-12 shrink-0 text-primary" /><div className="text-center"><p className="text-2xl font-bold">Sinu järgmine otsus?</p><p className="mt-3 text-sm text-muted-foreground">Oma eelarve → eesmärk → otsus → kuu tulemused → tulevik</p></div><Note>Demo kasutas väljamõeldud Liisa elu. Sinu mänguandmed ei muutunud ja päris pangaandmeid ei loetud.</Note><Btn onClick={onExit} className="mx-auto max-w-sm shrink-0 rounded-lg">{finished ? "Tagasi mängu" : "Lõpeta demo ja ava mäng"}</Btn>
        </>}
      </div>
    </main>
    <footer className="border-t border-border bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
      <progress aria-label="Demo edenemine" value={elapsed} max={DEMO_DURATION_SECONDS} className="demo-progress mb-3 block h-1.5 w-full" />
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3"><span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums text-muted-foreground">{clock(elapsed)} / 2:00</span><div className="flex items-center gap-2"><Btn variant="ghost" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Eelmine demosamm" title="Eelmine samm" className="size-11 w-11 rounded-lg p-0"><ArrowLeft className="size-5" /></Btn><Btn onClick={() => { if (finished) { setElapsed(0); setPaused(false); setBasket(defaultBasket()); } else setPaused((value) => !value); }} aria-label={finished ? "Alusta demo uuesti" : paused ? "Jätka demo" : "Peata demo"} title={finished ? "Alusta uuesti" : paused ? "Jätka demo" : "Küsimuste paus"} className="size-11 w-11 rounded-lg p-0">{finished ? <RotateCcw className="size-5" /> : paused ? <Play className="size-5" /> : <Pause className="size-5" />}</Btn><Btn variant="ghost" onClick={() => go(index + 1)} disabled={index === DEMO_STEPS.length - 1} aria-label="Järgmine demosamm" title="Järgmine samm" className="size-11 w-11 rounded-lg p-0"><ArrowRight className="size-5" /></Btn></div><span className="hidden whitespace-nowrap text-xs font-semibold text-primary sm:block">{finished ? "Valmis" : paused || detail ? "Pausil" : "Automaatne demo"}</span></div>
    </footer>
    <Sheet open={detail !== null} onClose={() => setDetail(null)} title={detail === "home" ? "Liisa elukoht" : detail === "bank" ? "Liisa konto ja puhver" : "Liisa investeeringud"}>
      <p className="mb-3 text-base text-muted-foreground">Prognoos {atAge}-aastaselt</p>
      {detail === "investments" && <><p className="text-3xl font-bold text-primary">{eur(future.inv)}</p><p className="mt-3 text-base">100 € kuus · eeldatav tootlus 5% aastas</p></>}
      {detail === "home" && <p className="text-lg">Üürikodu. Prognoos ei eelda uue kodu ostmist.</p>}
      {detail === "bank" && <div className="space-y-3 text-base"><p>Konto: <strong>{eur(future.cash)}</strong></p><p>Puhver: <strong>{eur(future.sav)}</strong></p></div>}
      <p className="my-4 text-sm text-muted-foreground">Arvutuslik prognoos, mitte garanteeritud tulemus. Need on näidiselu andmed.</p><Btn onClick={() => setDetail(null)}>Tagasi demo juurde</Btn>
    </Sheet>
  </section>;
}
