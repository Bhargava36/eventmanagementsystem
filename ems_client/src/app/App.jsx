import { Navbar } from '../components/Molecules/Navbar';
import { Route, Routes } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Sidebar from '../components/Organisms/SideBar';

function App() {
  return (
    <div>
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
