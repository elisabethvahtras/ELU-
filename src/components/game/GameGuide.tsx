import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, GraduationCap, ShoppingBag, Wallet, Users, Landmark, Target, TrendingUp, CalendarDays, Sparkles } from "lucide-react";
import type { ObjKey } from "./LifeScene";
import { Btn, Choice, Note, Sheet } from "./ui";

export type GuideDestination = ObjKey | "finances" | "goal" | "future" | "life";
const steps = [
  { title: "Pane oma kuueelarve paika", icon: Wallet, where: "Minu elu → rahaseisu numbrid", text: "Sisesta kätte saadav kuusissetulek ja oma päris kulud. Kui sul palka pole, pane kirja summa, mida saad iga kuu kasutada. Vaata, kui palju kuus alles jääb.", action: "Vaata sissetulekuid ja kulusid", destination: "finances" },
  { title: "Proovi poes kokku hoida", icon: ShoppingBag, where: "Minu elu → ostukott", text: "Muuda ostunimekirja: mida ostad, mis hinnaga ja kui tihti. Kui tead Coop kliendikaardi pakkumist, sisesta see ning võrdle aastast kokkuhoidu.", action: "Ava ostukott", destination: "bag" },
  { title: "Arvesta õppimise kuludega", icon: GraduationCap, where: "Minu elu → Leibkond → õpingud", text: "Vali õpingud ja sisesta oma õppemaks kuus. Kui õppimine on tasuta, jäta summaks 0 €. Võrdle, kuidas õppekulud mõjutavad kuueelarvet.", action: "Vaata õpinguid", destination: "household" },
  { title: "Tee laenul ja oma rahal vahet", icon: Landmark, where: "Minu elu → pangahoone", text: "Vaata konto ja puhvri erinevust ning proovi laenutaotluse õppetundi. Laen pole lisatulu: see tuleb koos intressiga tagasi maksta.", studentNote: "Eraldi õppelaenu valikut mängus praegu ei ole. Pangas saad proovida laenu õppetundi, mitte päris õppelaenu taotleda.", action: "Ava pank", destination: "bank" },
  { title: "Vali, mille jaoks kogud", icon: Target, where: "Alumine menüü → Eesmärk", text: "Määra enda eesmärk ja summa. Näiteks ootamatute kulude puhver või reis. Vaata, kui palju oled selle jaoks juba kogunud.", action: "Vaata eesmärki", destination: "goal" },
  { title: "Proovi väikest investeeringut", icon: TrendingUp, where: "Minu elu → Investeerimine", text: "Vali toode ja jõukohane summa. Võrdle ühekordset ja igakuist makset ning loe enne kinnitamist riske. Investeeringu väärtus võib ka langeda.", action: "Vaata investeerimist", destination: "invest" },
  { title: "Vaata oma otsuse mõju", icon: CalendarDays, where: "Minu elu → Liigu kuu edasi", text: "Vaata enne kinnitamist järgmise kuu tulusid ja kulusid. Seejärel alusta uut kuud ja loe tulemusi: mis muutus kontol ja investeeringutes?", action: "Tagasi kuu ülevaate juurde", destination: "life" },
  { title: "Vaata pikemat perspektiivi", icon: Sparkles, where: "Alumine menüü → Tulevik", text: "Võrdle eri vanuseid ja vajuta linnapildi hoonetele. Näed oma elukohta, investeeringuid ning kontot ja puhvrit valitud vanuses. See on arvutuslik prognoos, mitte lubadus.", action: "Ava tulevik", destination: "future" },
] as const;

export function GameGuide({ open, onClose, onOpen, hasLife }: { open: boolean; onClose: () => void; onOpen: (destination: GuideDestination) => void; hasLife: boolean }) {
  const [student, setStudent] = useState(true);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open, onClose]);
  const step = steps[index];
  if (!step) return null;
  const Icon = step.icon;
  return (
    <Sheet open={open} onClose={onClose} title="Juhend">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Soovitused">
          <Choice active={student} onClick={() => { setStudent(true); setIndex(0); }} className="flex items-center gap-2 rounded-lg"><GraduationCap className="size-4 shrink-0" />Õpilane / tudeng</Choice>
          <Choice active={!student} onClick={() => { setStudent(false); setIndex(0); }} className="flex items-center gap-2 rounded-lg"><Users className="size-4 shrink-0" />Kõigile</Choice>
        </div>
        <p className="text-xs text-muted-foreground">{student ? "Alusta oma igapäevastest kuludest ja õpingutest." : "Alusta eelarvest ja proovi üht otsust korraga."} Pärast proovimist ava „Juhend“ uuesti ja jätka järgmise sammuga.</p>
        <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-semibold text-primary"><span className="flex items-center gap-2"><BookOpen className="size-4" />Samm {index + 1} / {steps.length}</span><span>{index === steps.length - 1 ? "Viimane samm" : "Proovi omas tempos"}</span></div>
        <section className="space-y-3" aria-label="Praegune soovitus">
          <Icon className="size-9 text-primary" />
          <h3 className="text-xl font-extrabold leading-tight">{step.title}</h3>
          <p className="text-xs font-semibold text-primary">{step.where}</p>
          <p className="text-sm leading-relaxed">{step.text}</p>
          {student && "studentNote" in step && <Note>{step.studentNote}</Note>}
        </section>
        {hasLife ? <Btn onClick={() => onOpen(step.destination)} className="rounded-lg">{step.action}<ArrowRight className="size-4 shrink-0" /></Btn> : <Note>Loo esmalt oma mänguelu. Seejärel saad juhendist soovitatud vaated otse avada.</Note>}
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="outline" disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className="rounded-lg"><ArrowLeft className="size-4" />Eelmine</Btn>
          <Btn variant="outline" disabled={index === steps.length - 1} onClick={() => setIndex((value) => value + 1)} className="rounded-lg">Järgmine<ArrowRight className="size-4" /></Btn>
        </div>
        <Btn variant="ghost" onClick={onClose} className="rounded-lg">{hasLife ? "Tagasi mängu" : "Tagasi alustama"}</Btn>
      </div>
    </Sheet>
  );
}