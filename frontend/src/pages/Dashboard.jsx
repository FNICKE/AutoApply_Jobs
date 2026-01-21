import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobMatches, getApplications, getProfile, autoApplyJobs } from '../api/api'
import JobCard from '../components/job/JobCard'
import { 
  UserIcon, 
  BriefcaseIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  SparklesIcon, 
  StopIcon,
  ArrowRightIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

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
    if (!token) { navigate('/login'); return; }

    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user.id) throw new Error('User ID missing')

        // We use catch() on individual promises so one 404 doesn't break everything
        const [profileData, matchesData, appsData] = await Promise.all([
          getProfile().catch(err => { console.error("Profile 404/Error", err); return null; }),
          getJobMatches({ user_id: user.id }).catch(err => { console.error("Matches 404/Error", err); return []; }),
          getApplications().catch(err => { console.error("Apps 404/Error", err); return []; })
        ]);

        setProfile(profileData);
        setMatches(Array.isArray(matchesData) ? matchesData.slice(0, 3) : []);
        setApplications(Array.isArray(appsData) ? appsData.slice(0, 5) : []);
      } catch (err) {
        setError('Dashboard sync failed. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchData()
  }, [navigate])

  // --- Automation Logic ---
  const handleAutoApply = async () => {
    if (!confirm('Initiate AI Bulk-Apply for 50 matching jobs?')) return
    setAutoApplying(true)
    try {
      const result = await autoApplyJobs(50)
      alert(`Success! Applied to ${result.applied?.length || 0} new jobs.`)
      const appsData = await getApplications()
      setApplications(appsData.slice(0, 5))
    } catch (err) {
      alert('Auto-apply failed. Check your API connection.')
    } finally {
      setAutoApplying(false)
    }
  }

  const handleStartAuto = () => {
    setAutoSearchActive(true)
    alert('AI Engine restarted. Scanning every 30 minutes.')
  }

  const handleStopAuto = () => {
    setAutoSearchActive(false)
    alert('AI Engine paused.')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-opacity-20 border-t-indigo-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* --- Hero Section --- */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Hey, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
              </h2>
              <p className="text-slate-500 mt-2 flex items-center gap-2 font-medium text-lg">
                <span className={`h-2.5 w-2.5 rounded-full ${autoSearchActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                {autoSearchActive ? 'AI Search Engine is optimized and running' : 'System standby'}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleAutoApply}
                disabled={autoApplying}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
              >
                <SparklesIcon className="h-5 w-5" />
                {autoApplying ? 'Applying...' : 'Instant Auto-Apply (50)'}
              </button>
            </div>
          </div>
        </header>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Smart Matches', val: matches.length, icon: ChartBarIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Apps', val: applications.length, icon: BriefcaseIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Exp. Level', val: `${profile?.experience_years || 0} Yrs`, icon: CheckBadgeIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black mt-1 text-slate-800">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* --- Main Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Timeline Pipeline */}
          <div className="lg:col-span-1">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-slate-400" /> Pipeline
             </h3>
             <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-8">
                {applications.length > 0 ? applications.map((app) => (
                  <div key={app.id} className="relative pl-6 border-l-2 border-indigo-50 hover:border-indigo-500 transition-all group">
                    <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-white border-2 border-indigo-500 group-hover:scale-125 transition-transform"></div>
                    <p className="font-bold text-sm text-slate-800">{app.job_title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold uppercase py-1 px-2 bg-slate-100 rounded text-slate-500">{app.status}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )) : <p className="text-center text-slate-400 py-4 text-sm font-medium">No activity yet</p>}
             </div>
          </div>

          {/* Top Matches Showcase */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recommended for You</h3>
              <button onClick={() => navigate('/jobs')} className="text-indigo-600 text-sm font-bold hover:underline">See Discovery</button>
            </div>
            <div className="space-y-4">
              {matches.length > 0 ? matches.map((job) => (
                <JobCard key={job.id} job={job} />
              )) : (
                <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">Scan complete. No direct matches found right now.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Modern Automation Control --- */}
        <div className="mt-12 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <SparklesIcon className="h-40 w-40" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-2xl font-black mb-2 italic">Automation Control Panel</h3>
              <p className="text-slate-400 max-w-sm font-medium">Toggle the AI search engine to browse and apply for jobs while you sleep.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleStartAuto} 
                className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-2xl font-black transition-all active:scale-95"
              >
                Resume Engine
              </button>
              <button 
                onClick={handleStopAuto} 
                className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-bold transition-all"
              >
                Pause AI
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard