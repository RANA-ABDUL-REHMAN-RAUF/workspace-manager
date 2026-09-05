import { ToastContainer } from 'react-toastify'

export default function GlobalToast() {
  return <ToastContainer
    position="top-right"
    autoClose={5000}
    limit={3}
    newestOnTop
    closeOnClick
    pauseOnHover
    pauseOnFocusLoss
    theme="light"
    ariaLabel="Notifications"
    toastClassName="!rounded-xl !border !border-slate-200 !font-sans !text-sm !shadow-lg"
  />
}
