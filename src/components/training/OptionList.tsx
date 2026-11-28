export const optionLetters = ["A", "B", "C", "D", "E"];

type OptionState = "idle" | "selected" | "correct" | "wrong" | "dimmed";

// Halo colorido e linha de luz no topo, como a sombra do botão principal.
const buttonStyles: Record<OptionState, string> = {
  idle: "border-white/12 bg-surface text-fg shadow-[0_6px_20px_rgb(184_166_240/0.06),inset_0_1px_0_rgb(255_255_255/0.14)]",
  selected: "border-accent/70 bg-surface-accent text-fg shadow-[0_8px_24px_rgb(184_166_240/0.22),inset_0_1px_0_rgb(255_255_255/0.22)]",
  correct: "border-success/70 bg-surface-success text-fg shadow-[0_8px_24px_rgb(127_209_168/0.2),inset_0_1px_0_rgb(255_255_255/0.2)]",
  wrong: "border-danger/70 bg-surface-danger text-fg shadow-[0_8px_24px_rgb(240_169_122/0.18),inset_0_1px_0_rgb(255_255_255/0.2)]",
  dimmed: "border-white/8 bg-surface-dim text-fg-subtle shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
};

const letterStyles: Record<OptionState, string> = {
  idle: "border-white/15 text-fg-muted",
  selected: "border-accent bg-accent text-bg",
  correct: "border-success bg-success text-bg",
  wrong: "border-danger bg-danger text-bg",
  dimmed: "border-white/10 text-fg-subtle",
};

function optionState(index: number, selectedIndex: number | null, correctIndex: number, isConfirmed: boolean): OptionState {
  if (!isConfirmed) return index === selectedIndex ? "selected" : "idle";
  if (index === correctIndex) return "correct";
  if (index === selectedIndex) return "wrong";
  return "dimmed";
}

type OptionListProps = {
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  isConfirmed: boolean;
  onSelect: (index: number) => void;
};

export function OptionList({ options, selectedIndex, correctIndex, isConfirmed, onSelect }: OptionListProps) {
  return (
    <ul aria-label="Alternativas" className="flex flex-col gap-2.5">
      {options.map((option, index) => {
        const state = optionState(index, selectedIndex, correctIndex, isConfirmed);
        return (
          <li key={index}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              disabled={isConfirmed}
              aria-pressed={selectedIndex === index}
              className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] leading-snug transition-[color,background-color,border-color,box-shadow] duration-150 disabled:cursor-default ${buttonStyles[state]}`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-150 ${letterStyles[state]}`}
              >
                {optionLetters[index]}
              </span>
              <span className="flex-1">{option}</span>
              {state === "correct" ? <span className="sr-only">(resposta certa)</span> : null}
              {state === "wrong" ? <span className="sr-only">(sua resposta)</span> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
