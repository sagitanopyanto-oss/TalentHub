import { Users, Briefcase, Calendar, TrendingUp, HeartPulse, X } from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate } from '../data/mockData';

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

export function StatsCards() {
  // SINKRONISASI: Ambil selectedTimeRange untuk menyaring kecocokan jangka waktu
  const { candidates, jobs, interviews, selectedTimeRange } = useRecruitment();
  const [popup, setPopup] = useState<{ title: string; items: { label: string; sub: string; badge?: string }[] } | null>(null);

  // FUNGSI FILTER: Menyaring data secara dinamis berdasarkan filter jangka waktu dasbor aktif
  const getFilteredData = () => {
    const today = new Date();
    
    const filteredCandidates = candidates.filter(c => {
      const dateStr = c.appliedDate || c.createdAt;
      if (!dateStr) return true;
      const date = new Date(dateStr);
      const diffDays = Math.ceil(Math.abs(today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (selectedTimeRange === 'month') return diffDays <= 30;
      if (selectedTimeRange === '6months') return diffDays <= 180;
      if (selectedTimeRange === 'year') return diffDays <= 365;
      return true;
    });

    const filteredJobs = jobs.filter(j => {
      if (!j.createdAt) return true;
      const date = new Date(j.createdAt);
      const diffDays = Math.ceil(Math.abs(today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (selectedTimeRange === 'month') return diffDays <= 30;
      if (selectedTimeRange === '6months') return diffDays <= 180;
      if (selectedTimeRange === 'year') return diffDays <= 365;
      return true;
    });

    const filteredInterviews = interviews.filter(i => {
      if (!i.date) return true;
      const date = new Date(i.date);
      const diffDays = Math.ceil(Math.abs(today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (selectedTimeRange === 'month') return diffDays <= 30;
      if (selectedTimeRange === '6months') return diffDays <= 180;
      if (selectedTimeRange === 'year') return diffDays <= 365;
      return true;
    });

    return { filteredCandidates, filteredJobs, filteredInterviews };
  };

  const { filteredCandidates, filteredJobs, filteredInterviews } = getFilteredData();

  // Kalkulasi Metrik Berdasarkan Data Ter-filter
  const totalCandidates = filteredCandidates.length;
  const activeJobs = filteredJobs.filter(j => j.status === 'Active').length;
  const scheduledInterviews = filteredInterviews.filter(i => i.status === 'Scheduled').length;
  
  // Kalkulasi akurat Hired pada rentang waktu terpilih
  const hiredCount = filteredCandidates.filter(c => c.stage === 'Hired').length;
  const medicalCount = filteredCandidates.filter(c => c.stage === 'Medical').length;

  const currentMonthName = new Date().toLocaleString('id-ID', { month: 'long' });

  const cards = [
    {
      title: 'Total Pelamar',
      value: totalCandidates,
      sub: `Pelamar terdaftar dalam rentang waktu`,
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      onClick: () => setPopup({
        title: 'Daftar Pelamar Aktif',
        items: filteredCandidates.map(c => ({ label: c.name, sub: `${c.position} — ${c.department}`, badge: c.stage }))
      })
    },
    {
      title: 'Lowongan Aktif',
      value: activeJobs,
      sub: 'Loker sedang membuka kuota masuk',
      icon: Briefcase,
      color: 'text-emerald-600 bg-emerald-50',
      onClick: () => setPopup({
        title: 'Daftar Lowongan Aktif',
        items: filteredJobs.filter(j => j.status === 'Active').map(j => ({ label: j.title, sub: `${j.department} — ${j.location}` }))
      })
    },
    {
      title: 'Jadwal Wawancara',
      value: scheduledInterviews,
      sub: 'Agenda temu kandidat & user',
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50',
      onClick: () => setPopup({
        title: 'Jadwal Wawancara Terdekat',
        items: filteredInterviews.filter(i => i.status === 'Scheduled').map(i => {
          const candidate = candidates.find(c => c.id === i.candidateId);
          return { label: candidate?.name || 'Kandidat Generik', sub: `Agenda: ${i.type} — Tanggal: ${i.date} Jam ${i.time}` };
        })
      })
    },
    {
      title: 'Kandidat Diterima',
      value: hiredCount,
      sub: selectedTimeRange === 'month' ? `Sukses onboarding di ${currentMonthName}` : `Lolos seleksi dalam rentang waktu`,
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50',
      onClick: () => setPopup({
        title: 'Kandidat Berhasil Diterima (Hired)',
        items: filteredCandidates.filter(c => c.stage === 'Hired').map(c => ({ label: c.name, sub: `Bergabung sebagai: ${c.position} (${c.department})` }))
      })
    },
    {
      title: 'Medical Check-up',
      value: medicalCount,
      sub: 'Kandidat dalam tahap tes fisik',
      icon: HeartPulse,
      color: 'text-cyan-600 bg-cyan-50',
      onClick: () => setPopup({
        title: 'Kandidat Tahap MCU',
        items: filteredCandidates.filter(c => c.stage === 'Medical').map(c => ({ label: c.name, sub: `Posisi: ${c.position} — Dept: ${c.department}` }))
      })
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div 
            key={i} 
            onClick={card.onClick}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all group duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{card.title}</span>
                <div className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{card.value}</div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color} group-hover:scale-105 transition-transform`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-3 leading-tight border-t border-slate-50 pt-2">{card.sub}</p>
          </div>
        );
      })}

      {/* Detail Popup Modal */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800">{popup.title} ({popup.items.length})</h3>
              <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {popup.items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-medium">Tidak ada data terdaftar dalam jangka waktu ini</div>
              ) : (
                popup.items.map((item, idx) => (
                  <div key={idx} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors text-left flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.label}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.sub}</p>
                    </div>
                    {item.badge && (
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 uppercase tracking-wider ${stageColors[item.badge] || 'bg-slate-100 text-slate-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
