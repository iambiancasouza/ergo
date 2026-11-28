import { rankTopicsByWeakness, topicAccuracy, type TopicAttempt } from "@/lib/weakestTopic";

const sessionSize = 10;
const maxReviews = 6;
const maxFromWeakest = 4;

type DailyInput = {
  today: string;
  /** Temas na ordem do sort_order. */
  topicIds: number[];
  /** Questões ativas, cada tema já na ordem do treino (mais fácil primeiro). */
  questions: { id: string; topicId: number }[];
  attempts: (TopicAttempt & { questionId: string })[];
  reviews: { questionId: string; dueDate: string }[];
};

export type DailyPlan = {
  questionIds: string[];
  reviewCount: number;
  newCount: number;
  repeatCount: number;
  weakestTopicId: number | null;
  /** O tema mais fraco tem tentativas suficientes (5+) para ser chamado assim. */
  weakestHasData: boolean;
};

/**
 * Treino do dia (CLAUDE.md), sem acessar o banco:
 * 1. revisões vencidas, as mais atrasadas primeiro (até 6);
 * 2. inéditas do tema mais fraco (até 4);
 * 3. inéditas dos outros temas, alternando do mais fraco para o mais forte;
 *    se os outros acabarem, mais inéditas do tema mais fraco;
 * 4. se ainda faltar, as respondidas há mais tempo.
 * Nunca repete questão.
 */
export function planDailySession({ today, topicIds, questions, attempts, reviews }: DailyInput): DailyPlan {
  const chosen: string[] = [];
  const isChosen = new Set<string>();
  const add = (id: string) => {
    if (chosen.length >= sessionSize || isChosen.has(id)) return false;
    chosen.push(id);
    isChosen.add(id);
    return true;
  };

  const active = new Set(questions.map(({ id }) => id));

  // 1. Revisões vencidas ("yyyy-MM-dd" compara certo como texto).
  const dueReviews = reviews
    .filter((review) => review.dueDate <= today && active.has(review.questionId))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.questionId.localeCompare(b.questionId))
    .slice(0, maxReviews);
  dueReviews.forEach((review) => add(review.questionId));
  const reviewCount = chosen.length;

  // Inéditas de cada tema, na ordem do treino.
  const answered = new Set(attempts.map((attempt) => attempt.questionId));
  const unansweredByTopic = new Map<number, string[]>(topicIds.map((id) => [id, []]));
  for (const question of questions) {
    if (!answered.has(question.id)) unansweredByTopic.get(question.topicId)?.push(question.id);
  }

  const ranking = rankTopicsByWeakness(topicIds, attempts);
  const weakestTopicId = ranking[0] ?? null;

  // 2. Até 4 do tema mais fraco.
  const weakestQueue = weakestTopicId === null ? [] : [...(unansweredByTopic.get(weakestTopicId) ?? [])];
  for (let taken = 0; taken < maxFromWeakest && weakestQueue.length > 0; ) {
    if (add(weakestQueue.shift() as string)) taken++;
  }

  // 3. Outros temas alternando; depois o que sobrou do mais fraco.
  const otherQueues = ranking.slice(1).map((id) => [...(unansweredByTopic.get(id) ?? [])]);
  while (chosen.length < sessionSize && otherQueues.some((queue) => queue.length > 0)) {
    for (const queue of otherQueues) {
      const next = queue.shift();
      if (next !== undefined) add(next);
    }
  }
  weakestQueue.forEach(add);
  const newCount = chosen.length - reviewCount;

  // 4. As respondidas há mais tempo.
  const lastAnswered = new Map<string, number>();
  for (const attempt of attempts) {
    const time = Date.parse(attempt.answeredAt);
    lastAnswered.set(attempt.questionId, Math.max(time, lastAnswered.get(attempt.questionId) ?? 0));
  }
  [...lastAnswered.entries()]
    .filter(([id]) => active.has(id))
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .forEach(([id]) => add(id));

  return {
    questionIds: chosen,
    reviewCount,
    newCount,
    repeatCount: chosen.length - reviewCount - newCount,
    weakestTopicId,
    weakestHasData: weakestTopicId !== null && topicAccuracy(attempts, weakestTopicId) !== null,
  };
}
