import React, { useState, useEffect } from 'react';
import { Save, Clock, Shield, Sliders, Building, Bell } from 'lucide-react';

export function SettingsTab() {
  // --- STATE PENGATURAN SLA (6 TAHAP) ---
  const [slaApplied, setSlaApplied] = useState<number>(3);
  const [slaScreening, setSlaScreening] = useState<number>(5);
  const [slaInterview, setSlaInterview] = useState<number>(7);
  const [slaAssessment, setSlaAssessment] = useState<number>(5);
  const [slaOffer, setSlaOffer] = useState<number>(3);
  const [slaMedical, setSlaMedical] = useState<number>(5);

  // --- STATE PENGATURAN UMUM YANG KEMBALI DIHADIRKAN ---
  const [companyName, setCompanyName] = useState<string>('TalentHub HRIS Corp');
  const [notifyAdmin, setNotifyAdmin] = useState<boolean>(true);
  const [autoReject, setAutoReject] = useState<boolean>(false);

  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Ambil semua data yang tersimpan di localStorage saat komponen dibuka
  useEffect(() => {
    const savedApplied = localStorage.getItem('sla_target_applied') || localStorage.getItem('sla_applied');
    const savedScreening = localStorage.getItem('sla_target_screening') || localStorage.getItem('sla_screening');
    const savedInterview = localStorage.getItem('sla_target_interview') || localStorage.getItem('sla_interview');
    const savedAssessment = localStorage.getItem('sla_target_assessment') || localStorage.getItem('sla_assessment');
    const savedOffer = localStorage.getItem('sla_target_offer') || localStorage.getItem('sla_offer');
    const savedMedical = localStorage.getItem('sla_target_medical') || localStorage.getItem('sla_medical');
    
    const savedCompany = localStorage.getItem('setting_company_name');
    const savedNotify = localStorage.getItem('setting_notify_admin');
    const savedReject = localStorage.getItem('setting_auto_reject');

    if (savedApplied) setSlaApplied(parseInt(savedApplied, 10));
    if (savedScreening) setSlaScreening(parseInt(savedScreening, 10));
    if (savedInterview) setSlaInterview(parseInt(savedInterview, 10));
    if (savedAssessment) setSlaAssessment(parseInt(savedAssessment, 10));
    if (savedOffer) setSlaOffer(parseInt(savedOffer, 10));
    if (savedMedical) setSlaMedical(parseInt(savedMedical, 10));

    if (savedCompany) setCompanyName(savedCompany);
    if (savedNotify) setNotifyAdmin(savedNotify === 'true');
    if (savedReject) setAutoReject(savedReject === 'true');
  }, []);

  // Fungsi penyimpanan data form
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Simpan Data Batas SLA
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

      // 2. Simpan Data Pengaturan Sistem Lainnya
      localStorage.setItem('setting_company_name', companyName);
      localStorage.setItem('setting_notify_admin', notifyAdmin.toString());
      localStorage.setItem('setting_auto_reject', autoReject.toString());

      // Pemicu Event agar Dashboard utama langsung sinkron instan
      window.dispatchEvent(new Event('slaSettingsUpdated'));

      setSaveStatus({ type: 'success', message: 'Seluruh pengaturan sistem berhasil diperbarui!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Gagal menyimpan pengaturan.' });
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-12">
      
      {saveStatus && (
        <div className={`p-4 rounded-xl border text-sm font-medium shadow-sm transition-all ${
          saveStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {saveStatus.type === 'success' ? '✅' : '❌'} {saveStatus.message}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* PANEL 1: PENGATURAN UMUM SISTEM (YANG SEBELUMNYA HILANG) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Building size={18} className="text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Profil & Identitas Aplikasi</h3>
              <p className="text-xs text-slate-400 mt-0.5">Atur nama instansi dan fungsionalitas otomasi dasar sistem rekrutmen.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Perusahaan / Organisasi</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyAdmin}
                  onChange={(e) => setNotifyAdmin(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-700">Notifikasi Email Admin</span>
                  <span className="block text-[11px] text-slate-400 font-normal">Kirim notifikasi setiap ada pelamar baru masuk.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors">
                <input
                  type="checkbox"
                  checked={autoReject}
                  onChange={(e) => setAutoReject(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-700">Otomasi Berkas Kadaluwarsa</span>
                  <span className="block text-[11px] text-slate-400 font-normal">Tolak otomatis pelamar yang melewati batas SLA rekrutmen global.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* PANEL 2: PENGATURAN BATAS WAKTU SLA REKRUTMEN */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Konfigurasi Matriks SLA Per Tahap</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tentukan standar maksimal durasi pengerjaan (hari) untuk memicu sistem deteksi kepatuhan.</p>
            </div>
          </div>

          {/* PERBAIKAN: Padding pr-12 dipasang agar teks "Hari" tidak menutupi tombol panah atas/bawah */}
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
                  className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Hari</span>
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
                  className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Hari</span>
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
                  className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Hari</span>
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
                  className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Hari</span>
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
                  className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>

            {/* Tahap 6: Medical */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Target Tahap: Medical</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={slaMedical}
                  onChange={(e) => setSlaMedical(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  className="w-full pl-4 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>

          </div>

          <div className="mx-6 mb-6 p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <Shield size={16} className="mt-0.5 text-amber-600 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong>Catatan Kebijakan:</strong> Total akumulasi target SLA rekrutmen dari tahap awal melamar hingga pelamar berstatus <em>hired</em> dipatok mutlak maksimal <strong>28 hari</strong> pada sistem dasbor utama.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Save size={14} />
              <span>Simpan Semua Perubahan</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
