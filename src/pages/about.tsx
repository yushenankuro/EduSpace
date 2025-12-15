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
      subjects: [
        { name: "Mulok", time: "08.00-09.20" },
        { name: "Istirahat", time: "09.20-10.00" },
        { name: "PJOK", time: "10.00-11.00" },
        { name: "Matematika", time: "11.00-12.00" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Class Gallery - Carousel */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-10">
            Galeri Kenangan Kelas
          </h2>

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            {/* Carousel Container */}
            <div className="relative">
              {/* Main Image Display */}
              <div className="relative h-[500px] rounded-2xl overflow-hidden bg-slate-100 mb-6">
                {/* Placeholder gradient - akan diganti dengan foto asli */}
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
                    <p className="text-xl font-semibold">
                      Placeholder: Simpan foto di /public/images/gallery/
                    </p>
                  </div>
                </div>

                {/* Image would be here */}
                {/* <Image 
                  src={galleryPhotos[currentSlide].image} 
                  alt={galleryPhotos[currentSlide].title}
                  fill
                  className="object-cover"
                /> */}

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
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
              <div className="flex justify-center gap-2 mt-6">
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

        {/* ================= STRUKTUR KELAS ================= */}
        <div className="rounded-3xl p-10 mb-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Struktur Kelas
          </h2>

          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* WALI KELAS */}
            <p className="text-white text-sm mb-2">Wali Kelas</p>
            <div className="bg-white rounded-full px-6 py-3 shadow-lg">
              <p className="font-bold text-slate-800">Latifah S.Pd</p>
            </div>

            <Image
              src="/images/LineVertikal.svg"
              alt=""
              width={20}
              height={40}
            />

            <Image
              src="/images/LineHorizontal.svg"
              alt=""
              width={300}
              height={20}
            />

            <div className="flex gap-[260px] -mt-2">
              <Image
                src="/images/LineKananKiri.svg"
                alt=""
                width={20}
                height={30}
              />
              <Image
                src="/images/LineKananKiri.svg"
                alt=""
                width={20}
                height={30}
              />
            </div>

            <div className="flex gap-[260px] -mt-3">
              <Image src="/images/Circle.svg" alt="" width={20} height={20} />
              <Image src="/images/Circle.svg" alt="" width={20} height={20} />
            </div>

            {/* KETUA & WAKIL */}
            <div className="flex gap-40 mt-2">
              <div className="flex flex-col items-center">
                <p className="text-white text-sm mb-2">Ketua Kelas</p>
                <div className="bg-white rounded-full px-6 py-3 shadow-lg">
                  Aziz
                </div>
                <Image
                  src="/images/LineVertikal.svg"
                  alt=""
                  width={20}
                  height={40}
                />
              </div>

              <div className="flex flex-col items-center">
                <p className="text-white text-sm mb-2">Wakil Ketua</p>
                <div className="bg-white rounded-full px-6 py-3 shadow-lg font-semibold">
                  Desy
                </div>
                <Image
                  src="/images/LineVertikal.svg"
                  alt=""
                  width={20}
                  height={40}
                />
              </div>
            </div>

            <Image
              src="/images/LineHorizontal.svg"
              alt=""
              width={300}
              height={20}
              className="my-4"
            />

            <div className="flex gap-[260px] -mt-2">
              <Image
                src="/images/LineKananKiri.svg"
                alt=""
                width={20}
                height={30}
              />
              <Image
                src="/images/LineKananKiri.svg"
                alt=""
                width={20}
                height={30}
              />
            </div>

            <div className="flex gap-[260px] -mt-3">
              <Image src="/images/Circle.svg" alt="" width={20} height={20} />
              <Image src="/images/Circle.svg" alt="" width={20} height={20} />
            </div>

            {/* SEKRETARIS & BENDAHARA */}
            <div className="flex gap-40 mt-2">
              <div className="flex flex-col items-center">
                <p className="text-white text-sm mb-2">Sekretaris</p>
                <div className="space-y-2">
                  <div className="bg-white rounded-full px-6 py-3 shadow-lg font-semibold">
                    Ling
                  </div>
                  <div className="bg-white rounded-full px-6 py-3 shadow-lg font-semibold">
                    Vina
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-white text-sm mb-2">Bendahara</p>
                <div className="space-y-2">
                  <div className="bg-white rounded-full px-6 py-3 shadow-lg">
                    Fatah
                  </div>
                  <div className="bg-white rounded-full px-6 py-3 shadow-lg">
                    Afif
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-3xl p-10 shadow-lg mb-8">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-10">
            Jadwal Pelajaran
          </h2>

          {/* Tab-like schedule display */}
          <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-6">
            {weeklySchedule.map((day, index) => (
              <div
                key={index}
                className="border-2 border-slate-300 rounded-2xl p-4 bg-slate-50"
              >
                {/* Day Header */}
                <div className="text-center mb-6 pb-4 border-b-2 border-white/30">
                  <h3 className="text-2xl font-bold text-black">
                    {day.dayIndo}
                  </h3>
                </div>

                {/* Subjects List */}
                <div className="space-y-3">
                  {day.subjects.map((subject, idx) => (
                    <div
                      key={idx}
                      className={`${
                        subject.name === "Istirahat"
                          ? "bg-amber-100 border-l-4 border-amber-500"
                          : "bg-white"
                      } rounded-lg p-3`}
                    >
                      <p
                        className={`font-semibold ${
                          subject.name === "Istirahat"
                            ? "text-amber-800"
                            : "text-slate-800"
                        }`}
                      >
                        {subject.name}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {subject.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-2xl p-6">
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
                  Catatan Penting:
                </p>
                <ul className="text-slate-600 text-sm space-y-1">
                  <li>• Setiap pelajaran di Lab wajib menggunakan wearpack</li>
                  <li>• Hari Rabu: Datang lebih awal untuk kegiatan Opsih</li>
                  <li>• Warna kuning menandakan waktu istirahat</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
