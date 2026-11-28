import { addDays } from "@/lib/dayKey";

// Método das caixas (Leitner): dias até a próxima revisão em cada caixa (0 a 4).
const intervalDays = [1, 3, 7, 14, 30];
const lastBox = intervalDays.length - 1;

type ReviewState = { box: number; dueDate: string };

/**
 * Próximo estado da questão na revisão, ou null quando nada muda.
 * - Errou: caixa 0, volta amanhã.
 * - Acertou uma questão em revisão já vencida: sobe uma caixa (até a 4) e volta em hoje + intervalo.
 * - Acertou uma questão nova, ou uma revisão que ainda não venceu: nada muda.
 */
export function scheduleNext(current: ReviewState | null, isCorrect: boolean, today: string): ReviewState | null {
  if (!isCorrect) return { box: 0, dueDate: addDays(today, intervalDays[0]) };
  if (current === null) return null;
  // Chaves "yyyy-MM-dd" comparam certo como texto.
  if (current.dueDate > today) return null;

  const box = Math.min(current.box + 1, lastBox);
  return { box, dueDate: addDays(today, intervalDays[box]) };
}
