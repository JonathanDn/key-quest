import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSupabaseAuth() {
    const [session, setSession] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        async function loadSession() {
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Failed to load Supabase session:', error)
            }

            if (!isMounted) {
                return
            }

            const nextSession = data?.session ?? null
            setSession(nextSession)
            setUser(nextSession?.user ?? null)
            setLoading(false)
        }

        loadSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!isMounted) {
                return
            }

            setSession(nextSession)
            setUser(nextSession?.user ?? null)
            setLoading(false)
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    async function signUpWithPassword(email, password) {
        const normalizedEmail = email.trim()

        if (!normalizedEmail) {
            throw new Error('Please type your email.')
        }

        if (!password) {
            throw new Error('Please type your password.')
        }

        const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
        })

        if (error) {
            throw error
        }

        return data
    }

    async function signInWithPassword(email, password) {
        const normalizedEmail = email.trim()

        if (!normalizedEmail) {
            throw new Error('Please type your email.')
        }

        if (!password) {
            throw new Error('Please type your password.')
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        })

        if (error) {
            throw error
        }

        return data
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()

        if (error) {
            throw error
        }
    }

    return {
        session,
        user,
        loading,
        isSignedIn: Boolean(user),
        signUpWithPassword,
        signInWithPassword,
        signOut,
    }
}