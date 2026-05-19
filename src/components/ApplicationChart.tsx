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

// HELPER KELOLA RENTANG WAKTU (Digunakan bersama oleh Grafik 1 & Grafik 3)
function generateTimeSlots(timeframe: 'monthly' | '6months' | 'yearly', monthNames: string[], currentYear: number) {
  let slots: { key: string; label: string }[] = [];
  if (timeframe === 'monthly') {
    const d = new Date();
    slots = [{
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `Bulan Ini (${monthNames[d.getMonth()]})`
    }];
  } else if (timeframe === '6months') {
    slots = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).substring(2)}`
      };
    });
  } else if (timeframe === 'yearly') {
    slots = Array.from({ length: 3 }, (_, i) => {
      const year = currentYear - (2 - i);
      return { key: `${year}`, label: `Tahun ${year}` };
    });
  }
  return slots;
}

// 1. GRAFIK TREN LAMARAN BULANAN (DENGAN FILTER JANGKA WAKTU)
export function ApplicationChart() {
  const { candidates } = useRecruitment();
  const [timeframe, setTimeframe] = useState<'monthly' | '6months' | 'yearly'>('6months');
  const [popup, setPopup] = useState<any | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();

  const timeSlots = generateTimeSlots(timeframe, monthNames, currentYear);

  const chartData = timeSlots.map(slot => {
    const monthlyCands = candidates.filter(c => c.appliedDate && c.appliedDate.startsWith(slot.key));
    const applications = monthlyCands.length;
    const hires = candidates.filter(c => c.stage === 'Hired' && ((c.hiredDate && c.hiredDate.startsWith(slot.key)) || (!c.hiredDate && c.appliedDate && c.appliedDate.startsWith(slot.key)))).length;
    
    return { month: slot.label, applications, hires, rawKey: slot.key };
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Tren Lamaran & Kelulusan</h3>
          <p className="text-xs text-slate-400 mt-0.5">Analisis kuantitas masuk berkas pelamar dibanding rasio kelulusan</p>
        </div>
        
        {/* Kontrol Filter Waktu */}
        <div className="flex p-1 bg-slate-100 rounded-xl self-start sm:self-center">
          {(['monthly', '6months', 'yearly'] as const).map((type) => (
            <button 
              key={type}
              onClick={() => setTimeframe(type)} 
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${timeframe === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {type === 'monthly' ? 'Bulan Ini' : type === '6months' ? '6 Bulan' : 'Tahunan'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} onClick={handleBarClick} className="cursor-pointer">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            <Legend />
            <Bar dataKey="applications" name="Total Pelamar" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="hires" name="Kandidat Diterima (Hired)" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {popup && (
        <DetailPopup
          title={`Daftar Pelamar Periode: ${popup.month}`}
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

// 2. GRAFIK DISTRIBUSI PER DEPARTEMEN (DENGAN FILTER JANGKA WAKTU)
export function DepartmentChart() {
  const { jobs, candidates } = useRecruitment();
  const [timeframe, setTimeframe] = useState<'monthly' | '6months' | 'yearly'>('6months');
  const [popup, setPopup] = useState<any | null>(null);

  const distinctDepartments = Array.from(new Set(jobs.map(j => j.department).filter(Boolean)));
  const departmentsToRender = distinctDepartments.length > 0 ? distinctDepartments : ['Lainnya'];

  // Batasi kalkulasi kandidat masuk departemen berdasarkan rentang waktu terpilih
  const chartData = departmentsToRender.map(dept => {
    const totalApplicantsInDept = candidates.filter(c => {
      if (!c.appliedDate) return false;

      // Filter waktu dinamis
      const d = new Date();
      const currentYearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      if (timeframe === 'monthly' && !c.appliedDate.startsWith(currentYearMonth)) return false;
      if (timeframe === '6months') {
        const monthsRange = Array.from({ length: 6 }, (_, i) => {
          const checkDate = new Date();
          checkDate.setMonth(checkDate.getMonth() - (5 - i));
          return `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}`;
        });
        if (!monthsRange.some(m => c.appliedDate.startsWith(m))) return false;
      }
      if (timeframe === 'yearly' && !c.appliedDate.startsWith(String(d.getFullYear()))) return false;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Distribusi per Departemen</h3>
          <p className="text-xs text-slate-400 mt-0.5">Komparasi ketersediaan loker aktif vs jumlah pelamar lulus kualifikasi</p>
        </div>
        
        <div className="flex p-1 bg-slate-100 rounded-xl self-start sm:self-center">
          {(['monthly', '6months', 'yearly'] as const).map((type) => (
            <button 
              key={type}
              onClick={() => setTimeframe(type)} 
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${timeframe === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {type === 'monthly' ? 'Bulan Ini' : type === '6months' ? '6 Bulan' : 'Tahunan'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} onClick={handleBarClick} className="cursor-pointer">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
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

// 3. GRAFIK OPERASIONAL BIAYA REKRUTMEN (DENGAN FILTER JANGKA WAKTU)
export function CostHiringChart() {
  const { candidates, jobs, hiringBudget } = useRecruitment();
  const [timeframe, setTimeframe] = useState<'monthly' | '6months' | 'yearly'>('6months');
  const [popup, setPopup] = useState<any | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();

  const timeSlots = generateTimeSlots(timeframe, monthNames, currentYear);

  const chartData = timeSlots.map(slot => {
    const filteredCands = candidates.filter(c => {
      if (!c.appliedDate) return false;
      return c.appliedDate.startsWith(slot.key);
    });

    const totalCandidates = filteredCands.length;
    const costPerCandidate = 150000;
    const totalCost = totalCandidates * costPerCandidate;
    const hiredCount = filteredCands.filter(c => c.stage === 'Hired').length;

    const deptCostMap: Record<string, number> = {};
    filteredCands.forEach(c => {
      let dept = c.department;
      if (!dept && c.position) {
        const matchedJob = jobs.find(j => j.title?.toLowerCase().trim() === c.position?.toLowerCase().trim());
        if (matchedJob) dept = matchedJob.department;
      }
      dept = dept || 'Lainnya';
      deptCostMap[dept] = (deptCostMap[dept] || 0) + costPerCandidate;
    });

    let topDepartment = 'Tidak Ada Data';
    let maxDeptCost = 0;
    Object.entries(deptCostMap).forEach(([dept, cost]) => {
      if (cost > maxDeptCost) {
        maxDeptCost = cost;
        topDepartment = dept;
      }
    });

    return {
      month: slot.label,
      cost: totalCost,
      budget: timeframe === 'yearly' ? (hiringBudget || 50000000) * 12 : (hiringBudget || 50000000),
      candidatesCount: totalCandidates,
      hiredCount: hiredCount,
      topDeptName: topDepartment,
      topDeptCost: maxDeptCost,
      allDeptsBreakdown: deptCostMap
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Analisis Biaya Rekrutmen Finansial</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monitoring operasional anggaran rekrutmen aktual vs limit finansial</p>
        </div>
        
        <div className="flex p-1 bg-slate-100 rounded-xl self-start sm:self-center">
          {(['monthly', '6months', 'yearly'] as const).map((type) => (
            <button 
              key={type}
              onClick={() => setTimeframe(type)} 
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${timeframe === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {type === 'monthly' ? 'Bulan Ini' : type === '6months' ? '6 Bulan' : 'Tahunan'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 p-4 bg-amber-50/60 border border-amber-100 rounded-2xl flex flex-col gap-1">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">💡 Ringkasan Deteksi Pengeluaran:</span>
        <p className="text-sm text-slate-600">
          Pada rentang yang dipilih, alokasi biaya tertinggi dominan diserap oleh Departemen: <strong className="text-indigo-700">{chartData[chartData.length - 1]?.topDeptName}</strong> dengan estimasi penyerapan dana senilai <strong className="text-slate-800">Rp {chartData[chartData.length - 1]?.topDeptCost.toLocaleString('id-ID')}</strong>.
        </p>
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
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            <Legend />
            <Area type="monotone" dataKey="cost" name="Total Biaya (Rp)" stroke="#10b981" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} />
            <Area type="monotone" dataKey="budget" name="Batas Anggaran (Rp)" stroke="#6366f1" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={2} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

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
            { key: 'costAmount', label: 'Pengeluaran Aktual', format: (v) => `Rp ${v.toLocaleString('id-ID')}` },
            { key: 'percentage', label: 'Kontribusi Alokasi (%)' }
          ]}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
