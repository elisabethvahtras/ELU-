import { describe, expect, it } from "vitest";
import { projectWealth, type Scenario } from "./finance";

describe("Tuleviku miinuse kontroll", () => {
  for (const scenario of ["bad", "base", "good"] as Scenario[]) {
    it(`${scenario}: nullkulud ja nullsissetulek säilitavad 100-aastaseni 1000 €`, () => {
      const result = projectWealth({ account: 1000, savings: 0, investments: 0, income: 0, saveMonthly: 0, investMonthly: 0, months: 0, livingCosts: 0, tuition: 0, tuitionMonthsLeft: 0, loans: [], carValue: 0, homeValue: 0 }, (100 - 22) * 12, scenario);
      expect(result.nw).toBe(1000);
      expect(result.cash).toBe(1000);
      expect(result.debt).toBe(0);
    });
  }
  it("püsiv palk ja inflatsiooniga kasvavad kulud võivad tekitada puudujäägi ilma laenuta", () => {
    const result = projectWealth({ account: 800, savings: 1500, investments: 0, income: 1600, saveMonthly: 0, investMonthly: 0, months: 0, livingCosts: 1175, tuition: 0, tuitionMonthsLeft: 0, loans: [], carValue: 0, homeValue: 0 }, 936, "base");
    let expected = 2300;
    for (let year = 0; year < 78; year++) expected += 12 * (1600 - 1175 * 1.02 ** year);
    expect(result.nw).toBeCloseTo(expected);
    expect(result.nw).toBeLessThan(-1_000_000);
    expect(result.debt).toBe(0);
  });
});