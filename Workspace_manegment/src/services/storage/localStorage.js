import { mockUsers } from '../../data/users'

const SESSION_KEY = 'workspace-manager.session'
const USERS_KEY = 'workspace-manager.users'

function registeredUsers() {
  const value = localStorage.getItem(USERS_KEY)
  if (!value) return []
  const users = JSON.parse(value)
  if (!Array.isArray(users) || users.some((user) => !user || typeof user.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string' || typeof user.passwordHash !== 'string' || typeof user.salt !== 'string')) {
    throw new Error('Saved accounts could not be read. Please check your browser storage.')
  }
  return users
}

async function passwordHash(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function authenticate(email, password) {
  const normalized = email.trim().toLowerCase()
  const demo = mockUsers.find((user) => user.email.toLowerCase() === normalized)
  if (demo) return demo.password === password ? publicUser(demo) : null
  const user = registeredUsers().find((item) => item.email === normalized)
  return user && user.passwordHash === await passwordHash(password, user.salt) ? publicUser(user) : null
}

export async function registerUser({ name, email, password, confirmPassword, acceptedTerms }) {
  const normalized = email.trim().toLowerCase()
  if (name.trim().length < 2) throw new Error('Please enter your full name.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Please enter a valid email address.')
  if (password.length < 8) throw new Error('Use at least 8 characters for your password.')
  if (password !== confirmPassword) throw new Error('Passwords do not match.')
  if (!acceptedTerms) throw new Error('Please accept the terms to continue.')
  if ([...mockUsers, ...registeredUsers()].some((user) => user.email.toLowerCase() === normalized)) {
    throw new Error('An account with this email already exists. Please sign in.')
  }
  const salt = crypto.randomUUID()
  const hash = await passwordHash(password, salt)
  // Read after hashing so simultaneous submissions in this tab cannot overwrite each other.
  const users = registeredUsers()
  if ([...mockUsers, ...users].some((user) => user.email.toLowerCase() === normalized)) throw new Error('An account with this email already exists. Please sign in.')
  const user = { id: crypto.randomUUID(), name: name.trim(), email: normalized, role: 'member', salt, passwordHash: hash }
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]))
  return publicUser(user)
}

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function readSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY))
    const user = mockUsers.find((item) => item.id === saved?.id && item.email === saved?.email)
      || registeredUsers().find((item) => item.id === saved?.id && item.email === saved?.email)
    return user ? publicUser(user) : null
  } catch {
    return null
  }
}

export function saveSession(user, remember) {
  if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(publicUser(user)))
  else localStorage.removeItem(SESSION_KEY)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
