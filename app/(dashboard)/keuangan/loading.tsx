import { Skeleton, StatCardsSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Skeleton className="h-14 w-full" />
      <StatCardsSkeleton count={3} />
      <TableSkeleton />
    </div>
  );
}
