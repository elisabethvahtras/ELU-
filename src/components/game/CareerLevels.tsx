import { useState } from "react";
import { BadgeCheck, Check, Save, Trophy } from "lucide-react";
import { CAREER_XP_PER_LEVEL, MAX_CAREER_LEVEL } from "@/lib/game/finance";
import { careerTitle, setCareerLevel, updateLife, type Life } from "@/lib/game/store";
import { Btn, Note, Sheet } from "./ui";

export function CareerLevels({ life, onClose }: { life: Life; onClose: () => void }) {
  const [selected, setSelected] = useState(life.careerLevel);
  const levels = Array.from({ length: MAX_CAREER_LEVEL }, (_, i) => i + 1);
  return <Sheet open onClose={onClose} title="Karjääritasemed">
    <div className="space-y-4">
      <div className="flex items-start gap-3 border-y border-border py-3"><BadgeCheck className="size-7 shrink-0 text-primary" /><div><p className="font-bold">Tase {life.careerLevel} · {careerTitle(life)}</p><p className="mt-1 text-xs text-muted-foreground">{life.careerLevel >= MAX_CAREER_LEVEL ? "Oled jõudnud kõrgeima tasemeni." : `Järgmise tasemeni on vaja veel ${CAREER_XP_PER_LEVEL - life.careerXp} kogemuspunkti.`}</p></div></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs">
        <caption className="mb-2 text-left font-bold">Arengutee esimesest tasemest</caption>
        <thead className="border-b border-border text-muted-foreground"><tr><th className="py-2 pr-2">Tase</th><th className="py-2 pr-2">Kogemus kokku</th><th className="py-2">Seis</th></tr></thead>
        <tbody>{levels.map((level) => <tr key={level} className={level === life.careerLevel ? "border-b border-border bg-secondary" : "border-b border-border"}><td className="py-2.5 pr-2"><span className="font-bold">{level} · {careerTitle({ ...life, careerLevel: level })}</span></td><td className="py-2.5 pr-2">{(level - 1) * CAREER_XP_PER_LEVEL} p</td><td className="py-2.5">{level === life.careerLevel ? "Praegu" : level < life.careerLevel ? <Check className="size-4 text-success" aria-label="Saavutatud" /> : level === life.careerLevel + 1 ? "Järgmine" : "Ees ootamas"}</td></tr>)}</tbody>
      </table></div>
      <Note>Iga järgmine tase nõuab 100 uut kogemuspunkti ja annab mängus automaatsel edutamisel 7% palgatõusu. Kuuendal tasemel automaatne tõus lõpeb.</Note>
      <section><h3 className="mb-2 text-sm font-bold">Kuidas kogemust saada?</h3><ul className="space-y-1 text-xs text-muted-foreground"><li>Töökuu, kui sissetulek on olemas: +8 punkti.</li><li>Erialane kursus: +30 punkti; praegusele tööle keskendumine: +5.</li><li>Lisatöö: +10; õnnestunud töövahetus: +20; õnnestunud palgavestlus: +15.</li><li>Tasulised õpingud: +3 punkti kuus. Elusündmused võivad anda lisakogemust.</li></ul></section>
      <section className="border-t border-border pt-3"><h3 className="mb-2 text-sm font-bold">Mul on see tase juba olemas</h3><div className="grid grid-cols-3 gap-2">{levels.map((level) => <Btn key={level} variant={selected === level ? "primary" : "outline"} onClick={() => setSelected(level)} className="rounded-lg px-2 text-xs"><Trophy className="size-4" />Tase {level}</Btn>)}</div><p className="mt-2 text-xs text-muted-foreground">See kohandab sinu mänguprofiili. Netopalk ei muutu; uue taseme kogemus algab nullist.</p></section>
      <Btn onClick={() => { updateLife((current) => setCareerLevel(current, selected)); onClose(); }}><Save className="size-4" />Salvesta minu tase</Btn>
    </div>
  </Sheet>;
}