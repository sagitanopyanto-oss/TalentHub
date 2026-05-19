import { useState } from 'react';
import { useRecruitment } from './context/RecruitmentContext';

// Import seluruh komponen utama dashboard Anda
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';
// Catatan: Impor komponen lain seperti CandidateTable atau JobLists sesuai kebutuhan Anda

export default function DashboardLayout() {
  // Ambil state menu aktif dari Sidebar. 
  // Secara default diatur ke 'dashboard' agar halaman utama langsung terbuka saat pertama dimuat.
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Ambil data user yang sedang login dari context untuk pengaman ekstra
  const { currentAdmin } = useRecruitment();

  // FUNGSI UTAMA: Penentu komponen yang akan muncul di layar (Anti-Blank & Anti-Crash)
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Metrik KPI Utama di bagian atas beranda */}
            <StatsCards />
            
            {/* Anda bisa menyelipkan grafik tren atau tabel pelamar ringkas di bawah sini */}
            <div className="p-6 bg-white rounded-2xl border border-slate-150 shadow-sm text-left">
              <h3 className="font-bold text-slate-800 text-base">Selamat Datang Kembali, {currentAdmin?.username || 'User'}!</h3>
              <p className="text-xs text-slate-500 mt-1">Gunakan panel navigasi di sebelah kiri untuk mengelola operasional rekrutmen TalentHub.</p>
            </div>
          </div>
        );

      case 'candidates':
        // return <CandidateTable />; // Aktifkan jika berkas tabel kandidat sudah siap
        return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium">Halaman Manajemen Kandidat Pelamar</div>;

      case 'jobs':
        // return <JobLists />; // Aktifkan jika berkas daftar lowongan sudah siap
        return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium">Halaman Manajemen Lowongan Kerja (Loker)</div>;

      case 'interviews':
        return <div className="p-8 bg-white rounded-2xl text-left text-sm text-slate-500 font-medium">Halaman Jadwal Wawancara Kandidat & User</div>;

      case 'admin-accounts':
        // Mengarahkan ke halaman manajemen akun admin HRIS
        return <AdminAccounts />;

      // =========================================================================
      // PENGAMEN KUNCI: Menghubungkan ID Klik Sidebar ke Komponen SettingsTab
      // =========================================================================
      
      // 1. Jika menu sidebar mengirimkan ID 'settings' (Pengaturan Umum & Budget)
      case 'settings':
        return <SettingsTab />;

      // 2. Jika menu sidebar secara khusus mengirimkan ID 'sla-settings' (Menu SLA)
      case 'sla-settings':
        return <SettingsTab activeSubTab="sla-settings" />;

      // =========================================================================
      // SISTEM DEFENSE (ANTI-CRASH): Jika ID Tab tidak dikenali, JANGAN BIARKAN BLANK!
      // Alihkan paksa tampilan ke komponen StatsCards secara otomatis.
      // =========================================================================
      default:
        console.warn(`Sistem mendeteksi ID menu tidak dikenal: "${activeTab}". Dialihkan ke Dashboard Home.`);
        return <StatsCards />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen w-full overflow-x-hidden font-sans">
      {/* 1. Komponen Navigasi Kiri (Sidebar) */}
      <Sidebar activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} />

      {/* 2. Area Konten Utama Kontainer */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header Dinamis Dashboard */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
              {activeTab === 'sla-settings' ? 'Pengaturan Kepatuhan SLA' : activeTab}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Sistem Informasi Manajemen Bakat & Rekrutmen TalentHub v2.0</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
              Mode: {currentAdmin?.role || 'Admin'}
            </span>
          </div>
        </div>

        {/* Eksekusi fungsi render cerdas di sini */}
        {renderMainContent()}
      </main>
    </div>
  );
}
