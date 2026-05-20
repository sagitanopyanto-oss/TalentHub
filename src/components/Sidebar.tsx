import React from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  UserCheck, 
  Settings, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const { currentAdmin } = useRecruitment();

  // Daftar seluruh menu sistem baku
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'candidates', name: 'Manajemen Kandidat', icon: <Users size={16} /> },
    { id: 'jobs', name: 'Manajemen Lowongan', icon: <Briefcase size={16} /> },
    { id: 'interviews', name: 'Jadwal Interview', icon: <Calendar size={16} /> },
    /* Menu Manajemen Admin */
    { id: 'admin-accounts', name: 'Manajemen Admin', icon: <UserCheck size={16} /> },
    { id: 'settings', name: 'Pengaturan Sistem', icon: <Settings size={16} /> },
  ];

  // FILTER LOGIKA MUTLAK SIDEBAR: 
  // Jika user ber-role 'admin' atau 'recruiter', hilangkan menu 'admin-accounts' dari daftar array sidebar
  const filteredMenuItems = menuItems.filter(item => {
    if (item.id === 'admin-accounts') {
      return currentAdmin?.role !== 'admin' && currentAdmin?.role !== 'recruiter';
    }
    return true;
  });

  return (
    <div className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col justify-between p-4 font-sans text-left">
      <div className="space-y-6">
        {/* Identitas Aplikasi */}
        <div className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-800 pb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-base">
            T
          </div>
          <div>
            <h2 className="font-bold text-white text-sm leading-tight tracking-wide">TalentHub</h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Dashboard Panel</p>
          </div>
        </div>

        {/* Menu Navigasi Berdasarkan Hasil Filter Role */}
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profil User Aktif & Tombol Keluar */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="px-3 py-2 bg-slate-800/40 border border-slate-800 rounded-xl">
          <p className="text-xs font-bold text-slate-200 truncate">{currentAdmin?.username || 'User Admin'}</p>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-0.5">{currentAdmin?.role}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </div>
  );
}
