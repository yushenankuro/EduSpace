// store/authStore.tsx
import { create } from 'zustand';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface AuthState {
  email: string | null;
  role: string | null;
  userId: string | null;
  fullName: string | null;
  photoUrl: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  checkAuth: () => Promise<void>;
  setAuth: (email: string, role: string | null, userId: string, fullName?: string | null, photoUrl?: string | null) => void;
  updateProfile: (fullName: string | null, photoUrl: string | null) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  email: null,
  role: null,
  userId: null,
  fullName: null,
  photoUrl: null,
  isLoading: true, // Mulai dengan true karena cek auth di awal
  isLoggedIn: false,
  
  checkAuth: async () => {
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (session) {
        // 1. Fetch role dari user_roles
        const { data: roleData } = await supabaseBrowser
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        // 2. Fetch profile dari user_profiles
        const { data: profileData } = await supabaseBrowser
          .from('user_profiles')
          .select('full_name, photo_url')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        set({
          email: session.user.email,
          role: roleData?.role || null,
          userId: session.user.id,
          fullName: profileData?.full_name || null,
          photoUrl: profileData?.photo_url || null,
          isLoading: false,
          isLoggedIn: true
        });
      } else {
        set({ 
          email: null, 
          role: null, 
          userId: null, 
          fullName: null, 
          photoUrl: null, 
          isLoading: false,
          isLoggedIn: false
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ isLoading: false, isLoggedIn: false });
    }
  },
  
  setAuth: (email, role, userId, fullName = null, photoUrl = null) => {
    set({ 
      email, 
      role, 
      userId, 
      fullName, 
      photoUrl,
      isLoading: false,
      isLoggedIn: true
    });
  },
  
  updateProfile: (fullName, photoUrl) => {
    set({ 
      fullName, 
      photoUrl
    });
  },
  
  clearAuth: () => {
    set({ 
      email: null, 
      role: null, 
      userId: null, 
      fullName: null, 
      photoUrl: null,
      isLoading: false,
      isLoggedIn: false
    });
  },
  
  logout: async () => {
    await supabaseBrowser.auth.signOut();
    get().clearAuth();
  }
}));

export default useAuthStore;