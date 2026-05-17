export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  education: string;
  educationMajor: string;
  experience: string;
  lastPosition: string;
  workStatus: string;
  portfolioLink: string;
  coverLetter: string;
  expectedSalary: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthDate: string;
  birthPlace: string;
  address: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Assessment' | 'Offer' | 'Medical' | 'Hired' | 'Rejected';
  avatar: string;
  appliedDate: string;
  rating: number;
  interviewDate: string;
  assessmentDate: string;
  offerDate: string;
  medicalDate: string;
  hiredDate: string;
  cvData: string;
  cvFileName: string;
}

export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  postedDate: string;
  status: 'Active' | 'Closed' | 'Draft';
  minSalary: number;
  maxSalary: number;
  hiddenSalary: boolean;
  jobDescription: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  benefits: string[];
  preferredEducation: string;
  preferredMajors: string[];
  preferredExperience: string;
  preferredLastPositions: string[];
}

export interface Interview {
  id: number;
  candidateName: string;
  position: string;
  date: string;
  time: string;
  type: 'Phone Screen' | 'Technical' | 'HR' | 'Final';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  interviewer: string;
}

export interface SLAConfig {
  stage: string;
  slaDays: number;
  color: string;
}

export const slaConfig: SLAConfig[] = [
  { stage: 'Screening',   slaDays: 5,  color: '#8b5cf6' },
  { stage: 'Interview',   slaDays: 7,  color: '#a78bfa' },
  { stage: 'Assessment',  slaDays: 5,  color: '#f59e0b' },
  { stage: 'Offer',       slaDays: 3,  color: '#22c55e' },
  { stage: 'Medical',     slaDays: 5,  color: '#06b6d4' },
  { stage: 'Hired',       slaDays: 0,  color: '#10b981' },
];

// Semua data awal dikosongkan — data akan terisi dinamis saat admin membuat lowongan dan pelamar mengirim lamaran
export const candidates: Candidate[] = [];
export const interviews: Interview[] = [];
export const jobs: Job[] = [];

export const monthlyApplications = [
  { month: 'Aug', applications: 0, hires: 0 },
  { month: 'Sep', applications: 0, hires: 0 },
  { month: 'Oct', applications: 0, hires: 0 },
  { month: 'Nov', applications: 0, hires: 0 },
  { month: 'Dec', applications: 0, hires: 0 },
  { month: 'Jan', applications: 0, hires: 0 },
];

export const departmentData = [
  { name: 'Engineering', hires: 0, openings: 0 },
  { name: 'Design',      hires: 0, openings: 0 },
  { name: 'Product',     hires: 0, openings: 0 },
  { name: 'Marketing',   hires: 0, openings: 0 },
  { name: 'Analytics',   hires: 0, openings: 0 },
  { name: 'HR',          hires: 0, openings: 0 },
];

export const costHiringData = [
  { month: 'Aug', cost: 0, hires: 0 },
  { month: 'Sep', cost: 0, hires: 0 },
  { month: 'Oct', cost: 0, hires: 0 },
  { month: 'Nov', cost: 0, hires: 0 },
  { month: 'Dec', cost: 0, hires: 0 },
  { month: 'Jan', cost: 0, hires: 0 },
];
