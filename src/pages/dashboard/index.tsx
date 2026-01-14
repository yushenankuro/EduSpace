import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import Select from 'react-select';
import useAuthStore from "@/store/authStore";

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
  subjects: string[];
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

const allSubjects = [
  'Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Jepang', 'Basis Data',
  'Pemrograman Web', 'Pemrograman Mobile', 'Pemrograman Desktop',
  'Pendidikan Agama', 'PJOK', 'PKN', 'PKK', 'Mapil', 'Matematika', 'Sejarah'
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { email, role, isLoggedIn } = useAuthStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
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
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');

  // Photo upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [teacherPhotoFile, setTeacherPhotoFile] = useState<File | null>(null);
  const [teacherPhotoPreview, setTeacherPhotoPreview] = useState<string>('');
  const [uploadingTeacher, setUploadingTeacher] = useState(false);

  // Pagination states
  const [currentPageStudents, setCurrentPageStudents] = useState(1);
  const [currentPageTeachers, setCurrentPageTeachers] = useState(1);
  const itemsPerPage = 10;

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [tableAnimation, setTableAnimation] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    if (role !== 'admin' && role !== 'guru') {
      router.push('/');
      return;
    }
    
    fetchStudents();
    fetchTeachers();
    
    // Trigger animations
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setTableAnimation(true), 300);
  }, [isLoggedIn, role, router]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetch:', err);
      setError('Gagal memuat data siswa');
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

  const getTakenSubjects = () => {
    const taken: string[] = [];
    teachers.forEach(teacher => {
      if (teacher.id !== editingTeacherId && teacher.subjects) {
        taken.push(...teacher.subjects);
      }
    });
    return taken;
  };

  const getAvailableSubjects = () => {
    const takenSubjects = getTakenSubjects();
    return allSubjects
      .filter(subject => !takenSubjects.includes(subject))
      .map(subject => ({ value: subject, label: subject }));
  };

  // Student modal handlers
  const openStudentModal = (student?: Student) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        name: student.name,
        email: student.email,
        nisn: student.nisn,
        birth_date: student.birth_date,
        student_gender: student.student_gender
      });
      setPhotoPreview(student.photo_url || '');
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        nisn: '',
        birth_date: '',
        student_gender: ''
      });
      setPhotoPreview('');
    }
    setPhotoFile(null);
    setShowStudentModal(true);
  };

  // Teacher modal handlers
  const openTeacherModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacherId(teacher.id);
      setTeacherFormData({
        name: teacher.name,
        email: teacher.email,
        subjects: teacher.subjects || [],
        teacher_gender: teacher.teacher_gender
      });
      setTeacherPhotoPreview(teacher.photo_url || '');
    } else {
      setEditingTeacherId(null);
      setTeacherFormData({
        name: '',
        email: '',
        subjects: [],
        teacher_gender: ''
      });
      setTeacherPhotoPreview('');
    }
    setTeacherPhotoFile(null);
    setShowTeacherModal(true);
  };

  // Close modals
  const closeStudentModal = () => {
    setShowStudentModal(false);
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

  const closeTeacherModal = () => {
    setShowTeacherModal(false);
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar!');
        setTimeout(() => setError(''), 3000);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran file maksimal 2MB!');
        setTimeout(() => setError(''), 3000);
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
        setError('File harus berupa gambar!');
        setTimeout(() => setError(''), 3000);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran file maksimal 2MB!');
        setTimeout(() => setError(''), 3000);
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
      const safeIdentifier = identifier.replace(/[^a-zA-Z0-9]/g, '_');
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${safeIdentifier}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=random&color=fff&size=256`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.nisn || 
        !formData.birth_date || !formData.student_gender) {
      setError('Semua field harus diisi!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (formData.nisn.length !== 10) {
      setError('NISN harus 10 digit!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setUploading(true);
      let photoUrl = '';

      if (photoFile) {
        try {
          photoUrl = await uploadPhoto(photoFile, formData.nisn, 'student-photos');
        } catch {
          // Lanjut tanpa foto
        }
      }

      const studentData = {
        ...formData,
        class: 'XI RPL 1',
        photo_url: photoUrl || null
      };

      let dbError;
      if (editingId) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', editingId);
        dbError = error;
      } else {
        const { error } = await supabase
          .from('students')
          .insert([studentData]);
        dbError = error;
      }

      if (dbError) throw dbError;

      setSuccess(editingId ? 'Siswa berhasil diupdate!' : 'Siswa berhasil ditambahkan!');
      setTimeout(() => setSuccess(''), 3000);
      
      await fetchStudents();
      closeStudentModal();
      
    } catch (err: any) {
      console.error('Error submit student:', err);
      setError('Gagal menyimpan data siswa: ' + err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherFormData.name || !teacherFormData.email || 
        teacherFormData.subjects.length === 0) {
      setError('Semua field harus diisi dan minimal pilih 1 mata pelajaran!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setUploadingTeacher(true);
      let photoUrl = '';

      if (teacherPhotoFile) {
        try {
          photoUrl = await uploadPhoto(teacherPhotoFile, teacherFormData.email, 'teacher-photos');
        } catch {
          // Lanjut tanpa foto
        }
      }

      const teacherData = {
        ...teacherFormData,
        photo_url: photoUrl || null
      };

      if (editingTeacherId) {
        const { error } = await supabase
          .from('teachers')
          .update(teacherData)
          .eq('id', editingTeacherId);
        if (error) throw error;
        setSuccess('Guru berhasil diupdate!');
      } else {
        const { error } = await supabase
          .from('teachers')
          .insert([teacherData]);
        if (error) throw error;
        setSuccess('Guru berhasil ditambahkan!');
      }

      setTimeout(() => setSuccess(''), 3000);
      await fetchTeachers();
      closeTeacherModal();
      
    } catch (err: any) {
      console.error('Error submit teacher:', err);
      setError('Gagal menyimpan data guru: ' + err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingTeacher(false);
    }
  };

  const handleDelete = async (id: string, type: 'student' | 'teacher') => {
    if (!window.confirm(`Yakin ingin menghapus ${type === 'student' ? 'siswa' : 'guru'} ini?`)) return;

    try {
      const table = type === 'student' ? 'students' : 'teachers';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      if (type === 'student') {
        setStudents(students.filter((s) => s.id !== id));
      } else {
        setTeachers(teachers.filter((t) => t.id !== id));
      }

      setSuccess(`${type === 'student' ? 'Siswa' : 'Guru'} berhasil dihapus!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(`Gagal menghapus ${type === 'student' ? 'siswa' : 'guru'}: ` + err.message);
      setTimeout(() => setError(''), 3000);
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

  // Filter data
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nisn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
    (teacher.subjects && teacher.subjects.some(s => 
      s.toLowerCase().includes(searchTeacher.toLowerCase())
    ))
  );

  // Pagination logic
  const totalPagesStudents = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndexStudents = (currentPageStudents - 1) * itemsPerPage;
  const endIndexStudents = startIndexStudents + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndexStudents, endIndexStudents);

  const totalPagesTeachers = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndexTeachers = (currentPageTeachers - 1) * itemsPerPage;
  const endIndexTeachers = startIndexTeachers + itemsPerPage;
  const currentTeachers = filteredTeachers.slice(startIndexTeachers, endIndexTeachers);

  // Handle page changes
  const handlePageChangeStudents = (page: number) => setCurrentPageStudents(page);
  const handlePageChangeTeachers = (page: number) => setCurrentPageTeachers(page);

  // Reset page on search
  useEffect(() => setCurrentPageStudents(1), [searchTerm]);
  useEffect(() => setCurrentPageTeachers(1), [searchTeacher]);

  // Skeleton loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400 animate-gradient-x">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Animated Skeleton Header */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 w-64 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl mb-2 animate-shimmer bg-[length:200%_100%]"></div>
            <div className="h-6 w-96 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-shimmer bg-[length:200%_100%]"></div>
          </div>

          {/* Animated Skeleton Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 animate-scale-in">
            <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg mb-6 animate-shimmer bg-[length:200%_100%]"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl animate-shimmer bg-[length:200%_100%]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400 animate-gradient-x">
      <Navbar />
      
      <div className={`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header with Animation */}
        <div className="mb-8 text-center animate-slide-in-top">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 mb-4 shadow-lg animate-float-slow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent animate-text-focus-in">
            Dashboard Admin
          </h1>
          <p className="text-slate-600 mt-2 animate-fade-in">
            Selamat datang, <span className="font-semibold text-teal-600">{email}</span>
            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 rounded-full text-sm font-medium animate-pulse-slow">
              {role}
            </span>
          </p>
        </div>

        {/* Messages with Animation */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 text-emerald-800 px-6 py-4 rounded-xl flex items-center gap-3 animate-bounce-in">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center animate-spin-once">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium animate-text-pop-up">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3 animate-shake">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Student Section with Animation */}
        <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8 border border-white/50 transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-in-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center animate-bounce-slow">
                  <span className="text-white">👨‍🎓</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Daftar Siswa</h2>
                  <p className="text-sm text-slate-600">Kelas XI RPL 1</p>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto animate-slide-in-right">
                <div className="relative flex-1 md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none bg-white/70 transition-all duration-300 focus:scale-105"
                  />
                </div>

                <button
                  onClick={() => openStudentModal()}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium whitespace-nowrap flex items-center gap-2 hover:scale-105 active:scale-95 animate-pulse-button"
                >
                  <span className="animate-spin-once">+</span>
                  <span>Tambah Siswa</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Foto</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Nama</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">NISN</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Jenis Kelamin</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Tanggal Lahir</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center animate-bounce">
                        <span className="text-3xl">📚</span>
                      </div>
                      <p className="text-slate-500 font-medium animate-pulse">
                        {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data siswa'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student, index) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.005] animate-slide-in-row"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 text-slate-700 font-medium">{startIndexStudents + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow hover:scale-110 transition-transform duration-300">
                          {student.photo_url ? (
                            <img 
                              src={student.photo_url} 
                              alt={student.name} 
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 animate-pulse">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="group">
                          <p className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors duration-300">
                            {student.name}
                          </p>
                          <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">
                            {student.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors duration-300">
                          {student.nisn}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse-slow ${student.student_gender === 'Laki-laki' 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-pink-100 text-pink-700 hover:bg-pink-200'} transition-colors duration-300`}>
                          {student.student_gender === 'Laki-laki' ? '👨' : '👩'} {student.student_gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 group">
                        <span className="group-hover:text-slate-900 transition-colors duration-300">
                          {formatDate(student.birth_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openStudentModal(student)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-sm hover:shadow flex items-center gap-2 hover:scale-105 active:scale-95 animate-button-hover"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, 'student')}
                            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-sm hover:shadow flex items-center gap-2 hover:scale-105 active:scale-95 animate-button-hover"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-6 border-t border-slate-200 animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-600 animate-text-fade">
                  Menampilkan <span className="font-semibold text-teal-600">{startIndexStudents + 1}-{Math.min(endIndexStudents, filteredStudents.length)}</span> dari{' '}
                  <span className="font-semibold text-teal-600">{filteredStudents.length}</span> siswa
                  {searchTerm && ' (hasil pencarian)'}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChangeStudents(currentPageStudents - 1)}
                    disabled={currentPageStudents === 1}
                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg animate-pulse-slow">
                    {currentPageStudents}
                  </span>
                  <button
                    onClick={() => handlePageChangeStudents(currentPageStudents + 1)}
                    disabled={currentPageStudents === totalPagesStudents}
                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Teacher Section with Animation */}
        <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/50 transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-in-right">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-bounce-slow" style={{animationDelay: '0.2s'}}>
                  <span className="text-white">👨‍🏫</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Daftar Guru</h2>
                  <p className="text-sm text-slate-600">Pengajar Kelas XI RPL 1</p>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                <div className="relative flex-1 md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari guru / mapel..."
                    value={searchTeacher}
                    onChange={(e) => setSearchTeacher(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white/70 transition-all duration-300 focus:scale-105"
                  />
                </div>

                <button
                  onClick={() => openTeacherModal()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium whitespace-nowrap flex items-center gap-2 hover:scale-105 active:scale-95 animate-pulse-button"
                  style={{animationDelay: '0.3s'}}
                >
                  <span className="animate-spin-once">+</span>
                  <span>Tambah Guru</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-700 to-pink-800">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Foto</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Nama</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Jenis Kelamin</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Mata Pelajaran</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center animate-bounce" style={{animationDelay: '0.1s'}}>
                        <span className="text-3xl">👨‍🏫</span>
                      </div>
                      <p className="text-slate-500 font-medium animate-pulse">
                        {searchTeacher ? 'Tidak ada hasil pencarian' : 'Belum ada data guru'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentTeachers.map((teacher, index) => (
                    <tr 
                      key={teacher.id} 
                      className="hover:bg-slate-50/50 transition-all duration-300 hover:scale-[1.005] animate-slide-in-row"
                      style={{ animationDelay: `${index * 0.05 + 0.1}s` }}
                    >
                      <td className="px-6 py-4 text-slate-700 font-medium">{startIndexTeachers + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow hover:scale-110 transition-transform duration-300">
                          {teacher.photo_url ? (
                            <img 
                              src={teacher.photo_url} 
                              alt={teacher.name} 
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 animate-pulse">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="group">
                          <p className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors duration-300">
                            {teacher.name}
                          </p>
                          <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">
                            {teacher.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse-slow ${teacher.teacher_gender === 'Laki-laki' 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-pink-100 text-pink-700 hover:bg-pink-200'} transition-colors duration-300`}>
                          {teacher.teacher_gender === 'Laki-laki' ? '👨' : '👩'} {teacher.teacher_gender}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects && teacher.subjects.map((subject, idx) => (
                            <span 
                              key={idx} 
                              className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium hover:from-purple-200 hover:to-pink-200 hover:text-purple-800 transition-all duration-300 animate-bounce-subject"
                              style={{animationDelay: `${idx * 0.1}s`}}
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openTeacherModal(teacher)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-sm hover:shadow flex items-center gap-2 hover:scale-105 active:scale-95 animate-button-hover"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id, 'teacher')}
                            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-sm hover:shadow flex items-center gap-2 hover:scale-105 active:scale-95 animate-button-hover"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTeachers.length > 0 && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-6 border-t border-slate-200 animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-600 animate-text-fade">
                  Menampilkan <span className="font-semibold text-purple-600">{startIndexTeachers + 1}-{Math.min(endIndexTeachers, filteredTeachers.length)}</span> dari{' '}
                  <span className="font-semibold text-purple-600">{filteredTeachers.length}</span> guru
                  {searchTeacher && ' (hasil pencarian)'}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChangeTeachers(currentPageTeachers - 1)}
                    disabled={currentPageTeachers === 1}
                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    ← Prev
                  </button>
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg animate-pulse-slow">
                    {currentPageTeachers}
                  </span>
                  <button
                    onClick={() => handlePageChangeTeachers(currentPageTeachers + 1)}
                    disabled={currentPageTeachers === totalPagesTeachers}
                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-modal-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold animate-text-pop-up">
                  {editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </h3>
                <button
                  onClick={closeStudentModal}
                  className="text-white hover:text-gray-200 transition-colors hover:rotate-90 duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start animate-slide-in-left">
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 animate-pulse">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 animate-slide-in-right">
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pilih Foto
                  </label>
                  <p className="text-sm text-slate-500 mt-2 animate-fade-in">Format: JPG, PNG • Maks: 2MB</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Nama Lengkap *', value: formData.name, onChange: (e: any) => setFormData({...formData, name: e.target.value}), placeholder: 'Nama lengkap siswa', delay: 0 },
                  { label: 'Email *', value: formData.email, onChange: (e: any) => setFormData({...formData, email: e.target.value}), placeholder: 'email@example.com', type: 'email', delay: 0.1 },
                  { label: 'NISN *', value: formData.nisn, onChange: (e: any) => setFormData({...formData, nisn: e.target.value}), placeholder: '10 digit NISN', maxLength: 10, delay: 0.2 },
                  { label: 'Tanggal Lahir *', value: formData.birth_date, onChange: (e: any) => setFormData({...formData, birth_date: e.target.value}), type: 'date', delay: 0.3 },
                ].map((field, idx) => (
                  <div key={idx} className="animate-slide-in-up" style={{animationDelay: `${field.delay}s`}}>
                    <label className="block text-slate-700 font-medium mb-2">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-300 focus:scale-105"
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="animate-slide-in-up" style={{animationDelay: '0.4s'}}>
                <label className="block text-slate-700 font-medium mb-3">Jenis Kelamin *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 group-hover:scale-110 transition-transform duration-300 ${formData.student_gender === 'Laki-laki' ? 'border-blue-500' : 'border-slate-300'} flex items-center justify-center`}>
                      {formData.student_gender === 'Laki-laki' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-scale-in"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="student_gender"
                      value="Laki-laki"
                      checked={formData.student_gender === 'Laki-laki'}
                      onChange={(e) => setFormData({...formData, student_gender: e.target.value})}
                      className="hidden"
                      required
                    />
                    <span className="text-slate-700 group-hover:text-blue-600 transition-colors duration-300">👨 Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 group-hover:scale-110 transition-transform duration-300 ${formData.student_gender === 'Perempuan' ? 'border-pink-500' : 'border-slate-300'} flex items-center justify-center`}>
                      {formData.student_gender === 'Perempuan' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-scale-in"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="student_gender"
                      value="Perempuan"
                      checked={formData.student_gender === 'Perempuan'}
                      onChange={(e) => setFormData({...formData, student_gender: e.target.value})}
                      className="hidden"
                      required
                    />
                    <span className="text-slate-700 group-hover:text-pink-600 transition-colors duration-300">👩 Perempuan</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 animate-fade-in">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3.5 rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </span>
                  ) : editingId ? 'Update Data' : 'Simpan Data'}
                </button>
                <button
                  type="button"
                  onClick={closeStudentModal}
                  className="px-8 py-3.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-modal-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold animate-text-pop-up">
                  {editingTeacherId ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                </h3>
                <button
                  onClick={closeTeacherModal}
                  className="text-white hover:text-gray-200 transition-colors hover:rotate-90 duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitTeacher} className="p-6 space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start animate-slide-in-left">
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300">
                  {teacherPhotoPreview ? (
                    <img src={teacherPhotoPreview} alt="Preview" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 animate-pulse">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 animate-slide-in-right">
                  <input
                    type="file"
                    id="teacher-photo"
                    accept="image/*"
                    onChange={handleTeacherPhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="teacher-photo"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pilih Foto
                  </label>
                  <p className="text-sm text-slate-500 mt-2 animate-fade-in">Format: JPG, PNG • Maks: 2MB</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Nama Lengkap *', value: teacherFormData.name, onChange: (e: any) => setTeacherFormData({...teacherFormData, name: e.target.value}), placeholder: 'Nama lengkap guru', delay: 0 },
                  { label: 'Email *', value: teacherFormData.email, onChange: (e: any) => setTeacherFormData({...teacherFormData, email: e.target.value}), placeholder: 'email@example.com', type: 'email', delay: 0.1 },
                ].map((field, idx) => (
                  <div key={idx} className="animate-slide-in-up" style={{animationDelay: `${field.delay}s`}}>
                    <label className="block text-slate-700 font-medium mb-2">{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-300 focus:scale-105"
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                <label className="block text-slate-700 font-medium mb-3">Jenis Kelamin</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 group-hover:scale-110 transition-transform duration-300 ${teacherFormData.teacher_gender === 'Laki-laki' ? 'border-blue-500' : 'border-slate-300'} flex items-center justify-center`}>
                      {teacherFormData.teacher_gender === 'Laki-laki' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-scale-in"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="teacher_gender"
                      value="Laki-laki"
                      checked={teacherFormData.teacher_gender === 'Laki-laki'}
                      onChange={(e) => setTeacherFormData({...teacherFormData, teacher_gender: e.target.value})}
                      className="hidden"
                    />
                    <span className="text-slate-700 group-hover:text-blue-600 transition-colors duration-300">👨 Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 group-hover:scale-110 transition-transform duration-300 ${teacherFormData.teacher_gender === 'Perempuan' ? 'border-pink-500' : 'border-slate-300'} flex items-center justify-center`}>
                      {teacherFormData.teacher_gender === 'Perempuan' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-scale-in"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="teacher_gender"
                      value="Perempuan"
                      checked={teacherFormData.teacher_gender === 'Perempuan'}
                      onChange={(e) => setTeacherFormData({...teacherFormData, teacher_gender: e.target.value})}
                      className="hidden"
                    />
                    <span className="text-slate-700 group-hover:text-pink-600 transition-colors duration-300">👩 Perempuan</span>
                  </label>
                </div>
              </div>

              <div className="animate-slide-in-up" style={{animationDelay: '0.3s'}}>
                <label className="block text-slate-700 font-medium mb-2">
                  Mata Pelajaran <span className="text-red-500">*</span>
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
                <p className="text-xs text-slate-500 mt-2 animate-fade-in">
                  💡 Mapel yang sudah dipilih guru lain tidak bisa dipilih lagi
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 animate-fade-in">
                <button
                  type="submit"
                  disabled={uploadingTeacher}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {uploadingTeacher ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </span>
                  ) : editingTeacherId ? 'Update Data' : 'Simpan Data'}
                </button>
                <button
                  type="button"
                  onClick={closeTeacherModal}
                  className="px-8 py-3.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes slide-in-top {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-bottom {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-row {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pulse-button {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes text-focus-in {
          0% { filter: blur(12px); opacity: 0; }
          100% { filter: blur(0px); opacity: 1; }
        }
        
        @keyframes text-pop-up {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-5px) scale(1.05); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes bounce-subject {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes button-hover {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes modal-in {
          from { opacity: 0; backdrop-filter: blur(0); }
          to { opacity: 1; backdrop-filter: blur(8px); }
        }
        
        @keyframes text-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-slide-in-top {
          animation: slide-in-top 0.5s ease-out forwards;
        }
        
        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.5s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out forwards;
        }
        
        .animate-slide-in-row {
          animation: slide-in-row 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out forwards;
        }
        
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-button {
          animation: pulse-button 1s ease-in-out infinite;
        }
        
        .animate-spin-once {
          animation: spin-once 0.5s ease-out forwards;
        }
        
        .animate-text-focus-in {
          animation: text-focus-in 0.5s ease-out forwards;
        }
        
        .animate-text-pop-up {
          animation: text-pop-up 0.3s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-bounce-subject {
          animation: bounce-subject 0.5s ease-out forwards;
        }
        
        .animate-button-hover {
          animation: button-hover 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        
        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }
        
        .animate-text-fade {
          animation: text-fade 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;