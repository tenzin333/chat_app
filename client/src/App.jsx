import react, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom'
import LoginPage from './layout/LoginPage';
import ProfilePage from './layout/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';
import HomePage from './layout/HomePage';
import { Navigate } from 'react-router-dom';

const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    <div className="bg-[url('/bg.jpg')] bg-contain text-white">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  )
}

export default App;