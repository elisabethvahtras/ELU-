import { useState } from "react";
import { addLog, grantReward, updateLife } from "@/lib/game/store";
import { Btn, Choice, Note, Sheet } from "./ui";
import { cn } from "@/lib/utils";

const QS = [
  { q: "Milliseid andmeid või dokumente pank võib vajada, et sissetulekut hinnata?", a: ["Ainult nime", "Konto väljavõtet ja sissetuleku andmeid", "Sõprade soovitusi"], ok: 1, why: "Pank hindab, kas sissetulek on püsiv ja piisav. Tavaliselt vaadatakse konto väljavõtet, sissetulekut ja olemasolevaid kohustusi." },
  { q: "Kas laenusumma ja tagasimakstav kogusumma on alati võrdsed?", a: ["Jah, alati", "Ei — lisanduvad intress ja tasud"], ok: 1, why: "Tagasi maksad laenusumma + intressi + lepingutasud. Pikem tähtaeg = väiksem kuumakse, kuid suurem kogukulu." },
  { q: "Mis saab siis, kui sissetulek ootamatult kaob?", a: ["Laen kustub ise", "Makse jääb, seega aitab puhver ja varakult pangaga rääkimine", "Pank ei märka"], ok: 1, why: "Kohustus jääb alles. Hädaabipuhver ja aegne suhtlus pangaga (nt maksepuhkus) aitavad raskusi vältida." },
];
const DOCS = ["Näidis-palgaleht", "Väljamõeldud konto väljavõte", "Mängu-ID kaart", "Näidis-üürileping"];

export function LoanQuiz({ open, onClose, project }: { open: boolean; onClose: () => void; project: string }) {
  const [step, setStep] = useState(-1);
  const [pick, setPick] = useState<number | null>(null);
  const [docs, setDocs] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const finish = () => {
    updateLife((l) => {
      if (!l.quizDone) { l.points += 10 + score * 5; grantReward(l, "Läbisin laenutaotluse õppetunni"); }
      l.quizDone = true;
      addLog(l, `Läbisid laenutaotluse õppetunni (${score}/3).`);
    });
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Laenutaotluse õppimine">
      <div className="space-y-3">
        <Note tone="warn">Õppemäng. See ei ole Coop Panga laenupakkumine ega krediidiotsus.</Note>
        {step === -1 && (
          <>
            <p className="text-sm font-semibold">{project}</p>
            <p className="text-sm">Vali näidistaotlusele dokumendikaardid (väljamõeldud):</p>
            <div className="grid grid-cols-2 gap-2">
              {DOCS.map((d) => <Choice key={d} active={docs.includes(d)} onClick={() => setDocs((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]))}>{d}</Choice>)}
            </div>
            <p className="text-xs text-muted-foreground">Päris kontoväljavõtteid, isikut tõendavaid dokumente ega paroole ei koguta.</p>
            <Btn onClick={() => setStep(0)}>Edasi</Btn>
          </>
        )}
        {step >= 0 && step < QS.length && (
          <>
            <p className="text-xs font-bold text-accent">Küsimus {step + 1}/3</p>
            <p className="font-display text-lg font-bold">{QS[step]!.q}</p>
            <div className="grid gap-2">
              {QS[step]!.a.map((a, i) => (
                <button key={a} disabled={pick !== null} onClick={() => { setPick(i); if (i === QS[step]!.ok) setScore((s) => s + 1); }}
                  className={cn("rounded-2xl border-2 p-3 text-left text-sm font-semibold", pick === null ? "border-border" : i === QS[step]!.ok ? "border-success bg-success/10" : i === pick ? "border-destructive bg-destructive/10" : "border-border opacity-50")}>
                  {a}
                </button>
              ))}
            </div>
            {pick !== null && (
              <>
                <p className="rounded-2xl bg-secondary p-3 text-sm"><b>Plussik:</b> {QS[step]!.why}</p>
                <Btn onClick={() => { setPick(null); setStep((s) => s + 1); }}>{step === 2 ? "Vaata tulemust" : "Järgmine"}</Btn>
              </>
            )}
          </>
        )}
        {step === QS.length && (
          <>
            <p className="font-display text-2xl font-extrabold">{score}/3 õigesti</p>
            <p className="text-sm">Nüüd tead, mida laenu juures vaadata. Võid naasta otsuse juurde. Päriselt võib pank küsida lisateavet.</p>
            <Btn variant="accent" onClick={finish}>Tagasi otsuse juurde</Btn>
          </>
        )}
      </div>
    </Sheet>
  );
}
