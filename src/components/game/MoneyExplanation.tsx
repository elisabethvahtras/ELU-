import { PiggyBank, Wallet } from "lucide-react";

export function MoneyExplanation() {
  return <div className="space-y-3 border-y border-border py-3 text-xs">
    <p className="flex items-start gap-2"><Wallet className="size-5 shrink-0 text-primary" /><span><strong>Konto</strong> on igapäevane raha: siia laekub sissetulek ning siit lähevad arved ja ostud.</span></p>
    <p className="flex items-start gap-2"><PiggyBank className="size-5 shrink-0 text-primary" /><span><strong>Puhver</strong> on sinu enda rahast kõrvale pandud osa ootamatute kulude jaoks. Päriselus võib see olla eraldi säästukontol; siin mängus on see eraldi arvestuses.</span></p>
    <p className="text-muted-foreground">Raha kokku = konto + puhver. Kõrvale panemine ei tekita uut raha. Suurte ostude puhul kasutatakse esmalt kontot ja vajadusel puhvrit.</p>
  </div>;
}