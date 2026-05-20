import { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate } from '../data/mockData';

// Konfigurasi label dan warna
const stageLabels: Record<string, string> = {
  'Applied': 'Lamaran', 'Screening': 'Screening', 'Interview': 'Interview',
  'Assessment': 'Assessment', 'Offer': 'Offering', 'Medical': 'Medical', 'Hired': 'Hired',
};

export function PipelineChart() {
  const { candidates, slaConfig } = useRecruitment();
  const [popup, setPopup] = useState<{ stage: string; items: Candidate[] } | null>(null);

  // Fungsi kalkulasi data tabel
  const tableData = slaConfig.map(config => {
    const stageCandidates = candidates.filter(c => c.stage === config.stage);
    
    // Logika sederhana: Menghitung violation berdasarkan selisih tanggal (mock)
    // Dalam implementasi asli, bandingkan c.appliedDate dengan tanggal hari ini
    const compliant = stageCandidates.filter(c => Math.random() > 0.3).length; 
    const violation = stageCandidates.length - compliant;
    const rate = stageCandidates.length > 0 ? Math.round((compliant / stageCandidates.length) * 100) : 100;

    return {
      stage: config.stage,
      label: stageLabels[config.stage] || config.stage,
      targetSla: `${config.slaDays} Hari`,
      total: stageCandidates.length,
      compliant,
      violation,
      rate,
      status: rate >= 80 ? 'Good' : 'Warning'
    };
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
      <h3 className="text-sm font-black text-slate-800 mb-4">Pipeline Kepatuhan SLA</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100">
              <th className="py-3 font-bold">Proses</th>
              <th className="py-3 font-bold">Target SLA</th>
              <th className="py-3 font-bold text-center">Kandidat</th>
              <th className="py-3 font-bold text-emerald-600">Compliant</th>
              <th className="py-3 font-bold text-red-500">Violation</th>
              <th className="py-3 font-bold">Compliance Rate</th>
              <th className="py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tableData.map(row => (
              <tr key={row.stage} className="hover:bg-slate-50 cursor-pointer" onClick={() => setPopup({ stage: row.stage, items: candidates.filter(c => c.stage === row.stage) })}>
                <td className="py-3 font-semibold text-slate-700">{row.label}</td>
                <td className="py-3 text-slate-500">{row.targetSla}</td>
                <td className="py-3 text-center font-bold text-slate-600">{row.total}</td>
                <td className="py-3 text-emerald-600 font-bold">{row.compliant}</td>
                <td className="py-3 text-red-500 font-bold">{row.violation}</td>
                <td className="py-3 font-black">{row.rate}%</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-md font-bold ${row.status === 'Good' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    {row.status === 'Good' ? 'Normal' : 'Check'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pop-up Detail */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-800">Detail Kandidat: {stageLabels[popup.stage]}</h4>
              <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {popup.items.length > 0 ? popup.items.map(c => (
                <div key={c.id} className="p-3 flex items-center justify-between border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-md">{c.position}</span>
                </div>
              )) : <p className="p-8 text-center text-slate-400 text-xs">Data tidak ditemukan.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
