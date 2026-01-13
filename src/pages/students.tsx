import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";
import { supabase } from '@/lib/supabase';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  nisn: string;
  birth_date: string;
  jenis_kelamin: string;
  photo_url?: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'gender'>('name-asc');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  /* ================= FETCH DATA ================= */
  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*');

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================= FILTER & SORT ================= */
  const filteredStudents = [...students]
    .filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

  /* ================= UTIL ================= */
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-50 to-blue-100',
      'bg-gradient-to-br from-cyan-50 to-cyan-100',
      'bg-gradient-to-br from-sky-50 to-sky-100',
      'bg-gradient-to-br from-teal-50 to-teal-100',
      'bg-gradient-to-br from-indigo-50 to-indigo-100',
      'bg-gradient-to-br from-violet-50 to-violet-100',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const getInitials = (name: string) => {
    const words = name.split(' ');
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent text-xl font-sans font-bold">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-6 rounded-2xl mb-4 transform transition-transform duration-500 hover:scale-105">
            <h1 className="text-5xl font-sans font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2 drop-shadow-lg">
              Our Class Members
            </h1>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="mb-12 bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/30 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search by name or NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border-2 border-white/40 rounded-xl focus:ring-2 focus:ring-white focus:border-white bg-white/90 backdrop-blur-sm font-sans text-sky-800 placeholder-sky-600/70 transition-all duration-300 focus:scale-[1.02]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="md:w-64 px-6 py-4 border-2 border-white/40 rounded-xl bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-white focus:border-white font-sans text-sky-800 transition-all duration-300 hover:scale-105"
            >
              <option value="name-asc">📷 Sort: A → Z</option>
              <option value="name-desc">📷 Sort: Z → A</option>
            </select>
          </div>

          <div className="mt-6 text-center from-slate-800 to-slate-600 font-sans text-lg drop-shadow animate-pulse">
            🎞️ Found {filteredStudents.length} of {students.length} students
          </div>
        </div>

        {/* Polaroid Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-max pb-12">
          {filteredStudents.map((student, index) => (
            <div 
              key={student.id} 
              className={`cursor-pointer transition-all duration-300 ${
                hoveredCard === student.id 
                  ? 'z-10 transform scale-[1.02]' 
                  : 'hover:z-5'
              }`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
              onMouseEnter={() => setHoveredCard(student.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Polaroid Card Container */}
              <div className="bg-white p-4 shadow-xl transition-all duration-300 relative overflow-hidden animate-fade-in-up hover:shadow-2xl">
                
                {/* Polaroid Frame */}
                <div className="bg-white border-8 border-white shadow-inner mb-3">
                  {/* Photo Area */}
                  <div className={`h-56 ${student.photo_url ? '' : getAvatarColor(student.name)} flex items-center justify-center overflow-hidden relative group`}>
                    {student.photo_url ? (
                      <>
                        <img 
                          src={student.photo_url} 
                          alt={student.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            hoveredCard === student.id ? 'scale-110' : 'scale-100'
                          }`}
                        />
                        {/* Overlay */}
                        <div className={`absolute inset-0 bg-sky-400/0 transition-all duration-500 ${
                          hoveredCard === student.id ? 'bg-sky-400/10' : ''
                        }`} />
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-5xl font-bold text-sky-800/80 block mb-2 transition-transform duration-300 hover:scale-110">
                          {getInitials(student.name)}
                        </span>
                        <span className="text-xs text-sky-600 font-sans">
                          {student.jenis_kelamin === 'L' ? '♂ Male' : '♀ Female'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Polaroid Label Area */}
                  <div className="pt-4 pb-2 px-2">
                    <div className="border-t border-sky-100 pt-3">
                      <h3 className="text-lg font-sans font-bold text-sky-900 text-center truncate transition-colors duration-300 hover:text-sky-700">
                        {student.name}
                      </h3>
                      <div className="flex justify-center items-center gap-2 mt-1">
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full transition-all duration-300 hover:scale-105">
                          Class {student.class}
                        </span>
                        <span className="text-xs text-sky-600 font-mono transition-colors duration-300 hover:text-sky-800">
                          #{student.nisn.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="space-y-2 px-2">
                  <div className="flex items-center gap-2 text-sm text-sky-700 transition-colors duration-300 hover:text-sky-800">
                    <span className="text-sky-600 transition-transform duration-300 hover:scale-110">📅</span>
                    <span className="truncate">{formatDate(student.birth_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-sky-700 transition-colors duration-300 hover:text-sky-800">
                    <span className="text-sky-600 transition-transform duration-300 hover:scale-110">✉️</span>
                    <span className="truncate text-xs">{student.email}</span>
                  </div>
                </div>

                {/* Polaroid Film Strip */}
                <div className="mt-3 pt-3 border-t border-dashed border-sky-200 flex justify-between items-center transition-colors duration-300 hover:border-sky-300">
                  <span className="text-[10px] text-sky-500 font-mono tracking-wider transition-colors duration-300 hover:text-sky-600">
                    POLAROID #{String(index + 1).padStart(3, '0')}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-sky-400 transition-colors duration-300 hover:bg-sky-500"></div>
                    <div className="w-2 h-2 rounded-full bg-sky-300 transition-colors duration-300 hover:bg-sky-400"></div>
                    <div className="w-2 h-2 rounded-full bg-sky-200 transition-colors duration-300 hover:bg-sky-300"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-block bg-white/20 backdrop-blur-sm p-8 rounded-2xl">
              <div className="text-6xl mb-4 animate-bounce">📷</div>
              <p className="text-xl from-slate-800 to-slate-600 font-sans italic">
                No students found. Try a different search.
              </p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-2 bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all duration-300 hover:scale-105"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default Students;