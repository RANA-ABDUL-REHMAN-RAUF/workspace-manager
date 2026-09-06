import { createNextState } from '@reduxjs/toolkit'
import { day } from '../data/seed'

export const roleFor = (data, workspaceId, userId) => data.workspaces.find(w => w.id === workspaceId)?.members.find(m => m.userId === userId)?.role
export const canEdit = (role) => ['owner', 'admin', 'member'].includes(role)
export const canManage = (role) => ['owner', 'admin'].includes(role)
const required = (value, label) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`); return value.trim() }

export function applyCommand(data, command, actor, at, id) {
  return createNextState(data, d => {
    const { type, payload: p = {} } = command
    const project = d.projects.find(x => x.id === (p.projectId || d.tasks.find(t => t.id === p.id)?.projectId))
    const workspaceId = p.workspaceId || project?.workspaceId
    const role = roleFor(d, workspaceId, actor)
    if (!actor) throw new Error('Please sign in.')
    if (type !== 'workspace.create' && type !== 'profile.update' && !canEdit(role)) throw new Error('Access denied. Your workspace role does not allow editing.')
    if (['workspace.update', 'workspace.delete', 'member.save', 'member.remove', 'project.delete', 'project.save'].includes(type) && !canManage(role)) throw new Error('Access denied. An owner or admin is required.')
    const task = d.tasks.find(t => t.id === p.id)
    const cleanTask = (input) => {
      const owner = d.projects.find(x => x.id === input.projectId)
      if (!owner || owner.workspaceId !== workspaceId) throw new Error('Project not found in this workspace.')
      if (owner.archived) throw new Error('Unarchive the project before changing tasks.')
      if (!owner.columns.includes(input.status)) throw new Error('Select a valid project status.')
      if (!['Low', 'Medium', 'High', 'Urgent'].includes(input.priority)) throw new Error('Select a valid priority.')
      if (input.assignee && !owner.members.includes(input.assignee)) throw new Error('Assignee must be a project member.')
      if (input.dueDate && (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate) || Number.isNaN(Date.parse(input.dueDate)))) throw new Error('Enter a valid due date.')
      if (input.parentId) { const parent = d.tasks.find(t => t.id === input.parentId); if (!parent || parent.parentId || parent.projectId !== input.projectId || parent.id === input.id) throw new Error('Choose a top-level task from the same project.'); if (d.tasks.some(t => t.parentId === input.id)) throw new Error('Promote this task’s subtasks before converting it.') }
      input.title = required(input.title, 'Task title')
      input.description = input.description || ''
      const previousTask = d.tasks.find(t => t.id === input.id)
      input.completedAt = input.status === 'Done' ? previousTask?.completedAt || at : null
      return input
    }
    const removeTasks = ids => { const all = new Set([...ids, ...d.tasks.filter(t => ids.includes(t.parentId)).map(t => t.id)]); d.tasks = d.tasks.filter(t => !all.has(t.id)); d.comments = d.comments.filter(c => !all.has(c.taskId)); d.notifications = d.notifications.filter(n => !all.has(n.taskId)) }
    const notify = (userId, kind, text, taskId) => { if (userId) d.notifications.unshift({ id: `${id}-${d.notifications.length}`, userId, workspaceId, taskId, kind, text, read: false, at }) }
    switch (type) {
      case 'workspace.create': d.workspaces.push({ id, name: required(p.name, 'Workspace name'), icon: p.icon || 'W', color: p.color || '#7266df', defaultView: 'board', members: [{ userId: actor, role: 'owner' }] }); break
      case 'workspace.update': { const w = d.workspaces.find(x => x.id === workspaceId); w.name = required(p.name, 'Workspace name'); w.color = p.color; w.icon = p.icon; w.defaultView = p.defaultView; break }
      case 'workspace.delete': { if (role !== 'owner') throw new Error('Only the owner can delete this workspace.'); const ids = d.projects.filter(x => x.workspaceId === workspaceId).map(x => x.id); removeTasks(d.tasks.filter(t => ids.includes(t.projectId)).map(t => t.id)); d.projects = d.projects.filter(x => !ids.includes(x.id)); d.workspaces = d.workspaces.filter(w => w.id !== workspaceId); d.activities = d.activities.filter(a => a.workspaceId !== workspaceId); break }
      case 'member.save': {
        const w = d.workspaces.find(x => x.id === workspaceId)
        if (!['owner', 'admin', 'member', 'viewer'].includes(p.role)) throw new Error('Invalid member role.')
        const existing = w.members.find(m => m.userId === p.userId)
        if ((existing?.role === 'owner' || p.role === 'owner') && role !== 'owner') throw new Error('Only an owner can change ownership.')
        if (existing?.role === 'owner' && p.role !== 'owner' && w.members.filter(m => m.role === 'owner').length === 1) throw new Error('Keep at least one workspace owner.')
        if (existing) existing.role = p.role
        else { let user = d.users.find(u => u.id === p.userId || u.email.toLowerCase() === p.email?.trim().toLowerCase()); if (!user) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '')) throw new Error('Enter a valid email.'); user = { id, name: required(p.name, 'Name'), email: p.email.trim().toLowerCase(), avatar: '', role: 'member' }; d.users.push(user) } if (w.members.some(m => m.userId === user.id)) throw new Error('This member is already in the workspace.'); w.members.push({ userId: user.id, role: p.role }) }
        break
      }
      case 'member.remove': { const w = d.workspaces.find(x => x.id === workspaceId); const m = w.members.find(x => x.userId === p.userId); if (m?.role === 'owner') throw new Error('Change ownership before removing this member.'); w.members = w.members.filter(x => x.userId !== p.userId); d.projects.filter(x => x.workspaceId === workspaceId).forEach(x => { x.members = x.members.filter(u => u !== p.userId) }); d.tasks.filter(t => d.projects.some(x => x.id === t.projectId && x.workspaceId === workspaceId) && t.assignee === p.userId).forEach(t => { t.assignee = '' }); break }
      case 'project.save': {
        const w = d.workspaces.find(x => x.id === workspaceId)
        if (p.members.some(u => !w.members.some(m => m.userId === u))) throw new Error('Project members must belong to the workspace.')
        const existing = d.projects.find(x => x.id === p.id && x.workspaceId === workspaceId)
        const value = { ...p, name: required(p.name, 'Project name'), id: existing?.id || id, columns: existing?.columns || ['To do', 'In progress', 'In review', 'Done'], view: existing?.view || w.defaultView, archived: Boolean(p.archived) }
        if (existing) { Object.assign(existing, value); d.tasks.filter(t => t.projectId === existing.id && !p.members.includes(t.assignee)).forEach(t => { t.assignee = '' }) } else { d.projects.push(value); if (p.template && p.template !== 'blank') ['Plan requirements', 'Create first draft', 'Review and launch'].forEach((title, i) => d.tasks.push({ id: `${id}-template-${i}`, projectId: id, title: `${p.template}: ${title}`, status: 'To do', priority: 'Medium', description: '', dueDate: '', assignee: actor, labels: [], parentId: null, attachments: [], createdAt: at })) }
        break
      }
      case 'project.delete': if (!project) throw new Error('Project not found.'); removeTasks(d.tasks.filter(t => t.projectId === project.id).map(t => t.id)); d.projects = d.projects.filter(x => x.id !== project.id); break
      case 'project.columns': { if (!project) throw new Error('Project not found.'); const columns = p.columns.map(x => required(x, 'Column')); if (new Set(columns).size !== columns.length || !columns.includes('Done')) throw new Error('Use unique column names and keep Done.'); if (d.tasks.some(t => t.projectId === project.id && !columns.includes(t.status))) throw new Error('Move tasks out of a column before removing it.'); project.columns = columns; break }
      case 'task.save': { const value = cleanTask({ ...(task || { id, createdAt: at, attachments: [], parentId: null }), ...p, id: task?.id || id }); if (task) Object.assign(task, value); else d.tasks.push(value); if (value.assignee) notify(value.assignee, 'assigned', `Assigned: ${value.title}`, value.id); break }
      case 'task.bulk': { const targets = d.tasks.filter(t => p.ids.includes(t.id)); if (targets.length !== p.ids.length || targets.some(t => !d.projects.some(x => x.id === t.projectId && x.workspaceId === workspaceId))) throw new Error('Select tasks from this workspace.'); if (p.remove) removeTasks(p.ids); else targets.forEach(t => { Object.assign(t, cleanTask({ ...t, ...p.changes })); if (p.changes.assignee) notify(t.assignee, 'assigned', `Assigned: ${t.title}`, t.id) }); break }
      case 'task.delete': if (!task) throw new Error('Task not found.'); removeTasks([task.id]); break
      case 'task.duplicate': if (!task) throw new Error('Task not found.'); d.tasks.push({ ...task, id, title: `${task.title} (copy)`, createdAt: at }); d.tasks.filter(t => t.parentId === task.id).forEach((t, i) => d.tasks.push({ ...t, id: `${id}-sub-${i}`, parentId: id })); break
      case 'comment.save': { if (!task) throw new Error('Task not found.'); const existing = d.comments.find(c => c.id === p.commentId); if (existing && existing.userId !== actor) throw new Error('You can only edit your own comments.'); const text = required(p.text, 'Comment'); if (existing) { existing.text = text; existing.editedAt = at } else d.comments.push({ id, taskId: task.id, userId: actor, text, at }); d.users.filter(u => text.includes(`@${u.name}`)).forEach(u => notify(u.id, 'mentioned', `You were mentioned in ${task.title}`, task.id)); break }
      case 'comment.delete': { const comment = d.comments.find(c => c.id === p.commentId && c.taskId === task?.id); if (!comment || comment.userId !== actor) throw new Error('You can only delete your own comments.'); d.comments = d.comments.filter(c => c.id !== comment.id); break }
      case 'profile.update': { const user = d.users.find(u => u.id === actor); if (!user) throw new Error('Profile not found.'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '')) throw new Error('Enter a valid email.'); if (d.users.some(u => u.id !== actor && u.email.toLowerCase() === p.email.trim().toLowerCase())) throw new Error('Email already in use.'); user.name = required(p.name, 'Name'); user.email = p.email.trim().toLowerCase(); user.avatar = p.avatar || ''; break }
      default: throw new Error('Unknown operation.')
    }
    if (workspaceId && type !== 'workspace.delete') d.activities.unshift({ id, workspaceId, projectId: project?.id || p.projectId || (type === 'project.save' ? p.id || id : null), taskId: task?.id || (type === 'task.save' ? id : null), userId: actor, action: type, text: p.title || p.name || p.text || type.replace('.', ' '), at })
    d.activities = d.activities.slice(0, 500)
  })
}

export function dueNotifications(data, now = day()) {
  const tomorrow = day(1)
  return data.tasks.filter(t => t.status !== 'Done' && t.assignee && t.dueDate && t.dueDate <= tomorrow).map(t => ({ id: `due-${t.id}-${now}`, userId: t.assignee, workspaceId: data.projects.find(p => p.id === t.projectId)?.workspaceId, taskId: t.id, kind: 'due', text: `Due ${t.dueDate}: ${t.title}`, read: false, at: new Date().toISOString() }))
}
