"use client";

import { useEffect, type ReactNode } from "react";
import { motion, type Transition } from "framer-motion";

// Sem fade no conteúdo: opacity/filter acima dos cartões de vidro desliga o desfoque deles (Safari).
// Por isso a camada que se dissolve é irmã do conteúdo. View Transitions esconderiam a animação da barra.

// Sem transição na primeira abertura: a camada viria no HTML do servidor e esconderia a página até o JS carregar.
let hasMountedOnce = false;

const slideTransition: Transition = { type: "spring", stiffness: 320, damping: 32, mass: 0.8 };
const veilTransition: Transition = { duration: 0.28, ease: "easeOut" };

export function PageTransition({ children }: { children: ReactNode }) {
  const animateEntry = hasMountedOnce;

  useEffect(() => {
    hasMountedOnce = true;
  }, []);

  return (
    <>
      <motion.div
        initial={animateEntry ? { y: 14 } : false}
        animate={{ y: 0 }}
        transition={slideTransition}
      >
        {children}
      </motion.div>
      {animateEntry ? (
        // Abaixo da navegação (z-40), que segue visível e animando.
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={veilTransition}
          className="pointer-events-none fixed inset-0 z-30 bg-bg"
        />
      ) : null}
    </>
  );
}
