export function Skeleton({ className, ...props }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
            {...props}
        />
    );
}

export function CardSkeleton({ className, ...props }) {
    return (
        <div
            className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm ${className}`}
            {...props}
        >
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-1/2" />
        </div>
    );
}
