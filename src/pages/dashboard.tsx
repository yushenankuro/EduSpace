import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import Image from "next/image";

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  nisn: string;
  birth_date: string;
  jenis_kelamin: string;
  photo_url?: string;
  created_at?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  photo_url?: string;
  created_at?: string;
}

interface FormData {
  name: string;
  email: string;
  class: string;
  nisn: string;
  birth_date: string;
  jenis_kelamin: string;
  photo_url?: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    class: "XI RPL 1",
    nisn: "",
    birth_date: "",
    jenis_kelamin: "",
    photo_url: "",
  });

  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk upload foto
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // State untuk guru
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherSearch, setTeacherSearch] = useState("");

  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    subject: "",
  });

const [teacherPhotoFile, setTeacherPhotoFile] = useState<File | null>(null);
const [teacherPhotoPreview, setTeacherPhotoPreview] = useState("");
const [uploadingTeacher, setUploadingTeacher] = useState(false);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
      return;
    }
    setUserEmail(data.session.user.email || "");
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Data berhasil dimuat:", data);
      setStudents(data || []);
      setError("");
    } catch (err: any) {
      console.error("Error fetch:", err);
      setError("Gagal memuat data siswa: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      console.error("❌ Gagal fetch guru:", err);
    } finally {
      setLoadingTeacher(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    checkAuth();
    fetchStudents();
    fetchTeachers();
  }, []);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      class: "XI RPL 1",
      nisn: "",
      birth_date: "",
      jenis_kelamin: "",
      photo_url: "",
    });
    setPhotoFile(null);
    setPhotoPreview("");
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
      jenis_kelamin: student.jenis_kelamin,
      photo_url: student.photo_url,
    });
    setPhotoPreview(student.photo_url || "");
    setPhotoFile(null);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacherId(teacher.id);
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
    });
    setShowTeacherForm(true);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus guru ini?")) return;

    try {
      const { error } = await supabase.from("teachers").delete().eq("id", id);

      if (error) throw error;

      alert("Guru berhasil dihapus");
      setTeachers(teachers.filter((t) => t.id !== id));
    } catch (err: any) {
      alert("Gagal hapus guru: " + err.message);
    }
  };

  // Handle file input change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi file
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar!");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        // Max 2MB
        alert("Ukuran file maksimal 2MB!");
        return;
      }

      setPhotoFile(file);

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload foto ke Supabase Storage
  const uploadPhoto = async (file: File, nisn: string): Promise<string> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${nisn}_${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      console.log("📤 Uploading photo:", filePath);

      // Upload file
      const { data, error } = await supabase.storage
        .from("student-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(filePath);

      console.log("Photo uploaded:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      throw new Error("Gagal upload foto: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus siswa ini?")) return;

    try {
      // Get student data untuk hapus foto
      const student = students.find((s) => s.id === id);

      // Delete dari database
      const { error } = await supabase.from("students").delete().eq("id", id);

      if (error) throw error;

      // Delete foto dari storage (optional)
      if (student?.photo_url) {
        const path = student.photo_url.split("/").slice(-2).join("/");
        await supabase.storage.from("student-photos").remove([path]);
      }

      console.log("Siswa berhasil dihapus");
      setStudents(students.filter((s) => s.id !== id));
      alert("Siswa berhasil dihapus!");
    } catch (err: any) {
      console.error("Error delete:", err);
      alert("Gagal menghapus siswa: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.nisn ||
      !formData.birth_date ||
      !formData.class ||
      !formData.jenis_kelamin
    ) {
      alert("Semua field harus diisi!");
      return;
    }

    if (formData.nisn.length !== 10) {
      alert("NISN harus 10 digit!");
      return;
    }

    try {
      setUploading(true);
      let photoUrl = formData.photo_url || "";

      // Upload foto jika ada file baru
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile, formData.nisn);
      }

      const studentData = {
        name: formData.name,
        email: formData.email,
        nisn: formData.nisn,
        birth_date: formData.birth_date,
        class: formData.class,
        jenis_kelamin: formData.jenis_kelamin,
        photo_url: photoUrl,
      };

      if (editingId) {
        console.log("📝 Updating student:", editingId, studentData);

        const { data, error } = await supabase
          .from("students")
          .update({
            ...studentData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .select();

        if (error) throw error;
        console.log("Update berhasil:", data);
        alert("Siswa berhasil diupdate!");
      } else {
        console.log("Inserting new student:", studentData);

        const { data, error } = await supabase
          .from("students")
          .insert([studentData])
          .select();

        if (error) throw error;
        console.log("Insert berhasil:", data);
        alert("Siswa berhasil ditambahkan!");
      }

      await fetchStudents();
      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        class: "XI RPL 1",
        nisn: "",
        birth_date: "",
        jenis_kelamin: "",
        photo_url: "",
      });
      setPhotoFile(null);
      setPhotoPreview("");
      setEditingId(null);
    } catch (err: any) {
      console.error("Error submit:", err);
      alert("Gagal menyimpan data: " + err.message);
    } finally {
      setUploading(false);
    }
  };

const handleTeacherSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!teacherForm.name || !teacherForm.email || !teacherForm.subject) {
    alert("Semua field wajib diisi");
    return;
  }

  try {
    setUploadingTeacher(true);
    let photoUrl = "";

    if (teacherPhotoFile) {
      photoUrl = await uploadTeacherPhoto(
        teacherPhotoFile,
        teacherForm.email
      );
    }

    const payload = {
      ...teacherForm,
      photo_url: photoUrl || undefined,
    };

    if (editingTeacherId) {
      await supabase
        .from("teachers")
        .update(payload)
        .eq("id", editingTeacherId);
      alert("Guru diupdate");
    } else {
      await supabase.from("teachers").insert([payload]);
      alert("Guru ditambahkan");
    }

    setTeacherForm({ name: "", email: "", subject: "" });
    setTeacherPhotoFile(null);
    setTeacherPhotoPreview("");
    setShowTeacherForm(false);
    setEditingTeacherId(null);
    fetchTeachers();
  } catch (err: any) {
    alert("Gagal simpan guru: " + err.message);
  } finally {
    setUploadingTeacher(false);
  }
};

  const handleTeacherPhotoChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Format: JPG, PNG (Max 2MB)");
    return;
  }

  setTeacherPhotoFile(file);

  const reader = new FileReader();
  reader.onloadend = () => {
    setTeacherPhotoPreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};

const uploadTeacherPhoto = async (
  file: File,
  email: string
): Promise<string> => {
  const ext = file.name.split(".").pop();
  const fileName = `${email}_${Date.now()}.${ext}`;
  const filePath = `photos/${fileName}`;

  const { error } = await supabase.storage
    .from("teacher-photos")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("teacher-photos")
    .getPublicUrl(filePath);

  return data.publicUrl;
};


  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(teacherSearch.toLowerCase())
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Dashboard Admin
          </h1>
          <p className="text-slate-700 text-lg">
            Selamat datang, <b>{userEmail}</b>!
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6">
            {error}
          </div>
        )}

        <div className="mt-20 bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* HEADER */}
          <div className="px-6 py-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Daftar Siswa
              </h2>
              <p className="text-slate-600 mt-1">
                Total: {students.length} siswa
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

        {showForm && (
          <div className="px-6 py-6 bg-slate-50 border-b">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              {editingId ? "Edit Siswa" : "Tambah Siswa Baru"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* UPLOAD FOTO */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-3">
                    Foto Siswa
                  </label>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      <div className="w-40 h-48 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <svg
                              className="w-12 h-12 text-slate-400 mx-auto mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <p className="text-xs text-slate-500">
                              Preview Foto
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="photo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 cursor-pointer transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Pilih Foto
                      </label>

                      <p className="text-sm text-slate-500 mt-2">
                        Format: JPG, PNG (Max 2MB)
                      </p>

                      {photoFile && (
                        <p className="text-sm text-green-600 mt-2">
                          {photoFile.name} dipilih
                        </p>
                      )}
                    </div>
                  </div>
                </div>

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

                {/* JENIS KELAMIN */}
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
                        checked={formData.jenis_kelamin === "Laki-laki"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jenis_kelamin: e.target.value,
                          })
                        }
                        className="w-5 h-5 text-teal-500 focus:ring-2 focus:ring-teal-400 cursor-pointer"
                        required
                      />
                      <span className="ml-3 text-slate-700 font-medium group-hover:text-teal-600 transition-colors flex items-center gap-2">
                        <span className="text-2xl">👨</span>
                        Laki-laki
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="jenis_kelamin"
                        value="Perempuan"
                        checked={formData.jenis_kelamin === "Perempuan"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jenis_kelamin: e.target.value,
                          })
                        }
                        className="w-5 h-5 text-teal-500 focus:ring-2 focus:ring-teal-400 cursor-pointer"
                        required
                      />
                      <span className="ml-3 text-slate-700 font-medium group-hover:text-teal-600 transition-colors flex items-center gap-2">
                        <span className="text-2xl">👩</span>
                        Perempuan
                      </span>
                    </label>
                  </div>
                </div>

                {/* KELAS */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-2">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.class}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-not-allowed"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    ℹ️ Kelas otomatis diisi: XI RPL 1
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-teal-500 text-white px-8 py-3 rounded-full hover:bg-teal-600 transition-colors shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "⏳ Menyimpan..." : "💾 Simpan Data"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: "",
                      email: "",
                      class: "XI RPL 1",
                      nisn: "",
                      birth_date: "",
                      jenis_kelamin: "",
                      photo_url: "",
                    });
                    setPhotoFile(null);
                    setPhotoPreview("");
                  }}
                  className="flex-1 bg-slate-400 text-white px-8 py-3 rounded-full hover:bg-slate-500 transition-colors font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TABLE - sama seperti sebelumnya, tambahkan kolom foto jika perlu */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Foto
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    NISN
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Jenis Kelamin
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Tanggal Lahir
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Kelas
                  </th>
                  <th className="px-6 py-4 text-center text-white font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-lg font-medium">
                        {searchTerm
                          ? "Tidak ada hasil pencarian"
                          : "Belum ada data siswa"}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {searchTerm
                          ? "Coba kata kunci lain"
                          : 'Klik "Tambah Siswa" untuk memulai'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-700">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                          {student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {student.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-700">
                          {student.nisn}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            student.jenis_kelamin === "Laki-laki"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          <span className="text-lg">
                            {student.jenis_kelamin === "Laki-laki"
                              ? "👨"
                              : "👩"}
                          </span>
                          {student.jenis_kelamin}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatDate(student.birth_date)}
                      </td>
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
          {filteredStudents.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Menampilkan{" "}
                <span className="font-semibold text-teal-600">
                  {filteredStudents.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-teal-600">
                  {students.length}
                </span>{" "}
                siswa
              </p>
            </div>
          )}
        </div>

        {/* ===================== DATA GURU ===================== */}
        <div className="mt-20 bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* HEADER */}
          <div className="px-6 py-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Data Guru</h2>
              <p className="text-slate-600 mt-1">
                Total: {teachers.length} guru
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Cari guru / mapel..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="flex-1 md:w-64 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-400 outline-none"
              />

              <button
                onClick={() => {
                  setShowTeacherForm(true);
                  setEditingTeacherId(null);
                  setTeacherForm({ name: "", email: "", subject: "" });
                }}
                className="bg-indigo-500 text-white px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors shadow-md font-medium"
              >
                + Tambah Guru
              </button>
            </div>
          </div>

          {/* FORM */}
          {showTeacherForm && (
            <div className="px-6 py-6 bg-slate-50 border-b">
              <h3 className="text-xl font-bold mb-4">
                {editingTeacherId ? "Edit Guru" : "Tambah Guru"}
              </h3>

              <form
                onSubmit={handleTeacherSubmit}
                className="grid md:grid-cols-3 gap-4"
              >                
                <input
                  type="text"
                  placeholder="Nama Guru"
                  value={teacherForm.name}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, name: e.target.value })
                  }
                  className="px-4 py-3 border rounded-xl"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Guru"
                  value={teacherForm.email}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, email: e.target.value })
                  }
                  className="px-4 py-3 border rounded-xl"
                  required
                />
                <input
                  type="text"
                  placeholder="Mata Pelajaran"
                  value={teacherForm.subject}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, subject: e.target.value })
                  }
                  className="px-4 py-3 border rounded-xl"
                  required
                />

                <div className="md:col-span-3 flex gap-3">
                  <button className="bg-indigo-500 text-white px-6 py-3 rounded-full">
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTeacherForm(false)}
                    className="bg-slate-400 text-white px-6 py-3 rounded-full"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-white">No</th>
                  <th className="px-6 py-4 text-left text-white">Nama</th>
                  <th className="px-6 py-4 text-left text-white">Email</th>
                  <th className="px-6 py-4 text-left text-white">Mapel</th>
                  <th className="px-6 py-4 text-center text-white">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loadingTeacher ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      ⏳ Memuat guru...
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-slate-500"
                    >
                      👨‍🏫 Data guru kosong
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t, i) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">{i + 1}</td>
                      <td className="px-6 py-4 font-medium">{t.name}</td>
                      <td className="px-6 py-4">{t.email}</td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                          {t.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditTeacher(t)}
                            className="bg-amber-500 text-white px-4 py-2 rounded-lg"
                          >
                            ✏️Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                          >
                            🗑️Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
