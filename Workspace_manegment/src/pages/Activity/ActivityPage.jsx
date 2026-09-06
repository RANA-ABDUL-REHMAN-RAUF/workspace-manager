import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { Card, Select, Empty, Avatar } from '../../components/ui/WorkspaceUI'

export default function ActivityPage() {
  const { data, workspace } = useWorkspace()
  const { projectId } = useParams()
  const [actor, setActor] = useState('')
  const [action, setAction] = useState('')
  const all = data.activities.filter(a => a.workspaceId === workspace?.id && (!projectId || a.projectId === projectId))
  const list = all.filter(a => (!actor || a.userId === actor) && (!action || a.action === action))
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Activity</h1><div className="flex gap-2"><Select aria-label="Filter activity by user" value={actor} onChange={e => setActor(e.target.value)}><option value="">All users</option>{data.users.filter(u => workspace?.members.some(m => m.userId === u.id)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</Select><Select aria-label="Filter activity by action" value={action} onChange={e => setAction(e.target.value)}><option value="">All actions</option>{[...new Set(all.map(a => a.action))].map(a => <option key={a}>{a}</option>)}</Select></div><Card>{list.map(a => <div key={a.id} className="flex items-start gap-3 border-b border-slate-100 p-4 dark:border-slate-800"><Avatar user={data.users.find(u => u.id === a.userId)} /><div><p className="text-xs"><strong>{data.users.find(u => u.id === a.userId)?.name}</strong> · {a.action}</p><p className="mt-1 text-sm">{a.text}</p><time className="mt-1 block text-[10px] text-slate-400">{new Date(a.at).toLocaleString()}</time></div></div>)}{!list.length && <Empty title="No activity matches" />}</Card></div>
}
