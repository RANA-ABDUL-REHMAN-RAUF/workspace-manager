export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
}

export function isCloudinaryConfigured(config = cloudinaryConfig) {
  return Boolean(config.cloudName && config.uploadPreset)
}

export async function uploadProfilePhoto(file, { config = cloudinaryConfig, signal } = {}) {
  if (!isCloudinaryConfigured(config)) throw new Error('Photo uploads are not configured yet. Please contact your workspace administrator.')
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file?.type)) throw new Error('Choose a JPG, PNG, or WebP image.')
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.')
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', config.uploadPreset)
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`, { method: 'POST', body, signal })
  const result = await response.json().catch(() => null)
  if (!response.ok) throw new Error('Photo upload failed. Please try again or contact your administrator.')
  let url
  try { url = new URL(result?.secure_url) } catch { throw new Error('The upload service returned an invalid image URL.') }
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') throw new Error('The upload service returned an invalid image URL.')
  return url.href
}
