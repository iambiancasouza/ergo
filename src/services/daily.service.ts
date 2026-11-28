import { planDailySession, type DailyPlan } from "@/lib/dailySession";
import { dayKeyIn } from "@/lib/dayKey";
import { createClient } from "@/lib/supabase/server";
import { questionColumns, toTrainingQuestion } from "@/services/questions.service";
import type { TrainingQuestion } from "@/types/training";

// O PostgREST devolve no máximo 1000 linhas por consulta: as mais recentes bastam para as
// últimas 30 de cada tema. Se a pessoa passar de 1000 respostas, uma questão respondida só
// antes disso volta a contar como inédita.
const attemptsLimit = 1000;

type DailyTraining = {
  questions: TrainingQuestion[];
  plan: DailyPlan;
  weakestTopicName: string | null;
};

export async function getDailyTraining(timezone: string): Promise<DailyTraining> {
  const supabase = await createClient();
  const today = dayKeyIn(new Date(), timezone);

  // O RLS só devolve as respostas e revisões da própria pessoa.
  const [topicsResult, questionsResult, attemptsResult, reviewsResult] = await Promise.all([
    supabase.from("topics").select("id, name").order("sort_order"),
    supabase.from("questions").select(`${questionColumns}, topic_id`).eq("active", true).order("difficulty").order("id"),
    supabase
      .from("attempts")
      .select("question_id, is_correct, answered_at, questions(topic_id)")
      .order("answered_at", { ascending: false })
      .limit(attemptsLimit),
    supabase.from("review_schedule").select("question_id, due_date").lte("due_date", today),
  ]);

  const error = topicsResult.error ?? questionsResult.error ?? attemptsResult.error ?? reviewsResult.error;
  if (error) throw new Error(`Não foi possível montar o treino do dia: ${error.message}`);

  const topics = topicsResult.data ?? [];
  const rows = questionsResult.data ?? [];
  const attempts = attemptsResult.data ?? [];
  const reviews = reviewsResult.data ?? [];
  const topicName = new Map(topics.map((topic) => [topic.id, topic.name]));

  const plan = planDailySession({
    today,
    topicIds: topics.map((topic) => topic.id),
    questions: rows.map((row) => ({ id: row.id, topicId: row.topic_id })),
    attempts: attempts.flatMap((attempt) =>
      attempt.questions
        ? [
            {
              questionId: attempt.question_id,
              topicId: attempt.questions.topic_id,
              isCorrect: attempt.is_correct,
              answeredAt: attempt.answered_at,
            },
          ]
        : [],
    ),
    reviews: reviews.map((review) => ({ questionId: review.question_id, dueDate: review.due_date })),
  });

  const rowById = new Map(rows.map((row) => [row.id, row]));
  const questions = plan.questionIds.flatMap((id) => {
    const row = rowById.get(id);
    return row ? [{ ...toTrainingQuestion(row), topicName: topicName.get(row.topic_id) }] : [];
  });

  return {
    questions,
    plan,
    weakestTopicName: plan.weakestTopicId === null ? null : (topicName.get(plan.weakestTopicId) ?? null),
  };
}
