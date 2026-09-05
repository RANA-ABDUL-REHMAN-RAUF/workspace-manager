export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  workspaces: '/workspaces',
  workspace: '/workspaces/:workspaceId',
  workspaceMembers: '/workspaces/:workspaceId/members',
  workspaceSettings: '/workspaces/:workspaceId/settings',
  workspaceActivity: '/workspaces/:workspaceId/activity',
  projects: '/projects',
  workspaceProjects: '/workspaces/:workspaceId/projects',
  project: '/workspaces/:workspaceId/projects/:projectId',
  task: '/workspaces/:workspaceId/projects/:projectId/tasks/:taskId',
  myTasks: '/my-tasks',
  members: '/members',
  activity: '/activity',
  search: '/search',
  notifications: '/notifications',
  profile: '/profile',
  settings: '/settings',
}

// Only return to local application URLs, never an external or auth page.
export function loginDestination(from) {
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//') || from.includes('\\')) return ROUTES.dashboard
  const pathname = from.split(/[?#]/)[0].replace(/\/+$/, '').toLowerCase()
  if (!pathname || [ROUTES.login, ROUTES.signup].includes(pathname)) return ROUTES.dashboard
  return from
}
