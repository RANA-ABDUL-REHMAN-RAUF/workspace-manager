import { toast } from 'react-toastify'

// Use notify(message, 'success' | 'error' | 'warning' | 'info') from any page.
export function notify(message, type = 'info') {
  const text = message instanceof Error ? message.message : message
  const content = typeof text === 'string' && text.trim() ? text : 'Something went wrong. Please try again.'
  const notificationType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info'
  return toast(content, {
    type: notificationType,
    toastId: `${notificationType}:${content}`,
    role: notificationType === 'error' ? 'alert' : 'status',
  })
}
