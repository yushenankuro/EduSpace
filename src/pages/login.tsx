import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabaseBrowser } from '@/lib/supabase-browser'

const Login: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


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
          email,
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
        router.replace('/dashboard')
        return
      }

      // ===============================
      // REDIRECT
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
          router.replace('/grades')
          break
        case 'siswa':
          router.replace('/subject')
          break
        default:
          router.replace('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login')
      setLoading(false)
    }
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
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
                className="w-full px-4 py-3 border rounded-xl"
                required
                disabled={loading}
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
                className="w-full px-4 py-3 border rounded-xl"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/forgot-password" className="text-teal-600">
              Lupa Password?
            </Link>
            {' | '}
            <Link href="/register" className="text-teal-600">
              Daftar Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
