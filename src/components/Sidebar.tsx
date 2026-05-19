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
  ShieldAlert
} from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';

const adminItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'candidates', label: 'Kandidat', icon: Users },
  { id: 'jobs', label: 'Lowongan', icon: Briefcase },
  { id: 'interviews', label: 'Wawancara', icon: Calendar },
  { id: 'portal-links', label: 'Info Portal', icon: Globe },
  { id: 'admin-accounts', label: 'Manajemen Admin', icon: ShieldAlert },
  { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentAdmin, logout } = useRecruitment();

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 h-screen sticky top-0 shrink-0 z-50 text-left border-r border-slate-800 overflow-y-auto`}>
      {/* Bagian Atas: Logo */}
      <div className="p-6 flex items-center justify-between border-b border-slate-700/50 shrink-0">
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

      {/* Bagian Tengah: Menu Navigasi Internal */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {adminItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <Icon size={18} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bagian Bawah: Info Profil Sesi & Tombol Keluar */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-950/20 shrink-0">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0 text-white shadow-md">
            {currentAdmin?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold text-sm truncate text-slate-100">{currentAdmin?.username || 'Admin'}</p>
              <p className="text-xs text-indigo-400 font-semibold truncate uppercase tracking-wider">{currentAdmin?.role || 'HRIS ACCESS'}</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={() => logout && logout()}
              className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
              title="Keluar dari Sistem Admin"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
