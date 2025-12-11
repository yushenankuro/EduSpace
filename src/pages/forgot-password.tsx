import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import { requestPasswordReset, resetPassword } from '@/services/authService';

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'token' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(''); // Untuk demo

  // Step 1: Request Reset Token
  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await requestPasswordReset(email);

    if (result.success) {
      setMessage('Token reset password telah dikirim!');
      setGeneratedToken(result.token || ''); // Untuk demo
      setStep('token');
    } else {
      setError(result.error || 'Gagal mengirim token');
    }

    setLoading(false);
  };

  // Step 2: Verify Token
  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (token.length !== 6) {
      setError('Token harus 6 digit');
      return;
    }

    setStep('password');
    setError('');
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    const result = await resetPassword(email, token, newPassword);

    if (result.success) {
      alert('✅ Password berhasil direset! Silakan login dengan password baru.');
      router.push('/login');
    } else {
      setError(result.error || 'Gagal reset password');
    }

    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Lupa Password</h2>

          {/* Progress Indicator */}
          <div className="flex justify-between mb-6">
            <div className={`flex-1 text-center ${step === 'email' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
              1. Email
            </div>
            <div className={`flex-1 text-center ${step === 'token' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
              2. Token
            </div>
            <div className={`flex-1 text-center ${step === 'password' ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>
              3. Password
            </div>
          </div>

          {message && (
            <div className="bg-green-500 text-white p-3 rounded mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-500 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <p className="text-gray-600 mb-6">
                Masukkan email Anda untuk menerima token reset password
              </p>
              
              <form onSubmit={handleRequestToken}>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                    placeholder="contoh@email.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Mengirim...' : 'Kirim Token Reset'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Token */}
          {step === 'token' && (
            <>
              <p className="text-gray-600 mb-4">
                Masukkan 6 digit token yang telah dikirim ke email Anda
              </p>

              {/* Demo Token Display */}
              {generatedToken && (
                <div className="bg-yellow-100 border border-yellow-400 p-3 rounded mb-4">
                  <p className="text-sm font-bold">DEMO MODE:</p>
                  <p className="text-sm">Token Anda: <span className="font-mono font-bold text-lg">{generatedToken}</span></p>
                  <p className="text-xs text-gray-600 mt-1">
                    *Di production, token akan dikirim via email
                  </p>
                </div>
              )}
              
              <form onSubmit={handleVerifyToken}>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Token (6 digit)</label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                    required
                    maxLength={6}
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Verifikasi Token
                </button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full mt-2 text-blue-500 hover:underline"
                >
                  Kirim ulang token
                </button>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <>
              <p className="text-gray-600 mb-6">
                Buat password baru Anda
              </p>
              
              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Password Baru (min. 6 karakter)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Mereset...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-500 hover:underline">
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;