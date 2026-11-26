# Ergo ∴

Treino de raciocínio lógico com questões cronometradas, revisão espaçada e acompanhamento de desempenho por tema.

> README provisório (fase 0). A versão completa sai junto com o MVP.

## Rodar localmente

```bash
bun install
cp .env.example .env.local   # preencha com os dados do Supabase
bun run dev
```

## Verificações

```bash
bun run typecheck   # TypeScript
bun run lint        # ESLint
bun run test        # Vitest (use "bun run test", não "bun test")
bun run build       # build de produção
```

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · Supabase · Vercel.
