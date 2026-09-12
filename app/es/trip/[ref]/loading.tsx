// Streams the page shell immediately while the booking is fetched.
export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16" aria-busy="true">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-9 w-72 animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_18rem]">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
