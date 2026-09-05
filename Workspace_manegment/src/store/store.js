import { configureStore } from '@reduxjs/toolkit'
import reducer, { actions, initialState } from './rootReducer'
import { applyCommand } from './workspaceModel'
import { validateImport } from '../services/importExport/importWorkspace'
import { notify, notifyUndo } from '../utils/notify'
import { readSession } from '../services/storage/localStorage'

const KEY = 'workspace-manager.data.v1'
function restore() {
  const state = initialState()
  try { const raw = localStorage.getItem(KEY); if (raw) { const saved = JSON.parse(raw); state.data = validateImport(saved); state.prefs = { ...state.prefs, ...saved.prefs }; state.activeWorkspace = saved.activeWorkspace || '' } } catch { notify('Saved workspace data could not be loaded. The demo workspace has been restored.', 'warning') }
  state.user = readSession()
  if (state.user && !state.data.users.some(u => u.id === state.user.id)) state.data.users.push(state.user)
  return state
}
export const store = configureStore({ reducer, preloadedState: restore() })
let previous
store.subscribe(() => {
  const s = store.getState()
  if (s.pending) return
  const serialized = JSON.stringify({ version: 1, data: s.data, prefs: s.prefs, activeWorkspace: s.activeWorkspace })
  if (serialized === previous) return
  previous = serialized
  try { localStorage.setItem(KEY, serialized) } catch { notify('Browser storage is full or blocked. Export your workspace to keep these changes.', 'error') }
})

export const execute = (command, label = 'Changes saved') => async (dispatch, getState) => {
  const s = getState()
  if (s.pending) { notify('Please wait for the current change to finish.', 'info'); return false }
  try {
    const next = applyCommand(s.data, command, s.user?.id, new Date().toISOString(), crypto.randomUUID())
    dispatch(actions.commit(next))
    await new Promise(resolve => setTimeout(resolve, 350))
    if (s.failNext) { dispatch(actions.rollback()); notify('Simulated save failed. Your change was rolled back.', 'error'); return false }
    dispatch(actions.settled())
    notifyUndo(label, () => dispatch(actions.undo()))
    return true
  } catch (error) { notify(error, 'error'); return false }
}
