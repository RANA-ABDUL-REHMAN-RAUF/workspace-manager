import { Link, useNavigate, useParams } from 'react-router-dom'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import TaskEditor from '../../features/tasks/TaskEditor'
import { Card } from '../../components/ui/WorkspaceUI'

export default function TaskDetailsPage() {
  const { taskId, projectId, workspaceId } = useParams()
  const { workspace, projects, tasks } = useWorkspace()
  const navigate = useNavigate()
  const project = projects.find(item => item.id === projectId)
  const task = tasks.find(item => item.id === taskId && item.projectId === projectId)
  if (!workspace || !project || !task) return <Card className="p-8"><h1 className="text-lg font-semibold">Task unavailable</h1><p className="mt-2 text-sm text-slate-400">This task does not belong to this workspace or you do not have access.</p><Link className="mt-4 inline-block text-violet-600" to="/workspaces">View workspaces</Link></Card>
  return <TaskEditor key={task.id} taskId={task.id} embedded onClose={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/list`)} />
}
