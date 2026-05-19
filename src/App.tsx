import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { LogIn } from 'lucide-react';

// Import komponen-komponen utama dashboard
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';

export function App() {
  const { currentAdmin, login, adminAccounts, candidates, jobs, interviews } = useRecruitment();
  
  // ALUR TERKOREKSI: Set default halaman awal saat masuk/logout ke 'portal-links' (Portal Lowongan Kerja Publik)
  const [activeTab, setActiveTab] = useState<string>('portal-links');
  
  // State form login lokal saat tidak ada sesi admin yang aktif
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // =========================================================================
  // FIX TOTAL DATA 0: Memastikan render ulang data dashboard sempurna saat login
  // =========================================================================
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // SINKRONISASI NAVIGASI & DATA: Jika terdeteksi admin baru saja sukses login, alihkan otomatis ke dashboard
  useEffect(() => {
    if (currentAdmin) {
      setActiveTab('dashboard');
      setLoginError('');
      // Trigger dataLoaded menjadi true untuk memaksa komponen StatsCards menghitung ulang angka
      setDataLoaded(true);
    } else {
      setDataLoaded(false); // Reset state saat logout
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

  // Cek apakah halaman saat ini merupakan mode Publik (Tamu)
  const isPublicPage = activeTab === 'portal-links' || activeTab === 'login';

  return (
    <div className="flex bg-slate-50 min-h-screen w-full overflow-x-hidden font-sans">
      
      {/* 1. SIDEBAR KIRI: Hanya ditampilkan JIKA admin sudah login DAN tidak sedang membuka halaman publik */}
      {!isPublicPage && currentAdmin && (
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId)} 
        />
      )}

      {/* 2. AREA KONTEN UTAMA */}
      <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full transition-all duration-300 ${isPublicPage ? 'max-w-6xl mx-auto' : 'max-w-7xl mx-auto'}`}>
        
        {/* HEADER ATAS PANEL */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 text-left">
          <div>
            <div className="flex items-center gap-2">
              {isPublicPage && (
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-sm mr-1">T</div>
              )}
              <h1 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
                {activeTab === 'portal-links' ? 'Portal Lowongan Kerja' : activeTab === 'login' ? 'Otentikasi Admin' : activeTab}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPublicPage ? 'TalentHub Portal Karir Publik' : 'Sistem Dashboard Internal HRIS'}
            </p>
          </div>

          {/* SISI KANAN HEADER: Navigasi Login / Logout Dinamis */}
          <div className="flex items-center gap-3">
            {isPublicPage ? (
              activeTab === 'portal-links' ? (
                // JIKA BELUM LOGIN: Tampilkan tombol Login ber-Ikon di Kanan Atas
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
              // JIKA SUDAH LOGIN: Hanya menampilkan badge Hak Akses Role Admin (Bersih & Elegan)
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wider">
                  Akses: {currentAdmin?.role || 'Admin'}
                </span>
                {/* FIX: Fitur logout/keluar duplikat di bagian kanan atas telah dihapus sepenuhnya */}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
           MECHANISM ROUTING RENDER KONTEN
           ========================================================================= */}
        {(() => {
          switch (activeTab) {
            case 'login':
              return (
                <div className="min-h-[60vh] flex items-center justify-center py-6 px-4 font-sans text-left">
                  <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-slate-800">Masuk Panel Admin</h2>
                      {/* FIX: Kalimat instruksi HRIS lama telah dihapus bersih di sini */}
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
                    {/* FIX: Teks Info Akun Demo Pembantu lama telah dihapus total */}
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
                <div className="space-y-6">
                  {/* FIX DATA 0: Menggunakan kombinasi dinamis data agar statscards ter-render ulang dengan sempurna saat data masuk */}
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
  );
}
