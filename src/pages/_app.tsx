import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useAuthStore } from '@/store/authStore'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { initialize, isLoading, user, role } = useAuthStore()

  useEffect(() => {
    // Verifikasi token ke Supabase di background
    initialize()

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event) => {
        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          await initialize()
        }

        if (event === 'SIGNED_OUT') {
          useAuthStore.setState({ user: null, role: null, isLoading: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Proteksi route dashboard
  useEffect(() => {
    if (isLoading) return // Tunggu rehydrate selesai

    const isDashboard = router.pathname.startsWith('/dashboard')

    if (isDashboard && !user) {
      router.push('/login')
      return
    }

    if (isDashboard && user && role !== 'admin' && role !== 'guru') {
      router.push('/')
    }
  }, [isLoading, user, role, router.pathname])

  return <Component {...pageProps} />
}