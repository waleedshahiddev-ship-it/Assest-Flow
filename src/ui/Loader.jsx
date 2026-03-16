import React from 'react'

export default function Loader({ title = 'Loading', subtitle = 'Preparing your experience…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 animate-pulse absolute" />
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white shadow-lg">
            <svg className="w-12 h-12 text-indigo-600 animate-spin" viewBox="0 0 50 50" aria-hidden="true">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeOpacity="0.25" />
              <path d="M45 25a20 20 0 0 1-20 20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-75" />
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-150" />
          <span className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce delay-200" />
        </div>
      </div>
    </div>
  )
}
