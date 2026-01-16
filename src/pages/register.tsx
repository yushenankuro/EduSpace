import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { FcGoogle } from 'react-icons/fc'; // Import icon Google

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Password harus sama
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok!');
      setLoading(false);
      return;
    }

    try {
      // REGISTER MENGGUNAKAN SUPABASE AUTH
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      alert('Registrasi berhasil! Silakan cek email untuk verifikasi.');
      router.push('/login');
    } catch (err) {
      console.error('Register error:', err);
      setError('Terjadi kesalahan saat registrasi.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk login dengan Google
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback` // Sesuaikan dengan callback URL
        }
      });

      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Terjadi kesalahan saat login dengan Google.');
      setGoogleLoading(false);
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
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-300 via-lavender-200 to-rose-100 p-10 flex-col justify-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4 animate-fade-in">Bergabung Bersama Kami!</h1>
              <p className="text-lg opacity-90 animate-fade-in-delay">Daftar sekarang dan mulai petualangan belajar Anda</p>
            </div>
          </div>

          {/* Bagian Kanan: Form Registrasi */}
          <div className="w-full md:w-1/2 p-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Daftar Akun Baru</h2>
            <p className="text-slate-600 text-center mb-6">
              Buat akun untuk memulai pembelajaran
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Tombol Login dengan Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all duration-300 font-medium shadow-sm hover:shadow mb-6"
            >
              <FcGoogle className="text-xl" />
              {googleLoading ? 'Memproses...' : 'Daftar dengan Google'}
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau daftar dengan email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="nama@email.com"
                  required
                  disabled={loading || googleLoading}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                  required
                  disabled={loading || googleLoading}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                  required
                  disabled={loading || googleLoading}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                disabled={loading || googleLoading}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-slate-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Login di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;