import { useSyncExternalStore } from "react";
import { defaultBasket } from "./basket";
import type { ShoppingBasket } from "./finance";
import { addCareerExperience, CAREER_XP_PER_LEVEL, MAX_CAREER_LEVEL, clampRent, depreciate, householdMonthlyCost, partnerContribution, partnerMonthlyCost, inflateAnnual, investmentMonth, investmentPerformance, loanMonth, loanPayment, payFromCash, propertySaleProceeds, propertyValue, rentalCosts, rentalIncome, repriceLoan, type RentalProperty } from "./finance";

export type Housing = "parents" | "rent" | "own";
export type Goal = "home" | "car" | "buffer" | "trip" | "other";
export type Loan = { id: string; label: string; balance: number; rate: number; monthsLeft: number; payment: number };
export type Reward = { id: string; title: string; product: string; achievement: string; code: string; at: number };
export type EventChoice = { label: string; account?: number; savings?: number; income?: number; careerXp?: number; skills?: number; leisure?: number; note: string };
export type GameEvent = { id: string; title: string; text: string; good: boolean; kind?: "career" | "money" | "life"; choices: EventChoice[] };

export type LentLoan = { id: string; amount: number; written: boolean; dueMonth?: number };
export type HistoryPoint = { m: number; age: number; nw: number; account: number; savings: number; investments: number; assets: number; debts: number; income: number; costs: number; left: number };
export type Life = {
  id: string;
  lifeName: string;
  character: number;
  playerName: string;
  startAge: number;
  lifeExpectancy: number;
  startDate: string;
  priceLevel: number;
  months: number;
  income: number;
  job: string;
  housing: Housing;
  goal: Goal;
  goalText: string;
  goalTarget: number;
  account: number;
  savings: number;
  investments: number;
  investedPrincipal: number;
  investMonthly: number;
  lastInvestmentPerformance: null | { month: number; amount: number; percent: number | null };
  saveMonthly: number;
  shoppingBasket?: ShoppingBasket;
  expenses: { housing: number; food: number; transport: number; phone: number; leisure: number };
  household: { adults: number; children: number; tuitionMonthly: number; tuitionMonthsLeft: number; partnerIncome?: number; partnerCosts?: number };
  car: null | { name: string; price: number; value: number; monthly: number };
  home: null | { kind: "flat" | "house"; value: number };
  properties: RentalProperty[];
  renovated: boolean;
  loans: Loan[];
  lentLoans: LentLoan[];
  skills: number;
  careerLevel: number;
  careerXp: number;
  lastCareerActionMonth: number | null;
  goodDecisions: number;
  introSeen: boolean;
  points: number;
  impulse: number;
  milestones: number[];
  rewards: Reward[];
  quizDone: boolean;
  pendingEvent: GameEvent | null;
  log: { m: number; text: string }[];
  history: HistoryPoint[];
};

type State = { lives: Life[]; activeId: string | null };
const KEY = "elu-plus-v1";
let state: State = { lives: [], activeId: null };
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      state = {
        ...parsed,
        lives: parsed.lives.map((life) => ({
          ...life,
          // Older saves did not separate contributions from the portfolio's market value.
          investedPrincipal: typeof life.investedPrincipal === "number" ? life.investedPrincipal : life.investments,
          lastInvestmentPerformance: life.lastInvestmentPerformance ?? null,
          careerLevel: typeof life.careerLevel === "number" ? life.careerLevel : 1,
          careerXp: typeof life.careerXp === "number" ? life.careerXp : 0,
          goodDecisions: typeof life.goodDecisions === "number" ? life.goodDecisions : 0,
          introSeen: typeof life.introSeen === "boolean" ? life.introSeen : true,
          startDate: typeof life.startDate === "string" ? life.startDate : "2026-01-01",
          priceLevel: typeof life.priceLevel === "number" ? life.priceLevel : 1,
          household: life.household ?? { adults: 1, children: 0, tuitionMonthly: 0, tuitionMonthsLeft: 0 },
          properties: life.properties ?? [],
          lastCareerActionMonth: life.lastCareerActionMonth ?? null,
          lifeExpectancy: life.lifeExpectancy ?? Math.max(100, life.startAge),
          history: Array.isArray(life.history) ? life.history : [],
          shoppingBasket: life.shoppingBasket ?? defaultBasket(),
          lentLoans: Array.isArray(life.lentLoans) ? life.lentLoans : (life as { friendDebt?: Omit<LentLoan, "id"> | null }).friendDebt ? [{ id: "friend", ...(life as unknown as { friendDebt: Omit<LentLoan, "id"> }).friendDebt }] : [],
        })),
      };
    }
  } catch {
    /* ignore */
  }
}
function save() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((f) => f());
}
const EMPTY: State = { lives: [], activeId: null };
export function useGame() {
  return useSyncExternalStore(
    (f) => {
      load();
      subs.add(f);
      f();
      return () => subs.delete(f);
    },
    () => (loaded ? state : EMPTY),
    () => EMPTY,
  );
}
export function useLife(): Life | null {
  const s = useGame();
  return s.lives.find((l) => l.id === s.activeId) ?? null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function updateLife(fn: (l: Life) => void) {
  const l = state.lives.find((x) => x.id === state.activeId);
  if (!l) return;
  const previousGoalProgress = goalProgress(l);
  const copy: Life = structuredClone(l);
  fn(copy);
  checkMilestones(copy, previousGoalProgress);
  state = { ...state, lives: state.lives.map((x) => (x.id === copy.id ? copy : x)) };
  save();
}
export function setActive(id: string | null) {
  state = { ...state, activeId: id };
  save();
}
export function deleteLife(id: string) {
  state = { lives: state.lives.filter((l) => l.id !== id), activeId: state.activeId === id ? null : state.activeId };
  save();
}
export function renameLife(id: string, name: string) {
  state = { ...state, lives: state.lives.map((l) => (l.id === id ? { ...l, lifeName: name } : l)) };
  save();
}
export function completeIntro() {
  state = { ...state, lives: state.lives.map((l) => (l.id === state.activeId ? { ...l, introSeen: true } : l)) };
  save();
}
export const isGoodDecisionReward = (count: number) => count > 0 && count % 10 === 0;

export const GOAL_LABEL: Record<Goal, string> = { home: "Oma kodu", car: "Auto", buffer: "Rahaline puhver", trip: "Reis", other: "Muu" };
export const GOAL_DEFAULT: Record<Goal, number> = { home: 30000, car: 12000, buffer: 5000, trip: 2500, other: 5000 };
export const JOBS: { name: string; pay: number }[] = [
  { name: "Klienditeenindaja", pay: 1150 },
  { name: "Noorem tarkvaraarendaja", pay: 1900 },
  { name: "Meditsiiniõde", pay: 1650 },
  { name: "Elektrik", pay: 1750 },
  { name: "Disainer", pay: 1500 },
];

export const MIN_PLAYER_AGE = 14;
export const MAX_PLAYER_AGE = 130;
export const isPlayerAgeValid = (value: number) => Number.isInteger(value) && value >= MIN_PLAYER_AGE && value <= MAX_PLAYER_AGE;
export const isIncomeValid = (value: number) => Number.isFinite(value) && value >= 0;
export const isLifeExpectancyValid = (value: number, currentAge: number) => Number.isInteger(value) && value >= currentAge && value <= MAX_PLAYER_AGE;

export type NewLife = {
  character: number; playerName: string; age: number; lifeExpectancy?: number; startDate?: string; income: number; job: string; housing: Housing; savings: number; children?: number; goal: Goal; goalText: string; expenses?: Partial<Life["expenses"]>;
};
export function createLife(n: NewLife) {
  const initialChildren = n.children ?? 0;
  if (!isPlayerAgeValid(n.age) || !isIncomeValid(n.income) || !Number.isInteger(initialChildren) || initialChildren < 0) return;
  const lifeExpectancy = n.lifeExpectancy ?? Math.max(100, n.age);
  if (!isLifeExpectancyValid(lifeExpectancy, n.age)) return;
  const housingCost = n.housing === "parents" ? 120 : n.housing === "rent" ? 620 : 230;
  const life: Life = {
    id: uid(),
    lifeName: `Elu ${state.lives.length + 1}`,
    character: n.character,
    playerName: n.playerName,
    startAge: n.age,
    lifeExpectancy,
    startDate: n.startDate ?? "2026-01-01",
    priceLevel: 1,
    months: 0,
    income: n.income,
    job: n.job,
    housing: n.housing,
    goal: n.goal,
    goalText: n.goal === "other" ? n.goalText : GOAL_LABEL[n.goal],
    goalTarget: GOAL_DEFAULT[n.goal],
    account: Math.round(n.income * 0.5),
    savings: n.savings,
    investments: 0,
    investedPrincipal: 0,
    investMonthly: 0,
    lastInvestmentPerformance: null,
    saveMonthly: 0,
    shoppingBasket: defaultBasket(),
    expenses: { housing: housingCost, food: 320, transport: 70, phone: 25, leisure: 140, ...Object.fromEntries(Object.entries(n.expenses ?? {}).filter(([, v]) => typeof v === "number" && Number.isFinite(v) && v >= 0)) },
    household: { adults: 1, children: initialChildren, tuitionMonthly: 0, tuitionMonthsLeft: 0 },
    car: null,
    home: n.housing === "own" ? { kind: "flat", value: 90000 } : null,
    properties: [],
    renovated: false,
    loans: [],
    lentLoans: [],
    skills: 0,
    careerLevel: 1,
    careerXp: 0,
    lastCareerActionMonth: null,
    goodDecisions: 0,
    introSeen: false,
    points: 0,
    impulse: 0,
    milestones: [],
    rewards: [],
    quizDone: false,
    pendingEvent: null,
    log: [{ m: 0, text: "Alustasid oma elu." }],
    history: [],
  };
  life.history = [historyPoint(life)];
  state = { lives: [...state.lives, life], activeId: life.id };
  save();
}

// ---------- Derived ----------
export const householdCosts = (l: Life) => (householdMonthlyCost(1, l.household.children, 0) + partnerMonthlyCost(l.household)) * l.priceLevel + l.household.tuitionMonthly;
export const householdIncome = (l: Life) => l.income + partnerContribution(l.household);
export const fixedCosts = (l: Life) => (Object.values(l.expenses).reduce((a, b) => a + b, 0) + (l.car?.monthly ?? 0) + rentalCosts(l.properties)) * l.priceLevel + householdCosts(l);
export const rentIncome = (l: Life) => rentalIncome(l.properties);
export const loanPayments = (l: Life) => l.loans.reduce((a, x) => a + loanMonth(x).payment, 0);
export const monthlyLeft = (l: Life) => householdIncome(l) + rentIncome(l) - fixedCosts(l) - loanPayments(l) - l.investMonthly - l.saveMonthly;
export const freeBeforePlans = (l: Life) => householdIncome(l) + rentIncome(l) - fixedCosts(l) - loanPayments(l);
export const debts = (l: Life) => l.loans.reduce((a, x) => a + x.balance, 0);
export const assets = (l: Life) => (l.car?.value ?? 0) + (l.home?.value ?? 0) + propertyValue(l.properties);
export const lifeNetWorth = (l: Life) => l.account + l.savings + l.investments + assets(l) - debts(l);
/** One month of the player's own numbers, kept for the spreadsheet export. */
export function historyPoint(l: Life): HistoryPoint {
  return {
    m: l.months,
    age: age(l),
    nw: lifeNetWorth(l),
    account: l.account,
    savings: l.savings,
    investments: l.investments,
    assets: assets(l),
    debts: debts(l),
    income: householdIncome(l),
    costs: fixedCosts(l) + loanPayments(l),
    left: monthlyLeft(l),
  };
}
export const bufferNeed = (l: Life) => 3 * (fixedCosts(l) + loanPayments(l));
export const age = (l: Life) => Math.min(MAX_PLAYER_AGE, l.startAge + Math.floor(l.months / 12));
export const monthsRemaining = (l: Life) => Math.max(0, (MAX_PLAYER_AGE - l.startAge) * 12 - l.months);
export const canAdvanceMonth = (l: Life) => monthsRemaining(l) > 0;
export function goalProgress(l: Life) {
  if (l.goal === "car" && l.car) return 1;
  if (l.goal === "home" && l.home && l.housing === "own") return 1;
  const have = l.goal === "home" ? l.savings + l.investments + (l.home ? l.home.value - debts(l) : 0) : l.savings + l.investments;
  return Math.max(0, Math.min(1, have / l.goalTarget));
}

// ---------- AI companion (rule-based, uses the player's own numbers) ----------
export type Proposal = { upfront?: number; newMonthly?: number; lend?: number; invest?: number; kind: string };
export function aiQuestion(l: Life, p: Proposal): string | null {
  const free = monthlyLeft(l);
  const buf = bufferNeed(l);
  if (l.impulse >= 2 && p.kind !== "friend") return "Oled mitu korda teinud suure ostu ilma kulusid võrdlemata. Kas proovime seekord kolme varianti?";
  if (p.newMonthly && p.newMonthly > free)
    return `Sinu kuine vaba raha on ${Math.round(free)} €. Uus kuine kulu oleks ${Math.round(p.newMonthly)} €. Kuidas kataksid puuduva ${Math.round(p.newMonthly - free)} € ja muud kulud?`;
  if (p.lend && p.lend > 0 && p.lend >= (l.account + l.savings) * 0.3)
    return `Kui sa ${Math.round(p.lend)} € tagasi ei saa, kas suudad järgmise kolme kuu arved ikka ära maksta?`;
  if (p.invest && p.invest > 0 && l.account + l.savings - p.invest < buf)
    return "Kas vajad seda raha lähiajal? Selle väärtus võib just siis langeda, kui tahad raha välja võtta.";
  if (p.upfront && l.account + l.savings - p.upfront < buf)
    return `Pärast seda jääks sul ${Math.round(l.account + l.savings - p.upfront)} €, aga kolme kuu kulude puhver oleks ${Math.round(buf)} €. Kuidas tuled toime ootamatu arvega?`;
  return null;
}
export function aiPraise(l: Life): string | null {
  if (l.account + l.savings >= bufferNeed(l) && l.savings > 0) return "Sul on tekkinud puhver. See aitab ootamatustega toime tulla.";
  return null;
}

/** Pay from account first, then savings. Returns false if not enough. */
export function canPay(l: Life, amount: number) {
  return l.account + l.savings >= amount;
}
export function pay(l: Life, amount: number) {
  const cash = payFromCash(l.account, l.savings, amount);
  l.account = cash.account;
  l.savings = cash.savings;
}
export function addLoan(l: Life, label: string, principal: number, rate: number, months: number) {
  const id = uid();
  l.loans.push({ id, label, balance: principal, rate, monthsLeft: months, payment: loanPayment(principal, rate, months) });
  return id;
}

export function buyRental(l: Life, input: { name: string; price: number; down: number; rent: number; costs: number; rate: number; months: number; financed: boolean }) {
  const down = input.financed ? Math.min(input.down, input.price) : input.price;
  if (!input.name.trim() || input.price <= 0 || down < 0 || !canPay(l, down)) return false;
  if (input.financed && (input.months < 1 || input.rate < 0)) return false;
  pay(l, down);
  const loanId = input.financed && input.price > down ? addLoan(l, `Üürikinnisvara: ${input.name.trim()}`, input.price - down, input.rate, input.months) : null;
  l.properties.push({ id: uid(), name: input.name.trim(), price: input.price, value: input.price, rent: clampRent(input.rent, input.price), costs: input.costs / l.priceLevel, occupied: true, loanId });
  return true;
}

export function sellRental(l: Life, id: string) {
  const property = l.properties.find((entry) => entry.id === id);
  if (!property) return false;
  const loan = l.loans.find((entry) => entry.id === property.loanId);
  const proceeds = propertySaleProceeds(property.value, loan?.balance ?? 0);
  if (proceeds < 0 && !canPay(l, -proceeds)) return false;
  if (proceeds < 0) pay(l, -proceeds);
  else l.account += proceeds;
  l.loans = l.loans.filter((entry) => entry.id !== property.loanId);
  l.properties = l.properties.filter((entry) => entry.id !== id);
  addLog(l, `Müüsid üürikinnisvara „${property.name}” ja tasusid seotud laenu.`);
  return true;
}

/** Preserve the old home and its mortgage when the player changes residence. */
export function retainPreviousHome(l: Life) {
  if (!l.home) return;
  const mortgage = l.loans.filter((loan) => loan.label === "Kodulaen").at(-1);
  l.properties.push({ id: uid(), name: "Eelmine kodu", price: l.home.value, value: l.home.value, rent: 0, costs: l.expenses.housing, occupied: false, loanId: mortgage?.id ?? null });
  if (mortgage) mortgage.label = "Üürikinnisvara: eelmine kodu";
  addLog(l, "Eelmine kodu ja selle laen jäid kinnisvaraportfelli. Objekt on tühi, üüritulu pole veel määratud.");
}
export function addLog(l: Life, text: string) {
  l.log.unshift({ m: l.months, text });
  l.log = l.log.slice(0, 40);
}

const CAREER_TITLES = ["Algaja", "Spetsialist", "Kogenud spetsialist", "Vanemspetsialist", "Ekspert", "Juht"];
/** Self-reported existing level: no automatic raise or reward for correcting a profile. */
export function setCareerLevel(life: Life, level: number) {
  if (!Number.isInteger(level) || level < 1 || level > MAX_CAREER_LEVEL || level === life.careerLevel) return;
  life.careerLevel = level;
  life.careerXp = 0;
  addLog(life, `Määrasid oma praeguseks karjääritasemeks ${level}. Netopalk jäi samaks.`);
}
export const careerTitle = (l: Life) => CAREER_TITLES[Math.min(Math.max(0, l.careerLevel - 1), CAREER_TITLES.length - 1)] ?? "Algaja";
export function gainCareer(l: Life, amount: number) {
  const previousLevel = l.careerLevel;
  const next = addCareerExperience(l.income, l.careerLevel, l.careerXp, amount);
  l.income = next.income;
  l.careerLevel = next.level;
  l.careerXp = next.xp;
  if (l.careerLevel > previousLevel) addLog(l, `Tõusid karjääriastmel ${l.careerLevel}: ${careerTitle(l)}. Palk kasvas 7%.`);
}

// ---------- Rewards ----------
const PRODUCTS = ["Coop kohvioad 500 g", "Coop täisteraleib", "Coop maasikajogurt", "Coop kaerahelbed", "Coop õunamahl"];
export function grantReward(l: Life, achievement: string) {
  const r: Reward = {
    id: uid(),
    title: "–20% ühelt näidistootelt",
    product: PRODUCTS[l.rewards.length % PRODUCTS.length] ?? "Coop kohvioad 500 g",
    achievement,
    code: "DEMO-" + uid().toUpperCase().slice(0, 6),
    at: Date.now(),
  };
  l.rewards.push(r);
  rewardQueue.push(r);
}
const rewardQueue: Reward[] = [];
export function getPendingReward(): Reward | null {
  return rewardQueue[0] ?? null;
}
export function clearPendingReward() {
  rewardQueue.shift();
  state = { ...state };
  save();
}
function checkMilestones(l: Life, previousGoalProgress: number) {
  const p = goalProgress(l);
  const reached = [25, 50, 75, 100].filter((step) => p * 100 >= step && previousGoalProgress * 100 < step && !l.milestones.includes(step));
  const top = reached.at(-1);
  if (top) {
    l.milestones.push(...reached);
    l.points += 20;
    grantReward(l, top === 100 ? `Saavutasin eesmärgi: ${l.goalText}` : `Jõudsin ${top}% eesmärgist „${l.goalText}”`);
  }
  if (l.savings > 0 && l.saveMonthly > 0 && !l.rewards.some((r) => r.achievement.startsWith("Planeerisin"))) {
    grantReward(l, "Planeerisin oma esimesed säästud");
  }
}

// ---------- Time & events ----------
function randomEvent(l: Life): GameEvent | null {
  const pool: GameEvent[] = [];
  if (l.car) {
    pool.push({ id: "carfix", kind: "life", title: "Auto vajab 1800 € remonti", text: "Pidurid ja sidur on kulunud.", good: false, choices: [
      { label: "Maksan kohe", account: -1800, note: "Remont makstud." },
      { label: "Valin odavama töökoja (1200 €)", account: -1200, note: "Odavam remont, veidi pikem ootus." },
      { label: "Kasutan säästusid", savings: -1800, note: "Puhver vähenes." },
    ] });
    pool.push({ id: "fuel", kind: "money", title: "Kütusehind tõusis", text: "Auto kuukulu kasvab 25 €.", good: false, choices: [{ label: "Selge", note: "Auto kuukulu +25 €." }] });
    pool.push({ id: "cheapfix", kind: "money", title: "Auto remont osutus odavamaks", text: "Hooldus maksis 150 € vähem.", good: true, choices: [{ label: "Tore!", account: 150, note: "+150 €" }] });
  }
  if (l.loans.length) pool.push({ id: "rate", kind: "money", title: "Laenu intress muutus", text: "Mängu laenude aastaintress tõusis 0,5 protsendipunkti. Kuumaksed arvutatakse järelejäänud tähtaja järgi uuesti.", good: false, choices: [{ label: "Selge", note: "Aastaintress +0,5 protsendipunkti ja uus kuumakse." }] });
  const risky = l.lentLoans.find((x) => !x.written);
  if (risky) {
    pool.push({ id: "friendlate", kind: "money", title: "Sõber ei saanud raha õigeks ajaks tagasi", text: `Sõber võlgneb ${Math.round(risky.amount)} €.`, good: false, choices: [
      { label: "Ootan veel kuu", note: "Raha on endiselt sõbra käes." },
      { label: "Leppisime osamaksetes kokku", account: Math.round(risky.amount / 2), note: "Said poole tagasi." },
    ] });
    pool.push({ id: "friendpaid", kind: "money", title: "Sõber maksis laenu tagasi", text: "Kõik tuli tagasi!", good: true, choices: [{ label: "Super", account: risky.amount, note: "Laen tagastatud." }] });
  }
  if (l.investments > 200) pool.push({ id: "crash", kind: "money", title: "Turg kukkus ajutiselt", text: "Portfell langes 12%.", good: false, choices: [
    { label: "Jätan investeeringu alles", note: "Ajutine langus, pikk vaade." },
    { label: "Müün kõik maha", note: "Kahjum realiseeriti." },
  ] });

  pool.push(
    { id: "raise", kind: "career", title: "Said palgatõusu", text: "Juht tõstab netopalka 120 € kuus.", good: true, choices: [{ label: "Suurepärane", income: 120, careerXp: 10, note: "Netopalk +120 € ja kogemus +10." }] },
    { id: "promotion", kind: "career", title: "Said edutamise", text: "Sind kutsutakse suurema vastutusega rolli. See tähendab uut karjääriastet ja 7% palgatõusu.", good: true, choices: [{ label: "Võtan uue rolli vastu", careerXp: CAREER_XP_PER_LEVEL, note: "Uus karjääriaste ja palk +7%." }] },
    { id: "project", kind: "career", title: "Projekt õnnestus", text: "Meeskond saab tulemuste eest boonuse ja sinu kogemus kasvab.", good: true, choices: [{ label: "Võtan boonuse vastu", account: 150, careerXp: 20, note: "+150 € ja kogemus +20." }] },
    { id: "offer", kind: "career", title: "Uus tööpakkumine", text: "Teine tööandja pakub 250 € kõrgemat kuupalka. Võid ka praeguses töös edasi areneda.", good: true, choices: [
      { label: "Võtan uue töö vastu (+250 € kuus)", income: 250, careerXp: 25, note: "Uus töö, palk +250 € kuus ja kogemus +25." },
      { label: "Jään praegusele tööle", careerXp: 10, note: "Jätkad tuttaval töökohal, kogemus +10." },
    ] },
    { id: "training", kind: "career", title: "Tööandja pakub koolitust", text: "Eriala koolitus maksab 200 € ja annab uue oskuse ning 30 kogemuspunkti.", good: true, choices: [
      { label: "Läbin koolituse (200 €)", account: -200, skills: 1, careerXp: 30, note: "Uus oskus ja kogemus +30." },
      { label: "Seekord ei osale", note: "Koolitusest seekord loobutud." },
    ] },
    { id: "workload", kind: "career", title: "Töökoormus kasvas", text: "Saad võtta lisaprojekti, mis toob raha ja kogemust, aga suurendab ka vaba aja kulusid.", good: false, choices: [
      { label: "Võtan lisaprojekti (+100 €)", account: 100, careerXp: 15, leisure: 15, note: "+100 €, kogemus +15 ja vaba aja kulu +15 €/kuu." },
      { label: "Jätan projekti vahele", note: "Hoiad oma vaba aega." },
    ] },
    { id: "jobloss", kind: "career", title: "Kaotasid töö", text: "Tööandja koondab sinu töökoha. Pead valima kiirema või rahaliselt kallima tööotsingu.", good: false, choices: [
      { label: "Võtan kiiresti väiksema palgaga töö (−10%)", income: -Math.round(l.income * 0.1), careerXp: 10, note: "Uus töö väiksema palgaga, kogemus +10." },
      { label: "Kasutan puhvrit ja leian sama palgaga töö (−1 kuupalk)", savings: -l.income, note: "Puhver kattis tööotsingu kuu." },
    ] },
    { id: "dentist", kind: "life", title: "Ootamatu hambaravi", text: "Hambaravi arve on 180 €.", good: false, choices: [
      { label: "Maksan kontolt", account: -180, note: "Hambaravi makstud." },
      { label: "Kasutan puhvrit", savings: -180, note: "Hambaravi kaeti puhvrist." },
    ] },
    { id: "phonebreak", kind: "life", title: "Telefon kukkus maha", text: "Ekraan on katki. Remont maksab 90 € ja uus telefon 450 €.", good: false, choices: [
      { label: "Parandan ekraani (90 €)", account: -90, note: "Telefon remonditi." },
      { label: "Ostan uue telefoni (450 €)", account: -450, note: "Ostsid uue telefoni." },
    ] },
    { id: "refund", kind: "money", title: "Said ootamatu tagasimakse", text: "Varem tasutud arvelt tuli 90 € tagasi.", good: true, choices: [{ label: "Tore!", account: 90, note: "+90 €." }] },
  );
  if (l.household.children > 0) {
    pool.push({ id: "schooltrip", kind: "life", title: "Lapse koolireis", text: "Koolireis ja varustus maksavad 60 €.", good: false, choices: [
      { label: "Maksan kontolt", account: -60, note: "Koolireis on kaetud." },
      { label: "Kasutan puhvrit", savings: -60, note: "Koolireis kaeti puhvrist." },
    ] });
    pool.push({ id: "childgift", kind: "life", title: "Pere väike rõõm", text: "Leidsid soodsalt pereürituse piletid ja said 40 € toetust.", good: true, choices: [{ label: "Tore!", account: 40, note: "+40 € pereürituse toetust." }] });
  }
  if (l.household.tuitionMonthly > 0) pool.push({ id: "studysuccess", kind: "career", title: "Õpingud lähevad hästi", text: "Said keeruka aine edukalt läbitud ja kogusid lisaks 15 kogemuspunkti.", good: true, choices: [{ label: "Suurepärane", careerXp: 15, note: "Õpingutest saadud kogemus +15." }] });
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function triggerEvent(forceId?: string) {
  updateLife((l) => {
    let ev = randomEvent(l);
    if (forceId) {
      for (let i = 0; i < 40 && ev?.id !== forceId; i++) ev = randomEvent(l);
    }
    l.pendingEvent = ev;
  });
}

export function resolveEvent(choice: EventChoice) {
  updateLife((l) => {
    const ev = l.pendingEvent;
    if (!ev) return;
    if (choice.account) {
      if (choice.account < 0) pay(l, -choice.account);
      else l.account += choice.account;
    }
    if (choice.savings) {
      const need = -choice.savings;
      const fromS = Math.min(l.savings, need);
      l.savings -= fromS;
      l.account -= need - fromS;
    }
    if (choice.income) l.income = Math.max(0, l.income + choice.income);
    if (choice.careerXp) gainCareer(l, choice.careerXp);
    if (choice.skills) l.skills += choice.skills;
    if (choice.leisure) l.expenses.leisure = Math.max(0, l.expenses.leisure + choice.leisure);
    if (ev.id === "fuel" && l.car) l.car.monthly += 25;
    if (ev.id === "rate") l.loans = l.loans.map((loan) => repriceLoan(loan, 0.005));
    if (ev.id === "crash") {
      l.investments *= 0.88;
      if (choice.label.startsWith("Müün")) {
        l.account += l.investments;
        l.investments = 0;
        l.investedPrincipal = 0;
        l.investMonthly = 0;
        l.lastInvestmentPerformance = null;
      }
    }
    const risky = l.lentLoans.find((x) => !x.written);
    if (ev.id === "friendpaid" && risky) l.lentLoans = l.lentLoans.filter((x) => x !== risky);
    if (ev.id === "friendlate" && choice.account && risky) risky.amount /= 2;
    addLog(l, `${ev.title} — ${choice.note}`);
    l.pendingEvent = null;
  });
}

export function advanceMonth() {
  updateLife((l) => {
    if (l.pendingEvent || !canAdvanceMonth(l)) return;
    l.months += 1;
    l.account += monthlyLeft(l);
    l.savings += l.saveMonthly;
    if (l.income > 0) gainCareer(l, Math.round(CAREER_XP_PER_LEVEL * 0.08));
    if (l.household.tuitionMonthsLeft > 0) {
      gainCareer(l, 3);
      l.household.tuitionMonthsLeft -= 1;
      if (l.household.tuitionMonthsLeft === 0) {
        l.household.tuitionMonthly = 0;
        addLog(l, "Õpingud lõppesid ja õppemaksud said otsa.");
      }
    }
    const openingInvestments = l.investments;
    const investment = investmentMonth(openingInvestments, l.investedPrincipal, l.investMonthly, 0.05 + (Math.random() - 0.5) * 0.3);
    l.investments = investment.value;
    l.investedPrincipal = investment.contributed;
    l.lastInvestmentPerformance = { month: l.months, ...investmentPerformance(openingInvestments, investment.value, l.investMonthly) };
    if (l.car) l.car.value = depreciate(l.car.value, 0.15, 1 / 12);
    if (l.home) l.home.value *= 1 + 0.02 / 12;
    l.properties.forEach((property) => { property.value *= 1 + 0.02 / 12; });
    l.loans = l.loans
      .map((x) => loanMonth(x).loan)
      .filter((x) => x.monthsLeft > 0 && x.balance > 0);
    l.lentLoans = l.lentLoans.filter((x) => {
      if (!x.written || l.months < (x.dueMonth ?? l.months)) return true;
      l.account += x.amount;
      addLog(l, `Lepinguga antud laen ${Math.round(x.amount)} € maksti tähtajaks tagasi.`);
      return false;
    });
    if (l.months % 12 === 0) {
      l.priceLevel = inflateAnnual(l.priceLevel);
      addLog(l, "Inflatsioon: elamiskulud tõusid 2%. Laenumaksed ja kokkulepitud õppemaks ei suurene inflatsiooniga.");
    }
    l.history.push(historyPoint(l));
    if (Math.random() < 0.4) l.pendingEvent = randomEvent(l);
  });
}

export function lendMoney(l: Life, amount: number, written: boolean, dueInMonths = 1) {
  pay(l, amount);
  l.lentLoans.push(written ? { id: uid(), amount, written: true, dueMonth: l.months + Math.max(1, Math.floor(dueInMonths)) } : { id: uid(), amount, written: false });
}

// Asking back: a contract loan is always repaid now; without one the borrower may pay all, half or nothing.
export function askLoanBack(l: Life, id: string, roll = Math.random()): number {
  const loan = l.lentLoans.find((x) => x.id === id);
  if (!loan) return 0;
  const back = loan.written || roll < 0.5 ? loan.amount : roll < 0.8 ? Math.round(loan.amount / 2) : 0;
  l.account += back;
  loan.amount -= back;
  if (loan.amount <= 0) l.lentLoans = l.lentLoans.filter((x) => x !== loan);
  addLog(l, back === 0 ? "Küsisid laenu tagasi, aga ei saanud midagi." : `Küsisid laenu tagasi ja said ${Math.round(back)} €.`);
  return back;
}
