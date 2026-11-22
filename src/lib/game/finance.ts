// Pure finance engine for ELU+. All amounts in euros.

export type Scenario = "bad" | "base" | "good";
export const INVEST_RATES: Record<Scenario, number> = { bad: -0.03, base: 0.05, good: 0.08 };
export const HOME_RATES: Record<Scenario, number> = { bad: -0.02, base: 0.02, good: 0.04 };
export const SCENARIO_LABEL: Record<Scenario, string> = { bad: "Ebasoodne", base: "Baas", good: "Soodne" };

/** Annuity monthly payment. rate = annual nominal, e.g. 0.06 */
export function loanPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Remaining balance after k payments. */
export function loanBalanceAfter(principal: number, annualRate: number, months: number, k: number): number {
  if (k >= months) return 0;
  const r = annualRate / 12;
  const p = loanPayment(principal, annualRate, months);
  if (r === 0) return Math.max(0, principal - p * k);
  return Math.max(0, principal * Math.pow(1 + r, k) - (p * (Math.pow(1 + r, k) - 1)) / r);
}

export function loanTotalRepay(principal: number, annualRate: number, months: number, fee = 0): number {
  return loanPayment(principal, annualRate, months) * months + fee;
}

/** (km per month / 100) × l/100km × €/l */
export function monthlyFuelCost(kmPerMonth: number, litersPer100: number, pricePerLiter: number): number {
  return (kmPerMonth / 100) * litersPer100 * pricePerLiter;
}

export function depreciate(value: number, annualRate: number, years: number): number {
  return value * Math.pow(1 - annualRate, years);
}

export function grow(value: number, annualRate: number, years: number): number {
  return value * Math.pow(1 + annualRate, years);
}

/** Future value of monthly contributions with monthly compounding. */
export function growMonthly(monthly: number, annualRate: number, years: number): number {
  const n = years * 12;
  const r = annualRate / 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r);
}

/** One investment month: growth applies to the opening value, then the new contribution is added. */
export function investmentMonth(value: number, contributed: number, monthlyContribution: number, annualRate: number) {
  return {
    value: value * (1 + annualRate / 12) + monthlyContribution,
    contributed: contributed + monthlyContribution,
  };
}

/** Market result only: fresh contributions are not investment profit. */
export function investmentPerformance(openingValue: number, closingValue: number, contributions = 0) {
  const amount = closingValue - openingValue - contributions;
  return { amount, percent: openingValue > 0 ? (amount / openingValue) * 100 : null };
}

export const CAREER_XP_PER_LEVEL = 100;
export const CAREER_PROMOTION_RAISE = 0.07;
export const MAX_CAREER_LEVEL = 6;

/** Add experience and promote once per completed 100 XP, with a 7% raise per level. */
export function addCareerExperience(income: number, level: number, xp: number, amount: number) {
  let nextIncome = income;
  let nextLevel = Math.min(level, MAX_CAREER_LEVEL);
  let nextXp = xp + amount;
  while (nextXp >= CAREER_XP_PER_LEVEL && nextLevel < MAX_CAREER_LEVEL) {
    nextXp -= CAREER_XP_PER_LEVEL;
    nextLevel += 1;
    nextIncome = Math.round(nextIncome * (1 + CAREER_PROMOTION_RAISE));
  }
  if (nextLevel >= MAX_CAREER_LEVEL) nextXp = 0;
  return { income: nextIncome, level: nextLevel, xp: nextXp };
}

export function householdMonthlyCost(adults: number, children: number, tuitionMonthly: number) {
  return Math.max(0, adults - 1) * 240 + Math.max(0, children) * 280 + Math.max(0, tuitionMonthly);
}
export function partnerContribution(household: { adults: number; partnerIncome?: number }) {
  return household.adults > 1 ? Math.max(0, household.partnerIncome ?? 0) : 0;
}
export function partnerMonthlyCost(household: { adults: number; partnerCosts?: number }) {
  return household.adults > 1 ? Math.max(0, household.partnerCosts ?? 240) : 0;
}

export const ANNUAL_INFLATION = 0.02;
export const inflateAnnual = (value: number) => value * (1 + ANNUAL_INFLATION);

/** A one-off purchase never starts or changes a recurring payment. */
export function investmentPlan(mode: "invest" | "monthly", lump: number, monthly: number, currentMonthly: number) {
  return { upfront: mode === "invest" ? lump : 0, monthly: mode === "monthly" ? monthly : currentMonthly };
}

export const canAffordCost = (cash: number, upfront: number) => upfront <= 0 || cash >= upfront;

export function studyDuration(tuition: number, currentTuition: number, monthsLeft: number, newDuration: number) {
  return tuition > 0 && tuition === currentTuition ? monthsLeft : newDuration;
}

export type RentalProperty = { id: string; name: string; price: number; value: number; rent: number; costs: number; occupied: boolean; loanId: string | null };
export const rentalIncome = (properties: RentalProperty[]) => properties.reduce((sum, property) => sum + (property.occupied ? property.rent : 0), 0);
export const rentalCosts = (properties: RentalProperty[]) => properties.reduce((sum, property) => sum + property.costs, 0);
export const propertyValue = (properties: RentalProperty[]) => properties.reduce((sum, property) => sum + property.value, 0);
export const propertySaleProceeds = (value: number, balance: number) => value - balance;
// A flat rented for more than 1.5% of its price per month is not a real rental deal.
export const MAX_RENT_YIELD = 0.015;
export const maxMonthlyRent = (price: number) => Math.max(0, Math.round(price * MAX_RENT_YIELD * 100) / 100);
export const clampRent = (rent: number, price: number) => Math.min(Math.max(0, rent), maxMonthlyRent(price));
export const rentYieldPct = (rent: number, price: number) => (price > 0 ? (rent / price) * 100 : 0);
export const careerActionAvailable = (month: number, lastMonth: number | null) => month !== lastMonth;
export function repriceLoan<T extends { balance: number; rate: number; payment: number; monthsLeft: number }>(loan: T, increase: number) {
  const rate = loan.rate + increase;
  return { ...loan, rate, payment: loanPayment(loan.balance, rate, loan.monthsLeft) };
}

/** The last instalment cannot exceed the remaining principal and interest. */
export function loanMonth<T extends { balance: number; rate: number; payment: number; monthsLeft: number }>(loan: T) {
  const due = loan.balance * (1 + loan.rate / 12);
  const payment = loan.monthsLeft <= 1 ? due : Math.min(loan.payment, due);
  return { payment: Math.max(0, payment), loan: { ...loan, balance: Math.max(0, due - payment), monthsLeft: Math.max(0, loan.monthsLeft - 1) } };
}

export function payFromCash(account: number, savings: number, amount: number) {
  const fromAccount = Math.min(Math.max(0, account), Math.max(0, amount));
  return { account: account - fromAccount, savings: savings - (Math.max(0, amount) - fromAccount) };
}

export type ProjectionInput = {
  account: number; savings: number; investments: number; income: number;
  saveMonthly: number; investMonthly: number; months: number;
  livingCosts: number; tuition: number; tuitionMonthsLeft: number;
  rentalIncome?: number;
  incomeGrowthRate?: number;
  loans: { balance: number; rate: number; payment: number; monthsLeft: number }[];
};

/** Explains the monthly flow using the same inflation and expiring payment timing as the forecast. */
export function forecastCashFlow(input: ProjectionInput, monthsAhead: number) {
  let costs = input.livingCosts;
  let income = input.income;
  let tuitionMonths = input.tuitionMonthsLeft;
  let loans = input.loans.map((loan) => ({ ...loan }));
  let firstDeficitMonth: number | null = null;
  let lastLeft = input.income + (input.rentalIncome ?? 0) - costs - (tuitionMonths > 0 ? input.tuition : 0) - loans.reduce((sum, loan) => sum + loanMonth(loan).payment, 0) - input.saveMonthly - input.investMonthly;
  let lastCosts = costs;
  for (let i = 0; i < monthsAhead; i++) {
    const payments = loans.map(loanMonth);
    lastCosts = costs;
    lastLeft = income + (input.rentalIncome ?? 0) - costs - (tuitionMonths > 0 ? input.tuition : 0) - payments.reduce((sum, entry) => sum + entry.payment, 0) - input.saveMonthly - input.investMonthly;
    if (lastLeft < 0 && firstDeficitMonth === null) firstDeficitMonth = i + 1;
    loans = payments.map((entry) => entry.loan).filter((loan) => loan.monthsLeft > 0 && loan.balance > 0);
    tuitionMonths = Math.max(0, tuitionMonths - 1);
    if ((input.months + i + 1) % 12 === 0) {
      costs = inflateAnnual(costs);
      income *= 1 + (input.incomeGrowthRate ?? 0);
    }
  }
  return { firstDeficitMonth, lastLeft, lastCosts };
}

/** Same end-of-month cash timing as the game, without events or assumed raises. */
export function projectFinances(input: ProjectionInput, monthsAhead: number, annualRate: number) {
  let account = input.account;
  let savings = input.savings;
  let investments = input.investments;
  let costs = input.livingCosts;
  let income = input.income;
  let tuitionMonths = input.tuitionMonthsLeft;
  let loans = input.loans.map((loan) => ({ ...loan }));
  for (let i = 0; i < monthsAhead; i++) {
    const payments = loans.map(loanMonth);
    account += income + (input.rentalIncome ?? 0) - costs - (tuitionMonths > 0 ? input.tuition : 0) - payments.reduce((sum, entry) => sum + entry.payment, 0) - input.saveMonthly - input.investMonthly;
    savings += input.saveMonthly;
    investments = investmentMonth(investments, 0, input.investMonthly, annualRate).value;
    loans = payments.map((entry) => entry.loan).filter((loan) => loan.monthsLeft > 0 && loan.balance > 0);
    tuitionMonths = Math.max(0, tuitionMonths - 1);
    if ((input.months + i + 1) % 12 === 0) {
      costs = inflateAnnual(costs);
      income *= 1 + (input.incomeGrowthRate ?? 0);
    }
  }
  return { cash: account, sav: savings, inv: investments, debt: loans.reduce((sum, loan) => sum + loan.balance, 0) };
}

export function friendLoanAmount(mode: "all" | "less" | "written" | "no", amount: number) {
  if (mode === "no") return 0;
  if (mode === "less") return Math.max(0, Math.min(1500, amount));
  return 1500;
}

/** Wealth and its purchasing power in euros of the forecast's starting month. */
export function projectWealth(input: ProjectionInput & { carValue: number; homeValue: number }, monthsAhead: number, scenario: Scenario) {
  const result = projectFinances(input, monthsAhead, INVEST_RATES[scenario]);
  const years = monthsAhead / 12;
  const assets = depreciate(input.carValue, 0.15, years) + grow(input.homeValue, HOME_RATES[scenario], years);
  const nw = result.cash + result.sav + result.inv + assets - result.debt;
  return { ...result, assets, nw, realWorth: nw / Math.pow(1 + ANNUAL_INFLATION, years) };
}

export function netWorth(p: { account: number; savings: number; investments: number; assets: number; debts: number }) {
  return p.account + p.savings + p.investments + p.assets - p.debts;
}

export function basketSavings(withoutCard: number, withCard: number, basketsPerMonth: number) {
  const perBasket = Math.round((withoutCard - withCard) * 100) / 100;
  const month = Math.round(perBasket * basketsPerMonth * 100) / 100;
  return { perBasket, month, year: Math.round(month * 12 * 100) / 100, tenYears: Math.round(month * 120 * 100) / 100 };
}

export type BasketItem = { id: string; name: string; quantity: number; price: number; cardPrice: number | null; sourceUrl?: string; checkedOn?: string };
export type ShoppingBasket = { items: BasketItem[]; perMonth: number; useCard: boolean };

/** Missing card offers use the regular price; quantities apply to both prices. */
export function shoppingTotals(basket: ShoppingBasket) {
  const money = (n: number) => Math.round(n * 100) / 100;
  const withoutCard = money(basket.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const withCard = money(basket.items.reduce((sum, item) => sum + (item.cardPrice ?? item.price) * item.quantity, 0));
  const selected = basket.useCard ? withCard : withoutCard;
  return { withoutCard, withCard, selected, ...basketSavings(withoutCard, selected, basket.perMonth) };
}

export type CompareColumn = {
  key: string;
  title: string;
  cash: number;
  monthly: number;
  totalCost: number;
  investments: number;
  assetValue: number;
  loanBalance: number;
  netWorth: number;
  goalGap: number;
};

export type CarInput = {
  price: number;
  downPayment: number; // = price when bought outright
  loanRate: number;
  loanMonths: number;
  carMonthly: number; // fuel+insurance+service+parking
  altMonthly: number;
  depreciation: number; // 0.15
};

/** Three lives for the car decision, all from the same starting money. */
export function compareCar(start: number, c: CarInput, years: number, scenario: Scenario, goalTarget: number): CompareColumn[] {
  const m = years * 12;
  const r = INVEST_RATES[scenario];
  const principal = Math.max(0, c.price - c.downPayment);
  const pay = loanPayment(principal, c.loanRate, c.loanMonths);
  const paidMonths = Math.min(m, c.loanMonths);
  const bal = loanBalanceAfter(principal, c.loanRate, c.loanMonths, m);
  const asset = depreciate(c.price, c.depreciation, years);
  const aCost = c.carMonthly * m + pay * paidMonths;
  const aCash = start - c.downPayment - aCost;
  const bCost = c.altMonthly * m;
  const bCash = start - bCost;
  const cInvest = grow(c.downPayment, r, years);
  const cCash = start - c.downPayment - bCost;
  const mk = (key: string, title: string, cash: number, monthly: number, totalCost: number, inv: number, assetV: number, loan: number): CompareColumn => {
    const nw = cash + inv + assetV - loan;
    return { key, title, cash, monthly, totalCost, investments: inv, assetValue: assetV, loanBalance: loan, netWorth: nw, goalGap: Math.max(0, goalTarget - (cash + inv)) };
  };
  return [
    mk("A", "Ostan auto", aCash, c.carMonthly + (m < c.loanMonths ? pay : 0), aCost, 0, asset, bal),
    mk("B", "Ei osta, muu transport", bCash, c.altMonthly, bCost, 0, 0, 0),
    mk("C", "Ei osta, investeerin", cCash, c.altMonthly, bCost, cInvest, 0, 0),
  ];
}

export type HomeInput = { price: number; downPayment: number; rate: number; months: number; ownMonthly: number; rent: number };

export function compareHome(start: number, h: HomeInput, years: number, scenario: Scenario, goalTarget: number): CompareColumn[] {
  const m = years * 12;
  const principal = Math.max(0, h.price - h.downPayment);
  const pay = loanPayment(principal, h.rate, h.months);
  const paid = Math.min(m, h.months);
  const bal = loanBalanceAfter(principal, h.rate, h.months, m);
  const asset = grow(h.price, HOME_RATES[scenario], years);
  const aCost = h.ownMonthly * m + pay * paid;
  const aCash = start - h.downPayment - aCost;
  const bCost = h.rent * m;
  const inv = grow(h.downPayment, INVEST_RATES[scenario], years);
  const col = (key: string, title: string, cash: number, monthly: number, cost: number, i: number, a: number, l: number): CompareColumn => ({
    key, title, cash, monthly, totalCost: cost, investments: i, assetValue: a, loanBalance: l, netWorth: cash + i + a - l, goalGap: Math.max(0, goalTarget - (cash + i + a - l)),
  });
  return [
    col("A", "Ostan kodu", aCash, h.ownMonthly + (m < h.months ? pay : 0), aCost, 0, asset, bal),
    col("B", "Jätkan üürimist", start - bCost, h.rent, bCost, 0, 0, 0),
    col("C", "Üürin ja investeerin", start - h.downPayment - bCost, h.rent, bCost, inv, 0, 0),
  ];
}

export const eur = (n: number, digits = 0) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
