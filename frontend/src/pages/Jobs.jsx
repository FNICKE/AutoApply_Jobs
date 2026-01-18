// src/pages/Jobs.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobs, applyJob } from '../api/api'
import { 
  BriefcaseIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [location, setLocation] = useState('India')
  const navigate = useNavigate()

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'frontend', label: 'Frontend Developer' },
    { value: 'backend', label: 'Backend Developer' },
    { value: 'fullstack', label: 'Fullstack Developer' },
    { value: 'java', label: 'Java Developer' },
    { value: 'mern', label: 'MERN Stack Developer' },
    { value: 'web', label: 'Web Developer' },
    { value: 'software', label: 'Software Developer' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchJobs()
  }, [selectedRole, location, navigate]) // Removed searchTerm to avoid excessive API calls while typing

  const fetchJobs = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        role: selectedRole,
        q: searchTerm,
        location: location,
        num: 20
      }
      const data = await getJobs(params)
      setJobs(data.jobs || [])
    } catch (err) {
      setError('Failed to load jobs. Please refresh.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (jobId) => {
    setError('')
    setSuccess('')
    try {
      await applyJob({ job_id: jobId })
      setSuccess('Application submitted successfully!')
      // Optionally refresh jobs to update UI state
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to apply. Please try again.')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getDaysAgo = (updatedAt) => {
    const now = new Date()
    const updated = new Date(updatedAt)
    const diffTime = Math.abs(now - updated)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 1 ? 'Today' : `${diffDays} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-[3rem] h-[3rem] border-[0.25rem] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-[1rem] text-slate-500 font-medium text-[1rem]">Scanning for opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-[3rem]">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[80rem] mx-auto px-[1rem] sm:px-[1.5rem] lg:px-[2rem] py-[2rem] sm:py-[2.5rem]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[1.5rem]">
            <div className="flex items-center gap-[1rem] sm:gap-[1.5rem]">
              <div className="h-[3.5rem] w-[3.5rem] sm:h-[4.5rem] sm:w-[4.5rem] bg-indigo-600 rounded-[1rem] flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                <BriefcaseIcon className="h-[1.75rem] w-[1.75rem] sm:h-[2.25rem] sm:w-[2.25rem] text-white" />
              </div>
              <div>
                <h1 className="text-[1.5rem] sm:text-[1.875rem] font-bold text-slate-900 tracking-tight">Job Board</h1>
                <p className="text-[0.875rem] sm:text-[1rem] text-slate-500">Discover your next career move</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-[0.75rem]">
               <button 
                onClick={fetchJobs}
                className="flex items-center gap-[0.5rem] px-[1rem] py-[0.625rem] bg-white border border-slate-200 rounded-[0.75rem] text-slate-600 hover:bg-slate-50 font-semibold text-[0.875rem] transition-all"
              >
                <ArrowPathIcon className="h-[1.125rem] w-[1.125rem]" />
                Refresh
              </button>
              <button 
                onClick={() => navigate('/applications')}
                className="flex items-center gap-[0.5rem] px-[1rem] py-[0.625rem] bg-slate-900 text-white rounded-[0.75rem] hover:bg-slate-800 font-semibold text-[0.875rem] shadow-md transition-all"
              >
                <FunnelIcon className="h-[1.125rem] w-[1.125rem]" />
                Applications
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="mt-[2rem] grid grid-cols-1 md:grid-cols-12 gap-[0.75rem]">
            <div className="md:col-span-5 relative group">
              <MagnifyingGlassIcon className="absolute left-[0.875rem] top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-slate-400 group-focus-within:text-indigo-600" />
              <input
                type="text"
                placeholder="Search job titles or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                className="w-full pl-[2.75rem] pr-[1rem] py-[0.75rem] bg-slate-50 border border-slate-200 rounded-[0.75rem] focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-[0.9375rem]"
              />
            </div>
            
            <div className="md:col-span-4 relative group">
              <MapPinIcon className="absolute left-[0.875rem] top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-slate-400 group-focus-within:text-indigo-600" />
              <input
                type="text"
                placeholder="Location (e.g. Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-[2.75rem] pr-[1rem] py-[0.75rem] bg-slate-50 border border-slate-200 rounded-[0.75rem] focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-[0.9375rem]"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-[1rem] py-[0.75rem] bg-slate-50 border border-slate-200 rounded-[0.75rem] focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-[0.9375rem] appearance-none"
              >
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[80rem] mx-auto px-[1rem] sm:px-[1.5rem] lg:px-[2rem] mt-[2rem]">
        {/* Alerts */}
        <div className="mb-[1.5rem]">
          {error && (
            <div className="flex items-center p-[1rem] bg-red-50 border-l-[0.25rem] border-red-500 text-red-700 rounded-r-[0.5rem] shadow-sm animate-in fade-in slide-in-from-top-2">
              <ExclamationCircleIcon className="h-[1.25rem] w-[1.25rem] mr-[0.75rem] shrink-0" />
              <p className="text-[0.875rem] font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center p-[1rem] bg-emerald-50 border-l-[0.25rem] border-emerald-500 text-emerald-700 rounded-r-[0.5rem] shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircleIcon className="h-[1.25rem] w-[1.25rem] mr-[0.75rem] shrink-0" />
              <p className="text-[0.875rem] font-medium">{success}</p>
            </div>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-[1rem] border border-slate-200 p-[4rem] text-center shadow-sm">
            <div className="h-[4rem] w-[4rem] bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-[1.5rem]">
              <BriefcaseIcon className="h-[2rem] w-[2rem] text-slate-400" />
            </div>
            <h3 className="text-[1.25rem] font-bold text-slate-800 mb-[0.5rem]">No matches found</h3>
            <p className="text-slate-500 mb-[2rem]">Try adjusting your search filters or location.</p>
            <Button onClick={fetchJobs} variant="primary" className="px-[2rem]">Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1.5rem]">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="group flex flex-col bg-white rounded-[1rem] border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300"
              >
                <div className="p-[1.5rem] flex-grow">
                  <div className="flex items-start justify-between mb-[1rem]">
                    <h3 className="text-[1.125rem] font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                      {job.job_title}
                    </h3>
                    {job.is_recent && (
                      <span className="shrink-0 px-[0.625rem] py-[0.125rem] bg-emerald-100 text-emerald-700 text-[0.625rem] font-black uppercase tracking-wider rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-[0.75rem] mb-[1.25rem]">
                    <p className="text-[0.9375rem] font-medium text-slate-600 flex items-center gap-[0.5rem]">
                      <BriefcaseIcon className="h-[1rem] w-[1rem] text-slate-400" />
                      {job.company_name}
                    </p>
                    <p className="text-[0.875rem] text-slate-500 flex items-center gap-[0.5rem]">
                      <MapPinIcon className="h-[1rem] w-[1rem] text-slate-400" />
                      {job.location}
                    </p>
                    {job.updated_at && (
                      <p className="text-[0.875rem] text-slate-500 flex items-center gap-[0.5rem]">
                        <CalendarIcon className="h-[1rem] w-[1rem] text-slate-400" />
                        {getDaysAgo(job.updated_at)}
                      </p>
                    )}
                  </div>

                  <p className="text-[0.875rem] text-slate-500 line-clamp-2 mb-[1.25rem] leading-relaxed">
                    {job.job_description || "No description provided."}
                  </p>
                </div>

                <div className="px-[1.5rem] py-[1.25rem] bg-slate-50/50 border-t border-slate-100 flex items-center gap-[1rem]">
                  <a 
                    href={job.job_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-[0.5rem] px-[1rem] py-[0.625rem] bg-white border border-slate-200 rounded-[0.75rem] text-[0.875rem] font-bold text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Details
                    <ArrowTopRightOnSquareIcon className="h-[1rem] w-[1rem]" />
                  </a>
                  <button 
                    onClick={() => handleApply(job.id)}
                    className="flex-1 px-[1rem] py-[0.625rem] bg-indigo-600 text-white rounded-[0.75rem] text-[0.875rem] font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Quick Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Jobs