import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/router';

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

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

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

  // Helper: Extract Google Drive File ID
  const extractGoogleDriveId = (url: string): string | null => {
    // Pattern 1: /d/FILE_ID/
    const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match1) return match1[1];
    
    // Pattern 2: id=FILE_ID
    const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match2) return match2[1];
    
    return null;
  };

  // Smart Download Handler
  const handleDownload = async (material: Material) => {
    setDownloading(material.id);

    try {
      // 1. Handle YouTube Videos
      if (material.type === 'video' && 
          (material.url.includes('youtube.com') || material.url.includes('youtu.be'))) {
        alert('⚠️ Video YouTube tidak bisa didownload langsung.\n\nSilakan:\n• Tonton online dengan klik "Lihat Materi"\n• Gunakan aplikasi YouTube downloader');
        setDownloading(null);
        return;
      }

      // 2. Handle Google Drive Files
      if (material.url.includes('drive.google.com')) {
        const fileId = extractGoogleDriveId(material.url);
        
        if (fileId) {
          // Open Google Drive direct download link
          const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          window.open(downloadUrl, '_blank');
          
          setTimeout(() => {
            alert('✅ Download dimulai!\n\nJika download tidak otomatis, klik kanan > Save As pada tab yang terbuka.');
          }, 500);
          
          setDownloading(null);
          return;
        }
      }

      // 3. Handle Direct File URLs (from your server/storage)
      // Check if it's a relative URL (your own server)
      if (material.url.startsWith('/materials/') || material.url.startsWith('/')) {
        // Just open in new tab for now (browser will handle download)
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

      // 4. Handle External URLs with CORS support
      try {
        const response = await fetch(material.url, {
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error('File tidak dapat diakses');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Determine file extension
        const extension = material.type === 'pdf' ? 'pdf' : 
                         material.type === 'doc' ? 'docx' : 
                         material.type === 'video' ? 'mp4' : 
                         'file';
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${material.title}.${extension}`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert('✅ File berhasil didownload!');
      } catch (fetchError) {
        // If fetch fails (CORS issue, etc), fallback to opening in new tab
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

  // View/Open Material Handler
  const handleViewMaterial = (material: Material) => {
    // Open in new tab
    window.open(material.url, '_blank');
  };

  const getSubjectIcon = (subjectName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Matematika': '🔢',
      'Bahasa Indonesia': '🇮🇩',
      'Bahasa Inggris': '🇬🇧',
      'Sejarah': '📜',
      'Pemrograman Web': '💻',
      'Pemrograman Mobile': '📱',
      'Pemrograman Desktop': '🖥️',
      'Basis Data': '🗄️',
      'PJOK': '🏃‍♂️',
      'Seni Budaya': '🎨',
      'PKN': '⚖️',
      'Pendidikan Agama': '🕌',
      'PKK': '👩‍🍳',
      'Mapil': '🎯',
      'Bahasa Jepang': '🇯🇵',
    };
    
    return iconMap[subjectName] || '📚';
  };

  const getSubjectColor = (subjectName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Matematika': 'from-amber-400 to-amber-600',
      'Bahasa Indonesia': 'from-red-400 to-red-600',
      'Bahasa Inggris': 'from-purple-400 to-purple-600',
      'Pemrograman Web': 'from-cyan-400 to-cyan-600',
      'Pemrograman Mobile': 'from-indigo-400 to-indigo-600',
      'Pemrograman Desktop': 'from-teal-400 to-teal-600',
      'Basis Data': 'from-lime-400 to-lime-600',
      'Sejarah': 'from-amber-400 to-amber-600',
      'PJOK': 'from-orange-400 to-orange-600',
      'Seni Budaya': 'from-pink-400 to-pink-600',
      'PKN': 'from-rose-400 to-rose-600',
      'Pendidikan Agama': 'from-violet-400 to-violet-600',
    };
    
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-teal-400 to-teal-600',
      'from-amber-400 to-amber-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-cyan-400 to-cyan-600',
      'from-emerald-400 to-emerald-600',
      'from-red-400 to-red-600',
      'from-orange-400 to-orange-600',
      'from-lime-400 to-lime-600',
      'from-violet-400 to-violet-600',
      'from-rose-400 to-rose-600',
      'from-yellow-400 to-yellow-600',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mb-4"></div>
            <div className="text-slate-700 text-xl">Memuat mata pelajaran...</div>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-slate-600 mt-2">
            Total: {subjects.length} mata pelajaran dari {teachers.length} guru
          </p>
        </div>

        {/* Search Bar - Hide when viewing material details */}
        {selectedSubject === null && (
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
        )}

        {/* Subjects Grid */}
        {selectedSubject === null ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${subject.color} p-6 text-white relative`}>
                    <div className="absolute top-4 right-4">
                      <div className="text-3xl">{subject.icon}</div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/30 flex items-center justify-center">
                        {subject.teacherPhoto ? (
                          <img 
                            src={subject.teacherPhoto} 
                            alt={subject.teacher} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-2xl">
                            {subject.teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{subject.name}</h3>
                        <p className="text-white/90 text-sm">Pengajar: {subject.teacher}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">{subject.materials.length} Materi</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-slate-700 text-white py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2">
                      <span>Lihat Materi</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredSubjects.length === 0 && subjects.length === 0 && (
              <div className="bg-white rounded-3xl p-16 shadow-lg text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-xl text-slate-600">Belum ada data mata pelajaran</p>
                <p className="text-slate-400 mt-2">
                  Tambahkan data guru dengan mata pelajaran di dashboard terlebih dahulu
                </p>
              </div>
            )}
          </>
        ) : (
          // Detail Materials View
          <div>
            <button
              onClick={() => setSelectedSubject(null)}
              className="mb-6 flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
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
                  <div className={`bg-gradient-to-br ${subject.color} rounded-3xl p-10 shadow-lg mb-8 text-white`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-white/20 border-4 border-white/30 flex items-center justify-center">
                        {subject.teacherPhoto ? (
                          <img 
                            src={subject.teacherPhoto} 
                            alt={subject.teacher} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl">
                            {subject.teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                          <div className="text-5xl">{subject.icon}</div>
                          <h2 className="text-4xl font-bold">{subject.name}</h2>
                        </div>
                        <p className="text-white/90 text-lg mb-2">Pengajar: {subject.teacher}</p>
                        <p className="text-white/80">{subject.materials.length} materi tersedia</p>
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
                          <div className="text-4xl">{getTypeIcon(material.type)}</div>
                          
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
                              <button
                                onClick={() => handleViewMaterial(material)}
                                className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium inline-flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Materi
                              </button>
                              
                              <button 
                                onClick={() => handleDownload(material)}
                                disabled={downloading === material.id}
                                className={`${
                                  downloading === material.id 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : 'bg-slate-200 hover:bg-slate-300'
                                } text-slate-700 px-6 py-2 rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-2`}
                              >
                                {downloading === material.id ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mendownload...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                  </>
                                )}
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

        {/* Empty State untuk search */}
        {filteredSubjects.length === 0 && subjects.length > 0 && selectedSubject === null && (
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