import { Building2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { eur, loanPayment, propertySaleProceeds, propertyValue, rentalCosts, clampRent, rentYieldPct, maxMonthlyRent } from "@/lib/game/finance";
import { aiQuestion, buyRental, canPay, monthlyLeft, rentIncome, sellRental, updateLife, type Life } from "@/lib/game/store";
import { DecisionFrame, RiskReview, Row } from "./Frame";
import { Btn, Choice, Note, NumField, Sheet } from "./ui";

export function PropertyPanel({ life, open, onClose }: { life: Life; open: boolean; onClose: () => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("Üürikorter");
  const [price, setPrice] = useState(65000);
  const [financed, setFinanced] = useState(true);
  const [down, setDown] = useState(13000);
  const [rent, setRent] = useState(450);
  const [costs, setCosts] = useState(100);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(25);
  const [selling, setSelling] = useState<string | null>(null);
  const upfront = financed ? Math.min(down, price) : price;
  const payment = financed ? loanPayment(price - upfront, rate / 100, years * 12) : 0;
  const net = rent - costs - payment;
  const close = () => { setAdding(false); setSelling(null); onClose(); };
  if (adding) return (
    <DecisionFrame title="Lisa üürikinnisvara" open={open} onClose={() => setAdding(false)} life={life}
      question={aiQuestion(life, { kind: "property", upfront, newMonthly: Math.max(0, -net) })}
      upfront={upfront} canPreview={name.trim().length > 0 && price > 0 && (!financed || (Number.isInteger(years) && years >= 1))}
      confirmLabel="Ostan üürikinnisvara" logText={`Ostsid üürikinnisvara „${name}” hinnaga ${eur(price)}.`}
      editor={<div className="space-y-3">
        <label className="block text-xs font-semibold">Objekti nimi<input aria-label="Objekti nimi" value={name} maxLength={40} onChange={(event) => setName(event.target.value)} className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm" /></label>
        <div className="grid grid-cols-2 gap-2"><Choice active={financed} onClick={() => setFinanced(true)}>Ostan laenuga</Choice><Choice active={!financed} onClick={() => setFinanced(false)}>Maksan oma rahast</Choice></div>
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Kinnisvara hind" value={price} onChange={(n) => { setPrice(n); setRent((r) => clampRent(r, n)); }} />
          {financed && <NumField label="Oma sissemakse" value={down} onChange={setDown} />}
          <NumField label="Üüritulu kuus" value={rent} onChange={setRent} clamp={(n) => clampRent(n, price)} />
          <NumField label="Omaniku kulud kuus" value={costs} onChange={setCosts} />
          {financed && <><NumField label="Laenu intress" value={rate} onChange={setRate} suffix="%" step={0.1} /><NumField label="Laenu tähtaeg" value={years} onChange={setYears} suffix="a" min={1} /></>}
        </div>
        <Note>Üüritulu võib olla kuni {eur(maxMonthlyRent(price))} kuus ehk {rentYieldPct(rent, price).toFixed(2)}% objekti hinnast (sinu sisestatud {eur(rent)}). Omaniku kulud sisaldavad hooldust, kindlustust ja remondireservi. Üür ei laeku, kui objekt on tühi.</Note>
      </div>}
      preview={<div className="space-y-2"><Row l="Maksan kohe" v={eur(upfront)} /><Row l="Üüritulu kuus" v={eur(rent)} /><Row l="Omaniku kulud kuus" v={eur(costs)} /><Row l="Laenumakse kuus" v={eur(payment, 2)} /><Row l="Objekti rahavoog kuus" v={eur(net, 2)} strong /><Row l="Kuu lõpus jääb pärast" v={eur(monthlyLeft(life) + net)} strong /><Note>Õppenäide: väärtus kasvab mängus 2% aastas, omaniku kulud inflatsiooniga. Üüritulu püsib kokkulepitud summas. Ost ei muuda sinu enda kodu.</Note></div>}
      onConfirm={(current) => { buyRental(current, { name, price, down: upfront, rent, costs, rate: rate / 100, months: years * 12, financed }); setAdding(false); }} />
  );
  return <Sheet open={open} onClose={close} title="Kinnisvaraportfell">
    <div className="space-y-4">
      <div className="border-b border-border pb-3"><Row l="Üürikinnisvara väärtus" v={eur(propertyValue(life.properties))} strong /><Row l="Üüritulu kuus" v={eur(rentIncome(life))} /><Row l="Omaniku kulud kuus" v={eur(rentalCosts(life.properties) * life.priceLevel)} /></div>
      {life.properties.length === 0 && <div className="flex items-center gap-3 py-3 text-muted-foreground"><Building2 className="size-8" /><p className="text-sm">Üürikinnisvara veel pole.</p></div>}
      {life.properties.map((property) => {
        const loan = life.loans.find((entry) => entry.id === property.loanId);
        const proceeds = propertySaleProceeds(property.value, loan?.balance ?? 0);
        return <article key={property.id} className="rounded-lg border border-border bg-card p-3">
          <h3 className="flex items-center gap-2 font-bold"><Building2 className="size-4 text-primary" />{property.name}</h3>
          <Row l="Väärtus" v={eur(property.value)} /><Row l="Laenujääk" v={eur(loan?.balance ?? 0)} /><Row l="Üüritulu / kuu" v={eur(property.occupied ? property.rent : 0)} /><Row l="Rahavoog / kuu" v={eur((property.occupied ? property.rent : 0) - property.costs * life.priceLevel - (loan?.payment ?? 0), 2)} strong />
          <div className="mt-3 grid grid-cols-2 gap-2"><NumField label={`Üür kuus: ${property.name}`} value={property.rent} onChange={(n) => updateLife((current) => { const entry = current.properties.find((item) => item.id === property.id); if (entry) entry.rent = n; })} clamp={(n) => clampRent(n, property.value)} /><NumField label={`Kulud kuus: ${property.name}`} value={Number((property.costs * life.priceLevel).toFixed(2))} onChange={(n) => updateLife((current) => { const entry = current.properties.find((item) => item.id === property.id); if (entry) entry.costs = n / current.priceLevel; })} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2"><Choice active={property.occupied} onClick={() => updateLife((current) => { const entry = current.properties.find((item) => item.id === property.id); if (entry) entry.occupied = true; })}>Üürnik sees</Choice><Choice active={!property.occupied} onClick={() => updateLife((current) => { const entry = current.properties.find((item) => item.id === property.id); if (entry) entry.occupied = false; })}>Objekt tühi</Choice></div>
          {selling === property.id ? <div className="mt-3 space-y-2"><RiskReview risks={["Müük lõpetab selle objekti tulevase üüritulu.", "Laenujääk võetakse müügitulust kohe maha.", "Objekti võimalikust hilisemast väärtuse kasvust sa enam ei osale."]} /><Row l={proceeds >= 0 ? "Pärast laenu tasumist saad" : "Laenu tasumiseks lisad"} v={eur(Math.abs(proceeds))} /><Btn variant="accent" disabled={proceeds < 0 && !canPay(life, -proceeds)} onClick={() => { updateLife((current) => { sellRental(current, property.id); }); setSelling(null); }}>Müün ja tasun laenu</Btn><Btn variant="ghost" onClick={() => setSelling(null)}>Loobun müügist</Btn></div> : <div className="mt-3"><Btn variant="outline" onClick={() => setSelling(property.id)}><Trash2 className="size-4" />Müün kinnisvara</Btn></div>}
        </article>;
      })}
      <Btn onClick={() => setAdding(true)}><Plus className="size-4" />Lisa kinnisvara</Btn>
    </div>
  </Sheet>;
}