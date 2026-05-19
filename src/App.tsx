import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';

// Import komponen-komponen utama dashboard
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';

export function App() {
  // State navigasi aktif, diatur default ke 'dashboard' halaman utama
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // State pengunci untuk mencegah auto-login otomatis mendeteksi setelah logout sengaja dilakukan
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  
  // Ambil state dan fungsi manipulasi dari context global
  const { currentAdmin, login, adminAccounts, candidates, jobs, interviews } = useRecruitment();

  // State pemicu internal untuk memastikan re-render komponen statistik saat data masuk
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // =========================================================================
  // EFFECT 1: AUTO-LOGIN SIMULATION DENGAN LOCK FLAG LOGOUT
  // =========================================================================
  useEffect(() => {
    if (!currentAdmin && !isLoggingOut) {
      if (adminAccounts && adminAccounts.length > 0) {
        // Ambil akun pertama dari mock data untuk mensimulasikan login admin
        const defaultAdmin = adminAccounts[0];
        login?.(defaultAdmin.username, defaultAdmin.password);
      }
    }
  }, [currentAdmin, adminAccounts, login, isLoggingOut]);

  // =========================================================================
  // EFFECT 2: MEMASTIKAN DATA DASHBOARD TER-RENDERING SEMPURNA
  // =========================================================================
  useEffect(() => {
    if (candidates?.length > 0 || jobs?.length > 0 || interviews?.length > 0) {
      setDataLoaded(true);
    }
  }, [candidates, jobs, interviews]);

  // FUNGSI NAVIGASI INTERN: Mengontrol komponen yang aktif di layar
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Kartu Ringkasan KPI Utama dengan key pengarah re-render */}
            <StatsCards key={dataLoaded ? 'loaded' : 'loading'} />
            
            {/* Banner Selamat Datang */}
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

  // Handler kustom penanganan proses logout aman tanpa loop gantung
  const handleSystemLogout = () => {
    setIsLoggingOut(true);
    setActiveTab('dashboard');
    // Berikan jeda waktu bagi state untuk membersihkan sebelum melepas sistem bypass
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 1200);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen w-full overflow-x-hidden font-sans">
      {/* 1. Komponen Navigasi Kiri (Sidebar) dengan operan callback trigger logout baru */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId)} 
        onCustomLogout={handleSystemLogout}
      />

      {/* 2. Area Konten Dinamis */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header Dashboard */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {activeTab === 'sla-settings' ? 'Konfigurasi Batas SLA' : activeTab === 'admin-accounts' ? 'Manajemen Akun HRIS' : activeTab}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Sistem Dashboard TalentHub v2.0 • Status Sistem Normal</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wider">
              Hak Akses: {currentAdmin?.role || 'Super Admin'}
            </span>
          </div>
        </div>

        {/* Output Render Komponen */}
        {renderMainContent()}
      </main>
    </div>
  );
}
