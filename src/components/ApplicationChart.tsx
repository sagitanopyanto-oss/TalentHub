import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { X } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';

// POPUP DETAIL GLOBAL UNTUK SEMUA GRAFIK
function DetailPopup({ title, data, columns, onClose }: {
  title: string;
  data: Record<string, any>[];
  columns: { key: string; label: string; format?: (v: any) => string }[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                {columns.map(col => (
                  <th key={col.key} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-5 py-3.5 text-xs font-semibold text-slate-700">
                      {col.format ? col.format(row[col.key]) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ApplicationChart() {
  const recruitmentContext = useRecruitment();
  const candidates = recruitmentContext?.candidates || [];
  const jobs = recruitmentContext?.jobs || [];
  const timeRange = recruitmentContext?.selectedTimeRange || 'all';

  const [popup, setPopup] = useState<{ month: string; cost: number; allDeptsBreakdown: Record<string, number> } | null>(null);

  // Urutan indeks bulan statis
  const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // STRUKTUR PEMBENTUKAN DATA BULANAN
  const monthlyStats = monthsOrder.map(m => ({
    month: m,
    candidates: 0,   // Total yang mendaftar (Apply)
    hired: 0,        // Total yang diterima kerja (Hired)
    cost: 0,
    budget: 50000000, 
    deptsBreakdown: {} as Record<string, number>
  }));

  // MEMPROSES KANDIDAT: Menghitung pendaftaran DAN kelulusan (Hired) per bulan
  candidates.forEach(c => {
    // 1. Hitung Tren Pelamar Masuk (Berdasarkan appliedDate)
    if (c.appliedDate) {
      const appDate = new Date(c.appliedDate);
      const appMonthIndex = appDate.getMonth();
      if (appMonthIndex >= 0 && appMonthIndex < 12) {
        monthlyStats[appMonthIndex].candidates += 1;
      }
    }

    // 2. Hitung Tren Pelamar Diterima (Jika statusnya 'Hired', hitung berdasarkan hiredDate atau fallback appliedDate)
    if (c.stage === 'Hired') {
      const targetDate = c.hiredDate ? new Date(c.hiredDate) : (c.appliedDate ? new Date(c.appliedDate) : null);
      if (targetDate) {
        const hiredMonthIndex = targetDate.getMonth();
        if (hiredMonthIndex >= 0 && hiredMonthIndex < 12) {
          monthlyStats[hiredMonthIndex].hired += 1;
        }
      }
    }
  });

  // MEMPROSES DATA FINANSIAL BIAYA REKRUTMEN
  jobs.forEach(j => {
    if (!j.postedDate || !j.cost) return;
    const date = new Date(j.postedDate);
    const monthIndex = date.getMonth();
    const costAmount = typeof j.cost === 'string' ? parseFloat(j.cost) : j.cost;

    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyStats[monthIndex].cost += costAmount;
      const dept = j.department || 'Umum';
      if (!monthlyStats[monthIndex].deptsBreakdown[dept]) {
        monthlyStats[monthIndex].deptsBreakdown[dept] = 0;
      }
      monthlyStats[monthIndex].deptsBreakdown[dept] += costAmount;
    }
  });

  const formatRupiahSingkat = (value: number) => {
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}Rb`;
    return `Rp ${value}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full text-left">
      
      {/* GRAFIK 1: PERBAIKAN SEKARANG MENAMPILKAN DATA PELAMAR & HIRED (DUAL BAR CHART) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statistik Rekrutmen</h3>
          <h4 className="text-sm font-black text-slate-800 tracking-tight mt-0.5">Tren Volume Pelamar vs Kandidat Hired</h4>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
            {/* Batang 1: Total Pelamar Masuk */}
            <Bar dataKey="candidates" name="Jumlah Pelamar Masuk" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={20} />
            {/* Batang 2: Kandidat Berhasil Diterima (Hired) */}
            <Bar dataKey="hired" name="Kandidat Lolos (Hired)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRAFIK 2: ANALISIS BIAYA REKRUTMEN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efisiensi Finansial</h3>
          <h4 className="text-sm font-black text-slate-800 tracking-tight mt-0.5">Analisis Biaya Iklan Lowongan Kerja</h4>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} onClick={(data) => {
            if (data && data.activePayload && data.activePayload[0]) {
              const payload = data.activePayload[0].payload;
              setPopup({ month: payload.month, cost: payload.cost, allDeptsBreakdown: payload.deptsBreakdown });
            }
          }}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatRupiahSingkat} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
            <Area type="monotone" dataKey="cost" name="Total Biaya (Rp)" stroke="#10b981" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} />
            <Area type="monotone" dataKey="budget" name="Batas Anggaran (Rp)" stroke="#6366f1" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={2} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* POPUP DETAIL MODAL JIKA AREA CHART DIKLIK */}
      {popup && (
        <DetailPopup
          title={`Detail Biaya Periode: ${popup.month}`}
          data={Object.entries(popup.allDeptsBreakdown).map(([dept, cost]) => ({
            department: dept,
            costAmount: cost,
            percentage: popup.cost > 0 ? ((cost / popup.cost) * 100).toFixed(1) + '%' : '0%'
          }))}
          columns={[
            { key: 'department', label: 'Nama Departemen Pekerjaan' },
            { key: 'costAmount', label: 'Pengeluaran Iklan', format: (v) => `Rp ${v.toLocaleString('id-ID')}` },
            { key: 'percentage', label: 'Kontribusi Porsi (%)' }
          ]}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
