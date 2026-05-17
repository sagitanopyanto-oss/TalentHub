import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Timer, Save, X } from 'lucide-react';
import { SLAConfig } from '../data/mockData';

const stageLabels: Record<string, string> = {
  'Screening': 'Screening',
  'Interview': 'Interview',
  'Assessment': 'Assessment',
  'Offer': 'Offering',
  'Medical': 'Medical Check-up',
  'Hired': 'Hired (Target 0 hari)',
};

export function SLASettings() {
  const { slaConfig, updateSlaConfig } = useRecruitment();
  const [localConfig, setLocalConfig] = useState<SLAConfig[]>([...slaConfig]);
  const [isDirty, setIsDirty] = useState(false);

  const handleDaysChange = (stage: string, days: number) => {
    const newConfig = localConfig.map((cfg) =>
      cfg.stage === stage ? { ...cfg, slaDays: Math.max(0, days) } : cfg
    );
    setLocalConfig(newConfig);
    setIsDirty(true);
  };

  const handleSave = () => {
    updateSlaConfig(localConfig);
    setIsDirty(false);
  };

  const handleReset = () => {
    setLocalConfig([...slaConfig]);
    setIsDirty(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Timer size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">⏱️ Pengaturan SLA Rekrutmen</h3>
            <p className="text-sm text-slate-500">Atur batas waktu (dalam hari) untuk setiap tahap rekrutmen</p>
          </div>
        </div>
        {isDirty && (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={16} /> Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Save size={16} /> Simpan Perubahan
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localConfig.map((cfg) => (
          <div
            key={cfg.stage}
            className="p-5 border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              <span className="text-sm font-semibold text-slate-700">
                {stageLabels[cfg.stage] || cfg.stage}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="30"
                value={cfg.slaDays}
                onChange={(e) =>
                  handleDaysChange(cfg.stage, parseInt(e.target.value) || 0)
                }
                className="w-20 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono text-center"
              />
              <span className="text-xs text-slate-500">hari maksimal</span>
            </div>
            {cfg.stage === 'Hired' && (
              <p className="text-[10px] text-slate-400 mt-2">
                * Target 0 hari berarti tahap final (otomatis selesai)
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">💡 Tips Pengaturan SLA:</h4>
        <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
          <li>SLA membantu tim HR menjaga kecepatan proses rekrutmen agar kandidat tidak menunggu terlalu lama.</li>
          <li>Tahap <strong>Screening</strong> biasanya 3-5 hari untuk review CV dan portofolio.</li>
          <li>Tahap <strong>Interview</strong> dapat disesuaikan dengan ketersediaan user/pewawancara (5-7 hari).</li>
          <li>Tahap <strong>Medical</strong> bergantung pada rumah sakit/klinik mitra (3-7 hari).</li>
          <li>Nilai SLA yang terlalu ketat dapat menyebabkan banyak violation, terlalu longgar mengurangi urgensi.</li>
        </ul>
      </div>
    </div>
  );
}
