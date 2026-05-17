import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { X } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';

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
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {columns.map(col => (
                  <th key={col.key} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {columns.map(col => (
                    <td key={col.key} className="py-3 px-5 text-sm text-slate-700 font-medium">
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

function EmptyChart({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[380px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
        <div className="text-center">
          <div className="text-5xl font-bold text-slate-300 mb-2">0</div>
          <p className="text-sm font-semibold text-slate-500">Belum ada data proses rekrutmen</p>
          <p className="text-xs text-slate-400 mt-1">Grafik akan terisi otomatis saat kandidat mulai masuk.</p>
        </div>
      </div>
    </div>
  );
}

function monthLabel(dateStr: string) {
  if (!dateStr) return 'Tanpa Tanggal';
  return new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
}

export function ApplicationChart() {
  const { candidates } = useRecruitment();
  const [popup, setPopup] = useState<Record<string, any> | null>(null);

  const chartData = Object.values(candidates.reduce((acc, candidate) => {
    const month = monthLabel(candidate.appliedDate);
    if (!acc[month]) acc[month] = { month, applications: 0, hires: 0 };
    acc[month].applications += 1;
    if (candidate.stage === 'Hired') acc[month].hires += 1;
    return acc;
  }, {} as Record<string, { month: string; applications: number; hires: number }>));

  const handleClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) setPopup(data.activePayload[0].payload);
  };

  if (candidates.length === 0) {
    return <EmptyChart title="Tren Aplikasi & Rekrutmen" description="Data aktual berdasarkan kandidat yang masuk" />;
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Tren Aplikasi & Rekrutmen</h3>
          <p className="text-sm text-slate-500 mt-1">Data aktual dari kandidat yang masuk</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barGap={8} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend />
            <Bar dataKey="applications" name="Lamaran Aktual" fill="#6366f1" radius={[8, 8, 0, 0]} className="cursor-pointer" />
            <Bar dataKey="hires" name="Hired Aktual" fill="#a78bfa" radius={[8, 8, 0, 0]} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {popup && (
        <DetailPopup
          title={`Detail Bulan: ${popup.month}`}
          data={[popup]}
          columns={[
            { key: 'month', label: 'Bulan' },
            { key: 'applications', label: 'Total Lamaran Aktual' },
            { key: 'hires', label: 'Hired Aktual' },
          ]}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
}

export function DepartmentChart() {
  const { candidates } = useRecruitment();
  const [popup, setPopup] = useState<Record<string, any> | null>(null);

  const chartData = Object.values(candidates.reduce((acc, candidate) => {
    const name = candidate.department || 'Tanpa Departemen';
    if (!acc[name]) acc[name] = { name, candidates: 0, hires: 0 };
    acc[name].candidates += 1;
    if (candidate.stage === 'Hired') acc[name].hires += 1;
    return acc;
  }, {} as Record<string, { name: string; candidates: number; hires: number }>));

  const handleClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) setPopup(data.activePayload[0].payload);
  };

  if (candidates.length === 0) {
    return <EmptyChart title="Rekrutmen per Departemen" description="Data aktual berdasarkan departemen kandidat" />;
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Rekrutmen per Departemen</h3>
          <p className="text-sm text-slate-500 mt-1">Data aktual kandidat per departemen</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend />
            <Line type="monotone" dataKey="candidates" name="Kandidat Aktual" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} className="cursor-pointer" />
            <Line type="monotone" dataKey="hires" name="Hired Aktual" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} className="cursor-pointer" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {popup && (
        <DetailPopup
          title={`Departemen: ${popup.name}`}
          data={[popup]}
          columns={[
            { key: 'name', label: 'Departemen' },
            { key: 'candidates', label: 'Kandidat Aktual' },
            { key: 'hires', label: 'Hired Aktual' },
          ]}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
}

export function CostHiringChart() {
  const { candidates, hiringBudget } = useRecruitment();
  const [popup, setPopup] = useState<Record<string, any> | null>(null);
  const formatRupiahSingkat = (value: number) => `Rp ${(value / 1000000).toFixed(0)}Jt`;

  const chartData = Object.values(candidates.reduce((acc, candidate) => {
    const month = monthLabel(candidate.appliedDate);
    if (!acc[month]) acc[month] = { month, cost: 0, hires: 0, candidates: 0, budget: hiringBudget };
    acc[month].candidates += 1;
    acc[month].cost += 250000;
    if (['Interview', 'Assessment', 'Offer', 'Medical', 'Hired'].includes(candidate.stage)) acc[month].cost += 500000;
    if (['Assessment', 'Offer', 'Medical', 'Hired'].includes(candidate.stage)) acc[month].cost += 750000;
    if (['Medical', 'Hired'].includes(candidate.stage)) acc[month].cost += 350000;
    if (candidate.stage === 'Hired') acc[month].hires += 1;
    return acc;
  }, {} as Record<string, { month: string; cost: number; hires: number; candidates: number; budget: number }>));

  const handleClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) setPopup(data.activePayload[0].payload);
  };

  if (candidates.length === 0) {
    return <EmptyChart title="Biaya Rekrutmen (Cost Hiring)" description="Estimasi biaya akan muncul saat proses rekrutmen berjalan" />;
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Biaya Rekrutmen (Cost Hiring)</h3>
          <p className="text-sm text-slate-500 mt-1">Estimasi biaya berdasarkan proses kandidat aktual</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} onClick={handleClick}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatRupiahSingkat} />
            <Tooltip formatter={(value: any, name: any) => [name === 'budget' ? `Rp ${Number(value).toLocaleString('id-ID')}` : `Rp ${Number(value).toLocaleString('id-ID')}`, name === 'budget' ? 'Budget Tersedia' : 'Estimasi Biaya']} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend />
            <Area type="monotone" dataKey="cost" name="Estimasi Biaya (Rp)" stroke="#10b981" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} className="cursor-pointer" />
            <Area type="monotone" dataKey="budget" name="Budget Limit (Rp)" stroke="#6366f1" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={2} strokeDasharray="5 5" className="cursor-pointer" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {popup && (
        <DetailPopup
          title={`Biaya Hiring Bulan: ${popup.month}`}
          data={[popup]}
          columns={[
            { key: 'month', label: 'Bulan' },
            { key: 'candidates', label: 'Kandidat Aktual' },
            { key: 'cost', label: 'Estimasi Biaya', format: (v: number) => `Rp ${v.toLocaleString('id-ID')}` },
            { key: 'hires', label: 'Jumlah Hired' },
          ]}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
}