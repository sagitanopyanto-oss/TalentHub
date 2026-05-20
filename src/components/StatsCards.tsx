import { Users, Briefcase, Calendar, TrendingUp, HeartPulse, Clock, Percent, X } from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';

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
  const recruitmentContext = useRecruitment();
  const candidates = recruitmentContext?.candidates || [];
  const jobs = recruitmentContext?.jobs || [];
  const interviews = recruitmentContext?.interviews || [];
  const timeRange = recruitmentContext?.selectedTimeRange || 'all';

  // State untuk mengontrol pop-up detail data modal
  const [popup, setPopup] = useState<{ title: string; items: { label: string; sub: string; badge?: string }[] } | null>(null);

  // 1. FILTER DATA BERDASARKAN TIME RANGE
  const today = new Date();
  const filteredCandidates = candidates.filter(c => {
    if (!c.appliedDate) return true;
    const appDate = new Date(c.appliedDate);
    const diffDays = Math.ceil(Math.abs(today.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
    if (timeRange === '7days') return diffDays <= 7;
    if (timeRange === '30days') return diffDays <= 30;
    return true;
  });

  const totalCount = filteredCandidates.length;

  // 2. KOREKSI RUMUS SLA COMPLIANCE RATE (0% jika tidak ada transaksi)
  const delayedSlaCount = filteredCandidates.filter(c => c.slaStatus === 'Delayed').length;
  const slaCompliance = totalCount > 0 ? (((totalCount - delayedSlaCount) / totalCount) * 100).toFixed(1) : '0.0';
  
  const hiredCount = filteredCandidates.filter(c => c.stage === 'Hired').length;

  // 3. STRUKTUR DATA 5 KARTU UTAMA + AKTIVASI POP-UP ONCLICK
  const cards = [
    { 
      title: 'Total Pelamar', 
      value: totalCount, 
      icon: <Users className="text-blue-600" size={16} />, 
      bgColor: 'border-blue-100 bg-blue-50/20', 
      desc: 'Database Pelamar',
      onClick: () => setPopup({
        title: 'Daftar Semua Pelamar Kerja',
        items: filteredCandidates.map(c => ({ label: c.name, sub: c.position || 'No Position', badge: c.stage }))
      })
    },
    { 
      title: 'Lowongan Aktif', 
      value: jobs.filter(j => j.status === 'Active').length, 
      icon: <Briefcase className="text-emerald-600" size={16} />, 
      bgColor: 'border-emerald-100 bg-emerald-50/20', 
      desc: 'Posisi Dibuka',
      onClick: () => setPopup({
        title: 'Daftar Lowongan Kerja Aktif',
        items: jobs.filter(j => j.status === 'Active').map(j => ({ label: j.title, sub: `Departemen: ${j.department || 'Umum'}` }))
      })
    },
    { 
      title: 'Agenda Interview', 
      value: interviews.length, 
      icon: <Calendar className="text-purple-600" size={16} />, 
      bgColor: 'border-purple-100 bg-purple-50/20', 
      desc: 'Sesi Wawancara',
      onClick: () => setPopup({
        title: 'Daftar Jadwal Sesi Wawancara',
        items: interviews.map(i => ({ label: `Wawancara: ${i.candidateName || 'Kandidat'}`, sub: `Waktu: ${i.date || '-'} pukul ${i.time || '-'}` }))
      })
    },
    { 
      title: 'SLA Compliance Rate', 
      value: `${slaCompliance}%`, 
      icon: <Percent className="text-indigo-600" size={16} />, 
      bgColor: 'border-indigo-100 bg-indigo-50/20', 
      desc: 'Ketepatan Alur SLA',
      onClick: () => setPopup({
        title: 'Kandidat Mengalami Keterlambatan SLA (Delayed)',
        items: filteredCandidates.filter(c => c.slaStatus === 'Delayed').map(c => ({ label: c.name, sub: `Tahap: ${c.stage}`, badge: 'Rejected' }))
      })
    },
    { 
      title: 'Rata-rata Time to Hire', 
      value: hiredCount > 0 ? '12 Hari' : '0 Hari', 
      icon: <Clock className="text-orange-600" size={16} />, 
      bgColor: 'border-orange-100 bg-orange-50/20', 
      desc: 'Durasi Rekrutmen Lolos',
      onClick: () => setPopup({
        title: 'Kandidat Berhasil Diterima (Hired)',
        items: filteredCandidates.filter(c => c.stage === 'Hired').map(c => ({ label: c.name, sub: c.position || 'No Position', badge: 'Hired' }))
      })
    }
  ];

  const stagesList = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired'];

  return (
    <div className="w-full text-left space-y-6">
      
      {/* TAMPILAN 5 KARTU UTAMA ATAS DENGAN FITUR KLIK POPUP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <button
            key={idx}
            onClick={card.onClick}
            className={`p-4 rounded-2xl border ${card.bgColor} bg-white flex flex-col justify-between shadow-sm transition-all hover:scale-[1.01] text-left cursor-pointer`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">{card.icon}</div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{card.value}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 🧭 PANEL TOTAL SLA ALUR PROSES & DETAIL PER TAHAP */}
      {/* PERBAIKAN: Menampilkan nominal data transaksi proses angka murni (integer), bukan persentase */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total SLA Alur Proses & Detail per Tahap</h4>
        <p className="text-[11px] text-slate-400 mb-4">Jumlah data transaksi riil pelamar yang saat ini aktif diproses pada setiap tahapan kerja perusahaan</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
          {stagesList.map(stage => {
            const countDataTransaksi = filteredCandidates.filter(c => c.stage === stage).length;

            return (
              <div key={stage} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-500 truncate mb-1">{stage}</p>
                {/* DIUBAH MENJADI ANGKA TRANSAKSI MURNI */}
                <p className="text-base font-black text-slate-800">{countDataTransaksi}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Berkas Aktif</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL WINDOW POPUP UTK DETAIL DATA DASHBOARD */}
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
                <div className="p-8 text-center text-slate-400 text-sm font-medium">Tidak ada rincian data terdaftar untuk filter ini</div>
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
