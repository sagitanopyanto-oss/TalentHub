import { Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx'; // Pastikan npm install xlsx
import { useRecruitment } from '../context/RecruitmentContext';

export function AdminActions() {
  const { candidates, setCandidates } = useRecruitment();

  // FUNGSI EXPORT: Mendownload seluruh data kandidat sebagai Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(candidates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataTransaksi");
    XLSX.writeFile(workbook, "TalentHub_Export_Data.xlsx");
  };

  // FUNGSI IMPORT: Mengunggah file dan memperbarui state global
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setCandidates(jsonData as any); // Update state global
      alert("Data berhasil diimport!");
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex gap-3">
      <button 
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors"
      >
        <Download size={16} /> Export Data
      </button>
      
      <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer">
        <Upload size={16} /> Import CSV
        <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImport} />
      </label>
    </div>
  );
}
