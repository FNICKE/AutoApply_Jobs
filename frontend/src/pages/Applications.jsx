// src/pages/Applications.jsx (Full updated code: FIXED setApplications to handle { applications: [] } response structure from backend; added safe .map check with Array.isArray; fallback to empty [] if data.applications undefined; improved error handling to show backend message if available; consistent with paginated response; no crash on .map)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplications, updateStatus } from '../api/api'
import { DocumentTextIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'

function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const fetchApplications = async () => {
      try {
        const data = await getApplications()
        // FIXED: Handle { applications: [] } structure; fallback to empty array
        const appsArray = Array.isArray(data) ? data : (data.applications || [])
        setApplications(appsArray)
      } catch (err) {
        // Enhanced: Show backend message if available
        const errMsg = err.response?.data?.message || 'Failed to load applications. Please refresh.'
        setError(errMsg)
        console.error('Fetch applications error:', err)
        setApplications([])  // Ensure empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [navigate])

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await updateStatus(appId, newStatus)
      setApplications(prev => 
        Array.isArray(prev) ? prev.map(app => 
          app.id === appId ? { ...app, status: newStatus } : app
        ) : []
      )
    } catch (err) {
      alert('Failed to update status')
      console.error(err)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      interview: 'bg-yellow-100 text-yellow-800',
      offer: 'bg-green-100 text-green-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
              Browse Jobs
            </button>
          </div>
          <p className="mt-2 text-lg text-gray-600">Track and manage your job applications here.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(!Array.isArray(applications) || applications.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">Get started by applying to some jobs!</p>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Find Jobs Now
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.job_title || 'Untitled Job'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.company_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {app.status === 'applied' && (
                          <select
                            onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                            value={app.status}
                            className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="applied">Applied</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        )}
                        {app.status !== 'applied' && getStatusBadge(app.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {applications.length} of {applications.length} {applications.length === 1 ? 'application' : 'applications'}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Applications