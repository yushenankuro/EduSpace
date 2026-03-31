import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import Select from "react-select";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserGraduate, FaChalkboardTeacher, FaSchool } from "react-icons/fa";

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
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Bahasa Jepang",
  "Basis Data",
  "Pemrograman Web",
  "Pemrograman Mobile",
  "Pemrograman Desktop",
  "Pendidikan Agama",
  "PJOK",
  "PKN",
  "PKK",
  "Mapil",
  "Matematika",
  "Sejarah",
];

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    nisn: "",
    birth_date: "",
    student_gender: "",
  });
  const [teacherFormData, setTeacherFormData] = useState<TeacherFormData>({
    name: "",
    email: "",
    subjects: [],
    teacher_gender: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [teacherPhotoFile, setTeacherPhotoFile] = useState<File | null>(null);
  const [teacherPhotoPreview, setTeacherPhotoPreview] = useState<string>("");
  const [uploadingTeacher, setUploadingTeacher] = useState(false);

  const [currentPageStudents, setCurrentPageStudents] = useState(1);
  const [currentPageTeachers, setCurrentPageTeachers] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      setError("Gagal memuat data siswa");
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
    } catch (err: any) {
      console.error("Error fetch teachers:", err);
    }
  };

  const getTakenSubjects = () => {
    const taken: string[] = [];
    teachers.forEach((teacher) => {
      if (teacher.id !== editingTeacherId && teacher.subjects) {
        taken.push(...teacher.subjects);
      }
    });
    return taken;
  };

  const getAvailableSubjects = () => {
    const takenSubjects = getTakenSubjects();
    return allSubjects
      .filter((subject) => !takenSubjects.includes(subject))
      .map((subject) => ({ value: subject, label: subject }));
  };

  const openStudentModal = (student?: Student) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        name: student.name,
        email: student.email,
        nisn: student.nisn,
        birth_date: student.birth_date,
        student_gender: student.student_gender,
      });
      setPhotoPreview(student.photo_url || "");
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        nisn: "",
        birth_date: "",
        student_gender: "",
      });
      setPhotoPreview("");
    }
    setPhotoFile(null);
    setShowStudentModal(true);
  };

  const openTeacherModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacherId(teacher.id);
      setTeacherFormData({
        name: teacher.name,
        email: teacher.email,
        subjects: teacher.subjects || [],
        teacher_gender: teacher.teacher_gender,
      });
      setTeacherPhotoPreview(teacher.photo_url || "");
    } else {
      setEditingTeacherId(null);
      setTeacherFormData({
        name: "",
        email: "",
        subjects: [],
        teacher_gender: "",
      });
      setTeacherPhotoPreview("");
    }
    setTeacherPhotoFile(null);
    setShowTeacherModal(true);
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      nisn: "",
      birth_date: "",
      student_gender: "",
    });
    setPhotoFile(null);
    setPhotoPreview("");
  };

  const closeTeacherModal = () => {
    setShowTeacherModal(false);
    setEditingTeacherId(null);
    setTeacherFormData({
      name: "",
      email: "",
      subjects: [],
      teacher_gender: "",
    });
    setTeacherPhotoFile(null);
    setTeacherPhotoPreview("");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleTeacherPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setTeacherPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setTeacherPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (
    file: File,
    identifier: string,
    bucket: string,
  ): Promise<string> => {
    try {
      const safeIdentifier = identifier.replace(/[^a-zA-Z0-9]/g, "_");
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${safeIdentifier}_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
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
    if (
      !formData.name ||
      !formData.email ||
      !formData.nisn ||
      !formData.birth_date ||
      !formData.student_gender
    ) {
      setError("Semua field harus diisi!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (formData.nisn.length !== 10) {
      setError("NISN harus 10 digit!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      setUploading(true);
      let photoUrl = "";
      if (photoFile) {
        try {
          photoUrl = await uploadPhoto(
            photoFile,
            formData.nisn,
            "student-photos",
          );
        } catch {}
      }
      const studentData = {
        ...formData,
        class: "XI RPL 1",
        photo_url: photoUrl || null,
      };
      let dbError;
      if (editingId) {
        const { error } = await supabase
          .from("students")
          .update(studentData)
          .eq("id", editingId);
        dbError = error;
      } else {
        const { error } = await supabase.from("students").insert([studentData]);
        dbError = error;
      }
      if (dbError) throw dbError;
      setSuccess(
        editingId ? "Siswa berhasil diupdate!" : "Siswa berhasil ditambahkan!",
      );
      setTimeout(() => setSuccess(""), 3000);
      await fetchStudents();
      closeStudentModal();
    } catch (err: any) {
      setError("Gagal menyimpan data siswa: " + err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !teacherFormData.name ||
      !teacherFormData.email ||
      teacherFormData.subjects.length === 0
    ) {
      setError("Semua field harus diisi dan minimal pilih 1 mata pelajaran!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      setUploadingTeacher(true);
      let photoUrl = "";
      if (teacherPhotoFile) {
        try {
          photoUrl = await uploadPhoto(
            teacherPhotoFile,
            teacherFormData.email,
            "teacher-photos",
          );
        } catch {}
      }
      const teacherData = { ...teacherFormData, photo_url: photoUrl || null };
      if (editingTeacherId) {
        const { error } = await supabase
          .from("teachers")
          .update(teacherData)
          .eq("id", editingTeacherId);
        if (error) throw error;
        setSuccess("Guru berhasil diupdate!");
      } else {
        const { error } = await supabase.from("teachers").insert([teacherData]);
        if (error) throw error;
        setSuccess("Guru berhasil ditambahkan!");
      }
      setTimeout(() => setSuccess(""), 3000);
      await fetchTeachers();
      closeTeacherModal();
    } catch (err: any) {
      setError("Gagal menyimpan data guru: " + err.message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setUploadingTeacher(false);
    }
  };

  const handleDelete = async (id: string, type: "student" | "teacher") => {
    if (
      !window.confirm(
        `Yakin ingin menghapus ${type === "student" ? "siswa" : "guru"} ini?`,
      )
    )
      return;
    try {
      const table = type === "student" ? "students" : "teachers";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      if (type === "student") setStudents(students.filter((s) => s.id !== id));
      else setTeachers(teachers.filter((t) => t.id !== id));
      setSuccess(`${type === "student" ? "Siswa" : "Guru"} berhasil dihapus!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(`Gagal menghapus: ` + err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      (t.subjects &&
        t.subjects.some((s) =>
          s.toLowerCase().includes(searchTeacher.toLowerCase()),
        )),
  );

  const totalPagesStudents = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndexStudents = (currentPageStudents - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(
    startIndexStudents,
    startIndexStudents + itemsPerPage,
  );

  const totalPagesTeachers = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndexTeachers = (currentPageTeachers - 1) * itemsPerPage;
  const currentTeachers = filteredTeachers.slice(
    startIndexTeachers,
    startIndexTeachers + itemsPerPage,
  );

  useEffect(() => setCurrentPageStudents(1), [searchTerm]);
  useEffect(() => setCurrentPageTeachers(1), [searchTeacher]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-sky-400">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ✅ Header dengan framer-motion seperti grades.tsx */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow-2xl p-8 text-white mb-2">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <FaSchool className="text-3xl" />
                  Dashboard
                </h1>
                <p className="text-teal-100">
                  Selamat datang,{" "}
                  <span className="font-bold">
                    {user?.email?.split("@")[0]}
                  </span>
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <FaUserGraduate />
                    <p className="text-sm text-teal-100">Total Siswa</p>
                  </div>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <FaChalkboardTeacher />
                    <p className="text-sm text-teal-100">Total Guru</p>
                  </div>
                  <p className="text-2xl font-bold">{teachers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 px-6 py-4 rounded-xl"
              >
                <p className="font-medium">{success}</p>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl"
              >
                <p className="font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✅ Student Section dengan motion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/50"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white">👨‍🎓</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Daftar Siswa
                    </h2>
                    <p className="text-sm text-slate-600">Kelas XI RPL 1</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none bg-white/70"
                    />
                  </div>
                  <button
                    onClick={() => openStudentModal()}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium whitespace-nowrap flex items-center gap-2"
                  >
                    <span>+</span>
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
                      Tanggal Lahir
                    </th>
                    <th className="px-6 py-4 text-center text-white font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    // ✅ Skeleton loading untuk tabel
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-200 rounded w-6"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-slate-100 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-slate-200 rounded w-28"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <div className="h-8 bg-slate-200 rounded w-16"></div>
                            <div className="h-8 bg-slate-200 rounded w-16"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : currentStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-slate-500 font-medium">
                          {searchTerm
                            ? "Tidak ada hasil pencarian"
                            : "Belum ada data siswa"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className="hover:bg-slate-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {startIndexStudents + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow">
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
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {student.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {student.email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                            {student.nisn}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${student.student_gender === "Laki-laki" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}
                          >
                            {student.student_gender === "Laki-laki"
                              ? "👨"
                              : "👩"}{" "}
                            {student.student_gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {formatDate(student.birth_date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openStudentModal(student)}
                              className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all duration-300 flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(student.id, "student")
                              }
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Students */}
            {filteredStudents.length > 0 && (
              <div className="bg-slate-50 px-6 py-6 border-t border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-600">
                    Menampilkan{" "}
                    <span className="font-semibold text-teal-600">
                      {startIndexStudents + 1}-
                      {Math.min(
                        startIndexStudents + itemsPerPage,
                        filteredStudents.length,
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-teal-600">
                      {filteredStudents.length}
                    </span>{" "}
                    siswa
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPageStudents((p) => p - 1)}
                      disabled={currentPageStudents === 1}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      ← Prev
                    </button>
                    <span className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg">
                      {currentPageStudents}
                    </span>
                    <button
                      onClick={() => setCurrentPageStudents((p) => p + 1)}
                      disabled={currentPageStudents === totalPagesStudents}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* ✅ Teacher Section dengan motion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/50"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white">👨‍🏫</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Daftar Guru
                    </h2>
                    <p className="text-sm text-slate-600">
                      Pengajar Kelas XI RPL 1
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Cari guru / mapel..."
                      value={searchTeacher}
                      onChange={(e) => setSearchTeacher(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none bg-white/70"
                    />
                  </div>
                  <button
                    onClick={() => openTeacherModal()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium whitespace-nowrap flex items-center gap-2"
                  >
                    <span>+</span>
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
                      Jenis Kelamin
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Mata Pelajaran
                    </th>
                    <th className="px-6 py-4 text-center text-white font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-slate-500 font-medium">
                          {searchTeacher
                            ? "Tidak ada hasil pencarian"
                            : "Belum ada data guru"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentTeachers.map((teacher, index) => (
                      <motion.tr
                        key={teacher.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className="hover:bg-slate-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {startIndexTeachers + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow">
                            {teacher.photo_url ? (
                              <img
                                src={teacher.photo_url}
                                alt={teacher.name}
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
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {teacher.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {teacher.email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${teacher.teacher_gender === "Laki-laki" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}
                          >
                            {teacher.teacher_gender === "Laki-laki"
                              ? "👨"
                              : "👩"}{" "}
                            {teacher.teacher_gender}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {teacher.subjects &&
                              teacher.subjects.map((subject, idx) => (
                                <span
                                  key={idx}
                                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
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
                              className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all duration-300 flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(teacher.id, "teacher")
                              }
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Teachers */}
            {filteredTeachers.length > 0 && (
              <div className="bg-slate-50 px-6 py-6 border-t border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-slate-600">
                    Menampilkan{" "}
                    <span className="font-semibold text-purple-600">
                      {startIndexTeachers + 1}-
                      {Math.min(
                        startIndexTeachers + itemsPerPage,
                        filteredTeachers.length,
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-purple-600">
                      {filteredTeachers.length}
                    </span>{" "}
                    guru
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPageTeachers((p) => p - 1)}
                      disabled={currentPageTeachers === 1}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      ← Prev
                    </button>
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                      {currentPageTeachers}
                    </span>
                    <button
                      onClick={() => setCurrentPageTeachers((p) => p + 1)}
                      disabled={currentPageTeachers === totalPagesTeachers}
                      className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Student Modal */}
      <AnimatePresence>
        {showStudentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    {editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}
                  </h3>
                  <button
                    onClick={closeStudentModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="w-40 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-lg">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg
                          className="w-12 h-12"
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
                      className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
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
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Pilih Foto
                    </label>
                    <p className="text-sm text-slate-500 mt-2">
                      Format: JPG, PNG • Maks: 2MB
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                      placeholder="Nama lengkap siswa"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      NISN *
                    </label>
                    <input
                      type="text"
                      value={formData.nisn}
                      onChange={(e) =>
                        setFormData({ ...formData, nisn: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                      placeholder="10 digit NISN"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) =>
                        setFormData({ ...formData, birth_date: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-3">
                    Jenis Kelamin *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="student_gender"
                        value="Laki-laki"
                        checked={formData.student_gender === "Laki-laki"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            student_gender: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-teal-500"
                        required
                      />
                      <span className="text-slate-700">👨 Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="student_gender"
                        value="Perempuan"
                        checked={formData.student_gender === "Perempuan"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            student_gender: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-teal-500"
                        required
                      />
                      <span className="text-slate-700">👩 Perempuan</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3.5 rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 font-semibold transition-all duration-300"
                  >
                    {uploading
                      ? "Menyimpan..."
                      : editingId
                        ? "Update Data"
                        : "Simpan Data"}
                  </button>
                  <button
                    type="button"
                    onClick={closeStudentModal}
                    className="px-8 py-3.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-300 font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teacher Modal */}
      <AnimatePresence>
        {showTeacherModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    {editingTeacherId ? "Edit Data Guru" : "Tambah Guru Baru"}
                  </h3>
                  <button
                    onClick={closeTeacherModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmitTeacher} className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="w-40 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-lg">
                    {teacherPhotoPreview ? (
                      <img
                        src={teacherPhotoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg
                          className="w-12 h-12"
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
                  <div className="flex-1">
                    <input
                      type="file"
                      id="teacher-photo"
                      accept="image/*"
                      onChange={handleTeacherPhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="teacher-photo"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
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
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Pilih Foto
                    </label>
                    <p className="text-sm text-slate-500 mt-2">
                      Format: JPG, PNG • Maks: 2MB
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={teacherFormData.name}
                      onChange={(e) =>
                        setTeacherFormData({
                          ...teacherFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                      placeholder="Nama lengkap guru"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={teacherFormData.email}
                      onChange={(e) =>
                        setTeacherFormData({
                          ...teacherFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-3">
                    Jenis Kelamin
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="teacher_gender"
                        value="Laki-laki"
                        checked={teacherFormData.teacher_gender === "Laki-laki"}
                        onChange={(e) =>
                          setTeacherFormData({
                            ...teacherFormData,
                            teacher_gender: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-slate-700">👨 Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="teacher_gender"
                        value="Perempuan"
                        checked={teacherFormData.teacher_gender === "Perempuan"}
                        onChange={(e) =>
                          setTeacherFormData({
                            ...teacherFormData,
                            teacher_gender: e.target.value,
                          })
                        }
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-slate-700">👩 Perempuan</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <Select
                    isMulti
                    options={getAvailableSubjects()}
                    value={teacherFormData.subjects.map((s) => ({
                      value: s,
                      label: s,
                    }))}
                    onChange={(selected) =>
                      setTeacherFormData({
                        ...teacherFormData,
                        subjects: selected ? selected.map((s) => s.value) : [],
                      })
                    }
                    placeholder="Pilih mata pelajaran..."
                    className="text-left"
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: "6px",
                        borderRadius: "12px",
                        borderColor: "#cbd5e1",
                        "&:hover": { borderColor: "#a855f7" },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#f3e8ff",
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: "#7e22ce",
                        fontWeight: "500",
                      }),
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    💡 Mapel yang sudah dipilih guru lain tidak bisa dipilih
                    lagi
                  </p>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={uploadingTeacher}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 font-semibold transition-all duration-300"
                  >
                    {uploadingTeacher
                      ? "Menyimpan..."
                      : editingTeacherId
                        ? "Update Data"
                        : "Simpan Data"}
                  </button>
                  <button
                    type="button"
                    onClick={closeTeacherModal}
                    className="px-8 py-3.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-300 font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
