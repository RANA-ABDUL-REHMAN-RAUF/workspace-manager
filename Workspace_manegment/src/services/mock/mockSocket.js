import { actions } from '../../store/rootReducer'

const VERBS = ['moved', 'commented on', 'completed', 'updated']

export function startMockSocket(dispatch, getState) {
  const interval = setInterval(() => {
    const state = getState()
    if (!state.prefs.live || state.pending) return
    const { tasks, users, projects } = state.data
    if (!tasks.length || !users.length) return
    const task = tasks[Math.floor(Math.random() * tasks.length)]
    const project = projects.find((p) => p.id === task.projectId)
    const user = users[Math.floor(Math.random() * users.length)]
    const verb = VERBS[Math.floor(Math.random() * VERBS.length)]
    dispatch(actions.liveEvent({
      id: `live-${Date.now()}`,
      workspaceId: project?.workspaceId,
      projectId: project?.id,
      taskId: task.id,
      userId: user.id,
      action: 'live',
      text: `${verb} ${task.title}`,
      at: new Date().toISOString(),
    }))
  }, 15000)
  return () => clearInterval(interval)
}
