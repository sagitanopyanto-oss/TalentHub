import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Candidate } from '../data/mockData';
import { X } from 'lucide-react';

export function PipelineChart() {
  const { candidates, slaConfig } = useRecruitment();
  const [popup, setPopup] = useState<{ stage: string; items: Candidate[] } | null>(null);

  // Menyinkronkan data pipeline dengan SLA Config dari context
  const pipelineData = slaConfig.map((config) => ({
    ...config,
    value: candidates.filter(c => c.stage === config.stage).length
  }));

  const total = candidates.filter(c => c.stage !== 'Rejected').length;
  const maxValue = Math.max(...pipelineData.map(d => d.value), 1);

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pipeline Rekrutmen</h3>
            <p className="text-sm text-slate-500 mt-1">Distribusi kandidat & Target SLA</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-800">{total}</p>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Aktif</p>
          </div>
        </div>

        <div className="space-y-4">
          {pipelineData.map((item) => (
            <div 
              key={item.stage} 
              className="group cursor-pointer"
              onClick={() => setPopup({ stage: item.stage, items: candidates.filter(c => c.stage === item.stage) })}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                    {item.stage} <span className="text-[10px] text-slate-400 ml-1">({item.slaDays} hari)</span>
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-700">{item.value} Kandidat</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-90"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pop-up Detail */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Detail: {popup.stage}</h3>
              <button onClick={() => setPopup(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              {popup.items.length > 0 ? `Terdapat ${popup.items.length} kandidat dalam proses ini.` : "Belum ada kandidat di tahap ini."}
            </p>
            {popup.items.map(c => (
              <div key={c.id} className="py-2 border-b text-sm font-medium">{c.name}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
