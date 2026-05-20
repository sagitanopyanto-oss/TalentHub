import { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate } from '../data/mockData';

export function PipelineChart() {
  const { candidates, slaConfig } = useRecruitment();
  const [popup, setPopup] = useState<{ stage: string; items: Candidate[] } | null>(null);

  // Kalkulasi data per tahap berdasarkan SLA Config
  const pipelineData = slaConfig.map((config) => {
    const stageCandidates = candidates.filter(c => c.stage === config.stage);
    const compliant = stageCandidates.filter(c => c.slaStatus === 'On-Track').length;
    const violation = stageCandidates.filter(c => c.slaStatus === 'Delayed').length;
    const rate = stageCandidates.length > 0 ? Math.round((compliant / stageCandidates.length) * 100) : 0;

    return {
      ...config,
      total: stageCandidates.length,
      compliant,
      violation,
      rate
    };
  });

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">DETAIL SLA PER TAHAP:</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-100">
                <th className="pb-4 px-2">Tahap/Proses</th>
                <th className="pb-4 px-2">Target SLA</th>
                <th className="pb-4 px-2 text-center">Kandidat</th>
                <th className="pb-4 px-2 text-center">Compliant</th>
                <th className="pb-4 px-2 text-center">Violation</th>
                <th className="pb-4 px-2">Compliance Rate</th>
                <th className="pb-4 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pipelineData.map((row) => (
                <tr 
                  key={row.stage} 
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setPopup({ stage: row.stage, items: candidates.filter(c => c.stage === row.stage) })}
                >
                  <td className="py-4 px-2 font-bold flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                    {row.stage}
                  </td>
                  <td className="py-4 px-2 text-slate-600 text-sm">{row.slaDays} hari</td>
                  <td className="py-4 px-2 text-center font-bold text-slate-700">{row.total}</td>
                  <td className="py-4 px-2 text-center font-bold text-emerald-600">{row.compliant}</td>
                  <td className="py-4 px-2 text-center font-bold text-red-600">{row.violation}</td>
                  <td className="py-4 px-2 text-sm text-slate-500 w-32">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                      <div className="bg-slate-300 h-1.5 rounded-full" style={{ width: `${row.rate}%` }} />
                    </div>
                    {row.rate}%
                  </td>
                  <td className="py-4 px-2">
                    {row.violation > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 uppercase">
                        <AlertTriangle size={10} /> Violation
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">
                        <CheckCircle size={10} /> Compliant
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up Detail Pipeline */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Detail Tahap: {popup.stage}</h3>
              <button onClick={() => setPopup(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="text-sm text-slate-600">
              {popup.items.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {popup.items.map(item => <li key={item.id}>{item.name}</li>)}
                </ul>
              ) : (
                <p>Belum ada data transaksi pada tahapan ini.</p>
              )}
            </div>
            <button className="mt-6 w-full bg-slate-800 text-white py-2 rounded-xl font-bold" onClick={() => setPopup(null)}>Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}
