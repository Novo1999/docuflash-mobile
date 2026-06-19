import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile as updateProfileApi,
} from '@/lib/api/auth'
import { loadSession, persistSession } from '@/lib/session'
import type { AuthStatus, AuthUser, LoginPayload, RegisterPayload, UpdateProfilePayload } from '@/types/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<{ needsEmailConfirmation: boolean }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let active = true
    ;(async () => {
      const session = await loadSession()
      if (!session) {
        if (active) setStatus('unauthenticated')
        return
      }
      try {
        const me = await getCurrentUser()
        if (!active) return
        setUser(me)
        setStatus('authenticated')
      } catch {
        await persistSession(null)
        if (active) setStatus('unauthenticated')
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const login: AuthContextValue['login'] = async (payload) => {
    const result = await loginUser(payload)
    await persistSession(result.session)
    setUser(result.user)
    setStatus('authenticated')
  }

  const register: AuthContextValue['register'] = async (payload) => {
    const result = await registerUser(payload)
    if (result.session) {
      await persistSession(result.session)
      setUser(result.user)
      setStatus('authenticated')
    }
    return { needsEmailConfirmation: result.needsEmailConfirmation }
  }

  const logout: AuthContextValue['logout'] = async () => {
    try {
      await logoutUser()
    } catch {
      // Even if the server call fails, clear the local session.
    }
    await persistSession(null)
    setUser(null)
    setStatus('unauthenticated')
  }

  const refreshUser: AuthContextValue['refreshUser'] = async () => {
    const me = await getCurrentUser()
    setUser(me)
  }

  const updateProfile: AuthContextValue['updateProfile'] = async (payload) => {
    const updated = await updateProfileApi(payload)
    setUser(updated)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, refreshUser, updateProfile }),
    [user, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
