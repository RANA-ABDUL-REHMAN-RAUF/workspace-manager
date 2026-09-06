import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Bell, ChevronDown, Menu, Search, WifiOff } from 'lucide-react'
import { useAuth } from '../store/hooks'
import { notify } from '../utils/notify'
import { useWorkspace } from '../features/workspaces/useWorkspace'
import { actions } from '../store/rootReducer'
import { Avatar, Button } from '../components/ui/WorkspaceUI'
import { formatRelativeTime } from '../utils/date'
import WorkspaceFormModal from '../features/workspaces/WorkspaceFormModal'
import InviteMemberModal from '../features/workspaces/InviteMemberModal'

export default function Header({ onOpenDrawer, onOpenPalette }) {
  const headerRef = useRef(null)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const { session, logout, switchProfile } = useAuth()
  const { workspace, available, data, online, syncing, prefs, manageable } = useWorkspace()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const project = data.projects.find((p) => p.id === projectId)
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => {
    const dismiss = (event) => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !headerRef.current?.contains(event.target)) {
        setWorkspaceMenuOpen(false); setNotifOpen(false); setAccountOpen(false)
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', dismiss)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', dismiss) }
  }, [])

  const pageTitle = project?.name || (/^\/workspaces(?:\/[^/]+)?$/.test(pathname) ? 'Workspaces' : null) || ({ '/dashboard': 'Workspace overview', '/my-tasks': 'My tasks', '/projects': 'Projects', '/notifications': 'Inbox', '/search': 'Search', '/members': 'Members', '/activity': 'Activity', '/settings': 'Settings', '/profile': 'Profile' }[pathname]) || 'Workspace overview'
  const notifications = data.notifications.filter((n) => n.userId === session?.id && prefs.notifications[n.kind] !== false).slice(0, 20)
  const unread = notifications.filter((n) => !n.read).length
  const members = data.users.filter((u) => workspace?.members.some((m) => m.userId === u.id))

  return <header ref={headerRef} className="sticky top-0 z-10 flex min-h-16 flex-wrap items-center gap-3 border-b border-[#eaecf4] bg-white px-4 py-2 sm:px-6 lg:px-7 dark:border-slate-800 dark:bg-slate-900">
    <button type="button" onClick={onOpenDrawer} aria-label="Open navigation" className="rounded p-1 hover:bg-slate-100 md:hidden"><Menu size={18} /></button>

    <div className="relative">
      <button type="button" onClick={() => setWorkspaceMenuOpen((open) => !open)} className="flex items-center gap-1 text-[12px] font-medium text-slate-400">
        {workspace?.name || 'Workspace'} <ChevronDown size={14} className="text-slate-400" />
      </button>
      {workspaceMenuOpen && <div className="absolute left-0 z-20 mt-2 w-56 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        {available.map((w) => <button key={w.id} type="button" onClick={() => { dispatch(actions.selectWorkspace(w.id)); navigate('/dashboard'); setWorkspaceMenuOpen(false) }} className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-50 ${w.id === workspace?.id ? 'font-medium text-[#6963d8]' : 'text-slate-600'}`}>{w.name}</button>)}
        <button type="button" onClick={() => { setNewWorkspaceOpen(true); setWorkspaceMenuOpen(false) }} className="block w-full rounded px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50">+ New workspace</button>
      </div>}
    </div>

    <span className="hidden text-[12px] text-slate-400 sm:inline">/ <span className="ml-2 text-[#7764cd]">{pageTitle}</span></span>

    <span className={`hidden items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] sm:inline-flex ${!online ? 'border-red-100 bg-red-50 text-red-600' : syncing ? 'border-amber-100 bg-amber-50 text-amber-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
      {!online && <WifiOff size={11} />}{!online ? 'Offline' : syncing ? 'Syncing…' : 'Synced'}
    </span>

    <div className="ml-auto flex items-center gap-2">
      <Button disabled={!manageable} onClick={() => setInviteOpen(true)} className="hidden text-[12px]! sm:inline-flex">Share</Button>
      <button type="button" onClick={onOpenPalette} aria-label="Search workspace" className="flex items-center gap-2 rounded-md border border-slate-100 px-2 py-1.5 text-[12px] text-slate-400 hover:bg-slate-50">
        <Search size={15} /><span className="hidden sm:inline">Search</span><span className="rounded border border-slate-200 px-1 text-[12px]">⌘K</span>
      </button>

      <div className="hidden -space-x-2 sm:flex">
        {members.slice(0, 3).map((u) => <Avatar key={u.id} user={u} small />)}
        {members.length > 3 && <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-[11px] font-medium text-slate-500">+{members.length - 3}</span>}
      </div>

      <div className="relative">
        <button type="button" onClick={() => setNotifOpen((open) => !open)} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={notifOpen} className="relative rounded-md p-2 hover:bg-slate-100">
          <Bell size={18} />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 grid min-w-4 h-4 place-items-center rounded-full bg-[#e77683] px-1 text-[9px] text-white">{unread > 99 ? '99+' : unread}</span>}
        </button>
        {notifOpen && <div className="absolute right-0 z-20 mt-2 w-[min(320px,calc(100vw-32px))] rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 p-3">
            <p className="text-sm font-medium">Notifications</p>
            <button type="button" onClick={() => dispatch(actions.readNotification())} className="text-xs text-[#6963d8] hover:underline">Mark all read</button>
          </div>
          <ul className="max-h-80 overflow-auto">
            {notifications.map((n) => <li key={n.id} className={`border-b border-slate-50 p-3 text-xs last:border-0 ${n.read ? 'text-slate-400' : 'text-slate-700'}`}>
              <button className="text-left" onClick={() => { dispatch(actions.readNotification(n.id)); const task = data.tasks.find(t => t.id === n.taskId); const project = data.projects.find(p => p.id === task?.projectId); if (project) { navigate(`/workspaces/${project.workspaceId}/projects/${project.id}/tasks/${task.id}`); setNotifOpen(false) } }}>{n.text}</button><p className="mt-0.5 text-[12px] text-slate-400">{formatRelativeTime(n.at)}</p>
            </li>)}
            {!notifications.length && <li className="p-4 text-center text-xs text-slate-400">You're all caught up.</li>}
          </ul>
        </div>}
      </div>

      <div className="relative">
        <button type="button" onClick={() => setAccountOpen((open) => !open)} aria-label="Account menu" aria-expanded={accountOpen}><Avatar user={session} /></button>
        {accountOpen && <div className="absolute right-0 z-20 mt-2 w-64 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-3"><p className="text-sm font-medium">{session.name}</p><p className="text-xs text-slate-400">{session.email}</p></div>
          <Link to="/profile" onClick={() => setAccountOpen(false)} className="block rounded px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-800">Your profile</Link>
          <p className="px-3 pt-2 pb-1 text-[12px] font-semibold tracking-wider text-slate-400">SWITCH PROFILE</p>
          {members.filter((u) => u.id !== session.id).map((u) => <Button key={u.id} className="w-full! justify-start! border-0!" onClick={() => { try { switchProfile(u) } catch (error) { notify(error, 'error') } setAccountOpen(false) }}><Avatar user={u} small />{u.name}</Button>)}
          <button type="button" onClick={() => { try { logout() } catch (error) { notify(error, 'error') } setAccountOpen(false) }} className="mt-1 block w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign out</button>
        </div>}
      </div>
    </div>
    {newWorkspaceOpen && <WorkspaceFormModal onClose={() => setNewWorkspaceOpen(false)} />}
    {inviteOpen && workspace && <InviteMemberModal workspace={workspace} onClose={() => setInviteOpen(false)} />}
  </header>
}
