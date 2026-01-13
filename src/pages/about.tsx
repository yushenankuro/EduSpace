import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

// Type definitions
interface GalleryPhoto {
  title: string;
  description: string;
  image: string;
}

interface Subject {
  name: string;
  time: string;
}

interface DaySchedule {
  day: string;
  dayIndo: string;
  color: string;
  subjects: Subject[];
}

interface Achievement {
  icon: string;
  title: string;
  year: string;
  desc: string;
  bgColor: string;
}

// Image component dengan fallback terpisah untuk Hero dan Gallery
const HeroImageWithFallback = ({ 
  src, 
  alt, 
  ...props 
}: any) => {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? "/images/kbm.jpg" : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
};

// Komponen khusus untuk gallery images
const GalleryImage = ({ 
  src, 
  alt, 
  ...props 
}: any) => {
  const [error, setError] = useState(false);

  // Fallback khusus untuk gallery
  const getFallbackImage = () => {
    // Fallback ke placeholder yang cocok untuk gallery
    return "/images/gallery-placeholder.jpg";
  };

  return (
    <Image
      src={error ? getFallbackImage() : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
};

const About: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"mission" | "vision">("mission");

  // Gallery photos data - FOTO GALLERY YANG BEDA DARI HERO!
  const galleryPhotos: GalleryPhoto[] = [
    {
      title: "Kegiatan Belajar Mengajar",
      description: "Suasana belajar yang kondusif dan menyenangkan",
      image: "/images/kbm.jpg",
    },
    {
      title: "Study Tour 2024",
      description: "Kunjungan edukatif ke museum nasional",
      image: "/images/mpls.jpg",
    },
    {
      title: "Perayaan HUT RI",
      description: "Memeriahkan hari kemerdekaan Indonesia",
      image: "/images/hutri.jpeg",
    },
    {
      title: "Kegiatan Ekstrakurikuler",
      description: "Mengembangkan bakat dan minat siswa",
      image: "/images/hutri.jpeg",
    },
    {
      title: "Class Meeting",
      description: "Kompetisi antar kelas yang seru",
      image: "/images/kbm.jpg",
    },
    {
      title: "MPLS 2024",
      description: "Kegiatan MPLS pada tahun 2024",
      image: "/images/mpls.jpg",
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
  const weeklySchedule: DaySchedule[] = [
    {
      day: "Monday",
      dayIndo: "Senin",
      color: "from-rose-400 to-red-300",
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
      color: "from-amber-400 to-orange-300",
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
      color: "from-emerald-400 to-teal-300",
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
      color: "from-sky-400 to-cyan-300",
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
      color: "from-violet-400 to-purple-300",
      subjects: [
        { name: "Mulok", time: "08.00-09.20" },
        { name: "Istirahat", time: "09.20-10.00" },
        { name: "PJOK", time: "10.00-11.00" },
        { name: "Matematika", time: "11.00-12.00" },
      ],
    },
  ];

  // Class achievements
  const achievements: Achievement[] = [
    {
      icon: "🏆",
      title: "Juara 2 Lomba Kebersihan",
      year: "2024",
      desc: "Tingkat Provinsi",
      bgColor: "from-amber-400 to-orange-500"
    },
    {
      icon: "🥇",
      title: "Best Class Award",
      year: "2024",
      desc: "Prestasi Terbaik di kelas 10",
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
      year: "2025",
      desc: "Rata-rata Nilai Tertinggi",
      bgColor: "from-green-400 to-emerald-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />

      {/* Hero Banner */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 animate-fadeInUp">
          {/* Teks di Kiri */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="relative inline-block mb-4 animate-slideInLeft">
              <h1 className="text-4xl md:text-5xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                HELLO, WE ARE
              </h1>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-expandWidth"></div>
            </div>
            
<h2 className="text-3xl md:text-4xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent mb-6 animate-slideInLeft animation-delay-200">
  XI RPL 1
</h2>
            
            <p className="text-lg md:text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-8 leading-relaxed animate-slideInLeft animation-delay-400">
              Kelas unggulan dengan fokus pada pengembangan software, web development, dan teknologi terkini. 
              Bersama membangun masa depan digital Indonesia!
            </p>
            
            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start animate-slideInLeft animation-delay-600">
              {['Web Development', 'Mobile Apps', 'UI/UX Design', 'Database', 'Cloud Computing'].map((tech, idx) => (
                <div 
                  key={tech}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 animate-float hover:scale-110 cursor-pointer"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <span className="font-medium text-black flex items-center gap-2">
                    {tech === 'Web Development' && '🌐'}
                    {tech === 'Mobile Apps' && '📱'}
                    {tech === 'UI/UX Design' && '🎨'}
                    {tech === 'Database' && '💾'}
                    {tech === 'Cloud Computing' && '☁️'}
                    {tech}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gambar Blob Shape di Kanan */}
          <div className="lg:w-1/2 relative animate-slideInRight">
            {/* Blob Background */}
            <div className="relative w-full max-w-md mx-auto">
              {/* Animated Blob Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-[40%] blur-3xl animate-pulse"></div>
              
              {/* Main Blob Container */}
              <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto hover:scale-105 transition-transform duration-500">
                {/* Blob Shape Mask */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-full animate-blobMove"
                  style={{
                    clipPath: 'polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%)',
                  }}
                >
                  {/* Image inside blob */}
                  <div className="absolute inset-4 overflow-hidden rounded-full">
                    <HeroImageWithFallback
                      src="/images/about-header.jpeg"
                      alt="XI RPL 1 Class"
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-transparent to-purple-500/30"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Achievements */}
        <div className={`mt-20 mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-10 animate-fadeInDown">
            <div className="inline-flex items-center gap-3 mb-4 animate-bounce-slow">
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
                className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all duration-700 hover:scale-105 hover:rotate-1 cursor-pointer ${isVisible ? 'opacity-100 translate-y-0 animate-zoomIn' : 'opacity-0 translate-y-8'}`}
                style={{transitionDelay: `${idx * 150}ms`, animationDelay: `${idx * 0.1}s`}}
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
          <div className="text-center mb-10 animate-fadeInDown">
            <div className="inline-flex items-center gap-3 mb-4 animate-bounce-slow">
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

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-scaleIn">
            <div className="relative">
              {/* Main Image Display */}
              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 mb-8 group shadow-lg">
                {/* Lazy loaded gallery images - PAKAI GalleryImage BUKAN ImageWithFallback */}
                {galleryPhotos.map((photo, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ${
                      currentSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    <GalleryImage
                      src={photo.image}
                      alt={photo.title}
                      fill
                      className="object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}

                {/* Overlay untuk teks lebih readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-xl transition-all flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 z-10 animate-slideInLeft"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-xl transition-all flex items-center justify-center hover:scale-110 hover:shadow-2xl active:scale-95 z-10 animate-slideInRight"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Slide Counter */}
                <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm font-medium z-10">
                  {currentSlide + 1} / {galleryPhotos.length}
                </div>
              </div>

              {/* Caption */}
              <div className="text-center mb-8 px-4 animate-fadeInUp">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                  {galleryPhotos[currentSlide].title}
                </h3>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                  {galleryPhotos[currentSlide].description}
                </p>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap animate-fadeInUp">
                {galleryPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 hover:scale-125 ${currentSlide === index
                        ? "w-8 bg-gradient-to-r from-teal-500 to-blue-500 animate-pulse"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                      } h-2 rounded-full`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className={`bg-white rounded-3xl p-8 md:p-12 shadow-2xl mb-16 transition-all duration-1000 hover:shadow-3xl ${isVisible ? 'opacity-100 animate-scaleIn' : 'opacity-0'}`}>
          <div className="text-center mb-12 animate-fadeInDown">
            <div className="inline-flex items-center gap-3 mb-4 animate-bounce-slow">
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

          <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {weeklySchedule.map((day, index) => (
              <div
                key={index}
                className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 cursor-pointer ${isVisible ? 'opacity-100 animate-zoomIn' : 'opacity-0'}`}
                style={{transitionDelay: `${index * 100}ms`, animationDelay: `${index * 0.15}s`}}
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

        {/* Vision & Mission Section */}
        <div className={`mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-12 animate-fadeInDown">
            <div className="inline-flex items-center gap-3 mb-4 animate-bounce-slow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-2xl">
                💡
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Mission & Vision
              </h2>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Tujuan dan pandangan masa depan XI RPL 1
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-10 animate-fadeInUp">
            <div className="bg-white rounded-full p-2 shadow-lg inline-flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveTab("mission")}
                className={`px-6 sm:px-8 py-3 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 ${activeTab === "mission"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-blue-500"
                  }`}
              >
                Mission
              </button>
              <button
                onClick={() => setActiveTab("vision")}
                className={`px-6 sm:px-8 py-3 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 ${activeTab === "vision"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-purple-500"
                  }`}
              >
                Vision
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative">

            {/* Sticky Note Container */}
            <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
              {/* Mission Sticky Note */}
              <div className={`lg:absolute lg:top-0 lg:left-0 transition-all duration-700 transform ${activeTab === "mission"
                  ? "opacity-100 translate-x-0 rotate-0 z-10 scale-100"
                  : "lg:opacity-0 lg:-translate-x-12 lg:-rotate-12 z-0 lg:scale-90"
                }`}>
                <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto lg:mx-0 hover:scale-105 transition-transform duration-500">
                  {/* Sticky Note Paper */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg shadow-2xl transform lg:rotate-3 hover:shadow-3xl transition-shadow duration-300">
                    {/* Pin */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg"></div>
                      <div className="w-4 h-4 bg-white/30 rounded-full absolute inset-2"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 sm:p-8 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xl sm:text-2xl">
                          📝
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-blue-800">Mission</h3>
                      </div>
                      
                      <div className="space-y-4 flex-grow overflow-y-auto">
                        {[
                          "Menyelenggarakan pembelajaran berbasis teknologi",
                          "Mengembangkan keterampilan programming",
                          "Membangun jiwa kewirausahaan",
                          "Menerapkan nilai kejujuran dan disiplin",
                          "Menciptakan lingkungan belajar kondusif"
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-1">
                              ✓
                            </div>
                            <p className="text-blue-900 text-sm sm:text-base">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-lg blur-md -z-10"></div>
                </div>
              </div>

              {/* Vision Sticky Note */}
              <div className={`lg:absolute lg:top-0 lg:right-0 transition-all duration-700 transform ${activeTab === "vision"
                  ? "opacity-100 translate-x-0 rotate-0 z-10 scale-100"
                  : "lg:opacity-0 lg:translate-x-12 lg:rotate-12 z-0 lg:scale-90"
                }`}>
                <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto lg:mx-0 hover:scale-105 transition-transform duration-500">
                  {/* Sticky Note Paper */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-50 rounded-lg shadow-2xl transform lg:-rotate-3 hover:shadow-3xl transition-shadow duration-300">
                    {/* Pin */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full shadow-lg"></div>
                      <div className="w-4 h-4 bg-white/30 rounded-full absolute inset-2"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 sm:p-8 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-xl sm:text-2xl">
                          🔭
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-purple-800">Vision</h3>
                      </div>
                      
                      <div className="space-y-6 flex-grow overflow-y-auto">
                        {[
                          {
                            icon: "🎯",
                            title: "Unggul dalam Rekayasa Perangkat Lunak",
                            desc: "Menjadi kelas terdepan di bidang RPL"
                          },
                          {
                            icon: "🎓",
                            title: "Lulusan Kompeten & Inovatif",
                            desc: "Menghasilkan alumni siap kerja & berinovasi"
                          },
                          {
                            icon: "💖",
                            title: "Karakter Berakhlak Mulia",
                            desc: "Membangun pribadi yang berintegritas tinggi"
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                              {item.icon}
                            </div>
                            <div>
                              <p className="font-bold text-purple-900 mb-1 text-sm sm:text-base">{item.title}</p>
                              <p className="text-purple-700 text-xs sm:text-sm">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-lg blur-md -z-10"></div>
                </div>
              </div>

              {/* Center Spacing for Desktop */}
              <div className="h-80 md:h-96 flex items-center justify-center lg:w-96">
                <p className="text-slate-800 text-lg text-center">
                  {activeTab === "mission" ? "Misi kami adalah..." : "Visi kami adalah..."}
                </p>
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
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        
        @keyframes blobMove {
          0%, 100% {
            clip-path: polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%);
          }
          25% {
            clip-path: polygon(45% 5%, 78% 15%, 95% 48%, 88% 82%, 62% 95%, 28% 98%, 8% 72%, 5% 38%, 22% 8%);
          }
          50% {
            clip-path: polygon(55% 3%, 88% 18%, 98% 50%, 90% 85%, 65% 98%, 30% 95%, 5% 75%, 2% 40%, 18% 10%);
          }
          75% {
            clip-path: polygon(48% 8%, 80% 20%, 92% 52%, 85% 80%, 60% 92%, 25% 93%, 10% 68%, 8% 35%, 25% 5%);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% { 
            transform: translateY(0);
          }
          50% { 
            transform: translateY(-5px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animate-zoomIn {
          animation: zoomIn 0.6s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        
        .animate-expandWidth {
          animation: expandWidth 1s ease-out forwards;
        }
        
        .animate-blobMove {
          animation: blobMove 8s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default About;