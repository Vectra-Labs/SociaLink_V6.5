import { Skeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { THEME } from '../../utils/theme';

export default function WorkerDashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50/50 pb-10">
            {/* Header Skeleton */}
            <div className="mb-8 p-6 rounded-3xl bg-white shadow-xl shadow-blue-900/10 relative overflow-hidden h-[200px] flex flex-col justify-center">
                <Skeleton className="h-10 w-2/3 md:w-1/3 mb-4 bg-slate-100" />
                <Skeleton className="h-6 w-1/2 md:w-1/4 bg-slate-100" />
            </div>

            {/* Profile Progress Skeleton */}
            <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between mb-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-10" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full mb-3" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Recommended Missions Skeleton */}
            <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <div className="flex justify-between mb-6">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex gap-3">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                        <div className="flex justify-between mb-6">
                            <Skeleton className="h-7 w-56" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <div className="space-y-2 w-1/3">
                                        <Skeleton className="h-5 w-full" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="space-y-4">
                    {/* Calendar Skeleton */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-64">
                        <div className="flex justify-between mb-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="flex gap-1">
                                <Skeleton className="h-6 w-6" />
                                <Skeleton className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 mt-4">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <Skeleton key={i} className="h-7 w-7 rounded-full" />
                            ))}
                        </div>
                    </div>

                    {/* Chart Skeleton */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-48">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-2 w-full rounded-full" />
                            <Skeleton className="h-2 w-3/4 rounded-full" />
                            <Skeleton className="h-2 w-1/2 rounded-full" />
                        </div>
                    </div>


                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-40">
                        <Skeleton className="h-6 w-24 mb-4" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-full rounded-lg" />
                            <Skeleton className="h-8 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
