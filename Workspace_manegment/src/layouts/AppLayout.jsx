import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../store/hooks'
import { actions } from '../store/rootReducer'
import { dueNotifications } from '../store/workspaceModel'
import { store } from '../store/store'
import { startMockSocket } from '../services/mock/mockSocket'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { ROUTES } from '../constants/routes'
import Sidebar from './Sidebar'
import Header from './Header'
import DevControls from './DevControls'
import TaskFormModal from '../features/tasks/TaskFormModal'
import ProjectFormModal from '../features/projects/ProjectFormModal'
import CommandPalette from '../features/search/CommandPalette'
import TaskEditor from '../features/tasks/TaskEditor'
import ProjectEditor from '../features/projects/ProjectEditor'
import { useWorkspace } from '../features/workspaces/useWorkspace'
import { notify } from '../utils/notify'
import { toast } from 'react-toastify'

export default function AppLayout() {
  const { session, sessionNotice } = useAuth()
  const dispatch = useDispatch()
  const data = useSelector((s) => s.data)
  const { workspace, editable, manageable, prefs, ui, pending } = useWorkspace()
  const location = useLocation()
  const online = useOnlineStatus()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [taskModal, setTaskModal] = useState(null)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => { dispatch(actions.connectivity(online)) }, [dispatch, online])
  useEffect(() => { dispatch(actions.notifications(dueNotifications(data))) }, [dispatch, data])
  useEffect(() => startMockSocket(dispatch, store.getState), [dispatch])
  useEffect(() => { document.documentElement.classList.toggle('dark', prefs.theme === 'dark'); return () => document.documentElement.classList.remove('dark') }, [prefs.theme])

  const openCreateTask = useCallback((projectId) => { if (!editable) { notify('Create a workspace or ask for editing access first.', 'error'); return } setTaskModal({ projectId: projectId || null }) }, [editable])
  const openCreateProject = useCallback(() => { if (!manageable) { notify('An owner or admin can create projects.', 'error'); return } setProjectModalOpen(true) }, [manageable])
  const openPalette = useCallback(() => setPaletteOpen(true), [])

  useKeyboardShortcut('c', () => openCreateTask())
  useKeyboardShortcut('p', () => openCreateProject())
  useKeyboardShortcut('k', () => setPaletteOpen((open) => !open), { meta: true })
  useKeyboardShortcut('z', e => { if (!pending) { toast.dismiss(); dispatch(e.shiftKey ? actions.redo() : actions.undo()) } }, { meta: true })

  if (!session) return <Navigate to={ROUTES.login} state={{ from: location.pathname + location.search + location.hash }} replace />

  return <div className="min-h-svh bg-[#f8f9fe] font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-200">
    <div className="mx-auto flex max-w-360">
      <Sidebar drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} onCreateProject={openCreateProject} />
      <div className="min-w-0 flex-1">
        <Header onOpenDrawer={() => setDrawerOpen(true)} onOpenPalette={openPalette} />
        {sessionNotice && <p role="status" className="bg-amber-50 p-4 text-sm text-amber-800">{sessionNotice}</p>}
        <main className="px-4 py-5 sm:px-6 lg:px-7 lg:py-6"><Outlet context={{ openCreateTask, openCreateProject, openPalette }} /></main>
      </div>
    </div>
    {taskModal && workspace && <TaskFormModal projects={data.projects.filter((p) => p.workspaceId === workspace.id && !p.archived)} defaultProjectId={taskModal.projectId} onClose={() => setTaskModal(null)} />}
    {projectModalOpen && workspace && <ProjectFormModal workspace={workspace} onClose={() => setProjectModalOpen(false)} />}
    {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} onCreateTask={() => openCreateTask()} onCreateProject={openCreateProject} />}
    {ui.task && <TaskEditor key={ui.task.id || 'new'} taskId={ui.task.id} projectId={ui.task.projectId} onClose={() => dispatch(actions.ui({ task: null }))} />}
    {ui.project && <ProjectEditor key={ui.project.id || 'new'} projectId={ui.project.id} onClose={() => dispatch(actions.ui({ project: null }))} />}
    <DevControls />
  </div>
}
