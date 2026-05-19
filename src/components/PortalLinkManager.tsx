import { useState, useRef } from 'react';
import { useRecruitment, PortalLinkInfo } from '../context/RecruitmentContext';
import { Pencil, Trash2, X, Plus, CheckCircle2, Globe, Building, Upload, FileText, Check, AlertTriangle } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false); // State pelindung double-submit
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
    setIsSubmitting(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // SANITASI DATA: Bersihkan spasi kosong berlebih sebelum disebarkan ke portal karir publik
    const sanitizedData = {
      portalName: formData.portalName.trim(),
      companyName: formData.companyName.trim(),
      companyLogo: formData.companyLogo,
      heroTitle: formData.heroTitle.trim(),
      heroSubtitle: formData.heroSubtitle.trim(),
      aboutCompany: formData.aboutCompany.trim(),
    };

    try {
      if (editingPortal) {
        await updatePortalLink(editingPortal.id, sanitizedData);
      } else {
        await addPortalLink(sanitizedData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Gagal memperbarui data konfigurasi portal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsSubmitting(true);
    try {
      await deletePortalLink(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Gagal menghapus portal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Portal Karir</h1>
          <p className="text-xs text-slate-400 mt-0.5">Kelola informasi halaman portal lamaran kerja dan pengaturan penjenamaan perusahaan</p>
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
                <div className="flex items-center gap-3 min-w-0">
                  {portal.companyLogo ? (
                    <img src={portal.companyLogo} alt={portal.companyName} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {portal.companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                      portal.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {portal.isActive ? <Check size={10} /> : null}
                      {portal.isActive ? 'Portal Karir Aktif (Publik)' : 'Draf Portal'}
                    </span>
                    <h4 className="font-bold text-slate-800 text-base truncate">{portal.portalName}</h4>
                    <p className="text-xs text-slate-500 font-medium truncate">{portal.companyName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenModal(portal)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Portal">
                    <Pencil size={15} />
                  </button>
                  {canCreateOrDelete && portalLinks.length > 1 && (
                    <button onClick={() => setDeleteConfirmId(portal.id)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-red-600 transition-colors" title="Hapus Portal">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-50/60 rounded-xl p-4 space-y-2 mb-6 border border-slate-100/80 text-left">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Judul Hero (Banner)</p>
                  <p className="text-sm font-bold text-slate-700 line-clamp-1">{portal.heroTitle}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Subjudul Hero</p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{portal.heroSubtitle}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Deskripsi Perusahaan</p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{portal.aboutCompany}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-slate-400">ID Link: #{portal.id}</span>
              {!portal.isActive ? (
                <button
                  disabled={isSubmitting}
                  onClick={() => setActivePortalLink(portal.id)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Globe size={18} className="text-indigo-600" />
                {editingPortal ? 'Edit Konfigurasi Portal Karir' : 'Buat Portal Karir Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  <Building size={14} className="text-slate-400" /> Nama Portal / Label Link *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Portal Utama RecruitFlow"
                  value={formData.portalName}
                  onChange={e => setFormData({ ...formData, portalName: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  Nama Perusahaan *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: PT Teknologi Masa Depan"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-[10px] font-bold text-center p-2 shrink-0 border border-slate-300 uppercase">
                      No Logo
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Format PNG, JPG, JPEG maksimal 2MB</p>
                    {formData.companyLogo && (
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, companyLogo: '' }))}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold mt-1 block w-fit"
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
                  Judul Hero (Banner Utama) *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Bergabunglah Bersama Kami! 🚀"
                  value={formData.heroTitle}
                  onChange={e => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  Subjudul Hero *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Temukan peluang karir terbaik dan lamar posisi yang sesuai dengan kemampuan Anda..."
                  value={formData.heroSubtitle}
                  onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600 mb-1">
                  <FileText size={14} className="text-slate-400" /> Tentang Perusahaan (Deskripsi) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan profil singkat, visi, dan misi perusahaan Anda..."
                  value={formData.aboutCompany}
                  onChange={e => setFormData({ ...formData, aboutCompany: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white -mx-6 -mb-6 p-6 rounded-b-2xl z-10">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold transition-colors text-sm disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity text-sm shadow-sm disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : editingPortal ? 'Simpan Perubahan' : 'Buat Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Hapus Portal Karir?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Portal ini akan dihapus permanen dari cloud. Portal lain akan otomatis menjadi aktif jika ini adalah portal publik saat ini.</p>
            <div className="flex justify-center gap-3">
              <button disabled={isSubmitting} onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold transition-colors text-sm disabled:opacity-50">Batal</button>
              <button disabled={isSubmitting} onClick={() => handleDelete(deleteConfirmId)} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-sm disabled:opacity-50">
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
