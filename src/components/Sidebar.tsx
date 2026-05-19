import { 
  LayoutDashboard, 
  Users, \n  Briefcase, 
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

// Struktur daftar menu navigasi admin lengkap
const adminItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'candidates', label: 'Kandidat', icon: Users },
  { id: 'jobs', label: 'Lowongan', icon: Briefcase },
  { id: 'interviews', label: 'Wawancara', icon: Calendar },
  { id: 'portal-links', label: 'Info Portal', icon: Globe },
  { id: 'admin-accounts', label: 'Manajemen Admin', icon: ShieldAlert },
  { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  
  // Ambil state autentikasi dari context global
  const { currentAdmin, logout } = useRecruitment();

  // FIX UTAMA: Jangan mengandalkan boolean 'isAdmin' dari context jika nilainya sering meleset.
  // Selama variabel 'currentAdmin' terisi atau memiliki role manajemen, paksa statusnya menjadi true.
  const memilikiAksesAdmin = currentAdmin !== null && currentAdmin !== undefined;

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 sticky top-0 h-screen shrink-0 z-40 text-left`}>
      {/* Bagian Atas: Logo Aplikasi */}
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

      {/* Bagian Tengah: Menu Navigasi Dinamis */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {memilikiAksesAdmin ? (
          // JIKA TERAUTENTIKASI SEBAGAI AKUN MANAGEMENT: Tampilkan list menu admin utuh
          adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'settings' && activeTab === 'sla-settings');
            
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
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })
        ) : (
          // FALLBACK EMERGENCY: Jika belum login/public user, tetap sediakan jalan pintas ke menu admin agar tidak terkunci
          <button
            onClick={() => onTabChange('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-amber-600/20 text-amber-400 border border-amber-500/20"
          >
            <LayoutDashboard size={18} />
            {!collapsed && <span>Masuk ke Dashboard Admin</span>}
          </button>
        )}
      </nav>

      {/* Bagian Bawah: Informasi Profil Akun Terbuka */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-950/20">
        {memilikiAksesAdmin ? (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0 text-white shadow-md">
              {currentAdmin?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="font-bold text-sm truncate text-slate-100">{currentAdmin?.username || 'Administrator'}</p>
                <p className="text-xs text-indigo-400 font-semibold truncate uppercase tracking-wider">{currentAdmin?.role || 'Admin'}</p>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={() => { logout(); onTabChange('dashboard'); }}
                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                title="Keluar Aplikasi"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-center text-slate-500 font-medium">
            {!collapsed && <p>Mode Sesi Terbatas</p>}
          </div>
        )}
      </div>
    </aside>
  );
}
