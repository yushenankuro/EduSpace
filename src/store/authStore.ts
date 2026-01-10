import { create } from 'zustand'
import { supabaseBrowser } from '@/lib/supabase-browser'

interface AuthState {
  isLoggedIn: boolean
  userEmail: string
  userRole: string | null
  userId: string | null
  photoUrl: string | null  // 👈 Tambah ini
  loading: boolean
  
  setAuth: (email: string, role: string | null, userId: string, photoUrl?: string | null) => void
  clearAuth: () => void
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userEmail: '',
  userRole: null,
  userId: null,
  photoUrl: null,  // 👈 Tambah ini
  loading: true,

  setAuth: (email, role, userId, photoUrl = null) => 
    set({ 
      isLoggedIn: true, 
      userEmail: email, 
      userRole: role,
      userId: userId,
      photoUrl: photoUrl,  // 👈 Tambah ini
      loading: false 
    }),

  clearAuth: () => 
    set({ 
      isLoggedIn: false, 
      userEmail: '', 
      userRole: null,
      userId: null,
      photoUrl: null,  // 👈 Tambah ini
      loading: false 
    }),

  checkAuth: async () => {
    try {
      set({ loading: true })
      
      const { data: { session } } = await supabaseBrowser.auth.getSession()

      if (session?.user) {
        const { data: roleData } = await supabaseBrowser
          .from('user_roles')
          .select('role, photo_url')  // 👈 Tambah photo_url
          .eq('user_id', session.user.id)
          .maybeSingle()

        set({
          isLoggedIn: true,
          userEmail: session.user.email || '',
          userRole: roleData?.role || null,
          userId: session.user.id,
          photoUrl: roleData?.photo_url || null,  // 👈 Tambah ini
          loading: false
        })
      } else {
        set({
          isLoggedIn: false,
          userEmail: '',
          userRole: null,
          userId: null,
          photoUrl: null,  // 👈 Tambah ini
          loading: false
        })
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      set({
        isLoggedIn: false,
        userEmail: '',
        userRole: null,
        userId: null,
        photoUrl: null,  // 👈 Tambah ini
        loading: false
      })
    }
  },

  logout: async () => {
    try {
      await supabaseBrowser.auth.signOut()
      set({
        isLoggedIn: false,
        userEmail: '',
        userRole: null,
        userId: null,
        loading: false
      })
    } catch (error) {
      console.error('Logout error:', error)
      set({
        isLoggedIn: false,
        userEmail: '',
        userRole: null,
        userId: null,
        loading: false
      })
    }
  }
}))