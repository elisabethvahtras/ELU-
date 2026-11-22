import { useRef, useState } from "react";
import { ArrowRight, CalendarDays, Check, Coins, TrendingUp, Wallet } from "lucide-react";
import { formatLifeMonth } from "@/lib/game/dates";
import { eur } from "@/lib/game/finance";
import { advanceMonth, canAdvanceMonth, fixedCosts, householdIncome, lifeNetWorth, loanPayments, monthlyLeft, rentIncome, type Life } from "@/lib/game/store";
import { Btn, Note, Sheet } from "./ui";
import { Row } from "./Frame";

export function MonthTurn({ life, onOpenChange }: { life: Life; onOpenChange: (open: boolean) => void }) {
  const [stage, setStage] = useState<"review" | "result" | null>(null);
  const [before, setBefore] = useState({ month: life.months, account: life.account, worth: lifeNetWorth(life) });
  const committed = useRef(false);
  const close = () => { setStage(null); onOpenChange(false); };
  const confirm = () => {
    if (committed.current || life.pendingEvent || !canAdvanceMonth(life) || life.months !== before.month) return;
    committed.current = true;
    advanceMonth();
    setStage("result");
  };
  const change = lifeNetWorth(life) - before.worth;
  return <>
    <Btn disabled={!canAdvanceMonth(life) || !!life.pendingEvent} onClick={() => {
      committed.current = false;
      setBefore({ month: life.months, account: life.account, worth: lifeNetWorth(life) });
      setStage("review");
      onOpenChange(true);
    }} className="rounded-lg py-2">
      <CalendarDays className="size-4 shrink-0" />
      {canAdvanceMonth(life) ? "Liigu kuu edasi" : "Jõudsid 130. eluaastani"}
      <ArrowRight className="size-4 shrink-0" />
    </Btn>
    <Sheet open={stage !== null} onClose={close} title={stage === "result" ? "Sinu kuu tulemused" : "Enne uut kuud"}>
      {stage === "review" ? <div className="space-y-4">
        <p className="flex flex-wrap items-center gap-2 text-sm font-bold capitalize text-primary"><CalendarDays className="size-5" />{formatLifeMonth(life.startDate, life.months)}<ArrowRight className="size-4" />{formatLifeMonth(life.startDate, life.months + 1)}</p>
        <div className="divide-y divide-border">
          <Row l="Leibkonna sissetulek ja üüritulu" v={eur(householdIncome(life) + rentIncome(life))} />
          <Row l="Elamiskulud" v={eur(fixedCosts(life))} />
          <Row l="Laenumaksed" v={eur(loanPayments(life))} />
          <Row l="Säästudesse ja investeeringutesse" v={eur(life.saveMonthly + life.investMonthly)} />
          <Row l="Kontole jääb sellest kuust" v={eur(monthlyLeft(life))} strong />
        </div>
        <Note tone={monthlyLeft(life) < 0 ? "warn" : "muted"}>{monthlyLeft(life) < 0 ? "Kulud ületavad sissetulekut: vahe läheb sinu kontolt maha." : "Kuu jooksul laekub sissetulek ning tasutakse kulud ja kuumaksed."} Investeeringute väärtus võib muutuda ja ette võib tulla elusündmus.</Note>
        <div className="grid grid-cols-2 gap-2"><Btn variant="outline" onClick={close}>Muudan valikuid</Btn><Btn onClick={confirm}>Alusta uut kuud<ArrowRight className="size-4" /></Btn></div>
      </div> : <div className="space-y-4">
        <p className="flex items-center gap-2 text-sm font-bold capitalize text-primary"><Check className="size-5" />{formatLifeMonth(life.startDate, life.months)}</p>
        <div className="flex items-center gap-3 border-y border-border py-4"><Coins className="size-8 text-primary" /><div><p className="text-xs text-muted-foreground">Kogu varaväärtuse muutus</p><p className={`text-2xl font-bold ${change < 0 ? "text-destructive" : "text-success"}`}>{change >= 0 ? "+" : ""}{eur(change)}</p></div></div>
        <p className="flex items-center gap-2 text-sm"><Wallet className="size-4 shrink-0 text-primary" />Kontol {eur(life.account)} · muutus {life.account >= before.account ? "+" : ""}{eur(life.account - before.account)}</p>
        {life.lastInvestmentPerformance?.percent != null && <p className="flex items-center gap-2 text-sm"><TrendingUp className="size-4 shrink-0 text-primary" />Investeeringute turumuutus: {eur(life.lastInvestmentPerformance.amount)} ({life.lastInvestmentPerformance.percent.toFixed(2)}%)</p>}
        {life.log.filter((entry) => entry.m === life.months).map((entry, i) => <Note key={i}>{entry.text}</Note>)}
        {life.pendingEvent && <Note>Sel kuul juhtus midagi: {life.pendingEvent.title}</Note>}
        <Btn onClick={close}>{life.pendingEvent ? "Vaata elusündmust" : "Tagasi oma elu juurde"}<ArrowRight className="size-4" /></Btn>
      </div>}
    </Sheet>
  </>;
}