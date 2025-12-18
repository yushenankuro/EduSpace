import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from "@/components/Navbar";
import { supabase } from '@/lib/supabase';
import Select from 'react-select';

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

const NilaiRaporPage: React.FC = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [semester, setSemester] = useState('Ganjil');
  const [tahunAjaran, setTahunAjaran] = useState('2024/2025');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentOptions, setStudentOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    // Cek session dan fetch data
    const checkAuthAndFetchData = async () => {
      setAuthLoading(true);
      
      try {
        // Cek apakah user sudah login
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirect ke login jika belum login
          router.push('/login');
          return;
        }
        
        // User sudah login, fetch data siswa
        await fetchStudents();
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login?redirect=/grades');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  useEffect(() => {
    // Fetch nilai ketika siswa dipilih atau semester/tahun ajaran berubah
    if (selectedStudent) {
      fetchData();
    } else {
      setGrades([]);
    }
  }, [selectedStudent, semester, tahunAjaran]);

  useEffect(() => {
    // Update student options ketika students berubah
    const options = students.map(student => ({
      value: student.id,
      label: student.name
    }));
    setStudentOptions(options);
  }, [students]);

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      // Ambil semua data siswa dari database
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      if (studentsData && studentsData.length > 0) {
        setStudents(studentsData);
        // Tidak set default siswa, biarkan user pilih
      }
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
      
      // Update nama dan NISN siswa yang dipilih
      setStudentName(selectedStudent.name);
      setStudentNisn(selectedStudent.nisn || '');

      // Daftar mapel yang fixed
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

      // Load existing grades from database for selected student
      const { data: existingGrades, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .eq('semester', semester)
        .eq('tahun_ajaran', tahunAjaran);

      if (gradesError) {
        console.error('Error fetching grades:', gradesError);
        throw gradesError;
      }

      // Initialize grades with predefined subjects
      const initialGrades = subjectsList.map((subject, index) => {
        const existingGrade = existingGrades?.find(g => g.subject_name === subject);
        
        return {
          subject_id: `subject_${index}`,
          subject_name: subject,
          tugas: existingGrade?.tugas || null,
          uts: existingGrade?.uts || null,
          uas: existingGrade?.uas || null,
          nilai_akhir: existingGrade?.nilai_akhir || null,
          predikat: existingGrade?.predikat || null
        };
      });
      
      setGrades(initialGrades);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
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

  const calculateRataRata = (): string => {
    const validGrades = grades.filter(g => g.nilai_akhir !== null);
    if (validGrades.length === 0) return '0';
    const sum = validGrades.reduce((acc, g) => acc + (g.nilai_akhir || 0), 0);
    return (sum / validGrades.length).toFixed(2);
  };
  
  const getRataRataNumber = (): number => {
    const rataStr = calculateRataRata();
    return parseFloat(rataStr);
  };

  const handleStudentChange = (selectedOption: SelectOption | null) => {
    if (selectedOption) {
      const student = students.find(s => s.id === selectedOption.value);
      if (student) {
        setSelectedStudent(student);
      } else {
        setSelectedStudent(null);
        setStudentName('');
        setStudentNisn('');
      }
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
      // Siapkan data untuk disimpan
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
        updated_at: new Date().toISOString()
      }));

      // Simpan data ke database
      const { error } = await supabase
        .from('grades')
        .upsert(gradesToSave, {
          onConflict: 'student_id,subject_name,semester,tahun_ajaran'
        });

      if (error) {
        console.error('Error saving grades:', error);
        alert(`Gagal menyimpan data: ${error.message}`);
      } else {
        alert('Data nilai berhasil disimpan!');
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  // Custom styles untuk react-select
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: '#d1d5db',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      '&:hover': {
        borderColor: '#0ea5e9'
      },
      '&:focus-within': {
        borderColor: '#0ea5e9',
        boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.2)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '0.5rem',
      overflow: 'hidden'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#f0f9ff' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      '&:hover': {
        backgroundColor: '#f0f9ff'
      }
    })
  };

  // Loading states
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Memeriksa autentikasi...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-sky-400 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Navbar/>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-slate-700 mb-2">RAPOR SISWA</h1>
            <p className="text-gray-600">Tahun Ajaran {tahunAjaran} - Semester {semester}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Pilih Siswa</p>
                <Select
                  options={studentOptions}
                  value={selectedStudent ? { 
                    value: selectedStudent.id, 
                    label: selectedStudent.name 
                  } : null}
                  onChange={handleStudentChange}
                  isLoading={studentsLoading}
                  isClearable
                  placeholder="Cari siswa..."
                  noOptionsMessage={() => "Tidak ada siswa ditemukan"}
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nama Siswa</p>
                <p className="font-semibold text-slate-700">
                  {selectedStudent ? selectedStudent.name : 'Pilih siswa terlebih dahulu'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tahun Ajaran</p>
                <p className="font-semibold text-slate-700">{tahunAjaran}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">NISN</p>
                <p className="font-semibold text-slate-700">
                  {selectedStudent ? (selectedStudent.nisn || '-') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Semester Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Filter Data</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Tahun Ajaran</label>
                <select
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="2023/2024">2023/2024</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchData}
                  disabled={!selectedStudent}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && selectedStudent ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
            <div className="text-xl text-gray-600">Memuat data nilai...</div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Mata Pelajaran</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Tugas (30%)</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">UTS (30%)</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">UAS (40%)</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Nilai Akhir</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Predikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {grades.map((grade, index) => (
                      <tr key={grade.subject_id} className="hover:bg-sky-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{grade.subject_name}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={grade.tugas ?? ''}
                            onChange={(e) => handleInputChange(grade.subject_id, 'tugas', e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-slate-700">
                            {grade.nilai_akhir ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold text-sm text-white ${
                            grade.predikat?.startsWith('A') ? 'bg-green-500' :
                            grade.predikat?.startsWith('B') ? 'bg-blue-500' :
                            grade.predikat?.startsWith('C') ? 'bg-yellow-500' :
                            grade.predikat?.startsWith('D') ? 'bg-orange-500' :
                            grade.predikat?.startsWith('E') ? 'bg-red-500' :
                            'bg-gray-300 text-gray-600'
                          }`}>
                            {grade.predikat || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100">
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-right font-bold text-slate-700">
                        Rata-rata Nilai:
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-2xl font-bold text-sky-600">
                          {calculateRataRata()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-semibold text-sm text-white ${
                          getPredikat(getRataRataNumber()).startsWith('A') ? 'bg-green-500' :
                          getPredikat(getRataRataNumber()).startsWith('B') ? 'bg-blue-500' :
                          getPredikat(getRataRataNumber()).startsWith('C') ? 'bg-yellow-500' :
                          getPredikat(getRataRataNumber()).startsWith('D') ? 'bg-orange-500' :
                          getPredikat(getRataRataNumber()).startsWith('E') ? 'bg-red-500' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {getPredikat(getRataRataNumber())}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={fetchData}
                disabled={!selectedStudent}
                className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Refresh Nilai
              </button>
              <button
                onClick={handleSaveGrades}
                disabled={saving || !selectedStudent}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
              </button>
            </div>
          </>
        )}

        {/* Keterangan Predikat */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="font-bold text-slate-700 mb-4">Keterangan Predikat:</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-green-500 text-white font-semibold text-sm">A (Sangat Baik)</span>
              <span className="text-sm text-gray-700">90 - 100</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-500 text-white font-semibold text-sm">B (Baik)</span>
              <span className="text-sm text-gray-700">75 - 89</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-yellow-500 text-white font-semibold text-sm">C (Cukup)</span>
              <span className="text-sm text-gray-700">60 - 74</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-semibold text-sm">D (Kurang)</span>
              <span className="text-sm text-gray-700">50 - 59</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-red-500 text-white font-semibold text-sm">E (Sangat Kurang)</span>
              <span className="text-sm text-gray-700">0 - 49</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600"><strong>Catatan:</strong> Nilai Akhir = (Tugas × 30%) + (UTS × 30%) + (UAS × 40%)</p>
            <p className="text-sm text-gray-600 mt-1"><strong>Info:</strong> Data akan otomatis disimpan ke database saat tombol "Simpan Semua Nilai" ditekan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NilaiRaporPage;