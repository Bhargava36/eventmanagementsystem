import { Navbar } from '../components/Molecules/Navbar';
import { Navigate, Route, Routes } from 'react-router-dom';
import HeroSection from '../components/ui/HeroSection';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Sidebar from '../components/Organisms/SideBar';
import SuperAdminDashboard from '../features/auth/pages/SuperAdminDashboard';
import FeedbackDashboard from '../features/auth/pages/FeedbackDashboard';
import NotificationPage from '../features/auth/pages/NotificationPage';
import EventsDashboard from '../features/auth/pages/EventsDashboard';
import SuperAdminProfile from '../features/auth/pages/SuperAdminProfile';
import EventInfo from '../features/auth/pages/EventInfo';
import PublicLayout from '../components/Templates/PublicLayout';
import AdminRegister from '../features/auth/pages/AdminRegister';
import AdminLogin from '../features/auth/pages/AdminLogin';
import TeamsDashboard from '../features/auth/pages/TeamsDashboard';
import TeamDetails from '../features/auth/pages/TeamDetails';
function App() {
  return (
    <div>

      <Routes>
        <Route element={<PublicLayout />} >
          <Route path='/' element={<HeroSection />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/admin/register' element={<AdminRegister />} />
          <Route path='/admin/login' element={<AdminLogin />} />
        </Route>

        <Route path='/sidebar' element={<Sidebar />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path='feedback' element={<FeedbackDashboard />} />
          <Route path='notification' element={<NotificationPage />} />
          <Route path='events' element={<EventsDashboard />} />
          <Route path='profile' element={<SuperAdminProfile />} />
          <Route path='eventinfo' element={<EventInfo />} />
        </Route>
        
        <Route path='/teams' element={<TeamsDashboard />} />
        <Route path='/teamdetails' element={<TeamDetails />} />
      </Routes>
    </div>
  );
}

export default App;