export function HomeSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
        <span className="h-8 w-48 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass flex flex-col gap-4 rounded-[28px] p-6">
          <span className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
          <span className="h-7 w-3/4 animate-pulse rounded-full bg-white/10" />
          <span className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          <span className="mt-2 h-14 rounded-full border border-white/10" />
        </div>
        <div className="flex flex-col gap-3">
          <span className="h-5 w-48 animate-pulse rounded-full bg-white/10" />
          <div className="glass flex flex-col items-center gap-5 rounded-[28px] p-6">
            <span className="aspect-square w-full max-w-72 rounded-full border border-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
