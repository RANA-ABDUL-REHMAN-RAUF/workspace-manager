import { isProfilePhoto } from '../../utils/profilePhoto'

export function validateImport(value) {
  const data = value?.data
  const arrays = ['users', 'workspaces', 'projects', 'tasks', 'comments', 'activities', 'notifications', 'presets']
  if (value?.version !== 1 || !data || arrays.some(k => !Array.isArray(data[k]))) throw new Error('Invalid workspace export. Expected a version 1 workspace file.')
  for (const key of arrays.filter(k => k !== 'presets')) { const ids = data[key].map(x => x?.id); if (ids.some(id => typeof id !== 'string') || new Set(ids).size !== ids.length) throw new Error(`Invalid or duplicate IDs in ${key}.`) }
  for (const u of data.users) if (typeof u.name !== 'string' || typeof u.email !== 'string' || !isProfilePhoto(u.avatar)) throw new Error('Invalid user profile.')
  for (const w of data.workspaces) if (!w.name || !Array.isArray(w.members) || !['board', 'list', 'calendar'].includes(w.defaultView) || w.members.some(m => !data.users.some(u => u.id === m.userId) || !['owner', 'admin', 'member', 'viewer'].includes(m.role)) || !w.members.some(m => m.role === 'owner')) throw new Error('Invalid workspace members or settings.')
  for (const p of data.projects) if (!p.name || !data.workspaces.some(w => w.id === p.workspaceId) || !Array.isArray(p.columns) || !p.columns.includes('Done') || p.columns.some(c => typeof c !== 'string' || !c.trim()) || new Set(p.columns).size !== p.columns.length || !Array.isArray(p.members) || p.members.some(id => !data.workspaces.find(w => w.id === p.workspaceId).members.some(m => m.userId === id))) throw new Error('Invalid project.')
  for (const t of data.tasks) { const p = data.projects.find(p => p.id === t.projectId); if (!p || !t.title || !p.columns.includes(t.status) || !['Low', 'Medium', 'High', 'Urgent'].includes(t.priority) || !Array.isArray(t.labels) || t.labels.some(x => typeof x !== 'string') || !Array.isArray(t.attachments) || (t.assignee && !p.members.includes(t.assignee)) || (t.parentId && !data.tasks.some(x => x.id === t.parentId && x.id !== t.id && !x.parentId && x.projectId === t.projectId))) throw new Error('Invalid task.'); if (t.attachments.some(a => typeof a.name !== 'string' || typeof a.data !== 'string' || !a.data.startsWith('data:'))) throw new Error('Invalid attachment.') }
  for (const c of data.comments) if (!data.tasks.some(t => t.id === c.taskId) || !data.users.some(u => u.id === c.userId) || typeof c.text !== 'string') throw new Error('Invalid comment.')
  if (data.presets.some(p => typeof p.name !== 'string' || !p.filters || typeof p.filters !== 'object')) throw new Error('Invalid saved filter.')
  return data
}
