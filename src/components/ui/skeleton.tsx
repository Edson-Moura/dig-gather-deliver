import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Skeleton presets for common components
const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("space-y-4 p-6 rounded-lg border bg-card", className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  </div>
);

const SkeletonAvatar = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-10 w-10 rounded-full", className)} />
);

const SkeletonButton = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-10 w-24 rounded-md", className)} />
);

const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-3", 
          i === lines - 1 ? "w-3/4" : "w-full"
        )} 
      />
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonAvatar, SkeletonButton, SkeletonText }