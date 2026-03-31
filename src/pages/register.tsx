import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabaseBrowser } from '@/lib/supabase-browser';

const RegisterPage: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      // Registrasi user ke Supabase Auth
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'guru' // Tambahkan role di metadata
          }
        }
      });

      if (error) {
        console.error('SignUp error:', error);
        throw error;
      }
      
      if (data.user) {
        // Tunggu sebentar untuk memastikan trigger berjalan
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSuccess('Registrasi berhasil! Silakan login.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Register error:', err);
      
      // Tampilkan pesan error yang lebih user-friendly
      if (err.message?.includes('duplicate key')) {
        setError('Email sudah terdaftar. Silakan gunakan email lain.');
      } else if (err.message?.includes('Database error')) {
        setError('Terjadi kesalahan pada sistem. Silakan coba lagi nanti.');
      } else {
        setError(err.message || 'Registrasi gagal. Periksa kembali data Anda.');
      }
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
        <div className="flex bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden animate-slide-up">

          {/* Kiri */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-300 via-teal-300 to-sky-300 p-10 flex-col justify-center text-white">
            <h1 className="text-4xl font-bold mb-4 animate-fade-in">
              Buat Akun Baru
            </h1>
            <p className="text-lg opacity-90 animate-fade-in-delay">
              Daftar untuk menjadi Guru atau Admin
            </p>
            <div className="mt-8 text-sm opacity-80 animate-fade-in-delay">
              <p>✓ Setelah daftar, Anda akan otomatis memiliki akses sebagai Guru</p>
              <p>✓ Untuk menjadi Admin, hubungi Super Admin</p>
            </div>
          </div>

          {/* Kanan */}
          <div className="w-full md:w-1/2 p-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">
              Register
            </h2>
            <p className="text-slate-600 text-center mb-6">
              Isi data untuk membuat akun Guru
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  placeholder="Masukkan nama lengkap"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  placeholder="nama@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  placeholder="•••••••• (min. 6 karakter)"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-slate-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Login disini
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;