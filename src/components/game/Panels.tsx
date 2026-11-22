import { useEffect, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp, Minus } from "lucide-react";
import { careerActionAvailable, CAREER_XP_PER_LEVEL, MAX_CAREER_LEVEL, compareCar, compareHome, eur, friendLoanAmount, growMonthly, householdMonthlyCost, partnerContribution, investmentPerformance, investmentPlan, loanPayment, loanTotalRepay, monthlyFuelCost, studyDuration } from "@/lib/game/finance";
import { formatLifeMonth } from "@/lib/game/dates";
import { addLoan, addLog, askLoanBack, lendMoney, aiQuestion, careerTitle, gainCareer, householdCosts, monthlyLeft, pay, retainPreviousHome, updateLife, type Life } from "@/lib/game/store";
import { CompareView, DecisionFrame, Row } from "./Frame";
import { LoanQuiz } from "./LoanQuiz";
import { Btn, Choice, Note, NumField, Sheet } from "./ui";
import { CareerLevels } from "./CareerLevels";
import { MoneyExplanation } from "./MoneyExplanation";
export { BagPanel } from "./BagPanel";

type P = { life: Life; open: boolean; onClose: () => void };
const start = (l: Life) => l.account + l.savings;

// ---------------- CAR ----------------
export function CarPanel({ life, open, onClose }: P) {
  const [mode, setMode] = useState<"buy" | "loan" | "cheap" | "other" | "invest">("buy");
  const [price, setPrice] = useState(15000);
  const [down, setDown] = useState(3000);
  const [km, setKm] = useState(1000);
  const [lpk, setLpk] = useState(6.5);
  const [fuel, setFuel] = useState(1.7);
  const [ins, setIns] = useState(35);
  const [service, setService] = useState(25);
  const [repair, setRepair] = useState(20);
  const [parking, setParking] = useState(20);
  const [rate, setRate] = useState(7.5);
  const [months, setMonths] = useState(60);
  const [showAll, setShowAll] = useState(false);

  if (life.car) {
    return (
      <Sheet open={open} onClose={onClose} title="Sinu auto">
        <Row l="Hinnanguline väärtus" v={eur(life.car.value)} />
        <Row l="Kulud kuus" v={eur(life.car.monthly * life.priceLevel)} />
        <div className="mt-4">
          <Btn variant="outline" onClick={() => { updateLife((l) => { if (!l.car) return; l.account += l.car.value; const loan = l.loans.find((x) => x.label === "Autolaen"); if (loan) { l.account -= loan.balance; l.loans = l.loans.filter((x) => x !== loan); } l.car = null; l.expenses.transport = 65 / l.priceLevel; addLog(l, "Müüsid auto."); }); onClose(); }}>Müün auto</Btn>
        </div>
      </Sheet>
    );
  }
  const isLoan = mode === "loan";
  const p = mode === "cheap" ? Math.min(price, 6000) : price;
  const downPay = isLoan ? Math.min(down, p) : p;
  const fuelCost = monthlyFuelCost(km, lpk, fuel);
  const carMonthly = fuelCost + ins + service + repair + parking;
  const loanPay = isLoan ? loanPayment(p - downPay, rate / 100, months) : 0;
  const q = mode === "other" ? null : aiQuestion(life, { kind: "car", upfront: downPay, newMonthly: carMonthly + loanPay - 65 });
  const goal = life.goalTarget;
  const editor = (
    <div className="space-y-3">
      <p className="text-sm font-bold">Kuidas soovid liikuda?</p>
      <div className="grid grid-cols-2 gap-2">
        <Choice active={mode === "buy"} onClick={() => setMode("buy")}>Ostan auto</Choice>
        <Choice active={mode === "loan"} onClick={() => setMode("loan")}>Võtan autolaenu või liisingu</Choice>
        <Choice active={mode === "cheap"} onClick={() => setMode("cheap")}>Valin odavama auto</Choice>
        <Choice active={mode === "other"} onClick={() => setMode("other")}>Kasutan muud transporti</Choice>
        <Choice active={mode === "invest"} onClick={() => setMode("invest")}>Võrdlen investeerimisega</Choice>
      </div>
      {mode !== "other" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <NumField label={mode === "cheap" ? "Ostuhind (max 6000)" : "Ostuhind"} value={price} onChange={setPrice} />
            {isLoan && <NumField label="Sissemakse" value={down} onChange={setDown} />}
            <NumField label="Läbisõit kuus" value={km} onChange={setKm} suffix="km" />
            <NumField label="Kütusekulu" value={lpk} onChange={setLpk} suffix="l/100" step={0.1} />
            <NumField label="Kütusehind" value={fuel} onChange={setFuel} suffix="€/l" step={0.01} />
            <NumField label="Kindlustus / kuu" value={ins} onChange={setIns} />
            <NumField label="Hooldus / kuu" value={service} onChange={setService} />
            <NumField label="Remont / kuu" value={repair} onChange={setRepair} />
            <NumField label="Parkimine / kuu" value={parking} onChange={setParking} />
            {isLoan && <NumField label="Intress" value={rate} onChange={setRate} suffix="%" step={0.1} />}
            {isLoan && <NumField label="Tähtaeg" value={months} onChange={setMonths} suffix="kuud" />}
          </div>
          <Btn variant="ghost" onClick={() => setShowAll((s) => !s)}>Näita mulle KÕIKI autokulusid</Btn>
          {showAll && (
            <div className="rounded-2xl bg-muted p-3">
              <Row l="Kütus (km÷100 × l × €/l)" v={eur(fuelCost, 2)} />
              <Row l="Kindlustus + hooldus + remont + parkimine" v={eur(ins + service + repair + parking)} />
              {isLoan && <Row l="Laenumakse" v={eur(loanPay, 2)} />}
              {isLoan && <Row l="Kogutagasimakse" v={eur(loanTotalRepay(p - downPay, rate / 100, months))} />}
              <Row l="Kokku kuus" v={eur(carMonthly + loanPay, 2)} strong />
            </div>
          )}
        </>
      )}
      {mode === "other" && <Note>Ühistransport, ratas ja aeg-ajalt rendiauto: näidiskulu 65 € kuus.</Note>}
    </div>
  );
  return (
    <DecisionFrame
      title="Kui palju vabadus päriselt maksab?"
      open={open}
      onClose={onClose}
      life={life}
      question={q}
      editor={editor}
      fullPreview
      confirmLabel={mode === "other" ? "Jätkan muu transpordiga" : mode === "invest" ? `Investeerin ${eur(downPay)}` : isLoan ? "Võtan autolaenu" : "Ostan auto"}
      upfront={mode === "other" ? 0 : downPay}
      logText={mode === "other" ? "Otsustasid jätkata muu transpordiga." : mode === "invest" ? `Investeerisid auto asemel ${eur(downPay)}.` : `Ostsid auto hinnaga ${eur(p)}.`}
      preview={
        <CompareView
          chosen={mode === "other" ? "B" : mode === "invest" ? "C" : "A"}
          compute={(y, s) => compareCar(start(life), { price: p, downPayment: downPay, loanRate: isLoan ? rate / 100 : 0, loanMonths: isLoan ? months : 0, carMonthly, altMonthly: 65, depreciation: 0.15 }, y, s, goal)}
          assumptions="Auto väärtus langeb 15% aastas, muu transport 65 € kuus."
        />
      }
      onConfirm={(l) => {
        if (mode === "other") return;
        pay(l, downPay);
        if (mode === "invest") {
          l.investments += downPay;
          l.investedPrincipal += downPay;
          return;
        }
        if (isLoan && p - downPay > 0) addLoan(l, "Autolaen", p - downPay, rate / 100, months);
        l.car = { name: "Auto", price: p, value: p, monthly: carMonthly / l.priceLevel };
        l.expenses.transport = 0;
      }}
    />
  );
}

// ---------------- HOME ----------------
export function HomePanel({ life, open, onClose }: P) {
  const [mode, setMode] = useState<"rent" | "flat" | "house" | "renovate">("flat");
  const [price, setPrice] = useState(110000);
  const [down, setDown] = useState(11000);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(30);
  const [fee, setFee] = useState(400);
  const [utilities, setUtilities] = useState(180);
  const [reserve, setReserve] = useState(40);
  const [reno, setReno] = useState(5000);
  const [renoLoan, setRenoLoan] = useState(true);
  const [quiz, setQuiz] = useState(false);
  const isBuy = mode === "flat" || mode === "house";
  const needsQuiz = (isBuy || (mode === "renovate" && renoLoan)) && !life.quizDone;
  const pmt = loanPayment(price - down, rate / 100, years * 12);
  const renoPmt = loanPayment(reno, 0.09, 60);
  const q = isBuy ? aiQuestion(life, { kind: "home", upfront: down + fee, newMonthly: pmt + utilities + reserve - (life.home ? 0 : life.expenses.housing * life.priceLevel) }) : mode === "renovate" ? aiQuestion(life, { kind: "home", upfront: renoLoan ? 0 : reno, newMonthly: renoLoan ? renoPmt : 0 }) : null;
  const rent = life.housing === "rent" ? life.expenses.housing : 450;
  if (quiz) return <LoanQuiz open={open} onClose={() => setQuiz(false)} project={mode === "renovate" ? `Remondi hind ${eur(reno)}. Kui palju soovid laenata?` : `Kodu hind ${eur(price)}, laen ${eur(price - down)}.`} />;
  const editor = (
    <div className="space-y-3">
      <p className="text-sm font-bold">Millist kodu soovid?</p>
      <div className="grid grid-cols-2 gap-2">
        <Choice active={mode === "rent"} onClick={() => setMode("rent")}>Jätkan üürimist</Choice>
        <Choice active={mode === "flat"} onClick={() => { setMode("flat"); setPrice(110000); setDown(11000); }}>Ostan korteri</Choice>
        <Choice active={mode === "house"} onClick={() => { setMode("house"); setPrice(190000); setDown(19000); }}>Ostan maja</Choice>
        <Choice active={mode === "renovate"} onClick={() => setMode("renovate")}>Teen remonti</Choice>
      </div>
      {isBuy && (
        <div className="grid grid-cols-2 gap-2" key={mode}>
          <NumField label="Kodu hind" value={price} onChange={setPrice} />
          <NumField label="Sissemakse" value={down} onChange={setDown} />
          <NumField label="Kodulaenu intress" value={rate} onChange={setRate} suffix="%" step={0.1} />
          <NumField label="Tähtaeg" value={years} onChange={setYears} suffix="a" />
          <NumField label="Lepingutasud" value={fee} onChange={setFee} />
          <NumField label="Kommunaalid / kuu" value={utilities} onChange={setUtilities} />
          <NumField label="Remondireserv / kuu" value={reserve} onChange={setReserve} />
        </div>
      )}
      {isBuy && (
        <div className="rounded-2xl bg-muted p-3">
          <Row l="Laenu kuumakse" v={eur(pmt, 2)} />
          <Row l="Kogutagasimakse" v={eur(loanTotalRepay(price - down, rate / 100, years * 12, fee))} />
          <Row l="Kodu kulud kokku kuus" v={eur(pmt + utilities + reserve)} strong />
        </div>
      )}
      {mode === "renovate" && (
        <div className="space-y-2">
          <NumField label="Remondi hind" value={reno} onChange={setReno} />
          <div className="grid grid-cols-2 gap-2">
            <Choice active={renoLoan} onClick={() => setRenoLoan(true)}>Remondilaen (9%, 5 a)</Choice>
            <Choice active={!renoLoan} onClick={() => setRenoLoan(false)}>Maksan ise</Choice>
          </div>
          {renoLoan && <Row l="Kuumakse" v={eur(renoPmt, 2)} />}
        </div>
      )}
      {mode === "rent" && <Note>Jätkad praeguse eluasemega. Kulu kuus: {eur(life.expenses.housing * life.priceLevel)}.</Note>}
      {needsQuiz && <Note tone="warn">Enne mängus laenu saamist läbi lühike laenutaotluse õppimise etapp.</Note>}
      {isBuy && life.home && <Note>Eelmine kodu väärtusega {eur(life.home.value)} ja selle laen liiguvad kinnisvaraportfelli. Üüritulu ei lisandu automaatselt; tühja kodu kulud jäävad alles.</Note>}
    </div>
  );
  return (
    <DecisionFrame
      title="Üürin, ostan või kogun veel?"
      open={open}
      onClose={onClose}
      life={life}
      question={q}
      editor={editor}
      fullPreview={isBuy}
      confirmLabel={isBuy ? `Ostan ${mode === "flat" ? "korteri" : "maja"}` : mode === "renovate" ? "Teen remondi" : "Jätkan üürimist"}
      upfront={isBuy ? down + fee : mode === "renovate" && !renoLoan ? reno : 0}
      logText={isBuy ? `Ostsid ${mode === "flat" ? "korteri" : "maja"} hinnaga ${eur(price)}.` : mode === "renovate" ? "Tegid kodus remonti." : "Jätkasid üürimist."}
      previewLabel={needsQuiz ? "Alusta laenutaotluse õppimist" : undefined}
      canPreview={true}
      preview={
        isBuy ? (
          <><Row l="Kuu lõpus jääb pärast ostu" v={eur(monthlyLeft(life) - pmt - utilities - reserve + (life.home ? 0 : life.expenses.housing * life.priceLevel))} strong />{life.home && <Note>Eelmine kodu ja selle laen jäävad portfelli. Võrdlus all näitab ainult uue ostu alternatiive, mitte kogu olemasolevat vara.</Note>}<CompareView chosen="A" compute={(y, s) => compareHome(start(life), { price, downPayment: down, rate: rate / 100, months: years * 12, ownMonthly: utilities + reserve, rent }, y, s, life.goalTarget)} assumptions="Kinnisvara väärtus: −2% / +2% / +4% aastas." /></>
        ) : (
          <div className="rounded-2xl bg-muted p-3">
            {mode === "renovate" ? <><Row l="Kulu kohe" v={eur(renoLoan ? 0 : reno)} /><Row l="Uus kuumakse" v={eur(renoLoan ? renoPmt : 0, 2)} /></> : <Row l="Muutus" v="Kõik jääb samaks" />}
            <Row l="Kuu lõpus jääb pärast" v={eur(monthlyLeft(life) - (mode === "renovate" && renoLoan ? renoPmt : 0))} strong />
          </div>
        )
      }
      onConfirm={(l) => {
        if (isBuy) {
          retainPreviousHome(l);
          pay(l, down + fee);
          addLoan(l, "Kodulaen", price - down, rate / 100, years * 12);
          l.home = { kind: mode, value: price };
          l.housing = "own";
          l.expenses.housing = (utilities + reserve) / l.priceLevel;
        } else if (mode === "renovate") {
          if (renoLoan) addLoan(l, "Remondilaen", reno, 0.09, 60);
          else pay(l, reno);
          l.renovated = true;
          if (l.home) l.home.value += reno * 0.6;
        }
      }}
      {...(needsQuiz ? { editor: <>{editor}<Btn variant="accent" onClick={() => setQuiz(true)}>Alusta laenutaotluse õppimist</Btn></>, canPreview: false } : {})}
    />
  );
}

// ---------------- WORK ----------------
const WORK = [
  { k: "stay", l: "Keskendun praegusele tööle", action: "Keskendun praegusele tööle", cost: 0, time: "—", gain: "+5 kogemuspunkti", description: "Teed oma tööd hästi ja kogud kogemust ilma lisakuluta. See on aeglane, aga kindel arengutee." },
  { k: "apply", l: "Kandideerin kõrgema palgaga tööle", action: "Saadan tööavaldused", cost: 0, time: "~10 h", gain: "+250 € kuus ja +20 kogemust, kui õnnestub", description: "Saadad avaldused ja käid vestlustel. Kõrgem tase ja rohkem oskusi tõstavad õnnestumise võimalust, aga pakkumine pole kindel." },
  { k: "course", l: "Läbin erialase kursuse", action: "Alustan kursust", cost: 300, time: "40 h", gain: "+1 oskus ja +30 kogemuspunkti", description: "Õpid 40 tundi oma eriala uusi teadmisi. Kursus maksab 300 €, annab püsiva oskuse ja 30 kogemuspunkti ning parandab hilisemaid töö- ja palgatõusuvõimalusi." },
  { k: "raise", l: "Küsin palgatõusu", action: "Küsin palgatõusu", cost: 0, time: "1 vestlus", gain: "+100 € kuus ja +15 kogemust, kui õnnestub", description: "Valmistud vestluseks ja esitad juhile oma tulemused. Kogemus ja oskused aitavad, aga tööandja võib ka keelduda." },
  { k: "side", l: "Võtan lisatöö", action: "Alustan lisatööd", cost: 0, time: "+10 h nädalas", gain: "+200 € kuus ja +10 kogemust", description: "Töötat nädalas kümme tundi lisaks. Palk ja kogemus kasvavad, kuid vähem vaba aega tähendab ka väiksemaid vaba aja kulusid." },
] as const;

function CareerSummary({ life }: { life: Life }) {
  return (
    <section className="rounded-2xl bg-hero p-4 text-primary-foreground" aria-label="Sinu karjääri ülevaade">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">Karjääri tase {life.careerLevel}</p>
          <p className="mt-0.5 font-display text-2xl font-extrabold">{careerTitle(life)}</p>
          <p className="mt-1 text-xs opacity-75">{life.job || "Praegune töökoht"}</p>
        </div>
        <div className="text-right"><p className="text-[10px] opacity-70">Netopalk</p><p className="font-display text-lg font-extrabold">{eur(life.income)}</p></div>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-primary-foreground/15" role="progressbar" aria-label="Kogemus järgmise karjäärastmeni" aria-valuemin={0} aria-valuemax={CAREER_XP_PER_LEVEL} aria-valuenow={life.careerXp}>
        <div className="h-full rounded-full bg-sun transition-all" style={{ width: `${Math.min(100, life.careerXp)}%` }} />
      </div>
      <div className="mt-2 flex justify-between gap-2 text-[11px]"><span>{life.careerXp}/{CAREER_XP_PER_LEVEL} kogemuspunkti</span><span className="font-bold text-sun">{life.careerLevel >= MAX_CAREER_LEVEL ? "Kõrgeim karjääritase" : "Järgmine tase: palk +7%"}</span></div>
      <p className="mt-2 text-[11px] leading-relaxed opacity-75">Iga töökuu annab 8 punkti. Kursused, projektid ja töövahetus aitavad kiiremini edasi.</p>
    </section>
  );
}

export function WorkPanel({ life, open, onClose }: P) {
  const [k, setK] = useState<(typeof WORK)[number]["k"]>("course");
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const w = WORK.find((x) => x.k === k);
  if (!w) return null;
  const levelBonus = (life.careerLevel - 1) * 0.05;
  const chance = k === "apply" ? Math.min(0.9, 0.4 + life.skills * 0.15 + levelBonus) : k === "raise" ? Math.min(0.85, 0.3 + life.skills * 0.1 + levelBonus) : 1;
  const q = k === "course" && life.account + life.savings < 600 ? "Kas maksaksid 300 € kursuse eest, kui see annaks parema võimaluse tööd vahetada, kuid palgatõus pole kindel?" : null;
  return (
    <>
      <DecisionFrame
        title="Kuhu karjääris edasi?"
        open={open && !result && !levelsOpen}
        onClose={onClose}
        life={life}
        question={q}
        upfront={w.cost}
        canPreview={careerActionAvailable(life.months, life.lastCareerActionMonth)}
        confirmLabel={w.action}
        keepOpenOnConfirm
        logText={`Karjäär: ${w.l}.`}
        editor={
          <div className="space-y-3">
            <CareerSummary life={life} />
            <Btn variant="outline" onClick={() => setLevelsOpen(true)}>Tasemed ja minu praegune tase</Btn>
            {life.careerLevel < MAX_CAREER_LEVEL && <Note>Järgmise taseme jaoks kogu veel {CAREER_XP_PER_LEVEL - life.careerXp} kogemuspunkti. Iga tase nõuab 100 punkti.</Note>}
            {!careerActionAvailable(life.months, life.lastCareerActionMonth) && <Note>Selle kuu karjäärivalik on tehtud. Järgmise saad teha pärast kuu edasi liikumist.</Note>}
            <div className="grid gap-2">
              {WORK.map((x) => (
                <Choice key={x.k} active={k === x.k} onClick={() => setK(x.k)}>
                  {x.l}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">Hind {eur(x.cost)} · aeg {x.time} · {x.gain}</span>
                  {k === x.k && <span className="mt-1.5 block text-xs font-normal leading-relaxed text-secondary-foreground">{x.description}</span>}
                </Choice>
              ))}
            </div>
          </div>
        }
        preview={
          <div className="rounded-2xl bg-muted p-3">
            <Row l="Praegune karjääriaste" v={`${life.careerLevel} · ${careerTitle(life)}`} />
            <Row l="Kulu kohe" v={eur(w.cost)} />
            <Row l="Ajakulu" v={w.time} />
            <Row l="Võimalik tulemus" v={w.gain} />
            <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">{w.description}</p>
            {chance < 1 && <Row l="Õnnestumise tõenäosus (taseme ja oskuste järgi)" v={`${Math.round(chance * 100)}%`} strong />}
            {chance < 1 && <p className="mt-2 text-xs text-muted-foreground">Palgatõus ega uus tööpole garanteeritud. Ka ebaõnnestumine annab vähe kogemust.</p>}
          </div>
        }
        onConfirm={(l) => {
          if (!careerActionAvailable(l.months, l.lastCareerActionMonth)) return;
          l.lastCareerActionMonth = l.months;
          pay(l, w.cost);
          if (k === "course") { l.skills += 1; gainCareer(l, 30); setResult("Kursus läbitud: +1 oskus ja +30 kogemuspunkti."); }
          else if (k === "side") { l.income += 200; l.expenses.leisure = Math.max(0, l.expenses.leisure - 40); gainCareer(l, 10); setResult("Lisatöö algas: +200 € kuus ja +10 kogemuspunkti."); }
          else if (k === "stay") { gainCareer(l, 5); setResult("Keskendusid praegusele tööle: +5 kogemuspunkti."); }
          else {
            const ok = Math.random() < chance;
            const inc = k === "apply" ? 250 : 100;
            if (ok) { l.income += inc; gainCareer(l, k === "apply" ? 20 : 15); setResult(`Õnnestus! Netopalk kasvas ${inc} € ja karjäärikogemus kasvas.`); }
            else { l.skills += k === "apply" ? 1 : 0; gainCareer(l, 5); setResult(k === "apply" ? "Seekord pakkumist ei tulnud, kuid vestluskogemus andis oskuse ja +5 kogemuspunkti." : "Seekord palgatõusu ei tulnud. Said +5 kogemuspunkti — proovi pärast kursust või kõrgemat taset uuesti."); }
          }
        }}
      />
      {open && levelsOpen && <CareerLevels life={life} onClose={() => setLevelsOpen(false)} />}
      <Sheet open={open && !!result} onClose={() => { setResult(null); onClose(); }} title="Tulemus">
        <p className="mb-4 text-sm">{result}</p>
        <Btn onClick={() => { setResult(null); onClose(); }}>Tagasi minu ellu</Btn>
      </Sheet>
    </>
  );
}

// ---------------- BANK ----------------
type RiskKey = "low" | "medium" | "high";
const RISK_PROFILES: Record<RiskKey, { label: string; rate: number; drop: string; description: string }> = {
  low: { label: "Madal risk", rate: 0.02, drop: "5–10%", description: "Väiksemad kõikumised ja madalam oodatav tootlus. Ei ole siiski täiesti riskivaba." },
  medium: { label: "Keskmine risk", rate: 0.05, drop: "15–25%", description: "Hajutatud investeering, mille väärtus võib aeg-ajalt selgelt langeda. Sobib mitmeks aastaks." },
  high: { label: "Kõrge risk", rate: 0.08, drop: "30–50%", description: "Suurem kasvuvõimalus käib koos suure languse ja pika miinusperioodi võimalusega." },
};
const INVESTMENTS: { name: string; risk: RiskKey; info: string }[] = [
  { name: "Ettevõtete võlakirjade fond", risk: "low", info: "Laenad raha mitmele ettevõttele. Tootlus on tavaliselt väiksem ja kõikumine madalam." },
  { name: "Rahaturufond", risk: "low", info: "Lühiajalised ja konservatiivsemad instrumentid. Sobib rahale, mida võid varem vajada." },
  { name: "Laia hajutusega indeksifond", risk: "medium", info: "Raha jaguneb paljude ettevõtete vahel, seega ei sõltu tulemus ühest firmast." },
  { name: "Euroopa indeksifond", risk: "medium", info: "Jälgib paljusid Euroopa ettevõtteid korraga, aga on geograafiliselt keskendunud." },
  { name: "Kinnisvarafond", risk: "medium", info: "Saad osaluse mitmest kinnisvaraobjektist ilma ise üht korterit ostmata." },
  { name: "Kullafond", risk: "medium", info: "Jälgib kulla hinda. Võib kaitsta inflatsiooni eest, aga ei teeni püsivat kasumit." },
  { name: "Coop Pank", risk: "high", info: "Üksikaktsia: sinu tulemus sõltub ühe Eesti panga edu ja riskidest." },
  { name: "LHV Group", risk: "high", info: "Üksikaktsia: sinu raha on seotud ühe finantskonserni väärtusega." },
  { name: "Tallink Grupp", risk: "high", info: "Üksikaktsia: laevandusettevõtte väärtus võib majandusega tugevalt kõikuda." },
  { name: "Enefit Green", risk: "high", info: "Üksikaktsia: taastuvenergia ettevõtte kasv ja risk on ühes kohas." },
  { name: "Apple", risk: "high", info: "Üksikaktsia: suur rahvusvaheline ettevõte, aga siiski ainult üks ettevõte." },
  { name: "Roheline energiafond", risk: "high", info: "Kitsas teemafond: palju kasvupotentsiaali, aga tugev sõltuvus ühest valdkonnast." },
];

function PortfolioSummary({ life }: { life: Life }) {
  if (life.investments <= 0 && life.investedPrincipal <= 0 && life.investMonthly <= 0) return null;
  const total = investmentPerformance(life.investedPrincipal, life.investments);
  const previous = life.lastInvestmentPerformance;
  const PreviousIcon = !previous || previous.amount === 0 ? Minus : previous.amount > 0 ? ArrowUpRight : ArrowDownRight;
  const percent = (value: number | null) => value === null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}%`;
  const signedEur = (value: number) => `${value >= 0 ? "+" : ""}${eur(value, 2)}`;
  return (
    <section className="rounded-2xl border border-primary/15 bg-card p-3.5 shadow-soft" aria-label="Sinu investeeringute ülevaade">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground">Sinu portfelli väärtus</p>
          <p className="mt-0.5 font-display text-3xl font-extrabold text-primary">{eur(life.investments)}</p>
        </div>
        <div className={`shrink-0 rounded-xl px-2.5 py-1.5 text-right ${total.amount < 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
          <p className="text-sm font-extrabold">{percent(total.percent)}</p>
          <p className="text-[9px] font-bold">kogu periood</p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-accent p-3 text-accent-foreground">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold opacity-75">Eelmine kuu{previous ? ` · ${formatLifeMonth(life.startDate, previous.month - 1)}` : ""}</p>
            <p className="mt-1 font-display text-xl font-extrabold">{previous ? signedEur(previous.amount) : "—"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-card/10 px-2.5 py-2">
            <PreviousIcon className="size-4" />
            <span className="text-base font-extrabold">{previous ? percent(previous.percent) : "—"}</span>
          </div>
        </div>
        {!previous && <p className="mt-1 text-[10px] opacity-75">Esimene kuu tulemus ilmub pärast kuu edasi liikumist.</p>}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div><p className="text-[10px] text-muted-foreground">Sisse makstud</p><p className="mt-0.5 text-sm font-extrabold">{eur(life.investedPrincipal)}</p></div>
        <div><p className="text-[10px] text-muted-foreground">Kogutulemus</p><p className={`mt-0.5 text-sm font-extrabold ${total.amount < 0 ? "text-destructive" : "text-success"}`}>{signedEur(total.amount)}</p></div>
        <div><p className="text-[10px] text-muted-foreground">Iga kuu</p><p className="mt-0.5 text-sm font-extrabold">{eur(life.investMonthly)}</p></div>
      </div>
      <p className="mt-3 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">Kuu protsent näitab ainult turu muutust kuu alguse väärtusest. Uut sissemakset ei arvutata kasumiks.</p>
    </section>
  );
}

export function BankPanel({ life, open, onClose, investOnly = false }: P & { investOnly?: boolean }) {
  const [mode, setMode] = useState<"fund" | "invest" | "monthly" | "loan" | "coop" | "lend">("invest");
  const [save, setSave] = useState(life.saveMonthly);
  const [lump, setLump] = useState(500);
  const [monthly, setMonthly] = useState(life.investMonthly);
  const [stock, setStock] = useState("Laia hajutusega indeksifond");
  const [stockOpen, setStockOpen] = useState(false);
  const [quiz, setQuiz] = useState(false);
  useEffect(() => {
    if (!open) return;
    setSave(life.saveMonthly);
    setMonthly(life.investMonthly);
    setStockOpen(false);
  }, [open, life.saveMonthly, life.investMonthly]);
  const selectedInvestment = INVESTMENTS.find((item) => item.name === stock) ?? INVESTMENTS[0];
  if (!selectedInvestment) return null;
  const risk = RISK_PROFILES[selectedInvestment.risk];
  if (quiz) return <LoanQuiz open={open} onClose={() => setQuiz(false)} project="Remondi hind 5000 €. Kui palju soovid laenata?" />;
  const plan = investmentPlan(mode === "monthly" ? "monthly" : "invest", lump, monthly, life.investMonthly);
  const inv = mode === "invest" ? plan.upfront : 0;
  const mon = mode === "monthly" ? plan.monthly : 0;
  const q = mode === "fund" ? aiQuestion(life, { kind: "save", newMonthly: Math.max(0, save - life.saveMonthly) }) : mode === "invest" || mode === "monthly" ? aiQuestion(life, { kind: "invest", invest: inv, newMonthly: mode === "monthly" ? Math.max(0, mon - life.investMonthly) : 0 }) : null;
  if (mode === "lend") return <LendPanel life={life} open={open} onClose={onClose} modes={<BankModes mode={mode} setMode={setMode} investOnly={investOnly} />} />;
  if (mode === "loan" || mode === "coop")
    return (
      <Sheet open={open} onClose={onClose} title="Mis võiks rahast saada?">
        <PortfolioSummary life={life} />
        <div className="mt-3"><BankModes mode={mode} setMode={setMode} investOnly={investOnly} /></div>
        {mode === "loan" ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm">Õpi enne laenu võtmist, mida pank küsib ja kui palju laen päriselt maksab.</p>
            <div className="rounded-2xl bg-muted p-3">
              <p className="mb-1 text-xs font-bold">5000 € laen, 5 aastat</p>
              {[6, 9, 12].map((r) => <Row key={r} l={`Intress ${r}%`} v={`${eur(loanPayment(5000, r / 100, 60), 2)} / kuu · kokku ${eur(loanTotalRepay(5000, r / 100, 60))}`} />)}
            </div>
            <Btn onClick={() => setQuiz(true)}>Proovi remondilaenu õppetaotlust</Btn>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p>Coop Pank pakub igapäevapanganduse, säästmise, investeerimise ja laenu lahendusi. Mängus kasutame ainult üldisi näiteid.</p>
            <Note>Õppemäng. See ei ole Coop Panga pakkumine. Konkreetsed tooted, intressid ja tingimused tuleb üle kontrollida Coop Panga ametlikust infost.</Note>
            <a className="block text-center font-bold text-primary underline" href="https://www.cooppank.ee" target="_blank" rel="noreferrer">cooppank.ee</a>
          </div>
        )}
      </Sheet>
    );
  return (
    <DecisionFrame
      title="Mis võiks rahast saada?"
      open={open}
      onClose={onClose}
      life={life}
      question={q}
      upfront={inv}
      canPreview={mode !== "invest" || inv > 0}
      risks={mode === "fund" ? ["Igakuine säästumakse vähendab vabalt kasutatavat raha.", "Liiga suur makse võib muuta ootamatud kulud raskeks.", "Säästetud raha ei kõiku nagu investeering."] : ["Investeeringu väärtus võib langeda ja tulemus võib olla negatiivne.", `${risk.label}: võimalik ajutine langus on ${risk.drop}.`, plan.monthly > 0 ? `Igakuine makse ${eur(plan.monthly)} vähendab vaba raha.` : "Ühekordne sissemakse vähendab kohe vaba raha."]}
      confirmLabel={mode === "fund" ? "Salvestan säästumakse" : mode === "invest" ? `Investeerin ${eur(inv)}` : mon === 0 ? "Peatan igakuised maksed" : "Salvestan igakuise makse"}
      logText={mode === "fund" ? `Säästumakse on nüüd ${eur(save)} kuus.` : mode === "monthly" ? `Investeerimismakse on nüüd ${eur(mon)} kuus: ${stock}.` : `Investeerisid ühekordselt ${eur(inv)}: ${stock}.`}
      editor={
        <div className="space-y-3">
          <PortfolioSummary life={life} />
          <BankModes mode={mode} setMode={setMode} investOnly={investOnly} />
          {mode === "fund" && <NumField label="Igakuine säästumakse" value={save} onChange={setSave} />}
          {(mode === "invest" || mode === "monthly") && (
            <>
              <div className="space-y-2">
                <div><p className="text-sm font-bold">Vali, kuhu investeerid</p><p className="mt-0.5 text-xs text-muted-foreground">Iga toote juures on risk. Hajutatud fond jaguneb mitme investeeringu vahel, üksikaktsia mitte.</p></div>
                <button type="button" onClick={() => setStockOpen((v) => !v)} aria-expanded={stockOpen} className="flex w-full items-center justify-between gap-2 rounded-xl border border-primary bg-secondary px-3 py-2.5 text-left text-sm font-semibold text-secondary-foreground ring-1 ring-primary/20 transition active:scale-[0.99]">
                  <span className="min-w-0">{selectedInvestment.name}<span className="mt-1 block text-[11px] font-normal text-muted-foreground">{risk.label}</span></span>
                  {stockOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
                </button>
                {stockOpen && (
                  <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-border bg-card p-2">
                    {INVESTMENTS.map((item) => (
                      <Choice key={item.name} active={stock === item.name} onClick={() => { setStock(item.name); setStockOpen(false); }}>
                        {item.name}<span className="mt-1 block text-[11px] font-normal text-muted-foreground">{RISK_PROFILES[item.risk].label}</span>
                      </Choice>
                    ))}
                  </div>
                )}
                <div className="rounded-2xl bg-muted p-3">
                  <p className="text-xs font-extrabold">{selectedInvestment.name} · {risk.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{selectedInvestment.info}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mode === "invest" && <NumField label="Ühekordne summa" value={lump} onChange={setLump} />}
                {mode === "monthly" && <NumField label="Igakuine makse" value={monthly} onChange={setMonthly} />}
              </div>
              {mode === "invest" && <Note>See summa investeeritakse ainult üks kord. Olemasolev kuumakse {eur(life.investMonthly)} ei muutu.</Note>}
              {mode === "monthly" && <Note>Esimene makse toimub järgmise kuu edasi liikumisel. Uus summa asendab senise {eur(life.investMonthly)} kuumakse; 0 € peatab maksed.</Note>}
              <div className="rounded-2xl border border-primary/15 bg-secondary/50 p-3">
                <p className="text-xs font-extrabold text-primary">Mida {risk.label.toLowerCase()} tähendab?</p>
                <p className="mt-1 text-xs leading-relaxed text-secondary-foreground">{risk.description}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs"><p>Oodatav tootlus<br /><span className="font-extrabold">{Math.round(risk.rate * 100)}% aastas</span></p><p>Võimalik ajutine langus<br /><span className="font-extrabold">{risk.drop}</span></p></div>
              </div>
            </>
          )}
        </div>
      }
      preview={
        <div className="space-y-2">
          {mode === "fund" ? (
            <div className="rounded-2xl bg-muted p-3">
              <Row l="1 aastaga" v={eur(save * 12)} />
              <Row l="5 aastaga" v={eur(save * 60)} />
              <Row l="Kuu lõpus jääb pärast" v={eur(monthlyLeft(life) + life.saveMonthly - save)} strong />
            </div>
          ) : (
            <div className="rounded-2xl bg-muted p-3">
              <p className="mb-1 text-xs font-bold">{stock} · {risk.label}</p>
              <Row l="Makstan kohe" v={eur(inv)} />
              <Row l="Igakuine makse pärast" v={eur(plan.monthly)} />
              <Row l="Kuu lõpus jääb pärast" v={eur(monthlyLeft(life) + life.investMonthly - plan.monthly)} strong />
              {[1, 5, 10].map((y) => (
                <Row key={y} l={`${y} a · sisse ${eur(inv + mon * 12 * y)}`} v={eur(inv * Math.pow(1 + risk.rate, y) + growMonthly(mon, risk.rate, y))} />
              ))}
              <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">Eelvaade kasutab oodatavat tootlust {Math.round(risk.rate * 100)}% aastas. Ajutine langus võib olla {risk.drop}; päris tulemus võib olla ka negatiivne. See on õppenäide, mitte hinnaprognoos.</p>
            </div>
          )}
        </div>
      }
      onConfirm={(l) => {
        if (mode === "fund") l.saveMonthly = save;
        else {
          pay(l, inv);
          l.investments += inv;
          l.investedPrincipal += inv;
          l.investMonthly = plan.monthly;
        }
      }}
    />
  );
}
function BankModes({ mode, setMode, investOnly }: { mode: string; setMode: (m: "fund" | "invest" | "monthly" | "loan" | "coop" | "lend") => void; investOnly: boolean }) {
  return (
    <section>
      <p className="mb-1 text-sm font-bold">{investOnly ? "Kas investeerid korra või iga kuu?" : "Mida soovid oma rahaga teha?"}</p>
      <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{investOnly ? "Ühekordne summa läheb kohe investeeringusse. Igakuine makse lisandub iga kuu automaatselt." : "Puhver aitab ootamatustega. Investeerimine sobib pikemaks ajaks ja selle väärtus võib kõikuda."}</p>
      {!investOnly && <MoneyExplanation />}
      <div className="grid grid-cols-2 gap-2">
        {!investOnly && <Choice active={mode === "fund"} onClick={() => setMode("fund")}>Kogun hädaabifondi<span className="mt-1 block text-xs font-normal text-muted-foreground">Panen iga kuu raha kõrvale.</span></Choice>}
        <Choice active={mode === "invest"} onClick={() => setMode("invest")}>Investeerin ühekordse summa<span className="mt-1 block text-xs font-normal text-muted-foreground">Valin toote ja sisestan summa.</span></Choice>
        <Choice active={mode === "monthly"} onClick={() => setMode("monthly")}>Investeerin iga kuu<span className="mt-1 block text-xs font-normal text-muted-foreground">Lisan väiksema summa regulaarselt.</span></Choice>
        {!investOnly && <Choice active={mode === "lend"} onClick={() => setMode("lend")}>Annan laenu<span className="mt-1 block text-xs font-normal text-muted-foreground">Nt sõbrale, lepinguga või ilma.</span></Choice>}
        {!investOnly && <Choice active={mode === "loan"} onClick={() => setMode("loan")}>Võrdlen laenu</Choice>}
        {!investOnly && <Choice active={mode === "coop"} onClick={() => setMode("coop")}>Uurin Coop Panga lahendusi</Choice>}
      </div>
    </section>
  );
}

function LendPanel({ life, open, onClose, modes }: P & { modes: ReactNode }) {
  const [amount, setAmount] = useState(500);
  const [contract, setContract] = useState(true);
  const [due, setDue] = useState(3);
  const [answer, setAnswer] = useState<string | null>(null);
  const ok = amount > 0 && Number.isInteger(due) && due >= 1;
  return (
    <DecisionFrame
      title="Annan laenu"
      open={open}
      onClose={onClose}
      life={life}
      question={ok ? aiQuestion(life, { kind: "friend", lend: amount }) : null}
      upfront={ok ? amount : 0}
      canPreview={ok}
      risks={contract ? ["Raha on kuni tähtajani sinu kontolt läinud.", `Lepinguga saad ${eur(amount)} tagasi ${due} kuu pärast.`] : ["Ilma lepinguta ei pruugi sa raha tagasi saada.", "Sõber võib maksta hiljem, osaliselt või üldse mitte."]}
      confirmLabel={`Laenan ${eur(amount)}`}
      logText={`Andsid laenu ${eur(amount)} ${contract ? `lepinguga, tagasi ${due} kuu pärast` : "ilma lepinguta"}.`}
      editor={
        <div className="space-y-3">
          {modes}
          {life.lentLoans.length > 0 && (
            <section className="space-y-2">
              <p className="text-sm font-bold">Välja antud laenud</p>
              {life.lentLoans.map((x) => (
                <div key={x.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-2.5">
                  <p className="text-xs"><span className="font-bold">{eur(x.amount)}</span><span className="block text-muted-foreground">{x.written ? `Lepinguga · tähtaeg ${Math.max(0, (x.dueMonth ?? 0) - life.months)} kuu pärast` : "Ilma lepinguta"}</span></p>
                  <Btn variant="outline" className="w-auto min-h-9 px-3 py-1.5 text-xs" onClick={() => { let back = 0; updateLife((l) => { back = askLoanBack(l, x.id); }); setAnswer(back === 0 ? "Sõber ei maksnud praegu midagi tagasi." : `Said tagasi ${eur(back)}.`); }}>Küsin tagasi</Btn>
                </div>
              ))}
              {answer && <Note>{answer}</Note>}
            </section>
          )}
          <NumField label="Laenusumma" value={amount} onChange={setAmount} />
          <div className="grid grid-cols-2 gap-2">
            <Choice active={contract} onClick={() => setContract(true)}>Lepinguga<span className="mt-1 block text-xs font-normal text-muted-foreground">Saad raha kindlalt tagasi.</span></Choice>
            <Choice active={!contract} onClick={() => setContract(false)}>Ilma lepinguta<span className="mt-1 block text-xs font-normal text-muted-foreground">Ei pruugi tagasi saada.</span></Choice>
          </div>
          {contract && <NumField label="Tagasimakse tähtaeg" value={due} onChange={setDue} suffix="kuud" />}
        </div>
      }
      preview={
        <div className="rounded-2xl bg-muted p-3">
          <Row l="Annad laenu" v={eur(amount)} />
          <Row l="Tagasi" v={contract ? `${eur(amount)} · ${due} kuu pärast` : "ebakindel"} strong />
        </div>
      }
      onConfirm={(l) => {
        lendMoney(l, amount, contract, due);
      }}
    />
  );
}

// ---------------- HOUSEHOLD & EDUCATION ----------------
export function HouseholdPanel({ life, open, onClose }: P) {
  const [adults, setAdults] = useState(life.household.adults);
  const [partnerIncome, setPartnerIncome] = useState(life.household.partnerIncome ?? 0);
  const [partnerCosts, setPartnerCosts] = useState((life.household.partnerCosts ?? 240) * life.priceLevel);
  const [children, setChildren] = useState(life.household.children);
  const [study, setStudy] = useState<"none" | "vocational" | "university">(life.household.tuitionMonthsLeft > 24 ? "university" : life.household.tuitionMonthsLeft > 0 ? "vocational" : "none");
  const [tuitionAmount, setTuitionAmount] = useState(life.household.tuitionMonthly);
  useEffect(() => {
    if (!open) return;
    setAdults(life.household.adults);
    setPartnerIncome(life.household.partnerIncome ?? 0);
    setPartnerCosts((life.household.partnerCosts ?? 240) * life.priceLevel);
    setChildren(life.household.children);
    setStudy(life.household.tuitionMonthsLeft > 24 ? "university" : life.household.tuitionMonthsLeft > 0 ? "vocational" : "none");
    setTuitionAmount(life.household.tuitionMonthly);
  }, [open, life.household.adults, life.household.children, life.household.tuitionMonthly, life.household.tuitionMonthsLeft, life.household.partnerIncome, life.household.partnerCosts, life.priceLevel]);
  const tuition = study === "none" ? 0 : tuitionAmount;
  const tuitionMonths = studyDuration(tuition, life.household.tuitionMonthly, life.household.tuitionMonthsLeft, study === "university" ? 24 : study === "vocational" ? 12 : 0);
  const nextCosts = householdMonthlyCost(1, children, 0) * life.priceLevel + (adults > 1 ? partnerCosts : 0) + tuition;
  const nextIncome = adults > 1 ? partnerIncome : 0;
  const newLeft = monthlyLeft(life) + householdCosts(life) - nextCosts - partnerContribution(life.household) + nextIncome;
  const q = newLeft < 0 ? `Uute leibkonna- ja õppekulude järel jääks kuu lõpuks ${eur(newLeft)}. Millist kulu saaksid vähendada või kuidas suurendada sissetulekut?` : null;
  return (
    <DecisionFrame
      title="Leibkond ja õpingud"
      open={open}
      onClose={onClose}
      life={life}
      question={q}
      upfront={0}
      confirmLabel={study === "none" ? "Salvestan leibkonna" : "Salvestan leibkonna ja õpingud"}
      logText={`Leibkond: ${adults} täiskasvanut ja ${children} last. Partneri panus ${nextIncome} € kuus.${tuition ? ` Õppemaks ${tuition} € kuus ${tuitionMonths} kuud.` : ""}`}
      editor={
        <div className="space-y-4">
          {life.household.tuitionMonthsLeft > 0 && <Note>Praegused õppemaksud: {eur(life.household.tuitionMonthly)} kuus, jäänud {life.household.tuitionMonthsLeft} kuud.</Note>}
          <section>
            <p className="text-sm font-bold">Kes sinu leibkonda kuuluvad?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Sisesta, kui palju partner sinu ühisesse eelarvesse panustab ja kui palju lisakulusid tekib.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Choice active={adults === 1} onClick={() => setAdults(1)}>Elan üksi<span className="mt-1 block text-xs font-normal text-muted-foreground">Lisakulu pole</span></Choice>
              <Choice active={adults === 2} onClick={() => setAdults(2)}>Koos partneriga<span className="mt-1 block text-xs font-normal text-muted-foreground">Panuse ja kulud sisestan ise</span></Choice>
            </div>
            {adults > 1 && <div className="mt-3 space-y-2"><div className="grid grid-cols-2 gap-2"><NumField label="Partneri panus eelarvesse / kuu" value={partnerIncome} onChange={setPartnerIncome} /><NumField label="Partneri lisakulud / kuu" value={partnerCosts} onChange={setPartnerCosts} /></div><Note>Panus võib olla 0 €. Sisesta ainult see osa partneri rahast, mida kasutate koos, mitte automaatselt kogu tema palk.</Note></div>}
            <div className="mt-3 rounded-xl border border-border bg-card p-3">
              <p className="text-xs font-bold">Praegu on sinu leibkonnas {children === 0 ? "lapsi pole" : children === 1 ? "1 laps" : `${children} last`}.</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Btn variant="outline" onClick={() => setChildren((count) => count + 1)} className="px-2 text-xs">Perre sünnib laps</Btn>
                <Btn variant="ghost" disabled={children === 0} onClick={() => setChildren((count) => Math.max(0, count - 1))} className="px-2 text-xs">Laps kolib kodust ära</Btn>
              </div>
            </div>
            <Note>Lapse sünd lisab mängus {eur(280 * life.priceLevel)} kuukulusid toidu, riiete ja huvitegevuse jaoks. Omal ära kolimisel see kulu kaob.</Note>
          </section>
          <section>
            <p className="text-sm font-bold">Kas soovid õppida?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Õppemaks on ajutine kulu. Õpingud annavad iga kuu +3 karjäärikogemust.</p>
            <div className="mt-2 grid gap-2">
              <Choice active={study === "none"} onClick={() => setStudy("none")}>Praegu ei õpi<span className="mt-1 block text-xs font-normal text-muted-foreground">Õppemakset pole</span></Choice>
              <Choice active={study === "vocational"} onClick={() => setStudy("vocational")}>Kutseõpe<span className="mt-1 block text-xs font-normal text-muted-foreground">Kestus 12 kuud · kuusumma sisestad ise</span></Choice>
              <Choice active={study === "university"} onClick={() => setStudy("university")}>Ülikool<span className="mt-1 block text-xs font-normal text-muted-foreground">Kestus 24 kuud · kuusumma sisestad ise</span></Choice>
            </div>
            {study !== "none" && <div className="mt-3"><NumField label="Õppemaks kuus" value={tuitionAmount} onChange={setTuitionAmount} /><p className="mt-1 text-xs text-muted-foreground">Sisesta summa, mis sinu õppeasutuses tegelikult on — seda pole ette täidetud.</p></div>}
          </section>
        </div>
      }
      preview={
        <div className="rounded-2xl bg-muted p-3">
          {adults > 1 && <><Row l="Partneri panus eelarvesse" v={eur(partnerIncome)} /><Row l="Partneri lisakulud" v={eur(partnerCosts)} /></>}
          {children > 0 && <Row l={`Laste kulud (${children})`} v={eur(children * 280 * life.priceLevel)} />}
          {tuition > 0 && <Row l="Õppemaks kuus" v={eur(tuition)} />}
          <Row l="Leibkond ja õpingud kokku kuus" v={eur(nextCosts)} strong />
          <Row l="Kuu lõpus jääb pärast" v={eur(newLeft)} strong />
          {tuition > 0 && <Row l="Õppemaksude kestus" v={`${tuitionMonths} kuud`} />}
          <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">Kulud lähevad käima järgmisest kuust. Õppemaks lõpeb automaatselt pärast määratud perioodi.</p>
        </div>
      }
      onConfirm={(l) => {
        l.household = { adults, children, tuitionMonthly: tuition, tuitionMonthsLeft: tuitionMonths, partnerIncome: nextIncome, partnerCosts: partnerCosts / l.priceLevel };
      }}
    />
  );
}

// ---------------- PHONE ----------------
export function PhonePanel({ life, open, onClose }: P) {
  const [mode, setMode] = useState<"all" | "less" | "written" | "no">("written");
  const [amount, setAmount] = useState(1500);
  const [due, setDue] = useState(1);
  const realAmount = friendLoanAmount(mode, amount);
  const q = mode === "no" ? null : aiQuestion(life, { kind: "friend", lend: realAmount });
  return (
    <DecisionFrame
      title="Sõber küsib raha"
      open={open}
      onClose={onClose}
      life={life}
      question={q}
      upfront={mode === "no" ? 0 : realAmount}
      confirmLabel={mode === "no" ? "Ei laena seekord" : `Laenan ${eur(realAmount)}`}
      logText={mode === "no" ? "Keeldusid sõbrale laenamast." : `Laenasid sõbrale ${eur(realAmount)}${mode === "written" ? " kirjaliku kokkuleppega" : ""}.`}
      editor={
        <div className="space-y-3">
          <div className="rounded-2xl rounded-bl-sm bg-secondary p-3 text-sm">„Hei! Kas saaksid mulle 1500 € laenata? Maksan järgmise kuu alguses tagasi.”</div>
          <div className="grid grid-cols-2 gap-2">
            <Choice active={mode === "all"} onClick={() => setMode("all")}>Laenan kogu summa</Choice>
            <Choice active={mode === "less"} onClick={() => { setMode("less"); setAmount(500); }}>Pakun väiksemat summat</Choice>
            <Choice active={mode === "written"} onClick={() => setMode("written")}>Lepime kirjalikult kokku</Choice>
            <Choice active={mode === "no"} onClick={() => setMode("no")}>Ei laena</Choice>
          </div>
          {mode === "less" && (
            <div className="space-y-2">
              <NumField label="Summa" value={amount} onChange={(n) => setAmount(friendLoanAmount("less", n))} />
              <Note>Sõber küsib 1500 €. Saad pakkuda väiksema summa vahemikus 0–1500 €.</Note>
            </div>
          )}
          {mode === "written" && <NumField label="Tagasimakse tähtaeg" value={due} onChange={setDue} suffix="kuud" />}
        </div>
      }
      preview={
        <div className="rounded-2xl bg-muted p-3">
          <Row l="Laenad" v={eur(mode === "no" ? 0 : realAmount)} />
          <Row l="Sääste + kontot jääb" v={eur(life.account + life.savings - (mode === "no" ? 0 : realAmount))} strong />
          <p className="mt-2 text-xs text-muted-foreground">Raha võib tulla tagasi õigel ajal, hilineda või jääda osaliselt saamata. Kirjalik kokkulepe suurendab tagasimakse tõenäosust.</p>
        </div>
      }
      onConfirm={(l) => {
        if (mode === "no") return;
        lendMoney(l, realAmount, mode === "written", due);
      }}
    />
  );
}

