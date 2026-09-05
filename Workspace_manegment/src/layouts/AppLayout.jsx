import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../store/hooks'
import { ROUTES } from '../constants/routes'

const navigation = [
  ['Dashboard', ROUTES.dashboard], ['Workspaces', ROUTES.workspaces],
  ['Projects', ROUTES.projects], ['My tasks', ROUTES.myTasks],
  ['Members', ROUTES.members], ['Activity', ROUTES.activity],
  ['Search', ROUTES.search], ['Notifications', ROUTES.notifications],
  ['Profile', ROUTES.profile], ['Settings', ROUTES.settings],
]

export default function AppLayout() {
  const { session, sessionNotice, logout } = useAuth()
  const location = useLocation()
  const [error, setError] = useState('')
  if (!session) return <Navigate to={ROUTES.login} state={{ from: location.pathname + location.search + location.hash }} replace />

  return <div className="min-h-svh bg-[#f8f9fe] font-sans text-slate-800">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <NavLink to={ROUTES.dashboard} className="font-semibold text-[#6963d8]">Workspace Manager</NavLink>
      <div className="flex items-center gap-4 text-sm"><span>{session.name}</span><button className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#6963d8]" onClick={() => { try { logout() } catch (failure) { setError(failure.message) } }}>Sign out</button></div>
    </header>
    {error && <p role="alert" className="bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {sessionNotice && <p role="status" className="bg-amber-50 p-4 text-sm text-amber-800">{sessionNotice}</p>}
    <div className="mx-auto grid max-w-7xl gap-6 p-6 md:grid-cols-[200px_1fr]">
      <nav aria-label="Main navigation" className="flex flex-wrap gap-1 self-start md:flex-col">
        {navigation.map(([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[#6963d8] ${isActive ? 'bg-[#eeedfe] font-medium text-[#6963d8]' : 'text-slate-600 hover:bg-white'}`}>{label}</NavLink>)}
      </nav>
      <main className="min-w-0"><Outlet /></main>
    </div>
  </div>
}
