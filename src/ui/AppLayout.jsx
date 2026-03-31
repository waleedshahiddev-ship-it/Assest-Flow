import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useSideBar } from '../context/SidebarContext'
import Navbar from './Navbar'
import SideNav from './SideNav'

export default function AppLayout() {
    const { open: mobileOpen, setOpen, toggle } = useSideBar()

    const handleNavigate = () => setOpen(false)

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Desktop SideNav (Fixed) */}
            <aside className="hidden md:flex flex-col w-[280px] h-full flex-shrink-0">
                <SideNav onNavigate={handleNavigate} />
            </aside>

            {/* Mobile Sidebar (Overlay) */}
            {mobileOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
                        onClick={toggle}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-900 md:hidden animate-in slide-in-from-left duration-300 shadow-2xl">
                        <SideNav onNavigate={handleNavigate} />
                    </aside>
                </>
            )}

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-h-0 w-full relative">
                <Navbar />
                
                <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 mt-16 transition-all duration-300">
                    <div className="mx-auto w-full max-w-7xl min-h-full">
                        <Outlet />
                    </div>
                </main>
                
                <Toaster 
                    richColors 
                    position="top-right"
                    toastOptions={{
                        className: 'rounded-2xl border-none shadow-2xl p-4',
                        style: {
                            fontFamily: 'inherit'
                        }
                    }}
                />
            </div>

            <style>{`
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; transition: background 0.2s; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    )
}