import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ResultAttempt = {
  questionId: string;
  topicName: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  chosenIndex: number;
  isCorrect: boolean;
  timeMs: number;
  explanation: string;
};

type SessionResult = {
  kind: string;
  topic: { name: string; slug: string } | null;
  attempts: ResultAttempt[];
};

// O RLS só devolve as sessões da própria pessoa: o id de outra pessoa cai no "não encontrado".
export async function getSessionResult(sessionId: string): Promise<SessionResult | null> {
  if (!z.uuid().safeParse(sessionId).success) return null;

  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, kind, topics(name, slug)")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) throw new Error(`Não foi possível carregar o resultado: ${sessionError.message}`);
  if (!session) return null;

  const { data: attempts, error } = await supabase
    .from("attempts")
    .select(
      "question_id, chosen_index, is_correct, time_ms, questions(prompt, options, correct_index, explanation, difficulty, topics(name))",
    )
    .eq("session_id", sessionId);

  if (error) throw new Error(`Não foi possível carregar as respostas: ${error.message}`);

  // Mesma ordem do treino (mais fácil primeiro): respostas reenviadas chegam fora de ordem.
  const ordered = attempts
    .flatMap(({ questions: question, ...attempt }) => (question ? [{ ...attempt, question }] : []))
    .sort((a, b) => a.question.difficulty - b.question.difficulty || a.question_id.localeCompare(b.question_id));

  return {
    kind: session.kind,
    topic: session.topics,
    attempts: ordered.map(({ question, ...attempt }) => ({
      questionId: attempt.question_id,
      topicName: question.topics?.name ?? "",
      prompt: question.prompt,
      options: question.options,
      correctIndex: question.correct_index,
      chosenIndex: attempt.chosen_index,
      isCorrect: attempt.is_correct,
      timeMs: attempt.time_ms,
      explanation: question.explanation,
    })),
  };
}
