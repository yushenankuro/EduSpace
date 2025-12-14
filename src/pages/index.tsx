import React from 'react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />

      {/* Hero Section with Background Image */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-building.jpg"
            alt="School Building"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-sky-400/90"></div>
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Selamat Datang di Website Kita
            </h1>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consequatur, eveniet!
            </p>
            <div className="mt-10 flex gap-4 justify-center">
              <button className="bg-teal-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-teal-600 transition-colors shadow-lg">
                Mulai Sekarang
              </button>
              <button className="bg-white/90 text-slate-800 px-8 py-4 rounded-full text-lg font-medium hover:bg-white transition-colors shadow-lg">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>

        {/* Wave Shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(125 211 252)" className="text-sky-300"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Materi Lengkap</h3>
            <p className="text-slate-600 leading-relaxed">
              Akses semua materi pembelajaran dengan mudah dan terstruktur
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Kolaborasi</h3>
            <p className="text-slate-600 leading-relaxed">
              Berkolaborasi dengan teman sekelas dan guru secara real-time
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Progres Tracking</h3>
            <p className="text-slate-600 leading-relaxed">
              Monitor perkembangan belajar dengan sistem tracking yang akurat
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="text-5xl font-bold text-teal-500 mb-2">1000+</div>
            <p className="text-slate-600 font-medium">Siswa Aktif</p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="text-5xl font-bold text-blue-500 mb-2">50+</div>
            <p className="text-slate-600 font-medium">Guru Berpengalaman</p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="text-5xl font-bold text-purple-500 mb-2">100+</div>
            <p className="text-slate-600 font-medium">Materi Pembelajaran</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Siap Memulai Pembelajaran?
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              Bergabunglah dengan ribuan siswa dan guru yang sudah menggunakan platform kami
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-slate-700 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 transition-colors shadow-lg">
                Daftar Sekarang
              </button>
              <button className="bg-transparent border-2 border-slate-700 text-slate-700 px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-50 transition-colors">
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-700 text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-slate-300">
            © 2024 Website Kelas. Platform pembelajaran terbaik untuk generasi digital.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;