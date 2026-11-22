import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createLife, useLife } from "@/lib/game/store";
import { BagPanel } from "./BagPanel";

function LiveBasket() {
  const life = useLife();
  return life ? <BagPanel life={life} open onClose={() => {}} /> : null;
}

describe("Ostunimekiri", () => {
  it("salvestab mitu sisestatud numbrit ja arvutab kaardiga 48 € aastas ning ilma 0 €", () => {
    act(() => createLife({ character: 0, playerName: "Ostukorvi test", age: 22, income: 1600, job: "", housing: "rent", savings: 1500, goal: "buffer", goalText: "" }));
    render(<LiveBasket />);
    fireEvent.click(screen.getByRole("button", { name: /Muuda toodet 1/ }));
    fireEvent.change(screen.getByLabelText("Tavahind · toode 1"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Kogus · toode 1"), { target: { value: "2" } });
    fireEvent.click(screen.getByLabelText("Sisestan Coop kliendikaardi pakkumise · toode 1"));
    const cardPrice = screen.getByLabelText("Coop kliendikaardiga · toode 1");
    cardPrice.focus();
    fireEvent.change(cardPrice, { target: { value: "2" } });
    fireEvent.change(cardPrice, { target: { value: "2,5" } });
    expect(cardPrice).toHaveFocus();
    fireEvent.blur(cardPrice);
    fireEvent.click(screen.getByRole("button", { name: "Vaata kokkuhoidu aastas" }));
    expect(screen.getByRole("dialog", { name: "Sinu kokkuhoid aastas" })).toBeInTheDocument();
    expect(screen.getByText(/48,00/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Kasutan Coop kliendikaarti"));
    expect(screen.getByText(/^0,00/, { selector: "p" })).toBeInTheDocument();
    const raw = localStorage.getItem("elu-plus-v1");
    if (!raw) throw new Error("Ostunimekiri ei salvestunud");
    const saved = JSON.parse(raw) as { activeId: string; lives: { id: string; shoppingBasket: { useCard: boolean; items: { price: number; quantity: number; cardPrice: number | null }[] } }[] };
    const basket = saved.lives.find((life) => life.id === saved.activeId)?.shoppingBasket;
    expect(basket?.useCard).toBe(false);
    expect(basket?.items[0]).toMatchObject({ price: 3, quantity: 2, cardPrice: 2.5 });
  });
});