import React, { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { UserPlus, Shield, Trash2, Edit2, Check, X } from 'lucide-react';

export function AdminAccounts() {
  // Menggunakan nama variabel dan fungsi asli dari RecruitmentContext.tsx Anda
  const { 
    adminAccounts, 
    addAdminAccount, 
    updateAdminAccount, 
    deleteAdminAccount, 
    currentAdmin 
  } = useRecruitment();
  
  // State manajemen form tambah admin baru
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'recruiter' | 'super admin'>('recruiter');

  // State untuk manajemen inline editing data admin
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'recruiter' | 'super admin'>('recruiter');

  // Fungsi konversi format role dari tampilan ke data Context (dengan Huruf Kapital)
  const formatRoleForContext = (inputRole: string): string => {
    if (inputRole === 'super admin') return 'Super Admin';
    if (inputRole === 'admin') return 'Admin';
    if (inputRole === 'recruiter') return 'Recruiter';
    return inputRole;
  };

  // Fungsi konversi format role dari data Context ke pilihan tampilan form
  const formatRoleForView = (contextRole: string): 'admin' | 'recruiter' | 'super admin' => {
    const lower = contextRole?.toLowerCase() || '';
    if (lower === 'super admin' || lower === 'superadmin') return 'super admin';
    if (lower === 'admin') return 'admin';
    return 'recruiter';
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (addAdminAccount) {
      // Menyimpan data dengan parameter wajib (username, password, role) sesuai Context
      addAdminAccount({ 
        username, 
        password, 
        role: formatRoleForContext(role) 
      });
      
      // Reset field input form
      setUsername('');
      setPassword('');
      setRole('recruiter');
      setShowForm(false);
    }
  };

  const startEditing = (account: { id: number; username: string; password?: string; role: string }) => {
    setEditingId(account.id);
    setEditUsername(account.username);
    setEditPassword(account.password || '');
    setEditRole(formatRoleForView(account.role));
  };

  const handleSaveEdit = (id: number) => {
    if (updateAdminAccount) {
      // Mengirim ID dengan tipe data 'number' sesuai spesifikasi parameter Context Anda
      updateAdminAccount(id, {
        username: editUsername,
        password: editPassword,
        role: formatRoleForContext(editRole)
      });
      setEditingId(null);
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
      {/* ATAS: HEADER & TOGGLE FORM */}
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

      {/* FORM DINAMIS TAMBAH ADMIN BARU */}
      {showForm && (
        <form onSubmit={handleCreateAdmin} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Username</label>
            <input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none" placeholder="Nama user" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none" placeholder="••••••••" />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role Akses</label>
              <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'recruiter' | 'super admin')} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none">
                <option value="recruiter">recruiter</option>
                <option value="admin">admin</option>
                <option value="super admin">super admin</option>
              </select>
            </div>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors h-[34px] cursor-pointer shadow-sm">
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* TABEL DATA PENGELOLA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 min-w-[800px]">
            <thead className="text-[11px] text-slate-400 bg-slate-50/80 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">ID Akun</th>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Password (Kredensial)</th>
                <th className="px-5 py-3.5">Tingkat Akses (Role)</th>
                <th className="px-5 py-3.5 text-center">Aksi Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
              {adminAccounts && adminAccounts.map((account) => {
                const isEditing = editingId === account.id;
                const normalizedRole = account.role?.toLowerCase();
                const isSuperAdminUser = normalizedRole === 'super admin' || normalizedRole === 'superadmin';

                return (
                  <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* ID */}
                    <td className="px-5 py-4 text-slate-400 font-mono">ADM-00{account.id}</td>
                    
                    {/* USERNAME */}
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {isEditing ? (
                        <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none bg-slate-50" />
                      ) : (
                        <div className="flex items-center gap-2">
                          {isSuperAdminUser && <Shield size={14} className="text-red-500 flex-shrink-0" />}
                          <span>{account.username}</span>
                        </div>
                      )}
                    </td>

                    {/* PASSWORD */}
                    <td className="px-5 py-4 text-slate-400 font-mono font-normal">
                      {isEditing ? (
                        <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none bg-slate-50" />
                      ) : (
                        <span>{account.password || '••••••••'}</span>
                      )}
                    </td>

                    {/* ROLE ACCESSIBILITY */}
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <select value={editRole} onChange={(e) => setEditRole(e.target.value as 'admin' | 'recruiter' | 'super admin')} className="px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none bg-slate-50 font-medium">
                          <option value="recruiter">recruiter</option>
                          <option value="admin">admin</option>
                          <option value="super admin">super admin</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded-md ${getRoleBadge(account.role)}`}>
                          {account.role}
                        </span>
                      )}
                    </td>

                    {/* AKSI EDIT DAN HAPUS */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={() => handleSaveEdit(account.id)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-600 transition-colors cursor-pointer"
                              title="Simpan Perubahan"
                            >
                              <Check size={13} />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 transition-colors cursor-pointer"
                              title="Batal"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Tombol Aktifkan Mode Edit Inline */}
                            <button 
                              onClick={() => startEditing(account)}
                              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Edit Data Pengelola"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Tombol Hapus Akun */}
                            <button 
                              disabled={account.username === currentAdmin?.username}
                              onClick={() => deleteAdminAccount && deleteAdminAccount(account.id)}
                              title={account.username === currentAdmin?.username ? 'Anda sedang menggunakan akun ini' : 'Hapus Akun'}
                              className={`p-1.5 border rounded-lg transition-colors ${
                                account.username === currentAdmin?.username
                                  ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' 
                                  : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100 cursor-pointer'
                              }`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
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
