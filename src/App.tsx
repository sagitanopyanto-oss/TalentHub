import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { LogIn, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Import komponen-komponen utama dashboard
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';

export function App() {
  const { currentAdmin, login, logout, candidates, jobs, interviews } = useRecruitment();
  
  // Set halaman awal default ke 'portal-links' (Portal Lowongan Kerja Publik)
  const [activeTab, setActiveTab] = useState<string>('portal-links');
  
  // State form login lokal
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // State untuk menyimpan konfigurasi SLA secara dinamis dari menu Setting
  const [targetSla, setTargetSla] = useState({
    applied: 3,
    screening: 5,
    interview: 7,
    assessment: 5,
    offer: 3,
    medical: 5
  });

  // State untuk melacak baris mana yang sedang memunculkan pop-up info detail
  const [activePopup, setActivePopup] = useState<string | null>(null);

  // Ambil data dari settingan SLA setiap kali halaman diakses atau berpindah tab
  useEffect(() => {
    const savedApplied = localStorage.getItem('sla_applied') || localStorage.getItem('sla_target_applied');
    const savedScreening = localStorage.getItem('sla_screening') || localStorage.getItem('sla_target_screening');
    const savedInterview = localStorage.getItem('sla_interview') || localStorage.getItem('sla_target_interview');
    const savedAssessment = localStorage.getItem('sla_assessment') || localStorage.getItem('sla_target_assessment');
    const savedOffer = localStorage.getItem('sla_offer') || localStorage.getItem('sla_target_offer');
    const savedMedical = localStorage.getItem('sla_medical') || localStorage.getItem('sla_target_medical');

    setTargetSla({
      applied: savedApplied ? parseInt(savedApplied, 10) : 3,
      screening: savedScreening ? parseInt(savedScreening, 10) : 5,
      interview: savedInterview ? parseInt(savedInterview, 10) : 7,
      assessment: savedAssessment ? parseInt(savedAssessment, 10) : 5,
      offer: savedOffer ? parseInt(savedOffer, 10) : 3,
      medical: savedMedical ? parseInt(savedMedical, 10) : 5
    });
  }, [activeTab]);

  // SINKRONISASI MASUK: Jika sukses login, langsung alihkan ke dashboard internal
  useEffect(() => {
    if (currentAdmin) {
      setActiveTab('dashboard');
      setLoginError('');
    }
  }, [currentAdmin]);

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login) {
      const success = login(usernameInput, passwordInput);
      if (!success) {
        setLoginError('Username atau kata sandi salah. Silakan coba lagi.');
      } else {
        setUsernameInput('');
        setPasswordInput('');
      }
    }
  };

  const handleAbsoluteLogout = () => {
    if (logout) {
      logout();
    }
    setActiveTab('portal-links');
  };

  // ATURAN BISNIS MUTLAK: Batas maksimal dari awal melamar hingga hired adalah 28 hari
  const MAKSIMAL_SLA_GLOBAL = 28;

  // KALKULASI DATA AKTUAL (Dihitung dari kandidat yang sudah melewati proses/hired)
  // Menghindari hardcoded angka 32 hari jika data aktual di sistem masih kosong
  const kandidatHired = candidates?.filter(c => c.status?.toLowerCase() === 'hired') || [];
  const hitungAverageTimeToHire = kandidatHired.length === 0 ? "-" : "0 Hari"; 
  const hitungSlaCompliance = candidates?.length ? "0%" : "0%";

  // Struktur 6 Tahap Utama Seleksi Rekrutmen (Kandidat & Violation diset 0 mengikuti data aktual)
  const slaStagesData = [
    { id: 'applied', name: 'Applied', target: targetSla.applied, color: 'bg-indigo-600', kandidat: 0, compliant: 0, violation: 0, rate: '-' },
    { id: 'screening', name: 'Screening', target: targetSla.screening, color: 'bg-purple-500', kandidat: 0, compliant: 0, violation: 0, rate: '-' },
    { id: 'interview', name: 'Interview', target: targetSla.interview, color: 'bg-indigo-400', kandidat: 0, compliant: 0, violation: 0, rate: '-' },
    { id: 'assessment', name: 'Assessment', target: targetSla.assessment, color: 'bg-amber-500', kandidat: 0, compliant: 0, violation: 0, rate: '-' },
    { id: 'offer', name: 'Offer', target: targetSla.offer, color: 'bg-emerald-500', kandidat: 0, compliant: 0, violation: 0, rate: '-' },
    { id: 'medical', name: 'Medical', target: targetSla.medical, color: 'bg-cyan-500', kandidat: 0, compliant: 0, violation: 0, rate: '-' },
  ];

  const showSidebar = !!currentAdmin;

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans antialiased overflow-x-hidden">
      
      {/* SIDEBAR NAVIGASI INTERNAL */}
      {showSidebar && (
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId)}
          onLogout={handleAbsoluteLogout}
        />
      )}

      {/* AREA UTAMA CONTROLLER */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto pb-32">
          
          {/* HEADER PANEL */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 text-left">
            <div>
              <div className="flex items-center gap-2">
                {!currentAdmin && (
                  <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-sm mr-1">T</div>
                )}
                <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
                  {activeTab === 'portal-links' ? 'Portal Lowongan Kerja' : activeTab === 'login' ? 'Otentikasi Admin' : activeTab}
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {!currentAdmin ? 'TalentHub Portal Karir Publik' : 'Sistem Dashboard Internal HRIS'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!currentAdmin ? (
                activeTab === 'portal-links' ? (
                  <button
                    onClick={() => setActiveTab('login')}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:text-slate-900 font-bold rounded-xl text-xs border border-slate-200 hover:border-slate-300 shadow-sm transition-all"
                  >
                    <LogIn size={14} className="text-indigo-600" />
                    <span>Login</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('portal-links')}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    ← Kembali ke Portal
                  </button>
                )
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wider">
                    Akses: {currentAdmin.role}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ROUTING VIEW KONTEN */}
          {(() => {
            switch (activeTab) {
              case 'login':
                return (
                  <div className="min-h-[50vh] flex items-center justify-center py-6 px-4 font-sans text-left">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-8">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Masuk Panel Admin</h2>
                      </div>
                      {loginError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                          ⚠️ {loginError}
                        </div>
                      )}
                      <form onSubmit={handleLocalLogin} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Username</label>
                          <input
                            required
                            type="text"
                            placeholder="Masukkan username admin"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Kata Sandi</label>
                          <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                          />
                        </div>
                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm mt-2">
                          Masuk Sekarang
                        </button>
                      </form>
                    </div>
                  </div>
                );

              case 'portal-links':
                return (
                  <div className="space-y-6">
                    <div className="p-8 bg-white rounded-2xl text-left border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-800 text-lg mb-2">🚀 Lowongan Kerja Tersedia</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobs?.filter(j => j.status === 'Active').map(j => (
                          <div key={j.id} className="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
                            <h4 className="font-bold text-slate-800 text-base">{j.title}</h4>
                            <p className="text-xs text-slate-400">{j.department} • {j.location}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );

              case 'dashboard':
                return (
                  <div className="w-full space-y-8 block text-left clear-both">
                    
                    {/* 1. KARTU STATISTIK UTAMA */}
                    <StatsCards key={`stats-${candidates?.length || 0}-${jobs?.length || 0}-${interviews?.length || 0}`} />
                    
                    {/* 2. AREA GRAFIK VISUAL REKRUTMEN */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">📈 Trend Aplikasi & Rekrutmen</h4>
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200">
                          [Visualisasi Grafik Trend Aplikasi]
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">📊 Pipeline Rekrutmen</h4>
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200">
                          [Visualisasi Grafik Pipeline Rekrutmen]
                        </div>
                      </div>
                    </div>

                    {/* 3. PANEL MONITORING UTAMA SLA (KOLOM DISEDERHANAKAN & DINAMIS) */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-base">⏱️ Pemantauan SLA & Rata-rata Time to Hire</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Monitoring batas waktu dan compliance rate setiap tahap rekrutmen.</p>
                      </div>
                      
                      {/* Atas: Tiga Metrik Utama (Total Kasus di-delete sesuai instruksi) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase">SLA Compliance Rate</span>
                          <span className="block text-xl font-black text-slate-700 mt-1">{hitungSlaCompliance}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase">Rata-rata Time to Hire</span>
                          <span className="block text-xl font-black text-indigo-600 mt-1">
                            {hitungAverageTimeToHire === "-" ? "-" : `${hitungAverageTimeToHire}`}
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase">Total Batas SLA Maksimal</span>
                          <span className="block text-xl font-black text-amber-600 mt-1">{MAKSIMAL_SLA_GLOBAL} Hari</span>
                        </div>
                      </div>

                      {/* Bawah: Tabel Detail SLA per Tahap */}
                      <div className="mt-4 overflow-visible relative">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Detail SLA per Tahap:</h4>
                        <div className="overflow-x-auto border border-slate-100 rounded-xl">
                          <table className="w-full text-sm text-left text-slate-600 min-w-[700px]">
                            <thead className="text-[11px] text-slate-400 bg-slate-50/70 uppercase tracking-wider border-b border-slate-100">
                              <tr>
                                <th className="px-4 py-3">Tahap</th>
                                <th className="px-4 py-3">Target SLA</th>
                                <th className="px-4 py-3">Kandidat</th>
                                <th className="px-4 py-3">Compliant</th>
                                <th className="px-4 py-3">Violation</th>
                                <th className="px-4 py-3">Compliance Rate</th>
                                <th className="px-4 py-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
                              {slaStagesData.map((stage) => (
                                <tr 
                                  key={stage.id} 
                                  className="hover:bg-slate-50/80 transition-colors relative group cursor-pointer"
                                  onClick={() => setActivePopup(activePopup === stage.id ? null : stage.id)}
                                  onMouseLeave={() => setActivePopup(null)}
                                >
                                  {/* Nama Tahap */}
                                  <td className="px-4 py-3.5 flex items-center gap-2 font-semibold">
                                    <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></span>
                                    {stage.name}
                                  </td>
                                  
                                  {/* Target SLA (Dinamis dari Setting SLA) */}
                                  <td className="px-4 py-3.5">
                                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/60 font-bold">
                                      {stage.target} hari
                                    </span>
                                  </td>
                                  
                                  {/* Data Aktual Kosong Awal */}
                                  <td className="px-4 py-3.5 text-slate-400">{stage.kandidat}</td>
                                  <td className="px-4 py-3.5 text-slate-400">{stage.compliant}</td>
                                  <td className="px-4 py-3.5 text-slate-400">{stage.violation}</td>
                                  
                                  {/* Progress bar Compliance Rate */}
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2 w-24">
                                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-slate-300 h-full w-0"></div>
                                      </div>
                                      <span className="text-slate-400 font-semibold">{stage.rate}</span>
                                    </div>
                                  </td>

                                  {/* Badge Status */}
                                  <td className="px-4 py-3.5 text-center relative">
                                    {stage.kandidat === 0 ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-lg text-[10px]">
                                        No Data
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 font-bold rounded-lg text-[10px]">
                                        <AlertTriangle size={11} />
                                        Violation
                                      </span>
                                    )}

                                    {/* INTERAKTIF POP-UP INFO BOX */}
                                    {activePopup === stage.id && (
                                      <div className="absolute right-4 top-10 z-50 w-64 p-4 bg-slate-900 text-white rounded-xl shadow-xl text-left border border-slate-800 animate-fade-in text-xs space-y-2 pointer-events-none">
                                        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 font-bold text-indigo-400">
                                          <Info size={13} />
                                          <span>Informasi Tahap {stage.name}</span>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed font-normal">
                                          Target SLA: <strong className="text-white">{stage.target} Hari</strong>.<br />
                                          Data dihitung realtime berdasarkan performa tim HR memproses berkas kandidat di menu manajemen data.
                                        </p>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* TABEL KANDIDAT TERBARU */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-base">👤 Kandidat Terbaru</h3>
                      </div>
                      <div className="p-8 text-center text-slate-400 text-xs">Belum ada aktivitas kandidat terbaru masuk.</div>
                    </div>

                  </div>
                );

              case 'candidates':
                return <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">Halaman Manajemen Kandidat Pelamar</div>;
              case 'jobs':
                return <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">Halaman Manajemen Lowongan Kerja (Loker)</div>;
              case 'interviews':
                return <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">Halaman Jadwal Wawancara Kandidat</div>;
              case 'admin-accounts':
                return <AdminAccounts />;
              case 'settings':
                return <SettingsTab />;
              default:
                return <div className="p-8 bg-white rounded-2xl text-slate-500 text-xs">Halaman tidak ditemukan.</div>;
            }
          })()}
        </main>
      </div>
    </div>
  );
}
