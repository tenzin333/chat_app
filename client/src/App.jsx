import react, { useContext } from 'react';
import {Route, Routes} from 'react-router-dom'
import LoginPage from './layout/LoginPage';
import ProfilePage from './layout/ProfilePage';
import {Toaster} from 'react-hot-toast';  
import { AuthContext } from './context/AuthContext';
import HomePage from './layout/HomePage';

const App = () => {
  const {authUser,onlineUsers,login,logout,updateProfile,axios} = useContext(AuthContext);

  return (
    <div className="bg-[url('/bg.jpg')] bg-contain text-white">
      <Toaster/>
      <Routes>
        <Route  path="/" element={authUser ? <HomePage/> : <LoginPage/>} />
        <Route  path="/login" element={<LoginPage/>} />
        <Route  path="/profile" element={authUser ? <ProfilePage/> : <LoginPage/>} />
      </Routes>
    </div>
  )
}

export default App;