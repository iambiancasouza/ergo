// Roleta de temas: fatias iguais, a 0 começando no topo e seguindo no sentido horário;
// o ponteiro fica no topo (0°).

/** Sorteia uma fatia entre 0 e count − 1. `random` vem de fora para o teste. */
export function pickSlice(count: number, random: () => number = Math.random): number {
  return Math.min(count - 1, Math.floor(random() * count));
}

/** Ângulo do meio da fatia, em graus a partir do topo. */
export function sliceCenter(index: number, count: number): number {
  return (index + 0.5) * (360 / count);
}

/**
 * Rotação final (em graus, sempre crescente) para a fatia `index` parar sob o ponteiro,
 * depois de `turns` voltas inteiras a partir da rotação atual.
 */
export function spinTarget(current: number, index: number, count: number, turns = 5): number {
  // Girar R graus leva o meio da fatia para (meio + R); queremos que isso dê 0 (o topo).
  const wanted = (360 - sliceCenter(index, count)) % 360;
  const delta = (((wanted - current) % 360) + 360) % 360;
  return current + turns * 360 + delta;
}
