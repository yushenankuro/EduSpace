import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { supabaseBrowser } from '@/lib/supabase-browser';
import useAuthStore from '@/store/authStore';

interface ProfileData {
  email: string;
  full_name: string;
  photo_url: string;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, email, role, userId, updateProfile } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    full_name: '',
    photo_url: '',
  });

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [isLoggedIn, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile dari user_profiles table
      const { data: profile, error } = await supabaseBrowser
        .from('user_profiles') // ✅ PASTIKAN user_profiles
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
      }

      setProfileData({
        email: user.email || '',
        full_name: profile?.full_name || '',
        photo_url: profile?.photo_url || '',
      });

      setPhotoPreview(profile?.photo_url || '');
      
    } catch (err: any) {
      console.error('Error:', err);
      setError('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
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

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !userId) return null;

    try {
      setUploading(true);
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Upload ke storage
      const { error: uploadError } = await supabaseBrowser.storage
        .from('profile-photos')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabaseBrowser.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error('Gagal upload foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let photoUrl = profileData.photo_url;

      // Upload photo if changed
      if (photoFile) {
        const uploadedUrl = await uploadPhoto();
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      // ✅ UPSERT ke user_profiles, BUKAN user_roles
      const { error: updateError } = await supabaseBrowser
        .from('user_profiles') // ✅ INI YANG PENTING
        .upsert({
          user_id: userId,
          full_name: profileData.full_name,
          photo_url: photoUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      // Update Zustand store
      updateProfile(profileData.full_name, photoUrl);

      setSuccess('Profil berhasil diperbarui!');
      setPhotoFile(null);
      
      // Refresh profile
      await fetchProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Save error:', err);
      setError('Gagal menyimpan profil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Password baru tidak cocok!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter!');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabaseBrowser.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess('Password berhasil diubah!');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      setTimeout(() => setSuccess(''), 3000);

    } catch (err: any) {
      console.error('Password change error:', err);
      setError('Gagal mengubah password: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = (email: string) => {
    const name = email.split("@")[0];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=256&bold=true`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mb-4"></div>
            <div className="text-slate-700 text-xl">Memuat profil...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Profil Saya</h1>
          <p className="text-slate-700">Kelola informasi profil Anda</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative inline-block mb-4">
                  <img
                    src={photoPreview || getAvatarUrl(profileData.email)}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-teal-400"
                  />
                  {role && (
                    <div 
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white text-xs font-bold ${
                        role === 'admin' ? 'bg-teal-500' :
                        role === 'guru' ? 'bg-purple-500' :
                        'bg-blue-500'
                      }`}
                    >
                      {role === 'admin' ? 'A' : role === 'guru' ? 'G' : 'S'}
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {profileData.full_name || 'Nama Belum Diisi'}
                </h3>
                <p className="text-slate-600 mb-2">{profileData.email}</p>
                {role && (
                  <span 
                    className={`inline-block text-white text-sm px-3 py-1 rounded-full font-medium ${
                      role === 'admin' ? 'bg-teal-500' :
                      role === 'guru' ? 'bg-purple-500' :
                      'bg-blue-500'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                )}

                {/* Upload Photo Button */}
                <div className="mt-6">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg cursor-pointer hover:bg-teal-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ubah Foto
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Max 5MB (JPG, PNG)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Informasi Profil</h2>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50"
                    disabled
                  />
                  <p className="text-xs text-slate-500 mt-1">Email tidak dapat diubah</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {saving || uploading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            </div>

            {/* Password Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Keamanan</h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  {showPasswordForm ? 'Batal' : 'Ubah Password'}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Password Baru</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Ketik ulang password baru"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 disabled:opacity-50 font-semibold transition-colors"
                  >
                    {saving ? 'Mengubah...' : 'Ubah Password'}
                  </button>
                </form>
              )}

              {!showPasswordForm && (
                <p className="text-slate-600">
                  Klik "Ubah Password" untuk mengubah password akun Anda
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;