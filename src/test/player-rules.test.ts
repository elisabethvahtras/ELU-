import { describe, expect, it } from "vitest";
import { isGoodDecisionReward, isIncomeValid, isPlayerAgeValid, MAX_PLAYER_AGE, MIN_PLAYER_AGE } from "@/lib/game/store";

describe("Mängija vanuse reegel", () => {
  it("14-aastane mängija on lubatud", () => {
    expect(MIN_PLAYER_AGE).toBe(14);
    expect(isPlayerAgeValid(14)).toBe(true);
    expect(isPlayerAgeValid(13)).toBe(false);
  });
  it("nullsissetulekuga saab alustada, negatiivsega mitte", () => {
    expect(isIncomeValid(0)).toBe(true);
    expect(isIncomeValid(-1)).toBe(false);
  });
  it("vanuse ülempiir on 130 aastat", () => {
    expect(MAX_PLAYER_AGE).toBe(130);
    expect(isPlayerAgeValid(130)).toBe(true);
    expect(isPlayerAgeValid(131)).toBe(false);
  });
  it("preemia tuleb iga 10 hea otsuse järel", () => {
    expect(isGoodDecisionReward(9)).toBe(false);
    expect(isGoodDecisionReward(10)).toBe(true);
    expect(isGoodDecisionReward(20)).toBe(true);
    expect(isGoodDecisionReward(0)).toBe(false);
  });
});
