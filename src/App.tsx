import { useState, useEffect } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { ShieldAlert, LogOut, Settings as SettingsIcon } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { SettingsTab } from './components/SettingsTab';
import { AdminAccounts } from './components/AdminAccounts';
import { HistoryTab } from './components/HistoryTab';
import { ApplicationChart } from './components/ApplicationChart';
import { NotificationDropdown } from './components/NotificationDropdown';
import { PipelineChart } from './components/PipelineChart';

export function App() {
  const { currentAdmin, login, logout, candidates = [], jobs = [] } = useRecruitment();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Header Component (Diletakkan di sini agar mudah digunakan)
  const Header = () => (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 text-left">
      <div>
        <h1 className="text-base font-extrabold text-slate-800 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sistem Manajemen TalentHub HRIS</p>
      </div>
      {currentAdmin && (
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="w-px h-5 bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl capitalize">
              {currentAdmin.username} <span className="text-slate-400 font-normal mx-1">|</span> 
              <span className="text-indigo-600 uppercase font-extrabold text-[9px] tracking-wider">{currentAdmin.role}</span>
            </span>
            <button onClick={() => logout && logout()} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition-colors cursor-pointer">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </header>
  );

  // Jika belum login
  if (!currentAdmin) return ( /* ... (Biarkan kode login Anda yang lama di sini) ... */ );

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
              
              {/* Pipeline Chart Tabel */}
              <PipelineChart />

              {/* 👥 LIST KANDIDAT TERBARU (DIKEMBALIKAN) */}
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
          {/* ... (switch case untuk tab lain tetap seperti semula) ... */}
        </main>
      </div>
    </div>
  );
}
