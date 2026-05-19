import { MapPin, Clock, Users, Pencil, Trash2, X, EyeOff, ExternalLink, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Job } from '../data/mockData';

const statusColors: Record<string, string> = {
  'Active': 'bg-emerald-100 text-emerald-700',
  'Closed': 'bg-slate-100 text-slate-600',
  'Draft': 'bg-yellow-100 text-yellow-700',
};

const statuses = ['Active', 'Closed', 'Draft'] as const;

function formatRupiah(num: number) {
  if (num >= 1000000) {
    const m = num / 1000000;
    return m % 1 === 0 ? `${m}jt` : `${m.toFixed(1).replace('.0', '')}jt`;
  }
  return num.toLocaleString('id-ID');
}

// Helper format tanggal lokal agar seraras dengan komponen tabel dan jadwal
function formatFriendlyDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function JobListings({ onSelectForApply }: { onSelectForApply: (id: number) => void }) {
  const { jobs, addJob, updateJob, deleteJob, canCreateOrDelete, canCreateJobs, getJobApplicantCount } = useRecruitment();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>(''); // State validasi form internal

  const emptyForm = {
    title: '',
    department: 'Engineering',
    location: '',
    type: 'Full-time',
    status: 'Active' as const,
    minSalary: '',
    maxSalary: '',
    hiddenSalary: false,
    jobDescription: '',
    responsibilities: '',
    qualifications: '',
    skills: '',
    benefits: '',
    preferredEducation: 'S1',
    preferredMajors: '',
    preferredExperience: '1-2 tahun',
    preferredLastPositions: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormData(emptyForm);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setValidationError('');
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      status: job.status,
      minSalary: job.minSalary.toString(),
      maxSalary: job.maxSalary.toString(),
      hiddenSalary: job.hiddenSalary || false,
      jobDescription: job.jobDescription || '',
      responsibilities: job.responsibilities ? job.responsibilities.join('\n') : '',
      qualifications: job.qualifications ? job.qualifications.join('\n') : '',
      skills: job.skills ? job.skills.join('\n') : '',
      benefits: job.benefits ? job.benefits.join('\n') : '',
      preferredEducation: job.preferredEducation || 'S1',
      preferredMajors: job.preferredMajors ? job.preferredMajors.join('\n') : '',
      preferredExperience: job.preferredExperience || '1-2 tahun',
      preferredLastPositions: job.preferredLastPositions ? job.preferredLastPositions.join('\n') : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const minSalaryNum = Number(formData.minSalary) || 0;
    const maxSalaryNum = Number(formData.maxSalary) || 0;

    // VALIDASI INTEGRITAS DATA: Cegah kesalahan logika rentang gaji sebelum dikirim ke Supabase
    if (minSalaryNum > maxSalaryNum) {
      setValidationError('Gaji minimum tidak boleh lebih besar dari gaji maksimum.');
      return;
    }

    setIsSubmitting(true);

    const jobData = {
      title: formData.title.trim(),
      department: formData.department,
      location: formData.location.trim(),
      type: formData.type,
      status: formData.status,
      minSalary: minSalaryNum,
      maxSalary: maxSalaryNum,
      hiddenSalary: formData.hiddenSalary,
      jobDescription: formData.jobDescription.trim(),
      responsibilities: formData.responsibilities.split('\n').map(s => s.trim()).filter(Boolean),
      qualifications: formData.qualifications.split('\n').map(s => s.trim()).filter(Boolean),
      skills: formData.skills.split('\n').map(s => s.trim()).filter(Boolean),
      benefits: formData.benefits.split('\n').map(s => s.trim()).filter(Boolean),
      preferredEducation: formData.preferredEducation,
      preferredMajors: formData.preferredMajors.split('\n').map(s => s.trim()).filter(Boolean),
      preferredExperience: formData.preferredExperience,
      preferredLastPositions: formData.preferredLastPositions.split('\n').map(s => s.trim()).filter(Boolean),
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id, jobData);
      } else {
        await addJob({
          ...jobData,
          applicants: 0,
          postedDate: new Date().toISOString().split('T')[0],
        });
      }
      setIsModalOpen(false);
      setFormData(emptyForm);
    } catch (error) {
      console.error('Gagal memproses data lowongan ke Supabase:', error);
      setValidationError('Terjadi kesalahan koneksi saat menyimpan ke cloud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsSubmitting(true);
    try {
      await deleteJob(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Gagal menghapus data lowongan di Supabase:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lowongan Pekerjaan</h1>
          <p className="text-xs text-slate-400 mt-0.5">Kelola informasi posisi pekerjaan, kriteria rekrutmen, dan status publikasi portal karir Anda</p>
        </div>
        {canCreateJobs && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm self-start sm:self-center"
          >
            + Buka Lowongan Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group relative overflow-hidden">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">{job.department}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusColors[job.status] || 'bg-slate-100 text-slate-600'}`}>{job.status}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dibuat pada {formatFriendlyDate(job.postedDate)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-100/50"><MapPin size={11} /> {job.location}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-100/50"><Clock size={11} /> {job.type}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-100/50"><Users size={11} /> {getJobApplicantCount(job.title)} Pelamar</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-2">
              <div className="flex items-center gap-2">
                {job.hiddenSalary ? (
                  <span className="text-[11px] font-medium text-slate-400 italic flex items-center gap-1"><EyeOff size={12} /> Gaji Dirahasiakan</span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Rp {formatRupiah(job.minSalary)} - {formatRupiah(job.maxSalary)}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelectForApply(job.id)}
                  title="Lihat Link Eksternal Portal Lamaran Kerja"
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <ExternalLink size={15} />
                </button>
                {canCreateOrDelete && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(job)}
                      title="Edit Lowongan Kerja"
                      className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-amber-600 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(job.id)}
                      title="Hapus Lowongan Kerja"
                      className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{editingJob ? 'Edit Lowongan Kerja' : 'Buka Lowongan Pekerjaan Baru'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Lengkapi data kriteria lowongan yang akan diterbitkan ke portal rekrutmen</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
              {validationError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
                  <AlertTriangle size={16} />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Jabatan / Posisi Pekerjaan *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Contoh: Senior Frontend Engineer" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Departemen / Divisi *</label>
                  <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                    <option value="Engineering">Engineering / IT</option>
                    <option value="Design">Design / Creative</option>
                    <option value="Product">Product Management</option>
                    <option value="Marketing">Marketing & Sales</option>
                    <option value="HR & Legal">HR, GA & Legal</option>
                    <option value="Finance">Finance & Accounting</option>
                    <option value="Operations">Operations & Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status Publikasi Lowongan *</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                    {statuses.map(s => <option key={s} value={s}>{s === 'Active' ? 'Active (Tayang)' : s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi Penempatan *</label>
                  <input required type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Contoh: Jakarta (Hybrid) / WFH" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kontrak Kerja *</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                    <option value="Full-time">Full-time (Penuh Waktu)</option>
                    <option value="Part-time">Part-time (Paruh Waktu)</option>
                    <option value="Contract">Contract (Kontrak)</option>
                    <option value="Internship">Internship (Magang)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gaji Minimum Bulanan (Rp) *</label>
                  <input required type="number" value={formData.minSalary} onChange={e => setFormData({ ...formData, minSalary: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Contoh: 6000000" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gaji Maksimum Bulanan (Rp) *</label>
                  <input required type="number" value={formData.maxSalary} onChange={e => setFormData({ ...formData, maxSalary: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Contoh: 12000000" />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 py-1 bg-slate-50 px-3.5 rounded-xl border border-slate-100">
                  <input type="checkbox" id="hiddenSalary" checked={formData.hiddenSalary} onChange={e => setFormData({ ...formData, hiddenSalary: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="hiddenSalary" className="text-xs font-medium text-slate-600 select-none cursor-pointer">Sembunyikan Rentang Gaji dari Publik (Tampilkan status "Dirahasiakan")</label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-3 text-indigo-600">Deskripsi & Kriteria Utama Pekerjaan</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Ringkas Pekerjaan *</label>
                    <textarea required rows={3} value={formData.jobDescription} onChange={e => setFormData({ ...formData, jobDescription: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Tuliskan gambaran umum posisi ini..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggung Jawab Utama (Satu kriteria per baris) *</label>
                    <textarea required rows={3} value={formData.responsibilities} onChange={e => setFormData({ ...formData, responsibilities: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Contoh:&#10;Mengembangkan arsitektur web aplikasi&#10;Melakukan optimasi performa query database" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kualifikasi Utama (Satu kriteria per baris) *</label>
                    <textarea required rows={3} value={formData.qualifications} onChange={e => setFormData({ ...formData, qualifications: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Contoh:&#10;Memiliki pengalaman komersial React minimal 3 tahun&#10;Mampu berkomunikasi dengan baik" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-3 text-indigo-600">Bobot Parameter Mesin Penyaring ATS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Minimal Pendidikan *</label>
                    <select value={formData.preferredEducation} onChange={e => setFormData({ ...formData, preferredEducation: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                      <option value="SMA/SMK">SMA / SMK / Sederajat</option>
                      <option value="D3">Diploma 3 (D3)</option>
                      <option value="S1">Sarjana 1 (S1)</option>
                      <option value="S2">Magister (S2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Minimal Pengalaman Kerja *</label>
                    <select value={formData.preferredExperience} onChange={e => setFormData({ ...formData, preferredExperience: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                      <option value="Fresh Graduate">Fresh Graduate</option>
                      <option value="1-2 tahun">1 - 2 Tahun</option>
                      <option value="3-5 tahun">3 - 5 Tahun</option>
                      <option value="5-10 tahun">5 - 10 Tahun</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kata Kunci Keahlian / Skills (Satu per baris) *</label>
                    <textarea required rows={3} value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Contoh:&#10;React&#10;TypeScript&#10;TailwindCSS" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kompensasi & Benefit Tambahan (Satu per baris)</label>
                    <textarea rows={3} value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Contoh:&#10;BPJS Kesehatan & Ketenagakerjaan&#10;Tunjangan Laptop Perusahaan" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Target Jurusan Pendidikan Relevan (Satu per baris)</label>
                    <textarea rows={2} value={formData.preferredMajors} onChange={e => setFormData({ ...formData, preferredMajors: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Contoh:&#10;Teknik Informatika&#10;Sistem Informasi" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Target Jabatan Sebelumnya Relevan (Satu per baris)</label>
                    <textarea rows={2} value={formData.preferredLastPositions} onChange={e => setFormData({ ...formData, preferredLastPositions: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Contoh:&#10;Frontend Web Developer&#10;Junior Developer" />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl -mx-6 -mb-6 z-10">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan ke Cloud...' : 'Simpan Lowongan'}
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
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Lowongan?</h3>
            <p className="text-sm text-slate-500 mb-6">Lowongan akan dihapus secara permanen dari database cloud.</p>
            <div className="flex justify-center gap-3">
              <button
                disabled={isSubmitting}
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm disabled:opacity-50"
              >
                Batal
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
