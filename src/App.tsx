import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { PipelineChart } from './components/PipelineChart';
import { CandidateTable } from './components/CandidateTable';
import { JobListings } from './components/JobListings';
import { InterviewSchedule } from './components/InterviewSchedule';
import { ApplicationChart, DepartmentChart, CostHiringChart } from './components/ApplicationChart';
import { SLAInfo } from './components/SLAInfo';
import { ApplicationForm } from './components/ApplicationForm';
import { PortalLinkManager } from './components/PortalLinkManager';
import { ExportExcel } from './components/ExportExcel';
import { SettingsTab } from './components/SettingsTab';
import { Search, Bell, Menu, X, Lock, Key, AlertTriangle, Users } from 'lucide-react';
import { useRecruitment } from './context/RecruitmentContext';

const stageColors: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-700',
  'Screening': 'bg-yellow-100 text-yellow-700',
  'Interview': 'bg-purple-100 text-purple-700',
  'Assessment': 'bg-orange-100 text-orange-700',
  'Offer': 'bg-emerald-100 text-emerald-700',
  'Medical': 'bg-cyan-100 text-cyan-700',
  'Hired': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const stageLabels: Record<string, string> = {
  'Applied': 'Lamaran',
  'Screening': 'Screening',
  'Interview': 'Interview',
  'Assessment': 'Assessment',
  'Offer': 'Offering',
  'Medical': 'Medical',
  'Hired': 'Hired',
  'Rejected': 'Rejected',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function App() {
  const { 
    candidates, 
    isAdmin, 
    currentAdmin, 
    canCreateOrDelete, 
    canAccessSettings, 
    login, 
    setSelectedJobIdForApply, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useRecruitment();

  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedTab = sessionStorage.getItem('recruitflow_activeTab');
    if (savedTab && isAdmin) return savedTab;
    if (isAdmin) return 'dashboard';
    return 'apply';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('recruitflow_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!isAdmin) {
      if (activeTab !== 'apply') {
        setActiveTab('apply');
      }
    } else {
      if (activeTab === 'settings' && !canAccessSettings) {
        setActiveTab('dashboard');
      }
      if (activeTab === 'apply') {
        setActiveTab('dashboard');
      }
    }
  }, [isAdmin, canAccessSettings, activeTab]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginUsername, loginPassword);
    if (success) {
      setIsLoginModalOpen(false);
      setLoginUsername('');
      setLoginPassword('');
      setLoginError(false);
      setActiveTab('dashboard');
    } else {
      setLoginError(true);
    }
  };

  const handleSelectForApply = (id: number) => {
    setSelectedJobIdForApply(id);
    setActiveTab('apply');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 min-w-0">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-600"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-50">
            <Sidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4 ml-12 lg:ml-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {activeTab === 'dashboard' && 'Dashboard Rekrutmen'}
                  {activeTab === 'candidates' && 'Manajemen Kandidat'}
                  {activeTab === 'jobs' && 'Lowongan Pekerjaan'}
                  {activeTab === 'interviews' && 'Jadwal Wawancara'}
                  {activeTab === 'portal-links' && 'Manajemen Portal Karir'}
                  {activeTab === 'apply' && 'Portal Karir'}
                  {activeTab === 'settings' && 'Pengaturan'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {activeTab === 'dashboard' && 'Ringkasan performa rekrutmen — hanya tampilan baca tanpa fitur CRUD.'}
                  {activeTab === 'candidates' && 'Kelola, tambah, edit, dan hapus kandidat rekrutmen.'}
                  {activeTab === 'jobs' && 'Buat, edit, dan kelola lowongan pekerjaan.'}
                  {activeTab === 'interviews' && 'Atur, jadwalkan, dan pantau jadwal wawancara.'}
                  {activeTab === 'portal-links' && 'Buat, edit, hapus, dan atur info portal lamaran serta foto profil perusahaan.'}
                  {activeTab === 'apply' && 'Daftar lowongan aktif yang bisa dilamar beserta formulir pendaftaran dan upload CV.'}
                  {activeTab === 'settings' && 'Konfigurasi pengaturan sistem dan manajemen akun admin.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2.5">
                  <Search size={18} className="text-slate-400" />
                  <input type="text" placeholder="Cari..." className="bg-transparent text-sm text-slate-600 placeholder-slate-400 focus:outline-none w-48" />
                </div>
              )}
              {isAdmin && (
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <Bell size={18} className="text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">Notifikasi</h3>
                          {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} Baru
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => markAllNotificationsAsRead()}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            Tandai semua dibaca
                          </button>
                        )}
                      </div>
                      <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">
                            <Bell size={24} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Tidak ada notifikasi</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {notifications.map(notif => (
                              <div 
                                key={notif.id} 
                                className={`p-4 transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                                onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                              >
                                <div className="flex gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                                  <div>
                                    <p className={`text-sm ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                                      {notif.title}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{notif.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {isAdmin ? (
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shrink-0">
                  <div className="text-left">
                    <span className="text-xs font-bold text-indigo-700 uppercase block leading-none">{currentAdmin?.role || 'Admin'}</span>
                    {!canCreateOrDelete && <span className="text-[9px] text-indigo-500 block leading-none font-medium mt-0.5">Update & Review</span>}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setIsLoginModalOpen(true); setLoginError(false); }}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-500 px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-bold uppercase"
                >
                  <Lock size={12} /> Admin
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* DASHBOARD (read-only + SLA) */}
          {activeTab === 'dashboard' && isAdmin && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Ringkasan Dashboard</h3>
                  <p className="text-sm text-slate-500">Klik angka atau grafik untuk melihat detail data</p>
                </div>
                <ExportExcel />
              </div>
              <StatsCards />
              <SLAInfo />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ApplicationChart />
                <PipelineChart />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <DepartmentChart />
                <CostHiringChart />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full max-w-full">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Kandidat Terbaru</h3>
                    <p className="text-sm text-slate-500 mt-1">5 kandidat yang baru saja mendaftar</p>
                  </div>
                  <button onClick={() => setActiveTab('candidates')} className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors whitespace-nowrap self-start sm:self-auto">Kelola Kandidat →</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {candidates.length > 0 ? (
                    [...candidates].slice(-5).reverse().map((candidate) => (
                      <div key={candidate.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 ${candidate.stage === 'Hired' ? 'bg-gradient-to-br from-emerald-400 to-green-500' : candidate.stage === 'Rejected' ? 'bg-gradient-to-br from-red-400 to-rose-500' : candidate.stage === 'Medical' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'}`}>{candidate.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{candidate.name}</p>
                            <p className="text-xs text-slate-500 truncate">{candidate.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pl-13 sm:pl-0 border-t border-slate-50 sm:border-0 pt-2 sm:pt-0">
                          <span className="text-xs text-slate-400">{formatDate(candidate.appliedDate)}</span>
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${stageColors[candidate.stage]}`}>{stageLabels[candidate.stage]}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
                        <Users size={24} className="text-slate-300" />
                      </div>
                      <p className="text-slate-600 font-semibold mb-1">Belum ada kandidat yang mendaftar</p>
                      <p className="text-xs text-slate-400 max-w-xs">Data kandidat terbaru akan otomatis muncul di sini ketika ada pelamar yang mengirimkan lamaran dari Portal Karir.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* CRUD TABS */}
          {activeTab === 'candidates' && isAdmin && <CandidateTable />}
          {activeTab === 'jobs' && isAdmin && <JobListings onSelectForApply={handleSelectForApply} />}
          {activeTab === 'interviews' && isAdmin && <InterviewSchedule />}
          {activeTab === 'portal-links' && isAdmin && <PortalLinkManager />}

          {/* APPLY TAB (Public) */}
          {activeTab === 'apply' && <ApplicationForm />}

          {/* SETTINGS (Admin only) */}
          {activeTab === 'settings' && isAdmin && canAccessSettings && (
            <SettingsTab />
          )}
        </div>
      </main>

      {/* ========== LOGIN MODAL ========== */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-100">
            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={20} />
                <h3 className="text-lg font-bold">Masuk ke Dashboard</h3>
              </div>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">Masukkan kredensial admin Anda untuk melanjutkan.</p>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                  <Key size={14} className="text-slate-400" /> Username
                </label>
                <input
                  required
                  type="text"
                  placeholder="Username"
                  value={loginUsername}
                  onChange={e => { setLoginUsername(e.target.value); setLoginError(false); }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                  <Lock size={14} className="text-slate-400" /> Kata Sandi
                </label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => { setLoginPassword(e.target.value); setLoginError(false); }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>Username atau kata sandi tidak benar.</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsLoginModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm">Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
