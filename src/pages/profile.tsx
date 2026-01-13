import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { supabaseBrowser } from '@/lib/supabase-browser';
import useAuthStore from '@/store/authStore';

interface ProfileData {
  email: string;
  full_name: string;
  photo_url: string;
  gender?: string;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, email, role, userId, updateProfile, logout } = useAuthStore();

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
    gender: 'not_specified',
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'account'>('profile');

  // Password change
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
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile dari user_profiles table
      const { data: profile, error } = await supabaseBrowser
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      setProfileData({
        email: user.email || '',
        full_name: profile?.full_name || '',
        photo_url: profile?.photo_url || '',
        gender: profile?.gender || 'not_specified',
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
        setError('File harus berupa gambar!');
        setTimeout(() => setError(''), 3000);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB!');
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

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !userId) return null;

    try {
      setUploading(true);
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `user_${userId}_${Date.now()}.${fileExt}`;
      const filePath = fileName;
      
      const { error: uploadError } = await supabaseBrowser.storage
        .from('profile-photos')
        .upload(filePath, photoFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: photoFile.type
        });

      if (uploadError) throw uploadError;

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

      if (photoFile) {
        const uploadedUrl = await uploadPhoto();
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const { error: updateError } = await supabaseBrowser
        .from('user_profiles')
        .upsert({
          user_id: userId,
          full_name: profileData.full_name,
          photo_url: photoUrl,
          gender: profileData.gender || 'not_specified',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      updateProfile(profileData.full_name, photoUrl);

      setSuccess('Profil berhasil diperbarui!');
      setPhotoFile(null);
      
      await fetchProfile();

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

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Laki-laki' },
    { value: 'female', label: 'Perempuan' },
    { value: 'not_specified', label: 'Tidak Ditentukan' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 animate-pulse">
            <div className="flex space-x-8">
              <div className="w-1/4 space-y-4">
                <div className="h-48 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="w-3/4 space-y-4">
                <div className="h-12 bg-slate-200 rounded"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            Edit Profile
          </h1>
          <p className="text-slate-600">Kelola informasi dan keamanan akun Anda</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 text-emerald-800 px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
              <div className="space-y-6">
                {/* Profile Preview */}
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="relative">
                      <img
                        src={photoPreview || getAvatarUrl(profileData.email)}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20"></div>
                    </div>
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    {profileData.full_name || 'Nama Belum Diisi'}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3">{profileData.email}</p>
                  {role && (
                    <span className={`inline-block text-white text-xs px-3 py-1 rounded-full font-medium ${role === 'admin' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                      role === 'guru' ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                      'bg-gradient-to-r from-blue-500 to-cyan-600'}`}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  )}
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${activeTab === 'profile'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${activeTab === 'security'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Ubah Password
                  </button>

                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${activeTab === 'account'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pengaturan Akun
                  </button>
                </nav>

                <div className="pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Edit Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Edit Profile</h2>
                  <p className="text-slate-600">Update informasi profil Anda</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Informasi Pribadi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="John Doe"
                        />
                      </div>

                      {/* Gender Selection */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Jenis Kelamin
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {genderOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setProfileData({...profileData, gender: option.value})}
                              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                                profileData.gender === option.value
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {option.value === 'male' && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9.75 6.75a3 3 0 116 0 3 3 0 01-6 0zM4.5 9.75a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-6zM16.5 9.75a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v6a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-6z" />
                                </svg>
                              )}
                              {option.value === 'female' && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" />
                                </svg>
                              )}
                              {option.value === 'not_specified' && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6a1 1 0 011 1v.01a1 1 0 11-2 0V7a1 1 0 011-1zm0 3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1z" />
                                </svg>
                              )}
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-2">Email tidak dapat diubah</p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-6 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving || uploading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                      {saving || uploading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan...
                        </span>
                      ) : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Ubah Password</h2>
                  <p className="text-slate-600">Pastikan password Anda kuat dan aman</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Minimal 6 karakter"
                        required
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Gunakan kombinasi huruf, angka, dan simbol
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Ketik ulang password baru"
                        required
                      />
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-amber-800">Tips Keamanan</p>
                          <p className="text-xs text-amber-600 mt-1">
                            • Jangan gunakan password yang sama dengan akun lain<br/>
                            • Ganti password secara berkala<br/>
                            • Hindari informasi pribadi dalam password
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mengubah...
                        </span>
                      ) : 'Ubah Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Pengaturan Akun</h2>
                  <p className="text-slate-600">Kelola preferensi dan pengaturan akun</p>
                </div>

                <div className="space-y-8">
                  {/* Email Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Email</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-700">Email</p>
                          <p className="text-sm text-slate-500">{profileData.email}</p>
                        </div>
                        <span className="text-sm text-slate-400">Tidak dapat diubah</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Type */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Tipe Akun</h3>
                    <div className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === 'admin' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                            role === 'guru' ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                            'bg-gradient-to-r from-blue-500 to-cyan-600'}`}>
                            <span className="text-white font-bold">
                              {role === 'admin' ? 'A' : role === 'guru' ? 'G' : 'S'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">
                              {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
                            </p>
                            <p className="text-sm text-slate-500">
                              {role === 'admin' ? 'Akses penuh ke sistem' :
                                role === 'guru' ? 'Akses sebagai pengajar' :
                                'Akses sebagai siswa'}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-400">Tidak dapat diubah</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;