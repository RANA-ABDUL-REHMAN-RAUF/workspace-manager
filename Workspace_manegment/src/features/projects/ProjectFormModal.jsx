import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { execute } from '../../store/store'
import { Button, Field, Input, Select, Modal } from '../../components/ui/WorkspaceUI'

const COLORS = ['#7c6ee6', '#4e9fe9', '#d99b4a', '#4fb286', '#e0607e']
const TEMPLATES = [['blank', 'Blank project'], ['launch', 'Launch plan'], ['sprint', 'Sprint plan']]

export default function ProjectFormModal({ workspace, onClose }) {
  const dispatch = useDispatch()
  const users = useSelector((s) => s.data.users)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [members, setMembers] = useState(workspace.members.map((m) => m.userId))
  const [template, setTemplate] = useState('blank')
  const [busy, setBusy] = useState(false)

  function toggleMember(userId) {
    setMembers((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId])
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    const ok = await dispatch(execute({
      type: 'project.save',
      payload: { workspaceId: workspace.id, name, description, color, icon: name.slice(0, 1).toUpperCase(), members, template },
    }, 'Project created'))
    setBusy(false)
    if (ok) onClose()
  }

  return <Modal title="Create project" onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name"><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" /></Field>
      <Field label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" /></Field>
      <Field label="Color">
        <div className="flex gap-2">
          {COLORS.map((c) => <button type="button" key={c} onClick={() => setColor(c)} aria-label={`Color ${c}`} className="size-6 rounded-full ring-offset-2" style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : 'none' }} />)}
        </div>
      </Field>
      <Field label="Start from">
        <Select className="w-full" value={template} onChange={(e) => setTemplate(e.target.value)}>
          {TEMPLATES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
      </Field>
      <Field label="Members">
        <div className="flex flex-wrap gap-2">
          {workspace.members.map((m) => <label key={m.userId} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs">
            <input type="checkbox" checked={members.includes(m.userId)} onChange={() => toggleMember(m.userId)} /> {users.find((u) => u.id === m.userId)?.name || m.userId}
          </label>)}
        </div>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" primary disabled={busy || !name.trim()}>Create project</Button>
      </div>
    </form>
  </Modal>
}
