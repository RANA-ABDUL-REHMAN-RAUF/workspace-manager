export default function EmptyState({ title, description = 'This page is coming soon.', children }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-10">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
    <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    {children && <div className="mt-6">{children}</div>}
  </section>
}
