import { describe, expect, it } from "vitest";
import { sceneUnlocks } from "./scene";

describe("Elupildi areng", () => {
  it("veerandi saavutamisel lisandub puu", () => {
    expect(sceneUnlocks(0.24, []).tree).toBe(false);
    expect(sceneUnlocks(0.25, []).tree).toBe(true);
  });
  it("poole saavutamisel lisandub pink", () => {
    expect(sceneUnlocks(0.49, []).bench).toBe(false);
    expect(sceneUnlocks(0.5, []).bench).toBe(true);
  });
  it("kolmveerandi saavutamisel lisanduvad lilled", () => {
    expect(sceneUnlocks(0.74, []).flowers).toBe(false);
    expect(sceneUnlocks(0.75, []).flowers).toBe(true);
  });
  it("kogu eesmärgi saavutamisel avaneb eesmärgi ese", () => {
    expect(sceneUnlocks(0.99, []).goal).toBe(false);
    expect(sceneUnlocks(1, []).goal).toBe(true);
  });
  it("teenitud kaunistused säilivad ka säästude kasutamisel", () => {
    expect(sceneUnlocks(0, [25, 50, 75, 100])).toEqual({ tree: true, bench: true, flowers: true, goal: true });
  });
});