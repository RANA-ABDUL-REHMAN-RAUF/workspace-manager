import { createSlice } from '@reduxjs/toolkit'
import { seedData } from '../data/seed'

export const initialState = () => ({ data: seedData(), user: null, activeWorkspace: 'acme', ui: { task: null, project: null, command: false }, past: [], future: [], pending: false, failNext: false, online: true, syncing: false, lastSync: null, prefs: { theme: 'light', defaultView: 'board', live: false, notifications: { assigned: true, mentioned: true, due: true } } })
const slice = createSlice({ name: 'workspace', initialState: initialState(), reducers: {
  ui(s, { payload }) { Object.assign(s.ui, payload) },
  sessionChanged(s, { payload }) { s.user = payload; s.past = []; s.future = []; if (payload && !s.data.users.some(u => u.id === payload.id)) s.data.users.push(payload); if (payload && !s.data.workspaces.some(w => w.id === s.activeWorkspace && w.members.some(m => m.userId === payload.id))) s.activeWorkspace = s.data.workspaces.find(w => w.members.some(m => m.userId === payload.id))?.id || '' },
  selectWorkspace(s, { payload }) { if (s.data.workspaces.some(w => w.id === payload && w.members.some(m => m.userId === s.user?.id))) s.activeWorkspace = payload },
  commit(s, { payload }) { s.past.push(s.data); s.past = s.past.slice(-30); s.future = []; s.data = payload; s.pending = true },
  settled(s) { s.pending = false; s.failNext = false },
  rollback(s) { if (s.pending && s.past.length) s.data = s.past.pop(); s.pending = false; s.failNext = false },
  undo(s) { if (!s.pending && s.past.length) { s.future.push(s.data); s.data = s.past.pop() } },
  redo(s) { if (!s.pending && s.future.length) { s.past.push(s.data); s.data = s.future.pop() } },
  preferences(s, { payload }) { Object.assign(s.prefs, payload) },
  failNext(s) { s.failNext = true },
  connectivity(s, { payload }) { s.online = payload },
  syncing(s, { payload }) { s.syncing = payload; if (!payload) s.lastSync = new Date().toISOString() },
  projectView(s, { payload }) { const p = s.data.projects.find(p => p.id === payload.id); if (p && ['board', 'list', 'calendar'].includes(payload.view)) p.view = payload.view },
  preset(s, { payload }) { s.data.presets = s.data.presets.filter(p => !(p.userId === s.user?.id && p.name === payload.name)); s.data.presets.push({ ...payload, userId: s.user?.id }) },
  notifications(s, { payload }) { payload.forEach(n => { if (!s.data.notifications.some(x => x.id === n.id)) s.data.notifications.unshift(n) }); if (s.data.notifications.length > 300) s.data.notifications.length = 300 },
  readNotification(s, { payload }) { s.data.notifications.filter(n => n.userId === s.user?.id && (!payload || n.id === payload)).forEach(n => { n.read = true }) },
  liveEvent(s, { payload }) { if (!s.pending) s.data.activities.unshift(payload) },
  replaceData(s, { payload }) { if (!s.pending) { s.data = payload; s.past = []; s.future = []; s.activeWorkspace = payload.workspaces.find(w => w.members.some(m => m.userId === s.user?.id))?.id || '' } },
} })
export const actions = slice.actions
export default slice.reducer
