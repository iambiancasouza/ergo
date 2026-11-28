import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

import { finishSession, submitAnswer } from "@/app/actions/training";
import { clampTimeMs } from "@/lib/answerSchema";
import { randomUuid } from "@/lib/randomUuid";
import type { SessionTarget, TrainingAnswer, TrainingQuestion } from "@/types/training";

type PendingAnswer = { sessionId: string; answer: TrainingAnswer };

export function useTrainingSession(questions: readonly TrainingQuestion[], target: SessionTarget) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<TrainingAnswer[]>([]);
  const [saveFailed, setSaveFailed] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [run, setRun] = useState(0);
  const sessionId = useRef<string | null>(null);
  const unsaved = useRef<PendingAnswer[]>([]);

  // Com cacheComponents, o Next esconde a página ao sair (Activity) em vez de desmontá-la, e o
  // estado voltaria igual. A limpeza roda ao esconder: quem volta recomeça o treino do zero.
  // As respostas que ainda estão na fila continuam lá, cada uma com o id da sua sessão.
  useLayoutEffect(() => {
    return () => {
      sessionId.current = null;
      setIndex(0);
      setAnswers([]);
      setIsFinishing(false);
      setRun((current) => current + 1);
    };
  }, []);

  async function save({ sessionId, answer }: PendingAnswer) {
    const result = await submitAnswer({
      sessionId,
      ...target,
      questionId: answer.questionId,
      chosenIndex: answer.chosenIndex,
      timeMs: clampTimeMs(answer.timeMs),
    }).catch(() => ({ ok: false }) as const);

    if (!result.ok) unsaved.current.push({ sessionId, answer });
  }

  // Envia as pendentes de antes junto com as novas; o que falhar volta para a fila.
  async function saveWithRetry(extra: PendingAnswer[] = []) {
    const batch = [...unsaved.current, ...extra];
    unsaved.current = [];
    await Promise.all(batch.map(save));
    setSaveFailed(unsaved.current.length > 0);
  }

  function recordAnswer(answer: TrainingAnswer) {
    setAnswers((previous) => [...previous, answer]);
    sessionId.current ??= randomUuid();
    void saveWithRetry([{ sessionId: sessionId.current, answer }]);
  }

  // Só abre /result com tudo salvo, porque a tela é lida do banco. Senão, fica no resumo local.
  async function finish() {
    setIsFinishing(true);
    await saveWithRetry();

    const id = sessionId.current;
    if (id && unsaved.current.length === 0) {
      await finishSession(id).catch(() => undefined);
      router.push(`/result/${id}`);
      return;
    }

    setIsFinishing(false);
    setIndex(questions.length);
  }

  function next() {
    if (index === questions.length - 1) {
      void finish();
      return;
    }
    setIndex((current) => current + 1);
  }

  return {
    run,
    question: questions[index],
    position: index + 1,
    total: questions.length,
    isLast: index === questions.length - 1,
    isFinished: index >= questions.length,
    answers,
    saveFailed,
    isFinishing,
    recordAnswer,
    next,
    retryFinish: () => void finish(),
  };
}
