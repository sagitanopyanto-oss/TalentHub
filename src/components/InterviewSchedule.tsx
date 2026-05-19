import { Clock, User, Video, Phone, Calendar as CalendarIcon, Pencil, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Interview, Candidate } from '../data/mockData';

const typeIcons: Record<string, typeof Video> = {
  'Phone Screen': Phone,
  'Technical': Video,
  'HR': User,
  'Final': CalendarIcon,
};

const typeColors: Record<string, string> = {
  'Phone Screen': 'bg-blue-100 text-blue-600',
  'Technical': 'bg-purple-100 text-purple-600',
  'HR': 'bg-emerald-100 text-emerald-600',
  'Final': 'bg-amber-100 text-amber-600',
};

const statusColors: Record<string, string> = {
  'Scheduled': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  'Completed': 'bg-green-100 text-green-700 border border-green-200',
  'Cancelled': 'bg-red-100 text-red-700 border border-red-200',
};

const interviewTypes = ['Phone Screen', 'Technical', 'HR', 'Final'] as const;
const interviewStatuses = ['Scheduled', 'Completed', 'Cancelled'] as const;

// Helper format tanggal lokal agar selaras dengan tabel kandidat
function formatFriendlyDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function InterviewSchedule() {
  const { interviews, candidates, addInterview, updateInterview, deleteInterview, updateCandidate, canCreateOrDelete } = useRecruitment();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    date: '',
    time: '',
    type: 'Phone Screen' as Interview['type'],
    status: 'Scheduled' as Interview['status'],
    interviewer: ''
  });

  const handleOpenModal = (interview?: Interview) => {
    if (interview) {
      setEditingInterview(interview);
      setFormData({
        candidateName: interview.candidateName,
        position: interview.position,
        date: interview.date,
        time: interview.time,
        type: interview.type,
        status: interview.status,
        interviewer: interview.interviewer,
      });
    } else {
      setEditingInterview(null);
      // Validasi fallback yang aman jika candidates masih kosong
      const defaultCandidate = candidates[0];
      setFormData({
        candidateName: defaultCandidate?.name || '',
        position: defaultCandidate?.position || '',
        date: new Date().toISOString().split('T')[0], // Default tanggal hari ini
        time: '10:00',
        type: 'Phone Screen',
        status: 'Scheduled',
        interviewer: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCandidateChange = (name: string) => {
    const candidate = candidates.find(c => c.name === name);
    if (candidate) {
      setFormData({ ...formData, candidateName: name, position: candidate.position });
    }
  };

  // SINKRONISASI OTOMATIS: Menggerakkan Tahapan Kandidat di ATS berdasarkan status interview
  const syncCandidateStageWithInterview = (candidateName: string, interviewType: Interview['type'], interviewStatus: Interview['status']) => {
    const candidate = candidates.find(c => c.name === candidateName);
    if (!candidate) return;

    const today = new Date().toISOString().split('T')[0];
    let targetStage: Candidate['stage'] = candidate.stage;

    // Jika interview baru dijadwalkan, pastikan kandidat minimal masuk ke tahap transisi yang relevan
    if (interviewStatus === 'Scheduled') {
      if (candidate.stage === 'Applied' || candidate.stage === 'Screening') {
        targetStage = 'Interview';
      }
    } 
    // Jika interview selesai, gerakkan roda kemajuan kandidat secara cerdas
    else if (interviewStatus === 'Completed') {
      if (interviewType === 'Phone Screen' && candidate.stage === 'Interview') {
        targetStage = 'Interview'; // Tetap interview atau siap ke teknis
      } else if (interviewType === 'Technical') {
        targetStage = 'Assessment';
      } else if (interviewType === 'HR' || interviewType === 'Final') {
        targetStage = 'Offer';
      }
    }

    // Eksekusi pembaruan ke context jika ada perubahan tahapan
    if (targetStage !== candidate.stage) {
      const updates: Partial<Candidate> = { stage: targetStage };
      if (targetStage === 'Interview' && !candidate.interviewDate) updates.interviewDate = today;
      if (targetStage === 'Assessment' && !candidate.assessmentDate) updates.assessmentDate = today;
      if (targetStage === 'Offer' && !candidate.offerDate) updates.offerDate = today;
      
      updateCandidate(candidate.id, updates);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInterview) {
      updateInterview(editingInterview.id, formData);
      syncCandidateStageWithInterview(formData.candidateName, formData.type, formData.status);
    } else {
      addInterview(formData);
      syncCandidateStageWithInterview(formData.candidateName, formData.type, formData.status);
    }
    setIsModalOpen(false);
  };

  const handleStatusChangeInList = (id: number, currentInterview: Interview, nextStatus: Interview['status']) => {
    updateInterview(id, { status: nextStatus });
    // Ikut sinkronisasikan tahap kandidat saat status diubah langsung dari list dropdown
    syncCandidateStageWithInterview(currentInterview.candidateName, currentInterview.type, nextStatus);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Jadwal Wawancara</h3>
            <p className="text-sm text-slate-500 mt-1">Pantau dan kelola agenda interaksi langsung dengan kandidat</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 w-fit"
          >
            + Jadwalkan Wawancara
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[70vh]">
        {interviews.map((interview) => {
          const Icon = typeIcons[interview.type] || Video;
          return (
            <div
              key={interview.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                interview.status === 'Scheduled' 
                  ? 'border-indigo-100 bg-indigo-50/20 hover:border-indigo-200' 
                  : interview.status === 'Cancelled'
                  ? 'border-red-100 bg-red-50/10 opacity-70'
                  : 'border-slate-100 bg-slate-50/40 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center flex-1 min-w-0 gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  interview.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-600' : interview.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800 text-sm truncate max-w-full">{interview.candidateName}</h4>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${typeColors[interview.type]}`}>
                      {interview.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{interview.position}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium whitespace-nowrap">
                      <Clock size={13} className="text-indigo-500" />
                      {formatFriendlyDate(interview.date)} • {interview.time} WIB
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="whitespace-nowrap inline-flex items-center gap-1"><User size={12} /> {interview.interviewer || 'Belum Ditunjuk'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <select
                  value={interview.status}
                  onChange={(e) => handleStatusChangeInList(interview.id, interview, e.target.value as Interview['status'])}
                  className={`mr-3 inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all ${statusColors[interview.status]}`}
                >
                  {interviewStatuses.map(s => <option key={s} value={s}>{s === 'Scheduled' ? '📅 Scheduled' : s === 'Completed' ? '✅ Completed' : '❌ Cancelled'}</option>)}
                </select>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(interview)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Jadwal">
                    <Pencil size={15} />
                  </button>
                  {canCreateOrDelete && (
                    <button onClick={() => deleteInterview(interview.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Hapus">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {interviews.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400 gap-2">
            <AlertCircle size={32} className="text-slate-300" />
            <p className="text-sm font-medium">Tidak ada wawancara terjadwal untuk saat ini.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingInterview ? '✏️ Edit Jadwal Wawancara' : '📅 Jadwalkan Wawancara Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kandidat Pelamar</label>
                {editingInterview ? (
                  <input type="text" disabled value={formData.candidateName} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed text-sm font-medium" />
                ) : (
                  <select required value={formData.candidateName} onChange={e => handleCandidateChange(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-slate-700">
                    {candidates.map(c => <option key={c.id} value={c.name}>{c.name} — ({c.position})</option>)}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Waktu</label>
                  <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tipe Evaluasi</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as Interview['type']})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-slate-700">
                    {interviewTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as Interview['status']})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm text-slate-700">
                    {interviewStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">User / Pewawancara Internal</label>
                <input required type="text" placeholder="Contoh: Budi Santoso (Engineering Lead)" value={formData.interviewer} onChange={e => setFormData({...formData, interviewer: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                  💾 Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
