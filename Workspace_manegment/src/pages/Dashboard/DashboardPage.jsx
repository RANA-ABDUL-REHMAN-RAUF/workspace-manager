import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AlertTriangle, CheckCircle2, FolderKanban, ListChecks, Plus, ArrowUpRight, SlidersHorizontal, CalendarDays, UserPlus, LayoutGrid, MoreHorizontal, Sparkles } from 'lucide-react'
import { useAuth } from '../../store/hooks'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { Avatar, Badge, Button, Card, Select } from '../../components/ui/WorkspaceUI'
import { actions } from '../../store/rootReducer'
import { execute } from '../../store/store'
import { PRIORITY_COLOR } from '../../constants/priorities'
import { day } from '../../data/seed'
import { formatDueDate, formatRelativeTime } from '../../utils/date'
import InviteMemberModal from '../../features/workspaces/InviteMemberModal'
import WorkspaceFormModal from '../../features/workspaces/WorkspaceFormModal'

const TABS = ['All tasks', 'Today', 'Upcoming', 'Overdue']
const STATUS_TONE = { online: 'bg-emerald-400', away: 'bg-amber-400', offline: 'bg-slate-300' }

function presenceFor(userId) {
  const hash = [...userId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return ['online', 'online', 'away', 'offline'][hash % 4]
}

export default function DashboardPage() {
  const { session } = useAuth()
  const { workspace, projects, tasks, data, editable, manageable, pending } = useWorkspace()
  const { openCreateTask, openCreateProject, openPalette } = useOutletContext()
  const dispatch = useDispatch()
  const [tab, setTab] = useState('All tasks')
  const [priority, setPriority] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  if (!workspace) return <><Card className="p-10 text-center"><h1 className="text-xl font-semibold">Welcome, {session.name.split(' ')[0]}</h1><p className="my-4 text-sm text-slate-400">Create your first workspace to start organizing projects and tasks.</p><Button primary onClick={() => setWorkspaceOpen(true)}><Plus size={14} />Create workspace</Button></Card>{workspaceOpen && <WorkspaceFormModal onClose={() => setWorkspaceOpen(false)} />}</>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const activeProjects = projects.filter(p => !p.archived)
  const activeTasks = tasks.filter(t => !t.parentId && activeProjects.some(p => p.id === t.projectId))
  const openTasks = activeTasks.filter(t => t.status !== 'Done')
  const overdueTasks = openTasks.filter(t => t.dueDate && t.dueDate < day())
  const completedThisWeek = activeTasks.filter(t => t.status === 'Done' && t.completedAt && t.completedAt.slice(0, 10) >= day(-6))
  const myTasks = activeTasks.filter(t => t.assignee === session.id && t.status !== 'Done')
  const filteredTasks = myTasks.filter(t => (!priority || t.priority === priority) && (tab === 'All tasks' || (tab === 'Today' ? t.dueDate === day() : tab === 'Overdue' ? t.dueDate && t.dueDate < day() : !t.dueDate || t.dueDate > day())))
  const recentProjects = [...activeProjects].sort((a, b) => (data.activities.find(x => x.projectId === b.id)?.at || '').localeCompare(data.activities.find(x => x.projectId === a.id)?.at || '')).slice(0, 3)
  const deadlines = openTasks.filter(t => t.dueDate && t.dueDate >= day() && t.dueDate <= day(5)).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
  const recentActivity = data.activities.filter(a => a.workspaceId === workspace.id).slice(0, 4)
  const members = data.users.filter(u => workspace.members.some(m => m.userId === u.id))
  const openTask = task => dispatch(actions.ui({ task: { id: task.id } }))
  const projectPath = p => `/workspaces/${workspace.id}/projects/${p.id}`
  const stats = [
    { title: 'Active Projects', value: activeProjects.length, suffix: 'projects', icon: FolderKanban, tone: 'bg-violet-50 text-violet-500', foot: 'All projects in this workspace', to: '/projects' },
    { title: 'Open Tasks', value: openTasks.length, suffix: `/ ${activeTasks.length} total`, icon: ListChecks, tone: 'bg-violet-50 text-violet-500', foot: `${myTasks.length} assigned to you`, to: '/my-tasks' },
    { title: 'Completed This Week', value: completedThisWeek.length, suffix: 'tasks', icon: CheckCircle2, tone: 'bg-blue-50 text-blue-500', foot: 'Keep the momentum going', to: '/my-tasks' },
    { title: 'Overdue', value: overdueTasks.length, suffix: 'need attention', icon: AlertTriangle, tone: 'bg-red-50 text-red-500', foot: overdueTasks.length ? 'Let’s get these back on track' : 'You’re all caught up', to: '/my-tasks' },
  ]

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="flex flex-wrap items-center gap-2 text-[26px] font-semibold tracking-[-.7px] text-[#20263b] dark:text-slate-100">{greeting}, {session.name.split(' ')[0]}<span className="inline-flex items-center gap-1 rounded-full bg-[#eeebff] px-2 py-1 text-[11px] font-medium tracking-normal text-[#8a7ad7]"><Sparkles size={10} />Let's make today count</span></h1><p className="mt-1.5 text-[13px] text-[#9298ac]">Here's what's happening across your workspace today.</p></div>
      <div className="flex gap-2"><Button primary disabled={!editable || pending} onClick={() => openCreateTask()}><Plus size={13} />Create Task<span className="ml-2 rounded border border-white/30 px-1 text-[11px]">C</span></Button><Button disabled={!manageable || pending} onClick={openCreateProject}><Plus size={13} />Create Project</Button></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ title, value, suffix, icon: Icon, tone, foot, to }) => <Link key={title} to={to}><Card className={`h-full px-4 py-3.5 transition-shadow hover:shadow-sm ${title === 'Overdue' ? 'border-red-100!' : ''}`}><div className="flex items-center justify-between"><p className="text-[12px] font-medium text-[#7f869b]">{title}</p><span className={`rounded-md p-1.5 ${tone}`}><Icon size={14} /></span></div><div className="mt-2 flex items-baseline gap-2"><strong className={`text-[29px] leading-none font-semibold tracking-tight ${title === 'Overdue' ? 'text-[#e16c70]' : ''}`}>{value}</strong><span className={`text-[12px] ${title === 'Overdue' ? 'text-[#e18b8e]' : 'text-slate-400'}`}>{suffix}</span></div><p className="mt-4 flex items-center gap-1 text-[11px] text-[#a0a6b8]"><ArrowUpRight size={11} />{foot}</p></Card></Link>)}
    </div>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_288px]">
      <div className="min-w-0 space-y-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef0f6] px-4 py-3 dark:border-slate-800"><h2 className="text-xs font-semibold">My Tasks <span className="ml-1 rounded bg-[#f2f0ff] px-1.5 py-0.5 text-[11px] font-normal text-violet-400">{myTasks.length} pending</span></h2><div className="flex items-center gap-1">{TABS.map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)} className={`rounded px-2 py-1 text-[11px] ${tab === t ? 'bg-[#eeeaff] font-medium text-[#8070db]' : 'text-slate-400 hover:bg-slate-50'}`}>{t}</button>)}<button aria-label="Filter my tasks" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(v => !v)} className="ml-1 rounded border border-slate-100 p-1 text-slate-400"><SlidersHorizontal size={12} /></button></div></div>
          {filtersOpen && <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2"><span className="text-xs text-slate-400">Priority</span><Select aria-label="Task priority filter" value={priority} onChange={e => setPriority(e.target.value)}><option value="">All priorities</option>{['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}</Select><button onClick={() => { setPriority(''); setTab('All tasks') }} className="text-[12px] text-violet-500">Clear</button></div>}
          <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left"><thead className="bg-[#fcfcfe] text-[10px] font-medium uppercase tracking-[.6px] text-[#a6adbd] dark:bg-slate-800"><tr><th className="w-9 py-2 pl-4">Done</th><th className="px-2">Task</th><th className="px-2">Priority</th><th className="px-2">Status</th><th className="px-2">Due date</th><th className="pr-4 text-right">Assignee</th></tr></thead><tbody>{filteredTasks.slice(0, 6).map(task => { const project = projects.find(p => p.id === task.projectId); return <tr key={task.id} className="border-t border-[#f0f2f7] text-[12px] dark:border-slate-800"><td className="py-3 pl-4"><input type="checkbox" className="size-4 cursor-pointer accent-violet-500" aria-label={`Complete ${task.title}`} checked={false} disabled={!editable || pending} onChange={() => dispatch(execute({ type: 'task.save', payload: { ...task, status: 'Done' } }, 'Task completed'))} /></td><td className="max-w-56 px-2"><button onClick={() => openTask(task)} className="block text-left font-medium text-[#565e76] hover:text-violet-500 dark:text-slate-200">{task.title}</button><span className="mt-0.5 block text-[10px] text-slate-400">{project?.name}</span></td><td className="px-2"><Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge></td><td className="px-2"><Badge color={task.status === 'In progress' ? 'violet' : task.status === 'In review' ? 'blue' : 'gray'}>{task.status}</Badge></td><td className="whitespace-nowrap px-2 text-[11px] text-slate-400">{formatDueDate(task.dueDate) || 'No date'}</td><td className="pr-4"><div className="flex justify-end"><Avatar small user={data.users.find(u => u.id === task.assignee)} /></div></td></tr> })}{!filteredTasks.length && <tr><td className="p-8 text-center text-xs text-slate-400" colSpan={6}>No tasks match this view.</td></tr>}</tbody></table></div>
          <div className="flex items-center justify-between border-t border-[#eef0f6] px-4 py-2.5 text-[11px] dark:border-slate-800"><span className="text-slate-400">Showing {Math.min(filteredTasks.length, 6)} of {filteredTasks.length} tasks</span><Link to="/my-tasks" className="text-[#8e7bdf]">View all tasks →</Link></div>
        </Card>
        <section><div className="mb-3 flex justify-between"><h2 className="text-xs font-semibold">Recent Projects <span className="ml-1 text-[11px] font-normal text-slate-400">{activeProjects.length} active</span></h2><Link to="/projects" className="text-[11px] text-[#8e7bdf]">View all projects →</Link></div><div className="grid gap-3 sm:grid-cols-3">{recentProjects.map(project => { const items = activeTasks.filter(t => t.projectId === project.id); const done = items.filter(t => t.status === 'Done').length; const progress = items.length ? Math.round(done / items.length * 100) : 0; return <Card key={project.id} className="flex flex-col p-4"><div className="flex items-center justify-between"><span className="grid size-7 place-items-center rounded-md bg-[#f0edff] text-[13px] font-semibold text-[#8573d8]">{project.icon}</span><button disabled={!manageable} aria-label={`Edit ${project.name}`} onClick={() => dispatch(actions.ui({ project: { id: project.id } }))} className="text-slate-400 disabled:opacity-30"><MoreHorizontal size={15} /></button></div><Link to={projectPath(project)} className="mt-3 text-[13px] font-semibold hover:text-violet-500">{project.name}</Link><p className="mt-1.5 line-clamp-2 min-h-8 text-[11px] leading-4 text-slate-400">{project.description}</p><div className="mt-4 flex justify-between text-[10px] text-slate-400"><span>{done} / {items.length} tasks</span><span>{progress}%</span></div><progress aria-label={`${project.name} progress`} value={done} max={items.length || 1} className="mt-1 h-1 w-full overflow-hidden rounded-full accent-[#9d8ceb] [&::-webkit-progress-bar]:bg-[#f0edff] [&::-webkit-progress-value]:bg-[#9d8ceb]" /><div className="mt-3 flex items-center justify-between"><div className="flex -space-x-1.5">{data.users.filter(u => project.members.includes(u.id)).slice(0, 3).map(u => <Avatar key={u.id} small user={u} />)}</div><span className="text-[10px] text-slate-400">{project.members.length} members</span></div></Card> })}{!recentProjects.length && <Card className="p-8 text-center text-xs text-slate-400 sm:col-span-3">Create your first project to see it here.</Card>}</div></section>
      </div>
      <div className="space-y-4">
        <Card className="p-3.5"><div className="mb-3 flex justify-between"><h2 className="text-[13px] font-semibold">Quick Actions</h2><span className="text-[10px] text-slate-400">Shortcuts</span></div><div className="grid grid-cols-2 gap-2">{[{ icon: ListChecks, label: 'New Task', hint: 'Create a task', run: () => openCreateTask(), enabled: editable }, { icon: FolderKanban, label: 'New Project', hint: 'Start something new', run: openCreateProject, enabled: manageable }, { icon: UserPlus, label: 'Invite Members', hint: 'Grow your team', run: () => setInviteOpen(true), enabled: manageable }, { icon: LayoutGrid, label: 'Command Palette', hint: '⌘ / Ctrl + K', run: openPalette, enabled: true }].map(({ icon: Icon, label, hint, run, enabled }) => <button key={label} disabled={!enabled} onClick={run} className="rounded-md bg-[#f3f0ff] p-3 text-left hover:bg-violet-100 disabled:opacity-40 dark:bg-slate-800"><Icon size={15} className="mb-2 text-[#8975dc]" /><span className="block text-[11px] font-medium text-[#70658f] dark:text-slate-200">{label}</span><span className="mt-1 block text-[10px] text-[#a59bbb]">{hint}</span></button>)}</div></Card>
        <Card className="p-3.5"><div className="mb-3 flex justify-between"><h2 className="text-[13px] font-semibold">Upcoming Deadlines</h2><span className="text-[10px] text-slate-400">Next 5 days</span></div><div className="space-y-2">{deadlines.map(task => <button key={task.id} onClick={() => openTask(task)} className="flex w-full items-center justify-between gap-2 rounded bg-[#f7f8fc] p-2 text-left hover:bg-violet-50 dark:bg-slate-800"><div className="min-w-0"><span className="block truncate text-[11px] font-medium">{task.title}</span><span className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><CalendarDays size={9} />{formatDueDate(task.dueDate)}</span></div><Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge></button>)}{!deadlines.length && <p className="py-4 text-center text-[12px] text-slate-400">No upcoming deadlines.</p>}</div></Card>
        <Card className="p-3.5"><div className="mb-3 flex justify-between"><h2 className="text-[13px] font-semibold">Recent Activity</h2><Link to="/activity" aria-label="View all activity" className="text-slate-400"><ArrowUpRight size={13} /></Link></div><div>{recentActivity.map(activity => <div key={activity.id} className="relative ml-1 border-l border-[#e7e2f9] pb-4 pl-3 last:border-transparent last:pb-0"><span className="absolute -left-1 top-1 size-2 rounded-full border-2 border-white bg-[#a294df] dark:border-slate-900" /><p className="text-[11px] leading-4"><strong className="font-medium">{data.users.find(u => u.id === activity.userId)?.name || 'Team member'}</strong> <span className="text-slate-500">{activity.text}</span></p><p className="mt-1 text-[10px] text-slate-400">{formatRelativeTime(activity.at)}</p></div>)}{!recentActivity.length && <p className="text-[12px] text-slate-400">Activity will appear as your team works.</p>}</div></Card>
        <Card className="p-3.5"><div className="mb-3 flex justify-between"><h2 className="text-[13px] font-semibold">Team <span className="font-normal text-slate-400">· {members.length} members</span></h2><Link to="/members" className="text-[10px] text-violet-400">View all</Link></div><ul className="space-y-3">{members.slice(0, 5).map(u => { const presence = presenceFor(u.id); return <li key={u.id} className="flex items-center gap-2"><span className="relative"><Avatar small user={u} /><span className={`absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-white ${STATUS_TONE[presence]}`} /></span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium">{u.name}</p><p className="text-[10px] text-slate-400">{workspace.members.find(m => m.userId === u.id)?.role}</p></div><span title="Simulated presence" className="text-[10px] text-slate-400 capitalize">{presence}</span></li> })}</ul></Card>
      </div>
    </div>
    {inviteOpen && <InviteMemberModal workspace={workspace} onClose={() => setInviteOpen(false)} />}
  </div>
}
