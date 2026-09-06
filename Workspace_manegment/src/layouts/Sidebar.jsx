import { useState } from 'react'
import { generatePath, NavLink, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Activity, FolderKanban, Home, Inbox, LayoutGrid, Plus, Search, Settings, HelpCircle, UserPlus, X, CheckSquare, Users, ChevronDown, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react'
import { useAuth } from '../store/hooks'
import { useWorkspace } from '../features/workspaces/useWorkspace'
import { Avatar, Modal, Button } from '../components/ui/WorkspaceUI'
import { ROUTES } from '../constants/routes'
import { actions } from '../store/rootReducer'
import InviteMemberModal from '../features/workspaces/InviteMemberModal'
import WorkspaceFormModal from '../features/workspaces/WorkspaceFormModal'

const PRIMARY = [[Home, 'Home', ROUTES.dashboard], [CheckSquare, 'My Tasks', ROUTES.myTasks], [Inbox, 'Inbox', ROUTES.notifications], [Search, 'Search', ROUTES.search]]
const itemClass = ({ isActive }) => `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors ${isActive ? 'bg-[#eeeaff] font-medium text-[#8272d4]' : 'text-[#8990a3] hover:bg-[#f7f6fd] dark:text-slate-400 dark:hover:bg-slate-800'}`

export default function Sidebar({ drawerOpen, onCloseDrawer, onCreateProject }) {
  const { session } = useAuth()
  const { workspace, available, projects, tasks, data, manageable, prefs } = useWorkspace()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [help, setHelp] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const myTasksCount = tasks.filter(t => t.assignee === session?.id && t.status !== 'Done').length
  const inboxCount = data.notifications.filter(n => n.userId === session?.id && !n.read && prefs.notifications[n.kind] !== false).length
  const workspaceNav = workspace ? [[LayoutGrid, 'Overview', generatePath(ROUTES.workspace, { workspaceId: workspace.id })], [FolderKanban, 'Projects', generatePath(ROUTES.workspaceProjects, { workspaceId: workspace.id })], [Users, 'Members', generatePath(ROUTES.workspaceMembers, { workspaceId: workspace.id })], [Activity, 'Activity', generatePath(ROUTES.workspaceActivity, { workspaceId: workspace.id })]] : []
  return <>
    {drawerOpen && <button aria-label="Close navigation" onClick={onCloseDrawer} className="fixed inset-0 z-20 bg-slate-950/30 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-56 shrink-0 flex-col overflow-y-auto border-r border-[#eaecf4] bg-white transition-transform md:sticky md:top-0 md:z-auto md:h-svh md:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${collapsed ? 'md:w-[72px]' : 'md:w-[232px]'} ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="relative flex h-16 shrink-0 items-center gap-2 border-b border-[#f0f1f7] px-4 dark:border-slate-800">
        <button onClick={() => setMenu(!menu)} aria-label="Switch workspace" aria-expanded={menu} className="flex min-w-0 flex-1 items-center gap-2"><span className="grid size-6 shrink-0 place-items-center rounded-md bg-[#7e71df] text-[11px] font-semibold text-white">{workspace?.icon || 'W'}</span><span className={`truncate text-[13px] font-semibold ${collapsed ? 'md:hidden' : ''}`}>{workspace?.name || 'Workspaces'}</span><span className={`rounded bg-violet-50 px-1 text-[10px] text-violet-400 ${collapsed ? 'md:hidden' : ''}`}>PRO</span><ChevronDown size={10} className={`ml-auto text-slate-400 ${collapsed ? 'md:hidden' : ''}`} /></button>
        <button onClick={onCloseDrawer} aria-label="Close navigation" className="md:hidden"><X size={15} /></button>
        {menu && <div className="absolute left-2 top-12 z-40 w-52 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:bg-slate-900">{available.map(w => <button key={w.id} onClick={() => { dispatch(actions.selectWorkspace(w.id)); navigate('/dashboard'); setMenu(false); onCloseDrawer() }} className="block w-full rounded p-2 text-left text-xs hover:bg-violet-50">{w.name}</button>)}<button className="w-full p-2 text-left text-xs text-violet-500" onClick={() => { setMenu(false); setWorkspaceOpen(true) }}>+ Create workspace</button></div>}
      </div>
      <div className="flex flex-1 flex-col px-2.5 py-3">
        <nav aria-label="Main navigation" className="space-y-0.5">{PRIMARY.map(([Icon, label, to]) => <NavLink key={to} to={to} title={label} onClick={onCloseDrawer} className={itemClass}><Icon size={16} strokeWidth={1.6} /><span className={`flex-1 ${collapsed ? 'md:hidden' : ''}`}>{label}</span>{(label === 'My Tasks' ? myTasksCount : label === 'Inbox' ? inboxCount : 0) > 0 && <span className={`rounded bg-[#efedff] px-1.5 text-[10px] text-violet-500 ${collapsed ? 'md:hidden' : ''}`}>{label === 'My Tasks' ? myTasksCount : inboxCount}</span>}</NavLink>)}</nav>
        {workspace && <><p className={`mb-1 mt-5 px-2.5 text-[10px] tracking-[1px] text-[#b0b5c5] ${collapsed ? 'md:hidden' : ''}`}>WORKSPACE</p><nav aria-label="Workspace navigation" className="space-y-0.5">{workspaceNav.map(([Icon, label, to]) => <NavLink end key={to} to={to} title={label} onClick={onCloseDrawer} className={itemClass}><Icon size={16} strokeWidth={1.6} /><span className={collapsed ? 'md:hidden' : ''}>{label}</span></NavLink>)}</nav>
        <div className={`mt-5 mb-1 flex items-center justify-between px-2.5 ${collapsed ? 'md:hidden' : ''}`}><p className="text-[10px] tracking-[1px] text-[#b0b5c5]">PROJECTS</p><button disabled={!manageable} onClick={onCreateProject} aria-label="New project" className="text-slate-400 disabled:opacity-30"><Plus size={12} /></button></div><nav aria-label="Projects" className="space-y-0.5">{projects.filter(p => !p.archived).map(project => <NavLink key={project.id} title={project.name} to={generatePath(ROUTES.project, { workspaceId: workspace.id, projectId: project.id })} onClick={onCloseDrawer} className={itemClass}><span className="size-1.5 shrink-0 rounded-sm " style={{ backgroundColor: project.color || '#a193e2' }} /><span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{project.name}</span></NavLink>)}</nav></>}
        <div className="mt-auto space-y-0.5 pt-12"><button disabled={!manageable} onClick={() => setInviteOpen(true)} title="Invite members" className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-[#8990a3] hover:bg-slate-50 disabled:opacity-40"><UserPlus size={16} /><span className={collapsed ? 'md:hidden' : ''}>Invite Members</span></button><NavLink to={ROUTES.settings} title="Settings" onClick={onCloseDrawer} className={itemClass}><Settings size={16} /><span className={collapsed ? 'md:hidden' : ''}>Settings</span></NavLink><button title="Help and shortcuts" onClick={() => setHelp(true)} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-[#8990a3] hover:bg-slate-50"><HelpCircle size={16} /><span className={collapsed ? 'md:hidden' : ''}>Help & Docs</span></button></div>
        <div className="mt-3 flex items-center gap-2 border-t border-[#eef0f6] px-1 pt-3 dark:border-slate-800"><Link to={ROUTES.profile} title="Your profile"><Avatar user={session} small /></Link><div className={`min-w-0 flex-1 ${collapsed ? 'md:hidden' : ''}`}><p className="truncate text-[12px] font-medium">{session?.name}</p><p className="truncate text-[10px] text-slate-400">{session?.email}</p></div><button title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)} className="hidden text-slate-400 md:block">{collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}</button></div>
        <div className={`mt-4 flex items-center justify-center gap-1 rounded-full border border-slate-100 p-1 dark:border-slate-700 ${collapsed ? 'md:flex-col' : ''}`} aria-label="Appearance">
          {[['light', Sun, 'Light'], ['dark', Moon, 'Dark']].map(([theme, Icon, label]) => <button key={theme} onClick={() => dispatch(actions.preferences({ theme }))} aria-label={`Use ${label.toLowerCase()} theme`} aria-pressed={prefs.theme === theme} className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] ${prefs.theme === theme ? 'bg-[#eeeaff] text-[#7564ce] dark:bg-slate-700 dark:text-white' : 'text-slate-400'}`}><Icon size={12} /><span className={collapsed ? 'md:hidden' : ''}>{label}</span></button>)}
        </div>
      </div>
    </aside>
    {inviteOpen && workspace && <InviteMemberModal workspace={workspace} onClose={() => setInviteOpen(false)} />}
    {workspaceOpen && <WorkspaceFormModal onClose={() => setWorkspaceOpen(false)} />}
    {help && <Modal title="Help & keyboard shortcuts" onClose={() => setHelp(false)}><dl className="grid grid-cols-2 gap-4 text-sm"><dt>New task</dt><dd>C</dd><dt>New project</dt><dd>P</dd><dt>Command palette</dt><dd>Ctrl / ⌘ + K</dd><dt>Undo / redo</dt><dd>Ctrl / ⌘ + Z / Shift + Z</dd></dl><p className="mt-5 text-xs leading-5 text-slate-400">Work is saved in this browser. Use the workspace selector to switch teams. Owners and admins manage projects and members; viewers can browse without editing.</p><Button className="mt-4" onClick={() => setHelp(false)}>Got it</Button></Modal>}
  </>
}
