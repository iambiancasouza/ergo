type DailySummary = {
  reviewCount: number;
  newCount: number;
  repeatCount: number;
  weakestTopicName: string | null;
  weakestHasData: boolean;
};

// Ex.: "6 revisões de questões que você errou + 4 novas, com foco em associação lógica, seu tema mais fraco."
export function describeDailyPlan({ reviewCount, newCount, repeatCount, weakestTopicName, weakestHasData }: DailySummary) {
  const parts: string[] = [];
  if (reviewCount > 0) {
    parts.push(reviewCount === 1 ? "1 revisão de questão que você errou" : `${reviewCount} revisões de questões que você errou`);
  }
  if (newCount > 0) parts.push(newCount === 1 ? "1 nova" : `${newCount} novas`);
  if (repeatCount > 0) parts.push(`${repeatCount} para repetir`);

  let text = parts.join(" + ");
  // "Tema mais fraco" só com dados (5+ tentativas); sem eles, a escolha é só a ordem dos temas.
  if (newCount > 0 && weakestTopicName && weakestHasData) {
    text += `, com foco em ${weakestTopicName.toLocaleLowerCase("pt-BR")}, seu tema mais fraco`;
  } else if (newCount > 0) {
    text += ", de vários temas";
  }
  return `${text}.`;
}
