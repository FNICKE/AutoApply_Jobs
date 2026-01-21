import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplications, updateStatus } from '../api/api'
import { 
  DocumentTextIcon, 
  ArrowLeftIcon, 
  FunnelIcon, 
  EllipsisVerticalIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return; }

    const fetchApplications = async () => {
      try {
        const data = await getApplications()
        const appsArray = Array.isArray(data) ? data : (data.applications || [])
        setApplications(appsArray)
      } catch (err) {
        setError(err.response?.data?.message || 'Sync failed. Please refresh.')
        setApplications([])
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [navigate])

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await updateStatus(appId, newStatus)
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ))
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const getStatusStyles = (status) => {
    const styles = {
      applied: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
      rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
      interview: 'bg-amber-50 text-amber-700 ring-amber-200',
      offer: 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    }
    return styles[status] || 'bg-slate-50 text-slate-700 ring-slate-200'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-opacity-20 border-t-indigo-600"></div>
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching Pipeline</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors mb-4 group"
            >
              <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Overview
            </button>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Application Pipeline</h1>
            <p className="text-slate-500 mt-2 font-medium">
              Managing <span className="text-indigo-600 font-bold">{applications.length}</span> active opportunities
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <FunnelIcon className="h-5 w-5" />
              Filter
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              Discover More Jobs
            </button>
          </div>
        </div>

        {/* --- Content Area --- */}
        {!applications || applications.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <DocumentTextIcon className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Your pipeline is empty</h3>
            <p className="text-slate-400 mt-2 mb-8 max-w-xs mx-auto">Start applying to jobs to track your interview stages and offers here.</p>
            <button 
              onClick={() => navigate('/jobs')}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all"
            >
              Search Jobs Now
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
              <div className="col-span-5">Position & Company</div>
              <div className="col-span-2">Current Status</div>
              <div className="col-span-3">Date Applied</div>
              <div className="col-span-2 text-right">Operations</div>
            </div>

            <div className="divide-y divide-slate-50">
              {applications.map((app) => (
                <div key={app.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50/30 transition-colors group">
                  
                  {/* Job Info */}
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BuildingOfficeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {app.job_title || 'Untitled Role'}
                      </h4>
                      <p className="text-sm text-slate-400 font-medium">{app.company_name || 'Confidential'}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-inset ${getStatusStyles(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-3 flex items-center gap-2 text-slate-500 font-semibold text-sm">
                    <CalendarDaysIcon className="h-4 w-4 text-slate-300" />
                    {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {/* Action Dropdown/Select */}
                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <select
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        value={app.status}
                        className="bg-transparent text-xs font-bold text-slate-400 hover:text-indigo-600 cursor-pointer outline-none border-none focus:ring-0"
                      >
                        <option value="applied">Update Status</option>
                        <option value="interview">Interviewing</option>
                        <option value="offer">Received Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <EllipsisVerticalIcon className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
               <p className="text-xs font-bold text-slate-400">
                PAGE 1 OF 1 <span className="mx-2 opacity-30">|</span> {applications.length} RESULTS
               </p>
               <div className="flex gap-2">
                  <button disabled className="px-3 py-1 text-[10px] font-black uppercase text-slate-300 bg-white border border-slate-200 rounded-lg">Prev</button>
                  <button disabled className="px-3 py-1 text-[10px] font-black uppercase text-slate-300 bg-white border border-slate-200 rounded-lg">Next</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Applications