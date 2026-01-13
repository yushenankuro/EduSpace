import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  nama_lengkap: string;
  bidang_pelajaran: string;
  nomor_telepon: string;
  sekolah: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nama_lengkap: '',
    bidang_pelajaran: '',
    nomor_telepon: '',
    sekolah: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok!');
      setLoading(false);
      return;
    }

    // Validasi password minimal 6 karakter
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter!');
      setLoading(false);
      return;
    }

    try {
      // 1. REGISTER MENGGUNAKAN SUPABASE AUTH
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Registrasi gagal. Silakan coba lagi.');
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 2. INSERT DATA KE TABEL user_roles dengan role "guru"
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          { 
            user_id: userId, 
            role: 'guru',
            created_at: new Date().toISOString()
          }
        ]);

      if (roleError) {
        console.error('Error inserting role:', roleError);
        // Jika gagal insert role, kita masih lanjut karena user sudah terdaftar
      }

      // 3. INSERT DATA PROFIL GURU KE TABEL teachers
      const { error: teacherError } = await supabase
        .from('teachers')
        .insert([
          {
            user_id: userId,
            nama_lengkap: formData.nama_lengkap,
            email: formData.email,
            bidang_pelajaran: formData.bidang_pelajaran,
            nomor_telepon: formData.nomor_telepon,
            sekolah: formData.sekolah,
            created_at: new Date().toISOString()
          }
        ]);

      if (teacherError) {
        console.error('Error inserting teacher profile:', teacherError);
        // Jika gagal insert teacher profile, kita masih lanjut karena user sudah terdaftar
      }

      alert('Registrasi berhasil! Silakan cek email untuk verifikasi akun guru Anda.');
      router.push('/login');
      
    } catch (err) {
      console.error('Register error:', err);
      setError('Terjadi kesalahan saat registrasi.');
    } finally {
      setLoading(false);
    }
  };

  // Daftar bidang pelajaran
  const bidangPelajaranOptions = [
    'Matematika',
    'Fisika',
    'Kimia',
    'Biologi',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Sejarah',
    'Geografi',
    'Ekonomi',
    'Sosiologi',
    'Seni Budaya',
    'Pendidikan Jasmani',
    'Teknologi Informasi',
    'Pendidikan Agama',
    'Lainnya'
  ];

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
        
        input:focus, select:focus {
          transform: scale(1.01);
          transition: transform 0.2s ease;
        }
        
        button:active {
          transform: scale(0.98);
        }
      `}</style>
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-8">
        <div className="flex bg-white rounded-lg shadow-lg w-full max-w-5xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl animate-slide-up">
          {/* Bagian Kiri: Gambar Gradient dengan Teks */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-10 flex-col justify-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" opacity="0.5"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6l9-5M12 20l-9-5"></path>
                  </svg>
                </div>
                <h1 className="text-4xl font-bold mb-4 animate-fade-in">Registrasi Guru</h1>
                <p className="text-lg opacity-90 animate-fade-in-delay">Bergabung sebagai tenaga pengajar profesional</p>
              </div>
              
              <div className="space-y-4 mt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Akses dashboard guru lengkap</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Kelola materi dan tugas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Pantau perkembangan siswa</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Berinteraksi dengan siswa</span>
                </div>
              </div>
              
              <div className="mt-12">
                <div className="h-1 w-20 bg-white/30 rounded-full"></div>
                <div className="h-1 w-16 bg-white/50 rounded-full mt-2"></div>
                <div className="h-1 w-12 bg-white/70 rounded-full mt-2"></div>
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Form Registrasi Guru */}
          <div className="w-full md:w-1/2 p-8 animate-fade-in overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-2">Formulir Pendaftaran Guru</h2>
            <p className="text-slate-600 text-center mb-6">
              Lengkapi data diri Anda untuk mendaftar sebagai guru
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-medium mb-2">Nama Lengkap*</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Budi Santoso"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="nama@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <p className="text-slate-500 text-xs mt-1">Minimal 6 karakter</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Konfirmasi Password*</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">Bidang Pelajaran*</label>
                <select
                  name="bidang_pelajaran"
                  value={formData.bidang_pelajaran}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Pilih Bidang Pelajaran</option>
                  {bidangPelajaranOptions.map((bidang, index) => (
                    <option key={index} value={bidang}>{bidang}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">Nomor Telepon*</label>
                  <input
                    type="tel"
                    name="nomor_telepon"
                    value={formData.nomor_telepon}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0812-3456-7890"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Sekolah/Institusi*</label>
                  <input
                    type="text"
                    name="sekolah"
                    value={formData.sekolah}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama sekolah/institusi"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p className="text-sm text-blue-800">
                    Setelah registrasi, akun Anda akan otomatis mendapatkan role <span className="font-semibold">GURU</span>. 
                    Anda akan memiliki akses ke dashboard guru untuk mengelola materi dan tugas.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-md hover:shadow-lg mt-2"
                disabled={loading}
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Sebagai Guru'}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-slate-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login di sini
                </Link>
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Bukan guru?{' '}
                <Link href="/register-siswa" className="text-blue-500 hover:text-blue-600">
                  Daftar sebagai siswa
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