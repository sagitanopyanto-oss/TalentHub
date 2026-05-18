import { useState, useEffect, useRef } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Job } from '../data/mockData';
import { 
  MapPin, Clock, Users, Briefcase, Send, CheckCircle2, 
  ArrowLeft, EyeOff, Building2, FileText, Mail, Phone, 
  GraduationCap, User, Link2, Upload, AlertTriangle, X, File, Building, DollarSign
} from 'lucide-react';

function formatRupiah(num: number) {
  if (num >= 1000000) {
    const m = num / 1000000;
    return m % 1 === 0 ? `${m}jt` : `${m.toFixed(1).replace('.0', '')}jt`;
  }
  return num.toLocaleString('id-ID');
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ApplicationForm() {
  const { jobs, addCandidate, selectedJobIdForApply, setSelectedJobIdForApply, portalLinks, getJobApplicantCount } = useRecruitment();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePortal = portalLinks.find(p => p.isActive) || portalLinks[0];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Laki-laki',
    birthPlace: '',
    birthDate: '',
    address: '',
    education: 'S1',
    educationMajor: '',
    experience: '1-2 tahun',
    lastPosition: '',
    workStatus: 'Not Working',
    expectedSalary: '',
    portfolioLink: '',
    coverLetter: ''
  });

  useEffect(() => {
    if (selectedJobIdForApply) {
      const job = jobs.find(j => j.id === selectedJobIdForApply);
      if (job) setSelectedJob(job);
    } else {
      setSelectedJob(null);
    }
  }, [selectedJobIdForApply, jobs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setCvError('Hanya file PDF yang diperbolehkan');
        setCvFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setCvError('Ukuran file maksimal adalah 5MB');
        setCvFile(null);
        return;
      }
      setCvError('');
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!cvFile) {
      setCvError('Silakan unggah CV Anda terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const cvBase64 = await fileToBase64(cvFile);
      
      // Mengirimkan payload objek data pelamar yang sinkron dan aman untuk tabel Supabase
      await addCandidate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender as 'Laki-laki' | 'Perempuan',
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        address: formData.address,
        education: formData.education,
        educationMajor: formData.educationMajor,
        experience: formData.experience,
        lastPosition: formData.lastPosition,
        workStatus: formData.workStatus,
        expectedSalary: formData.expectedSalary,
        portfolioLink: formData.portfolioLink,
        coverLetter: formData.coverLetter,
        position: selectedJob.title,
        department: selectedJob.department,
        stage: 'Applied',
        appliedDate: new Date().toISOString().split('T')[0],
        avatar: formData.name.charAt(0).toUpperCase(),
        rating: 0,
        // Menggunakan null (bukan string kosong) agar sesuai dengan aturan tipe DATE/TIMESTAMPTZ di Supabase
        interviewDate: null as any,
        assessmentDate: null as any,
        offerDate: null as any,
        medicalDate: null as any,
        hiredDate: null as any,
        cvData: cvBase64,
        cvFileName: cvFile.name
      });

      setIsSuccess(true);
      setFormData({
        name: '', email: '', phone: '', gender: 'Laki-laki', birthPlace: '', birthDate: '',
        address: '', education: 'S1', educationMajor: '', experience: '1-2 tahun',
        lastPosition: '', workStatus: 'Not Working', expectedSalary: '', portfolioLink: '', coverLetter: ''
      });
      setCvFile(null);
    } catch (err) {
      console.error('Gagal mengirimkan lamaran:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeJobs = jobs.filter(j => j.status === 'Active');

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Lamaran Berhasil Dikirim!</h2>
          <p className="text-sm text-slate-500 mb-8">Terima kasih telah mendaftar. Tim HR kami akan meninjau kualifikasi Anda dan menghubungi Anda melalui email atau telepon jika Anda memenuhi kriteria.</p>
          <button 
            onClick={() => { setIsSuccess(false); setSelectedJobIdForApply(null); }}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm shadow-sm"
          >
            Kembali ke Lowongan Pekerjaan
          </button>
        </div>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => setSelectedJobIdForApply(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Kembali ke Daftar Lowongan
          </button>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2">{selectedJob.department}</span>
                  <h1 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h1>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {selectedJob.location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {selectedJob.type}</span>
                  </div>
                </div>
                {!selectedJob.hiddenSalary && (
                  <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-semibold text-sm self-start sm:self-center">
                    Rp {formatRupiah(selectedJob.minSalary)} - {formatRupiah(selectedJob.maxSalary)}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <User size={18} className="text-indigo-600" /> Informasi Pribadi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="johndoe@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Telepon / WhatsApp *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="08123456789" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin *</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tempat Lahir *</label>
                    <input required type="text" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Jakarta" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Lahir *</label>
                    <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Domisili Sekarang *</label>
                    <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Alamat lengkap Anda saat ini..." />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <GraduationCap size={18} className="text-indigo-600" /> Pendidikan & Pengalaman
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pendidikan Terakhir *</label>
                    <select name="education" value={formData.education} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                      <option value="SMA/SMK">SMA / SMK / Setara</option>
                      <option value="D3">Diploma 3 (D3)</option>
                      <option value="S1">Sarjana 1 (S1)</option>
                      <option value="S2">Magister (S2)</option>
                      <option value="S3">Doktor (S3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Jurusan / Program Studi *</label>
                    <input required type="text" name="educationMajor" value={formData.educationMajor} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Teknik Informatika, Manajemen, dll." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Total Pengalaman Kerja *</label>
                    <select name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                      <option value="Fresh Graduate">Fresh Graduate / Tanpa Pengalaman</option>
                      <option value="1-2 tahun">1 - 2 Tahun</option>
                      <option value="3-5 tahun">3 - 5 Tahun</option>
                      <option value="5-10 tahun">5 - 10 Tahun</option>
                      <option value="> 10 tahun">&gt; 10 Tahun</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Jabatan / Posisi Terakhir (Opsional)</label>
                    <input type="text" name="lastPosition" value={formData.lastPosition} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Frontend Engineer, HR Staff, dll." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status Pekerjaan Saat Ini *</label>
                    <select name="workStatus" value={formData.workStatus} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                      <option value="Working">Masih Bekerja</option>
                      <option value="Not Working">Tidak Sedang Bekerja / Open to Work</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ekspektasi Gaji Bulanan (Rp) *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-medium text-sm">Rp</div>
                      <input required type="text" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="8.500.000" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Link Portfolio (Opsional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Link2 size={16} /></div>
                      <input type="url" name="portfolioLink" value={formData.portfolioLink} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="https://github.com/username atau https://behance.net/username" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                  <FileText size={18} className="text-indigo-600" /> Dokumen Pendukung
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Unggah Berkas CV / Resume (PDF, Maks 5MB) *</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                    
                    {cvFile ? (
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0"><File size={20} /></div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 max-w-[200px] sm:max-w-md truncate">{cvFile.name}</p>
                            <p className="text-xs text-slate-400">{(cvFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setCvFile(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-indigo-300 transition-all text-center group"
                      >
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"><Upload size={20} /></div>
                        <p className="text-sm font-semibold text-slate-700">Klik untuk unggah berkas CV Anda</p>
                        <p className="text-xs text-slate-400 mt-1">Hanya menerima format berkas PDF</p>
                      </button>
                    )}
                    {cvError && (
                      <div className="flex items-center gap-2 text-xs text-red-600 mt-2"><AlertTriangle size={14} /> <span>{cvError}</span></div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Surat Lamaran / Cover Letter</label>
                    <textarea name="coverLetter" value={formData.coverLetter} onChange={handleInputChange} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" placeholder="Tuliskan surat lamaran Anda di sini atau jelaskan secara singkat mengapa Anda adalah kandidat yang tepat untuk posisi ini..." />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button" 
                  onClick={() => setSelectedJobIdForApply(null)} 
                  className="w-full sm:w-1/3 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-2/3 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>Meyimpan data ke cloud...</>
                  ) : (
                    <><Send size={16} /> Kirim Lamaran Pekerjaan</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md font-bold text-xl mb-4">
            {activePortal.companyLogo}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-3">{activePortal.heroTitle}</h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto">{activePortal.heroSubtitle}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Building2 size={18} className="text-indigo-600" /> Tentang {activePortal.companyName}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{activePortal.aboutCompany}</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Lowongan Pekerjaan Aktif</h2>
            <p className="text-xs text-slate-400 mt-0.5">Temukan posisi ideal Anda</p>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100">{activeJobs.length} Lowongan</span>
        </div>

        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 shadow-sm text-center">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-4"><Briefcase size={22} /></div>
            <p className="text-slate-600 font-medium mb-1">Saat ini belum ada lowongan pekerjaan dibuka</p>
            <p className="text-xs text-slate-400">Silakan kembali lagi di lain waktu untuk melihat pembaruan karir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeJobs.map(job => (
              <div key={job.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="inline-block text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md mb-1.5">{job.department}</span>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h3>
                    </div>
                    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"><Briefcase size={16} /></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-100/50"><MapPin size={11} /> {job.location}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-100/50"><Clock size={11} /> {job.type}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-100/50"><Users size={11} /> {getJobApplicantCount(job.title)} Pelamar</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-2">
                  {job.hiddenSalary ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 italic"><EyeOff size={11} /> Dirahasiakan</span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Rp {formatRupiah(job.minSalary)} - {formatRupiah(job.maxSalary)}</span>
                  )}
                  <button 
                    onClick={() => setSelectedJobIdForApply(job.id)}
                    className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 transition-colors"
                  >
                    Lamar Sekarang →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
