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
import { PipelineChart } from './components/PipelineChart'; // <--- KOMPONEN TABEL BARU

export function App() {
  const { currentAdmin, login, logout, candidates = [], jobs = [], interviews = [] } = useRecruitment();
  const [activeTab, setActiveTab] = useState<string>('portal-links');
  
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [globalCostHiring, setGlobalCostHiring] = useState<number>(15000000);

  const loadSettings = () => {
    const savedCost = localStorage.getItem('setting_cost_hiring') || '15000000';
    setGlobalCostHiring(parseInt(savedCost));
  };

  useEffect(() => {
    if (currentAdmin) loadSettings();
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

  // 1. TAMPILAN PORTAL LINK
  if (activeTab === 'portal-links') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 font-sans text-left flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-4xl bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">Portal Lowongan Kerja</h3>
            </div>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Login Workspace Admin
            </button>
          </div>
          <div className="text-sm text-slate-500 py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="font-bold text-slate-700">Konten Tampilan Portal Utama</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. TAMPILAN LOGIN
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6">
          <h2 className="text-xl font-black text-center text-slate-800">Selamat Datang di TalentHub</h2>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input required type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50" placeholder="Username" />
            <input required type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50" placeholder="Password" />
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs">Masuk Sistem</button>
          </form>
        </div>
      </div>
    );
  }

  // 3. AREA DASHBOARD UTAMA
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} currentRole={currentAdmin.role} currentUsername={currentAdmin.username} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {(() => {
            switch (activeTab) {
              case 'dashboard':
                return (
                  <div className="space-y-6">
                    <StatsCards />
                    <ApplicationChart />

                    {/* 📊 PANEL PIPELINE REKRUTMEN (SEKARANG MENGGUNAKAN KOMPONEN TABEL) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                      <div className="lg:col-span-2">
                        <PipelineChart /> 
                      </div>

                      {/* REKRUTMEN PER DEPARTEMEN */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Lowongan per Departemen</h3>
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
                  </div>
                );
              case 'settings':
                return <div className="space-y-6"><SettingsTab /></div>;
              default:
                return <div className="p-8 bg-white rounded-2xl text-slate-500 text-xs">Halaman belum tersedia.</div>;
            }
          })()}
        </main>
      </div>
    </div>
  );
}
