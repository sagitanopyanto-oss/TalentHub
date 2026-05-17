import { useState, useRef } from 'react';
import { useRecruitment, PortalLinkInfo } from '../context/RecruitmentContext';
import { Pencil, Trash2, X, Plus, CheckCircle2, Globe, Building, Upload, FileText, Check } from 'lucide-react';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PortalLinkManager() {
  const { portalLinks, addPortalLink, updatePortalLink, deletePortalLink, setActivePortalLink, canCreateOrDelete } = useRecruitment();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPortal, setEditingPortal] = useState<PortalLinkInfo | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    portalName: '',
    companyName: '',
    companyLogo: '',
    heroTitle: '',
    heroSubtitle: '',
    aboutCompany: '',
  });

  const handleOpenModal = (portal?: PortalLinkInfo) => {
    setLogoError('');
    if (portal) {
      setEditingPortal(portal);
      setFormData({
        portalName: portal.portalName,
        companyName: portal.companyName,
        companyLogo: portal.companyLogo,
        heroTitle: portal.heroTitle,
        heroSubtitle: portal.heroSubtitle,
        aboutCompany: portal.aboutCompany,
      });
    } else {
      setEditingPortal(null);
      setFormData({
        portalName: '',
        companyName: '',
        companyLogo: '',
        heroTitle: '',
        heroSubtitle: '',
        aboutCompany: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('File harus berupa gambar (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Ukuran gambar maksimal 2MB');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setFormData(p => ({ ...p, companyLogo: base64 }));
    } catch {
      setLogoError('Gagal memproses gambar');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPortal) {
      updatePortalLink(editingPortal.id, formData);
    } else {
      addPortalLink(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    deletePortalLink(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Manajemen Portal Karir & Link Pelamar</h3>
          <p className="text-sm text-slate-500 mt-0.5">Kelola informasi halaman portal lamaran kerja dan foto profil perusahaan</p>
        </div>
        {canCreateOrDelete && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all w-fit"
          >
            <Plus size={16} /> Buat Portal Karir
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portalLinks.map((portal) => (
          <div
            key={portal.id}
            className={`bg-white rounded-2xl border transition-all p-6 flex flex-col justify-between relative overflow-hidden ${
              portal.isActive ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10' : 'border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  {portal.companyLogo ? (
                    <img src={portal.companyLogo} alt={portal.companyName} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {portal.companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 ${
                      portal.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {portal.isActive ? <Check size={12} /> : null}
                      {portal.isActive ? 'Portal Karir Aktif (Publik)' : 'Draf Portal'}
                    </span>
                    <h4 className="font-bold text-slate-800 text-base">{portal.portalName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{portal.companyName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenModal(portal)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Portal">
                    <Pencil size={16} />
                  </button>
                  {canCreateOrDelete && portalLinks.length > 1 && (
                    <button onClick={() => setDeleteConfirmId(portal.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Hapus Portal">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2 mb-6">
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400">Judul Hero (Banner)</p>
                  <p className="text-sm font-semibold text-slate-700">{portal.heroTitle}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400">Subjudul Hero</p>
                  <p className="text-xs text-slate-600">{portal.heroSubtitle}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400">Deskripsi Perusahaan</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{portal.aboutCompany}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">ID Link: #{portal.id}</span>
              {!portal.isActive ? (
                <button
                  onClick={() => setActivePortalLink(portal.id)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Jadikan Portal Aktif
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Globe size={14} /> Ditayangkan di halaman publik
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Globe size={20} className="text-indigo-600" />
                {editingPortal ? 'Edit Portal Karir' : 'Buat Portal Karir Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  <Building size={14} className="text-slate-400" /> Nama Portal / Label Link
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Portal Utama RecruitFlow"
                  value={formData.portalName}
                  onChange={e => setFormData({ ...formData, portalName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  Nama Perusahaan
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: PT Teknologi Masa Depan"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* Upload Foto / Logo Perusahaan */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                  <Upload size={14} className="text-indigo-600" /> Foto Profil / Logo Perusahaan
                </label>
                <div className="flex items-center gap-4">
                  {formData.companyLogo ? (
                    <img src={formData.companyLogo} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-semibold text-center p-2 shrink-0 border border-slate-300">
                      No Logo
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Format PNG, JPG maks 2MB</p>
                    {formData.companyLogo && (
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, companyLogo: '' }))}
                        className="text-xs text-red-600 hover:text-red-700 font-medium mt-1 block"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
                {logoError && <p className="text-xs text-red-600 font-medium mt-1">{logoError}</p>}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  Judul Hero (Banner Utama)
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Bergabunglah Bersama Kami! 🚀"
                  value={formData.heroTitle}
                  onChange={e => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  Subjudul Hero
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Temukan peluang karir terbaik dan lamar posisi yang sesuai dengan kemampuan Anda di perusahaan kami."
                  value={formData.heroSubtitle}
                  onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  <FileText size={14} className="text-slate-400" /> Tentang Perusahaan (Deskripsi)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan profil singkat, visi, dan misi perusahaan Anda..."
                  value={formData.aboutCompany}
                  onChange={e => setFormData({ ...formData, aboutCompany: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm">
                  {editingPortal ? 'Simpan Perubahan' : 'Buat Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center border border-slate-100">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Portal Karir?</h3>
            <p className="text-sm text-slate-500 mb-6">Portal ini akan dihapus permanen. Portal lain akan otomatis menjadi aktif jika ini adalah portal publik saat ini.</p>
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
