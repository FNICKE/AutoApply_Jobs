import { useState } from 'react'
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  Bars3BottomLeftIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const Navbar = ({ onMobileMenuOpen, profile }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-[#FDFDFF]/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        
        {/* Left: Mobile Menu Toggle & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMobileMenuOpen}
            className="p-2 -ml-2 text-slate-600 lg:hidden hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bars3BottomLeftIcon className="h-6 w-6" />
          </button>

          <div className="hidden sm:flex items-center max-w-md w-full relative group">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search jobs, companies, or tasks... (Press /)"
              className="w-full bg-slate-100/50 border-none rounded-2xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Action Buttons */}
          <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-4 mr-2">
             <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </button>
            <button 
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#FDFDFF]"></span>
            </button>
          </div>

          {/* User Profile Summary (Mobile) */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                {profile?.full_name?.split(' ')[0] || 'Member'}
              </p>
              <p className="text-[0.65rem] font-black text-emerald-600 uppercase tracking-widest">
                Pro Plan
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-100 ring-2 ring-white group-hover:scale-105 transition-transform">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar