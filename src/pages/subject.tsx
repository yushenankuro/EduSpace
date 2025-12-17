import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";

interface Material {
  id: number;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'doc';
  description: string;
  url: string;
}

interface Subject {
  id: number;
  name: string;
  teacher: string;
  icon: string;
  color: string;
  materials: Material[];
}

const SubjectPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data mata pelajaran
  const subjects: Subject[] = [
    {
      id: 1,
      name: 'Pemrograman Web',
      teacher: 'Pak Ahmad',
      icon: '💻',
      color: 'from-blue-400 to-blue-600',
      materials: [
        {
          id: 1,
          title: 'HTML & CSS Dasar',
          type: 'pdf',
          description: 'Materi fundamental HTML dan CSS untuk pemula',
          url: '/materials/html-css-dasar.pdf'
        },
        {
          id: 2,
          title: 'JavaScript ES6',
          type: 'video',
          description: 'Tutorial JavaScript modern dengan ES6 features',
          url: 'https://youtube.com/watch?v=...'
        },
        {
          id: 3,
          title: 'React.js Introduction',
          type: 'doc',
          description: 'Pengenalan framework React.js',
          url: '/materials/react-intro.docx'
        }
      ]
    },
    {
      id: 2,
      name: 'Basis Data',
      teacher: 'Bu Siti',
      icon: '🗄️',
      color: 'from-green-400 to-green-600',
      materials: [
        {
          id: 4,
          title: 'Pengenalan Database',
          type: 'pdf',
          description: 'Konsep dasar database dan DBMS',
          url: '/materials/intro-database.pdf'
        },
        {
          id: 5,
          title: 'SQL Query Basic',
          type: 'video',
          description: 'Tutorial SQL query untuk pemula',
          url: 'https://youtube.com/watch?v=...'
        },
        {
          id: 6,
          title: 'Normalisasi Database',
          type: 'pdf',
          description: 'Materi normalisasi 1NF, 2NF, 3NF',
          url: '/materials/normalisasi.pdf'
        }
      ]
    },
    {
      id: 3,
      name: 'Pemrograman Mobile',
      teacher: 'Pak Budi',
      icon: '📱',
      color: 'from-purple-400 to-purple-600',
      materials: [
        {
          id: 7,
          title: 'Flutter Basics',
          type: 'pdf',
          description: 'Dasar-dasar Flutter untuk mobile development',
          url: '/materials/flutter-basics.pdf'
        },
        {
          id: 8,
          title: 'Dart Programming',
          type: 'video',
          description: 'Belajar bahasa Dart untuk Flutter',
          url: 'https://youtube.com/watch?v=...'
        },
        {
          id: 9,
          title: 'State Management',
          type: 'link',
          description: 'Provider, Bloc, dan GetX',
          url: 'https://docs.flutter.dev/state-management'
        }
      ]
    },
    {
      id: 4,
      name: 'Pemrograman Desktop',
      teacher: 'Pak Joko',
      icon: '🖥️',
      color: 'from-teal-400 to-teal-600',
      materials: [
        {
          id: 10,
          title: 'C# Fundamentals',
          type: 'pdf',
          description: 'Dasar pemrograman C# dan .NET',
          url: '/materials/csharp-fundamentals.pdf'
        },
        {
          id: 11,
          title: 'WPF Application',
          type: 'video',
          description: 'Membuat aplikasi desktop dengan WPF',
          url: 'https://youtube.com/watch?v=...'
        }
      ]
    },
    {
      id: 5,
      name: 'Matematika',
      teacher: 'Bu Ani',
      icon: '🔢',
      color: 'from-amber-400 to-amber-600',
      materials: [
        {
          id: 12,
          title: 'Kalkulus Integral',
          type: 'pdf',
          description: 'Materi integral tentu dan tak tentu',
          url: '/materials/kalkulus-integral.pdf'
        },
        {
          id: 13,
          title: 'Statistika Dasar',
          type: 'doc',
          description: 'Mean, median, modus, dan standar deviasi',
          url: '/materials/statistika.docx'
        }
      ]
    },
    {
      id: 6,
      name: 'Bahasa Inggris',
      teacher: 'Mrs. Diana',
      icon: '🇬🇧',
      color: 'from-pink-400 to-pink-600',
      materials: [
        {
          id: 14,
          title: 'Grammar Tenses',
          type: 'pdf',
          description: '16 tenses dalam bahasa Inggris',
          url: '/materials/grammar-tenses.pdf'
        },
        {
          id: 15,
          title: 'Conversation Practice',
          type: 'video',
          description: 'Video percakapan sehari-hari',
          url: 'https://youtube.com/watch?v=...'
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'doc': return '📝';
      case 'link': return '🔗';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'pdf': return 'bg-red-100 text-red-700';
      case 'video': return 'bg-purple-100 text-purple-700';
      case 'doc': return 'bg-blue-100 text-blue-700';
      case 'link': return 'bg-teal-100 text-teal-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Mata Pelajaran</h1>
          <p className="text-xl text-slate-700">
            Akses semua materi pembelajaran kelas XI RPL 1
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
          <div className="relative">
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari mata pelajaran atau guru..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Subjects Grid */}
        {selectedSubject === null ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer"
              >
                {/* Header dengan gradient */}
                <div className={`bg-gradient-to-br ${subject.color} p-6 text-white`}>
                  <div className="text-5xl mb-3">{subject.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{subject.name}</h3>
                  <p className="text-white/90 text-sm">Pengajar: {subject.teacher}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium">{subject.materials.length} Materi</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-slate-700 text-white py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium">
                    Lihat Materi →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Detail Materials View
          <div>
            {/* Back Button */}
            <button
              onClick={() => setSelectedSubject(null)}
              className="mb-6 flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Mapel
            </button>

            {subjects
              .filter(s => s.id === selectedSubject)
              .map((subject) => (
                <div key={subject.id}>
                  {/* Subject Header */}
                  <div className={`bg-gradient-to-br ${subject.color} rounded-3xl p-10 shadow-lg mb-8 text-white`}>
                    <div className="flex items-center gap-6">
                      <div className="text-7xl">{subject.icon}</div>
                      <div>
                        <h2 className="text-4xl font-bold mb-2">{subject.name}</h2>
                        <p className="text-white/90 text-lg">Pengajar: {subject.teacher}</p>
                        <p className="text-white/80 mt-2">{subject.materials.length} materi tersedia</p>
                      </div>
                    </div>
                  </div>

                  {/* Materials List */}
                  <div className="space-y-4">
                    {subject.materials.map((material) => (
                      <div
                        key={material.id}
                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="text-4xl">{getTypeIcon(material.type)}</div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl font-bold text-slate-800">{material.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(material.type)}`}>
                                {material.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-slate-600 mb-4">{material.description}</p>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <a
                                href={material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium inline-flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Materi
                              </a>
                              <button className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Empty State */}
        {filteredSubjects.length === 0 && (
          <div className="bg-white rounded-3xl p-16 shadow-lg text-center">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-slate-600">Mata pelajaran tidak ditemukan</p>
            <p className="text-slate-400 mt-2">Coba kata kunci lain</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SubjectPage;