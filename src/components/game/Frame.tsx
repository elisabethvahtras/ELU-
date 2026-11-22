import { useRef, useState, type ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { canAffordCost, eur, SCENARIO_LABEL, type CompareColumn, type Scenario } from "@/lib/game/finance";
import { addLog, grantReward, isGoodDecisionReward, updateLife, type Life } from "@/lib/game/store";
import { AiBubble, Btn, Note, Sheet } from "./ui";
import { cn } from "@/lib/utils";

export function DecisionFrame(props: {
  title: string;
  open: boolean;
  onClose: () => void;
  question: string | null;
  editor: ReactNode;
  preview: ReactNode;
  upfront: number;
  life: Life;
  onConfirm: (l: Life) => void;
  logText: string;
  canPreview?: boolean;
  fullPreview?: boolean;
  previewLabel?: string | undefined;
  confirmLabel?: string | undefined;
  keepOpenOnConfirm?: boolean | undefined;
  risks?: string[] | undefined;
}) {
  const [stage, setStage] = useState<"edit" | "preview">("edit");
  const sawQuestion = useRef(false);
  if (props.question) sawQuestion.current = true;
  const afford = canAffordCost(props.life.account + props.life.savings, props.upfront);
  const close = () => {
    setStage("edit");
    sawQuestion.current = false;
    props.onClose();
  };
  return (
    <Sheet open={props.open} onClose={close} title={stage === "edit" ? props.title : "Vaata oma otsuse mõju ja riske"} full={stage === "preview" && props.fullPreview}>
      {stage === "edit" ? (
        <div className="space-y-4">
          {props.editor}
          {props.question && <AiBubble text={props.question} />}
          <div className="sticky -bottom-6 -mx-5 border-t border-border bg-card px-5 pb-6 pt-3">
            <Btn disabled={props.canPreview === false} onClick={() => setStage("preview")}>{props.previewLabel ?? "Vaata mõju"}</Btn>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {props.preview}
          <RiskReview upfront={props.upfront} risks={props.risks} />
          <p className="rounded-2xl bg-muted p-3 text-sm">„See on sinu valiku rahaline mõju. Elu võib kulgeda teisiti. Soovid jätkata?”</p>
          {!afford && <Note tone="warn">Selle valiku tegemiseks puudub praegu piisav raha. Proovi odavamat hinda, väiksemat sissemakset või kogu enne veel.</Note>}
          <Btn
            variant="accent"
            disabled={!afford}
            onClick={() => {
              updateLife((l) => {
                props.onConfirm(l);
                l.points += 10;
                if (!props.question) {
                  l.goodDecisions += 1;
                  if (isGoodDecisionReward(l.goodDecisions)) grantReward(l, "Tegin 10 head finantsilist otsust");
                }
                if (sawQuestion.current && !props.question) l.points += 5;
                if (props.question) {
                  l.impulse += 1;
                  l.points -= 5;
                } else l.impulse = 0;
                addLog(l, props.logText);
              });
              if (props.keepOpenOnConfirm) {
                setStage("edit");
                sawQuestion.current = false;
              } else close();
            }}
          >
            {props.confirmLabel ?? "Valin selle tee"}
          </Btn>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="outline" onClick={() => setStage("edit")}>Muudan tingimusi</Btn>
            <Btn variant="ghost" onClick={close}>Tagasi minu ellu</Btn>
          </div>
        </div>
      )}
    </Sheet>
  );
}

export function RiskReview({ upfront = 0, risks }: { upfront?: number; risks?: string[] | undefined }) {
  const items = risks ?? [
    upfront > 0 ? `Vaba raha väheneb kohe ${eur(upfront)} võrra.` : "Sinu igakuine rahavoog või püsikulud võivad muutuda.",
    "Ootamatud kulud võivad nõuda lisaraha. Kontrolli, et sul jääks piisav rahaline puhver.",
    "Eelvaade on mängu hinnang, mitte tegeliku tulemuse lubadus.",
  ];
  return (
    <section className="rounded-2xl border border-primary/20 bg-secondary/60 p-3.5" aria-label="Enne lõplikku otsust">
      <div className="flex items-center gap-2 text-primary"><ShieldAlert className="size-5 shrink-0" /><p className="text-sm font-extrabold">Enne lõplikku otsust</p></div>
      <ul className="mt-2 space-y-1.5">
        {items.map((risk) => <li key={risk} className="flex gap-2 text-xs leading-relaxed text-secondary-foreground"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />{risk}</li>)}
      </ul>
    </section>
  );
}

export function Toggle<T extends string | number>({ options, value, onChange, label }: { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full bg-muted p-1">
      {options.map((o) => (
        <button key={String(o.v)} onClick={() => onChange(o.v)} className={cn("flex-1 rounded-full px-2 py-1.5 text-xs font-bold transition", value === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function CompareView({ compute, chosen, assumptions }: { compute: (years: number, s: Scenario) => CompareColumn[]; chosen?: string; assumptions: string }) {
  const [years, setYears] = useState(10);
  const [sc, setSc] = useState<Scenario>("base");
  const cols = compute(years, sc);
  const best = Math.max(...cols.map((c) => c.netWorth));
  const rows: [string, (c: CompareColumn) => number][] = [
    ["Allesjäänud raha", (c) => c.cash],
    ["Püsikulu kuus", (c) => c.monthly],
    ["Perioodi kogukulu", (c) => c.totalCost],
    ["Investeeringute väärtus", (c) => c.investments],
    ["Vara jääkväärtus", (c) => c.assetValue],
    ["Laenujääk", (c) => c.loanBalance],
    ["Kaugus eesmärgist", (c) => c.goalGap],
  ];
  return (
    <div className="space-y-3">
      <Toggle label="Periood" options={[{ v: 1, l: "1 aasta" }, { v: 5, l: "5 aastat" }, { v: 10, l: "10 aastat" }]} value={years} onChange={setYears} />
      <Toggle label="Stsenaarium" options={(["bad", "base", "good"] as Scenario[]).map((v) => ({ v, l: SCENARIO_LABEL[v] }))} value={sc} onChange={setSc} />
      <div className="grid grid-cols-3 gap-2">
        {cols.map((c) => (
          <div key={c.key} className={cn("rounded-2xl border-2 p-2.5", c.key === chosen ? "border-accent bg-card" : "border-border bg-card")}>
            <p className="text-[10px] font-black text-accent">{c.key}</p>
            <p className="min-h-8 text-xs font-bold leading-tight">{c.title}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">Netoväärtus</p>
            <p className={cn("font-display text-lg font-extrabold", c.netWorth === best ? "text-success" : "")}>{eur(c.netWorth)}</p>
            <dl className="mt-2 space-y-1.5">
              {rows.map(([l, f]) => (
                <div key={l}>
                  <dt className="text-[10px] leading-tight text-muted-foreground">{l}</dt>
                  <dd className="text-xs font-semibold">{eur(f(c))}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <Note>Kõik teed algavad samast rahalisest lähteolukorrast; palk on kõigis teedes sama ja seetõttu välja jäetud. {assumptions} Näidiseeldus, mitte lubadus ega Coop Panga toote tootlus.</Note>
    </div>
  );
}

export function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-muted-foreground">{l}</span>
      <span className={strong ? "font-extrabold" : "font-semibold"}>{v}</span>
    </div>
  );
}
