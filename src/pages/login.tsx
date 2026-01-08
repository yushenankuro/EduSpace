import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Redirect to dashboard if already logged in
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // LOGIN DENGAN SUPABASE AUTH
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      // return console.log('Login response data:', data, email, password);

      if (authError) {
        throw new Error('Email atau password salah!');
      }

      if (!data.user) {
        throw new Error('Login gagal!');
      }

      // FETCH USER ROLE dari table user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        // Jika tidak ada role, redirect ke dashboard default
        router.push('/dashboard');
        return;
      }

      // Get redirect path from query (jika ada)
      const redirectPath = router.query.redirect as string;

      if (redirectPath) {
        // Redirect ke halaman yang diminta sebelumnya
        router.push(redirectPath);
      } else {
        // REDIRECT BERDASARKAN ROLE
        switch (roleData?.role) {
          case 'admin':
            router.push('/dashboard');
            break;
          case 'guru':
            router.push('/grades');
            break;
          case 'siswa':
            router.push('/subject');
            break;
          default:
            // Default redirect jika role tidak dikenali
            router.push('/dashboard');
        }
      }

    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang!</h2>
            <p className="text-slate-600">Login untuk melanjutkan</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
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
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              disabled={loading}
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
            <p className="text-xs text-slate-600 text-center">
              💡 <strong>Info:</strong> Setelah login, Anda akan diarahkan sesuai role:
              <br />
              <span className="text-teal-600 font-medium">Admin</span> → Dashboard | 
              <span className="text-purple-600 font-medium"> Guru</span> → Nilai | 
              <span className="text-blue-600 font-medium"> Siswa</span> → Mata Pelajaran
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;