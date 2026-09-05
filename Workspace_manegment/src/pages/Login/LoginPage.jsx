import { useState } from 'react'
import { mockUsers } from '../../data/users'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import { ROUTES } from '../../constants/routes'
import { notify } from '../../utils/notify'

function Icon({ kind, ...props }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {kind === 'board' && <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 4v16M13 9h3M13 13h3" /></>}
    {kind === 'people' && <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2" /></>}
    {kind === 'bolt' && <path d="m13 2-9 12h7l-1 8 10-13h-8z" />}
    {kind === 'mail' && <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>}
    {kind === 'lock' && <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>}
    {kind === 'eye' && <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const { login } = useAuth()
  const location = useLocation()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function signIn(event) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      await login(email, password, remember)
      notify('Signed in successfully. Welcome back!', 'success')
    } catch (failure) {
      setError(failure.message)
      notify(failure, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="grid min-h-svh min-w-80 grid-cols-1 bg-white font-[Inter,'Segoe_UI',Arial,sans-serif] leading-normal text-[#151827] antialiased min-[761px]:grid-cols-[54%_46%] [&_button]:cursor-pointer [&_button]:motion-safe:transition-colors [&_button:focus-visible]:outline-3 [&_button:focus-visible]:outline-offset-3 [&_button:focus-visible]:outline-[#b1acff] [&_a:focus-visible]:outline-3 [&_a:focus-visible]:outline-offset-3 [&_a:focus-visible]:outline-[#b1acff] [&_input:focus-visible]:outline-3 [&_input:focus-visible]:outline-offset-3 [&_input:focus-visible]:outline-[#b1acff]">
    <section className="flex flex-col border-b border-[#e5e7f1] bg-[#f8f9fe] p-6 min-[761px]:border-r min-[761px]:border-b-0 min-[761px]:px-8 min-[761px]:pt-10 min-[761px]:pb-[26px] min-[1101px]:px-16 min-[1101px]:pt-16 min-[1101px]:pb-[30px] min-[1500px]:pl-[max(64px,calc((100vw-1280px)/2))]" aria-label="About Workspace Manager">
      <header className="flex items-center justify-between gap-5">
        <Link className="flex items-center gap-2.5 text-sm font-[650] no-underline [&_small]:mt-1 [&_small]:block [&_small]:text-[8px] [&_small]:font-medium [&_small]:tracking-[1.4px] [&_small]:text-[#7d8299]" to={ROUTES.home} aria-label="Workspace Manager home"><span className="grid size-[37px] place-items-center rounded-[9px] border-[5px] border-white bg-[#7069df] text-white shadow-sm"><Icon kind="board" /></span><span>Workspace Manager<small>YOUR SPACE. IN SYNC.</small></span></Link>
        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-[5px] border border-[#eef0f7] bg-white px-[9px] py-1.5 text-[8px] text-[#72798e] min-[761px]:max-[1101px]:hidden [&_i]:size-[5px] [&_i]:rounded-full [&_i]:bg-[#32bf89]"><i /> All systems operational</span>
      </header>
      <div className="my-auto max-w-[560px] pt-[30px] pb-2 min-[761px]:py-[50px]">
        <span className="inline-flex items-center gap-[7px] rounded-[20px] border border-[#e3e1fb] bg-[#eeedfe] px-2.5 py-[5px] text-[10px] font-[550] text-[#7169cf]"><Icon kind="bolt" width="13" height="13" /> Built for teams that move forward</span>
        <h1 className="mt-[18px] mb-3 text-[32px] leading-[1.12] font-[650] tracking-[-1.5px] min-[761px]:mt-[27px] min-[761px]:mb-[18px] min-[761px]:text-[clamp(30px,2.8vw,44px)]">Organize work.<br />Move projects forward.</h1>
        <p className="text-[13px] leading-[1.65] text-[#6f778d] min-[761px]:text-[15px]">Manage projects, tasks, teams, and workflows from one flexible,<br className="hidden min-[1101px]:block" /> lightning-fast workspace.</p>
        <div className="mt-[37px] hidden gap-[26px] min-[761px]:grid">
          <Feature kind="board" title="Plan your projects">Organize work across projects, boards, and lists. Keep it clear, at a glance.</Feature>
          <Feature kind="people" title="Collaborate with your team">Assign tasks, comment in context, and keep everyone on the same page.</Feature>
          <Feature kind="bolt" title="Stay focused">Set priorities, track progress, and get things done, without the noise.</Feature>
        </div>
      </div>
      <footer className="hidden justify-between gap-4 border-t border-[#e8eaf3] pt-[25px] text-[9px] text-[#9399ab] min-[761px]:flex"><span>© {new Date().getFullYear()} Workspace Manager</span><span>Simple. &nbsp; Thoughtful. &nbsp; Together.</span></footer>
    </section>
    <section className="flex items-center justify-center px-6 py-9 min-[761px]:px-[30px] min-[761px]:py-10 min-[1101px]:px-12 min-[1101px]:py-[45px]" aria-label="Sign in">
      <div className="w-full max-w-[440px] min-[761px]:max-w-[420px]">
        <>
          <h2 className="mb-[9px] text-[28px] leading-[1.25] font-bold tracking-[-.8px]">Welcome back</h2>
          <p className="mb-[35px] text-xs leading-[1.6] text-[#82889b]">Sign in to continue to your workspace.</p>
          <form onSubmit={signIn}>
            <label className="mb-2 block text-[11px] font-[550] text-[#4e566b]" htmlFor="email">Email address</label>
            <div className="flex h-[43px] items-center gap-2.5 rounded-md border border-[#e6e8f0] px-3 text-[#a1a7b7] focus-within:border-[#7970db] focus-within:ring-3 focus-within:ring-[#7770d9]/10 [&>svg]:size-[15px] [&>svg]:shrink-0"><Icon kind="mail" /><input className="min-w-0 w-full border-0 bg-transparent py-2.5 text-xs text-[#2e3447] outline-none placeholder:text-[#a1a6b5]" id="email" type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required aria-describedby={error ? 'login-error' : undefined} /></div>
            <div className="mt-5 flex items-baseline justify-between"><label className="mb-2 block text-[11px] font-[550] text-[#4e566b]" htmlFor="password">Password</label><button className="border-0 bg-transparent p-0 text-[10px] font-[550] text-[#7269d6] hover:underline" type="button" onClick={() => setNotice('This is a demo workspace. Use alex@workspace.com with password workspace123 to sign in.')}>Forgot password?</button></div>
            <div className="flex h-[43px] items-center gap-2.5 rounded-md border border-[#e6e8f0] px-3 text-[#a1a7b7] focus-within:border-[#7970db] focus-within:ring-3 focus-within:ring-[#7770d9]/10 [&>svg]:size-[15px] [&>svg]:shrink-0"><Icon kind="lock" /><input className="min-w-0 w-full border-0 bg-transparent py-2.5 text-xs text-[#2e3447] outline-none placeholder:text-[#a1a6b5]" id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter password" value={password} onChange={(event) => setPassword(event.target.value)} required aria-describedby={error ? 'login-error' : undefined} /><button type="button" className="flex border-0 bg-transparent p-[5px] text-[#a3a8b9] [&_svg]:size-[15px]" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><Icon kind="eye" /></button></div>
            <div className="mt-[17px] mb-[21px] flex items-center justify-between gap-2 text-[9px] text-[#9b9fb0]"><label className="flex cursor-pointer items-center gap-[7px] text-[#737c91]"><input className="m-0 size-[13px] accent-[#7168dc]" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me for next time</label><span>Stay in sync</span></div>
            <button disabled={submitting} className="w-full rounded-md border border-[#6963d8] bg-[#6963d8] p-[13px] text-xs font-[550] text-white shadow-sm hover:bg-[#5852c5] disabled:cursor-wait disabled:opacity-60 [&_span]:ml-2" type="submit">{submitting ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span></button>
          </form>
          <div className="my-[26px] flex items-center gap-3 text-[8px] tracking-[1.2px] text-[#a2a7b8] before:h-px before:flex-1 before:bg-[#eef0f6] before:content-[''] after:h-px after:flex-1 after:bg-[#eef0f6] after:content-['']"><span>OR EXPLORE FIRST</span></div>
          <aside className="rounded-[7px] border border-[#e9ecf5] bg-[#f8f9fd] p-[17px]">
            <div className="mb-[15px] flex items-center justify-between gap-2 text-[8px] text-[#9ba1b3] [&>strong]:text-[10px] [&>strong]:font-semibold [&>strong]:text-[#4c526c] [&>strong>span]:mr-[5px] [&>strong>span]:text-[#776cdc]"><strong><span aria-hidden="true">✦</span> Try a demo account</strong><span>No setup needed</span></div>
            <div className="flex items-center gap-[9px] rounded-[5px] border border-[#e9ecf3] bg-white p-2.5"><span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[#ece8df] text-[10px] text-[#726957]" aria-hidden="true">AM</span><span className="min-w-0 flex-1 [&>strong]:block [&>strong]:text-[10px] [&>strong]:font-semibold [&>strong>span]:ml-[3px] [&>strong>span]:rounded-[3px] [&>strong>span]:bg-[#f0edff] [&>strong>span]:px-1 [&>strong>span]:py-0.5 [&>strong>span]:text-[6px] [&>strong>span]:tracking-[.4px] [&>strong>span]:text-[#8376d6] [&>small]:mt-1 [&>small]:block [&>small]:text-[8px] [&>small]:text-[#a0a5b5] [&>small]:wrap-anywhere"><strong>Alex Morgan <span>ADMIN</span></strong><small>alex@workspace.com</small></span><button type="button" className="whitespace-nowrap rounded border-0 bg-[#202635] px-2.5 py-2 text-[9px] text-white hover:bg-[#3d4254]" onClick={() => { setEmail(mockUsers[0].email); setPassword(mockUsers[0].password); setError(''); setNotice('Demo credentials filled in. Select Sign in to continue.') }}>Use demo <span aria-hidden="true">→</span></button></div>
            <p className="mt-[13px] text-center text-[8px] leading-[1.8] text-[#9ba1b2]">A shared demo workspace with sample projects, tasks, and teammates.<br />No real data. Just a little room to explore.</p>
          </aside>
          <div className="mt-6 flex justify-between gap-3 border-t border-[#eef0f5] pt-[21px] text-[9px] text-[#9ca2b2]">New to Workspace Manager? <Link className="border-0 bg-transparent p-0 text-[10px] font-[550] text-[#7269d6] hover:underline" to={ROUTES.signup} state={location.state}>Create an account <span aria-hidden="true">↗</span></Link></div>
        </>
        {error && <p className="mt-3 rounded-md bg-[#fff0f0] p-3 text-xs leading-[1.6] text-[#a63745]" id="login-error" role="alert">{error}</p>}
        {notice && <p className="mt-3 rounded-md bg-[#f1efff] p-3 text-xs leading-[1.6] text-[#5d5596]" role="status">{notice}</p>}
        <footer className="mt-[27px] flex flex-wrap items-center justify-center gap-[7px] text-[8px] text-[#a5aaba]"><Icon kind="lock" width="12" height="12" /> Local demo environment <span>•</span> <span>Your workspace, your flow.</span></footer>
      </div>
    </section>
  </main>
}

function Feature({ kind, title, children }) {
  return <div className="flex items-start gap-3.5"><span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] border border-[#eeeefa] bg-white text-[#7c73df]"><Icon kind={kind} /></span><div><h3 className="mt-px mb-1.5 text-xs font-[650]">{title}</h3><p className="max-w-[425px] text-[11px] leading-[1.7] text-[#838a9e]">{children}</p></div></div>
}
