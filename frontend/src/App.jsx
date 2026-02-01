import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { StatusGuard } from './components/subscription';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import RegisterWorker from './pages/RegisterWorker';
import RegisterEstablishment from './pages/RegisterEstablishment';
import VerifyEmail from './pages/auth/VerifyEmail';
import Contact from './pages/Contact';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import WorkerLayout from './components/WorkerLayout';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import EditProfile from './pages/worker/EditProfile';
import SpecialitiesManager from './pages/worker/SpecialitiesManager';
import DiplomaManager from './pages/worker/DiplomaManager';
import WorkerExperience from './pages/worker/WorkerExperience';
import WorkerCalendar from './pages/worker/WorkerCalendar';
import WorkerDocuments from './pages/worker/WorkerDocuments';

import WorkerReviews from './pages/worker/WorkerReviews';
import WorkerSettings from './pages/worker/WorkerSettings';
import WorkerSubscription from './pages/worker/WorkerSubscription';
import WorkerNotifications from './pages/worker/WorkerNotifications';
import Messages from './pages/worker/Messages';

import EstablishmentLayout from './components/EstablishmentLayout';
import EstablishmentDashboard from './pages/establishment/EstablishmentDashboard';
import CreateMission from './pages/establishment/CreateMission';
import EditMission from './pages/establishment/EditMission';
import MyMissions from './pages/establishment/MyMissions';
import Billing from './pages/establishment/Billing';
import Candidates from './pages/establishment/Candidates';
import EstablishmentProfile from './pages/establishment/EstablishmentProfile';
import SearchWorker from './pages/establishment/SearchWorker';
import WorkerProfileDetail from './pages/establishment/WorkerProfileDetail';
import EstablishmentSettings from './pages/establishment/EstablishmentSettings';
import EstablishmentDocuments from './pages/establishment/EstablishmentDocuments';

import MissionMarket from './pages/worker/MissionMarket';
import EstablishmentProfileView from './pages/worker/EstablishmentProfileView';
import PublicWorkerProfile from './pages/worker/PublicWorkerProfile';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWorkerDetails from './pages/admin/AdminWorkerDetails';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import AdminValidations from './pages/admin/AdminValidations';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/AdminMessages';
import AdminProfile from './pages/admin/AdminProfile';
import AdminEstablishmentDocs from './pages/admin/AdminEstablishmentDocs';
import AdminMissions from './pages/admin/AdminMissions';
import WorkerVerification from './pages/admin/WorkerVerification';
import WorkerVerificationDetail from './pages/admin/WorkerVerificationDetail';
import EstablishmentVerification from './pages/admin/EstablishmentVerification';
import EstablishmentVerificationDetail from './pages/admin/EstablishmentVerificationDetail';

import SuperAdminLayout from './components/SuperAdminLayout';
import SuperAdminOverview from './pages/admin/SuperAdminOverview';
import SuperAdminAdmins from './pages/admin/SuperAdminAdmins';
import SuperAdminUsers from './pages/admin/SuperAdminUsers';
import SuperAdminSubscriptions from './pages/admin/SuperAdminSubscriptions';
import SuperAdminMarketing from './pages/admin/SuperAdminMarketing';
import SuperAdminFinance from './pages/admin/SuperAdminFinance';
import SuperAdminQuality from './pages/admin/SuperAdminQuality';
import SuperAdminDisputes from './pages/admin/SuperAdminDisputes';
import SuperAdminSettings from './pages/admin/SuperAdminSettings';
import SuperAdminPrivileges from './pages/admin/SuperAdminPrivileges';

import MissionsPage from './pages/MissionsPage';
import MissionDetail from './pages/MissionDetail';

// Legal Pages
import AboutUs from './pages/legal/AboutUs';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import LegalMentions from './pages/legal/LegalMentions';
import Cookies from './pages/legal/Cookies';
import Sitemap from './pages/legal/Sitemap';

// Payment Pages
import PricingPage from './pages/PricingPage';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentCancel from './pages/payment/PaymentCancel';

import './App.css';

// Protected Route Component with Status Guard
const ProtectedRoute = ({ children, allowedRoles, skipStatusGuard = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;

  // Skip status guard for admins and super admins
  if (skipStatusGuard || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return children;
  }

  // Wrap with StatusGuard for workers and establishments
  return <StatusGuard>{children}</StatusGuard>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Payment Pages - NO Layout (standalone) */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Auth Routes - NO Layout (no navbar/footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register/worker" element={<RegisterWorker />} />
        <Route path="/register/establishment" element={<RegisterEstablishment />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin Routes - Uses AdminLayout with Sidebar */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="worker/:id" element={<AdminWorkerDetails />} />
          <Route path="validations" element={<AdminValidations />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="establishment-documents" element={<AdminEstablishmentDocs />} />
          <Route path="missions" element={<AdminMissions />} />
          {/* Unified Verification Routes */}
          <Route path="verification/workers" element={<WorkerVerification />} />
          <Route path="verification/workers/:id" element={<WorkerVerificationDetail />} />
          <Route path="verification/establishments" element={<EstablishmentVerification />} />
          <Route path="verification/establishments/:id" element={<EstablishmentVerificationDetail />} />
          {/* Redirect root /admin to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>


        {/* Super Admin Routes - Uses SuperAdminLayout with Sidebar */}
        <Route path="/super-admin" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<SuperAdminOverview />} />
          <Route path="admins" element={<SuperAdminAdmins />} />
          <Route path="users" element={<SuperAdminUsers />} />
          <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
          <Route path="marketing" element={<SuperAdminMarketing />} />
          <Route path="finance" element={<SuperAdminFinance />} />
          <Route path="quality" element={<SuperAdminQuality />} />
          <Route path="disputes" element={<SuperAdminDisputes />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<SuperAdminSettings />} />
          <Route path="privileges" element={<SuperAdminPrivileges />} />
          {/* Redirect root /super-admin to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Worker Routes - Standalone Layout similar to Admin */}
        <Route path="/worker" element={
          <ProtectedRoute allowedRoles={['WORKER']}>
            <WorkerLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="profile" element={<EditProfile />} />
          <Route path="specialities" element={<SpecialitiesManager />} />
          <Route path="experiences" element={<WorkerExperience />} />
          <Route path="diplomas" element={<Navigate to="/worker/documents" replace />} />
          <Route path="calendar" element={<WorkerCalendar />} />
          <Route path="documents" element={<WorkerDocuments />} />
          <Route path="missions" element={<MissionMarket />} />
          <Route path="missions/:id" element={<MissionDetail />} />
          <Route path="applications" element={<Navigate to="/worker/missions" replace />} />
          <Route path="reviews" element={<WorkerReviews />} />
          <Route path="notifications" element={<WorkerNotifications />} />
          <Route path="settings" element={<WorkerSettings />} />
          <Route path="subscription" element={<WorkerSubscription />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        {/* Establishment Routes - Standalone Layout similar to Admin */}
        <Route path="/establishment" element={
          <ProtectedRoute allowedRoles={['ESTABLISHMENT']}>
            <EstablishmentLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<EstablishmentDashboard />} />
          <Route path="profile" element={<EstablishmentProfile />} />
          <Route path="missions/create" element={<CreateMission />} />
          <Route path="missions/:id/edit" element={<EditMission />} />
          <Route path="missions" element={<MyMissions />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="applications" element={<Candidates />} /> {/* Alias for candidates */}
          <Route path="search_worker" element={<SearchWorker />} />
          <Route path="search-worker" element={<SearchWorker />} /> {/* Alias with dash */}
          <Route path="worker/:id" element={<WorkerProfileDetail />} />
          <Route path="billing" element={<Billing />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<EstablishmentSettings />} />
          <Route path="documents" element={<EstablishmentDocuments />} />
        </Route>

        {/* Main Routes with Layout (navbar + footer) */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Etablissement Profile (Workers only) */}
          <Route path="/etablissement/:slug" element={
            <ProtectedRoute allowedRoles={['WORKER']}>
              <EstablishmentProfileView />
            </ProtectedRoute>
          } />


          {/* Public Missions Hub */}
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/missions/:id" element={<MissionDetail />} />

          {/* Legal Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/legal" element={<LegalMentions />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/sitemap" element={<Sitemap />} />

          {/* Pricing & Payment */}
          <Route path="/pricing" element={<PricingPage />} />

          {/* Home Page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<Contact />} />

          {/* Public Worker Profile */}
          <Route path="/worker/public/:id" element={<PublicWorkerProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
