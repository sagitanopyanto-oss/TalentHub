import React, { useState, useEffect } from 'react';
import { Save, Clock, Shield, Sliders } from 'lucide-react';

export function SettingsTab() {
  // 1. State untuk masing-masing Target SLA (6 Tahap)
  const [slaApplied, setSlaApplied] = useState<number>(3);
  const [slaScreening, setSlaScreening] = useState<number>(5);
  const [slaInterview, setSlaInterview] = useState<number>(7);
  const [slaAssessment, setSlaAssessment] = useState<number>(5);
  const [slaOffer, setSlaOffer] = useState<number>(3);
  const [slaMedical, setSlaMedical] = useState<number>(5);

  // Status notifikasi sukses/gagal simpan
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 2. Ambil data yang tersimpan di localStorage saat komponen pertama kali dibuka
  useEffect(() => {
    const savedApplied = localStorage.getItem('sla_target_applied') || localStorage.getItem('sla_applied');
    const savedScreening = localStorage.getItem('sla_target_screening') || localStorage.getItem('sla_screening');
    const savedInterview = localStorage.getItem('sla_target_interview') || localStorage.getItem('sla_interview');
    const savedAssessment = localStorage.getItem('sla_target_assessment') || localStorage.getItem('sla_assessment');
    const savedOffer = localStorage.getItem('sla_target_offer') || localStorage.getItem('sla_offer');
    const savedMedical = localStorage.getItem('sla_target_medical') || localStorage.getItem('sla_medical');

    if (savedApplied) setSlaApplied(parseInt(savedApplied, 10));
    if (savedScreening) setSlaScreening(parseInt(savedScreening, 10));
    if (savedInterview) setSlaInterview(parseInt(savedInterview, 10));
    if (savedAssessment) setSlaAssessment(parseInt(savedAssessment, 10));
    if (savedOffer) setSlaOffer(parseInt(savedOffer, 10));
    if (savedMedical) setSlaMedical(parseInt(savedMedical, 10));
  }, []);

  // 3. Fungsi penanganan simpan data (Form Submit)
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Simpan ke localStorage dengan kedua variasi key agar menjamin kecocokan sistem baku
      localStorage.setItem('sla_target_applied', slaApplied.toString());
      localStorage.setItem('sla_applied', slaApplied.toString());

      localStorage.setItem('sla_target_screening', slaScreening.toString());
      localStorage.setItem('sla_screening', slaScreening.toString());

      localStorage.setItem('sla_target_interview', slaInterview.toString());
      localStorage.setItem('sla_interview', slaInterview.toString());

      localStorage.setItem('sla_target_assessment', slaAssessment.toString());
      localStorage.setItem('sla_assessment', slaAssessment.toString());

      localStorage.setItem('sla_target_offer', slaOffer.toString());
      localStorage.setItem('sla_offer', slaOffer.toString());

      localStorage.setItem('sla_target_medical', slaMedical.toString());
      localStorage.setItem('sla_medical', slaMedical.toString());

      // Pemicu Event Kunci: Menyiarkan sinyal perubahan agar tabel detail SLA di App.tsx langsung sinkron
      window.dispatchEvent(new Event('slaSettingsUpdated'));

      // Tampilkan feedback sukses ke user
      setSaveStatus({ type: 'success', message: 'Konfigurasi target SLA berhasil diperbarui dan disinkronkan!' });
      
      // Hilangkan notifikasi sukses setelah 3 detik
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Gagal menyimpan pengaturan. Silakan coba lagi.' });
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Notifikasi Pop-up Status */}
      {saveStatus && (
        <div className={`p-4 rounded-xl border text-sm font-medium shadow-sm transition-all duration-300 ${
          saveStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {saveStatus.type === 'success' ? '✅' : '❌'} {saveStatus.message}
        </div>
      )}

      {/* Form Utama Pengaturan SLA */}
      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header Seksi */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Clock size={18} className="text-indigo-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-base">Pengaturan Batas Waktu SLA Rekrutmen</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tentukan standar maksimal durasi pengerjaan (dalam satuan hari) untuk setiap tahap seleksi.</p>
          </div>
        </div>

        {/* Konten Grid Input Form */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Tahap 1: Applied */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Target Tahap: Applied</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={slaApplied}
                onChange={(e) => setSlaApplied(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hari</span>
            </div>
          </div>

          {/* Tahap 2: Screening */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Target Tahap: Screening</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={slaScreening}
                onChange={(e) => setSlaScreening(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hari</span>
            </div>
          </div>

          {/* Tahap 3: Interview */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Target Tahap: Interview</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={slaInterview}
                onChange={(e) => setSlaInterview(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hari</span>
            </div>
          </div>

          {/* Tahap 4: Assessment */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Target Tahap: Assessment</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={slaAssessment}
                onChange={(e) => setSlaAssessment(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hari</span>
            </div>
          </div>

          {/* Tahap 5: Offer */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Target Tahap: Offer</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={slaOffer}
                onChange={(e) => setSlaOffer(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hari</span>
            </div>
          </div>

          {/* Tahap 6: Medical Check-up */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Target Tahap: Medical</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={slaMedical}
                onChange={(e) => setSlaMedical(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hari</span>
            </div>
          </div>

        </div>

        {/* Info Aturan Bisnis Global Dashboard */}
        <div className="mx-6 mb-6 p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
          <Shield size={16} className="mt-0.5 text-amber-600 flex-shrink-0" />
          <p className="leading-relaxed">
            <strong>Catatan Kebijakan:</strong> Total akumulasi target SLA rekrutmen dari tahap awal melamar hingga pelamar berstatus <em>hired</em> dipatok mutlak maksimal <strong>28 hari</strong> pada sistem dasbor utama. Perubahan data di atas secara otomatis akan memengaruhi tolok ukur deteksi status pemisah pelanggaran waktu (*compliant / violation*) di semua tingkat manajemen user.
          </p>
        </div>

        {/* Footer Panel Aksi Tombol Simpan */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Save size={14} />
            <span>Simpan Perubahan SLA</span>
          </button>
        </div>

      </form>
    </div>
  );
}
