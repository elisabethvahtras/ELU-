import { useState } from "react";
import { Car, House, PiggyBank, Plane, Save, Target } from "lucide-react";
import { GOAL_DEFAULT, GOAL_LABEL, updateLife, type Goal, type Life } from "@/lib/game/store";
import { Btn, NumField, Sheet } from "./ui";

const icons = { home: House, car: Car, buffer: PiggyBank, trip: Plane, other: Target };
export function GoalEditor({ life, onClose }: { life: Life; onClose: () => void }) {
  const [goal, setGoal] = useState<Goal>(life.goal);
  const [name, setName] = useState(life.goalText);
  const [amount, setAmount] = useState(life.goalTarget);
  const valid = name.trim().length > 0 && Number.isFinite(amount) && amount > 0;
  return <Sheet open onClose={onClose} title="Muuda oma eesmärki">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">{(Object.keys(GOAL_LABEL) as Goal[]).map((key) => {
        const Icon = icons[key];
        return <Btn key={key} variant={goal === key ? "primary" : "outline"} onClick={() => { setGoal(key); setName(key === "other" ? "" : GOAL_LABEL[key]); setAmount(GOAL_DEFAULT[key]); }} className={key === "other" ? "col-span-2" : ""}><Icon className="size-4 shrink-0" />{key === "other" ? "Minu enda eesmärk" : GOAL_LABEL[key]}</Btn>;
      })}</div>
      <label className="block text-xs font-semibold text-muted-foreground">Eesmärgi nimi<input aria-label="Eesmärgi nimi" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground" /></label>
      <NumField label="Eesmärgi summa" value={amount} onChange={setAmount} />
      <Btn disabled={!valid} onClick={() => { if (!valid) return; updateLife((current) => { current.goal = goal; current.goalText = name.trim(); current.goalTarget = amount; }); onClose(); }}><Save className="size-4" />Salvesta eesmärk</Btn>
    </div>
  </Sheet>;
}