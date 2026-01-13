import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

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
  teacherPhoto: string;
  icon: string;
  color: string;
  materials: Material[];
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  teacher_gender: string;
  photo_url?: string;
  created_at?: string;
}

const SubjectPage: React.FC = () => {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [hoveredSubject, setHoveredSubject] = useState<number | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Fetch data guru dari Supabase
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
      
      // Transform data guru menjadi mata pelajaran
      const transformedSubjects: Subject[] = [];
      
      data?.forEach((teacher) => {
        teacher.subjects?.forEach((subjectName: string, index: number) => {
          const existingSubjectIndex = transformedSubjects.findIndex(
            s => s.name.toLowerCase() === subjectName.toLowerCase()
          );
          
          if (existingSubjectIndex === -1) {
            transformedSubjects.push({
              id: transformedSubjects.length + 1,
              name: subjectName,
              teacher: teacher.name,
              teacherPhoto: teacher.photo_url || '',
              icon: getSubjectIcon(subjectName),
              color: getSubjectColor(subjectName),
              materials: getDefaultMaterials(subjectName)
            });
          } else {
            const existingSubject = transformedSubjects[existingSubjectIndex];
            if (!existingSubject.teacher.includes(teacher.name)) {
              existingSubject.teacher = `${existingSubject.teacher}, ${teacher.name}`;
            }
          }
        });
      });
      
      setSubjects(transformedSubjects);
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const subjectCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      y: -15,
      scale: 1.05,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const materialCardVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      x: 10,
      backgroundColor: "#f8fafc",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Helper: Extract Google Drive File ID
  const extractGoogleDriveId = (url: string): string | null => {
    const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match1) return match1[1];
    
    const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match2) return match2[1];
    
    return null;
  };

  // Smart Download Handler
  const handleDownload = async (material: Material) => {
    setDownloading(material.id);

    try {
      // Handle YouTube Videos
      if (material.type === 'video' && 
          (material.url.includes('youtube.com') || material.url.includes('youtu.be'))) {
        alert('⚠️ Video YouTube tidak bisa didownload langsung.\n\nSilakan:\n• Tonton online dengan klik "Lihat Materi"\n• Gunakan aplikasi YouTube downloader');
        setDownloading(null);
        return;
      }

      // Handle Google Drive Files
      if (material.url.includes('drive.google.com')) {
        const fileId = extractGoogleDriveId(material.url);
        
        if (fileId) {
          const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          window.open(downloadUrl, '_blank');
          
          setTimeout(() => {
            alert('✅ Download dimulai!\n\nJika download tidak otomatis, klik kanan > Save As pada tab yang terbuka.');
          }, 500);
          
          setDownloading(null);
          return;
        }
      }

      // Handle Direct File URLs
      if (material.url.startsWith('/materials/') || material.url.startsWith('/')) {
        const link = document.createElement('a');
        link.href = material.url;
        link.download = `${material.title}.${material.type}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          alert('✅ Download dimulai!');
        }, 500);
        
        setDownloading(null);
        return;
      }

      // Handle External URLs
      try {
        const response = await fetch(material.url, { mode: 'cors' });

        if (!response.ok) {
          throw new Error('File tidak dapat diakses');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const extension = material.type === 'pdf' ? 'pdf' : 
                         material.type === 'doc' ? 'docx' : 
                         material.type === 'video' ? 'mp4' : 
                         'file';
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${material.title}.${extension}`;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert('✅ File berhasil didownload!');
      } catch (fetchError) {
        console.warn('Fetch failed, using fallback method:', fetchError);
        window.open(material.url, '_blank');
        alert('ℹ️ File dibuka di tab baru.\n\nSilakan klik kanan > Save As untuk download.');
      }

    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Gagal mendownload file.\n\nSilakan coba lagi atau hubungi admin.');
    } finally {
      setDownloading(null);
    }
  };

  const handleViewMaterial = (material: Material) => {
    window.open(material.url, '_blank');
  };

  const getSubjectIcon = (subjectName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Matematika': '🧮',
      'Bahasa Indonesia': '📝',
      'Bahasa Inggris': '🗣️',
      'Sejarah': '📜',
      'Pemrograman Web': '💻',
      'Pemrograman Mobile': '📱',
      'Pemrograman Desktop': '🖥️',
      'Basis Data': '🗄️',
      'PJOK': '🏃‍♂️',
      'Seni Budaya': '🎨',
      'PKN': '⚖️',
      'Pendidikan Agama': '🕌',
      'PKK': '📊',
      'Mapil': '🎮',
      'Bahasa Jepang': '⛩️',
    };
    
    return iconMap[subjectName] || '📚';
  };

  const getSubjectColor = (subjectName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Matematika': 'from-amber-400 to-amber-600',
      'Bahasa Indonesia': 'from-red-400 to-red-600',
      'Bahasa Inggris': 'from-blue-400 to-blue-600',
      'Pemrograman Web': 'from-emerald-400 to-emerald-600',
      'Pemrograman Mobile': 'from-violet-400 to-violet-600',
      'Pemrograman Desktop': 'from-cyan-400 to-cyan-600',
      'Basis Data': 'from-orange-400 to-orange-600',
      'Sejarah': 'from-amber-400 to-amber-600',
      'PJOK': 'from-green-400 to-green-600',
      'Seni Budaya': 'from-pink-400 to-pink-600',
      'PKN': 'from-purple-400 to-purple-600',
      'Pendidikan Agama': 'from-indigo-400 to-indigo-600',
      'Bahasa Jepang': 'from-rose-400 to-rose-600',
    };
    
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-rose-500 to-pink-500',
      'from-emerald-500 to-green-500',
      'from-amber-500 to-orange-500',
      'from-violet-500 to-purple-500',
    ];
    
    return colorMap[subjectName] || colors[Math.floor(Math.random() * colors.length)];
  };

  const getDefaultMaterials = (subjectName: string): Material[] => {
    const materialsMap: { [key: string]: Material[] } = {
      'Matematika': [
        { id: 1, title: 'Kalkulus Dasar', type: 'pdf', description: 'Materi kalkulus diferensial dan integral', url: 'https://drive.google.com/file/d/1a2b3c4d5e6f/view' },
        { id: 2, title: 'Aljabar Linear', type: 'video', description: 'Video tutorial aljabar linear', url: 'https://youtube.com/watch?v=example1' },
        { id: 3, title: 'Statistika', type: 'doc', description: 'Materi statistika deskriptif', url: '/materials/statistika.docx' }
      ],
      'Bahasa Indonesia': [
        { id: 4, title: 'Tata Bahasa', type: 'pdf', description: 'Materi tata bahasa Indonesia', url: 'https://drive.google.com/file/d/abc123def456/view' },
        { id: 5, title: 'Sastra Indonesia', type: 'video', description: 'Pengenalan sastra Indonesia', url: 'https://youtube.com/watch?v=example2' }
      ],
      'Bahasa Inggris': [
        { id: 6, title: 'Grammar Tenses', type: 'pdf', description: '16 tenses dalam bahasa Inggris', url: 'https://drive.google.com/file/d/grammar123/view' },
        { id: 7, title: 'Conversation Practice', type: 'video', description: 'Video percakapan sehari-hari', url: 'https://youtube.com/watch?v=example3' }
      ],
      'Pemrograman Web': [
        { id: 8, title: 'HTML & CSS Dasar', type: 'pdf', description: 'Materi fundamental HTML dan CSS', url: 'https://drive.google.com/file/d/htmlcss123/view' },
        { id: 9, title: 'JavaScript ES6', type: 'video', description: 'Tutorial JavaScript modern', url: 'https://youtube.com/watch?v=example4' },
        { id: 10, title: 'React.js Introduction', type: 'doc', description: 'Pengenalan framework React.js', url: '/materials/react.docx' }
      ],
      'Basis Data': [
        { id: 11, title: 'Pengenalan Database', type: 'pdf', description: 'Konsep dasar database', url: 'https://drive.google.com/file/d/database123/view' },
        { id: 12, title: 'SQL Query Basic', type: 'video', description: 'Tutorial SQL untuk pemula', url: 'https://youtube.com/watch?v=example5' },
        { id: 13, title: 'Normalisasi Database', type: 'pdf', description: 'Materi normalisasi 1NF, 2NF, 3NF', url: 'https://drive.google.com/file/d/normalisasi123/view' }
      ],
      'Pemrograman Mobile': [
        { id: 14, title: 'Flutter Basics', type: 'pdf', description: 'Dasar-dasar Flutter', url: 'https://docs.google.com/document/d/1_FcnQwU4tPkA2MLfe-t3Pz4I7e9_Jq8-CQNKaBH-QoQ/edit#heading=h.illyzk6ywykf' },
        { id: 15, title: 'Dart Programming', type: 'video', description: 'Belajar bahasa Dart', url: 'https://youtube.com/watch?v=example6' }
      ],
    };
    
    if (materialsMap[subjectName]) {
      return materialsMap[subjectName];
    }
    
    return [
      {
        id: Date.now(),
        title: `${subjectName} Dasar`,
        type: 'pdf',
        description: `Materi dasar ${subjectName}`,
        url: `https://drive.google.com/file/d/sample123/view`
      },
      {
        id: Date.now() + 1,
        title: `Tutorial ${subjectName}`,
        type: 'video',
        description: `Video tutorial ${subjectName}`,
        url: 'https://youtube.com/watch?v=tutorial'
      }
    ];
  };

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
      case 'pdf': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'video': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'doc': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'link': return 'bg-teal-500/10 text-teal-600 border-teal-200';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header dengan animasi */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center mb-12"
        >
          <div className="inline-block relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/20 to-blue-400/20 blur-xl rounded-full"></div>
            <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              Mata Pelajaran
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Temukan dan akses semua materi pembelajaran kelas XI RPL 1 dengan mudah
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span>{subjects.length} Mapel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
              <span>{teachers.length} Guru</span>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <AnimatePresence>
          {selectedSubject === null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-8 relative"
            >
              <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-blue-400/30 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/50">
                  <div className="relative">
                    <svg 
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                        searchFocused ? 'text-blue-500 scale-110' : 'text-slate-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="🔍 Cari mata pelajaran atau guru..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="w-full pl-12 pr-4 py-4 bg-transparent border-none rounded-xl focus:ring-0 outline-none text-slate-700 placeholder-slate-400"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {selectedSubject === null ? (
            <motion.div
              key="subject-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white/50 rounded-2xl overflow-hidden shadow-lg animate-pulse"
                    >
                      <div className={`bg-gradient-to-br from-slate-200 to-slate-300 p-6 h-48`}></div>
                      <div className="p-6">
                        <div className="h-6 bg-slate-200 rounded mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3 mb-6"></div>
                        <div className="h-12 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredSubjects.map((subject, index) => (
                      <motion.div
                        key={subject.id}
                        variants={subjectCardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        onMouseEnter={() => setHoveredSubject(subject.id)}
                        onMouseLeave={() => setHoveredSubject(null)}
                        onClick={() => setSelectedSubject(subject.id)}
                        className="relative cursor-pointer group"
                      >
                        {/* Glow effect */}
                        <div className={`absolute -inset-2 bg-gradient-to-br ${subject.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>
                        
                        {/* Card */}
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-white/50 backdrop-blur-sm">
                          {/* Header dengan gradient */}
                          <div className={`relative bg-gradient-to-br ${subject.color} p-6 text-white overflow-hidden`}>
                            {/* Animated background pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                            </div>
                            
                            {/* Subject Icon */}
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-6">
                                <div className="text-4xl transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                                  {subject.icon}
                                </div>
                                <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                  {subject.materials.length} Materi
                                </div>
                              </div>
                              
                              <h3 className="text-2xl font-bold mb-2">{subject.name}</h3>
                              <p className="text-white/90 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></span>
                                Pengajar: {subject.teacher}
                              </p>
                            </div>
                          </div>

                          {/* Teacher Photo */}
                          <div className="relative -mt-10 mx-6 mb-4">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                              {subject.teacherPhoto ? (
                                <img 
                                  src={subject.teacherPhoto} 
                                  alt={subject.teacher} 
                                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 font-bold text-xl">
                                  {subject.teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="px-6 pb-6">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 group/btn shadow-lg"
                            >
                              <span>Lihat Materi</span>
                              <svg className="w-4 h-4 transform transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Empty States */}
                  {filteredSubjects.length === 0 && subjects.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <div className="inline-block bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl p-16 shadow-lg border border-white/50">
                        <div className="text-8xl mb-6 animate-bounce">📚</div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">Belum ada mata pelajaran</h3>
                        <p className="text-slate-500 max-w-md">
                          Tambahkan data guru dengan mata pelajaran di dashboard terlebih dahulu
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {filteredSubjects.length === 0 && subjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16"
                    >
                      <div className="inline-block bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl p-16 shadow-lg border border-white/50">
                        <div className="text-7xl mb-6 animate-pulse">🔍</div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">Mata pelajaran tidak ditemukan</h3>
                        <p className="text-slate-500 mb-4">Coba kata kunci lain untuk pencarian</p>
                        <button
                          onClick={() => setSearchTerm('')}
                          className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full hover:from-sky-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
                        >
                          Reset Pencarian
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            // Detail Materials View
            <motion.div
              key="material-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSubject(null)}
                className="mb-8 flex items-center gap-3 text-slate-600 hover:text-slate-800 font-medium transition-colors group/back"
              >
                <svg className="w-5 h-5 transform transition-transform duration-300 group-hover/back:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Daftar Mapel
              </motion.button>

              {subjects
                .filter(s => s.id === selectedSubject)
                .map((subject) => (
                  <div key={subject.id}>
                    {/* Subject Header */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative bg-gradient-to-br ${subject.color} rounded-3xl p-8 md:p-10 shadow-2xl mb-8 text-white overflow-hidden`}
                    >
                      {/* Background pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          {/* Teacher Photo */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="relative"
                          >
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white">
                              {subject.teacherPhoto ? (
                                <img 
                                  src={subject.teacherPhoto} 
                                  alt={subject.teacher} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 font-bold text-3xl">
                                  {subject.teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                              <span className="text-sm">✨</span>
                            </div>
                          </motion.div>
                          
                          {/* Subject Info */}
                          <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                              <motion.div
                                animate={{ 
                                  rotate: [0, 10, -10, 10, 0],
                                  scale: [1, 1.1, 1, 1.1, 1]
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 1
                                }}
                                className="text-5xl"
                              >
                                {subject.icon}
                              </motion.div>
                              <h2 className="text-4xl md:text-5xl font-bold">{subject.name}</h2>
                            </div>
                            <p className="text-white/90 text-lg mb-2">Pengajar: {subject.teacher}</p>
                            <div className="flex items-center gap-4">
                              <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                {subject.materials.length} Materi
                              </span>
                              <span className="text-white/80">📚 Klik untuk melihat detail</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Materials List */}
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {subject.materials.map((material, index) => (
                        <motion.div
                          key={material.id}
                          variants={materialCardVariants}
                          whileHover="hover"
                          className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:border-slate-200 transition-all duration-300"
                        >
                          <div className="flex items-start gap-6">
                            {/* Material Icon */}
                            <div className="relative">
                              <div className="text-4xl transform transition-transform duration-300 group-hover:scale-110">
                                {getTypeIcon(material.type)}
                              </div>
                              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                <span className="text-xs font-bold">{index + 1}</span>
                              </div>
                            </div>
                            
                            {/* Material Content */}
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-4">
                                <div>
                                  <h3 className="text-xl font-bold text-slate-800 mb-1">{material.title}</h3>
                                  <p className="text-slate-600">{material.description}</p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getTypeColor(material.type)} whitespace-nowrap`}>
                                  {material.type.toUpperCase()}
                                </span>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-3 mt-4">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleViewMaterial(material)}
                                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 font-medium inline-flex items-center gap-2 shadow-lg"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Lihat Materi
                                </motion.button>
                                
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDownload(material)}
                                  disabled={downloading === material.id}
                                  className={`${downloading === material.id 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 shadow-lg'
                                  } px-6 py-3 rounded-xl transition-all duration-300 font-medium inline-flex items-center gap-2`}
                                >
                                  {downloading === material.id ? (
                                    <>
                                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Mendownload...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Download
                                    </>
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      <style jsx global>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #38bdf8, #0ea5e9);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0ea5e9, #0284c7);
        }
        
        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Selection color */
        ::selection {
          background-color: rgba(14, 165, 233, 0.2);
          color: #0f172a;
        }
      `}</style>
    </div>
  );
};

export default SubjectPage;