import { useState, useEffect } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Save, Bell, ShieldCheck, Calendar, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { SLASettings } from './SLASettings';

// Tambahkan properti opsional untuk menangkap kiriman ID tab dari komponen induk jika ada
export function SettingsTab({ activeSubTab }: { activeSubTab?: string }) {
  const { hiringBudget, setHiringBudget, systemSettings, setSystemSettings, isAdmin } = useRecruitment();
  const [tempSettings, setTempSettings] = useState(systemSettings);
  const [tempBudget, setTempBudget] = useState<number | ''>(hiringBudget);

  const [isSystemSaved, setIsSystemSaved] = useState(false);
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);

  useEffect(() => {
    if (systemSettings) setTempSettings(systemSettings);
    if (hiringBudget !== undefined) setTempBudget(hiringBudget);
  }, [systemSettings, hiringBudget]);

  // Jika diakses oleh non-admin, kunci tampilan dengan pesan yang aman agar tidak blank putih
  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-left flex items-start gap-3 max-w-xl mx-auto mt-8">
        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm mb-1">Akses Ditolak</h4>
          <p className="text-xs text-red-600 leading-relaxed">Anda tidak memiliki hak otorisasi yang cukup untuk membuka panel konfigurasi sistem TalentHub. Silakan hubungi Super Admin untuk informasi lebih lanjut.</p>
        </div>
      </div>
    );
  }

  const handleSaveSystem = () => {
    setSystemSettings(tempSettings);
    setIsSystemSaved(true);
    setTimeout(() => setIsSystemSaved(false), 2000);
  };

  const handleSaveBudget = () => {
    const finalBudget = tempBudget === '' ? 0 : tempBudget;
    setHiringBudget(finalBudget);
    setTempBudget(finalBudget);
    setIsBudgetSaved(true);
    setTimeout(() => setIsBudgetSaved(false), 2000);
  };

  // LOGIKA PINTAR: Jika komponen induk secara spesifik memanggil tab 'sla-settings', langsung tampilkan SLASettings saja tanpa membungkus pengaturan budget bulanan.
  if (activeSubTab === 'sla-settings') {
    return <SLASettings />;
  }

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-200">
      {/* System Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Pengaturan Sistem</h3>
            <p className="text-xs text-slate-500 mt-0.5">Konfigurasi preferensi fungsionalitas otomasi dashboard Anda</p>
          </div>
         
          <button 
            onClick={handleSaveSystem} 
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              isSystemSaved 
                ? 'bg-emerald-500 text-white shadow-emerald-500/10' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/10'
            }`}
          >
            {isSystemSaved ? (
              <>
                <CheckCircle size={16} className="animate-bounce" /> Tersimpan!
              </>
            ) : (
              <>
                <Save size={16} /> Simpan Pengaturan
              </>
            )}
          </button>
        </div>

        <div className="space-y-4 max-w-2xl">
          {/* Notifikasi Email */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-100 transition-colors bg-white">
            <div className="pr-4">
              <h4 className="font-bold text-slate-800 text-sm mb-0.5 flex items-center gap-1.5">
                Notifikasi Email <Bell size={14} className="text-slate-400"/>
              </h4>
              <p className="text-xs text-slate-500">Kirimkan pemberitahuan otomatis ke email tim HR ketika ada berkas pelamar baru masuk</p>
            </div>
            <label className="inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={tempSettings?.emailNotifications || false} 
                onChange={e => setTempSettings({...tempSettings, emailNotifications: e.target.checked})} 
              />
              <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Auto-Screening */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-100 transition-colors bg-white">
            <div className="pr-4">
              <h4 className="font-bold text-slate-800 text-sm mb-0.5 flex items-center gap-1.5">
                Auto-Screening Berkas <ShieldCheck size={14} className="text-slate-400"/>
              </h4>
              <p className="text-xs text-slate-500">Gunakan kecerdasan buatan untuk menyaring kompetensi dasar pelamar secara otomatis</p>
            </div>
            <label className="inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={tempSettings?.autoScreening || false} 
                onChange={e => setTempSettings({...tempSettings, autoScreening: e.target.checked})} 
              />
              <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Integrasi Kalender */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-100 transition-colors bg-white">
            <div className="pr-4">
              <h4 className="font-bold text-slate-800 text-sm mb-0.5 flex items-center gap-1.5">
                Integrasi Kalender Perusahaan <Calendar size={14} className="text-slate-400"/>
              </h4>
              <p className="text-xs text-slate-500">Sinkronisasikan setiap jadwal wawancara dengan akun Google Calendar tim penguji</p>
            </div>
            <label className="inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={tempSettings?.calendarIntegration || false} 
                onChange={e => setTempSettings({...tempSettings, calendarIntegration: e.target.checked})} 
              />
              <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">💵 Pengaturan Anggaran Hiring</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tentukan limitasi alokasi dana maksimal operasional proses rekrutmen berjalan</p>
          </div>
          <button 
            onClick={handleSaveBudget} 
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
              isBudgetSaved 
                ? 'bg-emerald-500 text-white shadow-emerald-500/10' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/10'
            }`}
          >
            {isBudgetSaved ? (
              <>
                <CheckCircle size={16} className="animate-bounce" /> Anggaran Diperbarui!
              </>
            ) : (
              <>
                <Save size={16} /> Simpan Anggaran
              </>
            )}
          </button>
        </div>
        
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">Batas Anggaran Bulanan (IDR)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                min="0" 
                step="5000000"
                placeholder="Contoh: 50000000"
                value={tempBudget} 
                onChange={e => {
                  const val = e.target.value;
                  setTempBudget(val === '' ? '' : Number(val));
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold font-mono" 
              />
              <span className="inline-flex items-center px-4 rounded-xl bg-slate-100 text-xs font-bold text-slate-500 border border-slate-200">Rupiah</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium flex items-start gap-1 leading-relaxed">
            <Info size={12} className="text-slate-400 shrink-0 mt-0.5" /> 
            Perubahan limit anggaran bulanan akan memengaruhi indikator grafik biaya iklan di beranda.
          </p>
        </div>
      </div>

      {/* Tetap panggil SLASettings di bagian bawah secara fallback aman */}
      <SLASettings />
    </div>
  );
}
