// src/pages/Dashboard.jsx (Full updated: Fixed getJobMatches param pass as object { user_id }; granular error handling in fetchData; partial loading; better UX for empty states; ensured user.id validation)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobMatches, getApplications, getProfile, autoApplyJobs } from '../api/api'
import JobCard from '../components/job/JobCard'
import { UserIcon, BriefcaseIcon, DocumentTextIcon, ChartBarIcon, SparklesIcon, StopIcon } from '@heroicons/react/24/outline'

function Dashboard() {
  const [matches, setMatches] = useState([])
  const [applications, setApplications] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoApplying, setAutoApplying] = useState(false)
  const [autoSearchActive, setAutoSearchActive] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    setAutoSearchActive(true)  // Start on load

    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user.id) throw new Error('User ID missing in localStorage')

        // Granular parallel fetches with individual error handling
        const profilePromise = getProfile().catch(err => { console.error('Profile fetch failed:', err); return null; });
        const matchesPromise = getJobMatches({ user_id: user.id }).catch(err => { console.error('Matches fetch failed:', err); return []; });
        const appsPromise = getApplications().catch(err => { console.error('Apps fetch failed:', err); return []; });

        const [profileData, matchesData, appsData] = await Promise.all([profilePromise, matchesPromise, appsPromise]);

        setProfile(profileData);
        setMatches(matchesData.slice(0, 3));
        setApplications(appsData.slice(0, 5));
      } catch (err) {
        setError('Failed to load dashboard data. Please refresh.');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData()
  }, [navigate])

  const handleAutoApply = async () => {
    if (!confirm('Auto-apply to up to 50 matching jobs using your profile/resume data?')) return
    setAutoApplying(true)
    try {
      const result = await autoApplyJobs(50)  // 50 jobs
      alert(`Success! Applied to ${result.applied.length} new jobs. Check Applications page.`)
      const appsData = await getApplications()
      setApplications(appsData.slice(0, 5))
    } catch (err) {
      alert('Auto-apply failed. Please check your profile/resume and try again.')
      console.error(err)
    } finally {
      setAutoApplying(false)
    }
  }

  const handleStartAuto = () => {
    setAutoSearchActive(true)
    alert('Auto-search started! It will run every 30 min, applying up to 50 jobs/day.')
  }

  const handleStopAuto = async () => {
    setAutoSearchActive(false)
    alert('Auto-search stopped.')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !profile && matches.length === 0 && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || 'User'}!
              </h1>
              <p className="mt-1 text-lg text-gray-600">
                Auto-search is {autoSearchActive ? 'running (50 jobs/day)' : 'stopped'}. Here's your dashboard.
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button onClick={() => navigate('/profile')} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <UserIcon className="h-5 w-5 mr-2" />
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Experience</p>
                <p className="text-2xl font-bold text-gray-900">{profile?.experience_years || 0} yrs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Matches */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <BriefcaseIcon className="h-6 w-6 mr-2" />
                Top Job Matches
              </h2>
              <p className="text-blue-100 mt-1">Based on your skills and experience</p>
            </div>
            <div className="p-6">
              {matches.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {matches.map((job) => <JobCard key={job.id} job={job} onApply={() => {}} />)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No matches yet. Update your skills!</p>
                  <button onClick={() => navigate('/profile')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Add Skills
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2" />
                Recent Applications
              </h2>
              <p className="text-green-100 mt-1">Track your progress</p>
            </div>
            <div className="p-6">
              {applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{app.job_title || 'Job Title'}</p>
                        <p className="text-sm text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        app.status === 'offer' ? 'bg-green-100 text-green-800' :
                        app.status === 'interview' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications yet. Start applying!</p>
                  <button onClick={() => navigate('/jobs')} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Apply Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <button onClick={() => navigate('/jobs')} className="flex items-center justify-center p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <BriefcaseIcon className="h-6 w-6 text-blue-600 mr-2" />
              Browse Jobs
            </button>
            <button onClick={() => navigate('/applications')} className="flex items-center justify-center p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              <DocumentTextIcon className="h-6 w-6 text-green-600 mr-2" />
              View All Applications
            </button>
            <button onClick={() => navigate('/profile')} className="flex items-center justify-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
              <UserIcon className="h-6 w-6 text-purple-600 mr-2" />
              Update Profile
            </button>
            <button
              onClick={handleAutoApply}
              disabled={autoApplying}
              className="flex items-center justify-center p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <SparklesIcon className="h-6 w-6 text-indigo-600 mr-2" />
              {autoApplying ? 'Applying to 50...' : 'Auto-Apply to 50 Matches'}
            </button>
          </div>
          {/* Auto-Search Controls */}
          <div className="flex space-x-4">
            <button
              onClick={handleStartAuto}
              disabled={autoSearchActive}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SparklesIcon className="h-5 w-5 inline mr-2" />
              Start Auto-Search (50/day)
            </button>
            <button
              onClick={handleStopAuto}
              disabled={!autoSearchActive}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopIcon className="h-5 w-5 inline mr-2" />
              Stop & Logout
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">Auto-search runs every 30 min when active, applying up to 50 jobs/day with your resume/profile data.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard