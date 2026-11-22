import { ANNUAL_INFLATION, projectWealth } from "./finance";
import type { Life } from "./store";

export const DEMO_DURATION_SECONDS = 120;

export const DEMO_STEPS = [
  { start: 0, kind: "life", title: "Sinu elu algab siit", text: "Liisa on 22. Elupildi kaudu jõuab ta poodi, panka ja koju; all on töö, investeerimine ja leibkond." },
  { start: 12, kind: "budget", title: "Kõigepealt oma eelarve", text: "Rahaseisus saab muuta sissetulekut ja kulusid. Liisale jääb pärast elamiskulusid 425 € kuus." },
  { start: 24, kind: "basket", title: "Igapäevased ostud loevad", text: "Ostukotis saab muuta tooteid, koguseid ja hindu ning võrrelda aastast kokkuhoidu." },
  { start: 36, kind: "career", title: "Töö ja karjäär", text: "Kursused ja töövalikud kasvatavad kogemust. Rohkem teenimine nõuab ka aega ja vahel raha." },
  { start: 48, kind: "household", title: "Õpingud ja leibkond", text: "Õppemaks, partneri panus ja laste kulud mõjutavad eelarvet. Sisesta enda olukorrale sobivad summad." },
  { start: 60, kind: "invest", title: "Vali rahale suund", text: "Pangas saab koguda puhvrit ja uurida laene. Investeerimises valib Liisa 100 € kuus; toodete nimekiri avaneb vajutades." },
  { start: 72, kind: "risk", title: "Enne otsust vaata mõju", text: "Liisa loeb riske enne kinnitamist. Igapäevasteks vajadusteks jääb pärast investeerimist 325 € kuus." },
  { start: 80, kind: "lend", title: "Sõber palub laenu", text: "Enne laenu andmist küsib Liisa: kas saan raha tagasi, mis juhtub, kui ei maksta, ja kas mulle jääb endale küll? Lepinguga on tagasimakse kindel, ilma mitte." },
  { start: 90, kind: "month", title: "Uus kuu, nähtavad tagajärjed", text: "Kuu edasi liikumisel näeb Liisa kõigepealt ülevaadet ja siis tulemusi. Elusündmused võivad plaani muuta." },
  { start: 98, kind: "future40", title: "Liisa 40-aastaselt", text: "Tulevikus saab võrrelda vanuseid ja avada majadelt elukoha, investeeringute ning konto andmeid." },
  { start: 108, kind: "future65", title: "Liisa 65-aastaselt", text: "Sama 100 € harjumus pikema aja jooksul. Arvutus näitab võimalikku mõju, mitte kindlat tulemust." },
  { start: 116, kind: "finish", title: "Nüüd proovi oma elu", text: "Vali eesmärk, proovi üht otsust ja vaata selle mõju. Juhend aitab igal hetkel edasi." },
] as const;

export function demoStepAt(seconds: number) {
  return DEMO_STEPS.reduce((index, step, next) => seconds >= step.start ? next : index, 0);
}

/** A fresh, isolated fictional life. Never passed to the persistent game's mutation functions. */
export function demoLife(investing = false): Life {
  return {
    id: "guided-demo", lifeName: "Näidiselu", playerName: "Liisa", character: 1,
    startAge: 22, lifeExpectancy: 100, startDate: "2026-01-01", months: 0, priceLevel: 1,
    income: 1600, job: "Klienditeenindaja", housing: "rent", goal: "buffer", goalText: "Rahaline puhver", goalTarget: 5000,
    account: 800, savings: 1500, investments: 0, investedPrincipal: 0, investMonthly: investing ? 100 : 0,
    saveMonthly: 0, lastInvestmentPerformance: null,
    expenses: { housing: 620, food: 320, transport: 70, phone: 25, leisure: 140 },
    household: { adults: 1, children: 0, tuitionMonthly: 0, tuitionMonthsLeft: 0 },
    car: null, home: null, properties: [], renovated: false, loans: [], lentLoans: [],
    skills: 0, careerLevel: 1, careerXp: 0, lastCareerActionMonth: null, goodDecisions: 0,
    introSeen: true, points: 0, impulse: 0, milestones: [], rewards: [], quizDone: false,
    pendingEvent: null, log: [], history: [],
  };
}

export function demoForecast(atAge: number) {
  const life = demoLife(true);
  return projectWealth({ ...life, livingCosts: 1175, tuition: 0, tuitionMonthsLeft: 0, incomeGrowthRate: ANNUAL_INFLATION, carValue: 0, homeValue: 0 }, (atAge - life.startAge) * 12, "base");
}