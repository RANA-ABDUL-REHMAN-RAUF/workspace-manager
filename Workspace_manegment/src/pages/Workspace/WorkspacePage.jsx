import { useState } from 'react'
import { generatePath, Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Plus } from 'lucide-react'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { roleFor } from '../../store/workspaceModel'
import { actions } from '../../store/rootReducer'
import { Avatar, Badge, Button, Card } from '../../components/ui/WorkspaceUI'
import EmptyState from '../../components/common/EmptyState'
import WorkspaceFormModal from '../../features/workspaces/WorkspaceFormModal'
import { ROUTES } from '../../constants/routes'

function WorkspaceCard({ w, current, session, data, onSwitch }) {
  const role = roleFor(data, w.id, session?.id)
  const projectCount = data.projects.filter(p => p.workspaceId === w.id && !p.archived).length
  const members = data.users.filter(u => w.members.some(m => m.userId === u.id))
  return <Card className="flex flex-col p-5">
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md text-xs font-semibold text-white" style={{ background: w.color }}>{w.icon}</span>
      <div>
        <p className="text-sm font-semibold">{w.name}</p>
        {current && <Badge>Current</Badge>}
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3 text-[11px] dark:bg-slate-800">
      <div><p className="text-slate-400">Role</p><p className="font-medium capitalize">{role}</p></div>
      <div><p className="text-slate-400">Projects</p><p className="font-medium">{projectCount} active</p></div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="flex -space-x-2">
        {members.slice(0, 4).map(u => <Avatar key={u.id} user={u} small />)}
        {members.length > 4 && <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-[9px] font-medium text-slate-500">+{members.length - 4}</span>}
      </div>
      {current
        ? <Link to={generatePath(ROUTES.workspaceProjects, { workspaceId: w.id })}><Button primary>Open</Button></Link>
        : <Button primary onClick={() => onSwitch(w.id)}>Switch</Button>}
    </div>
  </Card>
}

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const { available, data, session, activeWorkspace } = useWorkspace()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  if (workspaceId) return <EmptyState title="Workspace" description="Workspace overview is coming soon.">
    <nav aria-label="Workspace navigation" className="flex flex-wrap gap-4 text-sm text-[#6963d8]">
      {[['Projects', ROUTES.workspaceProjects], ['Members', ROUTES.workspaceMembers], ['Activity', ROUTES.workspaceActivity], ['Settings', ROUTES.workspaceSettings]].map(([label, path]) =>
        <Link key={path} className="underline" to={generatePath(path, { workspaceId })}>{label}</Link>
      )}
    </nav>
  </EmptyState>

  return <section>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspaces <span className="text-sm font-normal text-slate-400">{available.length} active</span></h1>
        <p className="mt-1 text-sm text-slate-500">Manage and switch between your collaborative environments.</p>
      </div>
      <Button primary onClick={() => setCreating(true)}><Plus size={14} /> Create Workspace</Button>
    </div>
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {available.map(w => <WorkspaceCard key={w.id} w={w} current={w.id === activeWorkspace} session={session} data={data}
        onSwitch={(id) => { dispatch(actions.selectWorkspace(id)); navigate(ROUTES.dashboard) }} />)}
      <button onClick={() => setCreating(true)} className="grid min-h-40 place-items-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400 hover:border-violet-300 hover:text-violet-500 dark:border-slate-700">
        <span className="flex flex-col items-center gap-2"><Plus size={20} /> Create Workspace</span>
      </button>
    </div>
    {creating && <WorkspaceFormModal onClose={() => setCreating(false)} />}
  </section>
}
