import type { TrainingQuestion } from "@/types/training";

// Só o contexto (enunciado e premissas). A pergunta fica junto das alternativas, no QuestionStep.
export function QuestionCard({ question }: { question: TrainingQuestion }) {
  return (
    <section className="glass flex flex-col gap-4 rounded-3xl p-5 md:p-6">
      {/* Só no treino do dia, que mistura temas. */}
      {question.topicName ? (
        <p className="-mb-1 text-xs font-semibold tracking-[0.14em] text-accent uppercase">{question.topicName}</p>
      ) : null}
      <p className="text-[17px] leading-relaxed whitespace-pre-line">{question.statement}</p>

      {question.premises ? (
        <ul className="flex flex-col gap-2 border-l-2 border-accent/50 pl-4 leading-relaxed text-fg-muted">
          {question.premises.map((premise, index) => (
            <li key={index}>{premise}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
