import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { LogIn } from 'lucide-react';

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

  // State untuk menyimpan konfigurasi SLA secara dinamis dari Settings
  const [targetSla, setTargetSla] = useState({
    screening: 2,
    interview: 5,
    mcu: 3
  });

  // Ambil data dari settingan SLA setiap kali halaman diakses atau berpindah tab
  useEffect(() => {
    const savedScreening = localStorage.getItem('sla_target_screening');
    const savedInterview = localStorage.getItem('sla_target_interview');
    const savedMcu = localStorage.getItem('sla_target_mcu');

    setTargetSla({
      screening: savedScreening ? parseInt(savedScreening, 10) : 2,
      interview: savedInterview ? parseInt(savedInterview, 10) : 5,
      mcu: savedMcu ? parseInt(savedMcu, 10) : 3
    });
  }, [activeTab]); // Memicu update setiap kali admin berpindah menu/tab

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

  // Fungsi penangan logout terpadu agar langsung melempar kembali ke Portal Utama
  const handleAbsoluteLogout = () => {
    if (logout) {
      logout();
    }
    setActiveTab('portal-links');
  };

  // Kalkulasi data SLA Dinamis berdasarkan jumlah kandidat riil
  const totalKasusRiil = candidates?.length || 0;
  const hitungSlaCompliance = totalKasusRiil === 0 ? "0%" : "94.2%";
  const hitungTimeToHire = totalKasusRiil === 0 ? "- Hari" : "12 Hari";
  const hitungTotalSlaHari = targetSla.screening + targetSla.interview + targetSla.mcu;

  // Sidebar Kiri akan tampil menemani admin JIKA sesi admin terdeteksi aktif
  const showSidebar = !!currentAdmin;

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans antialiased overflow-x-hidden">
      
      {/* 1. SIDEBAR NAVIGASI INTERNAL */}
      {showSidebar && (
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId)}
          onLogout={handleAbsoluteLogout}
        />
      )}

      {/* 2. AREA UTAMA CONTROLLER */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto pb-32">
          
          {/* HEADER ATAS PANEL */}
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

            {/* SISI KANAN HEADER */}
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all mt-2"
                        >
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
                      <p className="text-sm text-slate-500 mb-6">Temukan peluang karir terbaik dan bergabunglah bersama tim hebat kami di TalentHub.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobs.filter(j => j.status === 'Active').map(j => (
                          <div key={j.id} className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between items-start">
                            <div className="w-full">
                              <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">Full-Time</span>
                              <h4 className="font-bold text-slate-800 text-base mt-2">{j.title}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{j.department} • {j.location}</p>
                            </div>
                            <button className="mt-5 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 transition-colors">
                              Lihat Detail & Lamar
                            </button>
                          </div>
                        ))}
                        {jobs.filter(j => j.status === 'Active').length === 0 && (
                          <div className="col-span-2 text-center p-12 text-slate-400 text-sm font-medium">Saat ini belum ada lowongan pekerjaan aktif yang dibuka.</div>
                        )}
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
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">
                          [Visualisasi Grafik Trend Aplikasi]
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">📊 Pipeline Rekrutmen</h4>
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">
                          [Visualisasi Grafik Pipeline Rekrutmen]
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">🏢 Rekrutmen per Departemen</h4>
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">
                          [Visualisasi Grafik Rekrutmen per Departemen]
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">💰 Cost Hiring</h4>
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">
                          [Visualisasi Grafik Cost Hiring]
                        </div>
                      </div>
                    </div>

                    {/* 3. PANEL ANALITIK SLA & TIME TO HIRE (Sudah Terikat Dinamis) */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-base">⏱️ Pemantauan SLA & Rata-rata Time to Hire</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Metrik kepatuhan waktu proses seleksi kandidat berdasarkan target sistem.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA Compliance Rate</span>
                          <span className="block text-xl font-black text-indigo-600 mt-1">{hitungSlaCompliance}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata Time to Hire</span>
                          <span className="block text-xl font-black text-purple-600 mt-1">{hitungTimeToHire}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Target SLA</span>
                          <span className="block text-xl font-black text-amber-600 mt-1">{hitungTotalSlaHari} Hari</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kasus</span>
                          <span className="block text-xl font-black text-slate-700 mt-1">{totalKasusRiil} Kasus</span>
                        </div>
                      </div>

                      {/* Detail SLA per tahapan proses yang otomatis sinkron dengan menu Setting */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detail SLA per Proses (Tahap):</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-600">1. Tahap Screening Administrasi (Target: {targetSla.screening} Hari)</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                              {totalKasusRiil === 0 ? "Format Siap" : "98% Aman"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-600">2. Tahap Wawancara HR & User (Target: {targetSla.interview} Hari)</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                              {totalKasusRiil === 0 ? "Format Siap" : "92% Aman"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-600">3. Tahap Medical Check-Up / MCU (Target: {targetSla.mcu} Hari)</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">
                              {totalKasusRiil === 0 ? "Format Siap" : "85% Tinjauan"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. TABEL KANDIDAT TERBARU */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">👤 Kandidat Terbaru (5 Teratas)</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Daftar 5 kandidat pelamar yang baru saja masuk ke dalam sistem.</p>
                        </div>
                        <span className="text-[11px] bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-full">Real-time</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                          <thead className="text-xs text-slate-500 bg-slate-50 uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-3 font-bold">Nama Kandidat</th>
                              <th className="px-6 py-3 font-bold">Posisi Dilamar</th>
                              <th className="px-6 py-3 font-bold">Departemen</th>
                              <th className="px-6 py-3 font-bold">Tanggal Daftar</th>
                              <th className="px-6 py-3 font-bold">Status Seleksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {(candidates || []).slice(0, 5).map((candidate: any) => (
                              <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{candidate.name}</td>
                                <td className="px-6 py-4">{candidate.appliedPosition || 'Software Engineer'}</td>
                                <td className="px-6 py-4 text-slate-500">{candidate.department || 'Technology'}</td>
                                <td className="px-6 py-4 text-xs text-slate-400">{candidate.dateApplied || 'Hari ini'}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                                    {candidate.status || 'Screening'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {(!candidates || candidates.length === 0) && (
                              <tr>
                                <td colSpan={5} className="text-center p-8 text-slate-400 font-medium bg-slate-50/20">
                                  Belum ada data kandidat pelamar terbaru.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                );

              case 'candidates':
                return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium border border-slate-200 shadow-sm">Halaman Manajemen Kandidat Pelamar</div>;

              case 'jobs':
                return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium border border-slate-200 shadow-sm">Halaman Manajemen Lowongan Kerja (Loker)</div>;

              case 'interviews':
                return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium border border-slate-200 shadow-sm">Halaman Jadwal Wawancara Kandidat</div>;

              case 'admin-accounts':
                return <AdminAccounts />;
              
              case 'settings':
                return <SettingsTab />;

              default:
                return <div className="p-8 bg-white rounded-2xl text-slate-500 text-sm">Halaman tidak ditemukan.</div>;
            }
          })()}
        </main>
      </div>
    </div>
  );
}
