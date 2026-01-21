import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Applications from './pages/Applications'
import Profile from './pages/Profile'
import { getProfile } from './api/api'
import './index.css'

function App() {
  const [profile, setProfile] = useState(null)
  const [autoSearchActive] = useState(true) // Global state for the sidebar indicator
  const location = useLocation()

  // Don't show sidebar on Auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (token && !isAuthPage) {
        try {
          const data = await getProfile()
          setProfile(data)
        } catch (err) {
          console.error("Session expired")
        }
      }
    }
    fetchUser()
  }, [location.pathname, isAuthPage])

  const handleAutoApply = () => {
    console.log("Global Auto-Apply Triggered")
    // This can be connected to a global state or context if needed
  }

  return (
    <div className="flex min-h-screen bg-[#FDFDFF]">
      {/* 1. Sidebar - Only renders if not on Login/Register */}
      {!isAuthPage && (
        <Sidebar 
          profile={profile} 
          autoSearchActive={autoSearchActive} 
          onAutoApply={handleAutoApply} 
        />
      )}

      {/* 2. Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isAuthPage ? 'w-full' : 'w-[calc(100%-17.5rem)]'}`}>
        <div className={isAuthPage ? "" : "max-w-[1400px] mx-auto"}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={
              <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl font-black text-slate-900">404 - Page Not Found</h1>
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App