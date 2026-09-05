export function exportWorkspace(data) {
  const blob = new Blob([JSON.stringify({ version: 1, data }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'workspace-manager.json'; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
