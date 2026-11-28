"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { primaryButton } from "@/components/auth/authStyles";
import { TopicIcon } from "@/components/home/TopicIcon";
import { pickSlice, sliceCenter, spinTarget } from "@/lib/topicWheel";

type WheelTopic = { slug: string; name: string };

const center = 150;
const radius = 140;
// Três tons se alternando: com 11 temas, a primeira e a última fatia nunca ficam com a mesma cor.
const fills = ["rgb(184 166 240 / 0.3)", "rgb(95 70 157 / 0.55)", "rgb(255 255 255 / 0.07)"];
const winnerFill = "rgb(184 166 240 / 0.85)";
const iconDistance = 92;
const hubRadius = 28;

// Ponto no círculo: ângulo em graus a partir do topo, no sentido horário. Arredondado para o
// HTML do servidor e o do navegador serem iguais (seno e cosseno podem variar na última casa entre motores).
function point(angle: number, distance: number) {
  const radians = (angle * Math.PI) / 180;
  const round = (value: number) => Math.round(value * 100) / 100;
  return [round(center + distance * Math.sin(radians)), round(center - distance * Math.cos(radians))];
}

function slicePath(index: number, count: number) {
  const step = 360 / count;
  const [x1, y1] = point(index * step, radius);
  const [x2, y2] = point((index + 1) * step, radius);
  return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
}

// O símbolo fica no meio da fatia, com o "em cima" dele virado para a borda: sob o ponteiro, fica em pé.
function SliceIcon({
  index,
  count,
  slug,
  isWinner,
}: {
  index: number;
  count: number;
  slug: string;
  isWinner: boolean;
}) {
  return (
    <g
      transform={`rotate(${sliceCenter(index, count)} ${center} ${center}) translate(${center} ${center - iconDistance}) scale(1.15)`}
      className={`transition-colors duration-300 ${isWinner ? "text-bg" : "text-fg"}`}
    >
      <TopicIcon slug={slug} />
    </g>
  );
}

// Marca no navegador de que a pessoa já girou a roleta: depois disso, o anel de convite não aparece mais.
const spunKey = "ergo:wheelSpun";

function hasSpunBefore() {
  try {
    return localStorage.getItem(spunKey) === "1";
  } catch {
    return true; // Sem acesso ao armazenamento (ex.: navegação privada antiga): sem anel.
  }
}

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function TopicWheel({ topics }: { topics: WheelTopic[] }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [spunNow, setSpunNow] = useState(false);
  const picked = useRef(0);

  // No servidor não há localStorage: ele desenha sem o anel, e o navegador só acende para quem nunca girou.
  const spunBefore = useSyncExternalStore(subscribeToStorage, hasSpunBefore, () => true);
  const showHint = !spunBefore && !spunNow && !isSpinning;

  // Com cacheComponents, o Next esconde o Início ao sair (Activity) em vez de desmontá-lo. A limpeza
  // roda ao esconder: quem volta encontra a roleta sem sorteio. A posição da roda fica (voltar a zero
  // a faria girar de ré).
  useLayoutEffect(() => {
    return () => {
      setIsSpinning(false);
      setWinner(null);
    };
  }, []);

  function spin() {
    if (isSpinning) return;
    setSpunNow(true);
    try {
      localStorage.setItem(spunKey, "1");
    } catch {
      // Sem armazenamento: o anel some só nesta visita.
    }
    picked.current = pickSlice(topics.length);
    setWinner(null);
    setIsSpinning(true);
    setRotation((current) => spinTarget(current, picked.current, topics.length));
  }

  function handleStop() {
    if (!isSpinning) return;
    setIsSpinning(false);
    setWinner(picked.current);
  }

  const result = winner === null ? null : topics[winner];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-fg-muted">Ou então, sorteie um tema</h2>

      <div className="glass flex flex-col items-center gap-5 rounded-[28px] p-6">
        {/* A roleta inteira é o botão: tocar gira (e gira de novo depois de parar). */}
        <button
          type="button"
          onClick={spin}
          aria-label={result ? `Girar de novo. Caiu em ${result.name}` : "Girar a roleta de temas"}
          aria-disabled={isSpinning}
          className="w-full max-w-72 rounded-full transition-transform duration-150 active:scale-[0.98]"
        >
          <svg
            viewBox="0 0 300 300"
            aria-hidden="true"
            className="w-full drop-shadow-[0_8px_24px_rgb(184_166_240/0.18)]"
          >
            <motion.g
              animate={{ rotate: rotation }}
              transition={{ duration: 4.2, ease: [0.15, 0.85, 0.25, 1] }}
              onAnimationComplete={handleStop}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              {topics.map((topic, index) => (
                <g key={topic.slug}>
                  <path
                    d={slicePath(index, topics.length)}
                    fill={index === winner ? winnerFill : fills[index % fills.length]}
                    stroke="rgb(255 255 255 / 0.12)"
                    strokeWidth="1"
                    className="transition-[fill] duration-300"
                  />
                  <SliceIcon index={index} count={topics.length} slug={topic.slug} isWinner={index === winner} />
                </g>
              ))}
            </motion.g>

            {/* Centro: anel pulsando só até o primeiro giro, para mostrar que basta tocar. */}
            {!showHint ? null : (
              <circle
                cx={center}
                cy={center}
                r={hubRadius}
                className="wheel-pulse fill-none stroke-accent"
                strokeWidth="2"
              />
            )}
            <circle cx={center} cy={center} r={hubRadius} className="fill-bg stroke-accent/50" strokeWidth="1.5" />
            {/* O ∴ do logo desenhado com círculos: um caractere de texto ficava fora do centro (depende da fonte). */}
            <g className="fill-accent">
              <circle cx={center} cy={center - 6} r="3.6" />
              <circle cx={center - 7.5} cy={center + 6} r="3.6" />
              <circle cx={center + 7.5} cy={center + 6} r="3.6" />
            </g>

            {/* Ponteiro fixo no topo: balança durante o giro, como a lingueta batendo nas divisões. */}
            <motion.polygon
              points={`${center - 11},0 ${center + 11},0 ${center},22`}
              className="fill-accent stroke-bg"
              strokeWidth="2"
              style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
              animate={isSpinning ? { rotate: [0, -16, 0] } : { rotate: 0 }}
              transition={isSpinning ? { duration: 0.16, repeat: Infinity, ease: "easeOut" } : { duration: 0.2 }}
            />
          </svg>
        </button>

        <p aria-live="polite" className="sr-only">
          {isSpinning ? "Girando…" : result ? `Caiu em ${result.name}.` : ""}
        </p>

        {result ? (
          <motion.div
            key={`${result.slug}-${rotation}`}
            initial={{ y: 8, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="flex w-full flex-col items-center gap-3"
          >
            <p className="text-center text-fg-muted">
              Caiu em: <span className="font-semibold text-fg">{result.name}</span>
            </p>
            <Link href={`/training/${result.slug}?from=home`} className={primaryButton}>
              <span className="truncate px-4">Treinar {result.name.toLocaleLowerCase("pt-BR")}</span>
            </Link>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
