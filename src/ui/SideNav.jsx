import { NavLink } from 'react-router-dom'
import LogoutButton from './LogoutButton'
import { Separator } from '../components/ui/separator'

const navItems = [
  { 
    to: 'home', 
    label: 'Dashboard', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ) 
  },
  { 
    to: "invites", 
    label: "Team Invites", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ) 
  },
]

export default function SideNav({ onNavigate }) {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center px-6 bg-slate-900 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
            AF
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Asset Flow
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="mb-4">
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Management</p>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active-nav-shadow' 
                : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>
            <span className="text-sm font-semibold tracking-wide">{item.label}</span>
            <div className="ml-auto w-1 h-1 rounded-full bg-slate-700 opacity-0 group-hover:opacity-100 group-[.bg-indigo-600]:bg-indigo-300 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 bg-slate-900 border-t border-slate-800/50">
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 transition-all hover:bg-slate-800/60 mb-4">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <p className="text-xs font-medium text-slate-300">All services operational</p>
          </div>
        </div>
        <LogoutButton className="w-full flex justify-center items-center gap-2 h-11 bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 hover:border-rose-600/30 border border-slate-700 text-slate-300 rounded-xl transition-all duration-300 font-bold text-sm" />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .active-nav-shadow { position: relative; }
        .active-nav-shadow::after {
          content: '';
          position: absolute;
          left: -16px;
          top: 20%;
          height: 60%;
          width: 4px;
          background: white;
          border-radius: 0 4px 4px 0;
        }
      `}</style>
    </div>
  )
}
