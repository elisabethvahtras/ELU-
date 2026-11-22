import { describe, expect, it } from "vitest";
import { defaultBasket } from "./basket";
import { shoppingTotals } from "./finance";

describe("Coop ostukorvi arvutus", () => {
  it("kasutab kontrollitud Tere piima hinda 1,99 € ilma oletatud allahindluseta", () => {
    const milk = defaultBasket().items.find((item) => item.id === "milk");
    expect(milk?.price).toBe(1.99);
    expect(milk?.cardPrice).toBeNull();
    expect(shoppingTotals(defaultBasket()).year).toBe(0);
  });
  it("arvestab muudetud toote hinda, kliendikaardihinda, kogust ja ostusagedust", () => {
    const basket = { useCard: true, perMonth: 4, items: [{ id: "custom", name: "Minu toode", quantity: 2, price: 3, cardPrice: 2.5 }] };
    expect(shoppingTotals(basket)).toEqual({ withoutCard: 6, withCard: 5, selected: 5, perBasket: 1, month: 4, year: 48, tenYears: 480 });
    expect(shoppingTotals({ ...basket, perMonth: 8 }).year).toBe(96);
    expect(shoppingTotals({ ...basket, useCard: false }).year).toBe(0);
    expect(shoppingTotals({ ...basket, useCard: false }).selected).toBe(6);
  });
  it("null kogust ja tühi nimekiri ei tekita kokkuhoidu", () => {
    expect(shoppingTotals({ useCard: true, perMonth: 4, items: [{ id: "x", name: "x", quantity: 0, price: 3, cardPrice: 1 }] }).year).toBe(0);
    expect(shoppingTotals({ useCard: true, perMonth: 4, items: [] }).selected).toBe(0);
  });
});