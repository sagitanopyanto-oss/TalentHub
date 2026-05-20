import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  UserCheck, 
  Settings,
  History 
} from 'lucide-react';
// 1. IMPORT KOMPONEN DROPDOWN NOTIFIKASI YANG KITA BUAT DI STEP 1
import { NotificationDropdown } from './NotificationDropdown';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  currentRole?: string;
  currentUsername?: string;
}

export function Sidebar({ activeTab, onTabChange, currentRole, currentUsername }: SidebarProps) {

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'candidates', name: 'Manajemen Kandidat', icon: <Users size={16} /> },
    { id: 'jobs', name: 'Manajemen Lowongan', icon: <Briefcase size={16} /> },
    { id: 'interviews', name: 'Jadwal Interview', icon: <Calendar size={16} /> },
    { id: 'history', name: 'Riwayat Aktivitas', icon: <History size={16} /> },
    { id: 'admin-accounts', name: 'Manajemen Admin', icon: <UserCheck size={16} /> },
    { id: 'settings', name: 'Pengaturan Sistem', icon: <Settings size={16} /> },
  ];

  const normalizedRole = (currentRole || '').trim().toLowerCase();

  // Sembunyikan 'admin-accounts' dan 'settings' dari admin & recruiter
  const filteredMenuItems = menuItems.filter(item => {
    if (item.id === 'admin-accounts' || item.id === 'settings') {
      return normalizedRole !== 'admin' && normalizedRole !== 'recruiter';
    }
    return true;
  });

  return (
    <div className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col justify-between p-4 font-sans text-left">
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-800 pb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-base">T</div>
          <div>
            <h2 className="font-bold text-white text-sm leading-tight tracking-wide">TalentHub</h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Dashboard Panel</p>
          </div>
        </div>

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

      {/* FOOTER SIDEBAR: INFO AKUN & PANEL NOTIFIKASI LONCENG */}
      <div className="pt-4 border-t border-slate-800 mb-2 space-y-2">
        
        {/* WADAH NOTIFIKASI BARU (Diletakkan agar posisinya melayang ke atas dengan rapi) */}
        <div className="flex items-center justify-between px-3 py-1 bg-slate-800/20 rounded-xl border border-transparent">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Notifikasi Sistem</span>
          {/* PEMANGGILAN DROPDOWN NOTIFIKASI 🛎️ */}
          <div className="relative text-slate-400 hover:text-slate-200">
            <NotificationDropdown />
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="px-3 py-2 bg-slate-800/40 border border-slate-800 rounded-xl">
          <p className="text-xs font-bold text-slate-200 truncate">{currentUsername || 'User Admin'}</p>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-0.5">Role: {currentRole || 'Guest'}</p>
        </div>
      </div>
    </div>
  );
}
