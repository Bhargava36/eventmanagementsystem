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
import AdminEventTypeRoute from '../components/Organisms/AdminEventTypeRoute';
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
const LogsDashboard = lazy(() => import('../features/auth/pages/SuperAdmin/LogsDashboard'));
const OperationsHub = lazy(() => import('../features/auth/pages/SuperAdmin/OperationsHub'));
const SecurityCenter = lazy(() => import('../features/auth/pages/SuperAdmin/SecurityCenter'));
const SystemMonitoring = lazy(() => import('../features/auth/pages/SuperAdmin/SystemMonitoring'));
// Admin Pages
const AdminSidebar = lazy(() => import('../components/Organisms/AdminSidebar'));
const MyEventsPage = lazy(() => import('../features/auth/pages/Admin/MyEventsPage'));
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
// const FoodRedirectionPage = lazy(() => import('../features/auth/pages/Admin/FoodRedirectionPage'));
const IdRedirectionPage = lazy(() => import('../features/auth/pages/Admin/IdRedirectionPage'));
const IdDesignerPage = lazy(() => import('../features/auth/pages/Admin/IdDesignerPage'));
const TeamCardDesignerPage = lazy(() => import('../features/auth/pages/Admin/TeamCardDesignerPage'));
const Evaluators = lazy(() => import('../features/auth/pages/Admin/Evaluators'));
const AdminResultsPage = lazy(() => import('../features/auth/pages/Admin/AdminResultsPage'));
const EventBroadcastEmailer = lazy(() => import('../features/auth/pages/Admin/EventBroadcastEmailer'));
const AdminFeedback = lazy(() => import('../features/auth/pages/Admin/AdminFeedback'));
const WorkshopSessionsPage = lazy(() => import('../features/auth/pages/Admin/WorkshopSessionsPage'));
const WorkshopResourcesPage = lazy(() => import('../features/auth/pages/Admin/WorkshopResourcesPage'));
const WorkshopAttendancePage = lazy(() => import('../features/auth/pages/Admin/WorkshopAttendancePage'));
const WorkshopInstructorsPage = lazy(() => import('../features/auth/pages/Admin/WorkshopInstructorsPage'));
const WebinarAgendaPage = lazy(() => import('../features/auth/pages/Admin/WebinarAgendaPage'));
const WebinarResourcesPage = lazy(() => import('../features/auth/pages/Admin/WebinarResourcesPage'));
const WebinarAttendancePage = lazy(() => import('../features/auth/pages/Admin/WebinarAttendancePage'));
const WebinarSpeakersPage = lazy(() => import('../features/auth/pages/Admin/WebinarSpeakersPage'));
const WebinarQAModeration = lazy(() => import('../features/auth/pages/Admin/WebinarQAModeration'));
const SeminarOverviewPage = lazy(() => import('../features/auth/pages/Admin/SeminarOverviewPage'));
const SeminarSpeakersPage = lazy(() => import('../features/auth/pages/Admin/SeminarSpeakersPage'));
const SeminarAgendaPage = lazy(() => import('../features/auth/pages/Admin/SeminarAgendaPage'));
const SeminarAttendancePage = lazy(() => import('../features/auth/pages/Admin/SeminarAttendancePage'));
const SeminarResourcesPage = lazy(() => import('../features/auth/pages/Admin/SeminarResourcesPage'));
const AlumniOverviewPage = lazy(() => import('../features/auth/pages/Admin/AlumniOverviewPage'));
const AlumniAgendaPage = lazy(() => import('../features/auth/pages/Admin/AlumniAgendaPage'));
const AlumniRegistrationsPage = lazy(() => import('../features/auth/pages/Admin/AlumniRegistrationsPage'));
const AlumniAttendancePage = lazy(() => import('../features/auth/pages/Admin/AlumniAttendancePage'));
const AlumniInvitesPage = lazy(() => import('../features/auth/pages/Admin/AlumniInvitesPage'));
const AlumniMemoriesPage = lazy(() => import('../features/auth/pages/Admin/AlumniMemoriesPage'));
const ProjectExpoSettingsPage = lazy(() => import('../features/auth/pages/Admin/ProjectExpoSettingsPage'));
const ProjectExpoSubmissionsPage = lazy(() => import('../features/auth/pages/Admin/ProjectExpoSubmissionsPage'));
const ProjectExpoBoothsPage = lazy(() => import('../features/auth/pages/Admin/ProjectExpoBoothsPage'));
const ProjectExpoSchedulesPage = lazy(() => import('../features/auth/pages/Admin/ProjectExpoSchedulesPage'));
const ProjectExpoEvaluationPage = lazy(() => import('../features/auth/pages/Admin/ProjectExpoEvaluationPage'));
const ProjectExpoResultsPage = lazy(() => import('../features/auth/pages/Admin/ProjectExpoResultsPage'));
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
                <Route path="operations" element={<OperationsHub />} />
                <Route path="security" element={<SecurityCenter />} />
                <Route path="system-monitoring" element={<SystemMonitoring />} />
                <Route path="monitoring" element={<SystemMonitoring />} />
                <Route path="email-dispatch" element={<OperationsHub defaultTab="email" />} />
                <Route path="backup" element={<OperationsHub defaultTab="backup" />} />
                <Route path="webhooks" element={<OperationsHub defaultTab="webhooks" />} />
                <Route path="logs" element={<LogsDashboard />} />
                <Route path="profile" element={<SuperAdminProfile />} />
                <Route path="eventinfo/:id" element={<EventInfo />} />
                <Route path="profile/:id" element={<SuperAdminProfile />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminSidebar />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="my-events" element={<MyEventsPage />} />
                <Route path="dashboard" element={<AdminDashboard />} />

                {/* ── HACKATHON / COMPETITIVE TRACK ROUTES ── */}
                <Route
                  path="virtual-event"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Hackathon']} allowedModes={['virtual', 'both']}>
                      <AdminVirtualEvent />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="physical-event"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Hackathon']} allowedModes={['physical', 'both']}>
                      <AdminPhysicalEvent />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="virtual-results"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Hackathon']} allowedModes={['virtual', 'both']}>
                      <AdminResultsPage track="Virtual" />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="physical-results"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Hackathon']} allowedModes={['physical', 'both']}>
                      <AdminResultsPage track="Physical" />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="core-team"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Hackathon']}>
                      <CoreTeam />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="evaluators"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Hackathon']}>
                      <Evaluators />
                    </AdminEventTypeRoute>
                  }
                />

                {/* ── SHARED OPERATIONS & LOGISTICS ROUTES ── */}
                <Route
                  path="teams"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Hackathon', 'Project Expo', 'Workshop', 'Webinar', 'Seminar', 'Conference']}>
                      <TeamsDashboard />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="teams/:id"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Hackathon', 'Project Expo', 'Workshop', 'Webinar', 'Seminar', 'Conference']}>
                      <TeamDetails />
                    </AdminEventTypeRoute>
                  }
                />
                <Route path="settings" element={<AdminEventSettings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="profile/:id" element={<AdminProfile />} />
                <Route path="accomodation" element={<AdminModeRoute allowedModes={['physical', 'both']}> <AccomodationRedirectPage /> </AdminModeRoute>} />
                {/* <Route path="food" element={<AdminModeRoute allowedModes={['physical', 'both']}> <FoodRedirectionPage /> </AdminModeRoute>} /> */}
                <Route path="id-card" element={<AdminModeRoute allowedModes={['physical', 'both']}> <IdRedirectionPage /> </AdminModeRoute>} />
                <Route path="id-card-designer" element={<AdminModeRoute allowedModes={['physical', 'both']}> <IdDesignerPage /> </AdminModeRoute>} />
                <Route path="id-card/designer" element={<AdminModeRoute allowedModes={['physical', 'both']}> <IdDesignerPage /> </AdminModeRoute>} />
                <Route path="team-card-designer" element={<AdminModeRoute allowedModes={['physical', 'both']}> <TeamCardDesignerPage /> </AdminModeRoute>} />
                <Route path="team-card/designer" element={<AdminModeRoute allowedModes={['physical', 'both']}> <TeamCardDesignerPage /> </AdminModeRoute>} />
                <Route path="broadcast-emailer" element={<EventBroadcastEmailer />} />
                <Route path="feedback" element={<AdminFeedback />} />

                {/* ── WORKSHOP ROUTES ── */}
                <Route
                  path="workshop/curriculum"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Workshop']}>
                      <WorkshopSessionsPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="workshop/resources"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Workshop']}>
                      <WorkshopResourcesPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="workshop/attendance"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Workshop']}>
                      <WorkshopAttendancePage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="workshop/instructors"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Workshop']}>
                      <WorkshopInstructorsPage />
                    </AdminEventTypeRoute>
                  }
                />

                {/* ── WEBINAR ROUTES ── */}
                <Route
                  path="webinar/agenda"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Webinar']}>
                      <WebinarAgendaPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="webinar/resources"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Webinar']}>
                      <WebinarResourcesPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="webinar/attendance"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Webinar']}>
                      <WebinarAttendancePage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="webinar/speakers"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Webinar']}>
                      <WebinarSpeakersPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="webinar/qa"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Webinar']}>
                      <WebinarQAModeration />
                    </AdminEventTypeRoute>
                  }
                />

                {/* ── SEMINAR / CONFERENCE ROUTES ── */}
                <Route
                  path="seminar/overview"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Seminar', 'Conference']}>
                      <SeminarOverviewPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="seminar/speakers"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Seminar', 'Conference']}>
                      <SeminarSpeakersPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="seminar/agenda"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Seminar', 'Conference']}>
                      <SeminarAgendaPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="seminar/attendance"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Seminar', 'Conference']}>
                      <SeminarAttendancePage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="seminar/resources"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Seminar', 'Conference']}>
                      <SeminarResourcesPage />
                    </AdminEventTypeRoute>
                  }
                />

                {/* ── ALUMNI MEET ROUTES ── */}
                <Route
                  path="alumni/overview"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Alumni Meet']}>
                      <AlumniOverviewPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="alumni/agenda"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Alumni Meet']}>
                      <AlumniAgendaPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="alumni/speakers"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Alumni Meet']}>
                      <AlumniAgendaPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="alumni/registrations"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Alumni Meet']}>
                      <AlumniRegistrationsPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="alumni/attendance"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Alumni Meet']}>
                      <AlumniAttendancePage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="alumni/invites"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Alumni Meet']}>
                      <AlumniInvitesPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="alumni/memories"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Alumni Meet']}>
                      <AlumniMemoriesPage />
                    </AdminEventTypeRoute>
                  }
                />

                {/* ── PROJECT EXPO ROUTES ── */}
                <Route path="expo/settings" element={<Navigate to="/admin/settings" replace />} />
                <Route
                  path="expo/projects"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Project Expo']}>
                      <ProjectExpoSubmissionsPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="expo/booths"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Project Expo']}>
                      <ProjectExpoBoothsPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="expo/schedules"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Project Expo']}>
                      <ProjectExpoSchedulesPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="expo/evaluation"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Project Expo']}>
                      <ProjectExpoEvaluationPage />
                    </AdminEventTypeRoute>
                  }
                />
                <Route
                  path="expo/results"
                  element={
                    <AdminEventTypeRoute allowedTypes={['Project Expo']}>
                      <ProjectExpoResultsPage />
                    </AdminEventTypeRoute>
                  }
                />
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
                {/* <Route path="feedback" element={<UserFeedback />} /> */}
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
