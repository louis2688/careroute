export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-busy="true">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-9 w-56 animate-pulse rounded bg-slate-200" />
      <div className="mt-8 h-96 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}
