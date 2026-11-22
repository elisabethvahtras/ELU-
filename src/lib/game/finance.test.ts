import { describe, expect, it } from "vitest";
import { addCareerExperience, basketSavings, canAffordCost, careerActionAvailable, clampRent, compareCar, compareHome, friendLoanAmount, householdMonthlyCost, inflateAnnual, investmentMonth, investmentPerformance, investmentPlan, loanMonth, loanPayment, maxMonthlyRent, monthlyFuelCost, projectFinances, projectWealth, rentYieldPct, repriceLoan, studyDuration } from "./finance";

describe("ELU+ finantsmootor", () => {
  it("karjääritegevust saab teha ainult kord mängukuu jooksul", () => {
    expect(careerActionAvailable(0, null)).toBe(true);
    expect(careerActionAvailable(0, 0)).toBe(false);
    expect(careerActionAvailable(1, 0)).toBe(true);
  });
  it("automaatne palgakasv lõpeb kuuendal karjääritasemel", () => {
    expect(addCareerExperience(2000, 6, 0, 10000)).toEqual({ income: 2000, level: 6, xp: 0 });
    expect(addCareerExperience(2000, 5, 95, 8)).toEqual({ income: 2140, level: 6, xp: 0 });
    let career = { income: 1600, level: 1, xp: 0 };
    for (let month = 0; month < 78 * 12; month++) career = addCareerExperience(career.income, career.level, career.xp, 8);
    expect(career.income).toBe(2244);
    expect(career.level).toBe(6);
  });
  it("100-aastaseks projekteeritud vara sisaldab tänast ostujõudu", () => {
    const result = projectWealth({ account: 10000, savings: 0, investments: 0, income: 0, saveMonthly: 0, investMonthly: 0, months: 0, livingCosts: 0, tuition: 0, tuitionMonthsLeft: 0, loans: [], carValue: 0, homeValue: 0 }, (100 - 22) * 12, "base");
    expect(result.nw).toBe(10000);
    expect(result.realWorth).toBeCloseTo(10000 / Math.pow(1.02, 78));
  });
  it("intressimuutus tõstab aastaintressi ja arvutab kuumakse uuesti", () => {
    const loan = repriceLoan({ balance: 100000, rate: 0.045, payment: 500, monthsLeft: 240 }, 0.005);
    expect(loan.rate).toBeCloseTo(0.05);
    expect(loan.payment).toBeCloseTo(loanPayment(100000, 0.05, 240));
    expect(loan.balance).toBe(100000);
  });
  it("auto näide: 15 000 €, 10 aastat, baas 5%", () => {
    const [a, b, c] = compareCar(20000, { price: 15000, downPayment: 15000, loanRate: 0, loanMonths: 0, carMonthly: 210, altMonthly: 65, depreciation: 0.15 }, 10, "base", 0);
    expect(Math.round(a!.assetValue)).toBe(2953);
    expect(a!.totalCost).toBe(25200);
    expect(b!.totalCost).toBe(7800);
    expect(Math.round(c!.investments)).toBe(24433);
  });
  it("kütusekulu = (km/100) × l/100km × €/l", () => {
    expect(monthlyFuelCost(1000, 6, 1.7)).toBeCloseTo(102);
  });
  it("kliendikaardi näide 30,00 vs 28,80, 4 ostu kuus", () => {
    expect(basketSavings(30, 28.8, 4)).toEqual({ perBasket: 1.2, month: 4.8, year: 57.6, tenYears: 576 });
  });
  it("annuiteetlaen 0% intressiga jagub võrdselt", () => {
    expect(loanPayment(1200, 0, 12)).toBe(100);
  });
  it("investeerimise sissemakse ja turutootlus püsivad eraldi", () => {
    expect(investmentMonth(1000, 900, 100, 0.12)).toEqual({ value: 1110, contributed: 1000 });
    expect(investmentMonth(1000, 900, 100, 0)).toEqual({ value: 1100, contributed: 1000 });
  });
  it("kuu tootlus protsent ei pea uut 100 € sissemakset kasumiks", () => {
    expect(investmentPerformance(1000, 1110, 100)).toEqual({ amount: 10, percent: 1 });
    expect(investmentPerformance(1000, 900)).toEqual({ amount: -100, percent: -10 });
    expect(investmentPerformance(0, 100, 100)).toEqual({ amount: 0, percent: null });
  });
  it("100 karjäärikogemuse punkti annab uue taseme ja 7% palgatõusu", () => {
    expect(addCareerExperience(1000, 1, 95, 8)).toEqual({ income: 1070, level: 2, xp: 3 });
    expect(addCareerExperience(1000, 1, 20, 30)).toEqual({ income: 1000, level: 1, xp: 50 });
  });
  it("partner, kaks last ja ülikool maksavad kokku 1100 € kuus", () => {
    expect(householdMonthlyCost(2, 2, 300)).toBe(1100);
    expect(householdMonthlyCost(1, 0, 0)).toBe(0);
  });
  it("2% inflatsioon tõstab hindu iga aasta", () => {
    expect(inflateAnnual(1000)).toBeCloseTo(1020);
    expect(inflateAnnual(inflateAnnual(1000))).toBeCloseTo(1040.4);
  });
  it("sõbrale ei saa laenata rohkem kui küsitud 1500 €", () => {
    expect(friendLoanAmount("less", 5000)).toBe(1500);
    expect(friendLoanAmount("less", 400)).toBe(400);
    expect(friendLoanAmount("written", 400)).toBe(1500);
    expect(friendLoanAmount("no", 1500)).toBe(0);
  });
  it("ühekordne 500 € investeering ei käivita 50 € kuumakset", () => {
    expect(investmentPlan("invest", 500, 50, 0)).toEqual({ upfront: 500, monthly: 0 });
    expect(investmentPlan("invest", 500, 50, 100)).toEqual({ upfront: 500, monthly: 100 });
  });
  it("kuumakse muutmine asendab vana summa ja null peatab maksed", () => {
    expect(investmentPlan("monthly", 500, 75, 50)).toEqual({ upfront: 0, monthly: 75 });
    expect(investmentPlan("monthly", 500, 0, 50)).toEqual({ upfront: 0, monthly: 0 });
  });
  it("viimane laenumakse ei võta kontolt rohkem kui 50 € jääk", () => {
    const result = loanMonth({ balance: 50, rate: 0, payment: 100, monthsLeft: 1 });
    expect(result.payment).toBe(50);
    expect(result.loan.balance).toBe(0);
  });
  it("tulevikus lõppevad õppemaks ja laen ega kandu järgmisse kuusse", () => {
    const result = projectFinances({ account: 0, savings: 0, investments: 0, income: 1000, saveMonthly: 100, investMonthly: 50, months: 0, livingCosts: 400, tuition: 120, tuitionMonthsLeft: 1, loans: [{ balance: 50, rate: 0, payment: 100, monthsLeft: 1 }] }, 2, 0);
    expect(result).toEqual({ cash: 730, sav: 200, inv: 100, debt: 0 });
  });
  it("tulevikuprognoos arvestab 2% inflatsiooni ka pärast kaheteistkümnendat kuud", () => {
    const result = projectFinances({ account: 0, savings: 0, investments: 0, income: 1000, saveMonthly: 0, investMonthly: 0, months: 11, livingCosts: 400, tuition: 0, tuitionMonthsLeft: 0, loans: [] }, 2, 0);
    expect(result.cash).toBe(1192);
  });
  it("konto miinus ei takista tasuta eelarvemuudatust ega maksete peatamist", () => {
    expect(canAffordCost(-100, 0)).toBe(true);
    expect(canAffordCost(-100, 50)).toBe(false);
  });
  it("leibkonna muutmine ei alusta käimasolevat 12-kuulist õpet uuesti", () => {
    expect(studyDuration(120, 120, 11, 12)).toBe(11);
    expect(studyDuration(300, 120, 11, 24)).toBe(24);
    expect(studyDuration(0, 120, 11, 0)).toBe(0);
  });
  it("võrdluse kuukulu ei sisalda juba lõppenud auto- ega kodulaenu", () => {
    const car = compareCar(20000, { price: 12000, downPayment: 6000, loanRate: 0, loanMonths: 12, carMonthly: 200, altMonthly: 65, depreciation: 0.15 }, 1, "base", 0)[0];
    const home = compareHome(20000, { price: 12000, downPayment: 6000, rate: 0, months: 12, ownMonthly: 200, rent: 400 }, 1, "base", 0)[0];
    expect(car?.monthly).toBe(200);
    expect(home?.monthly).toBe(200);
  });
  it("9000-eurose korteri üüritulu piirdub objekti hinnaga", () => {
    expect(maxMonthlyRent(9000)).toBe(135);
    expect(clampRent(900000, 9000)).toBe(135);
    expect(clampRent(60, 9000)).toBe(60);
    expect(rentYieldPct(135, 9000)).toBeCloseTo(1.5);
  });
});
