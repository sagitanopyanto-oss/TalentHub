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
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        'Bulan': `${monthNames[parseInt(month) - 1]} ${year}`,
        'Total Lamaran': monthlyData[key].applications,
        'Diterima (Hired)': monthlyData[key].hires,
      };
    });
}

// Helper untuk menghitung rekrutmen per departemen dari data kandidat aktual
function getDepartmentDataFromCandidates(candidates: any[]) {
  const deptData: Record<string, { hires: number; totalApplicants: number }> = {};

  candidates.forEach(c => {
    const dept = c.department || 'Lainnya';
    if (!deptData[dept]) deptData[dept] = { hires: 0, totalApplicants: 0 };
    deptData[dept].totalApplicants += 1;
    if (c.stage === 'Hired') deptData[dept].hires += 1;
  });

  return Object.keys(deptData).map(dept => ({
    'Departemen': dept,
    'Diterima (Hired)': deptData[dept].hires,
    'Total Pelamar': deptData[dept].totalApplicants,
  }));
}

// Helper untuk menghitung cost hiring dari data kandidat aktual
function getCostHiringData(candidates: any[]) {
  // Biaya estimasi per tahap (bisa disesuaikan)
  const costPerStage = {
    Applied: 50000,
    Screening: 100000,
    Interview: 250000,
    Assessment: 350000,
    Offer: 200000,
    Medical: 500000,
    Hired: 1000000,
  };

  const monthlyCost: Record<string, { totalCost: number; hiredCount: number; candidateCount: number }> = {};

  candidates.forEach(c => {
    // Gunakan applied_date untuk grouping bulan
    if (c.appliedDate) {
      const d = new Date(c.appliedDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyCost[key]) monthlyCost[key] = { totalCost: 0, hiredCount: 0, candidateCount: 0 };
      monthlyCost[key].candidateCount += 1;

      // Hitung total biaya berdasarkan tahap kandidat
      let candidateCost = 0;
      const stages = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired'];
      const candidateStageIdx = stages.indexOf(c.stage);
      for (let i = 0; i <= candidateStageIdx; i++) {
        const stage = stages[i] as keyof typeof costPerStage;
        if (costPerStage[stage]) candidateCost += costPerStage[stage];
      }
      monthlyCost[key].totalCost += candidateCost;
      if (c.stage === 'Hired') monthlyCost[key].hiredCount += 1;
    }
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return Object.keys(monthlyCost)
    .sort()
    .map(key => {
      const [year, month] = key.split('-');
      const data = monthlyCost[key];
      return {
        'Bulan': `${monthNames[parseInt(month) - 1]} ${year}`,
        'Total Kandidat': data.candidateCount,
        'Estimasi Total Biaya': formatRupiah(data.totalCost),
        'Jumlah Diterima (Hired)': data.hiredCount,
        'Rata-rata Biaya per Kandidat': data.candidateCount > 0 ? formatRupiah(Math.round(data.totalCost / data.candidateCount)) : '-',
        'Rata-rata Biaya per Hired': data.hiredCount > 0 ? formatRupiah(Math.round(data.totalCost / data.hiredCount)) : '-',
      };
    });
}

export function ExportExcel() {
  const { candidates, jobs, interviews, getJobApplicantCount } = useRecruitment();

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Kandidat (data lengkap dari database)
    const candidateRows = candidates.map(c => ({
      'ID': c.id,
      'Nama': c.name,
      'Email': c.email,
      'Telepon': c.phone || '-',
      'Jenis Kelamin': c.gender || '-',
      'Tempat Lahir': c.birthPlace || '-',
      'Tanggal Lahir': c.birthDate || '-',
      'Alamat Domisili': c.address || '-',
      'Posisi Dilamar': c.position,
      'Departemen': c.department,
      'Pendidikan': c.education || '-',
      'Jurusan': c.educationMajor || '-',
      'Pengalaman Kerja': c.experience || '-',
      'Jabatan Terakhir': c.lastPosition || '-',
      'Status Bekerja': c.workStatus || '-',
      'Tahap Rekrutmen': c.stage,
      'Rating ATS': c.rating,
      'Portfolio': c.portfolioLink || '-',
      'Cover Letter': c.coverLetter || '-',
      'Tanggal Melamar': c.appliedDate,
      'Tanggal Interview': c.interviewDate || '-',
      'Tanggal Assessment': c.assessmentDate || '-',
      'Tanggal Offering': c.offerDate || '-',
      'Tanggal Medical': c.medicalDate || '-',
      'Tanggal Diterima': c.hiredDate || '-',
      'Ekspektasi Gaji': c.expectedSalary ? formatRupiah(Number(c.expectedSalary)) : '-',
      'File CV': c.cvFileName || 'Tidak ada',
      'Link CV (Storage)': c.cvData && c.cvData.startsWith('http') ? c.cvData : '-',
    }));
    const wsCandidates = XLSX.utils.json_to_sheet(candidateRows);
    XLSX.utils.book_append_sheet(wb, wsCandidates, 'Kandidat');

    // Sheet 2: Lowongan
    const jobRows = jobs.map(j => ({
      'ID': j.id,
      'Judul': j.title,
      'Departemen': j.department,
      'Lokasi': j.location,
      'Tipe Kontrak': j.type,
      'Status': j.status,
      'Min Salary': formatRupiah(j.minSalary),
      'Max Salary': formatRupiah(j.maxSalary),
      'Gaji Tersembunyi': j.hiddenSalary ? 'Ya' : 'Tidak',
      'Jumlah Pelamar Aktual': getJobApplicantCount(j.title),
      'Tanggal Posting': j.postedDate,
      'Deskripsi Pekerjaan': j.jobDescription || '-',
      'Tugas & Tanggung Jawab': (j.responsibilities || []).join(' | '),
      'Kualifikasi': (j.qualifications || []).join(' | '),
      'Skills Wajib': (j.skills || []).join(', '),
      'Benefits': (j.benefits || []).join(' | '),
      'Pendidikan Minimum': j.preferredEducation || '-',
      'Jurusan Diharapkan': (j.preferredMajors || []).join(', '),
      'Pengalaman Minimum': j.preferredExperience || '-',
      'Jabatan Sebelumnya Relevan': (j.preferredLastPositions || []).join(', '),
    }));
    const wsJobs = XLSX.utils.json_to_sheet(jobRows);
    XLSX.utils.book_append_sheet(wb, wsJobs, 'Lowongan');

    // Sheet 3: Wawancara
    const interviewRows = interviews.map(i => ({
      'ID': i.id,
      'Kandidat': i.candidateName,
      'Posisi': i.position,
      'Tanggal Wawancara': i.date,
      'Waktu': i.time,
      'Tipe': i.type,
      'Status': i.status,
      'Pewawancara': i.interviewer,
    }));
    const wsInterviews = XLSX.utils.json_to_sheet(interviewRows);
    XLSX.utils.book_append_sheet(wb, wsInterviews, 'Wawancara');

    // Sheet 4: Pipeline Summary (data aktual)
    const stages = ['Applied', 'Screening', 'Interview', 'Assessment', 'Offer', 'Medical', 'Hired', 'Rejected'];
    const pipelineRows = stages.map(s => ({
      'Tahap': s,
      'Jumlah Kandidat Aktual': candidates.filter(c => c.stage === s).length,
    }));
    const wsPipeline = XLSX.utils.json_to_sheet(pipelineRows);
    XLSX.utils.book_append_sheet(wb, wsPipeline, 'Pipeline Aktual');

    // Sheet 5: Tren Bulanan (DIHITUNG DARI DATA AKTUAL)
    const monthlyData = getMonthlyDataFromCandidates(candidates);
    const wsMonthly = monthlyData.length > 0 
      ? XLSX.utils.json_to_sheet(monthlyData)
      : XLSX.utils.json_to_sheet([{ 'Bulan': '-', 'Total Lamaran': 0, 'Diterima (Hired)': 0 }]);
    XLSX.utils.book_append_sheet(wb, wsMonthly, 'Tren Bulanan Aktual');

    // Sheet 6: Departemen (DIHITUNG DARI DATA AKTUAL)
    const deptData = getDepartmentDataFromCandidates(candidates);
    const wsDept = deptData.length > 0 
      ? XLSX.utils.json_to_sheet(deptData)
      : XLSX.utils.json_to_sheet([{ 'Departemen': '-', 'Diterima (Hired)': 0, 'Total Pelamar': 0 }]);
    XLSX.utils.book_append_sheet(wb, wsDept, 'Departemen Aktual');

    // Sheet 7: Cost Hiring (DIHITUNG DARI DATA AKTUAL)
    const costData = getCostHiringData(candidates);
    const wsCost = costData.length > 0 
      ? XLSX.utils.json_to_sheet(costData)
      : XLSX.utils.json_to_sheet([{ 'Bulan': '-', 'Total Kandidat': 0, 'Estimasi Total Biaya': '-', 'Jumlah Diterima (Hired)': 0, 'Rata-rata Biaya per Kandidat': '-', 'Rata-rata Biaya per Hired': '-' }]);
    XLSX.utils.book_append_sheet(wb, wsCost, 'Cost Hiring Aktual');

    // Download dengan nama file dinamis
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `RecruitFlow_Export_Data_Aktual_${today}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
    >
      <Download size={16} />
      <span>Export Excel</span>
      <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-bold">.xlsx</span>
    </button>
  );
}
