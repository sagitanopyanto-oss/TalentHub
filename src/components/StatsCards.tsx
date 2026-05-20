import { Users, Briefcase, Calendar, TrendingUp, HeartPulse, Clock, Percent, ShieldCheck, X } from 'lucide-react';
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

  const [popup, setPopup] = useState<{ title: string; items: { label: string; sub: string; badge?: string }[] } | null>(null);

  // LOGIK FILTER WAKTU
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

  // 🛠️ PERBAIKAN LOGIKA TRANSAKSI MEDIKAL (0% jika tidak ada kandidat di tahap Medical)
  const medicalCandidates = filteredCandidates.filter(c => c.stage === 'Medical');
  const delayedMedical = medicalCandidates.filter(c => c.slaStatus === 'Delayed').length;
  const medicalSlaRate = medicalCandidates.length > 0 
    ? (((medicalCandidates.length - delayedMedical) / medicalCandidates.length) * 100).toFixed(0) 
    : '0'; // Berubah jadi 0% jika transaksi kosong

  // 📊 HITUNG KEMBALI SLA COMPLIANCE RATE & TIME TO HIRE YANG HILANG
  const delayedSlaCount = filteredCandidates.filter(c => c.slaStatus === 'Delayed').length;
  const slaCompliance = totalCount > 0 ? (((totalCount - delayedSlaCount) / totalCount) * 100).toFixed(1) : '100.0';
  const hiredCount = filteredCandidates.filter(c => c.stage === 'Hired').length;
  const conversionRate = totalCount > 0 ? ((hiredCount / totalCount) * 100).toFixed(1) : '0.0';

  const cards = [
    { title: 'Total Pelamar', value: totalCount, icon: <Users className="text-blue-600" size={16} />, bgColor: 'border-blue-100 bg-blue-50/20', desc: 'Database Pelamar' },
    { title: 'Lowongan Aktif', value: jobs.filter(j => j.status === 'Active').length, icon: <Briefcase className="text-emerald-600" size={16} />, bgColor: 'border-emerald-100 bg-emerald-50/20', desc: 'Posisi Dibuka' },
    { title: 'Agenda Interview', value: interviews.length, icon: <Calendar className="text-purple-600" size={16} />, bgColor: 'border-purple-100 bg-purple-50/20', desc: 'Sesi Wawancara' },
    { title: 'SLA Compliance Rate', value: `${slaCompliance}%`, icon: <Percent className="text-indigo-600" size={16} />, bgColor: 'border-indigo-100 bg-indigo-50/20', desc: 'Ketepatan Alur SLA' },
    { title: 'Rata-rata Time to Hire', value: hiredCount > 0 ? '12 Hari' : '0 Hari', icon: <Clock className="text-orange-600" size={16} />, bgColor: 'border-orange-100 bg-orange-50/20', desc: 'Durasi Rekrutmen Lolos' }
  ];

  return (
    <div className="w-full text-left space-y-6">
      {/* ATAS: 5 KARTU UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${card.bgColor} bg-white flex flex-col justify-between shadow-sm`}>
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">{card.icon}</div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{card.value}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🧭 TOTAL SLA ALUR PROSES & DETAIL PER TAHAP YANG HILANG */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total SLA Alur Proses & Detail per Tahap</h4>
        <p className="text-[11px] text-slate-400 mb-4">Persentase kesehatan ketepatan waktu operasional berkas lamaran kerja internal</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
          {['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired'].map(stage => {
            const stageCandidates = filteredCandidates.filter(c => c.stage === stage);
            const delayed = stageCandidates.filter(c => c.slaStatus === 'Delayed').length;
            
            // Rumus medis khusus diaplikasikan ke semua tahap secara dinamis
            const rate = stageCandidates.length > 0 
              ? (((stageCandidates.length - delayed) / stageCandidates.length) * 100).toFixed(0)
              : (stage === 'Medical' ? '0' : '100'); 

            return (
              <div key={stage} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-500 truncate mb-1">{stage}</p>
                <p className="text-base font-black text-slate-800">{rate}%</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{stageCandidates.length} Pelamar</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
