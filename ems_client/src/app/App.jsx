import React, { useState, Suspense, lazy } from 'react';
import { Route, Routes, Navigate, useParams } from 'react-router-dom';

function DirectVirtualEventRedirect() {
  const { id } = useParams();
  return <Navigate to={`/user/events/${id}/virtual`} replace />;
}

// Layouts, Wrappers & Immediate Essentials
import PublicLayout from '../components/Templates/PublicLayout';
import ProtectedRoute from '../components/Organisms/ProtectedRoute';
import Unauthorized from '../components/ui/Unauthorized';
import ThreePreloader from '../components/ui/ThreePreloader';
import ScrollToTopOnNavigate from '../components/ui/ScrollToTopOnNavigate';
import { normalizeHackathonMode } from '../lib/utils';



// ── LAZY LOADED ROUTE CHUNKS FOR LIGHTNING FAST INITIAL BUNDLE ──

// Public Pages
const HomePage = lazy(() => import('../features/public/pages/HomePage'));
const ExploreEvents = lazy(() => import('../features/public/pages/ExploreEvents'));
const PublicEventDetails = lazy(() => import('../features/public/pages/PublicEventDetails'));
const PublicTeamInfo = lazy(() => import('../features/public/pages/PublicTeamInfo'));
const VerifyIdPage = lazy(() => import('../features/public/pages/VerifyIdPage'));
const NotFound = lazy(() => import('../features/public/pages/NotFound'));
const TestCredentialsPage = lazy(() => import('../features/public/pages/TestCredentialsPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const TermsOfService = lazy(() => import('../features/public/pages/TermsOfService'));
const PrivacyNotice = lazy(() => import('../features/public/pages/PrivacyNotice'));
const PoliciesPage = lazy(() => import('../features/public/pages/PoliciesPage'));

// SuperAdmin Pages
const Login = lazy(() => import('../features/auth/pages/SuperAdmin/Login'));
const Register = lazy(() => import('../features/auth/pages/SuperAdmin/Register'));
const Sidebar = lazy(() => import('../components/Organisms/SideBar'));
const SuperAdminDashboard = lazy(() => import('../features/auth/pages/SuperAdmin/SuperAdminDashboard'));
const FeedbackDashboard = lazy(() => import('../features/auth/pages/SuperAdmin/FeedbackDashboard'));
const NotificationPage = lazy(() => import('../features/auth/pages/SuperAdmin/NotificationPage'));
const EventsDashboard = lazy(() => import('../features/auth/pages/SuperAdmin/EventsDashboard'));
const SuperAdminProfile = lazy(() => import('../features/auth/pages/SuperAdmin/SuperAdminProfile'));
const EventInfo = lazy(() => import('../features/auth/pages/SuperAdmin/EventInfo'));
const AllUsersPage = lazy(() => import('../features/auth/pages/SuperAdmin/AllUsersPage'));

// Admin Pages
const AdminSidebar = lazy(() => import('../components/Organisms/AdminSidebar'));
const AdminLogin = lazy(() => import('../features/auth/pages/Admin/AdminLogin'));
const AdminRegister = lazy(() => import('../features/auth/pages/Admin/AdminRegister'));
const AdminDashboard = lazy(() => import('../features/auth/pages/Admin/AdminDashboard'));
const TeamsDashboard = lazy(() => import('../features/auth/pages/Admin/TeamsDashboard'));
const TeamDetails = lazy(() => import('../features/auth/pages/Admin/TeamDetails'));
const AdminProfile = lazy(() => import('../features/auth/pages/Admin/AdminProfile'));
const CoreTeam = lazy(() => import('../features/auth/pages/Admin/CoreTeam'));
const AdminVirtualEvent = lazy(() => import('../features/auth/pages/Admin/AdminVirtualEvent'));
const AdminPhysicalEvent = lazy(() => import('../features/auth/pages/Admin/AdminPhysicalEvent'));
const AdminEventSettings = lazy(() => import('../features/auth/pages/Admin/AdminEventSettings'));
const AccomodationRedirectPage = lazy(() => import('../features/auth/pages/Admin/AccomodationRedirectPage'));
const FoodRedirectionPage = lazy(() => import('../features/auth/pages/Admin/FoodRedirectionPage'));
const IdRedirectionPage = lazy(() => import('../features/auth/pages/Admin/IdRedirectionPage'));
const IdDesignerPage = lazy(() => import('../features/auth/pages/Admin/IdDesignerPage'));
const TeamCardDesignerPage = lazy(() => import('../features/auth/pages/Admin/TeamCardDesignerPage'));
const Evaluators = lazy(() => import('../features/auth/pages/Admin/Evaluators'));
const AdminResultsPage = lazy(() => import('../features/auth/pages/Admin/AdminResultsPage'));
const EventBroadcastEmailer = lazy(() => import('../features/auth/pages/Admin/EventBroadcastEmailer'));
const AdminFeedback = lazy(() => import('../features/auth/pages/Admin/AdminFeedback'));

// User Pages
const UserSidebar = lazy(() => import('../components/Organisms/UserSidebar'));
const UserLogin = lazy(() => import('../features/auth/pages/Users/UserLogin'));
const UserRegister = lazy(() => import('../features/auth/pages/Users/UserRegister'));
const UserDashboard = lazy(() => import('../features/auth/pages/Users/UserDashboard'));
const UserFeedback = lazy(() => import('../features/auth/pages/Users/UserFeedback'));
const EventRedirectPage = lazy(() => import('../features/auth/pages/Users/EventRedirectPage'));
const ParticipantVirtualEventPage = lazy(() => import('../features/auth/pages/Users/ParticipantVirtualEventPage'));
const MyTeams = lazy(() => import('../features/auth/pages/Users/MyTeams'));
const TeamInfo = lazy(() => import('../features/auth/pages/Users/TeamInfo'));
const UserProfile = lazy(() => import('../features/auth/pages/Users/UserProfile'));
const UserCompetitions = lazy(() => import('../features/auth/pages/Users/UserCompetitions'));

// Evaluator Pages
const EvaluatorLogin = lazy(() => import('../features/auth/pages/Evaluator/EvaluatorLogin'));
const EvaluatorDashboard = lazy(() => import('../features/auth/pages/Evaluator/EvaluatorDashboard'));
const EvaluateTeamPage = lazy(() => import('../features/auth/pages/Evaluator/EvaluateTeamPage'));

function AdminModeRoute({ allowedModes, children }) {
  let admin = {};

  try {
    admin = JSON.parse(localStorage.getItem('admin') || '{}');
  } catch {
    admin = {};
  }

  const mode = normalizeHackathonMode(admin?.HackathonMode, admin?.Location);

  if (!mode || !allowedModes.includes(mode)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

function App() {
  const [isReady, setIsReady] = useState(() => {
    // Only run the full preloader once per session to maintain quick subsequent navigation
    try {
      return Boolean(sessionStorage.getItem('ayojan_preloader_seen'));
    } catch {
      return false;
    }
  });

  const handlePreloaderComplete = () => {
    setIsReady(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <ScrollToTopOnNavigate />
      {/* Three.js 4-Dots Official Website Preloader - Runs once per browser session */}
      {!isReady && <ThreePreloader onComplete={handlePreloaderComplete} />}

      {/* Website loads and renders on-demand with Suspense */}
      {isReady && (
        <Suspense >
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<ExploreEvents />} />
              <Route path="/explore" element={<ExploreEvents />} />
              <Route path="/events/:id/virtual" element={<DirectVirtualEventRedirect />} />
              <Route path="/events/:id" element={<PublicEventDetails />} />
              <Route path="/explore/:id" element={<PublicEventDetails />} />
              <Route path="/superadmin/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/superadmin/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/register" element={<UserRegister />} />
              <Route path="/evaluator/login" element={<EvaluatorLogin />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/test-credentials" element={<TestCredentialsPage />} />
              <Route path="/testing" element={<TestCredentialsPage />} />
              <Route path="/dev-users" element={<TestCredentialsPage />} />
              <Route path="/teams/public/:teamId" element={<PublicTeamInfo />} />
              <Route path="/public/team/:teamId" element={<PublicTeamInfo />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyNotice />} />
              <Route path="/privacy-notice" element={<PrivacyNotice />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/guidelines" element={<PoliciesPage />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="/sidebar" element={<Sidebar />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="feedback" element={<FeedbackDashboard />} />
                <Route path="notification" element={<NotificationPage />} />
                <Route path="events" element={<EventsDashboard />} />
                <Route path="users" element={<AllUsersPage />} />
                <Route path="profile" element={<SuperAdminProfile />} />
                <Route path="eventinfo/:id" element={<EventInfo />} />
                <Route path="profile/:id" element={<SuperAdminProfile />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminSidebar />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="virtual-event" element={<AdminModeRoute allowedModes={['virtual', 'both']}> <AdminVirtualEvent /> </AdminModeRoute>} />
                <Route path="physical-event" element={<AdminModeRoute allowedModes={['physical', 'both']}> <AdminPhysicalEvent /> </AdminModeRoute>} />
                <Route path="core-team" element={<CoreTeam />} />
                <Route path="teams" element={<TeamsDashboard />} />
                <Route path="teams/:id" element={<TeamDetails />} />
                <Route path="settings" element={<AdminEventSettings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="profile/:id" element={<AdminProfile />} />
                <Route path="accomodation" element={<AdminModeRoute allowedModes={['physical', 'both']}> <AccomodationRedirectPage /> </AdminModeRoute>} />
                <Route path="food" element={<AdminModeRoute allowedModes={['physical', 'both']}> <FoodRedirectionPage /> </AdminModeRoute>} />
                <Route path="id-card" element={<AdminModeRoute allowedModes={['physical', 'both']}> <IdRedirectionPage /> </AdminModeRoute>} />
                <Route path="id-card-designer" element={<AdminModeRoute allowedModes={['physical', 'both']}> <IdDesignerPage /> </AdminModeRoute>} />
                <Route path="id-card/designer" element={<AdminModeRoute allowedModes={['physical', 'both']}> <IdDesignerPage /> </AdminModeRoute>} />
                <Route path="team-card-designer" element={<AdminModeRoute allowedModes={['physical', 'both']}> <TeamCardDesignerPage /> </AdminModeRoute>} />
                <Route path="team-card/designer" element={<AdminModeRoute allowedModes={['physical', 'both']}> <TeamCardDesignerPage /> </AdminModeRoute>} />
                <Route path="evaluators" element={<Evaluators />} />
                <Route path="broadcast-emailer" element={<EventBroadcastEmailer />} />
                <Route path="physical-results" element={<AdminModeRoute allowedModes={['physical', 'both']}> <AdminResultsPage track="Physical" /> </AdminModeRoute>} />
                <Route path="virtual-results" element={<AdminModeRoute allowedModes={['virtual', 'both']}> <AdminResultsPage track="Virtual" /> </AdminModeRoute>} />
                <Route path="feedback" element={<AdminFeedback />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['user']} redirectPath="/user/login" />}>
              <Route path="/user" element={<UserSidebar />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="teams" element={<MyTeams />} />
                <Route path="teamInfo/:teamId" element={<TeamInfo />} />
                <Route path="team-dashboard/:teamId" element={<TeamInfo />} />
                <Route path="events/:id" element={<EventRedirectPage />} />
                <Route path="events/:id/virtual" element={<ParticipantVirtualEventPage />} />
                <Route path="competitions" element={<UserCompetitions />} />
                <Route path="feedback" element={<UserFeedback />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="profile/:id" element={<UserProfile />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['evaluator']} redirectPath="/evaluator/login" />}>
              <Route path="/evaluator/dashboard" element={<EvaluatorDashboard />} />
              <Route path="/evaluator/evaluate/:roundId/:teamId" element={<EvaluateTeamPage />} />
            </Route>

            <Route path="/verify-id" element={<VerifyIdPage />} />
          </Routes>
        </Suspense>
      )}
    </div>
  );
}

export default App;