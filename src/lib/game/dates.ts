export function formatLifeMonth(startDate: string, elapsedMonths: number) {
  const [year, month, day] = startDate.split("-").map(Number);
  if (!year || !month || !day) return "jaanuar 2026";
  const date = new Date(Date.UTC(year, month - 1 + elapsedMonths, 1));
  return new Intl.DateTimeFormat("et-EE", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}
