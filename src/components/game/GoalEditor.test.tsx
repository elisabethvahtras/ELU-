import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createLife, useLife } from "@/lib/game/store";
import { GoalEditor } from "./GoalEditor";

function LiveGoal() {
  const life = useLife();
  return life ? <GoalEditor life={life} onClose={() => {}} /> : null;
}
describe("Oma eesmärk", () => {
  it("salvestab kasutaja valitud eesmärgi nime ja 8000 € sihi alles kinnitamisel", () => {
    act(() => createLife({ character: 0, playerName: "Eesmärgi test", age: 22, income: 1600, job: "", housing: "rent", savings: 0, goal: "buffer", goalText: "" }));
    render(<LiveGoal />);
    fireEvent.click(screen.getByRole("button", { name: "Minu enda eesmärk" }));
    fireEvent.change(screen.getByLabelText("Eesmärgi nimi"), { target: { value: "Õppereis Jaapanisse" } });
    fireEvent.change(screen.getByLabelText("Eesmärgi summa"), { target: { value: "8000" } });
    const read = () => {
      const raw = localStorage.getItem("elu-plus-v1");
      if (!raw) throw new Error("Missing save");
      const state = JSON.parse(raw) as { activeId: string; lives: { id: string; goal: string; goalText: string; goalTarget: number }[] };
      return state.lives.find((life) => life.id === state.activeId);
    };
    expect(read()?.goal).toBe("buffer");
    fireEvent.click(screen.getByRole("button", { name: "Salvesta eesmärk" }));
    expect(read()).toMatchObject({ goal: "other", goalText: "Õppereis Jaapanisse", goalTarget: 8000 });
  });
});