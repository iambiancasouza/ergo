import Link from "next/link";

import { getTopics } from "@/services/topics.service";

const grid = "grid gap-3 md:grid-cols-2 xl:grid-cols-3";
const card = "glass flex min-h-20 items-center justify-between gap-4 rounded-3xl px-5 py-4";

export async function TopicList() {
  const topics = await getTopics();

  if (topics.length === 0) {
    return <p className="text-fg-muted">Nenhum tema disponível ainda.</p>;
  }

  return (
    <ul className={grid}>
      {topics.map((topic) => (
        <li key={topic.id}>
          <Link
            href={`/training/${topic.slug}`}
            className={`${card} transition-transform duration-150 active:scale-[0.98]`}
          >
            <span className="flex flex-col gap-1">
              <span className="font-display text-[17px] leading-snug font-semibold">{topic.name}</span>
              <span className="text-sm text-fg-muted">
                {topic.questionCount} {topic.questionCount === 1 ? "questão" : "questões"}
              </span>
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0 text-accent"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TopicListSkeleton() {
  return (
    <ul className={grid} aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className={card}>
          <span className="flex flex-1 flex-col gap-2">
            <span className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
            <span className="h-3 w-1/4 animate-pulse rounded-full bg-white/10" />
          </span>
        </li>
      ))}
    </ul>
  );
}
