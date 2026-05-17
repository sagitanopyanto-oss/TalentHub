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
  const activeJobs = jobs.filter(j => j.status === 'Active');
  const activePortal = portalLinks.find(p => p.isActive) || portalLinks[0];
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cvError, setCvError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    birthDate: '',
    birthPlace: '',
    address: '',
    education: '',
    educationMajor: '',
    experience: '',
    lastPosition: '',
    workStatus: '',
    portfolioLink: '',
    coverLetter: '',
    expectedSalary: '',
    cvFileName: '',
    cvData: '',
  });

  useEffect(() => {
    if (selectedJobIdForApply !== null) {
      const job = activeJobs.find(j => j.id === selectedJobIdForApply);
      if (job) {
        setSelectedJob(job);
        setIsSubmitted(false);
      }
    }
  }, [selectedJobIdForApply]);

  const departments = ['All', ...Array.from(new Set(activeJobs.map(j => j.department)))];

  const filteredJobs = activeJobs.filter(job => {
    const matchSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = departmentFilter === 'All' || job.department === departmentFilter;
    return matchSearch && matchDept;
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', gender: 'Laki-laki', birthDate: '', birthPlace: '', address: '', education: '', educationMajor: '', experience: '', lastPosition: '', workStatus: '', portfolioLink: '', coverLetter: '', expectedSalary: '', cvFileName: '', cvData: '' });
    setCvError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setSelectedJobIdForApply(job.id);
    setIsSubmitted(false);
    resetForm();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvError('');
    const file = e.target.files?.[0];
    if (!file) {
      setFormData(p => ({ ...p, cvFileName: '', cvData: '' }));
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setCvError('Hanya file PDF yang diperbolehkan. Silakan pilih file .pdf');
      setFormData(p => ({ ...p, cvFileName: '', cvData: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.type !== 'application/pdf') {
      setCvError('Tipe file tidak valid. Hanya file dengan tipe application/pdf yang diterima.');
      setFormData(p => ({ ...p, cvFileName: '', cvData: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('Ukuran file melebihi 5MB. Silakan kompres file PDF Anda.');
      setFormData(p => ({ ...p, cvFileName: '', cvData: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setFormData(p => ({ ...p, cvFileName: file.name, cvData: base64 }));
    } catch {
      setCvError('Gagal membaca file. Silakan coba lagi.');
    }
  };

  const removeCv = () => {
    setFormData(p => ({ ...p, cvFileName: '', cvData: '' }));
    setCvError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!formData.cvData) {
      setCvError('CV wajib diunggah. Silakan pilih file PDF.');
      return;
    }
    if (!formData.expectedSalary || Number(formData.expectedSalary) <= 0) {
      setCvError('Ekspektasi gaji wajib diisi dengan angka yang valid.');
      return;
    }
    addCandidate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthPlace: formData.birthPlace,
      address: formData.address,
      position: selectedJob.title,
      department: selectedJob.department,
      education: formData.education,
      educationMajor: formData.educationMajor,
      experience: formData.experience,
      lastPosition: formData.lastPosition,
      workStatus: formData.workStatus,
      portfolioLink: formData.portfolioLink,
      coverLetter: formData.coverLetter,
      expectedSalary: formData.expectedSalary,
      stage: 'Applied',
      avatar: formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      appliedDate: new Date().toISOString().split('T')[0],
      rating: 3,
      interviewDate: '',
      assessmentDate: '',
      offerDate: '',
      medicalDate: '',
      hiredDate: '',
      cvData: formData.cvData,
      cvFileName: formData.cvFileName,
    });
    setIsSubmitted(true);
  };

  const resetView = () => {
    setSelectedJob(null);
    setSelectedJobIdForApply(null);
    setIsSubmitted(false);
    resetForm();
  };

  // ===== SUCCESS VIEW =====
  if (isSubmitted && selectedJob) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Lamaran Terkirim!</h2>
        <p className="text-slate-500 mb-6">
          Terima kasih <strong className="text-slate-700">{formData.name}</strong>! Lamaran beserta CV{' '}
          <strong className="text-indigo-600">({formData.cvFileName})</strong> untuk posisi{' '}
          <strong className="text-indigo-600">{selectedJob.title}</strong> di <strong>{activePortal.companyName}</strong> telah berhasil dikirim.
        </p>
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-slate-500 mb-1">Posisi Dilamar</p>
          <p className="font-semibold text-slate-800">{selectedJob.title}</p>
          <p className="text-xs text-slate-500 mt-2 mb-1">Departemen</p>
          <p className="font-semibold text-slate-800">{selectedJob.department}</p>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Kami akan menghubungi Anda melalui email <strong>{formData.email}</strong> jika profil Anda sesuai dengan kualifikasi.
        </p>
        <button onClick={resetView} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm">
          Lamar Posisi Lain
        </button>
      </div>
    );
  }

  // ===== FORM VIEW =====
  if (selectedJob) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Job Detail */}
        <div className="lg:col-span-2">
          <button onClick={resetView} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4">
            <ArrowLeft size={16} /> Kembali ke daftar
          </button>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              {activePortal.companyLogo ? (
                <img src={activePortal.companyLogo} alt={activePortal.companyName} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100 shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {activePortal.companyName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">Perusahaan</p>
                <h4 className="font-bold text-slate-800 text-sm truncate">{activePortal.companyName}</h4>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedJob.title}</h2>
            <p className="text-sm text-slate-500 mb-4">{selectedJob.department}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"><MapPin size={12} /> {selectedJob.location}</span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"><Clock size={12} /> {selectedJob.type}</span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"><Users size={12} /> {getJobApplicantCount(selectedJob.title)} pelamar</span>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Gaji</p>
                {selectedJob.hiddenSalary ? (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500"><EyeOff size={14} /><span className="italic">Gaji dirahasiakan</span></div>
                ) : (
                  <p className="text-sm font-bold text-emerald-600">Rp {formatRupiah(selectedJob.minSalary)} - {formatRupiah(selectedJob.maxSalary)}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Diposting pada</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(selectedJob.postedDate)}</p>
              </div>
            </div>

            {/* Detail Lowongan */}
            {selectedJob.jobDescription && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📄 Deskripsi Pekerjaan</p>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedJob.jobDescription}</p>
              </div>
            )}

            {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🎯 Tugas & Tanggung Jawab</p>
                <ul className="space-y-1.5">
                  {selectedJob.responsibilities.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex gap-1.5"><span className="text-indigo-500 shrink-0">•</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">✅ Kualifikasi</p>
                <ul className="space-y-1.5">
                  {selectedJob.qualifications.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex gap-1.5"><span className="text-emerald-500 shrink-0">✓</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🛠️ Skill yang Dibutuhkan</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.skills.map((skill, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md text-[11px] border border-indigo-200">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedJob.benefits && selectedJob.benefits.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🎁 Benefit & Tunjangan</p>
                <ul className="space-y-1">
                  {selectedJob.benefits.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex gap-1.5"><span className="text-amber-500 shrink-0">★</span><span>{item}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Application Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                Formulir Lamaran
              </h3>
              <p className="text-sm text-slate-500 mt-1">Lengkapi data diri, unggah CV dalam format PDF, dan kirim lamaran Anda</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Personal Info */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informasi Pribadi</p>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><User size={14} className="text-slate-400" /> Nama Lengkap <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="Masukkan nama lengkap Anda" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Mail size={14} className="text-slate-400" /> Email <span className="text-red-500">*</span></label>
                  <input required type="email" placeholder="email@anda.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Phone size={14} className="text-slate-400" /> No. Telepon <span className="text-red-500">*</span></label>
                  <input required type="tel" placeholder="08xx xxxx xxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value="Laki-laki" checked={formData.gender === 'Laki-laki'} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-700">Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value="Perempuan" checked={formData.gender === 'Perempuan'} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-700">Perempuan</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Lahir <span className="text-red-500">*</span></label>
                    <input required type="text" placeholder="Jakarta" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tgl Lahir <span className="text-red-500">*</span></label>
                    <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Domisili <span className="text-red-500">*</span></label>
                <textarea required rows={2} placeholder="Masukkan alamat lengkap saat ini" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>

              {/* Education & Experience */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Pendidikan & Pengalaman</p>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><GraduationCap size={14} className="text-slate-400" /> Pendidikan Terakhir <span className="text-red-500">*</span></label>
                <select required value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                  <option value="">-- Pilih Pendidikan --</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1 (Sarjana)</option>
                  <option value="S2">S2 (Magister)</option>
                  <option value="S3">S3 (Doktor)</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Briefcase size={14} className="text-slate-400" /> Pengalaman Kerja <span className="text-red-500">*</span></label>
                <select required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                  <option value="">-- Pilih Pengalaman --</option>
                  <option value="Fresh Graduate">Fresh Graduate (&lt; 1 tahun)</option>
                  <option value="1-2 tahun">1 - 2 tahun</option>
                  <option value="3-5 tahun">3 - 5 tahun</option>
                  <option value="5-10 tahun">5 - 10 tahun</option>
                  <option value="> 10 tahun">&gt; 10 tahun</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><GraduationCap size={14} className="text-slate-400" /> Jurusan Pendidikan <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="Contoh: Teknik Informatika, Manajemen, DKV" value={formData.educationMajor} onChange={e => setFormData({...formData, educationMajor: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Briefcase size={14} className="text-slate-400" /> Jabatan Terakhir/Saat Ini <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="Contoh: Frontend Developer" value={formData.lastPosition} onChange={e => setFormData({...formData, lastPosition: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Briefcase size={14} className="text-slate-400" /> Status Bekerja <span className="text-red-500">*</span></label>
                  <select required value={formData.workStatus} onChange={e => setFormData({...formData, workStatus: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                    <option value="">-- Pilih Status --</option>
                    <option value="Aktif Bekerja">Aktif Bekerja</option>
                    <option value="Tidak Aktif Bekerja">Tidak Aktif Bekerja</option>
                    <option value="Fresh Graduate">Fresh Graduate</option>
                  </select>
                </div>
              </div>

              {/* CV Upload (PDF only) */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Upload CV <span className="text-red-500">*</span></p>
              <div className={`p-4 rounded-xl border-2 border-dashed transition-colors ${cvError ? 'border-red-300 bg-red-50/50' : formData.cvData ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-300 bg-slate-50'}`}>
                {formData.cvData ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                      <File size={20} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{formData.cvFileName}</p>
                      <p className="text-xs text-emerald-600 font-medium">✓ File PDF berhasil diunggah</p>
                    </div>
                    <button type="button" onClick={removeCv} className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors" title="Hapus file">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                    <label className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                      Pilih File PDF
                      <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-xs text-slate-500 mt-1">Hanya file <strong>.PDF</strong> yang diterima (Maksimal 5MB)</p>
                  </div>
                )}
                {cvError && (
                  <div className="flex items-start gap-2 mt-3 text-xs text-red-600 bg-red-100 p-2.5 rounded-lg">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{cvError}</span>
                  </div>
                )}
              </div>

              {/* Portfolio & Cover Letter */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Tambahan</p>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><Link2 size={14} className="text-slate-400" /> Link Portfolio / LinkedIn</label>
                <input type="url" placeholder="https://linkedin.com/in/namaanda" value={formData.portfolioLink} onChange={e => setFormData({...formData, portfolioLink: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><FileText size={14} className="text-slate-400" /> Cover Letter / Pesan <span className="text-red-500">*</span></label>
                <textarea required rows={3} placeholder="Ceritakan mengapa Anda cocok untuk posisi ini..." value={formData.coverLetter} onChange={e => setFormData({...formData, coverLetter: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1"><DollarSign size={14} className="text-slate-400" /> Ekspektasi Gaji (per bulan) <span className="text-red-500">*</span></label>
                <input required type="number" placeholder="Contoh: 15000000" min="0" step="500000" value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                <p className="text-[11px] text-slate-400 mt-1">Wajib diisi. Masukkan ekspektasi gaji bulanan dalam Rupiah</p>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" onClick={resetView} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm flex items-center justify-center gap-2">
                  <Send size={14} /> Kirim Lamaran
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===== JOB LIST VIEW =====
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        {/* Company Logo & Name Header */}
        <div className="relative z-10 flex items-center gap-4 mb-6 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 self-start max-w-xl">
          {activePortal.companyLogo ? (
            <img src={activePortal.companyLogo} alt={activePortal.companyName} className="w-14 h-14 rounded-xl object-cover border border-white/20 shadow-md shrink-0" />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 border border-white/20">
              {activePortal.companyName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
              <Building size={12} /> Portal Karir Resmi
            </div>
            <h3 className="font-extrabold text-lg text-white truncate">{activePortal.companyName}</h3>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">{activePortal.heroTitle}</h2>
          <p className="text-white/90 max-w-2xl text-base md:text-lg mb-6 leading-relaxed">{activePortal.heroSubtitle}</p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 max-w-3xl mb-6">
            <p className="text-xs font-bold uppercase text-white/70 mb-1">Tentang Perusahaan</p>
            <p className="text-sm text-white/90 leading-relaxed">{activePortal.aboutCompany}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/30 flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-xs text-white/80">Lowongan Terbuka</p>
                <p className="text-xl font-bold">{activeJobs.length} Posisi</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/30 flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-purple-600 rounded-lg flex items-center justify-center font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-xs text-white/80">Departemen</p>
                <p className="text-xl font-bold">{departments.length - 1} Bidang</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari posisi atau departemen..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm min-w-[180px]">
            {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'Semua Departemen' : d}</option>)}
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Briefcase size={28} className="text-slate-400" /></div>
          <h3 className="font-semibold text-slate-800 mb-1">Tidak ada lowongan ditemukan</h3>
          <p className="text-sm text-slate-500">Coba ubah filter pencarian Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all duration-300 cursor-pointer group" onClick={() => handleSelectJob(job)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{job.department}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shrink-0"><Briefcase size={18} className="text-indigo-600" /></div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"><MapPin size={11} /> {job.location}</span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"><Clock size={11} /> {job.type}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {job.hiddenSalary ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><EyeOff size={13} /><span className="italic">Gaji dirahasiakan</span></div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Rp {formatRupiah(job.minSalary)} - {formatRupiah(job.maxSalary)}</div>
                )}
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">Lamar Sekarang →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
