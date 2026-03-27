import React from 'react'

const Invites = () => {
  const inviteStats = [
    { label: 'Pending Invites', value: '18', hint: 'Awaiting response' },
    { label: 'Accepted', value: '42', hint: 'Joined this month' },
    { label: 'Expired', value: '6', hint: 'Needs resend' },
  ]

  const recentInvites = [
    { name: 'Aarav Sharma', email: 'aarav@atlaslogistics.com', role: 'Manager', status: 'Pending', sentAt: '2 hours ago' },
    { name: 'Maya Patel', email: 'maya@northwind.com', role: 'Analyst', status: 'Accepted', sentAt: 'Yesterday' },
    { name: 'Nina Clark', email: 'nina@oakline.io', role: 'Reviewer', status: 'Expired', sentAt: '3 days ago' },
    { name: 'James Wong', email: 'james@foundrylabs.dev', role: 'Operations', status: 'Pending', sentAt: '5 days ago' },
  ]

  const statusClasses = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Expired: 'bg-rose-100 text-rose-800 border-rose-200',
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Team Invites</h1>
            <p className="mt-1 text-sm text-slate-600">Manage invitation workflows and monitor onboarding status.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Export CSV
            </button>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
              Send New Invite
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inviteStats.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Invites</h2>
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">View all</button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Sent</th>
                </tr>
              </thead>
              <tbody>
                {recentInvites.map((invite) => (
                  <tr key={invite.email} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-900">{invite.name}</p>
                      <p className="text-xs text-slate-500">{invite.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{invite.role}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[invite.status]}`}>
                        {invite.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{invite.sentAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Page Layout Guide</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use this same structure for future screens:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li className="rounded-md bg-slate-50 px-3 py-2">1. Hero section with title and actions</li>
            <li className="rounded-md bg-slate-50 px-3 py-2">2. Quick stats grid for KPIs</li>
            <li className="rounded-md bg-slate-50 px-3 py-2">3. Main content split: table + side panel</li>
            <li className="rounded-md bg-slate-50 px-3 py-2">4. Keep cards inside responsive grid wrappers</li>
          </ul>

          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Tip</p>
            <p className="mt-1 text-sm text-slate-700">
              Copy this file as a starter page, then swap sections one-by-one as your feature grows.
            </p>
          </div>
        </article>
      </section>
    </div>
  )
}

export default Invites