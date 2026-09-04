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
import AdminRegister from '../features/auth/pages/Admin/AdminRegister';
import AdminLogin from '../features/auth/pages/Admin/AdminLogin';
import TeamsDashboard from '../features/auth/pages/Admin/TeamsDashboard';
import TeamDetails from '../features/auth/pages/Admin/TeamDetails';
import AdminDashboard from '../features/auth/pages/Admin/AdminDashboard';
import AdminProfile from '../features/auth/pages/Admin/AdminProfile';

function App() {
  return (
    <div>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HeroSection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
        </Route>

        <Route path="/sidebar" element={<Sidebar />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="feedback" element={<FeedbackDashboard />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="events" element={<EventsDashboard />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route path="eventinfo/:id" element={<EventInfo />} />
        </Route>

        <Route path="/admin" element={<AdminSidebar />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teams" element={<TeamsDashboard />} />
          <Route path="teams/:id" element={<TeamDetails />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>


      </Routes>
    </div>
  );
}

export default App;