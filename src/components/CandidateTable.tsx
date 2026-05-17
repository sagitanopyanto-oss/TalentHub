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

// Definisi semua kolom dengan key unik
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

  // Kolom yang selalu tampil (tidak bisa disembunyikan)
  const toggleableColumns = allColumns.filter(c => !c.alwaysVisible);

  // ===== Export tabel kandidat (sesuai filter aktif) ke Excel =====
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
        'Departemen': c.department,
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

    // Auto-lebar kolom
    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length + 2, Math.min(40, Math.max(...rows.map(r => String((r as Record<string, unknown>)[key] || '').length))))
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Kandidat (${filteredCandidates.length})`);
    XLSX.writeFile(wb, `Export_Kandidat_${today}.xlsx`);
  };

  // State: kolom toggleable mana yang terlihat (default: semua)
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const visibleColumns = allColumns.filter(c => c.alwaysVisible || !hiddenColumns.includes(c.key));

  const toggleColumn = (key: string) => {
    setHiddenColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const [formData, setFormData] = useState(emptyFormData);

  const departments = ['All', ...Array.from(new Set(candidates.map(c => c.department)))];
  const positions = ['All', ...Array.from(new Set(candidates.map(c => c.position)))];
  const scoreCategories = ['All', 'Tinggi', 'Sedang', 'Rendah'];
  const salaryRanges = ['All', '< 10jt', '10jt - 20jt', '21jt - 30jt', '31jt - 50jt', '> 50jt', 'Belum diisi'];
  const educationOptions = ['All', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
  const experienceOptions = ['All', 'Fresh Graduate', '1-2 tahun', '3-5 tahun', '5-10 tahun', '> 10 tahun'];
  const workStatusOptions = ['All', 'Aktif Bekerja', 'Tidak Aktif Bekerja', 'Fresh Graduate'];
  const lastPositionOptions = ['All', ...Array.from(new Set(candidates.map(c => c.lastPosition).filter(Boolean)))];

  const filteredCandidates = candidates.filter(c => {
    const matchPillStage = filter === 'All' || c.stage === filter;
    const matchStage = stageFilter === 'All' || c.stage === stageFilter;
    const matchDept = deptFilter === 'All' || c.department === deptFilter;
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
        position: candidate.position, department: candidate.department, stage: candidate.stage, rating: candidate.rating,
        education: candidate.education || '', educationMajor: candidate.educationMajor || '',
        experience: candidate.experience || '', lastPosition: candidate.lastPosition || '', workStatus: candidate.workStatus || '',
        portfolioLink: candidate.portfolioLink || '', coverLetter: candidate.coverLetter || '',
        expectedSalary: candidate.expectedSalary || '',
        interviewDate: candidate.interviewDate, assessmentDate: candidate.assessmentDate,
        offerDate: candidate.offerDate, medicalDate: candidate.medicalDate, hiredDate: candidate.hiredDate,
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
    if (editingCandidate) {
      updateCandidate(editingCandidate.id, formData);
    } else {
      const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      addCandidate({
        ...formData,
        avatar: initials,
        appliedDate: new Date().toISOString().split('T')[0],
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

  // Helper: render header cell — freeze expand+kandidat (kiri) dan aksi (kanan) dengan koordinat top terkontrol
  const renderHeaderCell = (col: typeof allColumns[number]) => {
    const base = "py-3 px-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap bg-slate-50 border-b border-slate-200";
    if (col.key === 'expand') {
      return <th key={col.key} className={`w-8 ${base} sticky left-0 top-0 z-20`}></th>;
    }
    if (col.key === 'kandidat') {
      return <th key={col.key} className={`text-left ${base} sticky left-8 top-0 z-20 text-slate-700 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] border-r border-slate-300/60`}>{col.label}</th>;
    }
    if (col.key === 'aksi') {
      return <th key={col.key} className={`text-right ${base} sticky right-0 top-0 z-20 text-slate-700 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] border-l border-slate-300/60`}>{col.label}</th>;
    }
    return <th key={col.key} className={`text-left ${base} text-slate-500 sticky top-0 z-10`}>{col.label}</th>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
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

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Cari nama, posisi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Dept:</span>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'Semua Dept' : d}</option>)}
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Jenis Kelamin:</span>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="All">Semua</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Pendidikan:</span>
            <select value={educationFilter} onChange={e => setEducationFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {educationOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'Semua' : o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Pengalaman:</span>
            <select value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {experienceOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'Semua' : o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Jabatan:</span>
            <select value={lastPositionFilter} onChange={e => setLastPositionFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white max-w-[200px]">
              {lastPositionOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'Semua' : o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status Kerja:</span>
            <select value={workStatusFilter} onChange={e => setWorkStatusFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {workStatusOptions.map(o => <option key={o} value={o}>{o === 'All' ? 'Semua' : o}</option>)}
            </select>
          </div>

          {/* Toggle Kolom */}
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

      {/* Table */}
      <div className="overflow-x-auto max-h-[65vh] w-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <table className="w-full border-collapse min-w-[1200px]">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {visibleColumns.map(col => renderHeaderCell(col))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCandidates.map((candidate) => {
              const currentStageIdx = getStageIndex(candidate.stage);
              const matchingJob = jobs.find(j =>
                j.title === candidate.position ||
                j.title.toLowerCase().includes(candidate.position.toLowerCase()) ||
                candidate.position.toLowerCase().includes(j.title.toLowerCase())
              );
              const ats = analyzeCandidateATS(candidate, matchingJob);
              const badgeBg = ats.scoreColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ats.scoreColor === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200';

              return (
                <>
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
                          // Kolom posisi dibuat mengalir dinamis (tidak beku/sticky) agar tabel tidak terlalu kaku di mobile
                          return <td key={col.key} className="py-4 px-4"><span className="text-sm text-slate-700 font-medium whitespace-nowrap">{candidate.position}</span><p className="text-xs text-slate-500">{candidate.department}</p></td>;
                        case 'score':
                          return <td key={col.key} className="py-4 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeBg}`}>
                              {ats.score}% ({ats.scoreCategory})
                            </span>
                          </td>;
                        case 'tahap':
                          return <td key={col.key} className="py-4 px-4">
                            <select value={candidate.stage} onChange={(e) => handleStageChange(candidate.id, e.target.value as Candidate['stage'], candidate)} className={`px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer focus:ring-2 focus:ring-indigo-500 ${stageColors[candidate.stage]}`}>
                              {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
                            </select>
                          </td>;
                        case 'phone':
                          return <td key={col.key} className="py-4 px-4"><span className="text-xs text-slate-700 whitespace-nowrap">{candidate.phone || '-'}</span></td>;
                        case 'email':
                          return <td key={col.key} className="py-4 px-4"><span className="text-xs text-slate-700 whitespace-nowrap">{candidate.email || '-'}</span></td>;
                        case 'gender':
                          return <td key={col.key} className="py-4 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${candidate.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                              {candidate.gender === 'Laki-laki' ? '♂ Laki-laki' : '♀ Perempuan'}
                            </span>
                          </td>;
                        case 'education':
                          return <td key={col.key} className="py-4 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap bg-slate-100 text-slate-700">{candidate.education || '-'}</span>
                          </td>;
                        case 'educationMajor':
                          return <td key={col.key} className="py-4 px-4">
                            <span className="text-xs text-slate-700 whitespace-nowrap truncate max-w-[160px] block">{candidate.educationMajor || '-'}</span>
                          </td>;
                        case 'experience':
                          return <td key={col.key} className="py-4 px-4">
                            <span className="text-xs text-slate-700 whitespace-nowrap">{candidate.experience || '-'}</span>
                          </td>;
                        case 'lastPosition':
                          return <td key={col.key} className="py-4 px-4">
                            <span className="text-xs text-slate-700 whitespace-nowrap">{candidate.lastPosition || '-'}</span>
                          </td>;
                        case 'workStatus':
                          return <td key={col.key} className="py-4 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${candidate.workStatus === 'Aktif Bekerja' ? 'bg-emerald-50 text-emerald-700' : candidate.workStatus === 'Fresh Graduate' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                              {candidate.workStatus || '-'}
                            </span>
                          </td>;
                        case 'cv':
                          return <td key={col.key} className="py-4 px-4">
                            {candidate.cvData ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => setPreviewCv({ data: candidate.cvData, name: candidate.cvFileName || `CV_${candidate.name}.pdf` })} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors" title="Preview CV"><FileText size={16} /></button>
                                <button onClick={() => downloadPdf(candidate.cvData, candidate.cvFileName || `CV_${candidate.name}.pdf`)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition-colors" title="Download CV"><Download size={16} /></button>
                              </div>
                            ) : (<span className="text-xs text-slate-400 italic">Tidak ada</span>)}
                          </td>;
                        case 'rating':
                          return <td key={col.key} className="py-4 px-4"><div className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /><span className="text-sm font-semibold text-slate-700">{candidate.rating}</span></div></td>;
                        case 'tglLamar':
                          return <td key={col.key} className="py-4 px-4"><span className="text-xs text-slate-600 whitespace-nowrap">{formatDate(candidate.appliedDate)}</span></td>;
                        case 'tglInterview':
                          return <td key={col.key} className="py-4 px-4"><span className={`text-xs whitespace-nowrap ${candidate.interviewDate ? 'text-purple-600 font-medium' : 'text-slate-400'}`}>{formatDate(candidate.interviewDate)}</span></td>;
                        case 'tglAssessment':
                          return <td key={col.key} className="py-4 px-4"><span className={`text-xs whitespace-nowrap ${candidate.assessmentDate ? 'text-orange-600 font-medium' : 'text-slate-400'}`}>{formatDate(candidate.assessmentDate)}</span></td>;
                        case 'tglOffering':
                          return <td key={col.key} className="py-4 px-4"><span className={`text-xs whitespace-nowrap ${candidate.offerDate ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>{formatDate(candidate.offerDate)}</span></td>;
                        case 'tglMedical':
                          return <td key={col.key} className="py-4 px-4"><span className={`text-xs whitespace-nowrap ${candidate.medicalDate ? 'text-cyan-600 font-medium' : 'text-slate-400'}`}>{formatDate(candidate.medicalDate)}</span></td>;
                        case 'tglHired':
                          return <td key={col.key} className="py-4 px-4"><span className={`text-xs whitespace-nowrap ${candidate.hiredDate ? 'text-green-600 font-medium' : 'text-slate-400'}`}>{formatDate(candidate.hiredDate)}</span></td>;
                        case 'expectedSalary':
                          return <td key={col.key} className="py-4 px-4">
                            {candidate.expectedSalary ? (
                              <span className="text-xs font-semibold text-emerald-600 whitespace-nowrap">Rp {Number(candidate.expectedSalary).toLocaleString('id-ID')}</span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">-</span>
                            )}
                          </td>;
                        case 'aksi':
                          return <td key={col.key} className="py-4 px-4 text-right sticky right-0 z-30 bg-white group-hover:bg-slate-50 transition-colors shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)] border-l border-slate-200/60">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setDetailCandidate(candidate); setIsDetailOpen(true); }} className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Detail"><Eye size={16} /></button>
                              <button onClick={() => handleOpenModal(candidate)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit"><Pencil size={16} /></button>
                              {canCreateOrDelete && (
                                <button onClick={() => setDeleteConfirmId(candidate.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Hapus"><Trash2 size={16} /></button>
                              )}
                            </div>
                          </td>;
                        default:
                          return null;
                      }
                    })}
                  </tr>
                  {expandedRow === candidate.id && (
                    <tr key={`${candidate.id}-expanded`}>
                      <td colSpan={visibleColumns.length} className="bg-slate-50/70 px-6 py-4">
                        <div className="flex items-center gap-1 overflow-x-auto pb-2">
                          {stageOrder.map((stage, idx) => {
                            const isCurrent = candidate.stage === stage;
                            const isPassed = currentStageIdx >= idx;
                            const isRejected = candidate.stage === 'Rejected';
                            const dateMap: Record<string, string> = { 'Applied': candidate.appliedDate, 'Screening': candidate.appliedDate, 'Interview': candidate.interviewDate, 'Assessment': candidate.assessmentDate, 'Offer': candidate.offerDate, 'Medical': candidate.medicalDate, 'Hired': candidate.hiredDate };
                            return (
                              <div key={stage} className="flex items-center">
                                <div className="flex flex-col items-center min-w-[80px]">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isRejected ? 'border-red-300 bg-red-50 text-red-500' : isCurrent ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : isPassed ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 bg-white text-slate-400'}`}>
                                    {isPassed && !isCurrent && !isRejected ? '✓' : idx + 1}
                                  </div>
                                  <span className={`text-xs mt-1 font-medium whitespace-nowrap ${isCurrent ? 'text-indigo-600' : isPassed ? 'text-green-600' : 'text-slate-400'}`}>{stageLabels[stage]}</span>
                                  {dateMap[stage] && <span className="text-[10px] text-slate-400 mt-0.5">{formatDate(dateMap[stage])}</span>}
                                </div>
                                {idx < stageOrder.length - 1 && <div className={`w-8 h-0.5 mt-[-20px] ${isPassed && !isRejected && idx < currentStageIdx ? 'bg-green-400' : 'bg-slate-200'}`} />}
                              </div>
                            );
                          })}
                          {candidate.stage === 'Rejected' && (
                            <div className="flex items-center ml-2">
                              <div className="flex flex-col items-center min-w-[80px]">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-red-500 bg-red-500 text-white">✗</div>
                                <span className="text-xs mt-1 font-medium text-red-600">Rejected</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filteredCandidates.length === 0 && (
              <tr><td colSpan={visibleColumns.length} className="py-12 text-center text-slate-500"><div className="flex flex-col items-center gap-2"><Calendar size={40} className="text-slate-300" /><p className="font-medium">Tidak ada kandidat ditemukan</p><p className="text-sm">Coba ubah filter atau tambah kandidat baru</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-sm text-slate-500">Menampilkan {filteredCandidates.length} dari {candidates.length} kandidat</span>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{editingCandidate ? 'Edit Kandidat' : 'Tambah Kandidat Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informasi Dasar</p>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Posisi</label><input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label><input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Tahap</label><select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as Candidate['stage']})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm">{stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label><input required type="number" min="1" max="5" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Pendidikan</label><select value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"><option value="">-- Pilih --</option><option value="SMA/SMK">SMA/SMK</option><option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Jurusan Pendidikan</label><input type="text" value={formData.educationMajor} onChange={e => setFormData({...formData, educationMajor: e.target.value})} placeholder="Contoh: Teknik Informatika" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Pengalaman</label><select value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"><option value="">-- Pilih --</option><option value="Fresh Graduate">Fresh Graduate</option><option value="1-2 tahun">1-2 tahun</option><option value="3-5 tahun">3-5 tahun</option><option value="5-10 tahun">5-10 tahun</option><option value="> 10 tahun">&gt; 10 tahun</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Jabatan Terakhir</label><input type="text" value={formData.lastPosition} onChange={e => setFormData({...formData, lastPosition: e.target.value})} placeholder="Contoh: Backend Developer" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Status Bekerja</label><select value={formData.workStatus} onChange={e => setFormData({...formData, workStatus: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"><option value="">-- Pilih --</option><option value="Aktif Bekerja">Aktif Bekerja</option><option value="Tidak Aktif Bekerja">Tidak Aktif Bekerja</option><option value="Fresh Graduate">Fresh Graduate</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Link Portfolio</label><input type="url" value={formData.portfolioLink} onChange={e => setFormData({...formData, portfolioLink: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ekspektasi Gaji (Rp)</label>
                <input type="number" min="0" step="500000" value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              </div>
              <div className="pt-2 border-t border-slate-100"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tanggal Proses Rekrutmen</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">📋 Tgl Interview</label><input type="date" value={formData.interviewDate} onChange={e => setFormData({...formData, interviewDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">📝 Tgl Assessment</label><input type="date" value={formData.assessmentDate} onChange={e => setFormData({...formData, assessmentDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">📨 Tgl Offering</label><input type="date" value={formData.offerDate} onChange={e => setFormData({...formData, offerDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">🏥 Tgl Medical</label><input type="date" value={formData.medicalDate} onChange={e => setFormData({...formData, medicalDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">✅ Tgl Hired</label><input type="date" value={formData.hiredDate} onChange={e => setFormData({...formData, hiredDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload / Ganti Dokumen CV (PDF)</label>
                <input 
                  type="file" 
                  accept=".pdf,application/pdf" 
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file && file.name.toLowerCase().endsWith('.pdf')) {
                      const base64 = await fileToBase64(file);
                      setFormData(p => ({ ...p, cvFileName: file.name, cvData: base64 }));
                    }
                  }} 
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" 
                />
                {formData.cvFileName && (
                  <p className="text-xs text-emerald-600 mt-1 truncate">File aktif: {formData.cvFileName}</p>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm">{editingCandidate ? 'Simpan Perubahan' : 'Tambah Kandidat'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && detailCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">Detail Kandidat</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white ${detailCandidate.stage === 'Hired' ? 'bg-gradient-to-br from-emerald-400 to-green-500' : detailCandidate.stage === 'Rejected' ? 'bg-gradient-to-br from-red-400 to-rose-500' : detailCandidate.stage === 'Medical' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'}`}>{detailCandidate.avatar}</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{detailCandidate.name}</h4>
                  <p className="text-sm text-slate-500">{detailCandidate.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${stageColors[detailCandidate.stage]}`}>{stageLabels[detailCandidate.stage]}</span>
                    <span className="flex items-center gap-1 text-sm text-amber-500"><Star size={14} className="fill-amber-400" /> {detailCandidate.rating}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Posisi</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.position}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Departemen</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.department}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Telepon</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.phone || '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Pendidikan</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.education || '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Jurusan</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.educationMajor || '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Pengalaman</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.experience || '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Jabatan Terakhir</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.lastPosition || '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Status Bekerja</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.workStatus || '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Ekspektasi Gaji</p><p className="text-sm font-semibold text-emerald-600 mt-0.5">{detailCandidate.expectedSalary ? `Rp ${Number(detailCandidate.expectedSalary).toLocaleString('id-ID')}` : '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Jenis Kelamin</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.gender || '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Tempat, Tgl Lahir</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.birthPlace || '-'}, {detailCandidate.birthDate ? formatDate(detailCandidate.birthDate) : '-'}</p></div>
                <div className="bg-slate-50 rounded-xl p-3 sm:col-span-2"><p className="text-xs text-slate-500">Alamat Domisili</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{detailCandidate.address || '-'}</p></div>
                {detailCandidate.portfolioLink && (
                  <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500">Portfolio</p><a href={detailCandidate.portfolioLink} target="_blank" rel="noopener" className="text-sm font-semibold text-indigo-600 hover:underline mt-0.5 truncate block">Buka Link</a></div>
                )}
              </div>
              {detailCandidate.coverLetter && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Cover Letter / Pesan Pelamar</p>
                  <p className="text-xs text-slate-600 italic leading-relaxed">"{detailCandidate.coverLetter}"</p>
                </div>
              )}

              {/* CV Section */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Dokumen CV</p>
                {detailCandidate.cvData ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0"><FileText size={20} className="text-red-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{detailCandidate.cvFileName || 'CV.pdf'}</p>
                      <p className="text-xs text-emerald-600">PDF — Siap diunduh</p>
                    </div>
                    <button onClick={() => setPreviewCv({ data: detailCandidate.cvData, name: detailCandidate.cvFileName || `CV_${detailCandidate.name}.pdf` })} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200 transition-colors">Preview</button>
                    <button onClick={() => downloadPdf(detailCandidate.cvData, detailCandidate.cvFileName || `CV_${detailCandidate.name}.pdf`)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-200 transition-colors">Download</button>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center text-sm text-slate-400 italic">Kandidat belum mengunggah CV</div>
                )}
              </div>

              {/* ATS Analysis Card */}
              {(() => {
                const matchingJob = jobs.find(j =>
                  j.title === detailCandidate.position ||
                  j.title.toLowerCase().includes(detailCandidate.position.toLowerCase()) ||
                  detailCandidate.position.toLowerCase().includes(j.title.toLowerCase())
                );
                const ats = analyzeCandidateATS(detailCandidate, matchingJob);
                const scoreIcon = ats.scoreColor === 'emerald' ? <CheckCircle2 size={12} /> : ats.scoreColor === 'amber' ? <AlertTriangle size={12} /> : <XCircle size={12} />;
                const badgeColor = ats.scoreColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' : ats.scoreColor === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                const summaryBg = ats.scoreColor === 'emerald' ? 'border-emerald-200 bg-emerald-50/50' : ats.scoreColor === 'amber' ? 'border-amber-200 bg-amber-50/50' : 'border-red-200 bg-red-50/50';
                const recommendBg = ats.scoreColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : ats.scoreColor === 'amber' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300';

                return (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Cpu size={18} /></div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-800 text-sm">Analisis ATS-Ready (Otomatis)</h5>
                          <p className="text-[11px] text-slate-500 truncate">vs Posisi: <strong>{ats.appliedForJob}</strong></p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${badgeColor}`}>{scoreIcon} {ats.scoreBadge}</span>
                    </div>
                    <div className="space-y-4 text-xs text-slate-600 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      
                      {/* Bagian Utama / Overview Kecocokan */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-3 border-b border-slate-100">
                        <div className={`p-2 rounded-lg text-center ${ats.educationMatch.met ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          <span className={`text-base font-bold block ${ats.educationMatch.met ? 'text-emerald-600' : 'text-red-600'}`}>{ats.educationMatch.met ? '✓' : '✗'}</span>
                          <span className="font-bold text-[9px] uppercase text-slate-500 block mt-1">Pendidikan</span>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${ats.majorMatch.met ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          <span className={`text-base font-bold block ${ats.majorMatch.met ? 'text-emerald-600' : 'text-red-600'}`}>{ats.majorMatch.met ? '✓' : '✗'}</span>
                          <span className="font-bold text-[9px] uppercase text-slate-500 block mt-1">Jurusan</span>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${ats.experienceMatch.met ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          <span className={`text-base font-bold block ${ats.experienceMatch.met ? 'text-emerald-600' : 'text-red-600'}`}>{ats.experienceMatch.met ? '✓' : '✗'}</span>
                          <span className="font-bold text-[9px] uppercase text-slate-500 block mt-1">Pengalaman</span>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${ats.lastPositionMatch.met ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          <span className={`text-base font-bold block ${ats.lastPositionMatch.met ? 'text-emerald-600' : 'text-red-600'}`}>{ats.lastPositionMatch.met ? '✓' : '✗'}</span>
                          <span className="font-bold text-[9px] uppercase text-slate-500 block mt-1">Jabatan</span>
                        </div>
                      </div>

                      {/* Tampilan Detail untuk Data Match */}
                      <div className="space-y-3 pb-3 border-b border-slate-100">
                        <h6 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Detail Analisis Kecocokan Kriteria</h6>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-600 text-[9px]">Kecocokan Skill</span>
                              <span className={`font-bold text-[10px] ${ats.skillScore >= 70 ? 'text-emerald-600' : ats.skillScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{ats.skillScore}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className={`h-full rounded-full ${ats.skillScore >= 70 ? 'bg-emerald-500' : ats.skillScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${ats.skillScore}%` }} />
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">Menguasai {ats.matchedSkills.length}/{ats.matchedSkills.length + ats.missingSkills.length} skill</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-600 text-[9px]">Tugas & Tanggung Jawab</span>
                              <span className={`font-bold text-[10px] ${ats.responsibilityScore >= 60 ? 'text-emerald-600' : ats.responsibilityScore >= 30 ? 'text-amber-600' : 'text-red-600'}`}>{ats.responsibilityScore}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className={`h-full rounded-full ${ats.responsibilityScore >= 60 ? 'bg-emerald-500' : ats.responsibilityScore >= 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${ats.responsibilityScore}%` }} />
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">{ats.matchedResponsibilities.length} tugas relevan</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-600 text-[9px]">Kualifikasi Match</span>
                              <span className={`font-bold text-[10px] ${ats.qualificationScore >= 60 ? 'text-emerald-600' : ats.qualificationScore >= 30 ? 'text-amber-600' : 'text-red-600'}`}>{ats.qualificationScore}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className={`h-full rounded-full ${ats.qualificationScore >= 60 ? 'bg-emerald-500' : ats.qualificationScore >= 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${ats.qualificationScore}%` }} />
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">{ats.matchedQualifications.length} kualifikasi terpenuhi</p>
                          </div>
                        </div>
                      </div>

                      {/* Detail Tambahan: Pendidikan, Pengalaman, Kontak */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                        <div className="space-y-2">
                          <div>
                            <span className="font-bold text-slate-400 uppercase text-[9px] block mb-0.5">Pendidikan & Jurusan Pelamar</span>
                            <p className="font-semibold text-slate-700 text-xs">{detailCandidate.education || '-'} - {detailCandidate.educationMajor || '-'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Jurusan yang Diharapkan: {ats.majorMatch.relevantMajors.join(', ')}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-400 uppercase text-[9px] block mb-0.5">Pengalaman Kerja</span>
                            <p className="font-semibold text-slate-700 text-xs">{detailCandidate.experience || '-'} (Jabatan Terakhir: {detailCandidate.lastPosition || '-'})</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Status Kerja: <span className="font-bold text-slate-600">{detailCandidate.workStatus || '-'}</span></p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-bold text-slate-400 uppercase text-[9px] block mb-0.5">Informasi Kontak</span>
                            <div className="space-y-1 text-[11px] text-slate-600">
                              <p className="flex items-center gap-1.5">📞 {ats.contactInfo.phone}</p>
                              <p className="flex items-center gap-1.5">✉️ {ats.contactInfo.email}</p>
                              {ats.contactInfo.portfolio !== '-' && (
                                <p className="flex items-center gap-1.5">🌐 <a href={ats.contactInfo.portfolio} target="_blank" rel="noopener" className="text-indigo-600 hover:underline truncate block max-w-[200px]">{ats.contactInfo.portfolio}</a></p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Kekuatan & Kelemahan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                        <div>
                          <span className="font-bold text-emerald-600 uppercase text-[9px] block mb-1.5">💪 Kekuatan Kandidat</span>
                          <ul className="space-y-1">
                            {ats.strengthsArr.map((strength, i) => (
                              <li key={i} className="text-[11px] text-slate-600 flex gap-1.5"><span className="text-emerald-500 shrink-0">✓</span><span>{strength}</span></li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-bold text-red-600 uppercase text-[9px] block mb-1.5">⚠️ Kelemahan / Area Perbaikan</span>
                          <ul className="space-y-1">
                            {ats.weaknessesArr.map((weakness, i) => (
                              <li key={i} className="text-[11px] text-slate-600 flex gap-1.5"><span className="text-red-500 shrink-0">✗</span><span>{weakness}</span></li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Ringkasan & Rekomendasi */}
                      <div className="space-y-2">
                        <div className={`p-3 rounded-xl border ${summaryBg}`}>
                          <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1">📝 Ringkasan Analisis (AI Summary)</span>
                          <p className="text-slate-700 leading-relaxed">{ats.summary}</p>
                        </div>
                        <div className={`p-3 rounded-xl border ${recommendBg}`}>
                          <span className="font-bold uppercase text-[10px] block mb-1">🎯 Rekomendasi Tindakan</span>
                          <p className="font-semibold text-[12px] leading-relaxed">{ats.recommendation}</p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Timeline */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Timeline Proses Rekrutmen</p>
                <div className="space-y-3">
                  {[
                    { label: 'Lamaran Diterima', date: detailCandidate.appliedDate, color: 'bg-blue-500', icon: '📩' },
                    { label: 'Interview', date: detailCandidate.interviewDate, color: 'bg-purple-500', icon: '📋' },
                    { label: 'Assessment', date: detailCandidate.assessmentDate, color: 'bg-orange-500', icon: '📝' },
                    { label: 'Offering', date: detailCandidate.offerDate, color: 'bg-emerald-500', icon: '📨' },
                    { label: 'Medical Check-up', date: detailCandidate.medicalDate, color: 'bg-cyan-500', icon: '🏥' },
                    { label: 'Hired', date: detailCandidate.hiredDate, color: 'bg-green-500', icon: '✅' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${item.date ? item.color : 'bg-slate-200'}`} />
                        {idx < 5 && <div className={`w-0.5 h-6 ${item.date ? 'bg-slate-300' : 'bg-slate-100'}`} />}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className={`text-sm ${item.date ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{item.icon} {item.label}</span>
                        <span className={`text-xs ${item.date ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{item.date ? formatDate(item.date) : 'Belum dijadwalkan'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button onClick={() => { setIsDetailOpen(false); handleOpenModal(detailCandidate); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">Edit Kandidat</button>
              <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Kandidat?</h3>
            <p className="text-sm text-slate-500 mb-6">Data kandidat akan dihapus secara permanen.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Batal</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewCv && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col" style={{ height: '90vh' }}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><FileText size={18} className="text-red-600" /></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{previewCv.name}</h3>
                  <p className="text-xs text-slate-500">Preview Dokumen CV</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={previewCv.data} 
                  download={previewCv.name} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <Download size={14} /> Download PDF
                </a>
                <a 
                  href={previewCv.data} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink size={14} /> Buka Tab Baru
                </a>
                <button onClick={() => setPreviewCv(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-200 relative">
              {/* PDF Preview menggunakan object dari URL publik */}
              <object 
                data={previewCv.data} 
                type="application/pdf" 
                className="w-full h-full"
                title="PDF Preview"
              >
                {/* Fallback jika browser tidak bisa render PDF langsung */}
                <div className="flex flex-col items-center justify-center h-full bg-white">
                  <FileText size={64} className="text-slate-300 mb-4" />
                  <p className="text-slate-600 font-medium mb-2">Tidak dapat menampilkan preview di browser ini</p>
                  <a 
                    href={previewCv.data} 
                    download={previewCv.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Download & Buka PDF
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
