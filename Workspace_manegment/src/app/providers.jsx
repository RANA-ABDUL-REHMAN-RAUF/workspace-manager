import { useState } from 'react'
import { AuthContext } from '../store/hooks'
import { authenticate, clearSession, publicUser, readSession, registerUser, saveSession } from '../services/storage/localStorage'

export default function AppProviders({ children }) {
  const [session, setSession] = useState(readSession)
  const [sessionNotice, setSessionNotice] = useState('')

  async function login(email, password, remember) {
    const user = await authenticate(email, password)
    if (!user) throw new Error('Email or password is incorrect. You can try the demo account below.')
    try {
      saveSession(user, remember)
    } catch {
      throw new Error('Your browser could not update the session. Please allow local storage and try again.')
    }
    setSessionNotice('')
    setSession(publicUser(user))
  }

  async function register(details) {
    const user = await registerUser(details)
    let warning = ''
    try {
      saveSession(user, true)
    } catch {
      warning = 'Your account was created, but your session could not be saved. You may need to sign in again after refreshing.'
    }
    setSessionNotice(warning)
    setSession(publicUser(user))
  }

  function logout() {
    try {
      clearSession()
    } catch {
      throw new Error('Your browser could not clear the saved session. Please allow local storage and try again.')
    }
    setSession(null)
    setSessionNotice('')
  }

  return <AuthContext.Provider value={{ session, sessionNotice, login, register, logout }}>{children}</AuthContext.Provider>
}
