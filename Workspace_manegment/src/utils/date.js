import { day } from '../data/seed'

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const MONTH_DAY = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

export function formatDueDate(dateStr) {
  if (!dateStr) return ''
  if (dateStr === day()) return 'Today'
  if (dateStr === day(1)) return 'Tomorrow'
  if (dateStr === day(-1)) return 'Yesterday'
  const date = new Date(`${dateStr}T00:00:00`)
  return date.getFullYear() === new Date().getFullYear() ? MONTH_DAY.format(date) : `${MONTH_DAY.format(date)} ${date.getFullYear()}`
}

export function dueDateGroup(dateStr) {
  if (dateStr === day()) return 'Today'
  if (dateStr === day(1)) return 'Tomorrow'
  return WEEKDAY.format(new Date(`${dateStr}T00:00:00`))
}

export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const seconds = Math.max(0, Math.round((Date.now() - new Date(isoString).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return MONTH_DAY.format(new Date(isoString))
}
