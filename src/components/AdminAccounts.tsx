import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { AdminAccount } from '../context/RecruitmentContext';
import { Pencil, Trash2, X, UserPlus, Shield, Eye, EyeOff, Key, User, UserCheck, AlertTriangle } from 'lucide-react';

export function AdminAccounts() {
  const { 
    adminAccounts, 
    addAdminAccount, 
    updateAdminAccount, 
    deleteAdminAccount, 
    canCreateOrDelete, 
    currentAdmin 
  } = useRecruitment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Admin',
  });

  const roles = ['Super Admin', 'Admin', 'HR Manager', 'Recruiter'];

  const handleOpenModal = (account?: AdminAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({ username: account.username, password: account.password, role: account.role });
    } else {
      setEditingAccount(null);
      setFormData({ username: '', password: '', role: 'Admin' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateAdminAccount(editingAccount.id, formData);
    } else {
      addAdminAccount(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    deleteAdminAccount(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Manajemen Akun Admin</h3>
          <p className="text-sm text-slate-500 mt-0.5">Kelola kredensial dan tingkat hak akses akun personil HRIS</p>
        </div>
        {canCreateOrDelete && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all w-fit"
          >
            <UserPlus size={16} /> Tambah Akun
          </button>
        )}
      </div>

      {/* Warning Alert Mode Terbatas */}
      {!canCreateOrDelete && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span>
            Akun Anda (<strong>{currentAdmin?.role || 'Staff'}</strong>) saat ini berada dalam mode akses <strong>Review & Update Terbatas</strong>. Pembuatan, pengubahan, atau penghapusan akun admin tidak diizinkan.
          </span>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Akun</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kata Sandi</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {account.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{account.username}</p>
                        <p className="text-[11px] text-slate-400 font-medium">ID: #{account.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md min-w-[80px] text-center">
                        {showPasswords[account.id] ? account.password : '••••••••'}
                      </span>
                      <button 
                        onClick={() => setShowPasswords(p => ({ ...p, [account.id]: !p[account.id] }))}
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title={showPasswords[account.id] ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showPasswords[account.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      account.role === 'Super Admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      account.role === 'Admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                      account.role === 'HR Manager' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}>
                      <Shield size={11} className="mr-1.5 shrink-0" />
                      {account.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* PERBAIKAN: Tombol Edit sekarang dikunci ketat menggunakan canCreateOrDelete */}
                      {canCreateOrDelete && (
                        <button 
                          onClick={() => handleOpenModal(account)} 
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" 
                          title="Edit Akun"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      
                      {/* Tombol Hapus */}
                      {canCreateOrDelete && adminAccounts.length > 1 && (
                        <button 
                          onClick={() => setDeleteConfirmId(account.id)} 
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" 
                          title="Hapus Akun"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Key size={18} className="text-indigo-600" />
                {editingAccount ? 'Edit Kredensial Akun' : 'Buat Akun Admin Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1.5">
                  <User size={13} className="text-slate-400" /> Username
                </label>
                <input
                  required
                  type="text"
                  placeholder="Masukkan username baru"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1.5">
                  <Key size={13} className="text-slate-400" /> Kata Sandi
                </label>
                <input
                  required
                  type="text"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold font-mono"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1.5">
                  <UserCheck size={13} className="text-slate-400" /> Tingkatan Role
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-semibold text-slate-700"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors text-xs">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-xs shadow-md shadow-indigo-600/10">
                  {editingAccount ? 'Simpan Perubahan' : 'Daftarkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-3.5">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Hapus Akun Admin?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">Akun ini akan dihapus dari basis data sistem secara permanen dan hak masuk (*access token*) akan langsung hangus.</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors text-xs">Batal</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-xs shadow-md shadow-red-600/10">Ya, Hapus Akun</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
