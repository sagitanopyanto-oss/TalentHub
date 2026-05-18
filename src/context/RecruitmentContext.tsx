import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Candidate, Job, Interview, candidates as initialCandidates, jobs as initialJobs, interviews as initialInterviews, SLAConfig } from '../data/mockData';
// Import client Supabase yang sudah kita set-up sebelumnya
import { supabase } from '../config/supabase';

const defaultSlaConfig: SLAConfig[] = [
  { stage: 'Screening',   slaDays: 5,  color: '#8b5cf6' },
  { stage: 'Interview',   slaDays: 7,  color: '#a78bfa' },
  { stage: 'Assessment',  slaDays: 5,  color: '#f59e0b' },
  { stage: 'Offer',       slaDays: 3,  color: '#22c55e' },
  { stage: 'Medical',     slaDays: 5,  color: '#06b6d4' },
  { stage: 'Hired',       slaDays: 0,  color: '#10b981' },
];

export interface AdminAccount {
  id: number;
  username: string;
  password: string;
  role: string;
}

export interface PortalLinkInfo {
  id: number;
  portalName: string;
  companyName: string;
  companyLogo: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutCompany: string;
  isActive: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'candidate' | 'interview' | 'system';
}

interface RecruitmentContextType {
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'avatar'>) => Promise<void>;
  updateCandidate: (id: number, updated: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: number) => Promise<void>;
  
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'>) => Promise<void>;
  updateJob: (id: number, updated: Partial<Job>) => Promise<void>;
  deleteJob: (id: number) => Promise<void>;
  
  interviews: Interview[];
  addInterview: (interview: Omit<Interview, 'id'>) => Promise<void>;
  updateInterview: (id: number, updated: Partial<Interview>) => Promise<void>;
  deleteInterview: (id: number) => Promise<void>;

  isAdmin: boolean;
  currentAdmin: AdminAccount | null;
  canCreateOrDelete: boolean;
  canCreateJobs: boolean;
  canAccessSettings: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  adminAccounts: AdminAccount[];
  addAdminAccount: (account: Omit<AdminAccount, 'id'>) => void;
  updateAdminAccount: (id: number, updated: Partial<AdminAccount>) => void;
  deleteAdminAccount: (id: number) => void;
  
  portalLinks: PortalLinkInfo[];
  addPortalLink: (link: Omit<PortalLinkInfo, 'id'>) => void;
  updatePortalLink: (id: number, updated: Partial<PortalLinkInfo>) => void;
  deletePortalLink: (id: number) => void;
  setActivePortalLink: (id: number) => void;
  
  getJobApplicantCount: (jobTitle: string) => number;
  selectedJobIdForApply: number | null;
  setSelectedJobIdForApply: (id: number | null) => void;
  
  notifications: AppNotification[];
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (title: string, message: string, type: 'candidate' | 'interview' | 'system') => void;
  
  hiringBudget: number;
  setHiringBudget: (budget: number) => void;
  slaConfig: SLAConfig[];
  updateSlaConfig: (stage: string, days: number) => void;
  systemSettings: { companyName: string; allowPublicApply: boolean; autoNotification: boolean };
  setSystemSettings: (settings: { companyName: string; allowPublicApply: boolean; autoNotification: boolean }) => void;
  isLoading: boolean;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export function RecruitmentProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- State Utama Terkoneksi Supabase ---
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  // --- State Konfigurasi & Admin (Tetap menggunakan LocalStorage) ---
  const [isAdmin, setIsAdmin] = useState<boolean>(() => sessionStorage.getItem('recruitflow_isAdmin') === 'true');
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    const saved = sessionStorage.getItem('recruitflow_currentAdmin');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem('recruitflow_adminAccounts');
    return saved ? JSON.parse(saved) : [
      { id: 1, username: 'admin', password: 'admin123', role: 'Super Admin' },
      { id: 2, username: 'hr_recruiter', password: 'hr123', role: 'Recruiter' },
      { id: 3, username: 'hr_interviewer', password: 'user123', role: 'Interviewer' }
    ];
  });

  const [portalLinks, setPortalLinks] = useState<PortalLinkInfo[]>(() => {
    const saved = localStorage.getItem('recruitflow_portalLinks');
    return saved ? JSON.parse(saved) : [
      { id: 1, portalName: 'Portal Utama', companyName: 'NexaTech Industries', companyLogo: 'NT', heroTitle: 'Bangun Karir Masa Depan Anda Bersama Kami', heroSubtitle: 'Temukan lowongan pekerjaan terbaik yang sesuai dengan keahlian dan passion Anda.', aboutCompany: 'NexaTech Industries adalah perusahaan teknologi terkemuka yang berfokus pada solusi inovatif.', isActive: true }
    ];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('recruitflow_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedJobIdForApply, setSelectedJobIdForApply] = useState<number | null>(null);
  const [hiringBudget, setHiringBudget] = useState<number>(() => Number(localStorage.getItem('recruitflow_hiringBudget')) || 500000000);
  
  const [slaConfig, setSlaConfig] = useState<SLAConfig[]>(() => {
    const saved = localStorage.getItem('recruitflow_slaConfig');
    return saved ? JSON.parse(saved) : defaultSlaConfig;
  });

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('recruitflow_systemSettings');
    return saved ? JSON.parse(saved) : { companyName: 'NexaTech Industries', allowPublicApply: true, autoNotification: true };
  });

  // --- Fungsi Hak Akses Admin ---
  const canCreateOrDelete = currentAdmin?.role === 'Super Admin' || currentAdmin?.role === 'Recruiter';
  const canCreateJobs = currentAdmin?.role === 'Super Admin' || currentAdmin?.role === 'Recruiter';
  const canAccessSettings = currentAdmin?.role === 'Super Admin';

  // =========================================================
  // ⚡ PROSES FETCH DATA REAL-TIME DARI SUPABASE
  // =========================================================
  useEffect(() => {
    async function fetchDatabaseData() {
      setIsLoading(true);
      try {
        // 1. Ambil data kandidat
        const { data: dbCandidates, error: candError } = await supabase.from('candidates').select('*');
        if (!candError && dbCandidates) {
          setCandidates(dbCandidates);
        } else {
          setCandidates(initialCandidates); // Fallback jika tabel kosong/error
        }

        // 2. Ambil data lowongan (jobs)
        const { data: dbJobs, error: jobsError } = await supabase.from('jobs').select('*');
        if (!jobsError && dbJobs) {
          setJobs(dbJobs);
        } else {
          setJobs(initialJobs);
        }

        // 3. Ambil data wawancara (interviews)
        const { data: dbInterviews, error: intError } = await supabase.from('interviews').select('*');
        if (!intError && dbInterviews) {
          setInterviews(dbInterviews);
        } else {
          setInterviews(initialInterviews);
        }
      } catch (err) {
        console.error('Gagal memuat data dari Supabase, beralih ke data lokal:', err);
        setCandidates(initialCandidates);
        setJobs(initialJobs);
        setInterviews(initialInterviews);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDatabaseData();
  }, []);

  // =========================================================
  // 💾 PROSES MUTASI DATA (CRUD) KE SUPABASE
  // =========================================================
  
  // CANDIDATES CRUD
  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'avatar'>) => {
    const avatarLetter = candidateData.name ? candidateData.name.charAt(0).toUpperCase() : 'C';
    const newRecord = { ...candidateData, avatar: avatarLetter };
    
    const { data, error } = await supabase.from('candidates').insert([newRecord]).select();
    if (!error && data) {
      setCandidates(prev => [...prev, data[0]]);
      addNotification('Kandidat Baru', `${candidateData.name} melamar posisi ${candidateData.position}`, 'candidate');
    } else {
      console.error('Gagal menyimpan kandidat ke Supabase:', error);
    }
  };

  const updateCandidate = async (id: number, updatedFields: Partial<Candidate>) => {
    const { error } = await supabase.from('candidates').update(updatedFields).eq('id', id);
    if (!error) {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    } else {
      console.error('Gagal memperbarui kandidat di Supabase:', error);
    }
  };

  const deleteCandidate = async (id: number) => {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (!error) {
      setCandidates(prev => prev.filter(c => c.id !== id));
    } else {
      console.error('Gagal menghapus kandidat di Supabase:', error);
    }
  };

  // JOBS CRUD
  const addJob = async (jobData: Omit<Job, 'id'>) => {
    const { data, error } = await supabase.from('jobs').insert([jobData]).select();
    if (!error && data) {
      setJobs(prev => [...prev, data[0]]);
      addNotification('Lowongan Baru', `Lowongan baru "${jobData.title}" telah dibuka.`, 'system');
    }
  };

  const updateJob = async (id: number, updatedFields: Partial<Job>) => {
    const { error } = await supabase.from('jobs').update(updatedFields).eq('id', id);
    if (!error) {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updatedFields } : j));
    }
  };

  const deleteJob = async (id: number) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (!error) {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  // INTERVIEWS CRUD
  const addInterview = async (interviewData: Omit<Interview, 'id'>) => {
    const { data, error } = await supabase.from('interviews').insert([interviewData]).select();
    if (!error && data) {
      setInterviews(prev => [...prev, data[0]]);
      addNotification('Jadwal Wawancara', `Wawancara dijadwalkan untuk ${interviewData.candidateName}`, 'interview');
    }
  };

  const updateInterview = async (id: number, updatedFields: Partial<Interview>) => {
    const { error } = await supabase.from('interviews').update(updatedFields).eq('id', id);
    if (!error) {
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, ...updatedFields } : i));
    }
  };

  const deleteInterview = async (id: number) => {
    const { error } = await supabase.from('interviews').delete().eq('id', id);
    if (!error) {
      setInterviews(prev => prev.filter(i => i.id !== id));
    }
  };

  // --- Fungsi Autentikasi Admin ---
  const login = (username: string, password: string): boolean => {
    const account = adminAccounts.find(a => a.username === username && a.password === password);
    if (account) {
      setIsAdmin(true);
      setCurrentAdmin(account);
      sessionStorage.setItem('recruitflow_isAdmin', 'true');
      sessionStorage.setItem('recruitflow_currentAdmin', JSON.stringify(account));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setCurrentAdmin(null);
    sessionStorage.removeItem('recruitflow_isAdmin');
    sessionStorage.removeItem('recruitflow_currentAdmin');
  };

  // --- Pengaturan Komponen Pembantu Lainnya (Lokal) ---
  const addAdminAccount = (acc: Omit<AdminAccount, 'id'>) => {
    const newAcc = { ...acc, id: adminAccounts.length > 0 ? Math.max(...adminAccounts.map(a=>a.id)) + 1 : 1 };
    setAdminAccounts(prev => [...prev, newAcc]);
  };
  const updateAdminAccount = (id: number, updated: Partial<AdminAccount>) => {
    setAdminAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };
  const deleteAdminAccount = (id: number) => {
    setAdminAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addPortalLink = (link: Omit<PortalLinkInfo, 'id'>) => {
    const newLink = { ...link, id: portalLinks.length > 0 ? Math.max(...portalLinks.map(p=>p.id)) + 1 : 1 };
    setPortalLinks(prev => [...prev, newLink]);
  };
  const updatePortalLink = (id: number, updated: Partial<PortalLinkInfo>) => {
    setPortalLinks(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };
  const deletePortalLink = (id: number) => {
    setPortalLinks(prev => prev.filter(p => p.id !== id));
  };
  const setActivePortalLink = (id: number) => {
    setPortalLinks(prev => prev.map(p => ({ ...p, isActive: p.id === id })));
  };

  const getJobApplicantCount = (jobTitle: string) => {
    return candidates.filter(c => c.position.toLowerCase() === jobTitle.toLowerCase()).length;
  };

  const addNotification = (title: string, message: string, type: 'candidate' | 'interview' | 'system') => {
    const newNotif: AppNotification = {
      id: Date.now(),
      title,
      message,
      time: 'Baru saja',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateSlaConfig = (stage: string, days: number) => {
    setSlaConfig(prev => prev.map(s => s.stage === stage ? { ...s, slaDays: days } : s));
  };

  useEffect(() => { localStorage.setItem('recruitflow_adminAccounts', JSON.stringify(adminAccounts)); }, [adminAccounts]);
  useEffect(() => { localStorage.setItem('recruitflow_portalLinks', JSON.stringify(portalLinks)); }, [portalLinks]);
  useEffect(() => { localStorage.setItem('recruitflow_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('recruitflow_hiringBudget', hiringBudget.toString()); }, [hiringBudget]);
  useEffect(() => { localStorage.setItem('recruitflow_slaConfig', JSON.stringify(slaConfig)); }, [slaConfig]);
  useEffect(() => { localStorage.setItem('recruitflow_systemSettings', JSON.stringify(systemSettings)); }, [systemSettings]);

  return (
    <RecruitmentContext.Provider value={{
      candidates, addCandidate, updateCandidate, deleteCandidate,
      jobs, addJob, updateJob, deleteJob,
      interviews, addInterview, updateInterview, deleteInterview,
      isAdmin, currentAdmin, canCreateOrDelete, canCreateJobs, canAccessSettings, login, logout,
      adminAccounts, addAdminAccount, updateAdminAccount, deleteAdminAccount,
      portalLinks, addPortalLink, updatePortalLink, deletePortalLink, setActivePortalLink,
      getJobApplicantCount,
      selectedJobIdForApply, setSelectedJobIdForApply,
      notifications, markNotificationAsRead, markAllNotificationsAsRead, addNotification,
      hiringBudget, setHiringBudget,
      slaConfig, updateSlaConfig,
      systemSettings, setSystemSettings,
      isLoading
    }}>
      {children}
    </RecruitmentContext.Provider>
  );
}

export function useRecruitment() {
  const context = useContext(RecruitmentContext);
  if (context === undefined) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
}
