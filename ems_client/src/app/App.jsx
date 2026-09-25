import { Route, Routes, Navigate } from 'react-router-dom';
import HeroSection from '../components/ui/HeroSection';
import Login from '../features/auth/pages/SuperAdmin/Login';
import Register from '../features/auth/pages/SuperAdmin/Register';
import Sidebar from '../components/Organisms/SideBar';
import SuperAdminDashboard from '../features/auth/pages/SuperAdmin/SuperAdminDashboard';
import FeedbackDashboard from '../features/auth/pages/SuperAdmin/FeedbackDashboard';
import NotificationPage from '../features/auth/pages/SuperAdmin/NotificationPage';
import EventsDashboard from '../features/auth/pages/SuperAdmin/EventsDashboard';
import SuperAdminProfile from '../features/auth/pages/SuperAdmin/SuperAdminProfile';
import AdminSidebar from '../components/Organisms/AdminSidebar';
import EventInfo from '../features/auth/pages/SuperAdmin/EventInfo';
import PublicLayout from '../components/Templates/PublicLayout';
// import AdminRegister from '../features/auth/pages/Admin/AdminRegister';
import AdminLogin from '../features/auth/pages/Admin/AdminLogin';
import TeamsDashboard from '../features/auth/pages/Admin/TeamsDashboard';
import TeamDetails from '../features/auth/pages/Admin/TeamDetails';
import AdminDashboard from '../features/auth/pages/Admin/AdminDashboard';
import AdminProfile from '../features/auth/pages/Admin/AdminProfile';
import CoreTeam from '../features/auth/pages/Admin/CoreTeam';
import UserSidebar from '../components/Organisms/UserSidebar';
import UserRegister from '../features/auth/pages/Users/UserRegister';
import UserLogin from '../features/auth/pages/Users/UserLogin';
import UserDashboard from '../features/auth/pages/Users/UserDashboard';
import ProblemStatementsPage from '../features/auth/pages/Users/ProblemStatements';
import EventRedirectPage from '../features/auth/pages/Users/EventRedirectPage';
import MyTeams from '../features/auth/pages/Users/MyTeams';
import TeamInfo from '../features/auth/pages/Users/TeamInfo';
import UserProfile from '../features/auth/pages/Users/UserProfile';
import ProtectedRoute from '../components/Organisms/ProtectedRoute';
import Unauthorized from '../components/ui/Unauthorized';

function App() {
  return (
    <div>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HeroSection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          {/* <Route path="/admin/register" element={<AdminRegister />} /> */}
        </Route>


        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route path="/sidebar" element={<Sidebar />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="feedback" element={<FeedbackDashboard />} />
            <Route path="notification" element={<NotificationPage />} />
            <Route path="events" element={<EventsDashboard />} />
            <Route path="profile" element={<SuperAdminProfile />} />
            <Route path="eventinfo/:id" element={<EventInfo />} />
            <Route path="profile/:id" element={<SuperAdminProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminSidebar />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="core-team" element={<CoreTeam />} />
            <Route path="teams" element={<TeamsDashboard />} />
            <Route path="teams/:id" element={<TeamDetails />} />
            <Route path="profile/:id" element={<AdminProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']} redirectPath="/user/login" />}>
         <Route path="/user" element={<UserSidebar />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="teams" element={<MyTeams />} />
            <Route path="teamInfo" element={<TeamInfo />} />
            <Route path="events/:id" element={<EventRedirectPage />} />
            <Route path="problem-statements" element={<ProblemStatementsPage />} />
            <Route path="profile/:id" element={<UserProfile/>} />
          </Route>
        </Route>


          

       
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;