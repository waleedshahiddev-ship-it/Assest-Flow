import { useSideBar } from '../context/SidebarContext'
import { UserButton } from '@clerk/react'
import { Button } from '../components/ui/button'

const Navbar = () => {
  const { toggle } = useSideBar()

  return (
    <header className="fixed top-0 right-0 z-30 w-full md:w-[calc(100%-280px)] bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggle} 
            className="md:hidden text-slate-500 hover:bg-slate-50 rounded-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <div className="md:hidden">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Asset Flow
            </span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-md">
              System Overview
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase">Live System</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block" />
          <UserButton 
            appearance={{
                elements: {
                    userButtonAvatarBox: "h-9 w-9 ring-2 ring-indigo-50 transition-all hover:ring-indigo-100",
                    userButtonPopoverCard: "shadow-2xl border-none rounded-2xl overflow-hidden",
                    userButtonPopoverActionButton: "hover:bg-indigo-50 font-medium",
                }
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default Navbar