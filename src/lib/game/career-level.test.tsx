import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createLife, setCareerLevel, updateLife, useLife, type Life } from "./store";

describe("Praeguse karjääritaseme määramine", () => {
  it("lubab olemasoleva 3. taseme määrata ilma palka või raha juurde andmata", () => {
    act(() => createLife({ character: 0, playerName: "Tase", age: 22, income: 1600, job: "", housing: "rent", savings: 0, goal: "buffer", goalText: "" }));
    let current: Life | null = null;
    function Probe() { current = useLife(); return null; }
    render(<Probe />);
    act(() => updateLife((life) => { life.careerXp = 70; setCareerLevel(life, 3); }));
    expect(current).toMatchObject({ careerLevel: 3, careerXp: 0, income: 1600, account: 800 });
    act(() => updateLife((life) => { life.careerXp = 20; setCareerLevel(life, 3); }));
    expect(current).toMatchObject({ careerLevel: 3, careerXp: 20, income: 1600 });
  });
  it("keeldub nullist, 7. tasemest ja poolikutest tasemetest", () => {
    act(() => createLife({ character: 0, playerName: "Piir", age: 22, income: 1600, job: "", housing: "rent", savings: 0, goal: "buffer", goalText: "" }));
    for (const level of [0, 7, 2.5, NaN]) {
      act(() => updateLife((life) => setCareerLevel(life, level)));
      const raw = localStorage.getItem("elu-plus-v1");
      if (!raw) throw new Error("Missing save");
      const saved = JSON.parse(raw) as { activeId: string; lives: { id: string; careerLevel: number }[] };
      expect(saved.lives.find((life) => life.id === saved.activeId)?.careerLevel).toBe(1);
    }
  });
});