import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate } from '../data/mockData';
import { Clock, AlertTriangle, CheckCircle2, Timer, TrendingUp } from 'lucide-react';

// PERBAIKAN: Masukkan 'Applied' ke dalam urutan agar indeks pelacakan hari bernilai akurat
const stageOrder: Candidate['stage'][] = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired'];

function daysBetween(date1: string, date2: string): number {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function getElapsedTime(candidate: Candidate, currentStage: string): number {
  const todayStr = new Date().toISOString().split('T')[0];
  const idx = stageOrder.indexOf(currentStage as Candidate['stage']);
  
  // Jika berada di tahap paling awal, hitung selisih dari tanggal melamar pertama kali
  if (idx <= 0) return daysBetween(candidate.appliedDate, todayStr);

  const dateFields: Record<string, string | null | undefined> = {
    'Applied': candidate.appliedDate,
    'Screening': candidate.appliedDate,
    'Interview': candidate.interviewDate,
    'Assessment': candidate.assessmentDate,
    'Offer': candidate.offerDate,
    'Medical': candidate.medicalDate,
    'Hired': candidate.hiredDate,
  };

  // Mekanisme pelacakan mundur cerdas jika tanggal di tahap berjalan bernilai null
  let validStartDate = dateFields[currentStage];
  if (!validStartDate) {
    for (let i = idx - 1; i >= 0; i--) {
      const prevStage = stageOrder[i];
      if (dateFields[prevStage]) {
        validStartDate = dateFields[prevStage];
        break;
      }
    }
  }

  return daysBetween(validStartDate || candidate.appliedDate, todayStr);
}

export function SLAInfo() {
  // SINKRONISASI GLOBAL: Ambil state data rekrutmen serta jangka waktu aktif dari dasbor utama
  const { candidates, slaConfig, selectedTimeRange } = useRecruitment();

  // Filter waktu dinamis agar laporan SLA sinkron secara realtime saat filter dasbor diubah
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

  const filteredCandidates = getFilteredCandidates();

  // Analisis per tahap berdasarkan data yang sudah tersaring waktu
  const stageAnalysis = slaConfig
    .filter(s => s.stage !== 'Hired')
    .map((sla) => {
      const inStage = filteredCandidates.filter((c) => c.stage === sla.stage && c.stage !== 'Rejected');
      const violating = inStage.filter((c) => {
        const elapsed = getElapsedTime(c, sla.stage);
        return elapsed > sla.slaDays;
      });
      const compliant = inStage.length - violating.length;
      const complianceRate = inStage.length > 0 ? Math.round((compliant / inStage.length) * 100) : 100;

      return {
        ...sla,
        totalInStage: inStage.length,
        violating: violating.length,
        compliant,
        complianceRate,
      };
    });

  // Time to hire analysis (rata-rata untuk yang sudah hired)
  const hiredCandidates = filteredCandidates.filter(c => c.stage === 'Hired');
  const avgTimeToHire = hiredCandidates.length > 0
    ? Math.round(hiredCandidates.reduce((sum, c) => sum + daysBetween(c.appliedDate, c.hiredDate), 0) / hiredCandidates.length)
    : 0;

  // Overall SLA compliance
  const totalActive = filteredCandidates.filter((c) => c.stage !== 'Rejected' && c.stage !== 'Hired').length;
  const totalViolating = stageAnalysis.reduce((sum, s) => sum + s.violating, 0);
  const overallCompliance = totalActive > 0 ?
    Math.round(((totalActive - totalViolating) / totalActive) * 100) : 100;

  // Candidates at risk (dekat deadline SLA)
  const atRiskCandidates = filteredCandidates
    .filter((c) => c.stage !== 'Rejected' && c.stage !== 'Hired')
    .map((c) => {
      const sla = slaConfig.find((s) => s.stage === c.stage);
      if (!sla) return null;
      const elapsed = getElapsedTime(c, c.stage);
      const remaining = sla.slaDays - elapsed;
      return { ...c, elapsed, remaining, slaDays: sla.slaDays };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null && c.remaining <= 2 && c.remaining > 0)
    .sort((a, b) => a.remaining - b.remaining);

  return (
    <div className="space-y-6">
      {/* SLA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall Compliance */}
        <div className={`rounded-2xl p-5 border shadow-sm ${
          overallCompliance >= 80 ? 'bg-emerald-50 border-emerald-200' :
          overallCompliance >= 60 ? 'bg-amber-50 border-amber-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${
              overallCompliance >= 80 ? 'text-emerald-700' :
              overallCompliance >= 60 ? 'text-amber-700' : 'text-red-700'
            }`}>SLA Compliance</span>
            {overallCompliance >= 80 ? <CheckCircle2 size={20} className="text-emerald-500" /> :
             overallCompliance >= 60 ? <Clock size={20} className="text-amber-500" /> :
             <AlertTriangle size={20} className="text-red-500" />}
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{overallCompliance}%</div>
          <p className="text-xs text-slate-500">Dari {totalActive} kandidat aktif, {totalViolating} melebihi SLA</p>
        </div>

        {/* Avg Time to Hire */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-md shadow-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white/80">Rata-rata Time to Hire</span>
            <TrendingUp size={20} className="text-white/70" />
          </div>
          <div className="text-3xl font-bold mb-1">{avgTimeToHire} hari</div>
          <p className="text-xs text-white/70">Dari {hiredCandidates.length} kandidat yang diterima</p>
        </div>

        {/* Total SLA Days */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Total SLA Proses</span>
            <Timer size={20} className="text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">
            {slaConfig.filter((s) => s.slaDays > 0).reduce((sum, s) => sum + s.slaDays, 0)} hari
          </div>
          <p className="text-xs text-slate-500">Maksimum proses dari screening hingga hired</p>
        </div>
      </div>

      {/* SLA Detail Table — Freeze Kolom "Tahap" + Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 text-left">
          <h3 className="font-bold text-slate-800">Detail SLA per Tahap</h3>
          <p className="text-xs text-slate-500 mt-1">Monitoring batas waktu dan compliance rate setiap tahap rekrutmen</p>
        </div>
        <div className="overflow-auto max-h-[45vh] relative isolate">
          <table className="w-full border-separate border-spacing-0 min-w-[700px]">
            <thead className="sticky top-0 z-40">
              <tr className="bg-slate-50">
                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b border-r border-slate-200 sticky left-0 top-0 z-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]">Tahap</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-40">SLA (Hari)</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-40">Kandidat</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-40">Compliant</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-40">Violation</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-40 min-w-[180px]">Compliance Rate</th>
                <th className="text-center py-3 px-6 text-xs font-semibold text-slate-600 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stageAnalysis.map((stage) => (
                <tr key={stage.stage} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-6 sticky left-0 bg-white border-b border-r border-slate-100 z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)] text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                      <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">{stage.stage}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{stage.slaDays} hari</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-semibold text-slate-700">{stage.totalInStage}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-semibold text-emerald-600">{stage.compliant}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-semibold ${stage.violating > 0 ? 'text-red-600' : 'text-slate-400'}`}>{stage.violating}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${stage.complianceRate >= 80 ? 'bg-emerald-500' : stage.complianceRate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${stage.complianceRate}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{stage.complianceRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {stage.complianceRate === 100 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={12} /> Tercapai
                      </span>
                    ) : stage.complianceRate >= 80 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <Clock size={12} /> Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <AlertTriangle size={12} /> Violation
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidates At Risk */}
      {atRiskCandidates.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden text-left">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              <h3 className="font-bold text-amber-800">Kandidat Mendekati Deadline SLA</h3>
            </div>
            <p className="text-xs text-amber-600 mt-1">Kandidat ini perlu diproses segera sebelum melewati batas SLA</p>
          </div>
          <div className="divide-y divide-slate-100">
            {atRiskCandidates.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-3 hover:bg-amber-50/30 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.position} — Tahap: <span className="font-semibold text-indigo-600">{c.stage}</span></p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Sisa waktu</p>
                    <p className={`text-sm font-bold ${c.remaining <= 1 ? 'text-red-600' : 'text-amber-600'}`}>
                      {c.remaining} hari lagi
                    </p>
                  </div>
                  <div className="w-14">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.remaining <= 1 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.max(((c.slaDays - c.remaining) / c.slaDays) * 100, 10)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-0.5">{c.elapsed}/{c.slaDays} hari</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
