import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { TopicTraining, TrainingQuestion } from "@/types/training";

export const questionColumns = "id, statement, premises, prompt, options, correct_index, explanation";

type QuestionRow = {
  id: string;
  statement: string;
  premises: string[] | null;
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export function toTrainingQuestion(row: QuestionRow): TrainingQuestion {
  return {
    id: row.id,
    statement: row.statement,
    premises: row.premises,
    prompt: row.prompt,
    options: row.options,
    correctIndex: row.correct_index,
    explanation: row.explanation,
  };
}

export async function getTopicTraining(slug: string): Promise<TopicTraining | null> {
  const supabase = await createClient();

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (topicError) throw new Error(`Não foi possível carregar o tema: ${topicError.message}`);
  if (!topic) return null;

  const { data: questions, error } = await supabase
    .from("questions")
    .select(questionColumns)
    .eq("topic_id", topic.id)
    .eq("active", true)
    .order("difficulty")
    .order("id");

  if (error) throw new Error(`Não foi possível carregar as questões: ${error.message}`);

  return { topic, questions: questions.map(toTrainingQuestion) };
}

// As questões que a pessoa errou numa sessão (o RLS só devolve as respostas dela), na ordem do treino.
export async function getReviewTraining(sessionId: string): Promise<TrainingQuestion[]> {
  if (!z.uuid().safeParse(sessionId).success) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attempts")
    .select(`questions(${questionColumns}, difficulty, active)`)
    .eq("session_id", sessionId)
    .eq("is_correct", false);

  if (error) throw new Error(`Não foi possível carregar os erros: ${error.message}`);

  return data
    .flatMap(({ questions: question }) => (question?.active ? [question] : []))
    .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id))
    .map(toTrainingQuestion);
}
