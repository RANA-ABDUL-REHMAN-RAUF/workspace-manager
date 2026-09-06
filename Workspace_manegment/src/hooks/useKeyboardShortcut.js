import { useEffect } from 'react'

const isTyping = (target) => target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)

export function useKeyboardShortcut(key, handler, { meta = false } = {}) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key.toLowerCase() !== key.toLowerCase()) return
      if (meta ? !(event.metaKey || event.ctrlKey) : (event.metaKey || event.ctrlKey || isTyping(event.target))) return
      event.preventDefault()
      handler(event)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key, meta, handler])
}
