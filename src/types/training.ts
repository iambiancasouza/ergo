export type TrainingQuestion = {
  id: string;
  statement: string;
  premises: string[] | null;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Só no treino do dia, que mistura temas. */
  topicName?: string;
};

export type TopicTraining = {
  topic: { id: number; name: string };
  questions: TrainingQuestion[];
};

// Para onde vão as respostas: um treino por tema, a revisão dos erros de uma sessão ou o treino do dia.
export type SessionTarget = { kind: "topic"; topicId: number } | { kind: "review" } | { kind: "daily" };

export type TrainingAnswer = {
  questionId: string;
  chosenIndex: number;
  isCorrect: boolean;
  timeMs: number;
};
