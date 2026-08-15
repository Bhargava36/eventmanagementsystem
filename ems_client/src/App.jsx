<<<<<<< Updated upstream:ems_client/src/App.jsx
import './App.css'
import { Navbar } from './components/Molecules/Navbar'
import EventCard from './components/Molecules/EventCard'
import { HeroSection } from './components/ui/HeroSection'

=======
import { Navbar } from '../components/Molecules/Navbar';
import EventCard from '../components/Molecules/EventCard';
import { HeroSection } from '../components/ui/HeroSection';
import { Route, Router, Routes } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Sidebar from '../components/Organisms/SideBar';
>>>>>>> Stashed changes:ems_client/src/app/App.jsx
function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
      <Navbar />

      
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/sidebar' element={<Sidebar/>}/>
        </Routes>

    </div>
  )
}

export default App
