import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Camera } from 'lucide-react'
import { useAuth } from '../../store/hooks'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { execute } from '../../store/store'
import { Avatar, Button, Card, Field, Input } from '../../components/ui/WorkspaceUI'
import { isCloudinaryConfigured, uploadProfilePhoto } from '../../services/cloudinary'

export default function ProfilePage() {
  const { session } = useAuth()
  return <ProfileForm key={session.id} session={session} />
}

function ProfileForm({ session }) {
  const dispatch = useDispatch()
  const { pending } = useWorkspace()
  const [avatar, setAvatar] = useState(session.avatar || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const controller = useRef(null)
  const input = useRef(null)
  useEffect(() => () => controller.current?.abort(), [])

  async function upload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(''); setSaved(false); setUploading(true)
    controller.current = new AbortController()
    try { setAvatar(await uploadProfilePhoto(file, { signal: controller.current.signal })) }
    catch (failure) { if (failure.name !== 'AbortError') setError(failure.message) }
    finally { setUploading(false) }
  }

  async function save(event) {
    event.preventDefault()
    setSaved(false)
    const ok = await dispatch(execute({ type: 'profile.update', payload: { name: session.name, email: session.email, avatar } }, 'Profile photo updated'))
    if (ok) { setSaved(true); setError('') }
  }

  return <section className="max-w-2xl space-y-6"><div><h1 className="text-2xl font-semibold">Your profile</h1><p className="mt-2 text-sm text-slate-400">Manage the photo your teammates see across your workspace.</p></div>
    <Card className="p-6"><form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center gap-5"><div className="grid size-20 place-items-center rounded-full bg-violet-50 [&_img]:size-20 [&_span]:size-20 [&_span]:text-2xl"><Avatar user={{ ...session, avatar }} /></div><div><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Profile photo" className="sr-only" disabled={uploading || pending || !isCloudinaryConfigured()} onChange={upload} /><Button type="button" disabled={uploading || pending || !isCloudinaryConfigured()} onClick={() => input.current.click()}><Camera size={15} />{uploading ? 'Uploading…' : 'Upload photo'}</Button><p className="mt-2 text-xs text-slate-400">JPG, PNG, or WebP. Maximum 5 MB.</p>{avatar && <button type="button" disabled={uploading || pending} onClick={() => { setAvatar(''); setSaved(false) }} className="mt-2 text-xs text-red-500">Remove photo</button>}</div></div>
      {!isCloudinaryConfigured() && <p role="status" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Photo uploads are awaiting administrator setup.</p>}
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Name"><Input value={session.name} readOnly /></Field><Field label="Email"><Input value={session.email} readOnly /></Field></div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}{saved && <p role="status" className="text-sm text-emerald-600">Profile photo saved.</p>}
      <Button primary type="submit" disabled={uploading || pending || avatar === (session.avatar || '')}>{pending ? 'Saving…' : 'Save photo'}</Button>
    </form></Card>
  </section>
}
