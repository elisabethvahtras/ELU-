import { describe, expect, it } from "vitest";
import { DEMO_DURATION_SECONDS, DEMO_STEPS, demoForecast, demoLife, demoStepAt } from "./demo";

describe("Juhendatud demo", () => {
  it("kestab täpselt kaks minutit ja viimane samm mahub selle sisse", () => {
    expect(DEMO_DURATION_SECONDS).toBe(120);
    expect(DEMO_STEPS.at(-1)?.start).toBe(116);
    expect(demoStepAt(119)).toBe(11);
    expect(demoStepAt(120)).toBe(11);
  });
  it("läbib investeerimise ja riskid enne tulevikku", () => {
    expect(DEMO_STEPS[demoStepAt(60)]?.kind).toBe("invest");
    expect(DEMO_STEPS[demoStepAt(72)]?.kind).toBe("risk");
    expect(DEMO_STEPS[demoStepAt(80)]?.kind).toBe("lend");
    expect(DEMO_STEPS[demoStepAt(90)]?.kind).toBe("month");
    expect(DEMO_STEPS[demoStepAt(98)]?.kind).toBe("future40");
    expect(DEMO_STEPS[demoStepAt(108)]?.kind).toBe("future65");
  });
  it("näidiselud on eraldatud ega jaga muudetavaid andmeid", () => {
    const first = demoLife();
    first.account = 0;
    first.expenses.food = 0;
    expect(demoLife().account).toBe(800);
    expect(demoLife().expenses.food).toBe(320);
    expect(demoLife().investMonthly).toBe(0);
    expect(demoLife(true).investMonthly).toBe(100);
  });
  it("näitab sama 100 € plaani mõju 40- ja 65-aastaselt", () => {
    const at40 = demoForecast(40);
    const at65 = demoForecast(65);
    expect(at40.sav).toBe(1500);
    expect(at65.sav).toBe(1500);
    expect(at40.inv).toBeCloseTo(34920.20, 2);
    expect(at65.inv).toBeGreaterThan(at40.inv);
  });
});