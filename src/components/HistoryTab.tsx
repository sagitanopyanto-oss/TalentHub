import React, { useState } from 'react';
import { Search, Calendar, FileText } from 'lucide-react';

interface HistoryLog {
  id: string;
  timestamp: string;
  adminName: string;
  role: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  description: string;
  targetData: string;
}

export function HistoryTab() {
  const [searchTerm, setSearchTerm] = useState('');

  // Array dikosongkan secara mutlak karena belum ada transaksi proses
  const [logs] = useState<HistoryLog[]>([]);

  const filteredLogs = logs.filter(log => 
    log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.targetData.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Batang Pencarian Log */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            disabled
            placeholder="Cari nama admin, aksi, atau data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 opacity-60 cursor-not-allowed focus:outline-none"
          />
        </div>
        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Calendar size={13} />
          <span>Menampilkan log audit sistem terbaru realtime</span>
        </div>
      </div>

      {/* Tabel Utama Log Riwayat - Keadaan Kosong */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 min-w-[800px]">
            <thead className="text-[11px] text-slate-400 bg-slate-50/80 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Waktu Log</th>
                <th className="px-5 py-3.5">Nama Pengelola</th>
                <th className="px-5 py-3.5">Tipe Akses</th>
                <th className="px-5 py-3.5">Jenis Operasi</th>
                <th className="px-5 py-3.5">Deskripsi Transaksi</th>
                <th className="px-5 py-3.5">Objek Data Terkait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap font-mono">{log.timestamp}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">{log.adminName}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-slate-500">
                        {log.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-black border px-2 py-0.5 rounded-md bg-slate-100 border-slate-200 text-slate-600">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{log.description}</td>
                    <td className="px-5 py-4 text-indigo-600 font-semibold">{log.targetData}</td>
                  </tr>
                ))
              ) : (
                /* Tampilan Indikator Bersih Ketika Log Kosong */
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400 font-normal">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText opacity={0.6} size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Belum Ada Riwayat Transaksi</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Seluruh aktivitas pembaruan data pengelola akan terekam otomatis di sini.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
