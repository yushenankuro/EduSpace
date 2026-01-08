import React from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'

const UnauthorizedPage = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-400">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-slate-600 mb-6">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 transition-colors"
          >
            ← Kembali
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage