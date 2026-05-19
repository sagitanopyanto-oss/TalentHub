import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { useRecruitment } from '../context/RecruitmentContext';

function formatRupiah(num: number) {
  return `Rp ${num.toLocaleString('id-ID')}`;
}

// Helper untuk menghitung data bulanan dari kandidat aktual
function getMonthlyDataFromCandidates(candidates: any[]) {
  const monthlyData: Record<string, { applications: number; hires: number }> = {};

  candidates.forEach(c => {
    // Hitung aplikasi berdasarkan applied_date
    if (c.appliedDate) {
      const d = new Date(c.appliedDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { applications: 0, hires: 0 };
      monthlyData[key].applications += 1;
    }

    // Hitung hire berdasarkan hired_date
    if (c.hiredDate && c.stage === 'Hired') {
      const d = new Date(c.hiredDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { applications: 0, hires: 0 };
      monthlyData[key].hires += 1;
    }
  });

  // Ubah ke format array dengan label bulan yang rapi
  return Object.keys(monthlyData)
    .sort()
    .map(key => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return {
        'Bulan': `${monthNames[parseInt(month) - 1]} ${year}`,
        'Jumlah Lamaran': monthlyData[key].applications,
        'Jumlah Diterima (Hired)': monthlyData[key].hires,
      };
    });
}

// PERBAIKAN: Helper untuk menghitung rekrutmen per departemen dengan mencocokkan master data lowongan (jobs)
function getDepartmentDataFromCandidates(candidates: any[], jobs: any[]) {
  const deptData: Record<string, { hires: number; totalApplicants: number }> = {};

  candidates.forEach(c => {
    // Jalur 1: Mengambil terus jika kandidat sudah memiliki properti department
    let dept = c.department;

    // Jalur 2: Jika kosong, cari departemen berdasarkan nama Posisi/Job dari data master lowongan (cross-role admin)
    if (!dept && c.position) {
      const matchedJob = jobs.find(j => j.title?.toLowerCase().trim() === c.position?.toLowerCase().trim());
      if (matchedJob) {
        dept = matchedJob.department;
      }
    }

    // Jalur 3: Fallback ke kategori 'Lainnya' jika tetap tidak berpadanan
    dept = dept || 'Lainnya';

    if (!deptData[dept]) {
      deptData[dept] = { hires: 0, totalApplicants: 0 };
    }
    
    deptData[dept].totalApplicants += 1;
    if (c.stage === 'Hired') {
      deptData[dept].hires += 1;
    }
  });

  return Object.keys(deptData).map(dept => ({
    'Departemen': dept,
    'Diterima (Hired)': deptData[dept].hires,
    'Total Pelamar': deptData[dept].totalApplicants,
  }));
}

// Helper untuk menghitung estimasi biaya rekrutmen aktual per kandidat
function getCostHiringData(candidates: any[]) {
  const monthlyCost: Record<string, { candidates: number; hired: number }> = {};

  candidates.forEach(c => {
    if (c.appliedDate) {
      const d = new Date(c.appliedDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyCost[key]) monthlyCost[key] = { candidates: 0, hired: 0 };
      
      monthlyCost[key].candidates += 1;
      if (c.stage === 'Hired') {
        monthlyCost[key].hired += 1;
      }
    }
  });

  return Object.keys(monthlyCost)
    .sort()
    .map(key => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      const totalCandidates = monthlyCost[key].candidates;
      const hiredCount = monthlyCost[key].hired;
      
      // Rumus estimasi biaya (disinkronkan dengan ApplicationChart.tsx)
      const costPerCandidate = 150000; 
      const estimatedCost = totalCandidates * costPerCandidate;
      
      return {
        'Bulan': `${monthNames[parseInt(month) - 1]} ${year}`,
        'Total Kandidat': totalCandidates,
        'Estimasi Total Biaya': formatRupiah(estimatedCost),
        'Jumlah Diterima (Hired)': hiredCount,
        'Rata-rata Biaya per Kandidat': formatRupiah(costPerCandidate),
        'Rata-rata Biaya per Hired': hiredCount > 0 ? formatRupiah(estimatedCost / hiredCount) : 'Rp 0',
      };
    });
}

export function ExportExcel() {
  const { candidates, jobs } = useRecruitment(); // Mengambil data master lowongan dan pelamar

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan Umum (Overview KPI)
    const totalApplicants = candidates.length;
    const totalHired = candidates.filter(c => c.stage === 'Hired').length;
    const totalActiveJobs = jobs.filter(j => j.status === 'Active').length;
    const selectionRate = totalApplicants > 0 ? ((totalHired / totalApplicants) * 100).toFixed(1) + '%' : '0%';

    const overviewData = [
      { 'Metrik HR': 'Total Pelamar Masuk', 'Nilai': totalApplicants },
      { 'Metrik HR': 'Kandidat Diterima (Hired)', 'Nilai': totalHired },
      { 'Metrik HR': 'Lowongan Pekerjaan Aktif', 'Nilai': totalActiveJobs },
      { 'Metrik HR': 'Rasio Penerimaan (Selection Rate)', 'Nilai': selectionRate }
    ];
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Ringkasan Eksekutif');

    // Sheet 2: Data Pelamar Tahap Akhir (Hired)
    const hiredCandidates = candidates
      .filter(c => c.stage === 'Hired')
      .map((c, index) => ({
        'No': index + 1,
        'Nama Pelamar': c.name,
        'Email': c.email,
        'No. Telepon': c.phone,
        'Posisi': c.position,
        'Pendidikan': `${c.education} - ${c.educationMajor}`,
        'Pengalaman': c.experience,
        'Tanggal Melamar': c.appliedDate || '-',
        'Tanggal Diterima': c.hiredDate || '-'
      }));
    const wsHired = hiredCandidates.length > 0 
      ? XLSX.utils.json_to_sheet(hiredCandidates)
      : XLSX.utils.json_to_sheet([{ 'Pesan': 'Belum ada pelamar dengan status Hired' }]);
    XLSX.utils.book_append_sheet(wb, wsHired, 'Kandidat Lolos (Hired)');

    // Sheet 3: Semua Data Pelamar (All Applicants)
    const allCandidatesData = candidates.map((c, index) => ({
      'No': index + 1,
      'Nama Pelamar': c.name,
      'Email': c.email,
      'No. Telepon': c.phone,
      'Posisi Dilamar': c.position,
      'Pendidikan': c.education,
      'Jurusan': c.educationMajor,
      'Pengalaman Kerja': c.experience,
      'Status Kerja Saat Ini': c.workStatus === 'Working' ? 'Masih Bekerja' : 'Tidak Bekerja',
      'Ekspektasi Gaji': c.expectedSalary,
      'Status Tahapan': c.stage,
      'Tanggal Melamar': c.appliedDate || '-'
    }));
    const wsAll = allCandidatesData.length > 0 
      ? XLSX.utils.json_to_sheet(allCandidatesData)
      : XLSX.utils.json_to_sheet([{ 'Pesan': 'Belum ada data pelamar' }]);
    XLSX.utils.book_append_sheet(wb, wsAll, 'Semua Pelamar');

    // Sheet 4: Master Data Lowongan Kerja (All Jobs across Roles)
    const allJobsData = jobs.map((j, index) => ({
      'No': index + 1,
      'Judul Lowongan': j.title,
      'Departemen': j.department,
      'Lokasi': j.location,
      'Tipe Kontrak': j.type,
      'Status': j.status,
      'Rentang Gaji': j.hiddenSalary ? 'Dirahasiakan' : `Rp ${j.minSalary.toLocaleString('id-ID')} - Rp ${j.maxSalary.toLocaleString('id-ID')}`,
      'Tanggal Dibuat': j.postedDate || '-'
    }));
    const wsJobs = allJobsData.length > 0 
      ? XLSX.utils.json_to_sheet(allJobsData)
      : XLSX.utils.json_to_sheet([{ 'Pesan': 'Belum ada data lowongan kerja' }]);
    XLSX.utils.book_append_sheet(wb, wsJobs, 'Master Lowongan Kerja');

    // Sheet 5: Tren Bulanan Aktual
    const monthlyData = getMonthlyDataFromCandidates(candidates);
    const wsMonthly = monthlyData.length > 0 
      ? XLSX.utils.json_to_sheet(monthlyData)
      : XLSX.utils.json_to_sheet([{ 'Bulan': '-', 'Jumlah Lamaran': 0, 'Jumlah Diterima (Hired)': 0 }]);
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'Tren Bulanan Aktual');

    // Sheet 6: Departemen Aktual (PERBAIKAN: Mengirimkan parameter `jobs`)
    const deptData = getDepartmentDataFromCandidates(candidates, jobs);
    const wsDept = deptData.length > 0 
      ? XLSX.utils.json_to_sheet(deptData)
      : XLSX.utils.json_to_sheet([{ 'Departemen': '-', 'Diterima (Hired)': 0, 'Total Pelamar': 0 }]);
    XLSX.utils.book_append_sheet(wb, wsDept, 'Departemen Aktual');

    // Sheet 7: Cost Hiring Aktual
    const costData = getCostHiringData(candidates);
    const wsCost = costData.length > 0 
      ? XLSX.utils.json_to_sheet(costData)
      : XLSX.utils.json_to_sheet([{ 'Bulan': '-', 'Total Kandidat': 0, 'Estimasi Total Biaya': '-', 'Jumlah Diterima (Hired)': 0, 'Rata-rata Biaya per Kandidat': '-', 'Rata-rata Biaya per Hired': '-' }]);
    XLSX.utils.book_append_sheet(wb, wsCost, 'Cost Hiring Aktual');

    // Proses Muat Turun (Download) Fail Excel
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `TalentHub_Recruitment_Report_${today}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-100 group"
    >
      <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
      Export Ringkasan Excel (.xlsx)
    </button>
  );
}
