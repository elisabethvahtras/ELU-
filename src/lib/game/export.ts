import { formatLifeMonth } from "./dates";
import {
  age,
  assets,
  debts,
  fixedCosts,
  householdCosts,
  householdIncome,
  lifeNetWorth,
  loanPayments,
  monthlyLeft,
  rentIncome,
  type HistoryPoint,
  type Life,
} from "./store";

export type CsvValue = string | number;

/** Numbers without currency symbols: plain digits with a comma decimal separator (Estonian Excel). */
export function csvNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded).replace(".", ",");
}

/** Semicolon separated cells so Estonian Excel and Google Sheets split columns automatically. */
export function csvCell(v: CsvValue): string {
  const s = typeof v === "number" ? csvNumber(v) : v;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: CsvValue[][]): string {
  return rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
}

function block(title: string, header: string[], rows: CsvValue[][]): CsvValue[][] {
  return [[title], header, ...rows, []];
}

const historyHeader = ["Kuupäev", "Kuu", "Vanus", "Netoväärtus", "Raha", "Puhver", "Investeeringud", "Varad", "Laenud", "Netopalk", "Püsikulud", "Kuus jääb"];

const historyRow = (life: Life, p: HistoryPoint): CsvValue[] => [
  formatLifeMonth(life.startDate, p.m),
  p.m,
  p.age,
  p.nw,
  p.account,
  p.savings,
  p.investments,
  p.assets,
  p.debts,
  p.income,
  p.costs,
  p.left,
];

/** One life as a spreadsheet: summary, month-by-month history, loans, property, rewards and events. */
export function lifeCsv(life: Life): string {
  const rows: CsvValue[][] = [
    ...block("Ülevaade", ["Näitaja", "Väärtus"], [
      ["Elu nimi", life.lifeName],
      ["Mängija", life.playerName],
      ["Vanus", age(life)],
      ["Algvana", life.startAge],
      ["Sihtvanus", life.lifeExpectancy],
      ["Mängitud kuud", life.months],
      ["Kuu", formatLifeMonth(life.startDate, life.months)],
      ["Netoväärtus", lifeNetWorth(life)],
      ["Raha kokku", life.account + life.savings],
      ["Kontol vabalt kasutatav raha", life.account],
      ["Puhvriks eraldatud raha", life.savings],
      ["Investeeringute hetkeväärtus", life.investments],
      ["Investeeringutesse sisse makstud", life.investedPrincipal],
      ["Investeeringute tulemus", life.investments - life.investedPrincipal],
      ["Varad (auto, kinnisvara)", assets(life)],
      ["Laenude jääk", debts(life)],
      ["Netopalk kuus", life.income],
      ["Leibkonna sissetulek kuus", householdIncome(life)],
      ["Töö", life.job],
      ["Elukoht", life.housing],
      ["Püsikulud kuus", fixedCosts(life)],
      ["sh leibkond ja õpingud", householdCosts(life)],
      ["Üüritulu kuus", rentIncome(life)],
      ["Laenumaksed kuus", loanPayments(life)],
      ["Igakuine sääst", life.saveMonthly],
      ["Igakuine investeerimine", life.investMonthly],
      ["Kuus jääb üle", monthlyLeft(life)],
      ["Eesmärk", life.goalText],
      ["Eesmärgi summa", life.goalTarget],
      ["Punktid", life.points],
      ["Head otsused", life.goodDecisions],
      ["Hinnatase (inflatsioon)", life.priceLevel],
    ]),
    ...block("Kuu ülevaade", historyHeader, life.history.map((p) => historyRow(life, p))),
    ...block("Laenud", ["Nimetus", "Jääk", "Aastaintress", "Kuumakse", "Kuu alles"], life.loans.map((loan) => [
      loan.label,
      loan.balance,
      loan.rate,
      loan.payment,
      loan.monthsLeft,
    ])),
    ...block("Kinnisvara", ["Nimetus", "Ostuhind", "Hetkeväärtus", "Üür kuus", "Kulud kuus", "Üürnik", "Seotud laen"], life.properties.map((property) => [
      property.name,
      property.price,
      property.value,
      property.rent,
      property.costs,
      property.occupied ? "Jah" : "Ei",
      property.loanId ?? "",
    ])),
    ...block("Preemiad", ["Saavutus", "Toode", "Kood", "Päev"], life.rewards.map((reward) => [
      reward.achievement,
      reward.product,
      reward.code,
      new Date(reward.at).toISOString().slice(0, 10),
    ])),
    ...block("Sündmused", ["Kuupäev", "Kuu", "Sündmus"], life.log.map((entry) => [
      formatLifeMonth(life.startDate, entry.m),
      entry.m,
      entry.text,
    ])),
  ];
  return toCsv(rows);
}

/** Every life in one file: one summary row per life plus every month of every life. */
export function allLivesCsv(lives: Life[]): string {
  const rows: CsvValue[][] = [
    ...block("Elud", ["Elu nimi", "Mängija", "Vanus", "Mängitud kuud", "Netoväärtus", "Raha kokku", "Investeeringud", "Varad", "Laenud", "Netopalk kuus", "Püsikulud kuus", "Kuus jääb", "Punktid", "Head otsused"], lives.map((life) => [
      life.lifeName,
      life.playerName,
      age(life),
      life.months,
      lifeNetWorth(life),
      life.account + life.savings,
      life.investments,
      assets(life),
      debts(life),
      life.income,
      fixedCosts(life),
      monthlyLeft(life),
      life.points,
      life.goodDecisions,
    ])),
    ...block("Kuu ülevaade", ["Elu nimi", ...historyHeader], lives.flatMap((life) => life.history.map((p) => [life.lifeName, ...historyRow(life, p)]))),
  ];
  return toCsv(rows);
}

export function safeFileName(name: string): string {
  const cleaned = name.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
  return cleaned.length > 0 ? cleaned : "elu";
}

/** Save a CSV file to the device. The byte-order mark keeps Estonian letters readable in Excel. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
