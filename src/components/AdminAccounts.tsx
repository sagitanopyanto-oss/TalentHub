import React, { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext'; // Menghubungkan ke State Global
import { UserPlus, Shield, UserX, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export function AdminAccounts() {
  // Ambil data asli dan fungsi mutasi langsung dari Context global aplikasi Anda
  const { admins, addAdmin, updateAdminStatus, deleteAdmin, currentAdmin } = useRecruitment();
  
  // State lokal untuk handling form tambah admin baru
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'recruiter'>('recruiter');

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (addAdmin) {
      addAdmin({ username, password, email, role });
      // Reset form setelah sukses menambahkan
      setUsername('');
      setPassword('');
      setEmail('');
      setRole('recruiter');
      setShowForm(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
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
      {/* Bagian Atas: Judul & Tombol Toggle Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Daftar Akun Pengelola Sistem</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manajemen hak akses dan kredensial pengguna internal HRIS</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <UserPlus size={14} />
          <span>{showForm ? 'Batal' : 'Tambah Admin Baru'}</span>
        </button>
      </div>

      {/* Form Dinamis Tambah Admin Baru */}
      {showForm && (
        <form onSubmit={handleCreateAdmin} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Username</label>
            <input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50" placeholder="Nama user" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50" placeholder="name@company.com" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50" placeholder="••••••••" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role Akses</label>
              <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'recruiter')} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium">
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors h-[34px]">
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* Tabel Utama Konten Akun Menggunakan Data Context Global */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 min-w-[800px]">
            <thead className="text-[11px] text-slate-400 bg-slate-50/80 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Email Penugasan</th>
                <th className="px-5 py-3.5">Tingkat Akses (Role)</th>
                <th className="px-5 py-3.5">Status Akun</th>
                <th className="px-5 py-3.5 text-center">Aksi Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
              {admins && admins.map((account, index) => {
                const isSuperAdminUser = account.role?.toLowerCase() === 'superadmin';
                const isActive = account.status === 'Active';

                return (
                  <tr key={account.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-2">
                      {isSuperAdminUser && <Shield size={14} className="text-red-500 flex-shrink-0" />}
                      <span>{account.username}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-normal">{account.email || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded-md ${getRoleBadge(account.role)}`}>
                        {account.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {account.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Toggle Status Aktif / Nonaktif */}
                        <button 
                          disabled={isSuperAdminUser}
                          onClick={() => updateAdminStatus && updateAdminStatus(account.id)}
                          title={isSuperAdminUser ? 'Status Superadmin Utama Mutlak' : `Ubah ke ${isActive ? 'Inactive' : 'Active'}`}
                          className={`p-1.5 border rounded-lg transition-colors ${
                            isSuperAdminUser 
                              ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 cursor-pointer'
                          }`}
                        >
                          {isActive ?
