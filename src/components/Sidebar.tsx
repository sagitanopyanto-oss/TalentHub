import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  ShieldAlert,
  LogIn
} from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogoutSuccess: () => void;
}

export function Sidebar({ activeTab, onTabChange, onLogoutSuccess }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentAdmin, logout } = useRecruitment();

  const handleActionLogout = () => {
    if (logout) {
      logout();
    }
    onLogoutSuccess(); // Mengalihkan tab ke portal lowongan kerja publik
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 sticky top-0 h-screen shrink-0 z-40 text-left`}>
      {/* Bagian Atas: Logo */}
      <div className="p-6 flex items-center justify-between border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-lg tracking-wider">T</div>
            <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">TalentHub</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors mx-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Bagian Tengah: Menu Navigasi Adaptif */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {/* MENU UTAMA PUBLIK (Selalu bisa dilihat siapa pun) */}
        <button
          onClick={() => onTabChange('portal-links')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
            activeTab === 'portal-links'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
          }`}
        >
          <Globe size={18} />
          {!collapsed && <span>Info Portal</span>}
        </button>

        {/* MENU INTERNAL ADMIN (Hanya dirender jika ada admin yang login) */}
        {currentAdmin && (
          <>
            <div className="pt-4 pb-1 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {!collapsed ? 'Menu Manajemen' : '—'}
            </div>
            
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'candidates', label: 'Kandidat', icon: Users },
              { id: 'jobs', label: 'Lowongan', icon: Briefcase },
              { id: 'interviews', label: 'Wawancara', icon: Calendar },
              { id: 'admin-accounts', label: 'Manajemen Admin', icon: ShieldAlert },
              { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Bagian Bawah: Profil Akun / Opsi Login */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-950/20">
        {currentAdmin ? (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0 text-white">
              {currentAdmin.username.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="font-bold text-sm truncate text-slate-100">{currentAdmin.username}</p>
                <p className="text-xs text-indigo-400 font-semibold truncate uppercase tracking-wider">{currentAdmin.role}</p>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={handleActionLogout}
                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                title="Keluar dari Sistem Admin"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onTabChange('login')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 border-white shadow-md'
                : 'border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <LogIn size={15} />
            {!collapsed && <span>Masuk Admin HRIS</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
