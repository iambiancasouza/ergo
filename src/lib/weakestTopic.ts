export type TopicAttempt = { topicId: number; isCorrect: boolean; answeredAt: string };

const recentWindow = 30;
const minAttempts = 5;

/** % de acerto (0 a 100) nas últimas 30 tentativas do tema; com menos de 5, null (sem dados suficientes). */
export function topicAccuracy(attempts: readonly TopicAttempt[], topicId: number): number | null {
  const recent = attempts
    .filter((attempt) => attempt.topicId === topicId)
    .sort((a, b) => Date.parse(b.answeredAt) - Date.parse(a.answeredAt))
    .slice(0, recentWindow);

  if (recent.length < minAttempts) return null;
  const correct = recent.filter((attempt) => attempt.isCorrect).length;
  return Math.round((correct / recent.length) * 100);
}

/**
 * Temas do mais fraco para o mais forte. Sem dados suficientes conta como 0%.
 * Empate: a ordem recebida (sort_order dos temas).
 */
export function rankTopicsByWeakness(topicIds: readonly number[], attempts: readonly TopicAttempt[]): number[] {
  const accuracy = new Map(topicIds.map((id) => [id, topicAccuracy(attempts, id) ?? 0]));
  return topicIds
    .map((id, order) => ({ id, order }))
    .sort((a, b) => (accuracy.get(a.id) ?? 0) - (accuracy.get(b.id) ?? 0) || a.order - b.order)
    .map(({ id }) => id);
}
