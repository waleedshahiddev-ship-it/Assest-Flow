import React from 'react'
import { useUser } from '@clerk/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'

const Home = () => {
  const { user } = useUser()

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Here's what's happening with your assets today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
            View Reports
          </Button>
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold px-6">
            Add New Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Assets', value: '1,284', change: '+12%', color: 'indigo' },
          { label: 'Active Requests', value: '42', change: '-3%', color: 'amber' },
          { label: 'Pending Audits', value: '18', change: '5 required', color: 'rose' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden group hover:ring-indigo-100 transition-all duration-300">
            <CardContent className="p-6">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-end justify-between mt-2">
                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
            <div className={`h-1 w-full bg-${stat.color}-500/20 group-hover:bg-${stat.color}-500 transition-colors`} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl ring-1 ring-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-6">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Your team's latest operations</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-50">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">MacBook Pro M3 Assigned</p>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">to Rahul Sharma • 2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-100/50 px-2 py-1 rounded-md">
                      Log #8492
                    </span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl ring-1 ring-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-6">
            <CardTitle className="text-lg font-bold text-slate-900">Team Distribution</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Asset allocation by department</CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-full space-y-4">
               {[
                 { dept: 'Engineering', perc: 45, color: 'indigo' },
                 { dept: 'Design', perc: 25, color: 'emerald' },
                 { dept: 'Marketing', perc: 20, color: 'amber' },
                 { dept: 'Other', perc: 10, color: 'slate' },
               ].map((d, i) => (
                 <div key={i} className="space-y-1.5">
                   <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-tighter">
                     <span>{d.dept}</span>
                     <span>{d.perc}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div 
                       className={`h-full bg-${d.color}-500 transition-all duration-1000`} 
                       style={{ width: `${d.perc}%` }}
                     />
                   </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home