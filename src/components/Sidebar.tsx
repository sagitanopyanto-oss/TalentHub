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

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 sticky top-0 h-screen shrink-0 z-40`}>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-indigo-500/30">
          R
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-lg leading-tight">RecruitFlow</h1>
            <p className="text-xs text-slate-400">Recruitment Portal</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors z-10 shadow-md"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {isAdmin ? (
          <>
            {!collapsed && (
              <p className="text-[10px] uppercase font-bold text-slate-500 px-2 pt-2 pb-1">Admin Panel</p>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
            {canAccessSettings && (
              <>
                {!collapsed && (
                  <p className="text-[10px] uppercase font-bold text-slate-500 px-2 pt-4 pb-1">Konfigurasi</p>
                )}
                <button
                  onClick={() => onTabChange('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Settings size={20} className={`shrink-0 ${activeTab === 'settings' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  {!collapsed && <span className="font-medium">Pengaturan</span>}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {!collapsed && (
              <p className="text-[10px] uppercase font-bold text-slate-500 px-2 pt-2 pb-1">Portal Karir</p>
            )}
            <button
              onClick={() => onTabChange('apply')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === 'apply'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-700/30 border border-emerald-500/20'
              }`}
            >
              <FileText size={20} className="shrink-0 text-emerald-400 group-hover:text-emerald-300" />
              {!collapsed && <span className="font-medium">Lamar Kerja</span>}
            </button>
          </>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700/50">
        {isAdmin ? (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white">
              {currentAdmin?.username.charAt(0).toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-white">{currentAdmin?.username || 'Admin'}</p>
                <p className="text-xs text-emerald-400 truncate">{currentAdmin?.role || 'Admin'}</p>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={() => { logout(); onTabChange('apply'); }}
                className="text-slate-400 hover:text-red-400 transition-colors p-1"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        ) : (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white">
              G
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
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
