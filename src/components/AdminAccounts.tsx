import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { AdminAccount } from '../context/RecruitmentContext';
import { Pencil, Trash2, X, UserPlus, Shield, Eye, EyeOff, Key, User, UserCheck } from 'lucide-react';

export function AdminAccounts() {
  const { adminAccounts, addAdminAccount, updateAdminAccount, deleteAdminAccount, canCreateOrDelete, currentAdmin } = useRecruitment();
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Manajemen Akun Admin</h3>
          <p className="text-sm text-slate-500 mt-0.5">Kelola akun yang memiliki akses ke panel admin</p>
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

      {!canCreateOrDelete && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
          <span>⚠️ Akun Anda (<strong>{currentAdmin?.role}</strong>) dibatasi pada hak akses <strong>Update & Review</strong>. Pembuatan atau penghapusan akun tidak diizinkan.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Akun</th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Kata Sandi</th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="text-right py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {adminAccounts.map((account) => (
              <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {account.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{account.username}</p>
                      <p className="text-xs text-slate-500">ID: #{account.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-slate-600">
                      {showPasswords[account.id] ? account.password : '••••••••'}
                    </span>
                    <button 
                      onClick={() => setShowPasswords(p => ({ ...p, [account.id]: !p[account.id] }))}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPasswords[account.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-5">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                    account.role === 'Super Admin' ? 'bg-indigo-100 text-indigo-700' :
                    account.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                    account.role === 'HR Manager' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    <Shield size={10} className="mr-1" />
                    {account.role}
                  </span>
                </td>
                <td className="py-3 px-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleOpenModal(account)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                    {canCreateOrDelete && adminAccounts.length > 1 && (
                      <button onClick={() => setDeleteConfirmId(account.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Hapus">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Key size={18} className="text-indigo-600" />
                {editingAccount ? 'Edit Akun Admin' : 'Buat Akun Admin Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                  <User size={14} className="text-slate-400" /> Username
                </label>
                <input
                  required
                  type="text"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                  <Key size={14} className="text-slate-400" /> Kata Sandi
                </label>
                <input
                  required
                  type="text"
                  placeholder="Masukkan kata sandi"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                  <UserCheck size={14} className="text-slate-400" /> Role
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm">
                  {editingAccount ? 'Simpan' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Akun Admin?</h3>
            <p className="text-sm text-slate-500 mb-6">Akun ini akan dihapus dan tidak dapat login kembali.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Batal</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
