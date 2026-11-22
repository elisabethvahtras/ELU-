import { ChevronDown, Play, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createLife, GOAL_LABEL, isIncomeValid, isLifeExpectancyValid, isPlayerAgeValid, JOBS, MAX_PLAYER_AGE, MIN_PLAYER_AGE, type Goal, type Housing } from "@/lib/game/store";
import { Avatar, Btn, Choice, NumField, Sheet } from "./ui";
import { BankConnectionDemo } from "./BankConnectionDemo";
import { BrandMark } from "./BrandMark";

const HOUSING_LABEL: Record<Housing, string> = { parents: "vanemate juures", rent: "üürikorter", own: "oma kodu" };

export function CreateLife({ onCancel, headerActions, onDemo }: { onCancel?: (() => void) | undefined; headerActions?: ReactNode; onDemo?: (() => void) | undefined }) {
  const shellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    const updateHeight = () => {
      shellRef.current?.style.setProperty("--create-height", `${Math.floor(viewport?.height ?? window.innerHeight)}px`);
    };
    updateHeight();
    viewport?.addEventListener("resize", updateHeight);
    window.addEventListener("resize", updateHeight);
    window.addEventListener("pageshow", updateHeight);
    return () => {
      viewport?.removeEventListener("resize", updateHeight);
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("pageshow", updateHeight);
    };
  }, []);
  const [character, setCharacter] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(22);
  const [lifeExpectancy, setLifeExpectancy] = useState(100);
  const [mode, setMode] = useState<"own" | "job">("own");
  const [income, setIncome] = useState(1600);
  const [job, setJob] = useState("");
  const [housing, setHousing] = useState<Housing>("rent");
  const [savings, setSavings] = useState(1500);
  const [children, setChildren] = useState(0);
  const [goal, setGoal] = useState<Goal>("buffer");
  const [goalText, setGoalText] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showDetails, setShowDetails] = useState(false);
  const [showCosts, setShowCosts] = useState(false);
  const [rentCost, setRentCost] = useState<number | null>(null);
  const [food, setFood] = useState(320);
  const [transport, setTransport] = useState(70);
  const [leisure, setLeisure] = useState(140);
  const housingCost = rentCost ?? (housing === "parents" ? 120 : housing === "rent" ? 620 : 230);
  const costsValid = [housingCost, food, transport, leisure].every((v) => Number.isFinite(v) && v >= 0);
  const valid = Boolean(name.trim()) && Boolean(startDate) && isIncomeValid(income) && isPlayerAgeValid(age) && Number.isInteger(children) && children >= 0 && isLifeExpectancyValid(lifeExpectancy, age) && (goal !== "other" || Boolean(goalText.trim())) && costsValid;

  return (
    <>
      <div ref={shellRef} className="app-shell create-life mx-auto max-w-[480px] bg-background">
        <header className="relative overflow-hidden bg-hero px-5 pb-6 pt-5 text-primary-foreground">
          <div className="absolute -right-12 -top-16 size-44 rounded-full border-[28px] border-primary-foreground/5" />
          <div className="relative">
            <div className="flex items-center justify-between gap-2"><BrandMark inverse />{headerActions}</div>
            <h1 className="mt-4 font-display text-2xl font-extrabold leading-tight">Sinu elu. <br />Sinu valikud.</h1>
            <p className="mt-1 text-xs text-primary-foreground/80">Proovi rahaotsuseid turvaliselt, enne päriselu.</p>
            {onDemo && <button type="button" onClick={onDemo} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-foreground px-4 py-3 text-sm font-extrabold text-primary transition active:scale-[0.99]"><Play className="size-4" />Vaata 2-minutilist demot</button>}
          </div>
        </header>

        <form
          className="-mt-3 flex min-h-0 flex-col gap-3 overflow-hidden rounded-t-3xl bg-background px-5 pb-3 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) createLife({ character, playerName: name.trim(), age, lifeExpectancy, startDate, income, job: mode === "job" ? job : "", housing, savings, children, goal, goalText: goalText.trim(), expenses: { housing: housingCost, food, transport, leisure } });
          }}
        >
          <div className="create-fields flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain">
          <div className="shrink-0">
            <h2 className="font-display text-lg font-extrabold leading-tight">Alusta oma elu</h2>
            <p className="text-[11px] leading-snug text-muted-foreground">Kaks valikut ja oledki mängus.</p>
          </div>

          <div className="create-bank shrink-0"><BankConnectionDemo /></div>

          <label className="block shrink-0">
            <span className="mb-1 block text-sm font-bold">Mis on su nimi?</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="nt Mari"
              maxLength={30}
            />
          </label>

          <section className="shrink-0">
            <p className="mb-1 text-sm font-bold">Mille poole soovid püüelda?</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(GOAL_LABEL) as Goal[]).map((g) => (
                <Choice key={g} active={goal === g} onClick={() => setGoal(g)} className={g === "other" ? "col-span-2" : undefined}>
                  {g === "other" ? "Muu eesmärk" : GOAL_LABEL[g]}
                </Choice>
              ))}
            </div>
            {goal === "other" && (
              <input
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="Kirjuta oma eesmärk"
                className="mt-2 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                maxLength={60}
              />
            )}
          </section>

          <div className="shrink-0 rounded-xl border border-border bg-card/60 px-3 py-2">
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="flex w-full items-center justify-between gap-3 text-left text-sm font-bold"
              aria-expanded={showDetails}
            >
              <span>Kohanda algseisu <span className="font-normal text-muted-foreground">(valikuline)</span></span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{age} a · {income} €/kuu · {HOUSING_LABEL[housing]} · {savings} € sääste{children > 0 ? ` · ${children} last` : ""}</p>
          </div>

          <div className="shrink-0 rounded-xl border border-border bg-card/60 px-3 py-2">
            <button type="button" onClick={() => setShowCosts(true)} className="flex w-full items-center justify-between gap-3 text-left text-sm font-bold">
              <span>Sinu igakuised kulud</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{housing === "parents" ? "Kodu" : "Üür/kodu"} {housingCost} € · toit {food} € · kütus/transport {transport} € · hobid {leisure} €</p>
          </div>

          </div>

          <div className="create-submit flex shrink-0 flex-col gap-2">
          <Btn type="submit" variant="accent" disabled={!valid} className="py-3 text-base">Alusta mängu</Btn>
          {onCancel && <div className="shrink-0"><Btn variant="ghost" onClick={onCancel} className="min-h-9 py-1.5 text-xs">Tagasi</Btn></div>}
          <p className="flex shrink-0 items-start justify-center gap-1.5 text-center text-[10px] leading-snug text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3 shrink-0" />
            Mänguandmed jäävad sellesse seadmesse. Pangaandmeid ei küsita.
          </p>
          </div>
        </form>
      </div>

      <Sheet open={showDetails} onClose={() => setShowDetails(false)} title="Kohanda algseisu">
        <div className="space-y-4">
          <section>
            <p className="mb-2 text-xs font-bold">Vali tegelane</p>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <button type="button" key={i} aria-label={`Tegelane ${i + 1}`} onClick={() => setCharacter(i)} className={`rounded-full p-0.5 ring-2 transition ${character === i ? "ring-accent" : "ring-transparent"}`}>
                  <Avatar i={i} size={44} />
                </button>
              ))}
            </div>
          </section>
          <label className="block text-xs font-bold">Alustamise kuupäev
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-normal outline-none focus:border-primary" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Vanus" value={age} onChange={(n) => { setAge(n); if (n > lifeExpectancy) setLifeExpectancy(n); }} suffix="a" min={MIN_PLAYER_AGE} />
            <NumField label="Säästud" value={savings} onChange={setSavings} />
            <NumField label="Tulevikuvaate sihtvanus" value={lifeExpectancy} onChange={setLifeExpectancy} suffix="a" min={age} />
          </div>
          {!isPlayerAgeValid(age) && <p className="text-xs text-destructive">Vanus peab olema täisarv vahemikus {MIN_PLAYER_AGE}–{MAX_PLAYER_AGE}.</p>}
          {!isLifeExpectancyValid(lifeExpectancy, age) && <p className="text-xs text-destructive">Sihtvanus peab olema täisarv vahemikus {age}–{MAX_PLAYER_AGE}.</p>}
          <p className="text-xs text-muted-foreground">Sihtvanus määrab ainult selle, kui kaugele tulevikuprognoos ulatub. See ei ennusta sinu eluiga.</p>
          <section>
            <p className="mb-2 text-xs font-bold">Sissetulek</p>
            <div className="grid grid-cols-2 gap-2">
              <Choice active={mode === "own"} onClick={() => setMode("own")}>Sisestan ise</Choice>
              <Choice active={mode === "job"} onClick={() => setMode("job")}>Valin ameti</Choice>
            </div>
            {mode === "job" && (
              <div className="mt-2 grid gap-2">
                {JOBS.map((j) => (
                  <Choice key={j.name} active={job === j.name} onClick={() => { setJob(j.name); setIncome(j.pay); }}>
                    {j.name} <span className="font-normal text-muted-foreground">· {j.pay} €</span>
                  </Choice>
                ))}
              </div>
            )}
            <div className="mt-2">
              <NumField label="Netosissetulek kuus" value={income} onChange={setIncome} />
            </div>
            {!isIncomeValid(income) && <p className="mt-1 text-xs text-destructive">Sissetulek peab olema korrektne arv, vähemalt 0.</p>}
          </section>
          <section>
            <p className="mb-2 text-xs font-bold">Lapsed alguses</p>
            <NumField label="Laste arv" value={children} onChange={(n) => setChildren(Math.floor(n))} suffix="last" />
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Iga laps lisab mängus keskmiselt 280 € kuukulusid toidu, riiete ja huvitegevuse jaoks. Laste arv mõjutab rahavoogu, mitte karjääri ega investeeringute tootlust.</p>
          </section>
          <section>
            <p className="mb-2 text-xs font-bold">Praegune elukoht</p>
            <div className="grid grid-cols-3 gap-2">
              {([["parents", "Vanemate juures"], ["rent", "Üürikorter"], ["own", "Oma kodu"]] as const).map(([k, l]) => (
                <Choice key={k} active={housing === k} onClick={() => { setHousing(k); setRentCost(null); }} className="px-2 text-center text-xs">{l}</Choice>
              ))}
            </div>
          </section>
          <Btn onClick={() => setShowDetails(false)}>Kinnita algseis</Btn>
        </div>
      </Sheet>
      <Sheet open={showCosts} onClose={() => setShowCosts(false)} title="Kui palju sul kuus kulub?">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Kirjuta oma tavalised kuukulud. Mäng arvestab neid igal kuul.</p>
          <div className="grid grid-cols-2 gap-2">
            <NumField label={housing === "rent" ? "Üür ja kommunaalid" : housing === "parents" ? "Panus kodu kuludesse" : "Kodu kulud"} value={housingCost} onChange={setRentCost} />
            <NumField label="Toit" value={food} onChange={setFood} />
            <NumField label="Kütus ja transport" value={transport} onChange={setTransport} />
            <NumField label="Hobid ja vaba aeg" value={leisure} onChange={setLeisure} />
          </div>
          {!costsValid && <p className="text-xs text-destructive">Kulud peavad olema vähemalt 0 €.</p>}
          <Btn onClick={() => setShowCosts(false)}>Kinnita kulud</Btn>
        </div>
      </Sheet>
    </>
  );
}
