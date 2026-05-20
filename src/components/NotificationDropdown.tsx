import React, { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';
import { Bell, CheckCheck, Circle, UserPlus, Briefcase, Calendar, Info } from 'lucide-react';

export function NotificationDropdown() {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useRecruitment();
  
  const [isOpen, setIsOpen] = useState(false);

  // Menghitung jumlah notifikasi yang belum dibaca (read === false)
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  // Memberikan ikon berbeda berdasarkan tipe transaksi
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'candidate':
        return <UserPlus size={14} className="text-emerald-500" />;
      case 'interview':
        return <Calendar size={14} className="text-indigo-500" />;
      case 'job':
        return <Briefcase size={14} className="text-amber-500" />;
      default:
        return <Info size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative font-sans">
      {/* Tombol Lonceng */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop penutup otomatis jika klik di luar area dropdown */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden text-left">
            {/* Header */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Pemberitahuan</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{unreadCount} belum dibaca</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllNotificationsAsRead && markAllNotificationsAsRead()}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  <CheckCheck size={12} />
                  <span>Baca Semua</span>
                </button>
              )}
            </div>

            {/* List Item Notifikasi */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications && notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => !notif.read && markNotificationAsRead && markNotificationAsRead(notif.id)}
                    className={`p-3 flex gap-3 items-start transition-colors cursor-pointer ${
                      notif.read ? 'bg-white opacity-70 hover:bg-slate-50/50' : 'bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs text-slate-800 truncate ${!notif.read ? 'font-bold' : 'font-medium'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <Circle size={6} className="fill-indigo-600 text-indigo-600 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                        {notif.time || 'Baru saja'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 font-medium">
                  <p className="text-xs font-bold text-slate-600">Tidak ada pemberitahuan</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Info transaksi terbaru akan muncul di sini.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
