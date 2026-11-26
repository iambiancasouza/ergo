// Tela provisória da fase 0: só confere tokens, fontes e o vidro.
// Na fase 1 ela dá lugar ao login e ao layout com navegação.
export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <section className="glass w-full max-w-sm rounded-3xl p-8 text-center">
        <p aria-hidden className="font-display text-5xl text-accent">
          ∴
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Ergo</h1>
        <p className="mt-2 text-fg-muted">Treino de raciocínio lógico</p>
      </section>
    </main>
  )
}
