import react, { useContext } from 'react';
import {Route, Routes} from 'react-router-dom'
import LoginPage from './layout/LoginPage';
import ProfilePage from './layout/ProfilePage';
import {Toaster} from 'react-hot-toast';  
import { AuthContext } from './context/AuthContext';
import HomePage from './layout/HomePage';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const {authUser,onlineUsers,login,logout,updateProfile,axios} = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <div className="bg-[url('/bg.jpg')] bg-contain text-white">
      <Toaster/>
      <Routes>
        <Route  path="/" element={authUser ? <HomePage/> : navigate("/login")} />
        <Route  path="/login" element={!authUser ? <LoginPage/>: navigate("/")} />
        <Route  path="/profile" element={authUser ? <ProfilePage/> : navigate("/login")} />
      </Routes>
    </div>
  )
}

export default App;