import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Effect for redirection logic
    useEffect(() => {
        if (!loading && user) {
            switch (user.role) {
                case 'WORKER':
                    navigate('/worker/dashboard');
                    break;
                case 'ESTABLISHMENT':
                    navigate('/establishment/dashboard');
                    break;
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'SUPER_ADMIN':
                    navigate('/super-admin/dashboard');
                    break;
                default:
                    // If no role or unknown role, stay here or go to home
                    // Ideally this shouldn't happen for authenticated users
                    console.warn('Unknown user role:', user.role);
                    break;
            }
        }
    }, [user, loading, navigate]);

    // Show loading state while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500">Redirection vers votre espace...</p>
            </div>
        </div>
    );
};

export default Dashboard;
