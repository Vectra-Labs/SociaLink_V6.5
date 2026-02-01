import { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User } from 'lucide-react';
import api from '../../api/client';

export default function WorkerReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, total: 0 });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/worker/reviews');
            const data = res.data.data || [];
            setReviews(data);

            // Calculate stats
            if (data.length > 0) {
                const total = data.length;
                const sum = data.reduce((acc, r) => acc + r.rating, 0);
                setStats({
                    average: (sum / total).toFixed(1),
                    total
                });
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Global Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        Mes Avis
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Consultez les retours des établissements sur vos missions passées.
                    </p>
                </div>

                <div className="flex items-center gap-8 bg-slate-50 px-6 py-4 rounded-xl">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-slate-800">{stats.average}</p>
                        <div className="flex items-center gap-1 justify-center mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.round(stats.average) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Note moyenne</p>
                    </div>
                    <div className="w-px h-12 bg-slate-200"></div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                        <p className="text-xs text-slate-500 mt-1">Avis reçus</p>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {reviews.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {review.author[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{review.author}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                {review.missionTitle ? (
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
                                                        Mission: {review.missionTitle}
                                                    </span>
                                                ) : 'Mission archivée'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {review.date}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-slate-600 ml-13 pl-13 text-sm leading-relaxed border-l-2 border-slate-100 pl-4">
                                    {review.comment}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-800">Aucun avis pour le moment</h3>
                        <p className="text-slate-500 mt-2">
                            Terminez des missions pour recevoir vos premières évaluations.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
