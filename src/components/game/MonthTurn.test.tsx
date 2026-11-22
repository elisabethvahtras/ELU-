import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createLife, updateLife, useLife } from "@/lib/game/store";
import { MonthTurn } from "./MonthTurn";

function LiveTurn() {
  const life = useLife();
  return life ? <MonthTurn life={life} onOpenChange={() => {}} /> : null;
}
function savedMonth() {
  const raw = localStorage.getItem("elu-plus-v1");
  if (!raw) throw new Error("Missing save");
  const state = JSON.parse(raw) as { activeId: string; lives: { id: string; months: number; account: number }[] };
  const life = state.lives.find((entry) => entry.id === state.activeId);
  if (!life) throw new Error("Missing active life");
  return life;
}
describe("Kuu kinnitamine", () => {
  it("eelvaade ega katkestamine ei liiguta aega; topeltkinnitus liigub ainult ühe kuu", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.9);
    act(() => {
      createLife({ character: 0, playerName: "Kuu test", age: 22, income: 2000, job: "", housing: "parents", savings: 0, goal: "buffer", goalText: "", expenses: { housing: 0, food: 0, transport: 0, phone: 0, leisure: 0 } });
      updateLife((life) => { life.introSeen = true; });
    });
    render(<LiveTurn />);
    fireEvent.click(screen.getByRole("button", { name: "Liigu kuu edasi" }));
    expect(savedMonth().months).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Muudan valikuid" }));
    expect(savedMonth().months).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Liigu kuu edasi" }));
    const confirm = screen.getByRole("button", { name: "Alusta uut kuud" });
    act(() => { confirm.click(); confirm.click(); });
    expect(savedMonth()).toMatchObject({ months: 1, account: 3000 });
    fireEvent.click(screen.getByRole("button", { name: "Tagasi oma elu juurde" }));
    expect(savedMonth().months).toBe(1);
    random.mockRestore();
  });
});