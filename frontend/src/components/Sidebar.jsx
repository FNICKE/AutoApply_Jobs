import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  BriefcaseIcon, 
  DocumentTextIcon, 
  UserIcon, 
  SparklesIcon, 
  ArrowRightOnRectangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const Sidebar = ({ profile, autoSearchActive, onAutoApply }) => {
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { label: 'Browse Jobs', icon: BriefcaseIcon, path: '/jobs' },
    { label: 'My Applications', icon: DocumentTextIcon, path: '/applications' },
    { label: 'Skill Analysis', icon: ChartBarIcon, path: '/skills' },
    { label: 'Profile', icon: UserIcon, path: '/profile' },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-[17.5rem] bg-white border-r border-slate-200 sticky top-0 h-screen p-6 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
          <SparklesIcon className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 italic">Career.AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.15em] px-4 mb-4">Navigation</p>
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group ${
              location.pathname === item.path 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.path ? 'text-white' : 'group-hover:text-indigo-600'}`} />
            <span className="font-semibold text-[0.938rem]">{item.label}</span>
          </Link>
        ))}

        <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.15em] px-4 mb-4 mt-10">Smart Actions</p>
        <button 
          onClick={onAutoApply}
          className="w-full flex items-center px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 transition-all border border-indigo-100 group"
        >
          <SparklesIcon className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-[0.9rem]">Bulk Auto-Apply</span>
        </button>
      </nav>

      {/* User & Status Card */}
      <div className="mt-auto space-y-4">
        <div className={`p-4 rounded-2xl border transition-colors ${autoSearchActive ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.7rem] font-bold text-slate-500 uppercase">Auto-Search</span>
            <div className={`w-2 h-2 rounded-full ${autoSearchActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {autoSearchActive ? 'Actively seeking 50 jobs/day' : 'System currently paused'}
          </p>
        </div>

        <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-2xl shadow-inner">
          <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{profile?.full_name || 'User'}</p>
            <button className="text-[0.65rem] text-slate-400 hover:text-white transition-colors flex items-center">
              <ArrowRightOnRectangleIcon className="h-3 w-3 mr-1" /> Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar