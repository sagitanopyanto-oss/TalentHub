import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Candidate, Job, Interview, SLAConfig } from '../data/mockData';
import { supabase, isSupabaseConnected } from '../config/supabase';

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
  companyLogo: string; // Base64 or URL
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

export interface SystemSettings {
  emailNotifications: boolean;
  autoScreening: boolean;
  calendarIntegration: boolean;
  medicalMandatory: boolean;
}

const defaultAdmins: AdminAccount[] = [
  { id: 1, username: 'superadmin', password: 'admin123', role: 'Super Admin' },
  { id: 2, username: 'admin', password: 'admin123', role: 'Admin' },
  { id: 3, username: 'recruiter', password: 'admin123', role: 'Recruiter' },
];

const defaultNotifications: AppNotification[] = [];

const defaultPortalLinks: PortalLinkInfo[] = [
  {
    id: 1,
    portalName: 'Portal Utama RecruitFlow',
    companyName: 'PT Teknologi Masa Depan (RecruitFlow)',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    heroTitle: 'Bergabunglah Bersama Kami! 🚀',
    heroSubtitle: 'Temukan peluang karir terbaik dan lamar posisi yang sesuai dengan kemampuan Anda di perusahaan kami.',
    aboutCompany: 'Kami adalah perusahaan teknologi terdepan yang berfokus pada inovasi, kolaborasi, dan pengembangan talenta digital berkelas dunia. Melalui solusi berbasis cloud, kami mentransformasi masa depan industri secara global.',
    isActive: true,
  },
  {
    id: 2,
    portalName: 'Portal Internship & Fresh Grad',
    companyName: 'RecruitFlow Campus Academy',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
    heroTitle: 'Mulai Karir Suksesmu Di Sini! 🎓',
    heroSubtitle: 'Program magang dan akselerasi karir khusus fresh graduate dengan bimbingan mentor berpengalaman.',
    aboutCompany: 'Program dedikasi untuk menjembatani dunia akademis dengan industri profesional melalui real-world projects, riset mutakhir, dan bimbingan eksklusif dari para pakar industri.',
    isActive: false,
  }
];

interface RecruitmentContextType {
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id'>) => void;
  updateCandidate: (id: number, candidate: Partial<Candidate>) => void;
  deleteCandidate: (id: number) => void;
  
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJob: (id: number, job: Partial<Job>) => void;
  deleteJob: (id: number) => void;

  interviews: Interview[];
  addInterview: (interview: Omit<Interview, 'id'>) => void;
  updateInterview: (id: number, interview: Partial<Interview>) => void;
  deleteInterview: (id: number) => void;

  // Auth
  isAdmin: boolean;
  currentAdmin: AdminAccount | null;
  canCreateOrDelete: boolean;   // Super Admin & HR Manager only (full delete access)
  canCreateJobs: boolean;       // All admin roles can create job postings
  canAccessSettings: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Admin Accounts CRUD
  adminAccounts: AdminAccount[];
  addAdminAccount: (account: Omit<AdminAccount, 'id'>) => void;
  updateAdminAccount: (id: number, account: Partial<AdminAccount>) => void;
  deleteAdminAccount: (id: number) => void;

  // Portal Links CRUD
  portalLinks: PortalLinkInfo[];
  addPortalLink: (portalLink: Omit<PortalLinkInfo, 'id' | 'isActive'>) => void;
  updatePortalLink: (id: number, portalLink: Partial<PortalLinkInfo>) => void;
  deletePortalLink: (id: number) => void;
  setActivePortalLink: (id: number) => void;

  // Utility
  getJobApplicantCount: (jobTitle: string) => number;

  // Navigation
  selectedJobIdForApply: number | null;
  setSelectedJobIdForApply: (id: number | null) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read'>) => void;

  // Budget
  hiringBudget: number;
  setHiringBudget: (budget: number) => void;

  // SLA Config
  slaConfig: SLAConfig[];
  updateSlaConfig: (newConfig: SLAConfig[]) => void;

  // System Settings
  systemSettings: SystemSettings;
  setSystemSettings: (settings: SystemSettings) => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export function RecruitmentProvider({ children }: { children: ReactNode }) {
  // 3.2: Ubah inisialisasi state menjadi kosong []
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  // Tetap sinkronkan ke localStorage sebagai cadangan lokal (opsional)
  useEffect(() => { localStorage.setItem('recruitflow_candidates', JSON.stringify(candidates)); }, [candidates]);
  useEffect(() => { localStorage.setItem('recruitflow_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('recruitflow_interviews', JSON.stringify(interviews)); }, [interviews]);
  
  // Persist login session across page refresh using sessionStorage
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('recruitflow_isAdmin');
    return saved === 'true';
  });
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    const saved = sessionStorage.getItem('recruitflow_currentAdmin');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedJobIdForApply, setSelectedJobIdForApply] = useState<number | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(defaultAdmins);
  const [portalLinks, setPortalLinks] = useState<PortalLinkInfo[]>(defaultPortalLinks);
  const [notifications, setNotifications] = useState<AppNotification[]>(defaultNotifications);
  const [hiringBudget, setHiringBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem('recruitflow_hiringBudget');
    return saved ? Number(saved) : 100000000;
  });

  const setHiringBudget = (budget: number) => {
    setHiringBudgetState(budget);
    localStorage.setItem('recruitflow_hiringBudget', String(budget));
  };

  const [slaConfig, setSlaConfigState] = useState<SLAConfig[]>(() => {
    const saved = localStorage.getItem('recruitflow_slaConfig');
    return saved ? JSON.parse(saved) : defaultSlaConfig;
  });

  const updateSlaConfig = (newConfig: SLAConfig[]) => {
    setSlaConfigState(newConfig);
    localStorage.setItem('recruitflow_slaConfig', JSON.stringify(newConfig));
  };

  // 3.3: Tambahkan Fungsi Fetch Data Awal & Real-Time Listener Supabase
  const fetchInitialData = async () => {
    if (!isSupabaseConnected) return;

    // Fetch Candidates
    const { data: candidatesData, error: candidatesError } = await supabase.from('candidates').select('*');
    if (candidatesError) console.error('Error fetching candidates:', candidatesError);
    else if (candidatesData) setCandidates(candidatesData as any);

    // Fetch Jobs
    const { data: jobsData, error: jobsError } = await supabase.from('jobs').select('*');
    if (jobsError) console.error('Error fetching jobs:', jobsError);
    else if (jobsData) setJobs(jobsData as any);

    // Fetch Interviews
    const { data: interviewsData, error: interviewsError } = await supabase.from('interviews').select('*');
    if (interviewsError) console.error('Error fetching interviews:', interviewsError);
    else if (interviewsData) setInterviews(interviewsData as any);
  };

  // Dengarkan perubahan di database secara real-time
  useEffect(() => {
    if (!isSupabaseConnected) return;

    fetchInitialData();

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, fetchInitialData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, fetchInitialData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, fetchInitialData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [systemSettings, setSystemSettingsState] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('recruitflow_systemSettings');
    return saved ? JSON.parse(saved) : { emailNotifications: true, autoScreening: false, calendarIntegration: true, medicalMandatory: true };
  });

  const setSystemSettings = (settings: SystemSettings) => {
    setSystemSettingsState(settings);
    localStorage.setItem('recruitflow_systemSettings', JSON.stringify(settings));
  };

  const canCreateOrDelete = currentAdmin ? (currentAdmin.role === 'Super Admin' || currentAdmin.role === 'HR Manager') : false;
  // Admin & Recruiter can CREATE job postings, but cannot delete
  const canCreateJobs = currentAdmin ? true : false; // All logged-in admin/recruiter roles can create jobs
  const canAccessSettings = currentAdmin ? (currentAdmin.role === 'Super Admin' || currentAdmin.role === 'HR Manager') : false;

  // Sync login state to sessionStorage so it survives page refresh
  useEffect(() => {
    sessionStorage.setItem('recruitflow_isAdmin', String(isAdmin));
    if (currentAdmin) {
      sessionStorage.setItem('recruitflow_currentAdmin', JSON.stringify(currentAdmin));
    } else {
      sessionStorage.removeItem('recruitflow_currentAdmin');
    }
  }, [isAdmin, currentAdmin]);

  // Auth
  const login = (username: string, password: string) => {
    const account = adminAccounts.find(a => a.username === username && a.password === password);
    if (account) {
      setIsAdmin(true);
      setCurrentAdmin(account);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setCurrentAdmin(null);
    sessionStorage.removeItem('recruitflow_isAdmin');
    sessionStorage.removeItem('recruitflow_currentAdmin');
    sessionStorage.removeItem('recruitflow_activeTab');
  };

  // ==========================================
  // ✍️ INTEGRASI CRUD SUPABASE DENGAN REALTIME (DAN FALLBACK LOKAL)
  // ==========================================

  // Helper untuk menambah notifikasi
  const triggerNotification = async (title: string, message: string, type: 'candidate' | 'interview' | 'system') => {
    const newId = Date.now();
    const notifItem: AppNotification = { id: newId, title, message, time: 'Baru saja', read: false, type };
    if (isSupabaseConnected) {
      await supabase.from('notifications').insert([notifItem]);
    } else {
      setNotifications(prev => [notifItem, ...prev]);
    }
  };

  // CANDIDATES CRUD
  const addCandidate = async (candidateData: Omit<Candidate, 'id'>) => {
    const newId = Date.now();
    const newCandidate: Candidate = { ...candidateData, id: newId };
    
    if (isSupabaseConnected) {
      const { error } = await supabase.from('candidates').insert([newCandidate]);
      if (error) console.error("Gagal insert kandidat:", error);
    } else {
      setCandidates(prev => [newCandidate, ...prev]);
    }
    await triggerNotification('Lamaran Baru Masuk!', `${newCandidate.name} telah melamar posisi ${newCandidate.position}`, 'candidate');
  };

  const updateCandidate = async (id: number, updatedFields: Partial<Candidate>) => {
    if (isSupabaseConnected) {
      await supabase.from('candidates').update(updatedFields).eq('id', id);
    } else {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    }
  };

  const deleteCandidate = async (id: number) => {
    if (isSupabaseConnected) {
      await supabase.from('candidates').delete().eq('id', id);
    } else {
      setCandidates(prev => prev.filter(c => c.id !== id));
    }
  };

  // JOBS CRUD
  const addJob = async (jobData: Omit<Job, 'id'>) => {
    const newId = Date.now();
    const newJob: Job = { ...jobData, id: newId };
    if (isSupabaseConnected) {
      await supabase.from('jobs').insert([newJob]);
    } else {
      setJobs(prev => [...prev, newJob]);
    }
  };

  const updateJob = async (id: number, updatedFields: Partial<Job>) => {
    if (isSupabaseConnected) {
      await supabase.from('jobs').update(updatedFields).eq('id', id);
    } else {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updatedFields } : j));
    }
  };

  const deleteJob = async (id: number) => {
    if (isSupabaseConnected) {
      await supabase.from('jobs').delete().eq('id', id);
    } else {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  // INTERVIEWS CRUD
  const addInterview = async (interviewData: Omit<Interview, 'id'>) => {
    const newId = Date.now();
    const newInterview: Interview = { ...interviewData, id: newId };
    if (isSupabaseConnected) {
      await supabase.from('interviews').insert([newInterview]);
    } else {
      setInterviews(prev => [newInterview, ...prev]);
    }
    await triggerNotification('Jadwal Wawancara', `Wawancara dengan ${newInterview.candidateName} dijadwalkan pada ${newInterview.date}`, 'interview');
  };

  const updateInterview = async (id: number, updatedFields: Partial<Interview>) => {
    if (isSupabaseConnected) {
      await supabase.from('interviews').update(updatedFields).eq('id', id);
    } else {
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, ...updatedFields } : i));
    }
  };

  const deleteInterview = async (id: number) => {
    if (isSupabaseConnected) {
      await supabase.from('interviews').delete().eq('id', id);
    } else {
      setInterviews(prev => prev.filter(i => i.id !== id));
    }
  };

  // ADMIN ACCOUNTS CRUD
  const addAdminAccount = async (account: Omit<AdminAccount, 'id'>) => {
    const newId = Date.now();
    if (isSupabaseConnected) {
      await supabase.from('admin_accounts').insert([{ ...account, id: newId }]);
    } else {
      setAdminAccounts(prev => [...prev, { ...account, id: newId }]);
    }
  };

  const updateAdminAccount = async (id: number, updatedFields: Partial<AdminAccount>) => {
    if (isSupabaseConnected) {
      await supabase.from('admin_accounts').update(updatedFields).eq('id', id);
    } else {
      setAdminAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    }
  };

  const deleteAdminAccount = async (id: number) => {
    if (isSupabaseConnected) {
      await supabase.from('admin_accounts').delete().eq('id', id);
    } else {
      setAdminAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  // PORTAL LINKS CRUD
  const addPortalLink = async (portalLink: Omit<PortalLinkInfo, 'id' | 'isActive'>) => {
    const newId = Date.now();
    const isFirst = portalLinks.length === 0;
    const newLink = { ...portalLink, id: newId, isActive: isFirst };
    if (isSupabaseConnected) {
      await supabase.from('portal_links').insert([newLink]);
    } else {
      setPortalLinks(prev => [...prev, newLink]);
    }
  };

  const updatePortalLink = async (id: number, updatedFields: Partial<PortalLinkInfo>) => {
    if (isSupabaseConnected) {
      await supabase.from('portal_links').update(updatedFields).eq('id', id);
    } else {
      setPortalLinks(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    }
  };

  const deletePortalLink = async (id: number) => {
    if (isSupabaseConnected) {
      await supabase.from('portal_links').delete().eq('id', id);
    } else {
      const filtered = portalLinks.filter(p => p.id !== id);
      if (filtered.length > 0 && !filtered.some(p => p.isActive)) filtered[0].isActive = true;
      setPortalLinks(filtered);
    }
  };

  const setActivePortalLink = async (id: number) => {
    if (isSupabaseConnected) {
      await supabase.from('portal_links').update({ isActive: false }).neq('id', id);
      await supabase.from('portal_links').update({ isActive: true }).eq('id', id);
    } else {
      setPortalLinks(prev => prev.map(p => ({ ...p, isActive: p.id === id })));
    }
  };

  // NOTIFICATIONS
  const markNotificationAsRead = async (id: number) => {
    if (isSupabaseConnected) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } else {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (isSupabaseConnected) {
      await supabase.from('notifications').update({ read: true }).eq('read', false);
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const addNotification = async (notification: Omit<AppNotification, 'id' | 'read'>) => {
    const newId = Date.now();
    const notifItem: AppNotification = { ...notification, id: newId, read: false };
    if (isSupabaseConnected) {
      await supabase.from('notifications').insert([notifItem]);
    } else {
      setNotifications(prev => [notifItem, ...prev]);
    }
  };

  // Utility: hitung jumlah pelamar berdasarkan data kandidat aktual
  const getJobApplicantCount = (jobTitle: string): number => {
    return candidates.filter(c =>
      c.position === jobTitle ||
      c.position.toLowerCase().includes(jobTitle.toLowerCase()) ||
      jobTitle.toLowerCase().includes(c.position.toLowerCase())
    ).length;
  };

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
      systemSettings, setSystemSettings
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
