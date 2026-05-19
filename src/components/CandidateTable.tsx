import { Star, Pencil, Trash2, X, Eye, ChevronDown, ChevronUp, Calendar, FileText, Download, ExternalLink, Columns3, Cpu, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate } from '../data/mockData';
import { analyzeCandidateATS } from '../utils/atsEngine';

const stageColors: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-700',
  'Screening': 'bg-yellow-100 text-yellow-700',
  'Interview': 'bg-purple-100 text-purple-700',
  'Assessment': 'bg-orange-100 text-orange-700',
  'Offer': 'bg-emerald-100 text-emerald-700',
  'Medical': 'bg-cyan-100 text-cyan-700',
  'Hired': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const stageLabels: Record<string, string> = {
  'Applied': 'Lamaran', 'Screening': 'Screening', 'Interview': 'Interview',
  'Assessment': 'Assessment', 'Offer': 'Offering', 'Medical': 'Medical',
  'Hired': 'Hired', 'Rejected': 'Rejected',
};

const stages = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired', 'Rejected'] as const;

const allColumns = [
  { key: 'expand',        label: '',                  alwaysVisible: true,  sticky: false },
  { key: 'kandidat',      label: 'Kandidat',          alwaysVisible: true,  sticky: true  },
  { key: 'posisi',        label: 'Posisi',            alwaysVisible: true,  sticky: true  },
  { key: 'score',         label: 'Kecocokan',         alwaysVisible: true,  sticky: false },
  { key: 'tahap',         label: 'Tahap',             alwaysVisible: true,  sticky: false },
  { key: 'phone',         label: 'Telepon',           alwaysVisible: false, sticky: false },
  { key: 'email',         label: 'Email',             alwaysVisible: false, sticky: false },
  { key: 'gender',        label: 'Jenis Kelamin',     alwaysVisible: false, sticky: false },
  { key: 'education',     label: 'Pendidikan',        alwaysVisible: false, sticky: false },
  { key: 'educationMajor',label: 'Jurusan',           alwaysVisible: false, sticky: false },
  { key: 'experience',    label: 'Pengalaman',        alwaysVisible: false, sticky: false },
  { key: 'lastPosition',  label: 'Jabatan Terakhir',  alwaysVisible: false, sticky: false },
  { key: 'workStatus',    label: 'Status Kerja',      alwaysVisible: false, sticky: false },
  { key: 'expectedSalary',label: 'Ekspektasi Gaji',   alwaysVisible: false, sticky: false },
  { key: 'cv',            label: 'CV',                alwaysVisible: false, sticky: false },
  { key: 'rating',        label: 'Rating',            alwaysVisible: false, sticky: false },
  { key: 'tglLamar',      label: 'Tgl Lamar',         alwaysVisible: false, sticky: false },
  { key: 'tglInterview',  label: 'Tgl Interview',     alwaysVisible: false, sticky: false },
  { key: 'tglAssessment', label: 'Tgl Assessment',    alwaysVisible: false, sticky: false },
  { key: 'tglOffering',   label: 'Tgl Offering',      alwaysVisible: false, sticky: false },
  { key: 'tglMedical',    label: 'Tgl Medical',       alwaysVisible: false, sticky: false },
  { key: 'tglHired',      label: 'Tgl Hired',         alwaysVisible: false, sticky: false },
  { key: 'aksi',          label: 'Aksi',              alwaysVisible: true,  sticky: true  },
];

const emptyFormData = {
  name: '', email: '', phone: '',
  gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
  birthDate: '', birthPlace: '', address: '',
  position: '', department: '',
  stage: 'Applied' as Candidate['stage'], rating: 3,
  education: '', educationMajor: '', experience: '', lastPosition: '', workStatus: '',
  portfolioLink: '', coverLetter: '', expectedSalary: '',
  interviewDate: '', assessmentDate: '', offerDate: '', medicalDate: '', hiredDate: '',
  cvData: '', cvFileName: '',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
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

function downloadPdf(base64: string, filename: string) {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function CandidateTable() {
  const { candidates, jobs, addCandidate, updateCandidate, deleteCandidate, canCreateOrDelete } = useRecruitment();
  const [filter, setFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [salaryFilter, setSalaryFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [educationFilter, setEducationFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [lastPositionFilter, setLastPositionFilter] = useState('All');
  const [workStatusFilter, setWorkStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [previewCv, setPreviewCv] = useState<{ data: string; name: string } | null>(null);
  const [isColumnToggleOpen, setIsColumnToggleOpen] = useState(false);

  const toggleableColumns = allColumns.filter(c => !c.alwaysVisible);

  // LOGIKA AMBIL DEPARTEMEN DENGAN FALLBACK YANG SINKRON
  const getCandidateDepartment = (c: Candidate) => {
    if (c.department) return c.department;
    const matchedJob = jobs.find(j => j.title?.toLowerCase().trim() === c.position?.toLowerCase().trim());
    return matchedJob?.department || 'Lainnya';
  };

  // ===== Export tabel kandidat ke Excel (SINKRON 100%) =====
  const handleExportTable = () => {
    const today = new Date().toISOString().split('T')[0];
    const rows = filteredCandidates.map((c, idx) => {
      const matchingJob = jobs.find(j =>
        j.title === c.position ||
        j.title.toLowerCase().includes(c.position.toLowerCase()) ||
        c.position.toLowerCase().includes(j.title.toLowerCase())
      );
      const ats = analyzeCandidateATS(c, matchingJob);
      return {
        'No': idx + 1,
        'Nama': c.name,
        'Email': c.email,
        'Telepon': c.phone || '-',
        'Jenis Kelamin': c.gender || '-',
        'Tempat Lahir': c.birthPlace || '-',
        'Tanggal Lahir': c.birthDate || '-',
        'Alamat Domisili': c.address || '-',
        'Posisi Dilamar': c.position,
        'Departemen': getCandidateDepartment(c),
        'Tahap': stageLabels[c.stage] || c.stage,
        'Skor Kecocokan ATS (%)': ats.score,
        'Kategori Kecocokan': ats.scoreCategory,
        'Rating': c.rating,
        'Pendidikan': c.education || '-',
        'Jurusan': c.educationMajor || '-',
        'Pengalaman Kerja': c.experience || '-',
        'Jabatan Terakhir': c.lastPosition || '-',
        'Status Kerja': c.workStatus || '-',
        'Ekspektasi Gaji': c.expectedSalary ? `Rp ${Number(c.expectedSalary).toLocaleString('id-ID')}` : '-',
        'Link Portfolio': c.portfolioLink || '-',
        'Cover Letter': c.coverLetter || '-',
        'Tgl Lamar': c.appliedDate,
        'Tgl Interview': c.interviewDate || '-',
        'Tgl Assessment': c.assessmentDate || '-',
        'Tgl Offering': c.offerDate || '-',
        'Tgl Medical': c.medicalDate || '-',
        'Tgl Hired': c.hiredDate || '-',
        'Status CV': c.cvData ? `Ada (${c.cvFileName})` : 'Tidak ada',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length + 2, Math.min(40, Math.max(...rows.map(r => String((r as Record<string, unknown>)[key] || '').length))))
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Kandidat (${filteredCandidates.length})`);
    XLSX.writeFile(wb, `Export_Kandidat_${today}.xlsx`);
  };

  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const visibleColumns = allColumns.filter(c => c.alwaysVisible || !hiddenColumns.includes(c.key));

  const toggleColumn = (key: string) => {
    setHiddenColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const [formData, setFormData] = useState(emptyFormData);

  // AMBIL DAFTAR DEPT SECARA AMAN AGAR TIDAK ADA UNDEFINED ATAU DUPLIKAT KOSONG
  const departmentsList = ['All', ...Array.from(new Set(candidates.map(c => getCandidateDepartment(c))))];
  const positions = ['All', ...Array.from(new Set(candidates.map(c => c.position).filter(Boolean)))];
  const scoreCategories = ['All', 'Tinggi', 'Sedang', 'Rendah'];
  const salaryRanges = ['All', '< 10jt', '10jt - 20jt', '21jt - 30jt', '31jt - 50jt', '> 50jt', 'Belum diisi'];
  const educationOptions = ['All', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
  const experienceOptions = ['All', 'Fresh Graduate', '1-2 tahun', '3-5 tahun', '5-10 tahun', '> 10 tahun'];
  const workStatusOptions = ['All', 'Aktif Bekerja', 'Tidak Aktif Bekerja', 'Fresh Graduate'];
  const lastPositionOptions = ['All', ...Array.from(new Set(candidates.map(c => c.lastPosition).filter(Boolean)))];

  const filteredCandidates = candidates.filter(c => {
    const matchPillStage = filter === 'All' || c.stage === filter;
    const matchStage = stageFilter === 'All' || c.stage === stageFilter;
    const matchDept = deptFilter === 'All' || getCandidateDepartment(c) === deptFilter;
    const matchPosition = positionFilter === 'All' || c.position === positionFilter;
    const matchGender = genderFilter === 'All' || c.gender === genderFilter;
    const matchEducation = educationFilter === 'All' || c.education === educationFilter;
    const matchExperience = experienceFilter === 'All' || c.experience === experienceFilter;
    const matchLastPosition = lastPositionFilter === 'All' || c.lastPosition === lastPositionFilter;
    const matchWorkStatus = workStatusFilter === 'All' || c.workStatus === workStatusFilter;
    const matchSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    let matchScore = true;
    if (scoreFilter !== 'All') {
      const matchingJob = jobs.find(j =>
        j.title === c.position ||
        j.title.toLowerCase().includes(c.position.toLowerCase()) ||
        c.position.toLowerCase().includes(j.title.toLowerCase())
      );
      const ats = analyzeCandidateATS(c, matchingJob);
      matchScore = ats.scoreCategory === scoreFilter;
    }

    let matchSalary = true;
    if (salaryFilter !== 'All') {
      const sal = Number(c.expectedSalary || 0);
      if (salaryFilter === '< 10jt') matchSalary = sal < 10000000;
      else if (salaryFilter === '10jt - 20jt') matchSalary = sal >= 10000000 && sal <= 20000000;
      else if (salaryFilter === '21jt - 30jt') matchSalary = sal >= 21000000 && sal <= 30000000;
      else if (salaryFilter === '31jt - 50jt') matchSalary = sal >= 31000000 && sal <= 50000000;
      else if (salaryFilter === '> 50jt') matchSalary = sal > 50000000;
      else if (salaryFilter === 'Belum diisi') matchSalary = !c.expectedSalary;
    }

    return matchPillStage && matchStage && matchDept && matchPosition && matchGender && matchEducation && matchExperience && matchLastPosition && matchWorkStatus && matchSearch && matchScore && matchSalary;
  });

  const hasActiveFilters = filter !== 'All' || stageFilter !== 'All' || deptFilter !== 'All' || positionFilter !== 'All' || genderFilter !== 'All' || educationFilter !== 'All' || experienceFilter !== 'All' || lastPositionFilter !== 'All' || workStatusFilter !== 'All' || scoreFilter !== 'All' || salaryFilter !== 'All' || searchQuery !== '';
  
  const resetAllFilters = () => {
    setFilter('All');
    setStageFilter('All');
    setDeptFilter('All');
    setPositionFilter('All');
    setGenderFilter('All');
    setEducationFilter('All');
    setExperienceFilter('All');
    setLastPositionFilter('All');
    setWorkStatusFilter('All');
    setScoreFilter('All');
    setSalaryFilter('All');
    setSearchQuery('');
  };
  const filterStages = ['All', ...stages];

  const handleOpenModal = (candidate?: Candidate) => {
    if (candidate) {
      setEditingCandidate(candidate);
      setFormData({
        name: candidate.name, email: candidate.email, phone: candidate.phone || '',
        gender: candidate.gender, birthDate: candidate.birthDate, birthPlace: candidate.birthPlace, address: candidate.address,
        position: candidate.position, department: candidate.department || getCandidateDepartment(candidate), stage: candidate.stage, rating: candidate.rating,
        education: candidate.education || '', educationMajor: candidate.educationMajor || '',
        experience: candidate.experience || '', lastPosition: candidate.lastPosition || '', workStatus: candidate.workStatus || '',
        portfolioLink: candidate.portfolioLink || '', coverLetter: candidate.coverLetter || '',
        expectedSalary: candidate.expectedSalary || '',
        interviewDate: candidate.interviewDate || '', assessmentDate: candidate.assessmentDate || '',
        offerDate: candidate.offerDate || '', medicalDate: candidate.medicalDate || '', hiredDate: candidate.hiredDate || '',
        cvData: candidate.cvData || '', cvFileName: candidate.cvFileName || '',
      });
    } else {
      setEditingCandidate(null);
      setFormData({ ...emptyFormData });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    let payload = { ...formData };

    // SINKRONISASI TANGGAL TAHAP OTOMATIS JIKA BERUBAH LEWAT MODAL FORM EDIT
    if (payload.stage === 'Interview' && !payload.interviewDate) payload.interviewDate = today;
    if (payload.stage === 'Assessment' && !payload.assessmentDate) payload.assessmentDate = today;
    if (payload.stage === 'Offer' && !payload.offerDate) payload.offerDate = today;
    if (payload.stage === 'Medical' && !payload.medicalDate) payload.medicalDate = today;
    if (payload.stage === 'Hired' && !payload.hiredDate) payload.hiredDate = today;

    if (editingCandidate) {
      updateCandidate(editingCandidate.id, payload);
    } else {
      const initials = payload.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      addCandidate({
        ...payload,
        avatar: initials,
        appliedDate: today,
      });
    }
    setIsModalOpen(false);
  };

  const handleStageChange = (id: number, newStage: Candidate['stage'], candidate: Candidate) => {
    const today = new Date().toISOString().split('T')[0];
    const updates: Partial<Candidate> = { stage: newStage };
    if (newStage === 'Interview' && !candidate.interviewDate) updates.interviewDate = today;
    if (newStage === 'Assessment' && !candidate.assessmentDate) updates.assessmentDate = today;
    if (newStage === 'Offer' && !candidate.offerDate) updates.offerDate = today;
    if (newStage === 'Medical' && !candidate.medicalDate) updates.medicalDate = today;
    if (newStage === 'Hired' && !candidate.hiredDate) updates.hiredDate = today;
    updateCandidate(id, updates);
  };

  const handleDelete = (id: number) => { deleteCandidate(id); setDeleteConfirmId(null); };
  const stageOrder = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired'];
  const getStageIndex = (stage: string) => { if (stage === 'Rejected') return -1; return stageOrder.indexOf(stage); };

  const renderHeaderCell = (col: typeof allColumns[number]) => {
    const base = "py-3 px-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-slate-50 border-b border-slate-200";
    if (col.key === 'expand') return <th key={col.key} className={`w-8 ${base} sticky left-0 top-0 z-20`}></th>;
    if (col.key === 'kandidat') return <th key={col.key} className={`text-left ${base} sticky left-8 top-0 z-20 text-slate-700 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] border-r border-slate-300/60`}>{col.label}</th>;
    if (col.key === 'aksi') return <th key={col.key} className={`text-right ${base} sticky right-0 top-0 z-20 text-slate-700 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] border-l border-slate-300/60`}>{col.label}</th>;
    return <th key={col.key} className={`text-left ${base} text-slate-500 sticky top-0 z-10`}>{col.label}</th>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header Panel */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Daftar Kandidat</h3>
            <p className="text-sm text-slate-500 mt-1">Kelola semua kandidat rekrutmen ({candidates.length} kandidat)</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportTable}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 whitespace-nowrap w-fit"
            >
              <Download size={15} /> Export Excel
              {filteredCandidates.length < candidates.length && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px] font-bold">{filteredCandidates.length}</span>
              )}
            </button>
            {canCreateOrDelete && (
              <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 whitespace-nowrap">+ Tambah</button>
            )}
          </div>
        </div>

        {/* Filter Bar Panel */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Cari nama, posisi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Dept:</span>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {departmentsList.map(d => <option key={d} value={d}>{d === 'All' ? 'Semua Dept' : d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Posisi:</span>
            <select value={positionFilter} onChange={e => setPositionFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white max-w-[220px]">
              {positions.map(p => <option key={p} value={p}>{p === 'All' ? 'Semua Posisi' : p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Tahap:</span>
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {filterStages.map(s => <option key={s} value={s}>{s === 'All' ? 'Semua Tahap' : stageLabels[s]}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Kecocokan:</span>
            <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {scoreCategories.map(s => <option key={s} value={s}>{s === 'All' ? 'Semua Skor' : s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Gaji:</span>
            <select value={salaryFilter} onChange={e => setSalaryFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {salaryRanges.map(s => <option key={s} value={s}>{s === 'All' ? 'Semua Gaji' : s === 'Belum diisi' ? 'Belum Diisi' : s}</option>)}
            </select>
          </div>

          {/* Toggle Atur Kolom */}
          <div className="relative">
            <button
              onClick={() => setIsColumnToggleOpen(!isColumnToggleOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
            >
              <Columns3 size={14} /> Atur Kolom
            </button>
            {isColumnToggleOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-slate-600 uppercase">Pilih Kolom Tampil</p>
                </div>
                <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                  {toggleableColumns.map(col => (
                    <label key={col.key} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-medium text-slate-700">{col.label}</span>
                    </label>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-100 flex gap-2">
                  <button onClick={() => setHiddenColumns([])} className="flex-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 py-1.5 rounded-lg transition-colors">Semua</button>
                  <button onClick={() => setHiddenColumns(toggleableColumns.map(c => c.key))} className="flex-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 py-1.5 rounded-lg transition-colors">Minimal</button>
                </div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button onClick={resetAllFilters} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors">
              ✕ Reset Filter
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide pt-1">
          {filterStages.map((stage) => {
            const count = stage === 'All' ? candidates.length : candidates.filter(c => c.stage === stage).length;
            return (
              <button key={stage} onClick={() => setFilter(stage)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${filter === stage ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {stage === 'All' ? 'Semua' : stageLabels[stage]}
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${filter === stage ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Data Tabel Utama */}
      <div className="overflow-x-auto max-h-[65vh] w-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <table className="w-full border-collapse min-w-[1200px]">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>{visibleColumns.map(col => renderHeaderCell(col))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCandidates.map((candidate) => {
              const matchingJob = jobs.find(j =>
                j.title === candidate.position ||
                j.title.toLowerCase().includes(candidate.position.toLowerCase()) ||
                candidate.position.toLowerCase().includes(j.title.toLowerCase())
              );
              const ats = analyzeCandidateATS(candidate, matchingJob);
              const badgeBg = ats.scoreColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ats.scoreColor === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200';

              return (
                <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors group">
                  {visibleColumns.map(col => {
                    switch (col.key) {
                      case 'expand':
                        return <td key={col.key} className="py-4 px-3 sticky left-0 z-30 bg-white group-hover:bg-slate-50 transition-colors"><button onClick={() => setExpandedRow(expandedRow === candidate.id ? null : candidate.id)} className="p-1 rounded hover:bg-slate-200 text-slate-400">{expandedRow === candidate.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></td>;
                      case 'kandidat':
                        return <td key={col.key} className="py-4 px-4 sticky left-[52px] z-30 bg-white group-hover:bg-slate-50 transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-r border-slate-200/70">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 ${candidate.stage === 'Hired' ? 'bg-gradient-to-br from-emerald-400 to-green-500' : candidate.stage === 'Rejected' ? 'bg-gradient-to-br from-red-400 to-rose-500' : candidate.stage === 'Medical' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'}`}>{candidate.avatar}</div>
                            <div><p className="font-semibold text-slate-800 text-sm whitespace-nowrap">{candidate.name}</p><p className="text-xs text-slate-500 whitespace-nowrap">{candidate.email}</p></div>
                          </div>
                        </td>;
                      case 'posisi':
                        return <td key={col.key} className="py-4 px-4"><span className="text-sm text-slate-700 font-medium whitespace-nowrap">{candidate.position}</span><p className="text-xs text-slate-500">{getCandidateDepartment(candidate)}</p></td>;
                      case 'score':
                        return <td key={col.key} className="py-4 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeBg}`}>{ats.score}% ({ats.scoreCategory})</span></td>;
                      case 'tahap':
                        return <td key={col.key} className="py-4 px-4">
                          <select value={candidate.stage} onChange={(e) => handleStageChange(candidate.id, e.target.value as Candidate['stage'], candidate)} className={`px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer focus:ring-2 focus:ring-indigo-500 ${stageColors[candidate.stage]}`}>
                            {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
                          </select>
                        </td>;
                      case 'phone': return <td key={col.key} className="py-4 px-4"><span className="text-xs text-slate-700 whitespace-nowrap">{candidate.phone || '-'}</span></td>;
                      case 'email': return <td key={col.key} className="py-4 px-4"><span className="text-xs text-slate-700 whitespace-nowrap">{candidate.email || '-'}</span></td>;
                      case 'gender':
                        return <td key={col.key} className="py-4 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${candidate.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>{candidate.gender === 'Laki-laki' ? '♂ Laki-laki' : '♀ Perempuan'}</span></td>;
                      case 'education': return <td key={col.key} className="py-4 px-4"><span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-slate-100 text-slate-700">{candidate.education || '-'}</span></td>;
                      case 'educationMajor': return <td key={col.key} className="py-4 px-4"><span className="text-xs text-slate-700 whitespace-nowrap truncate max-w-[160px] block">{candidate.educationMajor || '-'}</span></td>;
                      case 'experience': return <td key={col.key} className="py-4 px-4"><span className="text-xs text-slate-700 whitespace-nowrap">{candidate.experience || '-'}</span></td>;
                      case 'lastPosition': return <td key={col.key} className="py-4 px-4"><span className="text-xs text-slate-700 whitespace-nowrap">{candidate.lastPosition || '-'}</span></td>;
                      case 'workStatus':
                        return <td key={col.key} className="py-4 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${candidate.workStatus === 'Aktif Bekerja' ? 'bg-emerald-50 text-emerald-700' : candidate.workStatus === 'Fresh Graduate' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{candidate.workStatus || '-'}</span></td>;
                      case 'cv':
                        return <td key={col.key} className="py-4 px-4">
                          {candidate.cvData ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setPreviewCv({ data: candidate.cvData, name: candidate.cvFileName || `CV_${candidate.name}.pdf` })} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors" title="Preview CV"><FileText size={16} /></button>
                              <button onClick={() => downloadPdf(candidate.cvData, candidate.cvFileName || `CV_${candidate.name}.pdf`)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition-colors" title="Download CV"><Download size={16} /></button>
                            </div>
                          ) : <span className="text-xs text-slate-400">-</span>}
                        </td>;
                      case 'aksi':
                        return <td key={col.key} className="py-4 px-4 text-right sticky right-0 z-30 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setDetailCandidate(candidate); setIsDetailOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors" title="Lihat Profil"><Eye size={15} /></button>
                            <button onClick={() => handleOpenModal(candidate)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-amber-600 transition-colors" title="Edit"><Pencil size={15} /></button>
                          </div>
                        </td>;
                      default: return <td key={col.key} className="py-4 px-4 text-xs text-slate-600">-</td>;
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
