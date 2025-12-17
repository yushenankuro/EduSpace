import React, { useState, useEffect } from 'react';
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
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-teal-400 to-teal-600',
      'from-pink-400 to-pink-600',
      'from-amber-400 to-amber-600',
      'from-green-400 to-green-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const getInitials = (name: string) => {
    const words = name.split(' ');
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-slate-700 text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Daftar Siswa</h1>
          <p className="text-xl text-slate-700">
            Temukan informasi siswa dengan mudah
          </p>
        </div>

        {/* Search & Sort */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-400"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="md:w-64 px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-teal-400"
            >
              <option value="name-asc">Sort: Nama A–Z</option>
              <option value="name-desc">Sort: Nama Z–A</option>
            </select>
          </div>

          <div className="mt-4 text-slate-600">
            Menampilkan {filteredStudents.length} dari {students.length} siswa
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map(student => (
            <div key={student.id} className="bg-white rounded-2xl shadow-lg border-2">
              <div className="p-6 flex justify-center">
                {student.photo_url ? (
                  <img src={student.photo_url} className="w-40 h-48 object-cover rounded-xl" />
                ) : (
                  <div className={`w-40 h-48 rounded-xl bg-gradient-to-br ${getAvatarColor(student.name)} flex items-center justify-center`}>
                    <span className="text-white text-4xl font-bold">
                      {getInitials(student.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 text-center border-t">
                <h3 className="text-xl font-bold">{student.name}</h3>
                <p className="text-sm text-slate-600">{student.jenis_kelamin}</p>
                <p className="font-medium mt-2">Kelas {student.class}</p>
                <p className="text-sm mt-2">NISN: {student.nisn}</p>
                <p className="text-sm truncate">{student.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Students;
