import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';

// Import komponen-komponen utama dashboard
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';

export function App() {
  const { currentAdmin, login, logout, adminAccounts, candidates, jobs, interviews } = useRecruitment();
  
  // State navigasi aktif internal dashboard admin
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // State form login lokal saat tidak ada sesi admin yang aktif
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // SINKRONISASI NAVIGASI: Jika admin login kembali, kembalikan tab ke dashboard utama
  useEffect(() => {
    if (currentAdmin) {
      setActiveTab('dashboard');
      setLoginError('');
    }
  }, [currentAdmin]);

  // Handler fungsi login dari form internal
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

  // =========================================================================
  // CONDITIONAL RENDERING 1: JIKA BELUM LOGIN / SUDAH LOGOUT -> TAMPILKAN FORM LOGIN
  // =========================================================================
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans text-left">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {/* Header Login Logo */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xl">T</div>
            <span className="font-black text-2xl tracking-wider text-slate-800">TalentHub</span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Masuk Panel Admin</h2>
            <p className="text-xs text-slate-500 mt-1">Sesi Anda telah berakhir atau belum terautentikasi.</p>
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

          {/* Info Akun Demo Pembantu */}
          {adminAccounts && adminAccounts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Gunakan akun terdaftar: <strong className="text-slate-600">{adminAccounts[0].username}</strong> (password: <strong className="text-slate-600">{adminAccounts[0].password}</strong>) untuk masuk cepat[cite: 113].
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CONDITIONAL RENDERING 2: JIKA SUDAH LOGIN -> TAMPILKAN LAYOUT FULL DASHBOARD ADMIN
  // =========================================================================
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Menggunakan kombinasi dinamis data agar statscards ter-render ulang dengan sempurna saat data masuk */}
            <StatsCards key={`stats-${candidates?.length || 0}-${jobs?.length || 0}-${interviews?.length || 0}`} />
            
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left">
              <h3 className="font-bold text-slate-800 text-base">
                Selamat Datang Kembali, {currentAdmin.username}!
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

      case 'portal-links':
        return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium border border-slate-100 shadow-sm">Halaman Informasi Tautan Portal Lowongan Publik</div>;

      case 'admin-accounts':
        return <AdminAccounts />;
      
      case 'settings':
        return <SettingsTab />;

      case 'sla-settings':
        return <SettingsTab activeSubTab="sla-settings" />;

      default:
        return (
          <div className="space-y-6">
            <StatsCards />
          </div>
        );
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen w-full overflow-x-hidden font-sans">
      {/* Sidebar Navigasi */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId)} 
      />

      {/* Area Konten Utama */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header Panel */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {activeTab === 'sla-settings' ? 'Konfigurasi Batas SLA' : activeTab === 'admin-accounts' ? 'Manajemen Akun HRIS' : activeTab}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Sistem Dashboard TalentHub v2.0 • Status Sistem Terautentikasi</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wider">
              Hak Akses: {currentAdmin.role}
            </span>
          </div>
        </div>

        {/* Output Render Komponen */}
        {renderMainContent()}
      </main>
    </div>
  );
}
