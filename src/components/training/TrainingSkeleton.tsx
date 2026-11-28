export function TrainingSkeleton() {
  return (
    <main
      aria-hidden="true"
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 pt-4 pb-6 md:px-8 xl:pt-8"
    >
      <div className="flex items-center justify-between">
        <span className="size-11 rounded-full border border-white/12 bg-surface" />
        <span className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
        <span className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
      </div>
      <span className="h-1.5 rounded-full bg-white/10" />

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <div className="glass flex flex-col gap-3 rounded-3xl p-5 md:p-6">
          <span className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          <span className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
          <span className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="glass flex min-h-14 items-center gap-3 rounded-2xl px-4">
              <span className="size-8 rounded-full border border-white/15" />
              <span className="h-3.5 w-1/2 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
