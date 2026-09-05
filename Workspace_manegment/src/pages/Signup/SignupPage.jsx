import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../store/hooks'
import { notify } from '../../utils/notify'

function FieldIcon({ kind }) {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'user' && <><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>}
    {kind === 'email' && <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>}
    {kind === 'lock' && <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>}
    {kind === 'eye' && <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>}
    {kind === 'workspace' && <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><path d="M14 17h7m-3-3v7" /></>}
    {kind === 'bolt' && <path d="m13 2-9 12h7l-1 8 10-13h-8z" />}
  </svg>
}

function Field({ id, label, kind, reveal, onReveal, ...props }) {
  return <div>
    <label htmlFor={id} className="mb-2 block text-[11px] font-medium text-slate-600">{label}</label>
    <div className="flex h-11 items-center gap-2.5 rounded-md border border-[#e7eaf3] bg-white px-3 text-slate-400 focus-within:border-[#7068dd] focus-within:ring-3 focus-within:ring-[#7068dd]/10">
      <FieldIcon kind={kind} />
      <input id={id} className="w-full min-w-0 bg-transparent py-2 text-xs text-slate-800 outline-none placeholder:text-slate-400" {...props} />
      {onReveal && <button type="button" onClick={onReveal} aria-label={`${reveal ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={reveal} className="rounded p-1 hover:text-[#6963d8]"><FieldIcon kind="eye" /></button>}
    </div>
  </div>
}

export default function SignupPage() {
  const location = useLocation()
  const { register, login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', acceptedTerms: false })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const strength = form.password.length === 0 ? 0 : form.password.length < 8 ? 1 : form.password.length >= 12 && /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password) ? 3 : 2
  const strengthLabels = ['Use at least 8 characters', 'Too short', 'Good', 'Strong']
  const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400']
  const update = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setError('')
    setBusy('register')
    try {
      await register(form)
      notify('Account created successfully. Welcome to Workspace Manager!', 'success')
    } catch (failure) {
      setError(failure.message)
      notify(failure, 'error')
    } finally {
      setBusy('')
    }
  }

  async function useDemo() {
    if (busy) return
    setError('')
    setBusy('demo')
    try {
      await login('alex@workspace.com', 'workspace123', false)
      notify('Signed in to the demo account.', 'success')
    } catch (failure) {
      setError(failure.message)
      notify(failure, 'error')
    } finally {
      setBusy('')
    }
  }

  return <main className="grid min-h-svh min-w-80 bg-white font-[Inter,'Segoe_UI',Arial,sans-serif] leading-normal text-[#171a2d] antialiased md:grid-cols-[52%_48%] [&_button]:cursor-pointer [&_button]:disabled:cursor-wait [&_button]:disabled:opacity-60 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-3 [&_button:focus-visible]:outline-[#7068dd] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-3 [&_a:focus-visible]:outline-[#7068dd]">
    <section className="flex flex-col border-b border-[#e8ebf4] bg-[#f9faff] p-6 md:border-r md:border-b-0 md:px-10 md:pt-12 md:pb-7 xl:px-14">
      <header className="flex items-center justify-between gap-4">
        <Link to={ROUTES.home} className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#6c65dd] text-white"><FieldIcon kind="workspace" /></span><span className="text-xs font-semibold">Workspace Manager<small className="mt-1 block text-[7px] font-normal tracking-[1.4px] text-slate-500">YOUR SPACE. IN SYNC.</small></span></Link>
        <span className="hidden items-center gap-1.5 rounded border border-slate-100 bg-white px-2 py-1 text-[7px] text-slate-500 xl:flex"><i className="size-1 rounded-full bg-emerald-400" />All systems operational</span>
      </header>
      <div className="my-auto max-w-lg py-10 md:py-20">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e7e4ff] bg-[#f0eeff] px-2.5 py-1 text-[9px] font-medium text-[#776be0]"><FieldIcon kind="bolt" />GET STARTED IN MINUTES</span>
        <h1 className="mt-6 text-[34px] leading-[1.08] font-bold tracking-[-1.4px] xl:text-[42px]">Build better workspaces.<br />Together.</h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-[#81889d]">Create your account and start organizing projects, tasks, and teams—all in one flexible workspace.</p>
        <div className="mt-9 hidden space-y-6 md:block">
          {[
            ['workspace', 'Create organized workspaces', 'Keep projects, tasks, and teams connected in a single shared workspace.'],
            ['user', 'Manage work your way', 'Use flexible boards, lists, and calendars to plan, track, and move work forward.'],
            ['bolt', 'Collaborate easily', 'Assign work, share comments, mention teammates, and stay aligned effortlessly.'],
          ].map(([icon, title, description]) => <div key={title} className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#eceafa] bg-white text-[#8174e1]"><FieldIcon kind={icon} /></span><div><h2 className="text-[11px] font-semibold">{title}</h2><p className="mt-1 text-[10px] leading-4 text-[#8c93a7]">{description}</p></div></div>)}
        </div>
      </div>
      <footer className="hidden justify-between gap-4 border-t border-[#eceef6] pt-5 text-[8px] text-slate-400 md:flex"><span>© {new Date().getFullYear()} Workspace Manager</span><span>Simple. &nbsp; Thoughtful. &nbsp; Together.</span></footer>
    </section>
    <section aria-label="Registration" className="flex items-center justify-center px-6 py-10 md:px-10 xl:px-16">
      <div className="w-full max-w-[420px]">
        <h2 className="text-[28px] leading-tight font-bold tracking-[-.8px]">Create your account</h2>
        <p className="mt-2 mb-7 text-xs text-[#8b91a3]">Get started with Workspace Manager.</p>
        <form onSubmit={submit} className="space-y-4" aria-describedby={error ? 'signup-error' : undefined}>
          <Field id="full-name" label="Full name" kind="user" name="name" value={form.name} onChange={update} placeholder="Alex Miller" autoComplete="name" required minLength={2} maxLength={100} />
          <Field id="signup-email" label="Email address" kind="email" name="email" type="email" value={form.email} onChange={update} placeholder="alex@company.com" autoComplete="email" required />
          <div>
            <Field id="signup-password" label="Password" kind="lock" name="password" type={showPassword ? 'text' : 'password'} reveal={showPassword} onReveal={() => setShowPassword(!showPassword)} value={form.password} onChange={update} placeholder="Create a password" autoComplete="new-password" minLength={8} required aria-describedby="password-guidance" />
            <div id="password-guidance" className="mt-2 text-[9px] text-slate-400"><div className="flex justify-between gap-2"><span>Password strength</span><span aria-live="polite">{strengthLabels[strength]}</span></div><div className="mt-1.5 flex gap-1" aria-hidden="true">{[1, 2, 3].map((level) => <span key={level} className={`h-1 flex-1 rounded-full ${strength >= level ? strengthColors[strength] : 'bg-slate-100'}`} />)}</div><p className="mt-1.5">Use 8+ characters. Mix uppercase, lowercase, numbers, and symbols.</p></div>
          </div>
          <Field id="confirm-password" label="Confirm password" kind="lock" name="confirmPassword" type={showConfirmation ? 'text' : 'password'} reveal={showConfirmation} onReveal={() => setShowConfirmation(!showConfirmation)} value={form.confirmPassword} onChange={update} placeholder="Re-enter password" autoComplete="new-password" required minLength={8} />
          <label className="flex cursor-pointer items-start gap-2 text-[10px] leading-4 text-slate-500"><input name="acceptedTerms" type="checkbox" checked={form.acceptedTerms} onChange={update} required className="mt-0.5 size-3.5 shrink-0 accent-[#6963d8] focus-visible:outline-2 focus-visible:outline-[#7068dd]" /><span>I agree to the Terms of Service and Privacy Policy.</span></label>
          {error && <p id="signup-error" role="alert" className="rounded-md bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>}
          <button disabled={Boolean(busy)} className="w-full rounded-md bg-[#6963d8] px-4 py-3 text-xs font-medium text-white hover:bg-[#5952c5]" type="submit">{busy === 'register' ? 'Creating account…' : 'Create Account'} <span className="ml-1" aria-hidden="true">→</span></button>
        </form>
        <p className="mt-5 text-center text-[10px] text-slate-400">Already have an account? <Link to={ROUTES.login} state={location.state} className="font-medium text-[#746bdb] hover:underline">Sign in</Link></p>
        <div className="my-6 flex items-center gap-3 text-[8px] tracking-widest text-slate-400 before:h-px before:flex-1 before:bg-slate-100 after:h-px after:flex-1 after:bg-slate-100">OR TRY A DEMO</div>
        <aside className="rounded-lg border border-[#e9ecf5] bg-[#f8f9fd] p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-[10px] font-semibold text-slate-600"><span className="mr-1 text-[#746bdb]">✦</span> Try a demo account</h3><span className="rounded border border-slate-100 bg-white px-2 py-1 text-[8px] text-slate-400">No account needed</span></div>
          <div className="flex items-center gap-2 rounded-md border border-slate-100 bg-white p-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ece8df] text-[10px] text-[#726957]">AM</span><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold">Alex Morgan <span className="rounded bg-[#eeeaff] px-1 text-[7px] text-[#8275d8]">ADMIN</span></p><p className="mt-1 text-[8px] wrap-anywhere text-slate-400">alex@workspace.com</p></div><button onClick={useDemo} disabled={Boolean(busy)} className="shrink-0 rounded bg-[#222737] px-3 py-2 text-[9px] text-white hover:bg-slate-700" type="button">{busy === 'demo' ? 'Opening…' : 'Try demo'} <span aria-hidden="true">→</span></button></div>
          <p className="mt-3 text-center text-[8px] leading-4 text-slate-400">Explore Workspace Manager with a demo account.<br />No signup required.</p>
        </aside>
        <footer className="mt-6 border-t border-slate-100 pt-4 text-[9px] leading-4 text-slate-400"><p>Your first step to a more organized workspace.<br />Built for individuals, teams, and everything in between.</p><p className="mt-3 text-center text-[8px]">Local demo · Your account stays in this browser.</p></footer>
      </div>
    </section>
  </main>
}
