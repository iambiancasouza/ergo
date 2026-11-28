// Dias são chaves "yyyy-MM-dd" no fuso da pessoa (profiles.timezone).
// Nunca new Date("yyyy-MM-dd") (vira meia-noite UTC) nem toISOString() (dia em UTC).

export function dayKeyIn(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// Ex.: "Sexta, 28 de novembro" (o dia da semana sem o "-feira").
export function formatLongDate(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("pt-BR", { timeZone, weekday: "long", day: "numeric", month: "long" }).formatToParts(
    instant,
  );
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = part("weekday").split("-")[0];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${part("day")} de ${part("month")}`;
}

// Conta em UTC só para somar dias no calendário: sem fuso, não há horário de verão no caminho.
export function addDays(dayKey: string, days: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}
