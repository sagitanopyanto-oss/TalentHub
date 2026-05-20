import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { Info, ShieldAlert, LogOut, Settings as SettingsIcon } from 'lucide-react';

// Import komponen-komponen utama dashboard
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';
import { HistoryTab } from './components/HistoryTab';
import { ApplicationChart } from './components/ApplicationChart';
import { NotificationDropdown } from './components/NotificationDropdown';

export function App() {
  const { currentAdmin, login, logout, candidates = [], jobs = [], interviews = [] } = useRecruitment();
  const [activeTab, setActiveTab] = useState<string>('portal-links');
  
  // State form login lokal
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // State Pengaturan Tambahan: Target SLA & Cost Hiring
  const [targetSla, setTargetSla] = useState({
    applied: 3,
    screening: 5,
    interview: 7,
    assessment: 5,
    offer: 3,
    medical: 5
  });
  
  const [globalCostHiring, setGlobalCostHiring] = useState<number>(15000000); // Batas default budget iklan

  const loadSettings = () => {
    const savedApplied = localStorage.getItem('sla_target_applied') || '3';
    const savedScreening = localStorage.getItem('sla_target_screening') || '5';
    const savedInterview = localStorage.getItem('sla_target_interview') || '7';
    const savedAssessment = localStorage.getItem('sla_target_assessment') || '5';
    const savedOffer = localStorage.getItem('sla_target_offer') || '3';
    const savedMedical = localStorage.getItem('sla_target_medical') || '5';
    const savedCost = localStorage.getItem('setting_cost_hiring') || '15000000';

    setTargetSla({
      applied: parseInt(savedApplied),
      screening: parseInt(savedScreening),
      interview: parseInt(savedInterview),
      assessment: parseInt(savedAssessment),
      offer: parseInt(savedOffer),
      medical: parseInt(savedMedical)
    });
    setGlobalCostHiring(parseInt(savedCost));
  };

  useEffect(() => {
    if (currentAdmin) {
      loadSettings();
    }
  }, [currentAdmin]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login) {
      const success = login(usernameInput, passwordInput);
      if (!success) {
        setLoginError('Username atau password salah.');
      } else {
        setLoginError('');
        setUsernameInput('');
        setPasswordInput('');
        setActiveTab('dashboard');
      }
    }
  };

  // 1. TAMPILAN PORTAL LINK LOWONGAN (Clean Fullscreen)
  if (activeTab === 'portal-links') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 font-sans text-left flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-4xl bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">Portal Lowongan Kerja</h3>
              <p className="text-xs text-slate-400 mt-0.5">Halaman utama informasi karir dan link eksternal TalentHub</p>
            </div>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Login Workspace Admin
            </button>
          </div>
          
          <div className="text-sm text-slate-500 py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="font-bold text-slate-700">Konten Tampilan Portal Utama Manajemen Link Lowongan</p>
            <p className="text-xs text-slate-400 mt-1">Daftar lowongan aktif eksternal akan dimuat di sini</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. TAMPILAN LOGIN FORM
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-left">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-lg shadow-indigo-600/20">T</div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight mt-3">Selamat Datang di TalentHub</h2>
            <p className="text-xs text-slate-400 font-medium">Masukkan kredensial akun internal Anda untuk masuk</p>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
              <input required type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none font-medium text-slate-700" placeholder="Masukkan username" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <input required type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none font-medium text-slate-700" placeholder="••••••••" />
            </div>
            {loginError && <p className="text-[11px] text-red-500 font-bold bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{loginError}</p>}
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer">Masuk Sistem</button>
          </form>
          <div className="text-center pt-2">
            <button onClick={() => setActiveTab('portal-links')} className="text-xs text-slate-400 hover:text-indigo-600 font-bold cursor-pointer transition-colors">← Kembali ke Portal Lowongan</button>
          </div>
        </div>
      </div>
    );
  }

  // 3. AREA WORKSPACE UTAMA UTUH
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId)}
        currentRole={currentAdmin.role}
        currentUsername={currentAdmin.username}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER TOPBAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 text-left">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 capitalize tracking-tight">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sistem Manajemen Pengelolaan TalentHub HRIS</p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="w-px h-5 bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl capitalize">
                {currentAdmin.username} <span className="text-slate-400 font-normal mx-1">|</span> <span className="text-indigo-600 uppercase font-extrabold text-[9px] tracking-wider">{currentAdmin.role}</span>
              </span>
              <button onClick={() => logout && logout()} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition-colors cursor-pointer">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </header>

        {/* MAIN ROUTER VIEW CONTROLLER */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {(() => {
            switch (activeTab) {
              case 'dashboard':
                return (
                  <div className="space-y-6">
                    {/* WIDGET KARTU UTAMA */}
                    <StatsCards />

                    {/* WIDGET GRAFIK UTAMA */}
                    <ApplicationChart />

                    {/* 📊 PANEL PIPELINE REKRUTMEN & REKRUTMEN PER DEPARTEMEN */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                      {/* PIPELINE REKRUTMEN */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pipeline Rekrutmen</h3>
                        <h4 className="text-sm font-black text-slate-800 mb-4">Distribusi Pelamar per Tahapan Aktif</h4>
                        <div className="space-y-3">
                          {['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired'].map((stage) => {
                            const count = candidates.filter(c => c.stage === stage).length;
                            const percentage = candidates.length > 0 ? (count / candidates.length) * 100 : 0;
                            return (
                              <div key={stage} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-slate-600">{stage}</span>
                                  <span className="text-slate-800">{count} Pelamar ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* REKRUTMEN PER DEPARTEMEN */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Struktur Kebutuhan</h3>
                        <h4 className="text-sm font-black text-slate-800 mb-4">Lowongan per Departemen</h4>
                        <div className="divide-y divide-slate-100">
                          {Array.from(new Set(jobs.map(j => j.department || 'Umum'))).map(dept => {
                            const deptJobs = jobs.filter(j => j.department === dept).length;
                            return (
                              <div key={dept} className="py-2.5 flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-600">{dept}</span>
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 font-bold rounded-lg border border-slate-200">{deptJobs} Posisi</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 👥 LIST KANDIDAT TERBARU MASUK */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pembaruan Database</h3>
                      <h4 className="text-sm font-black text-slate-800 mb-4">Daftar Kandidat Terbaru</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                              <th className="p-3">Nama Kandidat</th>
                              <th className="p-3">Posisi</th>
                              <th className="p-3">Tanggal Apply</th>
                              <th className="p-3">Tahap</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {candidates.slice(-5).reverse().map((c, i) => (
                              <tr key={i} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-800">{c.name}</td>
                                <td className="p-3 font-semibold text-slate-500">{c.position}</td>
                                <td className="p-3 text-slate-400">{c.appliedDate || '-'}</td>
                                <td className="p-3"><span className="px-2 py-0.5 rounded-md font-bold bg-indigo-50 text-indigo-600 text-[10px] uppercase">{c.stage}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );

              case 'candidates':
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Modul Manajemen Kandidat</h3>
                    <p className="text-xs text-slate-400">Daftar berkas pelamar kerja TalentHub</p>
                  </div>
                );

              case 'jobs':
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Modul Manajemen Lowongan</h3>
                    <p className="text-xs text-slate-400">Daftar kuota lowongan aktif internal</p>
                  </div>
                );

              case 'interviews':
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Jadwal Wawancara</h3>
                    <p className="text-xs text-slate-400">Agenda interview HRIS</p>
                  </div>
                );

              case 'history':
                return <HistoryTab />;

              case 'admin-accounts':
                return <AdminAccounts />;

              case 'settings':
                if (currentAdmin?.role === 'admin' || currentAdmin?.role === 'recruiter') {
                  return (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-16 max-w-2xl mx-auto space-y-4">
                      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100"><ShieldAlert size={32} /></div>
                      <h3 className="text-lg font-bold text-slate-800">Akses Terkunci</h3>
                      <p className="text-xs text-slate-500">Akun {currentAdmin.role} tidak diizinkan masuk menu pengaturan.</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-6 text-left">
                    <SettingsTab />
                    
                    {/* ⚙️ PENGATURAN COST HIRING YANG HILANG DIKEMBALIKAN */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl">
                      <div className="flex items-center gap-2 mb-4">
                        <SettingsIcon size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black text-slate-800">Setting Cost Hiring (Finansial Iklan)</h3>
                      </div>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Batas Anggaran Maksimal Rekrutmen (Rp)</label>
                          <input 
                            type="number" 
                            value={globalCostHiring} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setGlobalCostHiring(val);
                              localStorage.setItem('setting_cost_hiring', val.toString());
                            }}
                            className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none font-semibold text-slate-700"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">Nilai anggaran ini akan menjadi garis pembatas putus-putus merah/biru pada grafik analisis finansial di halaman dashboard utama.</p>
                      </div>
                    </div>
                  </div>
                );

              default: 
                return <div className="p-8 bg-white rounded-2xl text-slate-500 text-xs">Halaman tidak ditemukan.</div>;
            }
          })()}
        </main>
      </div>
    </div>
  );
}
