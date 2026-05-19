import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';

// Import komponen-komponen utama dashboard
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';

export function App() {
  const { currentAdmin, login, adminAccounts, candidates, jobs, interviews } = useRecruitment();
  
  // ALUR TERKOREKSI: Set default halaman awal saat masuk/logout ke 'portal-links' (Info Portal Publik)
  const [activeTab, setActiveTab] = useState<string>('portal-links');
  
  // State form login lokal
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // SINKRONISASI OTOMATIS: Jika terdeteksi admin baru saja sukses login, alihkan otomatis ke dashboard
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

  // FUNGSI NAVIGASI INTERN: Mengontrol komponen yang aktif di layar
  const renderMainContent = () => {
    switch (activeTab) {
      // -------------------------------------------------------------------
      // TAB LOGIN: Ditampilkan menggantikan dashboard jika admin belum login
      // -------------------------------------------------------------------
      case 'login':
        return (
          <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 font-sans text-left">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Masuk Panel Admin</h2>
                <p className="text-xs text-slate-500 mt-1">Otentikasi diperlukan untuk mengakses data rekrutmen internal.</p>
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

              {adminAccounts && adminAccounts.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
                  Gunakan akun demo: <strong className="text-slate-600">{adminAccounts[0].username}</strong> (password: <strong className="text-slate-600">{adminAccounts[0].password}</strong>)[cite: 113].
                </div>
              )}
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <StatsCards key={`stats-${candidates?.length || 0}-${jobs?.length || 0}-${interviews?.length || 0}`} />
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
              <h3 className="font-bold text-slate-800 text-base">
                Selamat Datang Kembali, {currentAdmin?.username || 'Super Admin'}!
              </h3>
              <p className="text-xs text-slate-500 mt-1">Gunakan panel navigasi di sebelah kiri untuk mengelola operasional rekrutmen TalentHub.</p>
            </div>
          </div>
        );

      case 'candidates':
        return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium border border-slate-100 shadow-sm">Halaman Manajemen Kandidat Pelamar</div>;

      case 'jobs':
        return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium border border-slate-100 shadow-sm">Halaman Manajemen Lowongan Kerja (Loker)</div>;

      case 'interviews':
        return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium border border-slate-100 shadow-sm">Halaman Jadwal Wawancara Kandidat</div>;

      // Halaman Portal Publik yang bisa diakses siapa saja
      case 'portal-links':
        return (
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-2xl text-left border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg mb-2">🚀 Info Portal Lowongan Kerja Publik</h3>
              <p className="text-sm text-slate-500 mb-6">Berikut adalah daftar lowongan kerja aktif di TalentHub yang dapat dilamar secara publik oleh calon pelamar.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.filter(j => j.status === 'Active').map(j => (
                  <div key={j.id} className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">Aktif</span>
                    <h4 className="font-bold text-slate-800 text-base mt-2">{j.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{j.department} • {j.location}</p>
                    <button className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 transition-colors">
                      Lihat Detail & Lamar
                    </button>
                  </div>
                ))}
                {jobs.filter(j => j.status === 'Active').length === 0 && (
                  <div className="col-span-2 text-center p-6 text-slate-400 text-sm font-medium">Belum ada lowongan kerja aktif yang dibuka saat ini.</div>
                )}
              </div>
            </div>
          </div>
        );

      case 'admin-accounts':
        return <AdminAccounts />;
      
      case 'settings':
        return <SettingsTab />;

      default:
        return <div className="p-8 bg-white rounded-2xl text-slate-500 text-sm">Halaman tidak ditemukan.</div>;
    }
  };

  // Handler kustom penanganan pembersihan tab saat logout ditekan sengaja
  const handleSystemLogoutTrigger = () => {
    setActiveTab('portal-links'); // Paksa navigasi kembali ke Portal Lowongan Kerja Publik
  };

  return (
    <div className="flex bg-slate-50 min-h-screen w-full overflow-x-hidden font-sans">
      {/* 1. Sidebar Navigasi Dinamis */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId)} 
        onLogoutSuccess={handleSystemLogoutTrigger}
      />

      {/* 2. Area Konten Utama */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header Atas Panel */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {activeTab === 'portal-links' ? 'Portal Lowongan Kerja' : activeTab === 'login' ? 'Otentikasi Admin' : activeTab}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Sistem Portal Karir TalentHub v2.0</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wider">
              Status: {currentAdmin ? `HRIS (${currentAdmin.role})` : 'Akses Publik'}
            </span>
          </div>
        </div>

        {/* Output Render Komponen */}
        {renderMainContent()}
      </main>
    </div>
  );
}
