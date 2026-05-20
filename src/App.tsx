import { useState } from 'react';
import { useRecruitment } from './context/RecruitmentContext';
import { LogOut, LayoutDashboard, Settings } from 'lucide-react';

// Import komponen
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { ApplicationChart } from './components/ApplicationChart';
import { PipelineChart } from './components/PipelineChart';
import { NotificationDropdown } from './components/NotificationDropdown';

export function App() {
  const { currentAdmin, login, logout, candidates = [], jobs = [], interviews = [] } = useRecruitment();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200">
          <h2 className="text-xl font-black text-slate-800 mb-6 text-center">TalentHub Login</h2>
          <input className="w-full p-3 border border-slate-200 rounded-xl mb-3 text-sm" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input className="w-full p-3 border border-slate-200 rounded-xl mb-6 text-sm" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm" onClick={() => login && login(username, password)}>Masuk Sistem</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} currentRole={currentAdmin.role} currentUsername={currentAdmin.username} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-sm font-black uppercase tracking-wider">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <button onClick={() => logout && logout()} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><LogOut size={18} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApplicationChart />
            <PipelineChart />
          </div>

          {/* Daftar Kandidat Keseluruhan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Seluruh Kandidat ({candidates.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="p-3">Nama</th>
                    <th className="p-3">Posisi</th>
                    <th className="p-3">Tahap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {candidates.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold">{c.name}</td>
                      <td className="p-3 text-slate-500">{c.position}</td>
                      <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded-md">{c.stage}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
