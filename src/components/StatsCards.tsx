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
  // 1. FALLBACK KONEKSI CONTEXT: Menjamin aplikasi tidak crash jika context mengirim data kosong/kosong sementara
  const recruitmentContext = useRecruitment();
  const candidates = recruitmentContext?.candidates || [];
  const jobs = recruitmentContext?.jobs || [];
  const interviews = recruitmentContext?.interviews || [];
  
  // 2. FALLBACK UTAMA FILTER WAKTU: Jika selectedTimeRange bernilai undefined, otomatis gunakan 'all'
  const timeRange = recruitmentContext?.selectedTimeRange || 'all';

  const [popup, setPopup] = useState<{ title: string; items: { label: string; sub: string; badge?: string }[] } | null>(null);

  // FUNGSI FILTER: Menyaring data secara dinamis berdasarkan filter jangka waktu dasbor aktif
  const getFilteredData = () => {
    const today = new Date();
    
    const filteredCandidates = candidates.filter(c => {
      if (!c.appliedDate) return true;
      const appDate = new Date(c.appliedDate);
      const diffTime = Math.abs(today.getTime() - appDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Menggunakan variabel aman 'timeRange' hasil fallback
      if (timeRange === '7days') return diffDays <= 7;
      if (timeRange === '30days') return diffDays <= 30;
      return true;
    });

    const filteredJobs = jobs.filter(j => {
      if (timeRange === '7days') return j.status === 'Active'; 
      return true;
    });

    const filteredInterviews = interviews.filter(i => {
      if (!i.date) return true;
      const intDate = new Date(i.date);
      const diffTime = Math.abs(today.getTime() - intDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (timeRange === '7days') return diffDays <= 7;
      if (timeRange === '30days') return diffDays <= 30;
      return true;
    });

    return {
      candidates: filteredCandidates,
      jobs: filteredJobs,
      interviews: filteredInterviews
    };
  };

  const data = getFilteredData();

  // Menghitung rasio konversi perekrutan secara aman (mencegah pembagian dengan angka nol)
  const hiredCount = data.candidates.filter(c => c.stage === 'Hired').length;
  const totalCandidatesCount = data.candidates.length;
  const conversionRate = totalCandidatesCount > 0 ? ((hiredCount / totalCandidatesCount) * 100).toFixed(1) : '0.0';

  // Menghitung status rata-rata kesehatan SLA rekrutmen
  const delayedSlaCount = data.candidates.filter(c => c.slaStatus === 'Delayed').length;
  const slaHealthRate = totalCandidatesCount > 0 ? (((totalCandidatesCount - delayedSlaCount) / totalCandidatesCount) * 100).toFixed(0) : '100';

  const cards = [
    {
      title: 'Total Pelamar',
      value: totalCandidatesCount,
      icon: <Users className="text-blue-600" size={20} />,
      bgColor: 'bg-blue-50 border-blue-100',
      description: 'Kandidat masuk dalam database',
      onClick: () => setPopup({
        title: 'Daftar Semua Pelamar',
        items: data.candidates.map(c => ({ label: c.name, sub: c.position, badge: c.stage }))
      })
    },
    {
      title: 'Lowongan Aktif',
      value: data.jobs.filter(j => j.status === 'Active').length,
      icon: <Briefcase className="text-emerald-600" size={20} />,
      bgColor: 'bg-emerald-50 border-emerald-100',
      description: 'Posisi pekerjaan yang dibuka',
      onClick: () => setPopup({
        title: 'Daftar Lowongan Kerja Aktif',
        items: data.jobs.filter(j => j.status === 'Active').map(j => ({ label: j.title, sub: `Departemen: ${j.department}` }))
      })
    },
    {
      title: 'Agenda Interview',
      value: data.interviews.length,
      icon: <Calendar className="text-purple-600" size={20} />,
      bgColor: 'bg-purple-50 border-purple-100',
      description: 'Sesi wawancara terjadwal',
      onClick: () => setPopup({
        title: 'Daftar Jadwal Wawancara',
        items: data.interviews.map(i => ({ label: `Interview: ${i.candidateName}`, sub: `Waktu: ${i.date} pukul ${i.time}` }))
      })
    },
    {
      title: 'Rasio Kelulusan',
      value: `${conversionRate}%`,
      icon: <TrendingUp className="text-orange-600" size={20} />,
      bgColor: 'bg-orange-50 border-orange-100',
      description: 'Persentase pelamar lolos (Hired)',
      onClick: () => setPopup({
        title: 'Kandidat Berhasil Diterima (Hired)',
        items: data.candidates.filter(c => c.stage === 'Hired').map(c => ({ label: c.name, sub: c.position, badge: 'Hired' }))
      })
    },
    {
      title: 'Kesehatan SLA',
      value: `${slaHealthRate}%`,
      icon: <HeartPulse className="text-cyan-600" size={20} />,
      bgColor: 'bg-cyan-50 border-cyan-100',
      description: 'Proses on-time tanpa over-due',
      onClick: () => setPopup({
        title: 'Kandidat Mengalami Keterlambatan SLA (Delayed)',
        items: data.candidates.filter(c => c.slaStatus === 'Delayed').map(c => ({ label: c.name, sub: `Tahap saat ini: ${c.stage}`, badge: 'Rejected' }))
      })
    }
  ];

  return (
    <div className="w-full text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={card.onClick}
            className={`p-5 rounded-2xl border ${card.bgColor} shadow-sm transition-all hover:scale-[1.02] flex flex-col justify-between items-start text-left cursor-pointer bg-white`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">{card.icon}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{card.value}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight">{card.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* POPUP DETAIL MODAL JIKA KARTU DIKLIK */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <h3 className="font-bold text-slate-800">{popup.title} ({popup.items.length})</h3>
              <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
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
