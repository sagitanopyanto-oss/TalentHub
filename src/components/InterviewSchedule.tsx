import { Clock, User, Video, Phone, Calendar as CalendarIcon, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Interview } from '../data/mockData';

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
  'Scheduled': 'bg-indigo-100 text-indigo-700',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

const interviewTypes = ['Phone Screen', 'Technical', 'HR', 'Final'] as const;
const interviewStatuses = ['Scheduled', 'Completed', 'Cancelled'] as const;

export function InterviewSchedule() {
  const { interviews, candidates, addInterview, updateInterview, deleteInterview, canCreateOrDelete } = useRecruitment();
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
      setFormData({
        candidateName: candidates[0]?.name || '',
        position: candidates[0]?.position || '',
        date: '',
        time: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInterview) {
      updateInterview(editingInterview.id, formData);
    } else {
      addInterview(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Jadwal Wawancara</h3>
            <p className="text-sm text-slate-500 mt-1">Wawancara yang akan datang dan selesai</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 w-fit"
          >
            + Jadwalkan
          </button>
        </div>
      </div>
      <div className="p-6 space-y-4 overflow-y-auto flex-1">
        {interviews.map((interview) => {
          const Icon = typeIcons[interview.type] || Video;
          return (
            <div
              key={interview.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                interview.status === 'Scheduled' 
                  ? 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-300' 
                  : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center flex-1 min-w-0 gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  interview.status === 'Scheduled' ? 'bg-indigo-100' : 'bg-slate-100'
                }`}>
                  <Icon size={20} className={`${
                    interview.status === 'Scheduled' ? 'text-indigo-600' : 'text-slate-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-800 text-sm truncate max-w-full">{interview.candidateName}</h4>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${typeColors[interview.type]}`}>
                      {interview.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{interview.position}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Clock size={12} />
                      {interview.date} pukul {interview.time}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{interview.interviewer}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent">
                <select
                  value={interview.status}
                  onChange={(e) => updateInterview(interview.id, { status: e.target.value as Interview['status'] })}
                  className={`mr-3 inline-flex px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer focus:ring-2 focus:ring-indigo-500 ${statusColors[interview.status]}`}
                >
                  {interviewStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(interview)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                    <Pencil size={16} />
                  </button>
                  {canCreateOrDelete && (
                    <button onClick={() => deleteInterview(interview.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {interviews.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            Tidak ada wawancara terjadwal
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingInterview ? 'Edit Wawancara' : 'Jadwalkan Wawancara'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kandidat</label>
                {editingInterview ? (
                  <input type="text" disabled value={formData.candidateName} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" />
                ) : (
                  <select required value={formData.candidateName} onChange={e => handleCandidateChange(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {candidates.map(c => <option key={c.id} value={c.name}>{c.name} - {c.position}</option>)}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Waktu</label>
                  <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as Interview['type']})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {interviewTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as Interview['status']})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {interviewStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pewawancara</label>
                <input required type="text" placeholder="Nama Pewawancara" value={formData.interviewer} onChange={e => setFormData({...formData, interviewer: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
