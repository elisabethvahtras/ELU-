import { useState } from "react";
import { goalProgress, type Life } from "@/lib/game/store";
import { sceneUnlocks } from "@/lib/game/scene";

export type ObjKey = "car" | "home" | "work" | "bank" | "invest" | "household" | "phone" | "bag";
const LABEL: Record<ObjKey, string> = { car: "Auto", home: "Kodu", work: "Töö ja karjäär", bank: "Pank", invest: "Investeerimine", household: "Leibkond", phone: "Sõber", bag: "Ostukott" };

function Hot({ k, onPick, children, glowCx, glowCy, r = 26, dimmed = false }: { k: ObjKey; onPick: (k: ObjKey) => void; children: React.ReactNode; glowCx: number; glowCy: number; r?: number; dimmed?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <g role="button" tabIndex={0} aria-label={LABEL[k]} className="scene-hot cursor-pointer outline-none" opacity={dimmed ? 0.45 : 1} onClick={() => onPick(k)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(k); } }} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      {hover && !dimmed && <circle cx={glowCx} cy={glowCy} r={r} fill="var(--primary)" opacity=".10" />}
      {children}
      {hover && (
        <g>
          <rect x={glowCx - 40} y={glowCy - r - 22} width="80" height="18" rx="9" fill="var(--foreground)" />
          <text x={glowCx} y={glowCy - r - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--background)">{LABEL[k]}</text>
        </g>
      )}
    </g>
  );
}

export function LifeScene({ life, onPick, compact = false }: { life: Life; onPick: (k: ObjKey) => void; compact?: boolean }) {
  const kind = life.housing === "own" ? (life.home?.kind ?? "flat") : life.housing;
  const level = life.careerLevel > 1 || life.skills > 0;
  const unlocked = sceneUnlocks(goalProgress(life), life.milestones);
  return (
    <div className={`bg-scene overflow-hidden rounded-2xl border border-border/60 ${compact ? "h-full min-h-0" : "shadow-soft"}`}>
      <svg viewBox="0 0 360 300" className={`block w-full ${compact ? "h-full" : ""}`} role="img" aria-label="Sinu elu">
        {/* Sky */}
        <ellipse cx="78" cy="46" rx="30" ry="9" fill="var(--card)" opacity=".9" />
        <ellipse cx="196" cy="30" rx="22" ry="6.5" fill="var(--card)" opacity=".75" />
        <g className="scene-bird" aria-hidden="true" stroke="var(--steel)" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M296 49q6-6 12 0q6-6 12 0M324 63q4-4 8 0q4-4 8 0" />
        </g>

        {/* Lawn, pavement, road */}
        <rect y="200" width="360" height="100" fill="var(--grass)" />
        <rect y="228" width="360" height="8" fill="var(--ground)" />
        <rect y="236" width="360" height="32" fill="var(--steel)" />
        <path d="M0 252h360" stroke="var(--card)" strokeDasharray="12 12" strokeWidth="2" opacity=".85" />
        <rect y="268" width="360" height="5" fill="var(--ground)" />

        {/* HOME */}
        <Hot k="home" onPick={onPick} glowCx={86} glowCy={165} r={62}>
          <ellipse cx="86" cy="231" rx="50" ry="4" fill="var(--foreground)" opacity=".18" />
          {kind === "rent" && (
            <g>
              <rect x="46" y="96" width="82" height="132" rx="3" fill="var(--wall)" stroke="var(--border)" strokeWidth="1.5" />
              <rect x="46" y="96" width="82" height="7" rx="3" fill="var(--accent)" />
              {[0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={56 + c * 24} y={106 + r * 24} width="15" height="14" rx="2" fill={r === 3 && c === 1 ? "var(--sun)" : "var(--card)"} stroke="var(--steel)" strokeWidth="1.2" />))}
              <rect x="76" y="206" width="22" height="22" rx="2" fill="var(--accent)" />
            </g>
          )}
          {(kind === "parents" || kind === "house") && (
            <g>
              <rect x="106" y="102" width="11" height="26" fill="var(--roof)" />
              <path d="M36 142 86 98 136 142z" fill="var(--roof)" />
              <rect x="46" y="140" width="80" height="88" fill="var(--wall)" stroke="var(--border)" strokeWidth="1.5" />
              <rect x="56" y="156" width="20" height="20" rx="2" fill="var(--card)" stroke="var(--steel)" strokeWidth="1.4" />
              <path d="M66 156v20M56 166h20" stroke="var(--steel)" strokeWidth="1" />
              <rect x="96" y="156" width="20" height="20" rx="2" fill="var(--card)" stroke="var(--steel)" strokeWidth="1.4" />
              <path d="M106 156v20M96 166h20" stroke="var(--steel)" strokeWidth="1" />
              <rect x="76" y="190" width="18" height="38" rx="2" fill="var(--accent)" />
              <circle cx="90" cy="209" r="1.8" fill="var(--card)" />
            </g>
          )}
          {kind === "flat" && (
            <g>
              <rect x="52" y="112" width="70" height="116" rx="4" fill="var(--wall)" stroke="var(--border)" strokeWidth="1.5" />
              <rect x="48" y="104" width="78" height="10" rx="4" fill="var(--primary)" />
              {[0, 1, 2].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={62 + c * 32} y={126 + r * 30} width="20" height="18" rx="2" fill={r === 0 && c === 1 ? "var(--sun)" : "var(--card)"} stroke="var(--steel)" strokeWidth="1.2" />))}
              <rect x="76" y="206" width="22" height="22" rx="2" fill="var(--accent)" />
            </g>
          )}
          {life.renovated && (
            <g stroke="var(--warm)" strokeWidth="3" strokeLinecap="round">
              <path d="M140 232 128 162" />
              <path d="M148 232 136 162" />
              <path d="M136.7 210h8" strokeWidth="2" />
              <path d="M134.2 196h8" strokeWidth="2" />
              <path d="M131.6 182h8" strokeWidth="2" />
              <path d="M129.1 168h8" strokeWidth="2" />
            </g>
          )}
        </Hot>

        {/* CAR stays on the road, clear of the workplace. */}
        <Hot k="car" onPick={onPick} glowCx={186} glowCy={254} r={34} dimmed={!life.car}>
            <g className={life.car ? "scene-unlock" : "scene-car-unowned"} aria-label={life.car ? life.car.name : "Auto veel puudub"}>
              <ellipse cx="185" cy="270" rx="38" ry="3.5" fill="var(--foreground)" opacity=".16" />
              <path d="M160 244 168 230h28l9 14z" fill="var(--steel)" stroke="var(--accent)" strokeWidth="1.2" />
              <path d="M169 242 174 232h8v10zM186 242v-10h8l5 10z" fill="var(--sky)" />
              <rect x="148" y="242" width="74" height="19" rx="8" fill="var(--steel)" stroke="var(--accent)" strokeWidth="1.2" />
              <rect x="151" y="248" width="5" height="4" rx="2" fill="var(--sun)" />
              <circle cx="165" cy="262" r="7" fill="var(--foreground)" />
              <circle cx="207" cy="262" r="7" fill="var(--foreground)" />
              <circle cx="165" cy="262" r="2.8" fill="var(--card)" />
              <circle cx="207" cy="262" r="2.8" fill="var(--card)" />
            </g>
          {!life.car && <text x="185" y="284" textAnchor="middle" fontSize="9" fontWeight="500" fill="var(--foreground)">Auto veel puudub</text>}
        </Hot>

        {/* WORK: an open desk and a small career badge, not a floating card. */}
        <Hot k="work" onPick={onPick} glowCx={186} glowCy={188} r={42}>
          <ellipse cx="186" cy="226" rx="40" ry="4" fill="var(--foreground)" opacity=".13" />
          <rect x="157" y="151" width="58" height="21" rx="10.5" fill="var(--secondary)" stroke="var(--primary)" strokeWidth="1" />
          <circle cx="168" cy="161.5" r="4" fill="var(--primary)" />
          <path d="M166.5 161.5h3M168 160v3" stroke="var(--card)" strokeWidth="1" strokeLinecap="round" />
          <text x="190" y="165" textAnchor="middle" fontSize="9" fontWeight="500" fill="var(--accent)">TÖÖ</text>
          <rect x="151" y="198" width="70" height="6" rx="3" fill="var(--accent)" />
          <path d="M158 204v20M214 204v20" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          <rect x="159" y="176" width="29" height="20" rx="2.5" fill="var(--accent)" />
          <rect x="162" y="179" width="23" height="14" rx="1" fill={level ? "var(--sky)" : "var(--secondary)"} />
          <path d="M157 196h33l3 3h-39z" fill="var(--foreground)" opacity=".85" />
          <path d="M166 186h14" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
          {level && (
            <g aria-label={`Karjääri tase ${life.careerLevel}`}>
              <rect x="190" y="132" width="50" height="16" rx="8" fill="var(--primary)" stroke="var(--card)" strokeWidth="1.5" />
              <text x="215" y="143" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--card)">TASE {life.careerLevel}</text>
            </g>
          )}
        </Hot>

        {/* PHONE on the desk */}
        <Hot k="phone" onPick={onPick} glowCx={201} glowCy={188} r={16}>
          <rect x="196" y="180" width="11" height="16" rx="2.5" fill="var(--foreground)" />
          <rect x="198" y="182" width="7" height="11" rx="1" fill="var(--sky)" />
          <circle cx="206" cy="180" r="4" fill="var(--destructive)" />
          <text x="206" y="182.6" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="var(--card)">1</text>
        </Hot>

        {/* BANK */}
        <Hot k="bank" onPick={onPick} glowCx={291} glowCy={175} r={40}>
          <ellipse cx="291" cy="233" rx="46" ry="4" fill="var(--foreground)" opacity=".18" />
          {life.investments > 0 && (
            <g stroke="var(--success)" strokeWidth="3" fill="none" strokeLinecap="round">
              <path d="M262 126l12-10 8 4 12-14" />
              <path d="M286 106h8v8" />
            </g>
          )}
          <path d="M252 152 291 130 330 152z" fill="var(--primary)" />
          <rect x="252" y="152" width="78" height="6" fill="var(--primary)" />
          {[262, 280, 298, 316].map((x) => <rect key={x} x={x - 4} y="160" width="8" height="58" fill="var(--sky)" stroke="var(--border)" strokeWidth="1" />)}
          <rect x="252" y="218" width="78" height="6" fill="var(--primary)" opacity=".7" />
          <rect x="246" y="224" width="90" height="6" rx="2" fill="var(--primary)" />
        </Hot>

        {/* SHOPPING BAG on the near lawn */}
        <Hot k="bag" onPick={onPick} glowCx={36} glowCy={274} r={28}>
          <ellipse cx="36" cy="292" rx="22" ry="3.5" fill="var(--foreground)" opacity=".16" />
          <rect x="20" y="250" width="9" height="18" rx="1.5" fill="var(--sun)" />
          <path d="M20 250 24.5 244 29 250z" fill="var(--sun)" />
          <path d="M36 270 50 244" stroke="var(--warm)" strokeWidth="7" strokeLinecap="round" />
          <path d="M15 264h42l-4 26H19z" fill="var(--primary)" />
          <path d="M15 264h42l-1.5 9H16.5z" fill="var(--sky)" opacity=".55" />
          <path d="M23 264c0-10 11-10 11 0" stroke="var(--card)" strokeWidth="2.5" fill="none" />
          <path d="M38 264c0-10 11-10 11 0" stroke="var(--card)" strokeWidth="2.5" fill="none" />
        </Hot>
        {unlocked.goal && <g className="scene-unlock" role="img" aria-label={`Eesmärk saavutatud: ${life.goalText}`}>
          <title>{`Eesmärk saavutatud: ${life.goalText}`}</title>
          <path d="M57 70q124 22 246 0" stroke="var(--steel)" strokeWidth="1" fill="none" />
          {[72, 107, 142, 177, 212, 247, 282].map((x, i) => <path key={x} d={`M${x} ${i === 0 || i === 6 ? 72 : 79}l10 2-6 12z`} fill={i % 2 === 0 ? "var(--primary)" : "var(--success)"} />)}
          <g className="scene-goal-token">
            {life.goal === "trip" ? <g>
              <rect x="320" y="274" width="24" height="21" rx="3" fill="var(--primary)" />
              <path d="M327 274v-4h10v4M328 277v14M336 277v14" stroke="var(--card)" strokeWidth="2" fill="none" />
            </g> : life.goal === "buffer" ? <g>
              <ellipse cx="330" cy="285" rx="14" ry="10" fill="var(--primary)" />
              <path d="M319 284l-4-3M323 293v4M337 293v4" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
              <path d="M325 278h8" stroke="var(--card)" strokeWidth="2" /><circle cx="339" cy="282" r="1.5" fill="var(--card)" />
              <circle cx="329" cy="270" r="4" fill="var(--success)" />
            </g> : <g>
              <path d="M322 272h18v10c0 11-18 11-18 0z" fill="var(--success)" />
              <path d="M322 275h-5v5c0 4 5 6 8 6M340 275h5v5c0 4-5 6-8 6M331 290v5M325 297h12" stroke="var(--success)" strokeWidth="2" fill="none" />
              <path d="M327 280l3 3 5-6" stroke="var(--card)" strokeWidth="2" fill="none" />
            </g>}
          </g>
        </g>}
      </svg>
    </div>
  );
}
