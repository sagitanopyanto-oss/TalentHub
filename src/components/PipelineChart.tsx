import { useState } from 'react';
import { X } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate } from '../data/mockData';

const stageLabels: Record<string, string> = {
  'Applied': 'Lamaran', 'Screening': 'Screening', 'Interview': 'Interview',
  'Assessment': 'Assessment', 'Offer': 'Offering', 'Medical': 'Medical', 'Hired': 'Hired',
};

export function PipelineChart() {
  const { candidates } = useRecruitment();
  const [popup, setPopup] = useState<{ stage: string; items: Candidate[] } | null>(null);

  const stages = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired'];

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Pipeline Rekrutmen</h3>
          <p className="text-sm text-slate-500 mt-1">Total Pelamar: <strong>{candidates.length} Orang</strong></p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-100">
                <th className="pb-3 font-semibold">Tahap</th>
                <th className="pb-3 font-semibold text-right">Jumlah</th>
                <th className="pb-3 font-semibold text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stages.map((stage) => {
                const count = candidates.filter(c => c.stage === stage).length;
                return (
                  <tr key={stage} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-sm font-medium text-slate-700">{stageLabels[stage]}</td>
                    <td className="py-3 text-sm font-bold text-slate-900 text-right">{count}</td>
                    <td className="py-3 text-center">
                      <button 
                        onClick={() => setPopup({ stage, items: candidates.filter(c => c.stage === stage) })}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup tetap dipertahankan agar fungsi detail tetap berjalan */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Tahap: {stageLabels[popup.stage]} ({popup.items.length} kandidat)</h3>
              <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {popup.items.length > 0 ? (
                popup.items.map(c => (
                  <div key={c.id} className="py-2 border-b last:border-none">
                    <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.position}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center">Tidak ada data</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
