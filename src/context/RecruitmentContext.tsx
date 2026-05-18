import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Candidate, Job, Interview, candidates as initialCandidates, jobs as initialJobs, interviews as initialInterviews, SLAConfig } from '../data/mockData';

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
  // Persist semua data utama ke localStorage agar tidak hilang saat refresh
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('recruitflow_candidates');
    return saved ? JSON.parse(saved) : initialCandidates;
  });
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('recruitflow_jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });
  const [interviews, setInterviews] = useState<Interview[]>(() => {
    const saved = localStorage.getItem('recruitflow_interviews');
    return saved ? JSON.parse(saved) : initialInterviews;
  });

  // Sync data utama ke localStorage setiap kali berubah
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
  
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem('recruitflow_adminAccounts');
    return saved ? JSON.parse(saved) : defaultAdmins;
  });
  const [portalLinks, setPortalLinks] = useState<PortalLinkInfo[]>(() => {
    const saved = localStorage.getItem('recruitflow_portalLinks');
    return saved ? JSON.parse(saved) : defaultPortalLinks;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('recruitflow_notifications');
    return saved ? JSON.parse(saved) : defaultNotifications;
  });
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
  const canCreateJobs = currentAdmin ? true : false; 
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

  // Helper untuk menambah notifikasi
  const triggerNotification = (title: string, message: string, type: 'candidate' | 'interview' | 'system') => {
    const newId = Date.now();
    const notifItem: AppNotification = { id: newId, title, message, time: 'Baru saja', read: false, type };
    setNotifications(prev => [notifItem, ...prev]);
  };

  // Candidates
  const addCandidate = (candidateData: Omit<Candidate, 'id'>) => {
    const newId = Date.now();
    const newCandidate: Candidate = { ...candidateData, id: newId };
    setCandidates(prev => [newCandidate, ...prev]);
    
    // Add notification when a new candidate applies or is added
    triggerNotification('Lamaran Baru Masuk!', `${newCandidate.name} telah melamar posisi ${newCandidate.position}`, 'candidate');
  };

  const updateCandidate = (id: number, updatedFields: Partial<Candidate>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const deleteCandidate = (id: number) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  // Jobs
  const addJob = (jobData: Omit<Job, 'id'>) => {
    const newId = Date.now();
    const newJob: Job = { ...jobData, id: newId };
    setJobs(prev => [...prev, newJob]);
  };

  const updateJob = (id: number, updatedFields: Partial<Job>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updatedFields } : j));
  };

  const deleteJob = (id: number) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  // Interviews
  const addInterview = (interviewData: Omit<Interview, 'id'>) => {
    const newId = Date.now();
    const newInterview: Interview = { ...interviewData, id: newId };
    setInterviews(prev => [newInterview, ...prev]);

    triggerNotification('Jadwal Wawancara', `Wawancara dengan ${newInterview.candidateName} dijadwalkan pada ${newInterview.date}`, 'interview');
  };

  const updateInterview = (id: number, updatedFields: Partial<Interview>) => {
    setInterviews(prev => prev.map(i => i.id === id ? { ...i, ...updatedFields } : i));
  };

  const deleteInterview = (id: number) => {
    setInterviews(prev => prev.filter(i => i.id !== id));
  };

  // Admin Accounts CRUD
  const addAdminAccount = (account: Omit<AdminAccount, 'id'>) => {
    const newId = Date.now();
    setAdminAccounts(prev => [...prev, { ...account, id: newId }]);
  };

  const updateAdminAccount = (id: number, updatedFields: Partial<AdminAccount>) => {
    setAdminAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
  };

  const deleteAdminAccount = (id: number) => {
    setAdminAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Portal Links CRUD
  const addPortalLink = (portalLink: Omit<PortalLinkInfo, 'id' | 'isActive'>) => {
    const newId = Date.now();
    const isFirst = portalLinks.length === 0;
    setPortalLinks(prev => [...prev, { ...portalLink, id: newId, isActive: isFirst }]);
  };

  const updatePortalLink = (id: number, updatedFields: Partial<PortalLinkInfo>) => {
    setPortalLinks(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const deletePortalLink = (id: number) => {
    const filtered = portalLinks.filter(p => p.id !== id);
    if (filtered.length > 0 && !filtered.some(p => p.isActive)) {
      filtered[0].isActive = true;
    }
    setPortalLinks(filtered);
  };

  const setActivePortalLink = (id: number) => {
    setPortalLinks(prev => prev.map(p => ({
      ...p,
      isActive: p.id === id
    })));
  };

  // Utility: hitung jumlah pelamar berdasarkan data kandidat aktual
  const getJobApplicantCount = (jobTitle: string): number => {
    return candidates.filter(c =>
      c.position === jobTitle ||
      c.position.toLowerCase().includes(jobTitle.toLowerCase()) ||
      jobTitle.toLowerCase().includes(c.position.toLowerCase())
    ).length;
  };

  // Notifications
  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'read'>) => {
    const newId = Date.now();
    setNotifications(prev => [{ ...notification, id: newId, read: false }, ...prev]);
  };

  // Sync other states to local storage
  useEffect(() => { localStorage.setItem('recruitflow_adminAccounts', JSON.stringify(adminAccounts)); }, [adminAccounts]);
  useEffect(() => { localStorage.setItem('recruitflow_portalLinks', JSON.stringify(portalLinks)); }, [portalLinks]);
  useEffect(() => { localStorage.setItem('recruitflow_notifications', JSON.stringify(notifications)); }, [notifications]);

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
