type AttemptLike = { isCorrect: boolean; timeMs: number };

export type SessionStats = {
  total: number;
  correct: number;
  percent: number;
  totalMs: number;
  averageMs: number;
};

export function summarizeAttempts(attempts: readonly AttemptLike[]): SessionStats {
  const total = attempts.length;
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  const totalMs = attempts.reduce((sum, attempt) => sum + attempt.timeMs, 0);

  return {
    total,
    correct,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
    totalMs,
    averageMs: total === 0 ? 0 : Math.round(totalMs / total),
  };
}
