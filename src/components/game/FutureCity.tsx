import { eur } from "@/lib/game/finance";
import type { Life } from "@/lib/game/store";
import { ChevronRight } from "lucide-react";
import { Btn } from "./ui";

export type FutureCitySection = "home" | "investments" | "bank";

export function FutureCity({ life, age, cash, investments, assets, shortfall, onPick }: { life: Life; age: number; cash: number; investments: number; assets: number; shortfall: boolean; onPick: (section: FutureCitySection) => void }) {
  return <figure className="future-city bg-scene min-h-0 overflow-hidden" aria-label={`Sinu tulevikulinn ${age}-aastaselt`}>
    <figcaption className="px-3 pt-2 text-xs font-bold text-primary">Sinu linn · {age} a</figcaption>
    <div className="relative flex min-h-0 flex-1">
    <svg viewBox="0 0 440 205" className="block h-full max-h-full w-full" aria-hidden="true">
      <ellipse cx="64" cy="25" rx="27" ry="6" fill="var(--card)" />
      <ellipse cx="370" cy="19" rx="32" ry="7" fill="var(--card)" />
      {/* A single streetscape, with consistent perspective and a shared pavement. */}
      <path d="M0 156h440v49H0z" fill="var(--grass)" />
      <path d="M0 171h440v12H0z" fill="var(--ground)" />
      <path d="M0 183h440v22H0z" fill="var(--steel)" />
      <path d="M0 194h440" stroke="var(--card)" strokeWidth="2" strokeDasharray="16 12" />
      <g aria-label={life.home ? "Oma kodu säilib prognoosis" : "Praegune elukoht"}>
        <ellipse cx="87" cy="165" rx="65" ry="5" fill="var(--roof)" opacity=".12" />
        <path d="M112 44h12v34h-12z" fill="var(--roof)" />
        <path d="M28 86 83 41l63 40-17 10-46-31-44 36z" fill="var(--roof)" />
        <path d="M39 86 83 51l46 32v79H39z" fill="var(--wall)" stroke="var(--border)" />
        <path d="M129 83l17-2v73l-17 8z" fill="var(--secondary)" stroke="var(--border)" />
        <path d="M40 86 83 51l46 32" fill="none" stroke="var(--card)" strokeWidth="3" />
        {[50,100].map((x) => <g key={x}>
          <rect x={x} y="92" width="19" height="26" rx="2" fill="var(--card)" stroke="var(--steel)" strokeWidth="1.5" />
          <path d={`M${x + 9.5} 92v26M${x} 104h19`} stroke="var(--steel)" />
          <path d={`M${x - 2} 121h23`} stroke="var(--roof)" strokeWidth="2" />
        </g>)}
        <circle cx="83" cy="77" r="8" fill="var(--card)" stroke="var(--steel)" />
        <path d="M75 77h16M83 69v16" stroke="var(--steel)" />
        <rect x="74" y="126" width="21" height="36" rx="2" fill="var(--accent)" />
        <rect x="78" y="130" width="13" height="12" rx="1" fill="var(--sky)" />
        <circle cx="90" cy="149" r="1.8" fill="var(--card)" />
        <path d="M68 162h34v5H68z" fill="var(--steel)" />
      </g>
      <g aria-label={`Investeeringud ${eur(investments)}`}>
        <ellipse cx="223" cy="165" rx="48" ry="4" fill="var(--roof)" opacity=".12" />
        <path d="M177 57h72v105h-72z" fill="var(--wall)" stroke="var(--border)" />
        <path d="M249 57l16-10v105l-16 10z" fill="var(--secondary)" stroke="var(--border)" />
        <path d="M174 57l16-10h75l-16 10z" fill="var(--roof)" />
        {[69,97,125].map((y) => <g key={y}>
          {[186,207,228].map((x) => <g key={x}><rect x={x} y={y} width="13" height="19" rx="1" fill="var(--card)" stroke="var(--steel)" /><path d={`M${x} ${y + 10}h13`} stroke="var(--border)" /></g>)}
          <path d={`M177 ${y + 23}h72`} stroke="var(--border)" />
        </g>)}
        <rect x="204" y="147" width="20" height="15" fill="var(--accent)" />
        {investments > 0 && <g><path d="M185 34l18-11 15 6 22-18m-10 0h10v10" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>}
      </g>
      <g aria-label={`Raha ${eur(cash)}; varad ${eur(assets)}`}>
        <ellipse cx="352" cy="165" rx="64" ry="5" fill="var(--roof)" opacity=".12" />
        <path d="M288 85 346 50l65 33-14 8-51-26-47 28z" fill="var(--roof)" />
        <path d="M299 90h98v65h-98z" fill="var(--wall)" stroke="var(--border)" />
        <path d="M397 90l14-7v65l-14 7z" fill="var(--secondary)" />
        <path d="M299 86 346 59l51 27z" fill="var(--primary)" />
        <circle cx="346" cy="76" r="7" fill="var(--card)" />
        <path d="M342 76h8M344 72v8" stroke="var(--primary)" strokeWidth="1.6" />
        <rect x="297" y="89" width="102" height="8" rx="1" fill="var(--accent)" />
        <rect x="329" y="116" width="36" height="37" rx="2" fill="var(--accent)" />
        <path d="M335 120h24v30h-24z" fill="var(--sky)" /><path d="M347 120v30" stroke="var(--steel)" />
        {[307,325,370,388].map((x) => <g key={x}><rect x={x - 2} y="101" width="7" height="47" rx="1" fill="var(--card)" stroke="var(--border)" /><path d={`M${x - 4} 99h11M${x - 4} 149h11`} stroke="var(--steel)" strokeWidth="2" /></g>)}
        <path d="M296 153h105v5H296zM291 159h114v5H291z" fill="var(--steel)" />
        <text x="348" y="110" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--accent)">PANK</text>
        {shortfall && <g><circle cx="403" cy="39" r="12" fill="var(--destructive)" /><text x="403" y="45" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--card)">!</text></g>}
      </g>
    </svg>
    <div className="absolute inset-0 grid grid-cols-3 px-3">
      {([['home', 'elukoha'], ['investments', 'investeeringute'], ['bank', 'konto ja puhvri']] as const).map(([section, label]) => <Btn key={section} variant="ghost" onClick={() => onPick(section)} aria-label={`Vaata ${label} prognoosi ${age}-aastaselt`} title={`Vaata ${label} prognoosi`} className="h-full min-h-0 rounded-lg bg-transparent p-0 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary"><span className="sr-only">{label}</span></Btn>)}
    </div>
    </div>
    <div className="grid shrink-0 grid-cols-3 items-start gap-2 border-t border-border bg-background px-2 py-2 text-center text-sm font-medium leading-snug text-foreground" aria-label="Tulevikulinna nimetused">
      {([['home', life.home ? 'Sinu kodu' : 'Sinu elukoht'], ['investments', 'Investeeringud'], ['bank', 'Konto ja puhver']] as const).map(([section, label]) => <Btn key={section} variant="ghost" onClick={() => onPick(section)} aria-label={label} className={`min-w-0 gap-1 rounded-none bg-transparent p-0 text-sm font-medium leading-snug ${section === 'bank' && shortfall ? 'text-destructive' : ''}`}><span className="min-w-0">{section === 'investments' ? 'Investeerin\u00adgud' : label}</span><ChevronRight className="hidden size-3 shrink-0 sm:block" /></Btn>)}
    </div>
  </figure>;
}