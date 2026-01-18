// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar.jsx'
import Login from './pages/Auth/Login.jsx'  // Placeholder import (not provided here)
import Register from './pages/Auth/Register.jsx'  // Placeholder import (not provided here)
import Dashboard from './pages/Dashboard.jsx'
import Jobs from './pages/Jobs.jsx'
import Applications from './pages/Applications.jsx'
import Profile from './pages/Profile.jsx'
import './index.css'  // Tailwind styles

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Page Not Found</h1></div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App