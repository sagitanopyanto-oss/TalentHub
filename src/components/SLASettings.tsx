import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Timer, Save, X, Info } from 'lucide-react';
import { SLAConfig } from '../data/mockData';

// PERBAIKAN: Tambahkan label untuk tahap 'Applied' agar visualisasi penamaan seragam
const stageLabels: Record<string, string> = {
  'Applied': 'Lamaran Masuk',
  'Screening': 'Screening CV',
  'Interview': 'Sesi Wawancara',
  'Assessment': 'Assessment / Test',
  'Offer': 'Offering Letter',
  'Medical': 'Medical Check-up',
  'Hired': 'Hired (Target Final)',
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <Timer size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pengaturan SLA Rekrutmen</h3>
            <p className="text-xs text-slate-500 mt-0.5">Atur ambang batas durasi maksimal (dalam hari) untuk memproses kandidat</p>
          </div>
        </div>
        
        {isDirty && (
          <div className="flex items-center gap-2 self-end sm:self-auto animate-in fade-in slide-in-from-right-4 duration-200">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-transparent"
            >
              <X size={14} /> Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-all"
            >
              <Save size={14} /> Simpan SLA
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {localConfig.map((cfg) => (
          <div
            key={cfg.stage}
            className="p-5 border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all bg-white relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              <span className="text-sm font-bold text-slate-700">
                {stageLabels[cfg.stage] || cfg.stage}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                // PERBAIKAN: Menghapus max="30" kaku untuk mendukung fleksibilitas rekrutmen jangka panjang
                value={cfg.slaDays}
                disabled={cfg.stage === 'Hired'}
                onChange={(e) =>
                  handleDaysChange(cfg.stage, parseInt(e.target.value) || 0)
                }
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold font-mono text-center disabled:bg-slate-50 disabled:text-slate-400"
              />
              <span className="text-xs text-slate-500 font-medium">hari batas maksimal</span>
            </div>

            {cfg.stage === 'Hired' ? (
              <p className="text-[10px] font-medium text-emerald-600 mt-2 flex items-center gap-1">
                <Info size={10} /> Tahap final selesai otomatis
              </p>
            ) : cfg.stage === 'Applied' ? (
              <p className="text-[10px] font-medium text-slate-400 mt-2">
                * Batas maksimal menyaring berkas masuk
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info size={14} className="text-indigo-500" /> Tips Konfigurasi SLA:
        </h4>
        <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside pl-1 leading-relaxed">
          <li>SLA membantu tim HR menjaga ritme rekrutmen agar pelamar unggulan tidak lepas ke perusahaan pesaing[cite: 17].</li>
          <li>Tahap <strong>Screening CV</strong> idealnya diselesaikan dalam 3-5 hari kerja[cite: 17].</li>
          <li>Tahap <strong>Sesi Wawancara</strong> sebaiknya mempertimbangkan koordinasi jadwal kosong tim *user* internal (5-7 hari)[cite: 17].</li>
          <li>Nilai SLA yang terlalu ketat memicu alarm *violation* palsu, sementara nilai yang terlalu longgar akan menurunkan urgensi kerja tim operational[cite: 17].</li>
        </ul>
      </div>
    </div>
  );
}
