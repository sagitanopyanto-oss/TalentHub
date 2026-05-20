import { useState } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { LogOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { ApplicationChart } from './components/ApplicationChart';
import { NotificationDropdown } from './components/NotificationDropdown';
import { PipelineChart } from './components/PipelineChart';

export function App() {
  const { currentAdmin, login, logout, candidates = [] } = useRecruitment();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // ... (login logic tetap sama seperti sebelumnya)

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} currentRole={currentAdmin?.role || ''} currentUsername={currentAdmin?.username || ''} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-base font-extrabold text-slate-800 capitalize tracking-tight">{activeTab}</h1>
          {currentAdmin && (
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <button onClick={() => logout && logout()} className="p-1.5 bg-red-50 text-red-500 rounded-lg"><LogOut size={13} /></button>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <StatsCards />
              <ApplicationChart />
              <PipelineChart /> {/* Komponen ini yang memegang logika 0% */}
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Daftar Kandidat Terbaru</h3>
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-50">
                    {candidates.slice(-5).reverse().map((c, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold text-slate-800">{c.name}</td>
                        <td className="p-3 text-slate-500">{c.stage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
