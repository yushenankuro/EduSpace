import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface AuthState {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any; user: User | null; role: string | null }>;
  fetchUserRole: (userId: string) => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isLoading: true,

      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        try {
          set({ isLoading: true });

          const { data: { user }, error } = await supabaseBrowser.auth.getUser();

          if (error || !user) {
            set({ user: null, role: null, isLoading: false });
            return;
          }

          const role = await get().fetchUserRole(user.id);
          set({ user, role, isLoading: false });

        } catch {
          set({ user: null, role: null, isLoading: false });
        }
      },

      fetchUserRole: async (userId: string) => {
        try {
          const { data, error } = await supabaseBrowser
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) {
            console.error('Error fetching user role:', error);
            set({ role: null });
            return null;
          }

          const role = (data?.role === 'admin' || data?.role === 'guru')
            ? data.role
            : null;

          set({ role });
          return role;

        } catch (error) {
          console.error('Fetch role error:', error);
          set({ role: null });
          return null;
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabaseBrowser.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ isLoading: false });
            return { error, user: null, role: null };
          }

          if (data.user) {
            const role = await get().fetchUserRole(data.user.id);
            set({ user: data.user, role, isLoading: false });
            return { error: null, user: data.user, role };
          }

          set({ isLoading: false });
          return { error: null, user: null, role: null };

        } catch (error) {
          set({ isLoading: false });
          return { error, user: null, role: null };
        }
      },

      logout: async () => {
        try {
          await supabaseBrowser.auth.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, role: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false
        }
      },
    }
  )
);