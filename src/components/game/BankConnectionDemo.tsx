import { Link2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { eur } from "@/lib/game/finance";
import type { Life } from "@/lib/game/store";
import { Row } from "./Frame";
import { Btn, Note, Sheet } from "./ui";

export function BankConnectionDemo({ life }: { life?: Life }) {
  const [open, setOpen] = useState(false);
  return <>
    <Btn variant="ghost" onClick={() => setOpen(true)} aria-label="Coop Panga äpi näidisühendus" className="min-h-11 justify-between rounded-lg bg-secondary px-2.5 py-1 text-left text-[10px] text-secondary-foreground">
      <span className="flex min-w-0 items-center gap-2"><Link2 className="size-4 shrink-0" /><span className="min-w-0"><span className="block font-bold">Ühendatud teie Coop Panga äpiga</span><span className="block text-[9px] font-normal">Näidisühendus · päris pangaandmeid ei loeta</span></span></span>
      <span className="shrink-0 rounded bg-accent px-1.5 py-1 text-[9px] font-extrabold text-accent-foreground">DEMO</span>
    </Btn>
    <Sheet open={open} onClose={() => setOpen(false)} title="Coop Panga äpi näidisühendus">
      <div className="space-y-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-3"><div className="min-w-0"><p className="font-display text-xl font-bold text-primary">Coop Pank</p><p className="mt-1 text-xs text-muted-foreground">Ühenduse näidis</p></div><ShieldCheck className="size-7 shrink-0 text-primary" /></div>
        <Note>DEMO. Tegelikku ühendust Coop Pangaga ei ole. Kontot, tehinguid ega sinu päris harjumusi ei loeta ja midagi pangale ei saadeta.</Note>
        <section>
          <h3 className="text-sm font-bold">{life ? "Sinu mänguprofiili harjumused" : "Harjumuste ülevõtmise näidis"}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{life ? "Need summad pärinevad ainult sinu mänguelust, mitte pangast." : "Päris ühenduse korral saaks sinu loal üle võtta sissetuleku, kulude ja säästmise harjumused."}</p>
          <div className="mt-3 divide-y divide-border">
            <Row l="Sissetulek kuus" v={life ? eur(life.income) : "Sissetulekute ülevaade"} />
            <Row l="Toidukulud kuus" v={life ? eur(life.expenses.food * life.priceLevel) : "Kulude kategooriad"} />
            <Row l="Transport kuus" v={life ? eur((life.expenses.transport + (life.car?.monthly ?? 0)) * life.priceLevel) : "Liikumisharjumused"} />
            <Row l="Säästmine kuus" v={life ? eur(life.saveMonthly) : "Regulaarsed säästumaksed"} />
            <Row l="Investeerimine kuus" v={life ? eur(life.investMonthly) : "Regulaarsed sissemaksed"} />
          </div>
        </section>
        <Btn onClick={() => setOpen(false)}>Tagasi mängu</Btn>
      </div>
    </Sheet>
  </>;
}