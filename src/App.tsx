/* Masukkan baris import ini di bagian atas file src/App.tsx Anda */
import { HistoryTab } from './components/HistoryTab';

// ... (kode App komponen di atasnya tetap sama)

{(() => {
  switch (activeTab) {
    case 'login':
      return ( /* ... view login ... */ );
    case 'portal-links':
      return ( /* ... view portal ... */ );
    case 'dashboard':
      return ( /* ... view dashboard ... */ );
    case 'candidates': 
      return <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">Halaman Manajemen Kandidat Pelamar</div>;
    case 'jobs': 
      return <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">Halaman Manajemen Lowongan Kerja (Loker)</div>;
    case 'interviews': 
      return <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs">Halaman Jadwal Wawancara Kandidat</div>;

    /* SEGMEN ROUTE BARU: Bisa diakses bebas oleh semua role admin */
    case 'history':
      return <HistoryTab />;

    // Proteksi Lapis Kedua (Routing Block Bypass) tetap mengamankan halaman manajemen & setting admin
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
      return <div className="p-8 bg-white rounded-2xl text-slate-500 text-xs">Halaman tidak ditemukan.</div>;
  }
})()}
