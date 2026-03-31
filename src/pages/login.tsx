import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/store/authStore';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user, role, isLoading, login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect jika sudah login
  useEffect(() => {
    console.log('LoginPage - user:', user);
    console.log('LoginPage - role:', role);
    console.log('LoginPage - isLoading:', isLoading);
    
    if (user && !isLoading) {
      if (role === 'admin' || role === 'guru') {
        console.log('Redirecting to dashboard');
        router.push('/dashboard');
      } else if (role === null) {
        console.log('Role not set, waiting...');
      } else {
        console.log('Redirecting to home');
        router.push('/');
      }
    }
  }, [user, role, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.error) {
        throw result.error;
      }
      
      if (result.user && (result.role === 'admin' || result.role === 'guru')) {
        // Redirect akan ditangani oleh useEffect
        console.log('Login successful, waiting for redirect...');
      } else if (result.user) {
        setError('Akun Anda tidak memiliki akses ke sistem ini');
        // Logout jika role tidak valid
        await useAuthStore.getState().logout();
      } else {
        setError('Login gagal. Periksa email dan password Anda.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-sky-300 to-sky-400 min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-8">
        <div className="flex bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-300 via-lavender-200 to-rose-100 p-10 flex-col justify-center text-white">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4">Selamat Datang!</h1>
              <p className="text-lg opacity-90">Login untuk melanjutkan pembelajaran Anda</p>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Login</h2>
            <p className="text-slate-600 text-center mb-6">
              Masuk ke akun Admin / Guru
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="nama@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-slate-600">
                Belum punya akun?{' '}
                <Link href="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                  Daftar disini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;