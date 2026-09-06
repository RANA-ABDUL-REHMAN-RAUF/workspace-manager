export function isProfilePhoto(value) {
  if (!value) return true
  if (typeof value !== 'string') return false
  if (/^data:image\/(png|jpeg|webp|gif);base64,/.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'res.cloudinary.com' && !url.username && !url.password
  } catch { return false }
}
