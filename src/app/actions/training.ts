"use server";

import { z } from "zod";

import { answerSchema, type AnswerInput } from "@/lib/answerSchema";
import { dayKeyIn } from "@/lib/dayKey";
import { scheduleNext } from "@/lib/review";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/profile.service";

type ActionResult = { ok: true } | { ok: false; error: string };

const uniqueViolation = "23505";

export async function submitAnswer(input: AnswerInput): Promise<ActionResult> {
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Resposta inválida." };
  const answer = parsed.data;
  const { sessionId, questionId, chosenIndex, timeMs } = answer;
  const topicId = answer.kind === "topic" ? answer.topicId : null;

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return { ok: false, error: "Sua sessão expirou. Entre de novo." };

  // O acerto é calculado aqui, com o gabarito do banco, e não o que o navegador disser.
  const { data: question } = await supabase
    .from("questions")
    .select("correct_index, topic_id")
    .eq("id", questionId)
    .eq("active", true)
    .maybeSingle();
  if (!question || (topicId !== null && question.topic_id !== topicId)) {
    return { ok: false, error: "Questão não encontrada." };
  }

  // A sessão nasce na primeira resposta, com o id sorteado no navegador; nas seguintes, já existe.
  // user_id fica de fora: o banco preenche com auth.uid().
  const { error: sessionError } = await supabase
    .from("sessions")
    .upsert({ id: sessionId, kind: answer.kind, topic_id: topicId }, { onConflict: "id", ignoreDuplicates: true });
  if (sessionError) return { ok: false, error: "Não foi possível salvar a resposta." };

  const isCorrect = chosenIndex === question.correct_index;
  const { error } = await supabase.from("attempts").insert({
    session_id: sessionId,
    question_id: questionId,
    chosen_index: chosenIndex,
    is_correct: isCorrect,
    time_ms: timeMs,
  });
  // Resposta já gravada (reenvio depois de uma falha): conta como sucesso, e a revisão já foi
  // atualizada no primeiro envio (atualizar de novo subiria a caixa duas vezes).
  if (error?.code === uniqueViolation) return { ok: true };
  if (error) return { ok: false, error: "Não foi possível salvar a resposta." };

  // A resposta é o registro principal: se a revisão falhar, a resposta continua salva.
  await updateReview(supabase, questionId, isCorrect).catch((reviewError: Error) =>
    console.error(`Revisão da questão ${questionId} não atualizada: ${reviewError.message}`),
  );
  return { ok: true };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function updateReview(supabase: Supabase, questionId: string, isCorrect: boolean) {
  // O RLS só devolve as linhas da própria pessoa.
  const [profile, { data: current }] = await Promise.all([
    getProfile(),
    supabase.from("review_schedule").select("box, due_date").eq("question_id", questionId).maybeSingle(),
  ]);

  const today = dayKeyIn(new Date(), profile.timezone);
  const next = scheduleNext(current ? { box: current.box, dueDate: current.due_date } : null, isCorrect, today);
  if (!next) return;

  // user_id fica de fora: o banco preenche com auth.uid().
  const { error } = await supabase
    .from("review_schedule")
    .upsert({ question_id: questionId, box: next.box, due_date: next.dueDate }, { onConflict: "user_id,question_id" });
  if (error) throw new Error(error.message);
}

export async function finishSession(sessionId: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(sessionId);
  if (!parsed.success) return { ok: false, error: "Sessão inválida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ finished_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .is("finished_at", null);

  if (error) return { ok: false, error: "Não foi possível encerrar o treino." };
  return { ok: true };
}
