import { Users, Briefcase, Calendar, TrendingUp, HeartPulse, X } from 'lucide-react';
import { useState } from 'react';
import { useRecruitment } from '../context/RecruitmentContext';


const stageColors: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-700',
  'Screening': 'bg-yellow-100 text-yellow-700',
  'Interview': 'bg-purple-100 text-purple-700',
  'Assessment': 'bg-orange-100 text-orange-700',
  'Offer': 'bg-emerald-100 text-emerald-700',
  'Medical': 'bg-cyan-100 text-cyan-700',
  'Hired': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
};

export function StatsCards() {
  const { candidates, jobs, interviews } = useRecruitment();
  const [popup, setPopup] = useState<{ title: string; items: { label: string; sub: string; badge?: string }[] } | null>(null);

  const totalCandidates = candidates.length;
  const activeJobs = jobs.filter(j => j.status === 'Active').length;
  const scheduledInterviews = interviews.filter(i => i.status === 'Scheduled').length;
  const hiredThisMonth = candidates.filter(c => c.stage === 'Hired').length;
  const medicalCount = candidates.filter(c => c.stage === 'Medical').length;

  const openPopup = (type: string) => {
    let title = '';
    let items: { label: string; sub: string; badge?: string }[] = [];

    if (type === 'candidates') {
      title = `Total Kandidat (${totalCandidates})`;
      items = candidates.map(c => ({ label: c.name, sub: c.position, badge: c.stage }));
    } else if (type === 'jobs') {
      title = `Lowongan Aktif (${activeJobs})`;
      items = jobs.filter(j => j.status === 'Active').map(j => ({ label: j.title, sub: `${j.department} • ${j.location}`, badge: j.status }));
    } else if (type === 'interviews') {
      title = `Wawancara Terjadwal (${scheduledInterviews})`;
      items = interviews.filter(i => i.status === 'Scheduled').map(i => ({ label: i.candidateName, sub: `${i.date} pukul ${i.time} — ${i.interviewer}`, badge: i.type }));
    } else if (type === 'medical') {
      title = `Medical Check-up (${medicalCount})`;
      items = candidates.filter(c => c.stage === 'Medical').map(c => ({ label: c.name, sub: c.position, badge: 'Medical' }));
    } else if (type === 'hired') {
      title = `Diterima / Hired (${hiredThisMonth})`;
      items = candidates.filter(c => c.stage === 'Hired').map(c => ({ label: c.name, sub: `${c.position} — Hired: ${c.hiredDate || '-'}`, badge: 'Hired' }));
    }
    setPopup({ title, items });
  };

  const stats = [
    { key: 'candidates', title: 'Total Kandidat', value: totalCandidates, icon: Users, gradient: 'from-indigo-500 to-indigo-600' },
    { key: 'jobs', title: 'Lowongan Aktif', value: activeJobs, icon: Briefcase, gradient: 'from-purple-500 to-purple-600' },
    { key: 'interviews', title: 'Wawancara Terjadwal', value: scheduledInterviews, icon: Calendar, gradient: 'from-amber-500 to-orange-500' },
    { key: 'medical', title: 'Medical Check-up', value: medicalCount, icon: HeartPulse, gradient: 'from-cyan-500 to-blue-500' },
    { key: 'hired', title: 'Diterima (Hired)', value: hiredThisMonth, icon: TrendingUp, gradient: 'from-emerald-500 to-green-600' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              onClick={() => openPopup(stat.key)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500">
                  Aktual
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
              <p className="text-[10px] text-indigo-400 font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk detail →</p>
            </div>
          );
        })}
      </div>

      {/* Popup Detail */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800">{popup.title}</h3>
              <button onClick={() => setPopup(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {popup.items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Tidak ada data</div>
              ) : (
                popup.items.map((item, idx) => (
                  <div key={idx} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.label}</p>
                        <p className="text-xs text-slate-500 truncate">{item.sub}</p>
                      </div>
                      {item.badge && (
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ml-2 shrink-0 ${stageColors[item.badge] || 'bg-slate-100 text-slate-600'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
