import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import Select from 'react-select';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  nisn: string;
  birth_date: string;
  student_gender: string;
  photo_url?: string;
  created_at?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[]; // Array of subjects
  teacher_gender: string;
  photo_url?: string;
  created_at?: string;
}

interface FormData {
  name: string;
  email: string;
  nisn: string;
  birth_date: string;
  student_gender: string;
}

interface TeacherFormData {
  name: string;
  email: string;
  teacher_gender: string;
  subjects: string[];
}

// Daftar semua mata pelajaran
const allSubjects = [
  'Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Jepang', 'Basis Data',
  'Pemrograman Web', 'Pemrograman Mobile', 'Pemrograman Desktop',
  'Pendidikan Agama', 'PJOK', 'PKN', 'PKK', 'Mapil', 'Matematika', 'Sejarah'
];

const Dashboard: React.FC = () => {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    nisn: '',
    birth_date: '',
    student_gender: ''
  });

  const [teacherFormData, setTeacherFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    subjects: [],
    teacher_gender: ''
  });

  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');

  // State untuk upload foto
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [teacherPhotoFile, setTeacherPhotoFile] = useState<File | null>(null);
  const [teacherPhotoPreview, setTeacherPhotoPreview] = useState<string>('');
  const [uploadingTeacher, setUploadingTeacher] = useState(false);

  // State untuk pagination
  const [currentPageStudents, setCurrentPageStudents] = useState(1);
  const [currentPageTeachers, setCurrentPageTeachers] = useState(1);
  const itemsPerPage = 10;

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push('/login');
      return;
    }
    setUserEmail(data.session.user.email || '');
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetch:', err);
      setError('Gagal memuat data siswa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (err: any) {
      console.error('Error fetch teachers:', err);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchStudents();
    fetchTeachers();
  }, []);

  // Get subjects yang sudah diambil guru lain
  const getTakenSubjects = () => {
    const taken: string[] = [];
    teachers.forEach(teacher => {
      if (teacher.id !== editingTeacherId && teacher.subjects) {
        taken.push(...teacher.subjects);
      }
    });
    return taken;
  };

  // Get available subjects untuk dipilih
  const getAvailableSubjects = () => {
    const takenSubjects = getTakenSubjects();
    return allSubjects
      .filter(subject => !takenSubjects.includes(subject))
      .map(subject => ({ value: subject, label: subject }));
  };

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      nisn: '',
      birth_date: '',
      student_gender: ''
    });
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleEdit = (student: Student) => {
    setShowForm(true);
    setEditingId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      nisn: student.nisn,
      birth_date: student.birth_date,
      student_gender: student.student_gender
    });
    setPhotoPreview(student.photo_url || '');
    setPhotoFile(null);
  };

  const handleAddTeacher = () => {
    setShowTeacherForm(true);
    setEditingTeacherId(null);
    setTeacherFormData({
      name: '',
      email: '',
      subjects: [],
      teacher_gender: ''
    });
    setTeacherPhotoFile(null);
    setTeacherPhotoPreview('');
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setShowTeacherForm(true);
    setEditingTeacherId(teacher.id);
    setTeacherFormData({
      name: teacher.name,
      email: teacher.email,
      subjects: teacher.subjects || [],
      teacher_gender: teacher.teacher_gender
    });
    setTeacherPhotoPreview(teacher.photo_url || '');
    setTeacherPhotoFile(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB!');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeacherPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB!');
        return;
      }
      setTeacherPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeacherPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File, identifier: string, bucket: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${identifier}_${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      throw new Error('Gagal upload foto: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.nisn || 
        !formData.birth_date || !formData.student_gender) {
      alert('Semua field harus diisi!');
      return;
    }

    if (formData.nisn.length !== 10) {
      alert('NISN harus 10 digit!');
      return;
    }

    try {
      setUploading(true);
      let photoUrl = '';

      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile, formData.nisn, 'student-photos');
      }

      const studentData = {
        ...formData,
        class: 'XI RPL 1',
        photo_url: photoUrl || undefined
      };

      if (editingId) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', editingId);

        if (error) throw error;
        alert('Siswa berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('students')
          .insert([studentData]);

        if (error) throw error;
        alert('Siswa berhasil ditambahkan!');
      }

      await fetchStudents();
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        nisn: '',
        birth_date: '',
        student_gender: ''
      });
      setPhotoFile(null);
      setPhotoPreview('');
      setEditingId(null);
    } catch (err: any) {
      console.error('Error submit:', err);
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherFormData.name || !teacherFormData.email || 
        teacherFormData.subjects.length === 0) {
      alert('Semua field harus diisi dan minimal pilih 1 mata pelajaran!');
      return;
    }

    try {
      setUploadingTeacher(true);
      let photoUrl = '';

      if (teacherPhotoFile) {
        photoUrl = await uploadPhoto(teacherPhotoFile, teacherFormData.email, 'teacher-photos');
      }

      const teacherData = {
        ...teacherFormData,
        photo_url: photoUrl || undefined
      };

      if (editingTeacherId) {
        const { error } = await supabase
          .from('teachers')
          .update(teacherData)
          .eq('id', editingTeacherId);

        if (error) throw error;
        alert('Guru berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('teachers')
          .insert([teacherData]);

        if (error) throw error;
        alert('Guru berhasil ditambahkan!');
      }

      await fetchTeachers();
      setShowTeacherForm(false);
      setTeacherFormData({
        name: '',
        email: '',
        subjects: [],
        teacher_gender: ''
      });
      setTeacherPhotoFile(null);
      setTeacherPhotoPreview('');
      setEditingTeacherId(null);
    } catch (err: any) {
      console.error('Error submit teacher:', err);
      alert('Gagal menyimpan data guru: ' + err.message);
    } finally {
      setUploadingTeacher(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus siswa ini?')) return;

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;

      setStudents(students.filter((s) => s.id !== id));
      alert('Siswa berhasil dihapus!');
    } catch (err: any) {
      alert('Gagal menghapus siswa: ' + err.message);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus guru ini?')) return;

    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) throw error;

      setTeachers(teachers.filter((t) => t.id !== id));
      alert('Guru berhasil dihapus!');
    } catch (err: any) {
      alert('Gagal menghapus guru: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter data siswa
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nisn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter data guru
  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
    (teacher.subjects && teacher.subjects.some(s => 
      s.toLowerCase().includes(searchTeacher.toLowerCase())
    ))
  );

  // Pagination untuk siswa
  const totalPagesStudents = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndexStudents = (currentPageStudents - 1) * itemsPerPage;
  const endIndexStudents = startIndexStudents + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndexStudents, endIndexStudents);

  // Pagination untuk guru
  const totalPagesTeachers = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndexTeachers = (currentPageTeachers - 1) * itemsPerPage;
  const endIndexTeachers = startIndexTeachers + itemsPerPage;
  const currentTeachers = filteredTeachers.slice(startIndexTeachers, endIndexTeachers);

  // Fungsi untuk mengubah halaman
  const handlePageChangeStudents = (page: number) => {
    setCurrentPageStudents(page);
  };

  const handlePageChangeTeachers = (page: number) => {
    setCurrentPageTeachers(page);
  };

  // Reset halaman saat search berubah
  useEffect(() => {
    setCurrentPageStudents(1);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPageTeachers(1);
  }, [searchTeacher]);

  // Komponen pagination
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    color = 'teal'
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    color?: string;
  }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    const colorClasses = {
      teal: 'bg-teal-500 hover:bg-teal-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      blue: 'bg-blue-500 hover:bg-blue-600'
    };

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        {/* Tombol Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : `${colorClasses[color as keyof typeof colorClasses]} text-white`
          } transition-colors`}
        >
          &larr; Prev
        </button>

        {/* Halaman pertama */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`px-4 py-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} text-white`}
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {/* Nomor halaman */}
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === page
                ? 'bg-gray-800 text-white'
                : `${colorClasses[color as keyof typeof colorClasses]} text-white`
            } transition-colors`}
          >
            {page}
          </button>
        ))}

        {/* Halaman terakhir */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-4 py-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} text-white`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Tombol Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : `${colorClasses[color as keyof typeof colorClasses]} text-white`
          } transition-colors`}
        >
          Next &rarr;
        </button>

        {/* Info halaman */}
        <div className="ml-4 text-sm text-gray-600">
          Halaman <span className="font-bold">{currentPage}</span> dari <span className="font-bold">{totalPages}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mb-4"></div>
            <div className="text-slate-700 text-xl">Memuat data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Daftar Kelas XI RPL 1</h1>
          <p className="text-slate-700 text-lg">Selamat datang, <b>{userEmail}</b>!</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {/* ===================  TABEL SISWA =================== */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
          {/* Header dengan Search */}
          <div className="px-6 py-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Daftar Siswa</h2>
                <p className="text-slate-600 mt-1">
                  Total: {students.length} siswa | 
                  Ditampilkan: {currentStudents.length} dari {filteredStudents.length} hasil pencarian
                </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Cari siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 md:w-64 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                />

                <button
                  onClick={handleAdd}
                  className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 transition-colors shadow-md font-medium whitespace-nowrap"
                >
                  + Tambah Siswa
                </button>
              </div>
            </div>
          </div>

          {/* Form Siswa */}
          {showForm && (
            <div className="px-6 py-6 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                {editingId ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Upload Foto */}
                <div className="flex gap-4 items-start">
                  <div className="w-32 h-40 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
                    >
                      📷 Pilih Foto
                    </label>
                    <p className="text-sm text-slate-500 mt-2">Max 2MB (JPG, PNG)</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nama Lengkap *"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="px-4 py-3 border rounded-xl"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="px-4 py-3 border rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    placeholder="NISN (10 digit) *"
                    value={formData.nisn}
                    onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                    className="px-4 py-3 border rounded-xl"
                    required
                    maxLength={10}
                  />
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className="px-4 py-3 border rounded-xl"
                    required
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="student_gender"
                      value="Laki-laki"
                      checked={formData.student_gender === 'Laki-laki'}
                      onChange={(e) => setFormData({...formData, student_gender: e.target.value})}
                      required
                    />
                    👨 Laki-laki
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="student_gender"
                      value="Perempuan"
                      checked={formData.student_gender === 'Perempuan'}
                      onChange={(e) => setFormData({...formData, student_gender: e.target.value})}
                      required
                    />
                    👩 Perempuan
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 disabled:opacity-50"
                  >
                    {uploading ? '⏳ Menyimpan...' : '💾 Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({name:'', email:'', nisn:'', birth_date:'', student_gender:''});
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}
                    className="bg-slate-400 text-white px-6 py-3 rounded-full hover:bg-slate-500"
                  >
                    ✖️ Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabel Siswa */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Foto</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Nama</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">NISN</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Jenis Kelamin</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Tanggal Lahir</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-lg font-medium">
                        {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data siswa'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700">{startIndexStudents + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{student.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-700">{student.nisn}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          student.student_gender === 'Laki-laki' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {student.student_gender === 'Laki-laki' ? '👨' : '👩'} {student.student_gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{student.email}</td>
                      <td className="px-6 py-4 text-slate-700">{formatDate(student.birth_date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination untuk Siswa */}
          {filteredStudents.length > 0 && (
            <div className="bg-slate-50 px-6 py-6 border-t border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-600">
                  Menampilkan <span className="font-semibold text-teal-600">{startIndexStudents + 1}-{Math.min(endIndexStudents, filteredStudents.length)}</span> dari{' '}
                  <span className="font-semibold text-teal-600">{filteredStudents.length}</span> siswa
                  {searchTerm && ' (hasil pencarian)'}
                </p>
                
                <Pagination
                  currentPage={currentPageStudents}
                  totalPages={totalPagesStudents}
                  onPageChange={handlePageChangeStudents}
                  color="teal"
                />
              </div>
            </div>
          )}
        </div>

        {/* ===================  TABEL GURU =================== */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header dengan Search */}
          <div className="px-6 py-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Daftar Guru</h2>
                <p className="text-slate-600 mt-1">
                  Total: {teachers.length} guru | 
                  Ditampilkan: {currentTeachers.length} dari {filteredTeachers.length} hasil pencarian
                </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Cari guru / mapel..."
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                  className="flex-1 md:w-64 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />

                <button
                  onClick={handleAddTeacher}
                  className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors shadow-md font-medium whitespace-nowrap"
                >
                  + Tambah Guru
                </button>
              </div>
            </div>
          </div>

          {/* Form Guru */}
          {showTeacherForm && (
            <div className="px-6 py-6 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                {editingTeacherId ? 'Edit Guru' : 'Tambah Guru Baru'}
              </h3>
              <form onSubmit={handleSubmitTeacher} className="space-y-4">
                {/* Upload Foto */}
                <div className="flex gap-4 items-start">
                  <div className="w-32 h-40 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                    {teacherPhotoPreview ? (
                      <img src={teacherPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="teacher-photo"
                      accept="image/*"
                      onChange={handleTeacherPhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="teacher-photo"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg cursor-pointer hover:bg-purple-600"
                    >
                      📷 Pilih Foto
                    </label>
                    <p className="text-sm text-slate-500 mt-2">Max 2MB (JPG, PNG)</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nama Lengkap *"
                    value={teacherFormData.name}
                    onChange={(e) => setTeacherFormData({...teacherFormData, name: e.target.value})}
                    className="px-4 py-3 border rounded-xl"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={teacherFormData.email}
                    onChange={(e) => setTeacherFormData({...teacherFormData, email: e.target.value})}
                    className="px-4 py-3 border rounded-xl"
                    required
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="teacher_gender"
                      value="Laki-laki"
                      checked={teacherFormData.teacher_gender === 'Laki-laki'}
                      onChange={(e) => setTeacherFormData({...teacherFormData, teacher_gender: e.target.value})}
                      required
                    />
                    👨 Laki-laki
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="teacher_gender"
                      value="Perempuan"
                      checked={teacherFormData.teacher_gender === 'Perempuan'}
                      onChange={(e) => setTeacherFormData({...teacherFormData, teacher_gender: e.target.value})}
                      required
                    />
                    👩 Perempuan
                  </label>
                </div>

                {/* Multi-select Mata Pelajaran */}
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Mata Pelajaran <span className="text-red-500">*</span>
                    <span className="text-sm text-slate-500 ml-2">(Bisa pilih lebih dari 1)</span>
                  </label>
                  <Select
                    isMulti
                    options={getAvailableSubjects()}
                    value={teacherFormData.subjects.map(s => ({value: s, label: s}))}
                    onChange={(selected) => {
                      setTeacherFormData({
                        ...teacherFormData, 
                        subjects: selected ? selected.map(s => s.value) : []
                      });
                    }}
                    placeholder="Pilih mata pelajaran..."
                    className="text-left"
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: '6px',
                        borderRadius: '12px',
                        borderColor: '#cbd5e1',
                        '&:hover': { borderColor: '#a855f7' }
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#f3e8ff',
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: '#7e22ce',
                        fontWeight: '500'
                      })
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    💡 Mapel yang sudah dipilih guru lain tidak bisa dipilih lagi
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={uploadingTeacher}
                    className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 disabled:opacity-50"
                  >
                    {uploadingTeacher ? '⏳ Menyimpan...' : '💾 Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTeacherForm(false);
                      setEditingTeacherId(null);
                      setTeacherFormData({name:'', email:'', subjects:[], teacher_gender: ''});
                      setTeacherPhotoFile(null);
                      setTeacherPhotoPreview('');
                    }}
                    className="bg-slate-400 text-white px-6 py-3 rounded-full hover:bg-slate-500"
                  >
                    ✖️ Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tabel Guru */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Foto</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Nama</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Jenis Kelamin</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Mata Pelajaran</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="text-6xl mb-4">👨‍🏫</div>
                      <p className="text-lg font-medium">
                        {searchTeacher ? 'Tidak ada hasil pencarian' : 'Belum ada data guru'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentTeachers.map((teacher, index) => (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700">{startIndexTeachers + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                          {teacher.photo_url ? (
                            <img src={teacher.photo_url} alt={teacher.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{teacher.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          teacher.teacher_gender === 'Laki-laki' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {teacher.teacher_gender === 'Laki-laki' ? '👨' : '👩'} {teacher.teacher_gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{teacher.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects && teacher.subjects.map((subject, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination untuk Guru */}
          {filteredTeachers.length > 0 && (
            <div className="bg-slate-50 px-6 py-6 border-t border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-600">
                  Menampilkan <span className="font-semibold text-purple-600">{startIndexTeachers + 1}-{Math.min(endIndexTeachers, filteredTeachers.length)}</span> dari{' '}
                  <span className="font-semibold text-purple-600">{filteredTeachers.length}</span> guru
                  {searchTeacher && ' (hasil pencarian)'}
                </p>
                
                <Pagination
                  currentPage={currentPageTeachers}
                  totalPages={totalPagesTeachers}
                  onPageChange={handlePageChangeTeachers}
                  color="purple"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;