import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 pb-32 md:pb-16">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-24">
        {/* Gallery Skeleton */}
        <div className="w-full md:w-1/2 space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
            <Skeleton className="h-20 w-20 rounded-md" />
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="w-full md:w-1/2 space-y-8">
          <div className="space-y-4">
             <Skeleton className="h-4 w-32" />
             <Skeleton className="h-14 w-full" />
             <Skeleton className="h-10 w-48" />
          </div>
          
          <Skeleton className="h-32 w-full" />
          
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>

          <div className="space-y-4 pt-8 border-t">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
