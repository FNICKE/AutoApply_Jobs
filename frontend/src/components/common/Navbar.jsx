// src/components/common/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { UserIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { logout } from '../../api/api'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const handleLogout = async () => {
    try {
      await logout()  // Calls backend to stop auto-search
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <UserIcon className="h-6 w-6 mr-2" />
          AutoHire
        </Link>
        {token ? (
          <div className="flex items-center space-x-4">
            <Link to="/jobs" className="hover:underline">Jobs</Link>
            <Link to="/applications" className="hover:underline">Applications</Link>
            <Link to="/profile" className="hover:underline">Profile</Link>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100">Register</Link>
          </div>
        )}
        <button className="lg:hidden">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </nav>
  )
}

export default Navbar