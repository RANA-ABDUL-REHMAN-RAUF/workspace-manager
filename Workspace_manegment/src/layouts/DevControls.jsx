import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../store/rootReducer'
import { Button } from '../components/ui/WorkspaceUI'

export default function DevControls() {
  const dispatch = useDispatch()
  const live = useSelector((s) => s.prefs.live)
  const syncing = useSelector((s) => s.syncing)
  const online = useSelector((s) => s.online)

  function triggerSync() {
    dispatch(actions.syncing(true))
    setTimeout(() => dispatch(actions.syncing(false)), 900)
  }

  return <div className="fixed bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#eceaf5] bg-white px-3 py-1.5 text-[9px] shadow-sm md:left-[calc(50%+112px)] dark:border-slate-700 dark:bg-slate-900">
    <span className="text-slate-400">STATE:</span>
    <button type="button" onClick={() => dispatch(actions.preferences({ live: !live }))} aria-pressed={live} className={`rounded-full px-3 py-1 font-medium transition-colors ${live ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
      {live ? 'Live' : 'Paused'}
    </button>
    <Button className="border-0! px-2! py-1! text-[9px]!" onClick={triggerSync} disabled={syncing || !online}>{syncing ? 'Syncing…' : 'Trigger Sync'}</Button>
  </div>
}
