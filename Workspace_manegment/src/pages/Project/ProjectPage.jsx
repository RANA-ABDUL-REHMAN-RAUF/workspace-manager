import { NavLink, Outlet } from 'react-router-dom'

export default function ProjectPage() {
  return <div className="space-y-5">
    <nav aria-label="Project views" className="flex flex-wrap gap-2">
      {['board', 'list', 'calendar', 'activity', 'settings'].map((view) => <NavLink key={view} to={view} className={({ isActive }) => `rounded-md px-4 py-2 text-sm capitalize ${isActive ? 'bg-[#6963d8] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{view}</NavLink>)}
    </nav>
    <Outlet />
  </div>
}
