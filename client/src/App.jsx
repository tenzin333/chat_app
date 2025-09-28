import react from 'react';
import {Route, Routes} from 'react-router-dom'
import HomePage from './layout/Homepage';
import LoginPage from './layout/LoginPage';
import ProfilePage from './layout/ProfilePage';

const App = () => {
  return (
    <div className="bg-[url('./assets/bg.jpg')] bg-contain text-white">
      <Routes>
        <Route  path="/" element={<HomePage/>} />
        <Route  path="/login" element={<LoginPage/>} />
        <Route  path="/profile" element={<ProfilePage/>} />
      </Routes>
    </div>
  )
}

export default App;