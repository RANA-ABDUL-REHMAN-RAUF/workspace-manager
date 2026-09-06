import { NavLink, Outlet, Link, useLocation, useParams } from 'react-router-dom'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import TaskViews from '../../features/tasks/TaskViews'
import { Card } from '../../components/ui/WorkspaceUI'

export default function ProjectPage() {
  const { projectId } = useParams()
  const { pathname } = useLocation()
  const { workspace, projects } = useWorkspace()
  const project = projects.find(item => item.id === projectId)
  const view = pathname.split('/').at(-1)
  if (!workspace || !project) return <Card className="p-8"><h1 className="text-lg font-semibold">Project unavailable</h1><p className="mt-2 text-sm text-slate-400">This project does not belong to this workspace or you do not have access.</p><Link to="/workspaces" className="mt-4 inline-block text-violet-600">View workspaces</Link></Card>
  return <div className="space-y-5">
    <div><h1 className="text-xl font-semibold">{project.name}</h1><p className="mt-2 text-sm text-slate-400">{project.description}</p></div>
    <nav aria-label="Project views" className="flex flex-wrap gap-2">
      {['board', 'list', 'calendar', 'activity', 'settings'].map(view => <NavLink key={view} to={view} className={({ isActive }) => `rounded-md px-4 py-2 text-sm capitalize ${isActive ? 'bg-[#6963d8] text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300'}`}>{view}</NavLink>)}
    </nav>
    {['board', 'list', 'calendar'].includes(view) ? <Card><TaskViews key={project.id} projectId={project.id} view={view} /></Card> : <Outlet />}
  </div>
}
