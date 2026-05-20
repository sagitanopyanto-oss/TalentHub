import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { Info, ShieldAlert, LogOut } from 'lucide-react';

// Import komponen-komponen utama dashboard
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';
import { HistoryTab } from './components/HistoryTab';
// Impor Dropdown Notifikasi Lonceng
import { NotificationDropdown } from './components/NotificationDropdown';

export function App() {
  const { currentAdmin, login, logout, candidates, jobs, interviews } = useRecruitment();
  const [activeTab, setActiveTab] = useState<string>('portal-links');
  
  // State form login lokal
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // State target SLA
  const [targetSla, setTargetSla] = useState({
    applied: 3,
    screening: 5,
    interview: 7,
    assessment: 5,
    offer: 3,
    medical: 5
  });

  const [activePopup, setActivePopup] = useState<string | null>(null);

  const loadSlaSettings = () => {
    const savedApplied = localStorage.getItem('sla_target_applied') || localStorage.getItem('sla_applied');
    const savedScreening = localStorage.getItem('sla_target_screening') || localStorage.getItem('sla_screening');
    const savedInterview = localStorage.getItem('sla_target_interview') || localStorage.getItem('sla_interview');
    const savedAssessment = localStorage.getItem('sla_target_assessment') || localStorage.getItem('sla_assessment');
    const savedOffer = localStorage.getItem('sla_target_offer') || localStorage.getItem('sla_offer');
    const savedMedical = localStorage.getItem('sla_target_medical') || localStorage.getItem('sla_medical');

    setTargetSla({
      applied: savedApplied ? parseInt(savedApplied) : 3,
      screening: savedScreening ? parseInt(savedScreening) : 5,
      interview: savedInterview ? parseInt(savedInterview) : 7,
      assessment: savedAssessment ? parseInt(savedAssessment) : 5,
      offer: savedOffer ? parseInt(savedOffer) : 3,
      medical: savedMedical ? parseInt(savedMedical) : 5
    });
  };

  useEffect(() => {
    if (currentAdmin) {
      loadSlaSettings();
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

  // 1. JIKA MEMBUKA PORTAL LOWONGAN ('portal-links'): Render halaman penuh tanpa Sidebar maupun Header menggantung
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
          
          {/* Konten Utama Link Lowongan Anda */}
          <div className="text-sm text-slate-500 py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="font-bold text-slate-700">Konten Tampilan Portal Utama Manajemen Link Lowongan</p>
            <p className="text-xs text-slate-400 mt-1">Daftar lowongan aktif eksternal akan dimuat di sini</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. JIKA MEMBUKA PANEL INTERNAL DAN BELUM LOGIN: Tampilkan Layar Login Terproteksi Penuh
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

  // 3. JIKA SUDAH LOGIN & BERADA DI DASHBOARD INTERNAL ADMIN
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      {/* Samping Kiri: Menu Navigasi Utama */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId)}
        currentRole={currentAdmin.role}
        currentUsername={currentAdmin.username}
      />

      {/* Samping Kanan: Konten Utama */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER TOPBAR KANAN ATAS */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 text-left">
          <div>
            <h1 className="text-base font-extrabold text-slate-800 capitalize tracking-tight">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sistem Manajemen Pengelolaan TalentHub HRIS</p>
          </div>

          <div className="flex items-center gap-4">
            {/* PANEL NOTIFIKASI LONCENG MELAYANG 🛎️ */}
            <NotificationDropdown />
            
            <div className="w-px h-5 bg-slate-200"></div>
            
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl capitalize">
                {currentAdmin.username} <span className="text-slate-400 font-normal mx-1">|</span> <span className="text-indigo-600 uppercase font-extrabold text-[9px] tracking-wider">{currentAdmin.role}</span>
              </span>
              
              <button 
                onClick={() => logout && logout()}
                title="Keluar dari Aplikasi"
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </header>

        {/* Isi Menu Halaman Konten Aktif */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {(() => {
            switch (activeTab) {
              case 'dashboard':
                return (
                  <div className="space-y-6">
                    {/* RESTORASI SINKRONISASI GRAFIK ASLI ANDA (Menggunakan state langsung) 📊 */}
                    <StatsCards candidates={candidates} jobs={jobs} interviews={interviews} />
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Selamat Datang Kembali, {currentAdmin.username}!</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Anda masuk sebagai <span className="font-bold uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 border border-indigo-100 rounded text-[10px]">{currentAdmin.role}</span>. Semua modul pelacakan status kandidat rekrutmen siap dikelola.
                      </p>
                    </div>
                  </div>
                );

              case 'candidates':
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Modul Manajemen Kandidat</h3>
                    <p className="text-xs text-slate-400 mb-4">Daftar pelamar yang masuk ke sistem TalentHub</p>
                    <div className="text-xs text-slate-500 italic">Konten Data Pelamar Kerja ({candidates?.length || 0} Kandidat Terdaftar)...</div>
                  </div>
                );

              case 'jobs':
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Modul Manajemen Lowongan</h3>
                    <p className="text-xs text-slate-400 mb-4">Daftar lowongan pekerjaan aktif internal perusahaan</p>
                    <div className="text-xs text-slate-500 italic">Konten Data Informasi Lowongan Pekerjaan ({jobs?.length || 0} Lowongan Aktif)...</div>
                  </div>
                );

              case 'interviews':
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Jadwal Wawancara</h3>
                    <p className="text-xs text-slate-400 mb-4">Kalender agenda interview bersama user dan tim HR</p>
                    <div className="text-xs text-slate-500 italic">Konten Agenda Wawancara ({interviews?.length || 0} Agenda Terjadwal)...</div>
                  </div>
                );

              case 'history':
                return <HistoryTab />;

              case 'admin-accounts':
              case 'settings':
                if (currentAdmin?.role === 'admin' || currentAdmin?.role === 'recruiter') {
                  return (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-16 max-w-2xl mx-auto space-y-4">
                      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
                        <ShieldAlert size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Akses Terkunci</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Maaf, akun Anda dengan tingkat akses <span className="font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{currentAdmin.role}</span> tidak diizinkan mengakses halaman ini.
                      </p>
                    </div>
                  );
                }
                return activeTab === 'admin-accounts' ? <AdminAccounts /> : <SettingsTab />;

              default: 
                return <div className="p-8 bg-white rounded-2xl text-slate-500 text-xs text-left">Halaman tidak ditemukan.</div>;
            }
          })()}
        </main>
      </div>
    </div>
  );
}
