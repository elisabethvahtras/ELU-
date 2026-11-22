import { describe, expect, it } from "vitest";
import { allLivesCsv, csvCell, csvNumber, lifeCsv, safeFileName, toCsv } from "./export";
import type { Life } from "./store";

function makeLife(overrides: Partial<Life> = {}): Life {
  const base: Life = {
    id: "x1",
    lifeName: "Minu elu",
    character: 0,
    playerName: "Henry",
    startAge: 20,
    lifeExpectancy: 100,
    startDate: "2026-01-01",
    priceLevel: 1,
    months: 0,
    income: 1600,
    job: "Disainer",
    housing: "rent",
    goal: "buffer",
    goalText: "Rahaline puhver",
    goalTarget: 5000,
    account: 800,
    savings: 1500,
    investments: 0,
    investedPrincipal: 0,
    investMonthly: 0,
    lastInvestmentPerformance: null,
    saveMonthly: 0,
    expenses: { housing: 620, food: 320, transport: 70, phone: 25, leisure: 140 },
    household: { adults: 1, children: 0, tuitionMonthly: 0, tuitionMonthsLeft: 0 },
    car: null,
    home: null,
    properties: [],
    renovated: false,
    loans: [],
    lentLoans: [],
    skills: 0,
    careerLevel: 1,
    careerXp: 0,
    lastCareerActionMonth: null,
    goodDecisions: 0,
    introSeen: true,
    points: 0,
    impulse: 0,
    milestones: [],
    rewards: [],
    quizDone: false,
    pendingEvent: null,
    log: [{ m: 0, text: "Alustasid oma elu." }],
    history: [{ m: 0, age: 20, nw: 2300, account: 800, savings: 1500, investments: 0, assets: 0, debts: 0, income: 1600, costs: 1200, left: 400 }],
  };
  return { ...base, ...overrides };
}

describe("CSV export", () => {
  it("writes numbers with a comma decimal separator and no currency symbol", () => {
    expect(csvNumber(1234.5)).toBe("1234,5");
    expect(csvNumber(-0.004)).toBe("0");
    expect(csvNumber(Number.NaN)).toBe("");
  });

  it("quotes cells that contain a semicolon, a quote or a line break", () => {
    expect(csvCell("a;b")).toBe('"a;b"');
    expect(csvCell('Öö "x"')).toBe('"Öö ""x"""');
    expect(csvCell("lihtne")).toBe("lihtne");
  });

  it("joins rows with semicolons and CRLF line endings", () => {
    expect(toCsv([["a", 1], ["b;c", 2.5]])).toBe('a;1\r\n"b;c";2,5');
  });

  it("exports the summary, the month history and the loans of one life", () => {
    const csv = lifeCsv(makeLife({
      loans: [{ id: "l1", label: "Autolaen; 2026", balance: 3000, rate: 0.05, monthsLeft: 24, payment: 132.5 }],
      rewards: [{ id: "r1", title: "–20%", product: "Coop kohvioad 500 g", achievement: "Kogusin puhvri", code: "DEMO-ABC", at: Date.parse("2026-03-04T00:00:00Z") }],
    }));
    expect(csv).toContain("Ülevaade\r\nNäitaja;Väärtus");
    expect(csv).toContain("Mängija;Henry");
    expect(csv).toContain("Netoväärtus;-700");
    expect(csv).toContain("Kuu ülevaade\r\nKuupäev;Kuu;Vanus;Netoväärtus");
    expect(csv).toContain("jaanuar 2026;0;20;2300;800;1500;0;0;0;1600;1200;400");
    expect(csv).toContain('"Autolaen; 2026";3000;0,05;132,5;24');
    expect(csv).toContain("Kogusin puhvri;Coop kohvioad 500 g;DEMO-ABC;2026-03-04");
  });

  it("lists every life in one combined file", () => {
    const csv = allLivesCsv([makeLife(), makeLife({ id: "x2", lifeName: "Teine elu", playerName: "Liisa" })]);
    expect(csv).toContain("Elud\r\nElu nimi;Mängija");
    expect(csv).toContain("Minu elu;Henry;20;0;2300");
    expect(csv).toContain("Teine elu;Liisa");
    expect(csv).toContain("Kuu ülevaade\r\nElu nimi;Kuupäev");
    expect(csv).toContain("Teine elu;jaanuar 2026;0;20;2300");
  });

  it("turns a life name into a safe file name", () => {
    expect(safeFileName("Minu elu 2!")).toBe("Minu-elu-2");
    expect(safeFileName("   ")).toBe("elu");
  });
});
