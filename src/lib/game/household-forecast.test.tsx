import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { forecastCashFlow, partnerContribution, projectWealth } from "./finance";
import { createLife, householdIncome, monthlyLeft, updateLife, useLife, type Life } from "./store";

describe("Partner ja prognoosi rahavoog", () => {
  it("partneri 0 € panus on lubatud ja üksi elades ei arvestata partneri panust", () => {
    expect(partnerContribution({ adults: 2, partnerIncome: 0 })).toBe(0);
    expect(partnerContribution({ adults: 1, partnerIncome: 500 })).toBe(0);
  });
  it("500 € panust lisandub igasse kuusse, mitte mängija isiklikule palgale", () => {
    act(() => createLife({ character: 0, playerName: "Partner", age: 22, income: 1600, job: "", housing: "rent", savings: 0, goal: "buffer", goalText: "" }));
    let life: Life | null = null;
    function Probe() { life = useLife(); return null; }
    render(<Probe />);
    act(() => updateLife((current) => { current.household = { ...current.household, adults: 2, partnerIncome: 500, partnerCosts: 100 }; }));
    const verify = (current: Life | null) => {
      if (!current) throw new Error("Missing life");
      expect(current.income).toBe(1600);
      expect(householdIncome(current)).toBe(2100);
      expect(monthlyLeft(current)).toBe(825);
    };
    verify(life);
  });
  it("praegune 425 € ülejääk muutub 17. aastal inflatsiooni tõttu puudujäägiks", () => {
    const flow = forecastCashFlow({ account: 0, savings: 0, investments: 0, income: 1600, livingCosts: 1175, tuition: 0, tuitionMonthsLeft: 0, months: 0, loans: [], saveMonthly: 0, investMonthly: 0 }, 936);
    expect(flow.firstDeficitMonth).toBe(193);
    expect(flow.lastCosts).toBeCloseTo(1175 * 1.02 ** 77);
    expect(flow.lastLeft).toBeCloseTo(1600 - 1175 * 1.02 ** 77);
  });
  it("stsenaariumid muudavad investeeringut ja kinnisvara, mitte sularaha", () => {
    const input = { account: 1000, savings: 0, investments: 10000, income: 0, livingCosts: 0, tuition: 0, tuitionMonthsLeft: 0, months: 0, loans: [], saveMonthly: 0, investMonthly: 0, carValue: 0, homeValue: 100000 };
    const bad = projectWealth(input, 120, "bad");
    const base = projectWealth(input, 120, "base");
    const good = projectWealth(input, 120, "good");
    expect(bad.nw).toBeLessThan(base.nw);
    expect(base.nw).toBeLessThan(good.nw);
    expect(bad.cash).toBe(good.cash);
  });
});