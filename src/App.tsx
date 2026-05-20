import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { ApplicationChart } from './components/ApplicationChart';
import { NotificationDropdown } from './components/NotificationDropdown';
import { PipelineChart } from './components/PipelineChart';

export function App() {
  const { currentAdmin, login, logout, candidates = [], jobs = [] } = useRecruitment();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // State form login
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login) {
      const success = login(usernameInput, passwordInput);
      if (!success) setLoginError('Username atau password salah.');
      else { setLoginError(''); setActiveTab('dashboard'); }
    }
  };

  const Header = () => (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 text-left">
      <div>
        <h1 className="text-base font-extrabold text-slate-800 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sistem Manajemen TalentHub HRIS</p>
      </div>
      {currentAdmin && (
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="flex items-center gap-3 ml-4">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl capitalize">
              {currentAdmin.username} | <span className="text-indigo-600 uppercase font-extrabold text-[9px]">{currentAdmin.role}</span>
            </span>
            <button onClick={() => logout && logout()} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </header>
  );

  // LOGIC LOGIN YANG LENGKAP
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl">
          <h2 className="text-xl font-black text-center text-slate-800 mb-6">TalentHub Login</h2>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input required type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50" placeholder="Username" />
            <input required type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50" placeholder="Password" />
            {loginError && <p className="text-[10px] text-red-500 font-bold">{loginError}</p>}
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs">Masuk Sistem</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} currentRole={currentAdmin.role} currentUsername={currentAdmin.username} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <StatsCards />
              <ApplicationChart />
              <PipelineChart />
              
              {/* Daftar Kandidat Terbaru */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Daftar Kandidat Terbaru</h3>
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
          )}
        </main>
      </div>
    </div>
  );
}
