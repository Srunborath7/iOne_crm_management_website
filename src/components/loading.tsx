export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6" aria-busy="true">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-11 bg-slate-50" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-5 py-4">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-10 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}