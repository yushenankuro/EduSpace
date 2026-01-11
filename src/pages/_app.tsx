import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/store/authStore'

export default function App({ Component, pageProps }: AppProps) {
  const setAuth = useAuthStore((state: any) => state.setAuth)
  const clearAuth = useAuthStore((state: any) => state.clearAuth)
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Listen to auth changes saja, checkAuth sudah dilakukan oleh Zustand store
      checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)

        if (event === 'SIGNED_IN' && session) {
          // 1. Fetch role dari user_roles
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle()

          // 2. Fetch profile dari user_profiles (tabel baru)
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('full_name, photo_url')
            .eq('user_id', session.user.id)
            .maybeSingle()

          setAuth(
            session.user.email || '',
            roleData?.role || null,
            session.user.id,
            profileData?.full_name || null,
            profileData?.photo_url || null
          )
        } else if (event === 'SIGNED_OUT') {
          clearAuth()
        }
        // TOKEN_REFRESHED tidak perlu panggil checkAuth lagi
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setAuth, clearAuth, checkAuth]);

  return <Component {...pageProps} />
}