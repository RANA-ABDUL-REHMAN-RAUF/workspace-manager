import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { execute } from '../../store/store'
import { Button, Field, Input, Modal } from '../../components/ui/WorkspaceUI'

export default function WorkspaceFormModal({ onClose }) {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    const ok = await dispatch(execute({
      type: 'workspace.create',
      payload: { name, icon: name.slice(0, 1).toUpperCase(), color: '#7266df' },
    }, 'Workspace created'))
    setBusy(false)
    if (ok) onClose()
  }

  return <Modal title="Create workspace" onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      <Field label="Workspace name"><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" primary disabled={busy || !name.trim()}>Create workspace</Button>
      </div>
    </form>
  </Modal>
}
