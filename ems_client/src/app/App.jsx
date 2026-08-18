import { Navbar } from '../components/Molecules/Navbar';
import { Route, Routes } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Sidebar from '../components/Organisms/SideBar';
import SuperAdminDashboard from '../features/auth/pages/SuperAdminDashboard';
import FeedbackDashboard from '../features/auth/pages/FeedbackDashboard';
import NotificationPage from '../features/auth/pages/NotificationPage';
import EventsDashboard from '../features/auth/pages/EventsDashboard';
import SuperAdminProfile from '../features/auth/pages/SuperAdminProfile';
import EventInfo from '../features/auth/pages/EventInfo';
function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/sidebar' element={<Sidebar />}>
          <Route path='dashboard' element={<SuperAdminDashboard />} />
          <Route path='feedback' element={<FeedbackDashboard />} />
          <Route path='notification' element={<NotificationPage />} />
          <Route path='events' element={<EventsDashboard />} />
          <Route path='profile' element={<SuperAdminProfile />} />
        </Route>
        <Route path='/eventinfo' element={<EventInfo />} />
      </Routes>
    </div>
  )
}

export default App
