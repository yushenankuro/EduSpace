import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabaseBrowser } from '@/lib/supabase-browser';
import useAuthStore from '@/store/authStore';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, checkAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect jika sudah login
  React.useEffect(() => {
    if (isLoggedIn) {
      const redirect = router.query.redirect as string || '/';
      router.push(redirect);
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Get user role untuk menentukan redirect
        const { data: roleData } = await supabaseBrowser
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        const role = roleData?.role;
        
        // Redirect berdasarkan role
        if (role === 'admin' || role === 'guru') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
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
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in-delay {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.2s both;
        }
        
        input:focus {
          transform: scale(1.01);
          transition: transform 0.2s ease;
        }
        
        button:active {
          transform: scale(0.98);
        }
      `}</style>
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-8">
        <div className="flex bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl animate-slide-up">
          {/* Bagian Kiri: Gambar Gradient dengan Teks */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-10 flex-col justify-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4 animate-fade-in">Selamat Datang!</h1>
              <p className="text-lg opacity-90 animate-fade-in-delay">Login untuk melanjutkan pembelajaran Anda</p>
            </div>
          </div>

          {/* Bagian Kanan: Form Login */}
          <div className="w-full md:w-1/2 p-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Login</h2>
            <p className="text-slate-600 text-center mb-6">
              Masuk ke akun Anda untuk mengakses konten
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
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
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
              <p className="text-slate-500 text-sm mt-2">
                <Link href="/forgot-password" className="hover:text-slate-700">
                  Lupa password?
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