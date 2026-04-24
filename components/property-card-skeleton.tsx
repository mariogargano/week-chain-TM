import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border-2">
      {/* Image skeleton */}
      <div className="relative h-56 w-full bg-slate-200 animate-pulse" />

      {/* Content skeleton */}
      <CardContent className="p-8 space-y-4">
        <div className="space-y-3">
          {/* Badge skeleton */}
          <div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse" />

          {/* Title skeleton */}
          <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />

          {/* Location skeleton */}
          <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Price and progress skeleton */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
          </div>

          {/* Progress bar skeleton */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse" />
            <div className="h-3 w-40 mx-auto bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>

      {/* Footer skeleton */}
      <CardFooter className="p-8 pt-0 flex-col gap-2">
        <div className="h-4 w-48 mx-auto bg-slate-200 rounded animate-pulse mb-2" />
        <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
      </CardFooter>
    </Card>
  )
}
