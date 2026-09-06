import { shallowEqual, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { roleFor, canEdit, canManage } from '../../store/workspaceModel'

export function useWorkspace() {
  const state = useSelector(s => ({ ...s }), shallowEqual)
  const location = useLocation()
  const routeId = location.pathname.match(/^\/workspaces\/([^/]+)/)?.[1]
  const available = state.data.workspaces.filter(w => w.members.some(m => m.userId === state.user?.id))
  const workspace = available.find(w => w.id === (routeId || state.activeWorkspace)) || (!routeId ? available[0] : null)
  const projects = state.data.projects.filter(p => p.workspaceId === workspace?.id)
  const tasks = state.data.tasks.filter(t => projects.some(p => p.id === t.projectId))
  const role = roleFor(state.data, workspace?.id, state.user?.id)
  return { ...state, available, workspace, projects, tasks, role, editable: canEdit(role), manageable: canManage(role) }
}
