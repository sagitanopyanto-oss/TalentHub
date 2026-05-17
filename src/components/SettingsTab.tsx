import { useState, useEffect } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Save, Bell, ShieldCheck, Calendar } from 'lucide-react';
import { SLASettings } from './SLASettings';

export function SettingsTab() {
  const { hiringBudget, setHiringBudget, systemSettings, setSystemSettings } = useRecruitment();
  const [tempSettings, setTempSettings] = useState(systemSettings);
  const [tempBudget, setTempBudget] = useState(hiringBudget);

  useEffect(() => {
    setTempSettings(systemSettings);
    setTempBudget(hiringBudget);
  }, [systemSettings, hiringBudget]);

  return (
    <div className="space-y-8">
      {/* System Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Pengaturan Sistem</h3>
            <p className="text-slate-500">Konfigurasi preferensi dashboard Anda.</p>
          </div>
          <button onClick={() => setSystemSettings(tempSettings)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2">
            <Save size={16} /> Simpan Pengaturan
          </button>
        </div>
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Notifikasi Email <Bell size={14} className="inline text-slate-400"/></h4>
              <p className="text-sm text-slate-500">Terima notifikasi ketika ada kandidat baru</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={tempSettings.emailNotifications} onChange={e => setTempSettings({...tempSettings, emailNotifications: e.target.checked})} />
              <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Auto-Screening <ShieldCheck size={14} className="inline text-slate-400"/></h4>
              <p className="text-sm text-slate-500">Screening otomatis berdasarkan kriteria</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={tempSettings.autoScreening} onChange={e => setTempSettings({...tempSettings, autoScreening: e.target.checked})} />
              <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Integrasi Kalender <Calendar size={14} className="inline text-slate-400"/></h4>
              <p className="text-sm text-slate-500">Sinkronisasi jadwal wawancara dengan Google Calendar</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={tempSettings.calendarIntegration} onChange={e => setTempSettings({...tempSettings, calendarIntegration: e.target.checked})} />
              <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">💵 Pengaturan Budget Hiring</h3>
            <p className="text-slate-500">Tentukan batas budget maksimal proses rekrutmen.</p>
          </div>
          <button onClick={() => setHiringBudget(tempBudget)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2">
            <Save size={16} /> Simpan Budget
          </button>
        </div>
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Batas Anggaran Bulanan (Rp)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                min="0" 
                step="5000000"
                value={tempBudget} 
                onChange={e => setTempBudget(Number(e.target.value) || 0)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono" 
              />
              <span className="inline-flex items-center px-3.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-500 border border-slate-200">Rupiah</span>
            </div>
          </div>
        </div>
      </div>
      <SLASettings />
    </div>
  );
}
