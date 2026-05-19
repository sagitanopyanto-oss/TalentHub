// 3. GRAFIK OPERASIONAL BIAYA REKRUTMEN (DENGAN FILTER JANGKA WAKTU & ANALISIS TAJAM)
export function CostHiringChart() {
  const { candidates, jobs, hiringBudget } = useRecruitment();
  const [timeframe, setTimeframe] = useState<'monthly' | '6months' | 'yearly'>('6months');
  const [popup, setPopup] = useState<any | null>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentYear = new Date().getFullYear();

  // 1. LOGIKA GENERATOR WAKTU DINAMIS BERDASARKAN FILTER
  let timeSlots: { key: string; label: string }[] = [];

  if (timeframe === 'monthly') {
    // Menampilkan 4 minggu terakhir atau bulan berjalan secara spesifik (Bulan Ini)
    const d = new Date();
    timeSlots = [{
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `Bulan Ini (${monthNames[d.getMonth()]})`
    }];
  } else if (timeframe === '6months') {
    // 6 Bulan Terakhir
    timeSlots = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).substring(2)}`
      };
    });
  } else if (timeframe === 'yearly') {
    // 3 Tahun Terakhir untuk Analisis Makro Tren
    timeSlots = Array.from({ length: 3 }, (_, i) => {
      const year = currentYear - (2 - i);
      return {
        key: `${year}`,
        label: `Tahun ${year}`
      };
    });
  }

  // 2. PEMROSESAN DATA AKTUAL & ANALISIS SUMBER BIAYA TERBANYAK
  const chartData = timeSlots.map(slot => {
    // Filter kandidat masuk sesuai slot waktu (Sama dengan Excel)
    const filteredCands = candidates.filter(c => {
      if (!c.appliedDate) return false;
      return slot.key.includes('-') 
        ? c.appliedDate.startsWith(slot.key)  // Cocokkan YYYY-MM
        : c.appliedDate.startsWith(slot.key); // Cocokkan YYYY saja
    });

    const totalCandidates = filteredCands.length;
    const costPerCandidate = 150000;
    const totalCost = totalCandidates * costPerCandidate;
    const hiredCount = filteredCands.filter(c => c.stage === 'Hired').length;

    // HITUNG SUMBER BIAYA PALING BANYAK (Breakdown per Departemen)
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

    // Cari tahu departemen mana yang paling boros / menyerap biaya terbanyak
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
      budget: timeframe === 'yearly' ? (hiringBudget || 50000000) * 12 : (hiringBudget || 50000000), // Budget disesuaikan skala tahunan
      candidatesCount: totalCandidates,
      hiredCount: hiredCount,
      topDeptName: topDepartment,
      topDeptCost: maxDeptCost,
      allDeptsBreakdown: deptCostMap // Simpan mentah untuk pop-up detail
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
      {/* Header & Filter Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Analisis Biaya Rekrutmen Finansial</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monitoring operasional anggaran rekrutmen aktual vs limit finansial</p>
        </div>
        
        {/* Tombol Filter Dinamis */}
        <div className="flex p-1 bg-slate-100 rounded-xl self-start sm:self-center">
          <button 
            onClick={() => setTimeframe('monthly')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeframe === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Bulan Ini
          </button>
          <button 
            onClick={() => setTimeframe('6months')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeframe === '6months' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            6 Bulan
          </button>
          <button 
            onClick={() => setTimeframe('yearly')} 
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${timeframe === 'yearly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Tahunan
          </button>
        </div>
      </div>

      {/* Teks Intelijen Analisis Cost Paling Banyak */}
      <div className="mb-4 p-4 bg-amber-50/60 border border-amber-100 rounded-2xl flex flex-col gap-1">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">💡 Ringkasan Deteksi Pengeluaran:</span>
        <p className="text-sm text-slate-600">
          Pada rentang yang dipilih, alokasi biaya rekrutmen tertinggi dominan diserap oleh Departemen: <strong className="text-indigo-700">{chartData[chartData.length - 1]?.topDeptName}</strong> dengan estimasi penyerapan dana senilai <strong className="text-slate-800">Rp {chartData[chartData.length - 1]?.topDeptCost.toLocaleString('id-ID')}</strong>.
        </p>
      </div>

      {/* Render Grafik Recharts */}
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

      {/* Popup Detail Pintar */}
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
