import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Person } from '../../types/database'

interface AuthState {
  session: Session | null
  person: Person | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function loadPerson(userId: string): Promise<Person | null> {
  const { data: account } = await supabase
    .from('user_accounts')
    .select('person_id')
    .eq('id', userId)
    .single()

  if (!account) return null

  const { data: person } = await supabase
    .from('people')
    .select('*')
    .eq('id', account.person_id)
    .single()

  return person
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function hydrate(nextSession: Session | null) {
      setSession(nextSession)
      if (nextSession) {
        const p = await loadPerson(nextSession.user.id)
        if (active) setPerson(p)
      } else {
        setPerson(null)
      }
      if (active) setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => hydrate(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      hydrate(nextSession)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      supabase.rpc('touch_last_login').then(() => {})
    }
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, person, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
