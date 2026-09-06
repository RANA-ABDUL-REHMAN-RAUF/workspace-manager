import { useState } from 'react'
import { generatePath, Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ArrowRight, Check, LayoutGrid, List, Plus, Search, Settings, SlidersHorizontal, Users, X } from 'lucide-react'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { roleFor } from '../../store/workspaceModel'
import { actions } from '../../store/rootReducer'
import { Avatar, Badge, Button, Card, Select } from '../../components/ui/WorkspaceUI'
import WorkspaceFormModal from '../../features/workspaces/WorkspaceFormModal'
import InviteMemberModal from '../../features/workspaces/InviteMemberModal'
import TaskViews from '../../features/tasks/TaskViews'
import { ROUTES } from '../../constants/routes'

function WorkspaceCard({ workspace, current, user, data, view, onOpen }) {
  const role = roleFor(data, workspace.id, user?.id)
  const projects = data.projects.filter(project => project.workspaceId === workspace.id && !project.archived)
  const members = data.users.filter(member => workspace.members.some(item => item.userId === member.id))
  const color = workspace.color || '#7869df'
  return <Card className={`relative flex flex-col border-t-2! p-5 transition-shadow hover:shadow-md ${current ? 'border-t-[#8272e6]!' : 'border-t-transparent!'} ${view === 'list' ? 'lg:flex-row lg:items-center lg:gap-6' : ''}`}>
    <div className={view === 'list' ? 'min-w-0 flex-1' : ''}>
      <div className="flex items-start gap-3">
        <span style={{ backgroundColor: `${color}18`, color }} className="grid size-11 shrink-0 place-items-center rounded-lg text-sm font-semibold">{workspace.icon || <LayoutGrid size={20} />}</span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2"><button onClick={onOpen} className="truncate text-left text-sm font-semibold text-[#30364c] hover:text-violet-600 dark:text-slate-100">{workspace.name}</button>{current && <Badge>Current</Badge>}</div>
          <p className="mt-1.5 text-[11px] text-slate-400">{members.length} members · {projects.length} projects</p>
        </div>
        {(role === 'owner' || role === 'admin') && <Link aria-label={`Settings for ${workspace.name}`} to={generatePath(ROUTES.workspaceSettings, { workspaceId: workspace.id })} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Settings size={15} /></Link>}
      </div>
      <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">{workspace.description || `A shared space for ${workspace.name} to organize projects, collaborate, and keep work moving forward.`}</p>
    </div>
    <dl className={`mt-4 grid grid-cols-3 divide-x divide-[#e9eaf4] rounded-lg bg-[#f8f9fe] py-3 text-center dark:divide-slate-700 dark:bg-slate-800 ${view === 'list' ? 'lg:mt-0 lg:w-64 lg:shrink-0' : ''}`}>
      <div><dt className="text-[9px] uppercase tracking-wider text-slate-400">Role</dt><dd className="mt-1.5 text-[11px] font-medium capitalize">{role}</dd></div>
      <div><dt className="text-[9px] uppercase tracking-wider text-slate-400">Projects</dt><dd className="mt-1.5 text-[11px] font-medium">{projects.length} active</dd></div>
      <div><dt className="text-[9px] uppercase tracking-wider text-slate-400">Members</dt><dd className="mt-1.5 text-[11px] font-medium">{members.length} total</dd></div>
    </dl>
    <div className={`mt-5 flex flex-wrap items-center justify-between gap-3 ${view === 'list' ? 'lg:mt-0 lg:w-44 lg:shrink-0' : ''}`}>
      <Link to={generatePath(ROUTES.workspaceMembers, { workspaceId: workspace.id })} className="flex -space-x-1.5" aria-label={`View members of ${workspace.name}`}>{members.slice(0, 4).map(member => <span key={member.id} className="rounded-full ring-2 ring-white dark:ring-slate-900"><Avatar user={member} small /></span>)}{members.length > 4 && <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-[9px] text-slate-500 ring-2 ring-white">+{members.length - 4}</span>}</Link>
      <button onClick={onOpen} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[11px] font-medium ${current ? 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800' : 'bg-[#f0edff] text-[#7d6bd4] hover:bg-violet-100 dark:bg-slate-800'}`}>{current ? <><Check size={13} />Open workspace</> : <>Switch to <ArrowRight size={12} /></>}</button>
    </div>
  </Card>
}

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const { available, workspace, data, user, activeWorkspace, manageable } = useWorkspace()
  const { openCreateProject } = useOutletContext()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('current')
  const [view, setView] = useState('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState('')
  const currentId = workspaceId || activeWorkspace || workspace?.id

  const filtered = available.filter(item => (`${item.name} ${item.description || ''}`).toLowerCase().includes(query.trim().toLowerCase()) && (!roleFilter || roleFor(data, item.id, user?.id) === roleFilter)).sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'members') return b.members.length - a.members.length || a.name.localeCompare(b.name)
    return Number(b.id === currentId) - Number(a.id === currentId) || a.name.localeCompare(b.name)
  })

  function openWorkspace(id) {
    dispatch(actions.selectWorkspace(id))
    navigate(generatePath(ROUTES.workspaceProjects, { workspaceId: id }))
  }

  if (workspaceId && !workspace) return <Card className="p-10 text-center"><h1 className="text-lg font-semibold">Workspace unavailable</h1><p className="mt-2 text-sm text-slate-400">This workspace no longer exists or you do not have access.</p><Link to={ROUTES.workspaces} className="mt-5 inline-block text-sm text-violet-600">View your workspaces</Link></Card>

  return <section className="space-y-6" aria-labelledby="workspaces-heading">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><div className="flex items-center gap-2.5"><h1 id="workspaces-heading" className="text-[26px] font-semibold tracking-tight text-[#20263b] dark:text-slate-100">Workspaces</h1><span className="rounded-full bg-[#eeebff] px-2 py-1 text-[10px] text-[#8a7ad7]">{available.length} active</span></div><p className="mt-1.5 text-xs text-slate-400">Manage, switch, and stay in sync with all your collaborative environments.</p></div>
      <div className="flex flex-wrap gap-2">{workspaceId && <Button disabled={!manageable} onClick={openCreateProject}><Plus size={14} />Create Project</Button>}<Button disabled={!manageable} onClick={() => setInviting(true)}><Users size={14} />Invite members</Button><Button primary onClick={() => setCreating(true)}><Plus size={14} />Create Workspace</Button></div>
    </div>

    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#eceef6] bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-48 flex-1 items-center gap-2 px-1.5 text-slate-400"><Search size={15} /><input aria-label="Search workspaces" placeholder="Search workspaces by name or description..." value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent py-1 text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200" />{query && <button aria-label="Clear search" className="rounded p-1" onClick={() => setQuery('')}><X size={14} /></button>}</div>
      <div className="flex flex-wrap items-center gap-2">
        <button aria-label="Filter workspaces by role" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)} className={`rounded-md border p-2 ${roleFilter ? 'border-violet-200 bg-violet-50 text-violet-600' : 'border-slate-100 text-slate-400 dark:border-slate-700'}`}><SlidersHorizontal size={14} /></button>
        <Select aria-label="Sort workspaces" value={sort} onChange={event => setSort(event.target.value)}><option value="current">Current workspace</option><option value="name">Name A–Z</option><option value="members">Most members</option></Select>
        <div className="flex rounded-md bg-[#f5f5fb] p-0.5 dark:bg-slate-800" role="group" aria-label="Workspace view">{[['grid', LayoutGrid, 'Grid'], ['list', List, 'List']].map(([value, Icon, label]) => <button key={value} aria-pressed={view === value} onClick={() => setView(value)} className={`flex items-center gap-1.5 rounded px-2.5 py-2 text-[11px] ${view === value ? 'bg-[#7e70dc] text-white shadow-sm' : 'text-slate-400 hover:text-violet-500'}`}><Icon size={13} />{label}</button>)}</div>
      </div>
    </div>
    {filtersOpen && <div className="flex flex-wrap items-center gap-3 text-xs"><label htmlFor="workspace-role" className="text-slate-500">Your role</label><Select id="workspace-role" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}><option value="">All roles</option>{['owner', 'admin', 'member', 'viewer'].map(role => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</Select>{roleFilter && <button onClick={() => setRoleFilter('')} className="text-violet-500">Clear filter</button>}</div>}

    <div className={`grid items-stretch gap-5 ${view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
      {filtered.map(item => <WorkspaceCard key={item.id} workspace={item} current={item.id === currentId} user={user} data={data} view={view} onOpen={() => openWorkspace(item.id)} />)}
      {!filtered.length && (query || roleFilter) && <Card className="p-8 text-center sm:col-span-full"><Search size={24} className="mx-auto mb-3 text-violet-300" /><h2 className="text-sm font-semibold">No workspaces found</h2><p className="mt-2 text-xs text-slate-400">Try another name or change your role filter.</p><button onClick={() => { setQuery(''); setRoleFilter('') }} className="mt-4 text-xs text-violet-500">Clear search and filters</button></Card>}
      <button onClick={() => setCreating(true)} className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-[#dddff0] bg-white/60 px-6 py-8 text-center transition-colors hover:border-violet-300 hover:bg-violet-50/50 dark:border-slate-700 dark:bg-slate-900 ${view === 'grid' ? 'min-h-64' : 'min-h-40'}`}>
        <span className="mb-4 grid size-11 place-items-center rounded-xl bg-[#e8eefe] text-[#7d8cde]"><Plus size={22} /></span><span className="text-sm font-semibold text-[#525b76] dark:text-slate-200">New Workspace</span><span className="mt-2 max-w-52 text-xs leading-5 text-slate-400">Bring a new team together with a dedicated space for projects and ideas.</span><span className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-[#8a7ad7]">Get started <ArrowRight size={12} /></span>
      </button>
    </div>
    <p className="text-[11px] text-slate-400" role="status">Showing {filtered.length} of {available.length} {available.length === 1 ? 'workspace' : 'workspaces'}</p>
    {workspaceId && workspace && <section aria-label="Workspace tasks" className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-base font-semibold">{workspace.name} tasks</h2><Link className="text-xs text-violet-500" to={generatePath(ROUTES.workspaceProjects, { workspaceId })}>View projects <ArrowRight className="inline" size={12} /></Link></div><Card><TaskViews key={workspace.id} /></Card></section>}
    {creating && <WorkspaceFormModal onClose={() => setCreating(false)} />}
    {inviting && workspace && <InviteMemberModal workspace={workspace} onClose={() => setInviting(false)} />}
  </section>
}
