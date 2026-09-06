import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Modal, Input } from '../../components/ui/WorkspaceUI'
import { ROUTES } from '../../constants/routes'

export default function CommandPalette({ onClose, onCreateTask, onCreateProject }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const items = useMemo(() => [
    { label: 'New task', hint: 'C', run: onCreateTask },
    { label: 'New project', hint: 'P', run: onCreateProject },
    { label: 'Go to Home', run: () => navigate(ROUTES.dashboard) },
    { label: 'Go to My Tasks', run: () => navigate(ROUTES.myTasks) },
    { label: 'Go to Projects', run: () => navigate(ROUTES.projects) },
    { label: 'Go to Members', run: () => navigate(ROUTES.members) },
    { label: 'Go to Activity', run: () => navigate(ROUTES.activity) },
    { label: 'Go to Search', run: () => navigate(ROUTES.search) },
    { label: 'Go to Settings', run: () => navigate(ROUTES.settings) },
  ], [navigate, onCreateTask, onCreateProject])

  const matches = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))

  function run(item) {
    onClose()
    item.run()
  }

  return <Modal title="Command palette" onClose={onClose}>
    <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3">
      <Search size={16} className="text-slate-400" />
      <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search actions and pages…" className="border-0 px-0" />
    </div>
    <ul className="mt-3 max-h-72 space-y-1 overflow-auto">
      {matches.map((item) => <li key={item.label}>
        <button type="button" onClick={() => run(item)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50">
          {item.label}
          {item.hint && <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400">{item.hint}</span>}
        </button>
      </li>)}
      {!matches.length && <li className="px-3 py-2 text-sm text-slate-400">No matches</li>}
    </ul>
  </Modal>
}
