import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { askLoanBack, lendMoney, advanceMonth, age, buyRental, canAdvanceMonth, createLife, fixedCosts, isLifeExpectancyValid, lifeNetWorth, monthlyLeft, pay, retainPreviousHome, sellRental, updateLife, useGame } from "./store";

describe("Life price level", () => {
  it("accepts a 100-year forecast horizon without permitting a target below current age", () => {
    expect(isLifeExpectancyValid(100, 22)).toBe(true);
    expect(isLifeExpectancyValid(21, 22)).toBe(false);
    expect(isLifeExpectancyValid(131, 22)).toBe(false);
  });
  it("initializes and persists the base price level for a new life", () => {
    createLife({
      character: 0,
      playerName: "Test player",
      age: 14,
      income: 0,
      job: "",
      housing: "parents",
      savings: 0,
      goal: "buffer",
      goalText: "",
    });

    const { result, unmount } = renderHook(() => useGame());
    const life = result.current.lives.find((entry) => entry.id === result.current.activeId);
    expect(life?.priceLevel).toBe(1);
    expect(life?.months).toBe(0);
    expect(life?.lifeExpectancy).toBe(100);

    const raw = localStorage.getItem("elu-plus-v1");
    if (raw === null) throw new Error("New life was not saved");
    const saved = JSON.parse(raw) as { lives: { id: string; priceLevel: number }[] };
    expect(saved.lives.find((entry) => entry.id === life?.id)?.priceLevel).toBe(1);
    unmount();
  });
});

function newTestLife(children = 0) {
  createLife({ character: 0, playerName: "Kuu test", age: 14, income: 1600, job: "", housing: "rent", savings: 1500, children, goal: "buffer", goalText: "" });
  const hook = renderHook(() => useGame());
  const current = () => {
    const life = hook.result.current.lives.find((entry) => entry.id === hook.result.current.activeId);
    if (!life) throw new Error("Test life missing");
    return life;
  };
  return { ...hook, current };
}

describe("Monthly accounting regressions", () => {
  it("does not grant an already reached starting-goal milestone on the first month", () => {
    const h = newTestLife();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(h.current().goalTarget).toBe(5000);
    expect(h.current().savings / h.current().goalTarget).toBe(0.3);
    expect(h.current().rewards).toHaveLength(0);

    act(() => advanceMonth());

    expect(h.current().months).toBe(1);
    expect(h.current().rewards).toHaveLength(0);
    random.mockRestore();
    h.unmount();
  });

  it("uus elu võib alustada kahe lapsega ja nende kulud on kohe arvestatud", () => {
    const h = newTestLife(2);
    expect(h.current().household.children).toBe(2);
    expect(monthlyLeft(h.current())).toBe(-135);
    h.unmount();
  });
  it("retains the previous residence and mortgage on a home change", () => {
    const h = newTestLife();
    act(() => updateLife((l) => { l.home = { kind: "flat", value: 90000 }; l.loans = [{ id: "old-home", label: "Kodulaen", balance: 30000, rate: 0, monthsLeft: 100, payment: 300 }]; retainPreviousHome(l); l.home = { kind: "house", value: 190000 }; }));
    expect(h.current().properties[0]?.value).toBe(90000);
    expect(h.current().properties[0]?.loanId).toBe("old-home");
    expect(h.current().properties[0]?.occupied).toBe(false);
    expect(h.current().loans[0]?.balance).toBe(30000);
    expect(h.current().home?.value).toBe(190000);
    h.unmount();
  });
  it("stops the simulation at 130 years without charging another month", () => {
    const h = newTestLife();
    act(() => updateLife((l) => { l.startAge = 130; }));
    const before = h.current().account;
    expect(canAdvanceMonth(h.current())).toBe(false);
    act(() => advanceMonth());
    expect(h.current().months).toBe(0);
    expect(age(h.current())).toBe(130);
    expect(h.current().account).toBe(before);
    h.unmount();
  });
  it("9000-eurose korteri kohta ei saa mängida 900000 eurot kuüüri", () => {
    const h = newTestLife();
    act(() => updateLife((l) => { l.account = 20000; l.savings = 0; buyRental(l, { name: "Väike korter", price: 9000, down: 9000, rent: 900000, costs: 50, rate: 0, months: 12, financed: false }); }));
    expect(h.current().properties[0]?.rent).toBe(135);
    h.unmount();
  });
  it("rental purchase, monthly income, vacancy and sale update cash and linked debt once", () => {
    const h = newTestLife();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    act(() => updateLife((l) => { l.account = 20000; l.savings = 0; buyRental(l, { name: "Korter", price: 10000, down: 2000, rent: 40, costs: 100, rate: 0, months: 80, financed: true }); }));
    expect(h.current().account).toBe(18000);
    expect(h.current().properties).toHaveLength(1);
    expect(h.current().loans[0]?.balance).toBe(8000);
    expect(lifeNetWorth(h.current())).toBe(20000);
    expect(monthlyLeft(h.current())).toBe(265);
    act(() => advanceMonth());
    expect(h.current().account).toBe(18265);
    expect(h.current().loans[0]?.balance).toBe(7900);
    act(() => updateLife((l) => { const property = l.properties[0]; if (property) property.occupied = false; }));
    expect(monthlyLeft(h.current())).toBe(225);
    const before = h.current().account;
    const value = h.current().properties[0]?.value;
    if (value === undefined) throw new Error("Property missing");
    act(() => updateLife((l) => { const property = l.properties[0]; if (property) sellRental(l, property.id); }));
    expect(h.current().account).toBeCloseTo(before + value - 7900);
    expect(h.current().properties).toHaveLength(0);
    expect(h.current().loans).toHaveLength(0);
    expect(h.current().home).toBeNull();
    random.mockRestore();
    h.unmount();
  });
  it("charges living costs and transfers savings and investments exactly once per month", () => {
    const h = newTestLife();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    act(() => updateLife((l) => { l.saveMonthly = 100; l.investMonthly = 50; }));
    expect(monthlyLeft(h.current())).toBe(275);
    act(() => advanceMonth());
    expect(h.current().account).toBe(1075);
    expect(h.current().savings).toBe(1600);
    expect(h.current().investedPrincipal).toBe(50);
    expect(h.current().investments).toBe(50);
    expect(h.current().lastInvestmentPerformance).toEqual({ month: 1, amount: 0, percent: null });
    act(() => advanceMonth());
    expect(h.current().lastInvestmentPerformance?.month).toBe(2);
    expect(h.current().lastInvestmentPerformance?.amount).toBeCloseTo(50 * 0.05 / 12);
    expect(h.current().lastInvestmentPerformance?.percent).toBeCloseTo(5 / 12);
    random.mockRestore();
    h.unmount();
  });

  it("raises living costs by 2% after twelve months without raising the salary for inflation", () => {
    const h = newTestLife();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    act(() => updateLife((l) => { l.months = 11; l.careerXp = 0; }));
    act(() => advanceMonth());
    expect(h.current().priceLevel).toBeCloseTo(1.02);
    expect(fixedCosts(h.current())).toBeCloseTo(1198.5);
    expect(h.current().income).toBe(1600);
    random.mockRestore();
    h.unmount();
  });

  it("does not increase savings withdrawals by the existing account overdraft", () => {
    const h = newTestLife();
    act(() => updateLife((l) => { l.account = -100; l.savings = 500; pay(l, 200); }));
    expect(h.current().account).toBe(-100);
    expect(h.current().savings).toBe(300);
    h.unmount();
  });
});
describe("Starting expenses", () => {
  it("uses the monthly costs the player entered at the start", () => {
    createLife({ character: 0, playerName: "Kulud", age: 20, income: 1000, job: "", housing: "rent", savings: 0, goal: "buffer", goalText: "", expenses: { housing: 500, food: 200, transport: 90, leisure: 60 } });
    const { result, unmount } = renderHook(() => useGame());
    const life = result.current.lives.find((e) => e.id === result.current.activeId);
    expect(life?.expenses).toEqual({ housing: 500, food: 200, transport: 90, phone: 25, leisure: 60 });
    unmount();
  });
});

describe("Lending money", () => {
  it("a contract loan is repaid in full on the due month", () => {
    const h = newTestLife();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    act(() => updateLife((l) => { l.account = 1000; lendMoney(l, 400, true, 1); }));
    const before = h.current().account;
    act(() => advanceMonth());
    expect(h.current().account).toBe(before + monthlyLeft(h.current()) + 400);
    expect(h.current().lentLoans).toHaveLength(0);
    random.mockRestore();
    h.unmount();
  });
  it("allows several loans and asking a contract loan back returns it in full", () => {
    const h = newTestLife();
    act(() => updateLife((l) => { l.account = 1000; lendMoney(l, 300, true, 6); lendMoney(l, 200, false); }));
    expect(h.current().lentLoans).toHaveLength(2);
    expect(h.current().account).toBe(500);
    const id = h.current().lentLoans[0]?.id ?? "";
    act(() => updateLife((l) => { askLoanBack(l, id, 0.99); }));
    expect(h.current().account).toBe(800);
    expect(h.current().lentLoans).toHaveLength(1);
    const risky = h.current().lentLoans[0]?.id ?? "";
    act(() => updateLife((l) => { askLoanBack(l, risky, 0.9); }));
    expect(h.current().account).toBe(800);
    expect(h.current().lentLoans[0]?.amount).toBe(200);
    h.unmount();
  });
});
