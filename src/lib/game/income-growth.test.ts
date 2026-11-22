import { describe, expect, it } from "vitest";
import { forecastCashFlow, projectWealth } from "./finance";

describe("Prognoosi palgakasv", () => {
  const input = { account: 800, savings: 1500, investments: 0, income: 1600, incomeGrowthRate: 0.02, livingCosts: 1175, tuition: 0, tuitionMonthsLeft: 0, months: 0, loans: [], saveMonthly: 0, investMonthly: 0, carValue: 0, homeValue: 0 };
  it("praegune ülejääk ei muutu ainult inflatsiooni tõttu 100-aastaselt puudujäägiks", () => {
    const result = projectWealth(input, 936, "base");
    let expected = 2300;
    for (let year = 0; year < 78; year++) expected += 12 * 425 * 1.02 ** year;
    expect(result.nw).toBeCloseTo(expected);
    expect(result.nw).toBeGreaterThan(0);
    const flow = forecastCashFlow(input, 936);
    expect(flow.firstDeficitMonth).toBeNull();
    expect(flow.lastLeft).toBeCloseTo(425 * 1.02 ** 77);
  });
  it("kasvatab palka ja kulusid pärast aastapiiri, mitte esimeses kuus", () => {
    const result = projectWealth({ ...input, months: 11 }, 2, "base");
    expect(result.cash).toBeCloseTo(800 + 425 + 425 * 1.02);
  });
});