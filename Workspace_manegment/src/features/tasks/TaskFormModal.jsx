import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { execute } from '../../store/store'
import { Button, Field, Input, Select, Modal } from '../../components/ui/WorkspaceUI'
import { PRIORITIES } from '../../constants/priorities'
import { notify } from '../../utils/notify'

export default function TaskFormModal({ projects, defaultProjectId, onClose }) {
  const dispatch = useDispatch()
  const users = useSelector((s) => s.data.users)
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [assignee, setAssignee] = useState('')
  const [busy, setBusy] = useState(false)

  const project = projects.find((p) => p.id === projectId)
  const members = users.filter((u) => project?.members.includes(u.id))

  async function submit(event) {
    event.preventDefault()
    if (!project) return notify('Choose a project.', 'error')
    setBusy(true)
    const ok = await dispatch(execute({
      type: 'task.save',
      payload: { projectId, title, status: project.columns[0], priority, dueDate, assignee, labels: [] },
    }, 'Task created'))
    setBusy(false)
    if (ok) onClose()
  }

  return <Modal title="Create task" onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title"><Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" /></Field>
      <Field label="Project">
        <Select className="w-full" value={projectId} onChange={(e) => { setProjectId(e.target.value); setAssignee('') }}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Priority">
          <Select className="w-full" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </Field>
        <Field label="Due date"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
      </div>
      <Field label="Assignee">
        <Select className="w-full" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">Unassigned</option>
          {members.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </Select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" primary disabled={busy || !title.trim()}>Create task</Button>
      </div>
    </form>
  </Modal>
}
