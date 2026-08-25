import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while a lazy route chunk is in flight.
 *
 * Deliberately has **no background of its own**: it renders over the persistent
 * `DotGridBackground` + `AmbientOrbs` layers, so a slow chunk fetch reads as
 * "this page is loading" rather than as the whole site blanking out. Layout
 * mirrors the page shell every route uses (`main`, max-w-4xl, centred,
 * pt-[70px]) so the content lands in roughly the same place the skeleton left.
 */
const PageLoadingFallback = () => (
  <main
    className="flex flex-col gap-6 px-4 max-w-4xl mx-auto min-h-viewport pt-[70px]"
    aria-busy="true"
    aria-label="Loading page"
  >
    <div className="flex flex-col items-center gap-3 mb-4">
      <Skeleton className="h-10 w-56 rounded-lg" />
      <Skeleton className="h-4 w-72 max-w-full rounded-md" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-xl" />
      ))}
    </div>
  </main>
);

export default PageLoadingFallback;
