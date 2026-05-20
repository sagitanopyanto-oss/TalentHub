import { useState } from 'react';
import { X } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate } from '../data/mockData';

const stageLabels: Record<string, string> = {
  'Applied': 'Lamaran', 'Screening': 'Screening', 'Interview': 'Interview',
  'Assessment': 'Assessment', 'Offer': 'Offering', 'Medical': 'Medical', 'Hired': 'Hired',
};

const stageColors: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-700', 'Screening': 'bg-yellow-100 text-yellow-700',
  'Interview': 'bg-purple-100 text-purple-700', 'Assessment': 'bg-orange-100 text-orange-700',
  'Offer': 'bg-emerald-100 text-emerald-700', 'Medical': 'bg-cyan-100 text-cyan-700',
  'Hired': 'bg-green-100 text-green-700', 'Rejected': 'bg-red-100 text-red-700',
};

export function PipelineChart() {
  // SINKRONISASI GLOBAL: Ambil state filter waktu dan list lowongan untuk fallback silang
  const { candidates, selectedTimeRange, jobs } = useRecruitment();
  const [popup, setPopup] = useState<{ stage: string; items: Candidate[] } | null>(null);

  // Helper penyelamat data departemen jika kosong dari submission awal portal pelamar
  const getCandidateDepartment = (candidate: Candidate): string => {
    if (candidate.department && candidate.department.trim() !== '') {
      return candidate.department;
    }
    const matchingJob = jobs.find(j => j.title === candidate.position);
    return matchingJob ? matchingJob.department : 'Unassigned';
  };

  // Filter waktu dinamis agar angka seragam dengan modul ApplicationChart & Excel
  const getFilteredCandidates = (): Candidate[] => {
    const today = new Date();
    return candidates.filter(candidate => {
      const appliedDateStr = candidate.appliedDate || candidate.createdAt;
      if (!appliedDateStr) return true;

      const appDate = new Date(appliedDateStr);
      const diffTime = Math.abs(today.getTime() - appDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (selectedTimeRange === 'month') return diffDays <= 30;
      if (selectedTimeRange === '6months') return diffDays <= 180;
      if (selectedTimeRange === 'year') return diffDays <= 365;
      return true;
    });
  };

  // Gunakan data yang sudah tersaring waktu secara real-time
  const filteredCandidates = getFilteredCandidates();

  const pipelineData = [
    { name: 'Applied',    label: stageLabels['Applied'],    value: filteredCandidates.filter(c => c.stage === 'Applied').length,    color: '#6366f1' },
    { name: 'Screening',  label: stageLabels['Screening'],  value: filteredCandidates.filter(c => c.stage === 'Screening').length,  color: '#8b5cf6' },
    { name: 'Interview',  label: stageLabels['Interview'],  value: filteredCandidates.filter(c => c.stage === 'Interview').length,  color: '#a78bfa' },
    { name: 'Assessment', label: stageLabels['Assessment'], value: filteredCandidates.filter(c => c.stage === 'Assessment').length, color: '#f59e0b' },
    { name: 'Offer',      label: stageLabels['Offer'],      value: filteredCandidates.filter(c => c.stage === 'Offer').length,      color: '#22c55e' },
    { name: 'Medical',    label: stageLabels['Medical'],    value: filteredCandidates.filter(c => c.stage === 'Medical').length,    color: '#06b6d4' },
    { name: 'Hired',      label: stageLabels['Hired'],      value: filteredCandidates.filter(c => c.stage === 'Hired').length,      color: '#10b981' },
  ];

  const totalInProcess = filteredCandidates.filter(c => c.stage !== 'Rejected').length;
  const maxValue = Math.max(...pipelineData.map(d => d.value), 1);

  const handleBarClick = (stageName: string) => {
    const items = filteredCandidates.filter(c => c.stage === stageName);
    setPopup({ stage: stageName, items });
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pipeline Rekrutmen</h3>
            <p className="text-sm text-slate-500 mt-1">
              Pelamar Periode Ini: <strong className="text-indigo-600">{filteredCandidates.length} Orang</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>Proses: {totalInProcess}
            </span>
            <span className="flex items-center gap-1.5 text-red-600 font-medium bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Ditolak: {filteredCandidates.filter(c => c.stage === 'Rejected').length}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          {pipelineData.map((item) => (
            <div key={item.name} className="group cursor-pointer text-left" onClick={() => handleBarClick(item.name)}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.value}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80" 
                  style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup Modal Detail Kandidat */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Tahap: {stageLabels[popup.stage]} ({popup.items.length} Kandidat)
              </h3>
              <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 text-left">
              {popup.items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-medium">Tidak ada kandidat di tahap ini pada periode waktu terpilih</div>
              ) : (
                popup.items.map(c => (
                  <div key={c.id} className="px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {c.position} — <span className="text-indigo-600 font-semibold">{getCandidateDepartment(c)}</span>
                        </p>
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ml-2 shrink-0 ${stageColors[c.stage]}`}>
                        {c.stage}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
