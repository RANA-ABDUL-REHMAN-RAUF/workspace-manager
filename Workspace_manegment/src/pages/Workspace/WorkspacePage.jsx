import { generatePath, Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import { ROUTES } from '../../constants/routes'

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  return <EmptyState title={workspaceId ? 'Workspace' : 'Workspaces'} description="Workspace creation and management are coming soon.">
    {workspaceId && <nav aria-label="Workspace navigation" className="flex flex-wrap gap-4 text-sm text-[#6963d8]">
      {[['Projects', ROUTES.workspaceProjects], ['Members', ROUTES.workspaceMembers], ['Activity', ROUTES.workspaceActivity], ['Settings', ROUTES.workspaceSettings]].map(([label, path]) =>
        <Link key={path} className="underline" to={generatePath(path, { workspaceId })}>{label}</Link>
      )}
    </nav>}
  </EmptyState>
}
