import { z } from "zod";

const minTimeMs = 1_000;
const maxTimeMs = 30 * 60 * 1_000;

// O navegador envia o tempo já dentro dos limites; o schema recusa o resto como última barreira.
export function clampTimeMs(ms: number): number {
  return Math.min(maxTimeMs, Math.max(minTimeMs, Math.round(ms)));
}

const answerFields = {
  sessionId: z.uuid(),
  questionId: z.string().min(1).max(40),
  chosenIndex: z.int().min(0).max(4),
  timeMs: z.int().min(minTimeMs).max(maxTimeMs),
};

// Treino por tema leva o tema; a revisão dos erros e o treino do dia não têm tema.
export const answerSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("topic"), topicId: z.int().positive(), ...answerFields }),
  z.strictObject({ kind: z.literal("review"), ...answerFields }),
  z.strictObject({ kind: z.literal("daily"), ...answerFields }),
]);

export type AnswerInput = z.infer<typeof answerSchema>;
