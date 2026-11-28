export function ResultSkeleton() {
  return (
    <main
      aria-hidden="true"
      className="mx-auto grid w-full max-w-5xl gap-6 px-5 pt-8 pb-6 md:grid-cols-2 md:gap-8 md:px-8 xl:pt-10"
    >
      <div className="flex flex-col items-center gap-6">
        <span className="size-44 rounded-full border-12 border-white/10" />
        <div className="flex w-full flex-col items-center gap-3">
          <span className="h-7 w-44 animate-pulse rounded-full bg-white/10" />
          <span className="h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
          <span className="glass h-24 rounded-3xl" />
          <span className="glass h-24 rounded-3xl" />
        </div>
      </div>
      <div className="glass flex flex-col gap-4 rounded-[28px] p-5">
        <span className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="aspect-square rounded-2xl border border-white/10" />
          ))}
        </div>
        <span className="h-3.5 w-2/3 animate-pulse rounded-full bg-white/10" />
      </div>
    </main>
  );
}
