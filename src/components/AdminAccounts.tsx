import React, { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Plus, ShieldAlert } from 'lucide-react';

export function AdminAccounts() {
  const { currentAdmin } = useRecruitment();
  
  // Deteksi validasi role recruiter
  const isRecruiter = currentAdmin?.role === 'recruiter';

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-lg">Daftar Akun Pengelola Sistem</h3>
        
        {/* PROTEKSI TOMBOL CREATE: Jangan render tombol "Tambah" jika akun yang login adalah recruiter */}
        {!isRecruiter ? (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
            onClick={() => {/* fungsi open modal/form tambah admin */}}
          >
            <Plus size={14} />
            <span>Tambah Admin Baru</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[11px] font-semibold">
            <ShieldAlert size={12} />
            <span>Akses Pembuatan Akun Dikunci (Recruiter)</span>
          </div>
        )}
      </div>

      {/* Konten List Table Admin Selanjutnya tetap berjalan normal untuk Super Admin... */}
    </div>
  );
}
