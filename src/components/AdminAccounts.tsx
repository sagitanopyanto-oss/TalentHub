import React, { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { UserPlus, Shield, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export function AdminAccounts() {
  // Menyesuaikan dengan nama variabel & fungsi asli dari RecruitmentContext.tsx
  const { 
    adminAccounts, 
    addAdminAccount, 
    updateAdminAccount, 
    deleteAdminAccount, 
    currentAdmin 
  } = useRecruitment();
  
  // State manajemen form internal
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  // Menggunakan opsi role dengan format string yang diminta user
  const [role, setRole] = useState<'admin' | 'recruiter' | 'super admin'>('recruiter');

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (addAdminAccount) {
      // Melakukan mapping otomatis ke format kapital Context jika role bernilai 'super admin'
      let finalRole: string = role;
      if (role === 'super admin') finalRole = 'Super Admin';
      if (role === 'admin') finalRole = 'Admin';
      if (role === 'recruiter') finalRole = 'Recruiter';

      // Eksekusi fungsi asli dari context
      addAdminAccount({ 
        username, 
        password, 
        role: finalRole 
      });
      
      // Reset form input setelah data berhasil masuk
      setUsername('');
      setPassword('');
      setEmail('');
      setRole('recruiter');
      setShowForm(false);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const normalized = roleName?.toLowerCase();
    if (normalized === 'super admin' || normalized === 'superadmin') {
      return 'bg-red-50 text-red-700 border-red-200 font-extrabold';
    } else if (normalized === 'admin') {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';
    } else {
      return 'bg-slate-100 text-slate-700 border-slate-200 font-bold';
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* HEADER ATAS */}
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

      {/* FORM DINAMIS TAMBAH ADMIN */}
      {showForm && (
        <form onSubmit={handleCreateAdmin} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Username</label>
            <input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none" placeholder="Nama user" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none" placeholder="name@company.com" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none" placeholder="••••••••" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role Akses</label>
              <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'recruiter' | 'super admin')} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none">
                <option value="recruiter">recruiter</option>
                <option value="admin">admin</option>
                <option value="super admin">super admin</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors h-[34px] cursor-pointer">
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* TABEL UTAMA DAFTAR ADMIN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 min-w-[800px]">
            <thead className="text-[11px] text-slate-400 bg-slate-50/80 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">ID Akun</th>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Tingkat Akses (Role)</th>
                <th className="px-5 py-3.5 text-center">Aksi Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
              {adminAccounts && adminAccounts.map((account) => {
                const normalizedRole = account.role?.toLowerCase();
                const isSuperAdminUser = normalizedRole === 'super admin' || normalizedRole === 'superadmin';
                
                // Pada sistem Anda, tidak ada field status di basis data asli, kita buat fallback Active
                const isActive = true; 

                return (
                  <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-slate-400 font-mono">ADM-00{account.id}</td>
                    <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-2">
                      {isSuperAdminUser && <Shield size={14} className="text-red-500 flex-shrink-0" />}
                      <span>{account.username}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded-md ${getRoleBadge(account.role)}`}>
                        {account.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Ubah Password / Fitur Ekstra Temp */}
                        <button 
                          disabled={isSuperAdminUser}
                          onClick={() => updateAdminAccount && updateAdminAccount(account.id, { password: 'PasswordBaru123' })}
                          title={isSuperAdminUser ? 'Akses Super Admin Mutlak' : 'Reset Password default'}
                          className={`p-1.5 border rounded-lg transition-colors ${
                            isSuperAdminUser 
                              ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 cursor-pointer'
                          }`}
                        >
                          {isActive ? <CheckCircle2 size={13} className="text-emerald-500" /> : <XCircle size={13} className="text-slate-400" />}
                        </button>

                        {/* Tombol Hapus Akun */}
                        <button 
                          disabled={isSuperAdminUser || account.username === currentAdmin?.username}
                          onClick={() => deleteAdminAccount && deleteAdminAccount(account.id)}
                          title={isSuperAdminUser ? 'Super Admin Utama tidak bisa dihapus' : 'Hapus Akun'}
                          className={`p-1.5 border rounded-lg transition-colors ${
                            (isSuperAdminUser || account.username === currentAdmin?.username)
                              ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' 
                              : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100 cursor-pointer'
                          }`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
