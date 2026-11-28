export function resultHeadline(percent: number): string {
  if (percent === 100) return "Perfeito!";
  if (percent >= 70) return "Bom treino!";
  if (percent >= 40) return "Continue praticando";
  return "Hora de revisar";
}
