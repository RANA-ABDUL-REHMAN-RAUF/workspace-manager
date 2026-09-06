import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useWorkspace } from '../workspaces/useWorkspace'
import { execute } from '../../store/store'
import { Button, Field, Input, Select, Modal } from '../../components/ui/WorkspaceUI'

export default function ProjectEditor({ projectId, onClose }) {
  const { projects, workspace, data, user, pending, manageable } = useWorkspace()
  const project = projects.find(p => p.id === projectId)
  const [form, setForm] = useState(project || { name: '', description: '', color: '#7266df', icon: 'P', members: [user?.id], archived: false, template: 'blank' })
  const dispatch = useDispatch()
  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  return <Modal title={project ? 'Edit project' : 'Create project'} onClose={onClose}><form className="space-y-4" onSubmit={async e => { e.preventDefault(); if (await dispatch(execute({ type: 'project.save', payload: { ...form, workspaceId: workspace?.id, id: project?.id } }, 'Project saved'))) onClose() }}>
    <Field label="Name"><Input name="name" value={form.name} onChange={update} required /></Field><Field label="Description"><Input name="description" value={form.description} onChange={update} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Color"><Input type="color" name="color" value={form.color} onChange={update} /></Field><Field label="Icon / initials"><Input name="icon" maxLength={3} value={form.icon} onChange={update} /></Field></div>
    {!project && <Field label="Project template"><Select name="template" value={form.template} onChange={update}>{['blank', 'Product launch', 'Design sprint', 'Marketing campaign'].map(t => <option key={t}>{t}</option>)}</Select></Field>}
    <fieldset><legend className="mb-2 text-xs font-medium">Project members</legend>{data.users.filter(u => workspace?.members.some(m => m.userId === u.id)).map(u => <label key={u.id} className="mb-2 flex items-center gap-2 text-xs"><input type="checkbox" checked={form.members.includes(u.id)} onChange={e => setForm(f => ({ ...f, members: e.target.checked ? [...f.members, u.id] : f.members.filter(id => id !== u.id) }))} />{u.name}</label>)}</fieldset>
    {project && <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.archived} onChange={e => setForm(f => ({ ...f, archived: e.target.checked }))} />Archive project</label>}
    <Button primary disabled={pending || !manageable}>{pending ? 'Saving…' : 'Save project'}</Button>
  </form></Modal>
}
