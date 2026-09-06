import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { actions } from '../../store/rootReducer'
import { Card, Input, Empty } from '../../components/ui/WorkspaceUI'

export default function SearchPage() {
  const { data, available } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const dispatch = useDispatch()
  const projects = data.projects.filter(p => available.some(w => w.id === p.workspaceId))
  const matches = text => query.trim() && text.toLowerCase().includes(query.toLowerCase())
  const results = [
    ...available.filter(w => matches(w.name)).map(w => ({ id: w.id, type: 'Workspace', title: w.name, to: `/workspaces/${w.id}` })),
    ...projects.filter(p => matches(`${p.name} ${p.description}`)).map(p => ({ id: p.id, type: 'Project', title: p.name, to: `/workspaces/${p.workspaceId}/projects/${p.id}` })),
    ...data.tasks.filter(t => projects.some(p => p.id === t.projectId) && matches(`${t.title} ${t.description} ${t.labels.join(' ')}`)).map(t => ({ id: t.id, type: 'Task', title: t.title, to: `/workspaces/${projects.find(p => p.id === t.projectId).workspaceId}/projects/${t.projectId}/tasks/${t.id}` })),
  ]
  return <div className="space-y-5"><h1 className="text-xl font-semibold">Search your work</h1><Input autoFocus aria-label="Global search" placeholder="Search tasks, projects, workspaces…" value={query} onChange={e => setParams({ q: e.target.value }, { replace: true })} /><Card>{results.map(r => <Link key={`${r.type}-${r.id}`} to={r.to} onClick={() => dispatch(actions.ui({ command: false }))} className="block border-b border-slate-100 p-4 hover:bg-violet-50 dark:border-slate-800 dark:hover:bg-slate-800"><span className="text-[10px] text-slate-400">{r.type}</span><p className="text-sm">{r.title}</p></Link>)}{!results.length && <Empty title={query ? 'No results found' : 'What are you looking for?'} />}</Card></div>
}
