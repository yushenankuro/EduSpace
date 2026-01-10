import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

const About: React.FC = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Gallery photos data
  const galleryPhotos = [
    {
      title: "Kegiatan Belajar Mengajar",
      description: "Suasana belajar yang kondusif dan menyenangkan",
      image: "/images/gallery/class-1.jpg",
    },
    {
      title: "Study Tour 2024",
      description: "Kunjungan edukatif ke museum nasional",
      image: "/images/gallery/study-tour.jpg",
    },
    {
      title: "Perayaan HUT RI",
      description: "Memeriahkan hari kemerdekaan Indonesia",
      image: "/images/gallery/independence.jpg",
    },
    {
      title: "Kegiatan Ekstrakurikuler",
      description: "Mengembangkan bakat dan minat siswa",
      image: "/images/gallery/extracurricular.jpg",
    },
    {
      title: "Class Meeting",
      description: "Kompetisi antar kelas yang seru",
      image: "/images/gallery/class-meeting.jpg",
    },
    {
      title: "Wisuda Angkatan 2024",
      description: "Pelepasan siswa kelas XII",
      image: "/images/gallery/graduation.jpg",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Weekly schedule data
  const weeklySchedule = [
    {
      day: "Monday",
      dayIndo: "Senin",
      color: "from-red-400 to-red-600",
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
      color: "from-orange-400 to-orange-600",
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
      color: "from-green-400 to-green-600",
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
      color: "from-blue-400 to-blue-600",
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
      color: "from-purple-400 to-purple-600",
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
      desc: "Tingkat Provinsi"
    },
    {
      icon: "🥇",
      title: "Best Class Award",
      year: "2023",
      desc: "Prestasi Terbaik Sekolah"
    },
    {
      icon: "💻",
      title: "Hackathon Champion",
      year: "2024",
      desc: "Regional Competition"
    },
    {
      icon: "📚",
      title: "Academic Excellence",
      year: "2024",
      desc: "Rata-rata Nilai Tertinggi"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />

      {/* Hero Banner */}
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">
        <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600 rounded-3xl p-12 shadow-2xl text-white text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">XI RPL 1 🚀</h1>
          <p className="text-2xl mb-6 opacity-90">Rekayasa Perangkat Lunak</p>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Kelas unggulan dengan fokus pada pengembangan software, web development, dan teknologi terkini. 
            Bersama membangun masa depan digital Indonesia!
          </p>
        </div>
        
        {/* Class Achievements */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">
            🏆 Prestasi Kelas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{achievement.title}</h3>
                <p className="text-teal-600 font-semibold mb-1">{achievement.year}</p>
                <p className="text-sm text-slate-600">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-10">
            📸 Galeri Kenangan Kelas
          </h2>

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="relative">
              {/* Main Image Display */}
              <div className="relative h-[500px] rounded-2xl overflow-hidden bg-slate-100 mb-6 group">
                {/* Placeholder gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg
                      className="w-24 h-24 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xl font-semibold mb-2">{galleryPhotos[currentSlide].title}</p>
                    <p className="text-sm opacity-80">Simpan foto di /public/images/gallery/</p>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Slide Counter */}
                <div className="absolute bottom-4 right-4 bg-slate-800/80 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentSlide + 1} / {galleryPhotos.length}
                </div>
              </div>

              {/* Caption */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {galleryPhotos[currentSlide].title}
                </h3>
                <p className="text-slate-600">
                  {galleryPhotos[currentSlide].description}
                </p>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2">
                {galleryPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all ${
                      currentSlide === index
                        ? "w-8 bg-teal-500"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    } h-2 rounded-full`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Class Structure */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-10 mb-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            👔 Struktur Organisasi Kelas
          </h2>

          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* WALI KELAS */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 mb-3 border-2 border-white/30">
              <p className="text-white text-sm mb-1 text-center">Wali Kelas</p>
              <p className="font-bold text-white text-xl">Latifah S.Pd</p>
            </div>

            <div className="w-1 h-12 bg-white/50"></div>
            <div className="w-72 h-1 bg-white/50"></div>

            <div className="flex gap-[260px]">
              <div className="w-1 h-8 bg-white/50"></div>
              <div className="w-1 h-8 bg-white/50"></div>
            </div>

            {/* KETUA & WAKIL */}
            <div className="flex gap-40">
              <div className="flex flex-col items-center">
                <div className="bg-yellow-400 rounded-2xl px-8 py-4 shadow-xl border-4 border-yellow-300">
                  <p className="text-slate-700 text-sm mb-1 text-center">Ketua Kelas</p>
                  <p className="font-bold text-slate-900 text-lg">Aziz</p>
                </div>
                <div className="w-1 h-12 bg-white/50 mt-3"></div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-yellow-300 rounded-2xl px-8 py-4 shadow-xl border-4 border-yellow-200">
                  <p className="text-slate-700 text-sm mb-1 text-center">Wakil Ketua</p>
                  <p className="font-bold text-slate-900 text-lg">Desy</p>
                </div>
                <div className="w-1 h-12 bg-white/50 mt-3"></div>
              </div>
            </div>

            <div className="w-72 h-1 bg-white/50"></div>

            <div className="flex gap-[260px]">
              <div className="w-1 h-8 bg-white/50"></div>
              <div className="w-1 h-8 bg-white/50"></div>
            </div>

            {/* SEKRETARIS & BENDAHARA */}
            <div className="flex gap-40">
              <div className="flex flex-col items-center">
                <div className="bg-white/90 rounded-2xl px-6 py-3 shadow-xl mb-3">
                  <p className="text-slate-700 text-sm mb-1 text-center">Sekretaris</p>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900 text-center">Ling</p>
                    <p className="font-semibold text-slate-900 text-center">Vina</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white/90 rounded-2xl px-6 py-3 shadow-xl mb-3">
                  <p className="text-slate-700 text-sm mb-1 text-center">Bendahara</p>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900 text-center">Fatah</p>
                    <p className="font-semibold text-slate-900 text-center">Afif</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-3xl p-10 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-10">
            📅 Jadwal Pelajaran Mingguan
          </h2>

          <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-6">
            {weeklySchedule.map((day, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Day Header with gradient */}
                <div className={`bg-gradient-to-r ${day.color} text-white text-center py-4`}>
                  <h3 className="text-2xl font-bold">{day.dayIndo}</h3>
                  <p className="text-sm opacity-90">{day.day}</p>
                </div>

                {/* Subjects List */}
                <div className="p-4 bg-slate-50 space-y-2">
                  {day.subjects.map((subject, idx) => (
                    <div
                      key={idx}
                      className={`${
                        subject.name === "Istirahat"
                          ? "bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-500"
                          : "bg-white border-l-4 border-slate-200"
                      } rounded-lg p-3 hover:shadow-md transition-all`}
                    >
                      <p
                        className={`font-semibold text-sm ${
                          subject.name === "Istirahat"
                            ? "text-amber-800"
                            : "text-slate-800"
                        }`}
                      >
                        {subject.name === "Istirahat" ? "☕ " : "📚 "}
                        {subject.name}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
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
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-semibold text-slate-800 mb-2">
                  ⚠️ Catatan Penting:
                </p>
                <ul className="text-slate-600 text-sm space-y-1">
                  <li>• Setiap pelajaran di Lab wajib menggunakan wearpack</li>
                  <li>• Hari Rabu: Datang lebih awal untuk kegiatan Opsih</li>
                  <li>• Warna kuning menandakan waktu istirahat</li>
                  <li>• Jangan lupa bawa laptop untuk mata pelajaran praktik</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Class Motto / Vision */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl p-12 shadow-2xl text-white text-center">
          <div className="text-6xl mb-4">💡</div>
          <h2 className="text-3xl font-bold mb-4">Visi Kelas</h2>
          <p className="text-xl max-w-3xl mx-auto italic">
            "Menjadi kelas yang unggul dalam teknologi, kreatif dalam inovasi, dan solid dalam kekeluargaan. 
            Bersama membangun masa depan digital Indonesia yang lebih baik!"
          </p>
          <div className="mt-8 flex justify-center gap-6 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <p className="font-bold">🎯 Inovatif</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <p className="font-bold">💪 Kolaboratif</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <p className="font-bold">🚀 Progresif</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;