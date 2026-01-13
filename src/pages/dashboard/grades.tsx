import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from "@/components/Navbar";
import { supabase } from '@/lib/supabase';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserGraduate, 
  FaChartLine, 
  FaChartBar, 
  FaArrowUp, 
  FaArrowDown, 
  FaCalculator,
  FaSave,
  FaSync,
  FaSearch,
  FaFilter,
  FaSchool
} from 'react-icons/fa';

interface Student {
  id: string;
  name: string;
  nisn?: string;
  class_name?: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Grade {
  subject_id: string;
  subject_name: string;
  tugas: number | null;
  uts: number | null;
  uas: number | null;
  nilai_akhir: number | null;
  predikat: string | null;
}

interface SelectOption {
  value: string;
  label: string;
}

interface Statistics {
  rataRata: number;
  nilaiTertinggi: number;
  nilaiTerendah: number;
  jumlahMapel: number;
  mapelSelesai: number;
  predikatRataRata: string;
}

// Konstanta untuk kelas
const DEFAULT_CLASS = "XI RPL 1";

const NilaiRaporPage: React.FC = () => {
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [semester, setSemester] = useState('Ganjil');
  const [tahunAjaran, setTahunAjaran] = useState('2024/2025');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState<SelectOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statistics, setStatistics] = useState<Statistics>({
    rataRata: 0,
    nilaiTertinggi: 0,
    nilaiTerendah: 0,
    jumlahMapel: 0,
    mapelSelesai: 0,
    predikatRataRata: '-'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchData();
    } else {
      setGrades([]);
    }
  }, [selectedStudent, semester, tahunAjaran]);

  useEffect(() => {
    const options = students
      .filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.nisn && student.nisn.includes(searchQuery))
      )
      .map(student => ({
        value: student.id,
        label: `${student.name} ${student.nisn ? `(${student.nisn})` : ''}`
      }));
    setStudentOptions(options);
  }, [students, searchQuery]);

  useEffect(() => {
    calculateStatistics();
  }, [grades]);

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) throw error;
      if (studentsData) setStudents(studentsData);
      setStudentsLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudentsLoading(false);
    }
  };

  const fetchData = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      setStudentName(selectedStudent.name);
      setStudentNisn(selectedStudent.nisn || '');

      const subjectsList = [
        'Bahasa Indonesia',
        'Bahasa Inggris',
        'Bahasa Jepang',
        'Basis Data',
        'Pemrograman Web',
        'Pemrograman Mobile',
        'Pemrograman Desktop',
        'Pendidikan Agama',
        'PJOK',
        'PKN',
        'PKK',
        'Mapil',
        'Matematika',
        'Sejarah'
      ];

      const { data: existingGrades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .eq('semester', semester)
        .eq('tahun_ajaran', tahunAjaran);

      if (gradesError) throw gradesError;

      const initialGrades = subjectsList.map((subject, index) => {
        const existingGrade = existingGrades?.find(g => g.subject_name === subject);
        const tugas = existingGrade?.tugas || null;
        const uts = existingGrade?.uts || null;
        const uas = existingGrade?.uas || null;
        const nilaiAkhir = calculateNilaiAkhir(tugas, uts, uas);
        
        return {
          subject_id: `subject_${index}`,
          subject_name: subject,
          tugas,
          uts,
          uas,
          nilai_akhir: nilaiAkhir,
          predikat: getPredikat(nilaiAkhir)
        };
      });
      
      setGrades(initialGrades);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    const validGrades = grades.filter(g => g.nilai_akhir !== null);
    const nilaiList = validGrades.map(g => g.nilai_akhir as number);
    
    if (nilaiList.length === 0) {
      setStatistics({
        rataRata: 0,
        nilaiTertinggi: 0,
        nilaiTerendah: 0,
        jumlahMapel: grades.length,
        mapelSelesai: 0,
        predikatRataRata: '-'
      });
      return;
    }

    const rataRata = nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length;
    const nilaiTertinggi = Math.max(...nilaiList);
    const nilaiTerendah = Math.min(...nilaiList);

    setStatistics({
      rataRata: parseFloat(rataRata.toFixed(2)),
      nilaiTertinggi,
      nilaiTerendah,
      jumlahMapel: grades.length,
      mapelSelesai: nilaiList.length,
      predikatRataRata: getPredikat(rataRata)
    });
  };

  const calculateNilaiAkhir = (tugas: number | null, uts: number | null, uas: number | null) => {
    if (tugas === null || uts === null || uas === null) return null;
    return Math.round((tugas * 0.3) + (uts * 0.3) + (uas * 0.4));
  };

  const getPredikat = (nilai: number | null) => {
    if (nilai === null) return '-';
    if (nilai >= 90) return 'A (Sangat Baik)';
    if (nilai >= 75) return 'B (Baik)';
    if (nilai >= 60) return 'C (Cukup)';
    if (nilai >= 50) return 'D (Kurang)';
    return 'E (Sangat Kurang)';
  };

  const getPredikatColor = (predikat: string) => {
    if (predikat.startsWith('A')) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (predikat.startsWith('B')) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    if (predikat.startsWith('C')) return 'bg-gradient-to-r from-yellow-500 to-amber-600';
    if (predikat.startsWith('D')) return 'bg-gradient-to-r from-orange-500 to-red-500';
    if (predikat.startsWith('E')) return 'bg-gradient-to-r from-red-500 to-rose-600';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const handleInputChange = (subjectId: string, field: 'tugas' | 'uts' | 'uas', value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    
    setGrades(prevGrades => 
      prevGrades.map(grade => {
        if (grade.subject_id === subjectId) {
          const updatedGrade = { ...grade, [field]: numValue };
          const nilaiAkhir = calculateNilaiAkhir(
            field === 'tugas' ? numValue : grade.tugas,
            field === 'uts' ? numValue : grade.uts,
            field === 'uas' ? numValue : grade.uas
          );
          return {
            ...updatedGrade,
            nilai_akhir: nilaiAkhir,
            predikat: getPredikat(nilaiAkhir)
          };
        }
        return grade;
      })
    );
  };

  const handleStudentChange = (selectedOption: SelectOption | null) => {
    if (selectedOption) {
      const student = students.find(s => s.id === selectedOption.value);
      setSelectedStudent(student || null);
    } else {
      setSelectedStudent(null);
      setStudentName('');
      setStudentNisn('');
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedStudent) {
      alert('Silakan pilih siswa terlebih dahulu!');
      return;
    }

    if (grades.length === 0) {
      alert('Tidak ada data nilai untuk disimpan!');
      return;
    }

    setSaving(true);
    try {
      const gradesToSave = grades.map(grade => ({
        student_id: selectedStudent.id,
        subject_name: grade.subject_name,
        tugas: grade.tugas,
        uts: grade.uts,
        uas: grade.uas,
        nilai_akhir: grade.nilai_akhir,
        predikat: grade.predikat,
        semester: semester,
        tahun_ajaran: tahunAjaran,
        class_name: DEFAULT_CLASS, // Otomatis pakai kelas XI RPL 1
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('grades')
        .upsert(gradesToSave, {
          onConflict: 'student_id,subject_name,semester,tahun_ajaran'
        });

      if (error) {
        alert(`Gagal menyimpan data: ${error.message}`);
      } else {
        // Show success animation
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
          saveBtn.classList.add('animate-pulse');
          setTimeout(() => saveBtn.classList.remove('animate-pulse'), 1000);
        }
        alert('Data nilai berhasil disimpan!');
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: '#cbd5e1',
      borderRadius: '0.75rem',
      padding: '0.5rem',
      fontSize: '1rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#0ea5e9',
        boxShadow: '0 0 0 1px rgba(14, 165, 233, 0.2)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '0.75rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#0ea5e9' 
        : state.isFocused 
        ? '#f0f9ff' 
        : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      '&:hover': {
        backgroundColor: '#f0f9ff'
      }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-sky-400 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Navbar/>

        {/* Main Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <FaSchool className="text-3xl" />
                  RAPOR SISWA - {DEFAULT_CLASS}
                </h1>
                <p className="text-blue-100">Tahun Ajaran {tahunAjaran} • Semester {semester}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <FaUserGraduate />
                  <p className="text-sm text-blue-100">Total Siswa</p>
                </div>
                <p className="text-2xl font-bold mt-1">{students.length}</p>
              </div>
            </div>
          </div>

          {/* Student Selection Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaSearch />
                  <label className="font-medium">Cari Siswa</label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan nama atau NISN..."
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                </div>
                <Select
                  options={studentOptions}
                  value={selectedStudent ? { 
                    value: selectedStudent.id, 
                    label: `${selectedStudent.name} ${selectedStudent.nisn ? `(${selectedStudent.nisn})` : ''}`
                  } : null}
                  onChange={handleStudentChange}
                  isLoading={studentsLoading}
                  isClearable
                  placeholder="Pilih siswa..."
                  noOptionsMessage={() => "Tidak ada siswa ditemukan"}
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Student Info with Automatic Class */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaUserGraduate className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Siswa Terpilih</p>
                    <p className="font-bold text-lg text-gray-800">
                      {selectedStudent ? selectedStudent.name : 'Belum dipilih'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500">NISN</p>
                    <p className="font-semibold">{selectedStudent?.nisn || '-'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500">Kelas</p>
                    <p className="font-semibold text-blue-600">{DEFAULT_CLASS}</p>
                    <p className="text-xs text-gray-400 mt-1">(Otomatis)</p>
                  </div>
                </div>
              </div>

              {/* Filter Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaFilter />
                  <label className="font-medium">Filter Data</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Tahun Ajaran</label>
                    <select
                      value={tahunAjaran}
                      onChange={(e) => setTahunAjaran(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="2023/2024">2023/2024</option>
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={fetchData}
                  disabled={!selectedStudent}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaSync className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Memuat...' : 'Muat Data'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <AnimatePresence>
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Average Score */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90">Rata-rata Nilai</p>
                      <p className="text-3xl font-bold mt-2">{statistics.rataRata.toFixed(2)}</p>
                      <p className="text-sm mt-1 opacity-90">{statistics.predikatRataRata}</p>
                    </div>
                    <FaChartLine className="text-3xl opacity-80" />
                  </div>
                  <div className="mt-4 text-sm">
                    {statistics.mapelSelesai} dari {statistics.jumlahMapel} mapel
                  </div>
                </div>

                {/* Highest Score */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90">Nilai Tertinggi</p>
                      <p className="text-3xl font-bold mt-2">{statistics.nilaiTertinggi}</p>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <FaArrowUp />
                        <span>Excellent</span>
                      </div>
                    </div>
                    <FaChartBar className="text-3xl opacity-80" />
                  </div>
                </div>

                {/* Lowest Score */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90">Nilai Terendah</p>
                      <p className="text-3xl font-bold mt-2">{statistics.nilaiTerendah}</p>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <FaArrowDown />
                        <span>Perlu Perbaikan</span>
                      </div>
                    </div>
                    <FaCalculator className="text-3xl opacity-80" />
                  </div>
                </div>

                {/* Completion */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90">Kelengkapan</p>
                      <p className="text-3xl font-bold mt-2">
                        {statistics.jumlahMapel > 0 
                          ? Math.round((statistics.mapelSelesai / statistics.jumlahMapel) * 100) 
                          : 0}%
                      </p>
                      <div className="w-full bg-white/30 rounded-full h-2 mt-3">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${statistics.jumlahMapel > 0 
                              ? (statistics.mapelSelesai / statistics.jumlahMapel) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading && selectedStudent && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl text-gray-600">Memuat data nilai...</p>
            </div>
          )}

          {/* Grades Table */}
          {!loading && selectedStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaSchool className="text-blue-600" />
                    <h3 className="font-bold text-gray-800">Daftar Nilai - {DEFAULT_CLASS}</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Semester {semester} • {tahunAjaran}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">No</th>
                      <th className="px-6 py-4 text-left font-semibold">Mata Pelajaran</th>
                      <th className="px-6 py-4 text-center font-semibold">Tugas (30%)</th>
                      <th className="px-6 py-4 text-center font-semibold">UTS (30%)</th>
                      <th className="px-6 py-4 text-center font-semibold">UAS (40%)</th>
                      <th className="px-6 py-4 text-center font-semibold">Nilai Akhir</th>
                      <th className="px-6 py-4 text-center font-semibold">Predikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grades.map((grade, index) => (
                      <motion.tr 
                        key={grade.subject_id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-blue-50/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-gray-700 font-medium">{index + 1}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{grade.subject_name}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={grade.tugas ?? ''}
                            onChange={(e) => handleInputChange(grade.subject_id, 'tugas', e.target.value)}
                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={grade.uts ?? ''}
                            onChange={(e) => handleInputChange(grade.subject_id, 'uts', e.target.value)}
                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={grade.uas ?? ''}
                            onChange={(e) => handleInputChange(grade.subject_id, 'uas', e.target.value)}
                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${
                            grade.nilai_akhir !== null 
                              ? grade.nilai_akhir >= 75 
                                ? 'bg-green-100 text-green-700' 
                                : grade.nilai_akhir >= 60 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {grade.nilai_akhir ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-white shadow-sm ${getPredikatColor(grade.predikat || '-')}`}>
                            {grade.predikat?.split(' ')[0] || '-'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-right font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <FaChartLine />
                          Statistik Keseluruhan:
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-blue-600">{statistics.rataRata.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">Rata-rata</div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="space-y-1">
                          <div className={`px-4 py-2 rounded-full font-bold text-white ${getPredikatColor(statistics.predikatRataRata)}`}>
                            {statistics.predikatRataRata.split(' ')[0]}
                          </div>
                          <div className="text-sm text-gray-600">
                            Tertinggi: {statistics.nilaiTertinggi} | Terendah: {statistics.nilaiTerendah}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {!loading && selectedStudent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white rounded-2xl shadow-xl"
            >
              <div className="text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <FaSchool className="text-blue-600" />
                  <p className="font-medium">{DEFAULT_CLASS}</p>
                </div>
                <p className="text-sm">Total: {statistics.mapelSelesai} mapel terisi</p>
                <p className="text-sm">Rata-rata: <span className="font-bold text-blue-600">{statistics.rataRata.toFixed(2)}</span></p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchData}
                  disabled={!selectedStudent}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  <FaSync />
                  Refresh
                </button>
                <button
                  id="save-btn"
                  onClick={handleSaveGrades}
                  disabled={saving || !selectedStudent}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  <FaSave className={saving ? 'animate-spin' : ''} />
                  {saving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Legend & Notes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaSchool className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Informasi Kelas</h3>
                    <p className="text-sm text-gray-600">Kelas otomatis diterapkan</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-700 mb-2">{DEFAULT_CLASS}</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <div className="text-center">
                        <p className="font-semibold">{students.length}</p>
                        <p>Total Siswa</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">14</p>
                        <p>Mapel</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">2</p>
                        <p>Semester</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Skala Predikat</h4>
                <div className="space-y-2">
                  {[
                    { range: '90 - 100', label: 'A (Sangat Baik)', color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
                    { range: '75 - 89', label: 'B (Baik)', color: 'bg-gradient-to-r from-blue-500 to-cyan-600' },
                    { range: '60 - 74', label: 'C (Cukup)', color: 'bg-gradient-to-r from-yellow-500 to-amber-600' },
                    { range: '50 - 59', label: 'D (Kurang)', color: 'bg-gradient-to-r from-orange-500 to-red-500' },
                    { range: '0 - 49', label: 'E (Sangat Kurang)', color: 'bg-gradient-to-r from-red-500 to-rose-600' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{item.range}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Formula & Informasi</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <p className="font-semibold text-blue-700 mb-2">Formula Nilai Akhir:</p>
                    <div className="text-lg font-bold text-blue-600 mb-1">
                      (Tugas × 30%) + (UTS × 30%) + (UAS × 40%)
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="font-semibold text-green-700 mb-1">Otomatis Simpan</p>
                    <p className="text-sm text-green-600">Data akan disimpan otomatis ke database saat tombol "Simpan" ditekan</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="font-semibold text-purple-700 mb-1">Kelas Default</p>
                    <p className="text-sm text-purple-600">Semua nilai akan otomatis tercatat untuk kelas <strong>{DEFAULT_CLASS}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NilaiRaporPage;