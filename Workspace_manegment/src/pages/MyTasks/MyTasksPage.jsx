import TaskViews from '../../features/tasks/TaskViews'
import { Card } from '../../components/ui/WorkspaceUI'

export default function MyTasksPage() {
  return <div className="space-y-5"><h1 className="text-xl font-semibold">My tasks</h1><Card><TaskViews mine /></Card></div>
}
