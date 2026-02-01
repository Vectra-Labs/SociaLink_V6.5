import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col w-full bg-slate-50 dark:bg-slate-900">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
