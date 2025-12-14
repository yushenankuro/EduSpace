import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Select from 'react-select';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  nisn: string;
  birth_date: string;
  jenis_kelamin: string;
  created_at?: string;
}

interface FormData {
  name: string;
  email: string;
  class: string;
  nisn: string;
  birth_date: string;
  jenis_kelamin: string;
}

const classOptions = [
  { value: "X RPL 1", label: "X RPL 1" },
  { value: "X RPL 2", label: "X RPL 2" },
  { value: "XI RPL 1", label: "XI RPL 1" },
  { value: "XI RPL 2", label: "XI RPL 2" },
  { value: "XII RPL 1", label: "XII RPL 1" },
  { value: "XII RPL 2", label: "XII RPL 2" },
  { value: "XII RPL 3", label: "XII RPL 3" }
];

const Dashboard: React.FC = () => {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    class: '',
    nisn: '',
    birth_date: '',
    jenis_kelamin: ''
  });

  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // CEK LOGIN USER
  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push('/login');
      return;
    }

    setUserEmail(data.session.user.email || '');
  };

  // FETCH STUDENTS
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Data berhasil dimuat:', data);
      setStudents(data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetch:', err);
      setError('Gagal memuat data siswa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchStudents();
  }, []);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({ 
      name: '', 
      email: '', 
      class: '', 
      nisn: '', 
      birth_date: '',
      jenis_kelamin: '' 
    });
  };

  const handleEdit = (student: Student) => {
    setShowForm(true);
    setEditingId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      class: student.class,
      nisn: student.nisn,
      birth_date: student.birth_date,
      jenis_kelamin: student.jenis_kelamin
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus siswa ini?')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('Siswa berhasil dihapus');
      setStudents(students.filter((s) => s.id !== id));
      alert('Siswa berhasil dihapus!');
    } catch (err: any) {
      console.error('Error delete:', err);
      alert('Gagal menghapus siswa: ' + err.message);
    }
  };

  // SUBMIT FORM (INSERT / UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!formData.name || !formData.email || !formData.nisn || !formData.birth_date || !formData.class || !formData.jenis_kelamin) {
      alert('Semua field harus diisi!');
      return;
    }

    // Validasi NISN (10 digit)
    if (formData.nisn.length !== 10) {
      alert('NISN harus 10 digit!');
      return;
    }

    try {
      if (editingId) {
        // UPDATE
        console.log('Updating student:', editingId, formData);
        
        const { data, error } = await supabase
          .from('students')
          .update({
            name: formData.name,
            email: formData.email,
            nisn: formData.nisn,
            birth_date: formData.birth_date,
            class: formData.class,
            jenis_kelamin: formData.jenis_kelamin,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .select();

        if (error) throw error;

        console.log('Update berhasil:', data);
        alert('Siswa berhasil diupdate!');
      } else {
        // INSERT
        console.log('➕ Inserting new student:', formData);

        const { data, error } = await supabase
          .from('students')
          .insert([{
            name: formData.name,
            email: formData.email,
            nisn: formData.nisn,
            birth_date: formData.birth_date,
            class: formData.class,
            jenis_kelamin: formData.jenis_kelamin
          }])
          .select();

        if (error) throw error;

        console.log('nsert berhasil:', data);
        alert('Siswa berhasil ditambahkan!');
      }

      // Refresh data & reset form
      await fetchStudents();
      setShowForm(false);
      setFormData({ 
        name: '', 
        email: '', 
        class: '', 
        nisn: '', 
        birth_date: '',
        jenis_kelamin: '' 
      });
      setEditingId(null);

    } catch (err: any) {
      console.error(' Error submit:', err);
      alert('Gagal menyimpan data: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Filter students
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard Admin</h1>
          <p className="text-slate-700 text-lg">Selamat datang, <b>{userEmail}</b>!</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6">
            ❌ {error}
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Daftar Siswa</h2>
              <p className="text-slate-600 mt-1">Total: {students.length} siswa</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {/* Search */}
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

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              {editingId ? '✏️ Edit Siswa' : '➕ Tambah Siswa Baru'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Nama */}
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: Ahmad Rizki"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
                    placeholder="contoh@email.com"
                    required
                  />
                </div>

                {/* NISN */}
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    NISN (10 digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) =>
                      setFormData({ ...formData, nisn: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
                    placeholder="0012345678"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>

                {/* Tgl Lahir */}
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* JENIS KELAMIN - RADIO BUTTON */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-3">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="jenis_kelamin"
                        value="Laki-laki"
                        checked={formData.jenis_kelamin === 'Laki-laki'}
                        onChange={(e) =>
                          setFormData({ ...formData, jenis_kelamin: e.target.value })
                        }
                        className="w-5 h-5 text-teal-500 focus:ring-2 focus:ring-teal-400 cursor-pointer"
                        required
                      />
                      <span className="ml-3 text-slate-700 font-medium group-hover:text-teal-600 transition-colors flex items-center gap-2">
                        Laki-laki
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="jenis_kelamin"
                        value="Perempuan"
                        checked={formData.jenis_kelamin === 'Perempuan'}
                        onChange={(e) =>
                          setFormData({ ...formData, jenis_kelamin: e.target.value })
                        }
                        className="w-5 h-5 text-teal-500 focus:ring-2 focus:ring-teal-400 cursor-pointer"
                        required
                      />
                      <span className="ml-3 text-slate-700 font-medium group-hover:text-teal-600 transition-colors flex items-center gap-2">
                        Perempuan
                      </span>
                    </label>
                  </div>
                </div>

                {/* KELAS - REACT SELECT */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-2">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={classOptions}
                    value={
                      formData.class
                        ? classOptions.find(o => o.value === formData.class)
                        : null
                    }
                    onChange={(selected) =>
                      setFormData({ ...formData, class: selected?.value || "" })
                    }
                    placeholder="Pilih kelas..."
                    className="text-left"
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: '6px',
                        borderRadius: '12px',
                        borderColor: '#cbd5e1',
                        '&:hover': {
                          borderColor: '#2dd4bf'
                        }
                      })
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-teal-500 text-white px-8 py-3 rounded-full hover:bg-teal-600 transition-colors shadow-md font-medium"
                >
                  Simpan Data
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ 
                      name: '', 
                      email: '', 
                      class: '', 
                      nisn: '', 
                      birth_date: '',
                      jenis_kelamin: '' 
                    });
                  }}
                  className="flex-1 bg-slate-400 text-white px-8 py-3 rounded-full hover:bg-slate-500 transition-colors font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Nama</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">NISN</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Jenis Kelamin</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Tanggal Lahir</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Kelas</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-lg font-medium">
                        {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data siswa'}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {searchTerm ? 'Coba kata kunci lain' : 'Klik "Tambah Siswa" untuk memulai'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700">{index + 1}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{student.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-700">{student.nisn}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          student.jenis_kelamin === 'Laki-laki' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          <span className="text-lg">
                            {student.jenis_kelamin === 'Laki-laki' ? '👨' : '👩'}
                          </span>
                          {student.jenis_kelamin}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{student.email}</td>
                      <td className="px-6 py-4 text-slate-700">{formatDate(student.birth_date)}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {student.class}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
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

          {/* Footer */}
          {filteredStudents.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Menampilkan <span className="font-semibold text-teal-600">{filteredStudents.length}</span> dari{' '}
                <span className="font-semibold text-teal-600">{students.length}</span> siswa
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;