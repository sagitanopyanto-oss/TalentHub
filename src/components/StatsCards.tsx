import { Users, Calendar, Briefcase, HeartPulse, ShieldCheck, Percent, Clock, AlertCircle, X } from 'lucide-react';
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

  // State Pengontrol Jendela Pop-up Modal Detail Data
  const [popup, setPopup] = useState<{ title: string; items: { label: string; sub: string; badge?: string }[] } | null>(null);

  // 1. FILTER DATA BERDASARKAN FILTER JANGKA WAKTU AKTIF
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

  // 2. LOGIKA PERHITUNGAN DATA KANDIDAT OPERASIONAL
  const medicalCandidates = filteredCandidates.filter(c => c.stage === 'Medical');
  const hiredCandidates = filteredCandidates.filter(c => c.stage === 'Hired');

  // 3. LOGIKA INDIKATOR RATA-RATA TIME TO HIRE (DURASI PROSES LOLOS)
  let totalDaysToHire = 0;
  let countHiredWithDates = 0;

  hiredCandidates.forEach(c => {
    if (c.appliedDate && c.hiredDate) {
      const start = new Date(c.appliedDate);
      const end = new Date(c.hiredDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDaysToHire += diffDays;
      countHiredWithDates++;
    }
  });

  const avgTimeToHire = countHiredWithDates > 0 ? Math.round(totalDaysToHire / countHiredWithDates) : 0;

  // 4. LOGIKA TOTAL SLA ALUR PROSES (BATAS MAKSIMAL 30 HARI DARI APPLY HINGGA HIRED)
  // Menghitung berapa banyak transaksi yang sukses diselesaikan di bawah atau sama dengan 30 hari.
  const compliantTotalAlur = hiredCandidates.filter(c => {
    if (c.appliedDate && c.hiredDate) {
      const start = new Date(c.appliedDate);
      const end = new Date(c.hiredDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // Patokan batas maksimal aman 30 hari
    }
    return false;
  }).length;

  const totalSlaAlurPercentage = hiredCandidates.length > 0
    ? ((compliantTotalAlur / hiredCandidates.length) * 100).toFixed(1)
    : '0.0'; // Fallback 0% jika tidak ada transaksi kelulusan

  // 5. KOREKSI RUMUS SLA COMPLIANCE RATE KESELURUHAN (0% jika tidak ada transaksi)
  const delayedSlaCount = filteredCandidates.filter(c => c.slaStatus === 'Delayed').length;
  const slaCompliance = totalCount > 0 ? (((totalCount - delayedSlaCount) / totalCount) * 100).toFixed(1) : '0.0';

  // ==========================================
  // CONFIG BARIS ATAS: 5 KARTU UTAMA DATA
  // ==========================================
  const topCards = [
    {
      title: 'Total Pelamar',
      value: totalCount,
      icon: <Users className="text-blue-600" size={16} />,
      bgColor: 'border-blue-100 bg-blue-50/20',
      desc: 'Database Resume Masuk',
      onClick: () => setPopup({
        title: 'Daftar Rincian Semua Pelamar Kerja',
        items: filteredCandidates.map(c => ({ label: c.name, sub: c.position || 'No Position', badge: c.stage }))
      })
    },
    {
      title: 'Jadwal Interview',
      value: interviews.length,
      icon: <Calendar className="text-purple-600" size={16} />,
      bgColor: 'border-purple-100 bg-purple-50/20',
      desc: 'Sesi Wawancara Aktif',
      onClick: () => setPopup({
        title: 'Daftar Agenda Wawancara Kandidat',
        items: interviews.map(i => ({ label: `Wawancara: ${i.candidateName || 'Pelamar'}`, sub: `Jadwal: ${i.date || '-'} - Jam: ${i.time || '-'}` }))
      })
    },
    {
      title: 'Lowongan Aktif',
      value: jobs.filter(j => j.status === 'Active').length,
      icon: <Briefcase className="text-emerald-600" size={16} />,
      bgColor: 'border-emerald-100 bg-emerald-50/20',
      desc: 'Posisi Rekrutmen Dibuka',
      onClick: () => setPopup({
        title: 'Daftar Lowongan Pekerjaan Perusahaan',
        items: jobs.filter(j => j.status === 'Active').map(j => ({ label: j.title, sub: `Departemen: ${j.department || 'Umum'} (Budget: Rp ${(j.cost || 0).toLocaleString('id-ID')})` }))
      })
    },
    {
      title: 'Medical',
      value: medicalCandidates.length,
      icon: <HeartPulse className="text-cyan-600" size={16} />,
      bgColor: 'border-cyan-100 bg-cyan-50/20',
      desc: 'Tahap Tes Kesehatan',
      onClick: () => setPopup({
        title: 'Daftar Pelamar di Tahap Medical Checkup',
        items: medicalCandidates.map(c => ({ label: c.name, sub: `Posisi: ${c.position || 'Umum'} | Tanggal Apply: ${c.appliedDate || '-'}` }))
      })
    },
    {
      title: 'Hired',
      value: hiredCandidates.length,
      icon: <ShieldCheck className="text-green-600" size={16} />,
      bgColor: 'border-green-100 bg-green-50/20',
      desc: 'Kandidat Diterima Kerja',
      onClick: () => setPopup({
        title: 'Daftar Pelamar Berstatus Lolos (Hired)',
        items: hiredCandidates.map(c => ({ label: c.name, sub: `Bergabung Posisi: ${c.position || 'Umum'} | Durasi: ${c.hiredDate ? 'Selesai' : 'Dalam Proses'}` }))
      })
    }
  ];

  // ==========================================
  // CONFIG BARIS BAWAH: 3 KARTU METRIK & SLA
  // ==========================================
  const bottomCards = [
    {
      title: 'SLA Compliance Rate',
      value: `${slaCompliance}%`,
      icon: <Percent className="text-indigo-600" size={16} />,
      bgColor: 'border-indigo-100 bg-indigo-50/20',
      desc: 'Tingkat Ketepatan Waktu Setiap Tahap',
      onClick: () => setPopup({
        title: 'Analisis Keterlambatan SLA (Delayed Status)',
        items: filteredCandidates.filter(c => c.slaStatus === 'Delayed').map(c => ({ label: c.name, sub: `Terhambat di Tahap: ${c.stage}`, badge: 'Rejected' }))
      })
    },
    {
      title: 'Rata-rata Time to Hire',
      value: `${avgTimeToHire} Hari`,
      icon: <Clock className="text-orange-600" size={16} />,
      bgColor: 'border-orange-100 bg-orange-50/20',
      desc: 'Kecepatan Rata-rata Pemrosesan Lolos',
      onClick: () => setPopup({
        title: 'Durasi Rincian Pengisian Posisi (Time to Hire)',
        items: hiredCandidates.map(c => ({ label: c.name, sub: `Posisi: ${c.position} | Dari Apply s/d Hired selesai` }))
      })
    },
    {
      title: 'Total SLA Alur Proses',
      value: `${totalSlaAlurPercentage}%`,
      icon: <AlertCircle className="text-rose-600" size={16} />,
      bgColor: 'border-rose-100 bg-rose-50/20',
      desc: 'Efisiensi Alur Selesai (Maksimal 30 Hari)',
      onClick: () => setPopup({
        title: 'Kepatuhan Alur Penuh (Apply hingga Hired ≤ 30 Hari)',
        items: hiredCandidates.map(c => {
          let selisih = 0;
          if (c.appliedDate && c.hiredDate) {
            selisih = Math.ceil(Math.abs(new Date(c.hiredDate).getTime() - new Date(c.appliedDate).getTime()) / (1000 * 60 * 60 * 24));
          }
          return {
            label: c.name,
            sub: `Total Durasi Pemrosesan: ${selisih} Hari`,
            badge: selisih <= 30 ? 'Hired' : 'Rejected'
          };
        })
      })
    }
  ];

  return (
    <div className="w-full text-left space-y-6">
      
      {/* SEKTOR BARIS ATAS: BARISAN 5 KARTU DATA UTAMA OPERASIONAL */}
      <div>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Ringkasan Operasional Rekrutmen</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topCards.map((card, idx) => (
            <button
              key={idx}
              onClick={card.onClick}
              className={`p-4 rounded-2xl border ${card.bgColor} bg-white flex flex-col justify-between shadow-sm transition-all hover:scale-[1.01] hover:shadow text-left cursor-pointer`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">{card.icon}</div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SEKTOR BARIS BAWAH: BARISAN 3 KARTU METRIK & EFISIENSI SLA UTUH */}
      <div>
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Matriks Kepatuhan Waktu & SLA Ketepatan</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bottomCards.map((card, idx) => (
            <button
              key={idx}
              onClick={card.onClick}
              className={`p-4 rounded-2xl border ${card.bgColor} bg-white flex flex-col justify-between shadow-sm transition-all hover:scale-[1.01] hover:shadow text-left cursor-pointer`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">{card.icon}</div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* GLOBAL POP-UP MODAL WINDOW DETAIL DATA */}
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
