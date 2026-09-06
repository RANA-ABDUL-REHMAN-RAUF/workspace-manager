import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { execute } from '../../store/store'
import { Button, Field, Input, Select, Modal } from '../../components/ui/WorkspaceUI'

const ROLES = ['viewer', 'member', 'admin']

export default function InviteMemberModal({ workspace, onClose }) {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    const ok = await dispatch(execute({
      type: 'member.save',
      payload: { workspaceId: workspace.id, name, email, role },
    }, 'Member invited'))
    setBusy(false)
    if (ok) onClose()
  }

  return <Modal title="Invite member" onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name"><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" /></Field>
      <Field label="Email"><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@workspace.com" /></Field>
      <Field label="Role">
        <Select className="w-full" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" primary disabled={busy || !name.trim() || !email.trim()}>Send invite</Button>
      </div>
    </form>
  </Modal>
}
