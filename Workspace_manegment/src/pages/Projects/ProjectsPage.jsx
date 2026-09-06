import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { actions } from '../../store/rootReducer'
import { Card, Button, Input, Badge, Empty, Confirm } from '../../components/ui/WorkspaceUI'
import { execute } from '../../store/store'

export default function ProjectsPage() {
  const { projects, tasks, workspace, manageable, pending } = useWorkspace()
  const dispatch = useDispatch()
  const [query, setQuery] = useState('')
  const [archived, setArchived] = useState(false)
  const [remove, setRemove] = useState(null)
  const list = projects.filter(p => p.archived === archived && p.name.toLowerCase().includes(query.toLowerCase()))
  return <div className="space-y-5"><div className="flex justify-between"><h1 className="text-xl font-semibold">Projects</h1><Button primary disabled={!manageable} onClick={() => dispatch(actions.ui({ project: { id: null } }))}>New project</Button></div><div className="flex items-center gap-3"><Input className="max-w-xs" aria-label="Search projects" placeholder="Find a project" value={query} onChange={e => setQuery(e.target.value)} /><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={archived} onChange={e => setArchived(e.target.checked)} />Show archived</label></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map(p => <Card key={p.id} className="p-5"><Badge>{p.icon}</Badge><Link className="mt-3 block text-sm font-semibold text-violet-600" to={`/workspaces/${p.workspaceId}/projects/${p.id}`}>{p.name}</Link><p className="my-3 text-xs text-slate-400">{p.description}</p><p className="text-xs">{tasks.filter(t => t.projectId === p.id).length} tasks · {p.members.length} members</p><div className="mt-4 flex gap-2"><Button disabled={!manageable || pending} onClick={() => dispatch(actions.ui({ project: { id: p.id } }))}>Edit</Button><Button disabled={!manageable || pending} onClick={() => setRemove(p.id)}>Delete</Button></div></Card>)}</div>{!list.length && <Empty title="No projects found">Create a project or change your filter.</Empty>}{remove && <Confirm title="Delete project and its tasks?" busy={pending} onClose={() => setRemove(null)} onConfirm={async () => { if (await dispatch(execute({ type: 'project.delete', payload: { projectId: remove, workspaceId: workspace.id } }, 'Project deleted'))) setRemove(null) }} />}</div>
}
