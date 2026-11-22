import type { ShoppingBasket } from "./finance";

/** Public Coop Haapsalu prices checked on 2026-11-22; no verified card offers. */
export function defaultBasket(): ShoppingBasket {
  return {
    perMonth: 4,
    useCard: true,
    items: [
      { id: "milk", name: "Tere lattepiim 2,5%, 1 l", quantity: 1, price: 1.99, cardPrice: null, sourceUrl: "https://coophaapsalu.ee/toode/latte-piim-2-5-1l/", checkedOn: "22.11.2026" },
      { id: "bread", name: "Leibur Rukkipala Saare täisteraleib, 200 g", quantity: 1, price: 1.59, cardPrice: null, sourceUrl: "https://coophaapsalu.ee/toode/palaleib-rukkipala-saare-taistera-200g-leibur/", checkedOn: "22.11.2026" },
      { id: "coffee", name: "Coffeestar kohvioad Irish Creme-apelsini, 200 g", quantity: 1, price: 6.99, cardPrice: null, sourceUrl: "https://coophaapsalu.ee/toode/kohviuba-coffeestar-200g-irish-creme-apelsini/", checkedOn: "22.11.2026" },
    ],
  };
}