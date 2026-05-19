import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-3.5">
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

// 1. GRAFIK TREN LAMARAN BULANAN (SINKRON DENGAN EXCEL TREN BULANAN)
export function ApplicationChart() {
  const { candidates } = useRecruitment();
  const [popup, setPopup] = useState<any | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: monthNames[d.getMonth()],
    };
  });

  const chartData = last6Months.map(m => {
    const monthlyCands = candidates.filter(c => c.appliedDate && c.appliedDate.startsWith(m.key));
    const applications = monthlyCands.length;
    // Sinkronisasi pendeteksian Hired berdasarkan tanggal hiredDate (jika ada) atau appliedDate bulanan
    const hires = candidates.filter(c => c.stage === 'Hired' && ((c.hiredDate && c.hiredDate.startsWith(m.key)) || (!c.hiredDate && c.appliedDate && c.appliedDate.startsWith(m.key)))).length;
    return { month: `${m.label} ${m.key.split('-')[0].substring(2)}`, applications, hires, rawKey: m.key };
  });

  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    const activeItem = data.activePayload[0].payload;
    
    const filteredCands = candidates.filter(c => c.appliedDate && c.appliedDate.startsWith(activeItem.rawKey));
    setPopup({
      month: activeItem.month,
      candidates: filteredCands.map(c => ({
        name: c.name,
        position: c.position,
        stage: c.stage,
        date: c.appliedDate
      }))
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-800">Tren Lamaran & Kelulusan</h3>
        <p className="text-xs text-slate-400 mt-0.5">Analisis statistik volume pelamar masuk berbanding kandidat diterima (6 bulan terakhir)</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} onClick={handleBarClick} className="cursor-pointer">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend />
            <Bar dataKey="applications" name="Total Pelamar" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="hires" name="Kandidat Diterima (Hired)" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {popup && (
        <DetailPopup
          title={`Daftar Pelamar Bulan: ${popup.month}`}
          data={popup.candidates}
          columns={[
            { key: 'name', label: 'Nama Pelamar' },
            { key: 'position', label: 'Posisi Lowongan' },
            { key: 'stage', label: 'Status Tahap' },
            { key: 'date', label: 'Tanggal Melamar' }
          ]}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

// 2. GRAFIK DISTRIBUSI PER DEPARTEMEN (SINKRON DENGAN SHEET DEPARTEMEN EXCEL)
export function DepartmentChart() {
  const { jobs, candidates } = useRecruitment();
  const [popup, setPopup] = useState<any | null>(null);

  const distinctDepartments = Array.from(new Set(jobs.map(j => j.department).filter(Boolean)));
  const departmentsToRender = distinctDepartments.length > 0 ? distinctDepartments : ['Lainnya'];

  // PERBAIKAN: Memetakan relasi kandidat ke departemen secara akurat menggunakan cross-reference judul loker
  const chartData = departmentsToRender.map(dept => {
    const totalApplicantsInDept = candidates.filter(c => {
      let candidateDept = c.department;
      if (!candidateDept && c.position) {
        const matchedJob = jobs.find(j => j.title?.toLowerCase().trim() === c.position?.toLowerCase().trim());
        if (matchedJob) candidateDept = matchedJob.department;
      }
      return (candidateDept || 'Lainnya') === dept;
    });

    const hires = totalApplicantsInDept.filter(c => c.stage === 'Hired').length;
    const openings = jobs.filter(j => j.department === dept && j.status === 'Active').length;
    
    return { name: dept, hires, openings };
  });

  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    const activeItem = data.activePayload[0].payload;

    const filteredJobs = jobs.filter(j => j.department === activeItem.name);
    setPopup({
      department: activeItem.name,
      jobs: filteredJobs.map(j => ({
        title: j.title,
        status: j.status,
        applicants: candidates.filter(c => c.position?.toLowerCase().trim() === j.title?.toLowerCase().trim()).length,
        postedDate: j.postedDate
      }))
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-800">Distribusi per Departemen</h3>
        <p className="text-xs text-slate-400 mt-0.5">Perbandingan jumlah lowongan aktif dengan total pelamar yang berhasil direkrut</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} onClick={handleBarClick} className="cursor-pointer">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend />
            <Bar dataKey="openings" name="Lowongan Aktif" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="hires" name="Total Kelulusan (Hired)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {popup && (
        <DetailPopup
          title={`Detail Lowongan Kerja Departemen: ${popup.department}`}
          data={popup.jobs}
          columns={[
            { key: 'title', label: 'Nama Posisi Jabatan' },
            { key: 'status', label: 'Status Loker' },
            { key: 'applicants', label: 'Jumlah Pelamar' },
            { key: 'postedDate', label: 'Tanggal Tayang' }
          ]}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

// 3. GRAFIK OPERASIONAL BIAYA REKRUTMEN (SINKRON 100% DENGAN SHEET COST HIRING EXCEL)
export function CostHiringChart() {
  const { candidates, hiringBudget } = useRecruitment();
  const [popup, setPopup] = useState<any | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: monthNames[d.getMonth()],
    };
  });

  // PERBAIKAN: Menghitung biaya operasional dinamis berbasis akumulasi real-time per bulan (searah logika Excel)
  const chartData = last6Months.map(m => {
    const monthlyCands = candidates.filter(c => c.appliedDate && c.appliedDate.startsWith(m.key));
    const totalCandidates = monthlyCands.length;
    
    // Rumus sinkron: total kandidat masuk dikali Rp 150.000
    const costPerCandidate = 150000;
    const cost = totalCandidates * costPerCandidate;
    const hiredCount = monthlyCands.filter(c => c.stage === 'Hired').length;

    return {
      month: `${m.label} ${m.key.split('-')[0].substring(2)}`,
      cost: cost,
      budget: hiringBudget || 50000000, // Fallback budget jika di context kosong
      candidatesCount: totalCandidates,
      hiredCount: hiredCount
    };
  });

  const formatRupiahSingkat = (value: any) => {
    if (Number(value) >= 1000000) {
      return `Rp ${(Number(value) / 1000000).toFixed(1)}jt`;
    }
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
  };

  const handleAreaClick = (data: any) => {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    const activeItem = data.activePayload[0].payload;
    setPopup(activeItem);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-800">Analisis Biaya Rekrutmen (Cost-per-Hire)</h3>
        <p className="text-xs text-slate-400 mt-0.5">Monitoring pengeluaran operasional onboarding berbanding batas limit anggaran keuangan</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} onClick={handleAreaClick} className="cursor-pointer">
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
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
            { key: 'candidatesCount', label: 'Total Pelamar Masuk' },
            { key: 'hiredCount', label: 'Lolos Kualifikasi (Hired)' },
            { key: 'cost', label: 'Total Biaya Pengeluaran', format: (v) => `Rp ${v.toLocaleString('id-ID')}` },
            { key: 'budget', label: 'Batas Limit Budget', format: (v) => `Rp ${v.toLocaleString('id-ID')}` }
          ]}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
