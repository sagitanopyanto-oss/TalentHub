import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { X } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';

// Fungsi Pop-up Detail
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
  const { candidates, jobs } = useRecruitment();
  const [chartRange, setChartRange] = useState<'this-month' | '6-months' | 'yearly'>('6-months');
  const [popup, setPopup] = useState<{ month: string; cost: number; allDeptsBreakdown: Record<string, number> } | null>(null);

  // Logika Filter Tanggal
  const isDateInRange = (date: Date) => {
    const now = new Date();
    if (chartRange === 'this-month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (chartRange === '6-months') {
      const d = new Date();
      d.setMonth(now.getMonth() - 6);
      return date >= d;
    }
    return date.getFullYear() === now.getFullYear();
  };

  const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyStats = monthsOrder.map(m => ({ month: m, candidates: 0, hired: 0, cost: 0, budget: 50000000, deptsBreakdown: {} as Record<string, number> }));

  // Hitung Data
  candidates.forEach(c => {
    if (c.appliedDate && isDateInRange(new Date(c.appliedDate))) {
      monthlyStats[new Date(c.appliedDate).getMonth()].candidates += 1;
    }
    if (c.stage === 'Hired' && c.hiredDate && isDateInRange(new Date(c.hiredDate))) {
      monthlyStats[new Date(c.hiredDate).getMonth()].hired += 1;
    }
  });

  jobs.forEach(j => {
    if (j.postedDate && isDateInRange(new Date(j.postedDate))) {
      const idx = new Date(j.postedDate).getMonth();
      const cost = typeof j.cost === 'string' ? parseFloat(j.cost) : (j.cost || 0);
      monthlyStats[idx].cost += cost;
      const dept = j.department || 'Umum';
      monthlyStats[idx].deptsBreakdown[dept] = (monthlyStats[idx].deptsBreakdown[dept] || 0) + cost;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full text-left">
      {/* Statistik Rekrutmen */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statistik Rekrutmen</h3>
            <h4 className="text-sm font-black text-slate-800 mt-0.5">Volume Pelamar vs Hired</h4>
          </div>
          <select 
            value={chartRange}
            onChange={(e) => setChartRange(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="this-month">Bulan Ini</option>
            <option value="6-months">6 Bulan Terakhir</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="candidates" name="Pelamar Masuk" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="hired" name="Kandidat Hired" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Efisiensi Finansial */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[380px]">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efisiensi Finansial</h3>
          <h4 className="text-sm font-black text-slate-800 mt-0.5">Analisis Biaya Iklan</h4>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyStats} onClick={(e: any) => e?.activePayload && setPopup({ month: e.activePayload[0].payload.month, cost: e.activePayload[0].payload.cost, allDeptsBreakdown: e.activePayload[0].payload.deptsBreakdown })}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="cost" name="Biaya (Rp)" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {popup && (
        <DetailPopup
          title={`Detail Biaya Periode: ${popup.month}`}
          data={Object.entries(popup.allDeptsBreakdown).map(([k, v]) => ({ dept: k, val: v }))}
          columns={[{ key: 'dept', label: 'Dept' }, { key: 'val', label: 'Biaya', format: (v) => `Rp ${v.toLocaleString()}` }]}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
