import React, { useState } from 'react';
import { UserPlus, Shield, UserCheck, UserX, Trash2 } from 'lucide-react';

interface AccountData {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'recruiter';
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export function AdminAccounts() {
  // Data inisial pengelola sistem TalentHub
  const [accounts, setAccounts] = useState<AccountData[]>([
    { id: 'ADM-001', username: 'superadmin', email: 'superadmin@talenthub.com', role: 'superadmin', status: 'Active', createdAt: '2026-01-10' },
    { id: 'ADM-002', username: 'Siti Admin', email: 'siti.admin@talenthub.com', role: 'admin', status: 'Active', createdAt: '2026-02-14' },
    { id: 'ADM-003', username: 'Rian Recruiter', email: 'rian.recruiter@talenthub.com', role: 'recruiter', status: 'Active', createdAt: '2026-03-22' },
  ]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-50 text-red-700 border-red-200 font-extrabold';
      case 'admin':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-bold';
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Bagian Atas: Judul & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Daftar Akun Pengelola Sistem</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manajemen hak akses dan kredensial pengguna internal HRIS</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap">
          <UserPlus size={14} />
          <span>Tambah Admin Baru</span>
        </button>
      </div>

      {/* Tabel Utama Konten Akun */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 min-w-[800px]">
            <thead className="text-[11px] text-slate-400 bg-slate-50/80 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">ID Admin</th>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Email Penugasan</th>
                <th className="px-5 py-3.5">Tingkat Akses (Role)</th>
                <th className="px-5 py-3.5">Status Akun</th>
                <th className="px-5 py-3.5">Tanggal Dibuat</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-slate-400 font-mono">{account.id}</td>
                  <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-2">
                    {account.role === 'superadmin' && <Shield size={14} className="text-red-500 flex-shrink-0" />}
                    <span>{account.username}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-normal">{account.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded-md ${getRoleBadge(account.role)}`}>
                      {account.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-full text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 whitespace-nowrap">{account.createdAt}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        title="Ubah Status Akses"
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        <UserX size={13} />
                      </button>
                      <button 
                        disabled={account.role === 'superadmin'}
                        title={account.role === 'superadmin' ? 'Superadmin Utama tidak bisa dihapus' : 'Hapus Akun'}
                        className={`p-1.5 border rounded-lg transition-colors ${
                          account.role === 'superadmin' 
                            ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' 
                            : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100 cursor-pointer'
                        }`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
