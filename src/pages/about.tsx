import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

const About: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Gallery photos data
  const galleryPhotos = [
    {
      title: "Kegiatan Belajar Mengajar",
      description: "Suasana belajar yang kondusif dan menyenangkan",
      image: "/images/kbm.jpg",
    },
    {
      title: "Study Tour 2024",
      description: "Kunjungan edukatif ke museum nasional",
      image: "/images/study-tour.jpg",
    },
    {
      title: "Perayaan HUT RI",
      description: "Memeriahkan hari kemerdekaan Indonesia",
      image: "/images/independence.jpg",
    },
    {
      title: "Kegiatan Ekstrakurikuler",
      description: "Mengembangkan bakat dan minat siswa",
      image: "/images/extracurricular.jpg",
    },
    {
      title: "Class Meeting",
      description: "Kompetisi antar kelas yang seru",
      image: "/images/class-meeting.jpg",
    },
    {
      title: "Wisuda Angkatan 2024",
      description: "Pelepasan siswa kelas XII",
      image: "/images/graduation.jpg",
    },
  ];

  // Auto slide gallery
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [galleryPhotos.length]);

  // Intersection Observer for animations
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle image error
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Weekly schedule data
  const weeklySchedule = [
    {
      day: "Monday",
      dayIndo: "Senin",
      color: "from-rose-200 to-red-300",
      subjects: [
        { name: "Mapil", time: "08.00-09.20" },
        { name: "Istirahat", time: "09.20-10.00" },
        { name: "Bahasa Indonesia", time: "10.00-12.20" },
        { name: "Istirahat", time: "12.20-13.20" },
        { name: "Pendidikan Agama", time: "13.20-14.40" },
      ],
    },
    {
      day: "Tuesday",
      dayIndo: "Selasa",
      color: "from-amber-200 to-orange-300",
      subjects: [
        { name: "P.K.K", time: "08.00-09.20" },
        { name: "Istirahat", time: "09.20-10.00" },
        { name: "P.K.K", time: "10.00-11.00" },
        { name: "Pemrograman Web", time: "11.00-12.20" },
        { name: "Istirahat", time: "12.20-13.20" },
        { name: "Pemrograman Web", time: "13.20-14.40" },
      ],
    },
    {
      day: "Wednesday",
      dayIndo: "Rabu",
      color: "from-emerald-200 to-teal-300",
      subjects: [
        { name: "Opsih", time: "08.00-09.20" },
        { name: "Basis Data", time: "09.20-11.00" },
        { name: "Pemrograman Mobile", time: "11.00-12.20" },
        { name: "Istirahat", time: "12.20-13.20" },
        { name: "PPKN", time: "13.20-14.40" },
      ],
    },
    {
      day: "Thursday",
      dayIndo: "Kamis",
      color: "from-sky-200 to-cyan-300",
      subjects: [
        { name: "Pemrograman Desktop", time: "08.00-10.00" },
        { name: "Bahasa Inggris", time: "10.00-11.00" },
        { name: "Istirahat", time: "11.00-12.20" },
        { name: "Sejarah", time: "12.20-14.40" },
      ],
    },
    {
      day: "Friday",
      dayIndo: "Jumat",
      color: "from-violet-200 to-purple-300",
      subjects: [
        { name: "Mulok", time: "08.00-09.20" },
        { name: "Istirahat", time: "09.20-10.00" },
        { name: "PJOK", time: "10.00-11.00" },
        { name: "Matematika", time: "11.00-12.00" },
      ],
    },
  ];

  // Class achievements
  const achievements = [
    {
      icon: "🏆",
      title: "Juara 1 Lomba Web Design",
      year: "2024",
      desc: "Tingkat Provinsi",
      bgColor: "from-amber-400 to-orange-500"
    },
    {
      icon: "🥇",
      title: "Best Class Award",
      year: "2023",
      desc: "Prestasi Terbaik Sekolah",
      bgColor: "from-blue-400 to-cyan-500"
    },
    {
      icon: "💻",
      title: "Hackathon Champion",
      year: "2024",
      desc: "Regional Competition",
      bgColor: "from-purple-400 to-pink-500"
    },
    {
      icon: "📚",
      title: "Academic Excellence",
      year: "2024",
      desc: "Rata-rata Nilai Tertinggi",
      bgColor: "from-green-400 to-emerald-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />

      {/* Hero Banner */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-blue-600 to-purple-700 p-10 md:p-14 shadow-2xl mb-12 text-white">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="text-6xl md:text-7xl animate-pulse">🚀</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
              XI RPL 1
            </h1>
            <p className="text-2xl md:text-3xl mb-6 font-semibold opacity-90">
              Rekayasa Perangkat Lunak
            </p>
            <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto leading-relaxed">
              Kelas unggulan dengan fokus pada pengembangan software, web development, dan teknologi terkini. 
              Bersama membangun masa depan digital Indonesia!
            </p>
            
            {/* Floating elements */}
            <div className="flex justify-center mt-8 gap-6 flex-wrap">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full animate-float">
                <span className="font-medium">💻 Web Development</span>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full animate-float" style={{animationDelay: '0.2s'}}>
                <span className="font-medium">📱 Mobile Apps</span>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full animate-float" style={{animationDelay: '0.4s'}}>
                <span className="font-medium">🤖 AI & IoT</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Class Achievements */}
        <div className={`mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-2xl">
                🏆
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Prestasi Kelas
              </h2>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Pencapaian luar biasa yang telah diraih oleh siswa-siswa XI RPL 1
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, idx) => (
              <div 
                key={idx}
                className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all duration-700 hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{transitionDelay: `${idx * 150}ms`}}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${achievement.bgColor}`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4 animate-float" style={{animationDelay: `${idx * 0.1}s`}}>
                    {achievement.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-2">{achievement.title}</h3>
                  <div className="text-sm opacity-90 mb-2">{achievement.desc}</div>
                  <div className="text-lg font-semibold bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 inline-block">
                    {achievement.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Section */}
        <div className={`mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-2xl">
                📸
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Galeri Kenangan Kelas
              </h2>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Momen-momen berharga dalam perjalanan belajar di XI RPL 1
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="relative">
              {/* Main Image Display */}
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 mb-8 group">
                {/* Tampilkan gambar asli atau placeholder jika error */}
                {!imageErrors[currentSlide] ? (
                  <Image
                    src={galleryPhotos[currentSlide].image}
                    alt={galleryPhotos[currentSlide].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    priority={currentSlide === 0}
                    onError={() => handleImageError(currentSlide)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="text-center">
                      <div className="text-8xl mb-4 animate-pulse opacity-20">
                        📷
                      </div>
                      <p className="text-2xl font-bold text-slate-700 mb-2">
                        {galleryPhotos[currentSlide].title}
                      </p>
                      <p className="text-slate-600">
                        {galleryPhotos[currentSlide].description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Overlay untuk teks lebih readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 w-12 h-12 rounded-full shadow-xl transition-all flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 w-12 h-12 rounded-full shadow-xl transition-all flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Slide Counter */}
                <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                  {currentSlide + 1} / {galleryPhotos.length}
                </div>
              </div>

              {/* Caption */}
              <div className="text-center mb-8 px-4">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                  {galleryPhotos[currentSlide].title}
                </h3>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                  {galleryPhotos[currentSlide].description}
                </p>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-3">
                {galleryPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      // Reset error state saat pindah slide
                      if (imageErrors[index]) {
                        setImageErrors(prev => ({ ...prev, [index]: false }));
                      }
                    }}
                    className={`transition-all duration-300 ${currentSlide === index
                        ? "w-8 bg-gradient-to-r from-teal-500 to-blue-500"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                      } h-2 rounded-full hover:scale-125`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className={`bg-white rounded-3xl p-8 md:p-12 shadow-2xl mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-2xl">
                📅
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Jadwal Pelajaran Mingguan
              </h2>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Rencana pembelajaran untuk seminggu ke depan
            </p>
          </div>

          <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-6 mb-8">
            {weeklySchedule.map((day, index) => (
              <div
                key={index}
                className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{transitionDelay: `${index * 100}ms`}}
              >
                {/* Day Header with gradient */}
                <div className={`bg-gradient-to-br ${day.color} text-white text-center py-5 px-4`}>
                  <h3 className="text-2xl font-bold">{day.dayIndo}</h3>
                  <p className="text-sm opacity-90 mt-1">{day.day}</p>
                </div>

                {/* Subjects List */}
                <div className="p-4 bg-gradient-to-b from-slate-50 to-white space-y-3 min-h-[280px]">
                  {day.subjects.map((subject, idx) => (
                    <div
                      key={idx}
                      className={`${subject.name === "Istirahat"
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400"
                          : "bg-white border-l-4 border-slate-200"
                        } rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <p className={`font-semibold text-sm ${subject.name === "Istirahat"
                          ? "text-amber-800"
                          : "text-slate-800"
                        }`}>
                        {subject.name === "Istirahat" ? "☕ " : "📚 "}
                        {subject.name}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {subject.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 border-l-4 border-blue-500 p-6 md:p-8">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg mb-3">
                    📌 Catatan Penting:
                  </p>
                  <ul className="text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <span>Setiap pelajaran di Lab wajib menggunakan wearpack</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <span>Hari Rabu: Datang lebih awal untuk kegiatan Opsih</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <span>Warna kuning menandakan waktu istirahat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <span>Jangan lupa bawa laptop untuk mata pelajaran praktik</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Motto / Vision */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-10 md:p-14 shadow-2xl text-white transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="text-7xl mb-6 animate-float">💡</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
              Visi Kelas
            </h2>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto italic leading-relaxed mb-10">
              "Menjadi kelas yang unggul dalam teknologi, kreatif dalam inovasi, dan solid dalam kekeluargaan. 
              Bersama membangun masa depan digital Indonesia yang lebih baik!"
            </p>
            <div className="flex justify-center gap-6 flex-wrap">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4 hover:bg-white/30 transition-all duration-300 hover:scale-110">
                <p className="font-bold text-lg">🎯 Inovatif</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4 hover:bg-white/30 transition-all duration-300 hover:scale-110" style={{transitionDelay: '0.1s'}}>
                <p className="font-bold text-lg">💪 Kolaboratif</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-8 py-4 hover:bg-white/30 transition-all duration-300 hover:scale-110" style={{transitionDelay: '0.2s'}}>
                <p className="font-bold text-lg">🚀 Progresif</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default About;