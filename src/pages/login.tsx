import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useAuthStore } from '@/store/authStore'

const Login: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Get state from Zustand
  const { isLoggedIn, userRole } = useAuthStore()

  // ===============================
  // REDIRECT IF ALREADY LOGGED IN
  // ===============================
  useEffect(() => {
    if (isLoggedIn && userRole) {
      // Redirect based on role
      switch (userRole) {
        case 'admin':
          router.replace('/dashboard')
          break
        case 'guru':
          router.replace('/dashboard/grades')
          break
        case 'siswa':
          router.replace('/subject')
          break
        default:
          router.replace('/subject')
      }
    }
  }, [isLoggedIn, userRole, router])

  // ===============================
  // HANDLE LOGIN
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } =
        await supabaseBrowser.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (authError || !data.user) {
        throw new Error('Email atau password salah!')
      }

      // ===============================
      // FETCH ROLE
      // ===============================
      const { data: roleData, error: roleError } = await supabaseBrowser
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (roleError || !roleData) {
        console.error('Role fetch error:', roleError)
        // Default redirect jika role tidak ditemukan
        router.replace('/subject')
        return
      }

      // Wait for auth listener to update Zustand store
      await new Promise(resolve => setTimeout(resolve, 300))

      // ===============================
      // REDIRECT BASED ON ROLE
      // ===============================
      const redirectPath = router.query.redirect as string | undefined

      if (redirectPath) {
        router.replace(redirectPath)
        return
      }

      switch (roleData.role) {
        case 'admin':
          router.replace('/dashboard')
          break
        case 'guru':
          router.replace('/dashboard/grades')
          break
        case 'siswa':
          router.replace('/subject')
          break
        default:
          router.replace('/subject')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Terjadi kesalahan saat login')
      setLoading(false)
    }
  }

  // Show loading if already logged in (redirecting)
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <div className="text-white text-xl">Redirecting...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Selamat Datang!
            </h2>
            <p className="text-slate-600">Login untuk melanjutkan</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                placeholder="contoh@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                placeholder="Masukkan password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <Link 
                href="/forgot-password" 
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
              >
                🔑 Lupa Password?
              </Link>
              <span className="hidden sm:inline text-slate-400">|</span>
              <Link 
                href="/register" 
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
              >
                ✨ Daftar Akun Baru
              </Link>
            </div>
          </div>

          {/* Info Role */}
          <div className="mt-6 bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-600 text-center leading-relaxed">
              💡 <strong>Info:</strong> Setelah login, Anda akan diarahkan sesuai role:
              <br />
              <span className="inline-block mt-2">
                <span className="text-teal-600 font-medium">Admin</span> → Dashboard | 
                <span className="text-purple-600 font-medium"> Guru</span> → Nilai | 
                <span className="text-blue-600 font-medium"> Siswa</span> → Mata Pelajaran
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login