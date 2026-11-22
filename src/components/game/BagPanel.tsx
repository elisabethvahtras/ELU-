import { useEffect, useRef, useState } from "react";
import { Apple, ArrowLeft, ArrowRight, Beef, Carrot, ChevronDown, ChevronUp, Coffee, CreditCard, Egg, Fish, Milk, Package, PiggyBank, Plus, ShoppingBasket as ShoppingBasketIcon, Sparkles, Tag, Trash2, Wheat } from "lucide-react";
import { defaultBasket } from "@/lib/game/basket";
import { eur, shoppingTotals, type BasketItem, type ShoppingBasket } from "@/lib/game/finance";
import { addLog, updateLife, type Life } from "@/lib/game/store";
import { Row } from "./Frame";
import { Btn, Note, NumField, Sheet } from "./ui";

function ProductIcon({ name }: { name: string }) {
  const Icon = /piim|jogurt|keefir/i.test(name) ? Milk : /leib|sai|pasta|riis|jahu/i.test(name) ? Wheat : /kohv|coffee/i.test(name) ? Coffee : /õun|banaan|pirn|puuvil/i.test(name) ? Apple : /kala|lõhe|heering/i.test(name) ? Fish : /muna/i.test(name) ? Egg : /porgand|kartul|köögivil/i.test(name) ? Carrot : /liha|kana|veis/i.test(name) ? Beef : Package;
  return <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Icon className="size-4" aria-hidden="true" /></span>;
}

export function BagPanel({ life, open, onClose }: { life: Life; open: boolean; onClose: () => void }) {
  const [result, setResult] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const review = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) { setResult(false); setOpenId(null); } }, [open]);
  useEffect(() => {
    if (!result) return;
    const sheet = review.current?.closest('[role="dialog"]');
    if (sheet) sheet.scrollTop = 0;
  }, [result]);
  const basket = life.shoppingBasket ?? defaultBasket();
  const totals = shoppingTotals(basket);
  const change = (fn: (value: ShoppingBasket) => void) => updateLife((l) => {
    const next = l.shoppingBasket ?? defaultBasket();
    fn(next);
    l.shoppingBasket = next;
  });
  const edit = (id: string, patch: Partial<BasketItem>) => change((b) => {
    b.items = b.items.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, ...patch };
      if (patch.name !== undefined || patch.price !== undefined) {
        delete next.sourceUrl;
        delete next.checkedOn;
      }
      return next;
    });
  });
  const invalid = basket.items.some((item) => !item.name.trim());
  const cardChoice = <label className="flex cursor-pointer items-center gap-3 border-b border-border py-3 text-sm font-bold">
    <input type="checkbox" checked={basket.useCard} onChange={(e) => change((b) => { b.useCard = e.target.checked; })} className="size-5 accent-primary" />
    <CreditCard className="size-5 shrink-0 text-primary" aria-hidden="true" />Kasutan Coop kliendikaarti
  </label>;

  return <Sheet open={open} onClose={onClose} title={result ? "Sinu kokkuhoid aastas" : "Sinu ostukorv"}>
    {result ? <div ref={review} className="space-y-4" aria-live="polite">
      <Btn variant="ghost" onClick={() => setResult(false)}><ArrowLeft className="size-4" />Muudan ostunimekirja</Btn>
      <div className="relative overflow-hidden border-b border-border py-4 pr-20">
        <p className="text-sm text-muted-foreground">{basket.useCard ? "Coop kliendikaardiga säästad aastas" : "Sinu aastane kokkuhoid ilma kliendikaardita"}</p>
        <p className="mt-1 text-3xl font-bold text-primary">{eur(totals.year, 2)}</p>
        <div className="absolute bottom-4 right-1 text-primary"><PiggyBank className="size-16" strokeWidth={1.5} aria-hidden="true" />{totals.year > 0 && <Sparkles className="scene-goal-token absolute -right-1 -top-3 size-6 text-success" aria-hidden="true" />}</div>
      </div>
      {cardChoice}
      <NumField label="Ostukordi kuus" value={basket.perMonth} onChange={(n) => change((b) => { b.perMonth = n; })} suffix="korda" />
      <Row l="Ühe ostukorviga säästad" v={eur(totals.perBasket, 2)} />
      <Row l="Kuus säästad" v={eur(totals.month, 2)} />
      <Row l="Ostukorv ilma kliendikaardita" v={eur(totals.withoutCard, 2)} />
      <Row l="Ostukorv Coop kliendikaardiga" v={eur(totals.withCard, 2)} />
      {!basket.useCard && <Note>Ilma kliendikaardita arvestame tavahindu. Coop kliendikaardiga oleks võimalik säästa {eur((totals.withoutCard - totals.withCard) * basket.perMonth * 12, 2)} aastas.</Note>}
      {basket.useCard && totals.year === 0 && <Note>Praegu sisestatud toodetel puudub hinnavahe. Kinnitatud kliendikaardipakkumisi näidistoodetele ei leitud.</Note>}
      <Note>Prognoos eeldab sama ostukorvi, ostusagedust ja hinnavahet 12 kuu jooksul. See ei lisa raha sinu mängukontole.</Note>
    </div> : <div className="space-y-4">
      <Note>Coop Haapsalu e-poe hinnad, kontrollitud 22.11.2026. Hinnad ja pakkumised võivad kaupluste vahel erineda. Kliendikaardisoodustusi ei ole oletatud.</Note>
      {cardChoice}
      <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3" aria-live="polite">
        <span className="flex items-center gap-2 text-sm"><ShoppingBasketIcon className="size-5 text-primary" aria-hidden="true" />Ostukorvi hind</span><span className="text-lg font-bold text-primary">{eur(totals.selected, 2)}</span>
      </div>
      <div>
        {basket.items.map((item, index) => {
          const editing = openId === item.id;
          const shown = item.cardPrice ?? item.price;
          return <div key={item.id} className="border-b border-border">
            <button type="button" aria-expanded={editing} aria-label={`Muuda toodet ${index + 1}: ${item.name || "nimetu"}`} onClick={() => setOpenId(editing ? null : item.id)} className="flex w-full items-center gap-3 py-3 text-left">
              <ProductIcon name={item.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{item.name.trim() || `Toode ${index + 1}`}</span>
                <span className="block text-xs text-muted-foreground">{item.quantity} tk · {eur(shown * item.quantity, 2)}{item.cardPrice !== null ? " kliendikaardiga" : ""}</span>
              </span>
              {editing ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
            </button>
            {editing && <div className="pb-4">
              <label className="block text-xs font-semibold text-muted-foreground">Toode {index + 1} · bränd ja pakendi suurus
                <input aria-label={`Toode ${index + 1}`} value={item.name} onChange={(e) => edit(item.id, { name: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </label>
              {item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-primary underline">Coopi hinnainfo · {item.checkedOn}</a> : <p className="mt-1 text-xs text-muted-foreground">Sinu sisestatud toode või hind</p>}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <NumField label={`Kogus · toode ${index + 1}`} value={item.quantity} suffix="tk" onChange={(quantity) => edit(item.id, { quantity })} />
                <NumField label={`Tavahind · toode ${index + 1}`} value={item.price} step={0.01} onChange={(price) => edit(item.id, { price })} />
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={item.cardPrice !== null} onChange={(e) => edit(item.id, { cardPrice: e.target.checked ? item.price : null })} className="size-4 accent-primary" />
                <Tag className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {`Sisestan Coop kliendikaardi pakkumise · toode ${index + 1}`}
              </label>
              {item.cardPrice !== null && <div className="mt-2">
                <NumField label={`Coop kliendikaardiga · toode ${index + 1}`} value={item.cardPrice} step={0.01} onChange={(cardPrice) => edit(item.id, { cardPrice })} />
                <p className="mt-1 text-xs text-muted-foreground">Sinu sisestatud pakkumine · hinnavahe {eur((item.price - item.cardPrice) * item.quantity, 2)}</p>
                {item.cardPrice > item.price && <Note tone="warn">Kliendikaardihind on tavahinnast kõrgem — see suurendab kulu.</Note>}
              </div>}
              <Btn variant="ghost" className="mt-3 w-auto px-3 text-xs" aria-label={`Eemalda toode ${index + 1}`} onClick={() => { setOpenId(null); change((b) => { b.items = b.items.filter((x) => x.id !== item.id); }); }}><Trash2 className="size-4" />Eemaldan toote</Btn>
            </div>}
          </div>;
        })}
      </div>
      <Btn variant="outline" onClick={() => { const id = crypto.randomUUID(); change((b) => { b.items.push({ id, name: "", quantity: 1, price: 0, cardPrice: null }); }); setOpenId(id); }}><Plus className="size-4" />Lisan toote</Btn>
      <NumField label="Ostukordi kuus" value={basket.perMonth} onChange={(n) => change((b) => { b.perMonth = n; })} suffix="korda" />
      <div className="sticky bottom-0 border-t border-border bg-card py-3">
        <Btn disabled={invalid} onClick={() => {
          setResult(true);
          updateLife((l) => { if (!l.log.some((x) => x.text.includes("ostukorvi"))) { l.points += 5; addLog(l, "Võrdlesid ostukorvi Coop kliendikaardiga."); } });
        }}>Vaata kokkuhoidu aastas<ArrowRight className="size-4" /></Btn>
      </div>
    </div>}
  </Sheet>;
}