import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';

const adminItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'candidates', label: 'Kandidat', icon: Users },
  { id: 'jobs', label: 'Lowongan', icon: Briefcase },
  { id: 'interviews', label: 'Wawancara', icon: Calendar },
  { id: 'portal-links', label: 'Info Portal', icon: Globe },
];

export function Sidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin, currentAdmin, canAccessSettings, logout } = useRecruitment();

  const handleLogout = () => {
    logout();
    // PERBAIKAN: Alihkan kembali ke tab utama umum agar tidak terjadi sisa state menggantung
    onTabChange('dashboard'); 
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 sticky top-0 h-screen shrink-0 z-40 text-left`}>
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Briefcase size={18} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-wider text-white truncate">TALENTHUB</h1>
              <p className="text-[10px] text-indigo-400 font-bold tracking-widest mt-0.5">HRIS PLATFORM</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand Button for Collapsed State */}
      {collapsed && (
        <div className="p-4 border-b border-slate-700/30 flex justify-center">
          <button 
            onClick={() => setCollapsed(false)}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {isAdmin ? (
          adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {/* PERBAIKAN: Mengubah string teks mati menjadi penayangan variabel komponen dinamis */}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })
        ) : (
          /* Menu Mode Guest / Portal Publik Pelamar */
          <button
            onClick={() => onTabChange('apply')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-slate-800/40 text-emerald-400 border border-emerald-500/10"
          >
            <Globe size={18} className="shrink-0" />
            {!collapsed && <span>Formulir Publik</span>}
          </button>
        )}

        {/* Menu Khusus Pengaturan SLA (Hanya Tampil Jika Diizinkan) */}
        {isAdmin && canAccessSettings && (
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <button
              onClick={() => onTabChange('sla-settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'sla-settings'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
              title={collapsed ? 'Pengaturan SLA' : undefined}
            >
              <Settings size={18} className="shrink-0" />
              {!collapsed && <span>Pengaturan SLA</span>}
            </button>
          </div>
        )}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 bg-slate-900/40 border-t border-slate-800/50 shrink-0">
        {isAdmin ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 text-white uppercase shadow-sm">
              {currentAdmin?.username?.charAt(0) || 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-sm truncate text-white">{currentAdmin?.username || 'Admin'}</p>
                <p className="text-xs text-emerald-400 truncate font-medium">{currentAdmin?.role || 'Admin'}</p>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
                title="Logout Aplikasi"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 text-white shadow-sm">
              G
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-sm truncate text-slate-200">Portal Publik</p>
                <p className="text-xs text-slate-400 truncate">Pelamar Kerja</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
