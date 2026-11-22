import { BadgeCheck, BriefcaseBusiness, Building2, CalendarDays, Car, Check, ChevronRight, CircleHelp, Coins, Download, Gift, History, House, Pencil, PiggyBank, Plane, Target, TrendingUp, Trophy, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { ANNUAL_INFLATION, eur, forecastCashFlow, grow, HOME_RATES, INVEST_RATES, partnerContribution, projectWealth, SCENARIO_LABEL, type Scenario } from "@/lib/game/finance";
import { allLivesCsv, downloadCsv, lifeCsv, safeFileName } from "@/lib/game/export";
import { formatLifeMonth } from "@/lib/game/dates";
import { age, aiPraise, assets, debts, deleteLife, fixedCosts, goalProgress, householdCosts, householdIncome, isLifeExpectancyValid, lifeNetWorth, loanPayments, monthlyLeft, monthsRemaining, renameLife, rentIncome, setActive, updateLife, useGame, type Life } from "@/lib/game/store";
import { Row } from "./Frame";
import { cn } from "@/lib/utils";
import { LifeScene, type ObjKey } from "./LifeScene";
import { Coupon } from "./Overlays";
import { BagPanel, BankPanel, CarPanel, HomePanel, HouseholdPanel, PhonePanel, WorkPanel } from "./Panels";
import { AiBubble, Avatar, Btn, Note, NumField, Sheet } from "./ui";
import { PropertyPanel } from "./PropertyPanel";
import { BankConnectionDemo } from "./BankConnectionDemo";
import { MonthTurn } from "./MonthTurn";
import { GoalEditor } from "./GoalEditor";
import { MoneyExplanation } from "./MoneyExplanation";
import { FutureCity, type FutureCitySection } from "./FutureCity";

const ACTIONS = [
  { k: "work", l: "Töö", I: BriefcaseBusiness },
  { k: "invest", l: "Investeerimine", I: TrendingUp },
  { k: "household", l: "Leibkond", I: Users },
] as const;

export function MyLifeTab({ life, obj, setObj, onMonthOpenChange }: { life: Life; obj: ObjKey | "finances" | null; setObj: (obj: ObjKey | "finances" | null) => void; onMonthOpenChange: (open: boolean) => void }) {
  const [detail, setDetail] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const praise = aiPraise(life);
  const close = () => setObj(null);
  const left = monthlyLeft(life);
  const investmentResult = life.investments - life.investedPrincipal;
  const GoalIcon = life.goal === "home" ? House : life.goal === "car" ? Car : life.goal === "trip" ? Plane : life.goal === "buffer" ? PiggyBank : Target;
  return (
    <div className="life-dashboard">
      <div className="life-profile grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0"><Avatar i={life.character} size={32} /></span>
          <div className="min-w-0"><p className="truncate font-display text-sm font-bold">{life.playerName}, {age(life)}</p><p className="flex items-center gap-1 text-[10px] text-muted-foreground"><CalendarDays className="size-3 shrink-0" /><span className="capitalize">{formatLifeMonth(life.startDate, life.months)}</span></p></div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Btn variant="ghost" onClick={() => setShowLog(true)} aria-label="Elu kulg" title="Elu kulg" className="size-11 min-h-11 w-11 rounded-lg p-0"><History className="size-4" /></Btn>
        </div>
      </div>

      <div className="life-bank"><BankConnectionDemo life={life} /></div>

      <Btn variant="ghost" onClick={() => setDetail(true)} aria-label="Ava rahaseisu detailid" className="life-finances min-h-0 justify-start gap-8 rounded-none border-y border-border bg-transparent px-0 py-2 text-left hover:bg-transparent">
        <span className="min-w-0"><span className="block text-[11px] font-semibold text-muted-foreground">Sinu raha</span><span className="block truncate font-display text-3xl font-extrabold text-primary">{eur(life.account + life.savings)}</span></span>
        <span className="flex shrink-0 items-center gap-2 text-right"><span><span className="block text-[11px] font-semibold text-muted-foreground">Kuus jääb</span><span className={`block text-lg font-bold ${left < 0 ? "text-destructive" : "text-success"}`}>{left >= 0 ? "+" : ""}{eur(left)}</span></span><ChevronRight className="size-4 text-primary" /></span>
      </Btn>

      <Btn variant="ghost" onClick={() => setObj(life.goal === "car" ? "car" : life.goal === "home" ? "home" : "bank")} aria-label={`Ava eesmärgi ${life.goalText} otsused`} className="life-goal min-h-11 justify-between rounded-lg bg-secondary px-3 py-1.5 text-xs">
        <span className="flex min-w-0 items-center gap-2"><GoalIcon className="size-5 shrink-0 text-primary" /><span className="min-w-0 text-left"><span className="block truncate">{life.goal === "home" && life.home ? "Oma kodu olemas" : life.goalText}</span>{!(life.goal === "home" && life.home) && <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">Kogutud {eur(life.savings + life.investments)} / {eur(life.goalTarget)}</span>}</span></span><span className="flex shrink-0 items-center gap-1 text-primary">{goalProgress(life) >= 1 ? "Saavutatud" : "Kogun"}<ChevronRight className="size-3" /></span>
      </Btn>
      <div className="life-map"><LifeScene life={life} onPick={setObj} compact /></div>

      <div className="life-actions grid grid-cols-4 gap-1.5">
        {ACTIONS.map(({ k, l, I }) => <Btn key={k} onClick={() => setObj(k)} variant="ghost" className="min-h-12 flex-col gap-1 rounded-lg px-1 py-1.5 text-[10px]"><I className="size-4 text-primary" /><span>{l}</span></Btn>)}
        <Btn variant="ghost" onClick={() => setPropertiesOpen(true)} aria-label="Kinnisvaraportfell" className="min-h-12 flex-col gap-1 rounded-lg px-1 py-1.5 text-[10px]"><Building2 className="size-4 text-primary" /><span>Kinnisvara</span></Btn>
      </div>
      <div className="life-month">
        <MonthTurn life={life} onOpenChange={onMonthOpenChange} />
      </div>
      <Sheet open={showLog} onClose={() => setShowLog(false)} title="Elu kulg">
        {praise && <AiBubble text={praise} />}
        <Btn variant="outline" onClick={() => downloadCsv(`${safeFileName(life.lifeName)}.csv`, lifeCsv(life))} className="rounded-lg"><Download className="size-4" />Laadi oma andmed tabelisse</Btn>
        {life.account < 0 && <Note tone="warn">Konto on miinuses. Vaata kulud rahaseisus üle.</Note>}
        <div className="divide-y divide-border">{life.log.map((entry, i) => <div key={i} className="py-3"><p className="text-[10px] font-bold capitalize text-muted-foreground">{formatLifeMonth(life.startDate, entry.m)}</p><p className="mt-1 text-sm">{entry.text}</p></div>)}</div>
      </Sheet>

      <CarPanel life={life} open={obj === "car"} onClose={close} />
      <HomePanel life={life} open={obj === "home"} onClose={close} />
      <WorkPanel life={life} open={obj === "work"} onClose={close} />
      <BankPanel life={life} open={obj === "bank" || obj === "invest"} onClose={close} investOnly={obj === "invest"} />
      <HouseholdPanel life={life} open={obj === "household"} onClose={close} />
      <PhonePanel life={life} open={obj === "phone"} onClose={close} />
      <BagPanel life={life} open={obj === "bag"} onClose={close} />
      <PropertyPanel life={life} open={propertiesOpen} onClose={() => setPropertiesOpen(false)} />

      <Sheet open={detail || obj === "finances"} onClose={() => { setDetail(false); if (obj === "finances") close(); }} title="Rahaseis">
        <Row l="Netopalk / tulu kuus" v={eur(householdIncome(life))} />
        <Row l="Kogu varaväärtus (koos kodu, auto ja investeeringutega)" v={eur(lifeNetWorth(life))} strong />
        <Row l="Kontol vabalt kasutatav raha" v={eur(life.account)} />
        <Row l="Puhvriks eraldatud raha" v={eur(life.savings)} />
        <MoneyExplanation />
        {(life.investments > 0 || life.investedPrincipal > 0) && (
          <>
            <Row l="Investeeringute hetkeväärtus" v={eur(life.investments)} />
            <Row l="Investeeringutesse sisse makstud" v={eur(life.investedPrincipal)} />
            <Row l="Investeeringute tulemus" v={`${investmentResult >= 0 ? "+" : ""}${eur(investmentResult)}`} />
          </>
        )}
        {assets(life) > 0 && <Row l="Varad (auto, kinnisvara)" v={eur(assets(life))} />}
        {debts(life) > 0 && <Row l="Laenude jääk" v={eur(debts(life))} />}
        <Row l="Netoväärtus" v={eur(lifeNetWorth(life))} strong />
        <div className="my-3 h-px bg-border" />
        <Row l="Püsikulud kuus" v={eur(fixedCosts(life))} />
        {partnerContribution(life.household) > 0 && <Row l="Partneri panus / kuu" v={eur(partnerContribution(life.household))} />}
        {life.properties.length > 0 && <Row l="Üüritulu kuus" v={eur(rentIncome(life))} />}
        {householdCosts(life) > 0 && <Row l="sh leibkond ja õpingud" v={eur(householdCosts(life))} />}
        <Row l="Laenumaksed kuus" v={eur(loanPayments(life))} />
        <Row l="Säästu- ja investeerimismaksed" v={eur(life.saveMonthly + life.investMonthly)} />
        {life.loans.map((x) => <Row key={x.id} l={`${x.label} (${x.monthsLeft} k)`} v={`${eur(x.balance)} · ${eur(x.payment)}/k`} />)}
        <p className="mb-2 mt-4 text-sm font-bold">Muuda elamiskulusid</p>
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Netopalk kuus" value={life.income} onChange={(n) => updateLife((current) => { current.income = n; })} />
          {([["housing", "Elukoht"], ["food", "Toit"], ["transport", "Transport"], ["phone", "Side"], ["leisure", "Vaba aeg"]] as const).map(([k, l]) => (
            <NumField key={k} label={l} value={Number((life.expenses[k] * life.priceLevel).toFixed(2))} onChange={(n) => updateLife((x) => { x.expenses[k] = n / x.priceLevel; })} />
          ))}
          <NumField label="Säästumakse / kuu" value={life.saveMonthly} onChange={(n) => updateLife((x) => { x.saveMonthly = n; })} />
          <NumField label="Investeerimine / kuu" value={life.investMonthly} onChange={(n) => updateLife((x) => { x.investMonthly = n; })} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Netoväärtus = raha + säästud + investeeringud + varade jääkväärtus – laenude jäägid.</p>
      </Sheet>
    </div>
  );
}

const compactForecastCurrency = new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 });
const forecastEur = (value: number) => Math.abs(value) >= 100000 ? compactForecastCurrency.format(value) : eur(value);

type Forecast = ReturnType<typeof projectWealth>;
const money = (f: Forecast) => f.cash + f.sav;
function AgeField({ value, min, onChange }: { value: number; min: number; onChange: (n: number) => void }) {
  const [raw, setRaw] = useState(String(value));
  useEffect(() => { setRaw(String(value)); }, [value]);
  const commit = (s: string) => {
    setRaw(s);
    const n = Number(s.replace(",", "."));
    if (Number.isInteger(n) && isLifeExpectancyValid(n, min)) onChange(n);
  };
  return (
    <label className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-input bg-card px-2.5 py-1.5">
      <span className="text-xs font-medium text-muted-foreground">Sihtvanus</span>
      <input aria-label="Tulevikuvaate sihtvanus" inputMode="numeric" value={raw} onChange={(e) => commit(e.target.value)} className="w-9 bg-transparent text-right text-sm font-bold tabular-nums outline-none" />
      <span className="text-xs text-muted-foreground">a</span>
    </label>
  );
}

export function FutureTab({ life }: { life: Life }) {
  const [sc, setSc] = useState<Scenario>("base");
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const [incomeKeepsUp, setIncomeKeepsUp] = useState(true);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [citySection, setCitySection] = useState<FutureCitySection | null>(null);
  const targetAge = Math.max(age(life), life.lifeExpectancy);
  const atAge = Math.min(targetAge, Math.max(age(life), selectedAge ?? targetAge));
  const hasMarketAssets = life.investments > 0 || life.investMonthly > 0 || !!life.home || life.properties.length > 0;
  const effectiveScenario = hasMarketAssets ? sc : "base";
  const r = INVEST_RATES[effectiveScenario];
  const forecastInput = { ...life, income: householdIncome(life), incomeGrowthRate: incomeKeepsUp ? 0.02 : 0, livingCosts: fixedCosts(life) - life.household.tuitionMonthly, tuition: life.household.tuitionMonthly, tuitionMonthsLeft: life.household.tuitionMonthsLeft, rentalIncome: rentIncome(life), carValue: life.car?.value ?? 0, homeValue: (life.home?.value ?? 0) + life.properties.reduce((sum, property) => sum + property.value, 0) };
  const forecast = (m: number) => projectWealth(forecastInput, m, effectiveScenario);
  const horizon = Math.max(0, (atAge - life.startAge) * 12 - life.months);
  const final = forecast(horizon);
  const flow = forecastCashFlow(forecastInput, horizon);
  const ageChoices = [...new Set([40, 65, 80, targetAge].filter((n) => n >= age(life) && n <= targetAge))];
  const futurePriceLevel = life.priceLevel * (1 + ANNUAL_INFLATION) ** (Math.floor((life.months + horizon) / 12) - Math.floor(life.months / 12));
  const homeValue = grow(life.home?.value ?? 0, HOME_RATES[effectiveScenario], horizon / 12);
  const cityTitles = { home: "Sinu elukoht", investments: "Sinu investeeringud", bank: "Sinu konto ja puhver" };
  return (
    <div className="tab-panel future-panel">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="font-display text-xl font-medium">Sinu raha tulevikus</h2>
        <Btn variant="ghost" onClick={() => setAssumptionsOpen(true)} aria-label="Ava prognoosi arvutused" title="Prognoosi arvutused" className="size-11 w-11 rounded-lg p-0"><CircleHelp className="size-5" /></Btn>
      </div>
      <section className="future-result shrink-0 border-y border-border py-3" aria-label={`Prognoos ${atAge}-aastaselt`}>
        <p className="text-base text-muted-foreground">{final.nw < 0 ? `Plaani puudujääk ${atAge}-aastaselt` : `Sinu vara ${atAge}-aastaselt`}</p>
        <p title={eur(final.nw)} className={cn("mt-1 font-display text-4xl font-bold tabular-nums sm:text-5xl", final.nw < 0 ? "text-destructive" : "text-primary")}>{forecastEur(final.nw)}</p>
        <p className="mt-2 text-sm text-muted-foreground">Tänases ostujõus {forecastEur(final.realWorth)}</p>
        <p className="mt-3 text-sm leading-snug text-muted-foreground">Prognoos, mitte lubadus. {incomeKeepsUp ? "Palk ja elamiskulud: eeldatavalt +2% aastas." : "Palk ei kasva; elamiskulud: +2% aastas."}</p>
        {final.nw < 0 && <p className="mt-2 text-sm leading-snug text-destructive">Arvutuslik rahapuudujääk, mitte päris võlg. Põhjused leiad arvutuste alt.</p>}
      </section>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-1">{ageChoices.map((n) => <Btn key={n} variant={atAge === n ? "primary" : "ghost"} onClick={() => setSelectedAge(n)} className="rounded-lg px-1 py-1 text-sm font-medium">{n} a</Btn>)}</div>
      </div>
      <div className="future-scene min-h-0 flex-1"><FutureCity life={life} age={atAge} cash={money(final)} investments={final.inv} assets={final.assets} shortfall={final.nw < 0} onPick={setCitySection} /></div>
      <Btn variant="outline" onClick={() => setAssumptionsOpen(true)} className="shrink-0 rounded-lg py-1 text-sm"><Coins className="size-4" />Arvutused ja eeldused</Btn>
      <Sheet open={citySection !== null} onClose={() => setCitySection(null)} title={citySection ? cityTitles[citySection] : "Tulevikuandmed"}>
        <div className="mb-4 grid grid-cols-4 gap-1" role="group" aria-label="Detailvaate vanus">{ageChoices.map((n) => <Btn key={n} variant={atAge === n ? "primary" : "ghost"} onClick={() => setSelectedAge(n)} className="rounded-lg px-1 text-xs">{n} a</Btn>)}</div>
        <p className="mb-3 text-sm font-semibold text-primary">Prognoos {atAge}-aastaselt · {formatLifeMonth(life.startDate, life.months + horizon)}</p>
        {citySection === "home" && <>
          <Row l="Elukoht" v={life.home ? life.home.kind === "house" ? "Oma maja" : "Oma korter" : life.housing === "parents" ? "Vanemate juures" : "Üürikodu"} />
          {life.home && <><Row l="Kodu prognoositud väärtus" v={eur(homeValue)} strong /><Row l="Kodu väärtus praegu" v={eur(life.home.value)} /></>}
          <Row l="Elukoha kulud sel ajal / kuu" v={eur(life.expenses.housing * futurePriceLevel)} />
          <Row l="Elukoha kulud praegu / kuu" v={eur(life.expenses.housing * life.priceLevel)} />
          <p className="mt-3 text-xs text-muted-foreground">Prognoosis säilib praegune elukoht. Tulevasi koduoste ega kolimist ei eeldata. Elukoha kulud ei sisalda laenumakseid.</p>
        </>}
        {citySection === "investments" && <>
          <Row l="Investeeringute prognoositud väärtus" v={eur(final.inv)} strong />
          <Row l="Investeeringute väärtus praegu" v={eur(life.investments)} />
          <Row l="Igakuine investeerimismakse" v={eur(life.investMonthly)} />
          <Row l="Stsenaarium" v={SCENARIO_LABEL[effectiveScenario]} />
          <Row l="Eeldatav aastane tootlus" v={`${Math.round(r * 100)}%`} />
          {life.investments === 0 && life.investMonthly === 0 && <Note>Praegu sul investeeringuid ega igakuist investeerimismakset pole.</Note>}
        </>}
        {citySection === "bank" && <>
          <Row l="Kontol vabalt kasutatav raha" v={eur(final.cash)} />
          <Row l="Puhvriks eraldatud raha" v={eur(final.sav)} />
          <Row l="Konto ja puhver kokku" v={eur(money(final))} strong />
          <Row l="Igakuine säästumakse" v={eur(life.saveMonthly)} />
          <MoneyExplanation />
          {final.cash < 0 && <Note tone="warn">Konto miinus on plaani arvutuslik rahapuudujääk, mitte tegelik laen ega võlg.</Note>}
        </>}
        <p className="my-4 text-xs leading-relaxed text-muted-foreground">Arvutuslik prognoos, mitte lubadus. {incomeKeepsUp ? "Palk ja elamiskulud kasvavad eeldatavalt 2% aastas." : "Palk püsib samana, elamiskulud kasvavad eeldatavalt 2% aastas."} Tegelik tulemus võib erineda.</p>
        <Btn onClick={() => setCitySection(null)}>Tagasi tulevikulinna</Btn>
      </Sheet>
      <Sheet open={assumptionsOpen} onClose={() => setAssumptionsOpen(false)} title="Prognoosi arvutused ja eeldused">
        <div className="space-y-4">
          <AgeField value={targetAge} min={age(life)} onChange={(n) => { setSelectedAge(null); updateLife((current) => { current.lifeExpectancy = n; }); }} />
          <section><h3 className="mb-2 text-base font-bold">Turustsenaarium</h3><div className="grid grid-cols-3 gap-1" role="group" aria-label="Stsenaarium">{(["bad", "base", "good"] as Scenario[]).map((v) => <Btn key={v} variant={effectiveScenario === v ? "primary" : "ghost"} disabled={!hasMarketAssets} onClick={() => setSc(v)} aria-label={`Vali ${SCENARIO_LABEL[v].toLowerCase()} stsenaarium`} className="rounded-lg px-1 text-sm">{SCENARIO_LABEL[v]}</Btn>)}</div><p className="mt-2 text-sm text-muted-foreground">{hasMarketAssets ? `${SCENARIO_LABEL[effectiveScenario]}: investeeringud ${Math.round(r * 100)}% aastas, kinnisvara ${effectiveScenario === "bad" ? "−2" : effectiveScenario === "good" ? "+4" : "+2"}% aastas.` : "Stsenaariumid mõjutavad investeeringuid ja kinnisvara — neid sul praegu pole."}</p></section>
          <section><h3 className="mb-2 text-sm font-bold">Kuidas sissetulek tulevikus muutub?</h3><div className="grid grid-cols-2 gap-2"><Btn variant={!incomeKeepsUp ? "primary" : "outline"} onClick={() => setIncomeKeepsUp(false)} className="rounded-lg text-xs">Tänane summa</Btn><Btn variant={incomeKeepsUp ? "primary" : "outline"} onClick={() => setIncomeKeepsUp(true)} className="rounded-lg text-xs">Kasvab koos hindadega</Btn></div><p className="mt-2 text-xs text-muted-foreground">{incomeKeepsUp ? "Eeldus: sinu ja partneri sissetulek kasvab 2% aastas, nagu elamiskulud. See pole lubadus ega muuda mängus praegust palka." : "Eeldus: sinu ja partneri sissetulek jääb tänasele tasemele, kuid elamiskulud kasvavad 2% aastas."}</p></section>
          <Row l="Sissetulek praegu / kuu" v={eur(householdIncome(life))} />
          <Row l="Üüritulu / kuu" v={eur(rentIncome(life))} />
          <Row l="Elamiskulud praegu / kuu" v={eur(forecastInput.livingCosts)} />
          <Row l={`Elamiskulud ${atAge}-aastaselt / kuu`} v={eur(flow.lastCosts)} />
          <Row l="Kontole jääb praegu / kuu" v={eur(monthlyLeft(life))} />
          <Row l={`Kontole jääks ${atAge}-aastaselt / kuu`} v={eur(flow.lastLeft)} />
          {flow.firstDeficitMonth !== null && <Note tone="warn">Väljaminekud ületaksid sissetulekut esimest korda {formatLifeMonth(life.startDate, life.months + flow.firstDeficitMonth)}. Varasem ülejääk võib vahet katta.</Note>}
          <section><h3 className="mb-2 text-sm font-bold">Millest lõppsumma koosneb?</h3><Row l="Konto ja puhver" v={eur(money(final))} /><Row l="Investeeringud" v={eur(final.inv)} /><Row l="Varad" v={eur(final.assets)} /><Row l="Laenujääk" v={eur(final.debt)} /></section>
          <section><h3 className="mb-2 text-sm font-bold">Vara muutus ajas</h3>{[1,5,10].map((years) => <Row key={years} l={`${years} aasta pärast`} v={eur(forecast(Math.min(years * 12, monthsRemaining(life))).nw)} />)}</section>
          <Row l="Praegused laenumaksed / kuu" v={eur(loanPayments(life))} />
          <Row l="Säästumakse / kuu" v={eur(life.saveMonthly)} />
          <Row l="Investeerimismakse / kuu" v={eur(life.investMonthly)} />
          <Note>Arvutus kasutab salvestatud kulusid. Laenud ja õppemaks lõppevad tähtajal. Säästud jäävad sinu varaks. Pensioni, tulevasi oste ega juhuslikke sündmusi ei eeldata. Sihtvanus ei ennusta eluiga.</Note>
          <div className="grid grid-cols-2 gap-2">{([["housing", "Elukoht"], ["food", "Toit"], ["transport", "Transport"], ["phone", "Side"], ["leisure", "Vaba aeg"]] as const).map(([key, label]) => <NumField key={key} label={label} value={Number((life.expenses[key] * life.priceLevel).toFixed(2))} onChange={(n) => updateLife((current) => { current.expenses[key] = n / current.priceLevel; })} />)}</div>
          {householdCosts(life) > 0 && <Row l="Lisaks leibkond ja õppemaks / kuu" v={eur(householdCosts(life))} />}
          {life.car && <Row l="Lisaks auto / kuu" v={eur(life.car.monthly * life.priceLevel)} />}
          {life.properties.length > 0 && <Row l="Lisaks üürikinnisvara kulud / kuu" v={eur(life.properties.reduce((sum, property) => sum + property.costs, 0) * life.priceLevel)} />}
          <Btn onClick={() => setAssumptionsOpen(false)}>Tagasi prognoosi juurde</Btn>
        </div>
      </Sheet>
    </div>
  );
}

export function GoalTab({ life, onOpen }: { life: Life; onOpen: (obj: ObjKey) => void }) {
  const [editing, setEditing] = useState(false);
  const p = goalProgress(life);
  const goalObject: ObjKey = life.goal === "car" ? "car" : life.goal === "home" ? "home" : "bank";
  return (
    <div className="tab-panel">
      <div className="flex shrink-0 items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-display text-xl font-extrabold leading-tight"><Target className="size-6 text-primary" />Eesmärk</h2><Btn variant="outline" onClick={() => setEditing(true)} className="min-h-9 w-auto rounded-lg px-3 py-1 text-xs"><Pencil className="size-4" />Muuda eesmärki</Btn></div>
      <p className="shrink-0 text-[11px] leading-snug text-muted-foreground">See on summa, mille poole mängus liigud. Pane raha kõrvale ja liigu kuid edasi, et sinna jõuda.</p>
      <Btn onClick={() => onOpen(goalObject)} className="block shrink-0 rounded-lg bg-hero p-4 text-left text-primary-foreground" aria-label={`Ava eesmärgi ${life.goalText} otsused`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-[11px] opacity-80">Minu suur eesmärk</p><p className="font-display text-2xl font-extrabold leading-tight">{life.goalText}</p></div>
          <Trophy className="mt-1 size-8 shrink-0 text-sun" />
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full rounded-full bg-sun transition-all" style={{ width: `${p * 100}%` }} />
        </div>
        <p className="mt-3 text-sm font-bold">{p >= 1 ? "Eesmärk saavutatud" : `Kogutud ${eur(life.savings + life.investments)} / ${eur(life.goalTarget)}`}</p>
        {p < 1 && <p className="mt-1 text-xs">Veel koguda {eur(Math.max(0, life.goalTarget - life.savings - life.investments))}</p>}
      </Btn>
      <div className="shrink-0"><NumField label="Eesmärgi summa" value={life.goalTarget} onChange={(n) => n > 0 && updateLife((l) => { l.goalTarget = n; })} /></div>
      {life.goal === "home" && life.home && <div className="shrink-0"><Note>„Saavutatud” tähendab, et sul on oma kodu. See ei tähenda, et kodulaen on tasutud. Kodu vahetamisel liigub eelmine kodu koos laenuga kinnisvaraportfelli; vara ei kao.</Note></div>}
      <div className="tab-scroll min-h-0">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold"><BadgeCheck className="size-5 text-primary" />Vabatahtlikud väljakutsed</p>
        {([
          ["Kogu ühe kuu puhver", life.savings + life.account >= fixedCosts(life) + loanPayments(life), "bank"],
          ["Võrdle kolme varianti enne suurt ostu", life.points >= 10, "car"],
          ["Läbi laenutaotluse õppetund", life.quizDone, "bank"],
          ["Alusta igakuist säästmist", life.saveMonthly > 0, "bank"],
        ] as [string, boolean, ObjKey][]).map(([label, done, obj]) => (
          <Btn variant="ghost" key={label} onClick={() => onOpen(obj)} className="mb-2 justify-between gap-2 rounded-lg bg-card p-2.5 text-left">
            <span className="flex min-w-0 items-center gap-2"><span className={`grid size-7 shrink-0 place-items-center rounded-full ${done ? "bg-success/10 text-success" : "bg-secondary text-primary"}`}>{done ? <Check className="size-4" /> : <CircleHelp className="size-4" />}</span><span className="text-xs font-semibold">{label}</span></span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Btn>
        ))}
      </div>
      <p className="shrink-0 text-[11px] leading-snug text-muted-foreground">Vajuta eesmärgile või väljakutsele, et minna otse sobivate otsuste juurde.</p>
      {editing && <GoalEditor life={life} onClose={() => setEditing(false)} />}
    </div>
  );
}

export function RewardsTab({ life }: { life: Life }) {
  return (
    <div className="tab-panel">
      <div className="shrink-0">
        <h2 className="flex items-center gap-2 font-display text-xl font-extrabold leading-tight"><Gift className="size-6 text-primary" />Preemiad</h2>
        <p className="text-[11px] leading-snug text-muted-foreground">Saavutused ja avatud demokupongid.</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <div className="rounded-xl bg-secondary px-3 py-1.5 text-center">
          <p className="font-display text-xl font-extrabold leading-none text-primary">{life.points}</p>
          <p className="mt-0.5 text-[9px] font-bold text-muted-foreground">punkti</p>
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">Punkte saad võrdlemisest, riskide hindamisest ja verstapostidest — mitte lihtsalt odavaima valiku eest.</p>
      </div>
      <div className="shrink-0 rounded-2xl bg-hero p-3.5 text-primary-foreground">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-[11px] opacity-75">Järgmise preemiani</p><p className="font-display text-lg font-extrabold leading-tight">{10 - (life.goodDecisions % 10)} head otsust</p></div>
          <p className="text-xs font-bold text-sun">{life.goodDecisions % 10}/10</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-foreground/15"><div className="h-full rounded-full bg-sun transition-all" style={{ width: `${(life.goodDecisions % 10) * 10}%` }} /></div>
        <p className="mt-1.5 text-[10px] leading-snug opacity-75">Iga 10 hea finantsotsuse järel saad uue preemia. Kokku oled teinud {life.goodDecisions}.</p>
      </div>
      <div className="tab-scroll min-h-0 space-y-3">
        {life.rewards.length === 0 && <Note>Kupongid avanevad automaatselt, kui jõuad verstapostini või teed 10 head finantsilist otsust.</Note>}
        {[...life.rewards].reverse().map((r) => <Coupon key={r.id} r={r} />)}
        <Note>Kupongid on illustratiivsed ega ole Coop Panga ega Coop Eesti kinnitatud pakkumised.</Note>
      </div>
    </div>
  );
}

export function LivesTab({ onNew }: { onNew: () => void }) {
  const { lives, activeId } = useGame();
  const [edit, setEdit] = useState<string | null>(null);
  const [name, setName] = useState("");
  return (
    <div className="tab-panel">
      <div className="shrink-0">
        <h2 className="font-display text-xl font-extrabold leading-tight">Minu elud</h2>
        <p className="text-[11px] leading-snug text-muted-foreground">Võrdle ainult enda erinevaid radu. Avalikku edetabelit pole.</p>
      </div>
      <div className="tab-scroll min-h-0 space-y-3">
        {lives.map((l) => (
          <div key={l.id} className={`rounded-2xl border-2 bg-card p-3 ${l.id === activeId ? "border-accent" : "border-transparent"}`}>
            <div className="flex items-center gap-3">
              <Avatar i={l.character} size={36} />
              <div className="min-w-0 flex-1">
                {edit === l.id ? (
                  <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onBlur={() => { if (name.trim()) renameLife(l.id, name.trim()); setEdit(null); }} className="w-full rounded-lg border-2 border-primary px-2 py-1 text-sm font-bold" />
                ) : (
                  <button className="truncate font-display text-sm font-bold" onClick={() => { setEdit(l.id); setName(l.lifeName); }}>{l.lifeName} ✎</button>
                )}
                <p className="text-[11px] text-muted-foreground">{age(l)}a · {l.goalText} · {l.rewards.length} saavutust</p>
              </div>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 text-xs">
              <Row l="Netoväärtus" v={eur(lifeNetWorth(l))} strong />
              <Row l="Laenud" v={eur(debts(l))} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Btn variant={l.id === activeId ? "ghost" : "primary"} disabled={l.id === activeId} onClick={() => setActive(l.id)} className="min-h-10 text-xs">{l.id === activeId ? "Aktiivne" : "Mängi seda elu"}</Btn>
              <Btn variant="ghost" onClick={() => { if (confirm("Kustuta see elu?")) deleteLife(l.id); }} className="min-h-10 text-xs">Kustuta</Btn>
            </div>
            <Btn variant="outline" onClick={() => downloadCsv(`${safeFileName(l.lifeName)}.csv`, lifeCsv(l))} className="mt-2 min-h-10 text-xs">Laadi andmed tabelisse (CSV)</Btn>
          </div>
        ))}
      </div>
      <div className="shrink-0 grid grid-cols-2 gap-2">
        <Btn variant="accent" onClick={onNew}>Alusta uut elu</Btn>
        <Btn variant="outline" onClick={() => downloadCsv("elu-plus-kõik-elud.csv", allLivesCsv(lives))} className="text-xs">Laadi kõik elud</Btn>
      </div>
    </div>
  );
}
