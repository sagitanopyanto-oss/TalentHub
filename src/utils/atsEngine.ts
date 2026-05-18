// Jika suatu saat tipe data dipindah ke folder types global, Anda tinggal menyesuaikan import ini
import { Candidate, Job } from '../data/mockData';

// Peta level pendidikan untuk perhitungan skor
const educationLevels: Record<string, number> = {
  'SMA/SMK': 1, 'D3': 2, 'S1': 3, 'S2': 4, 'S3': 5,
};

// Peta level pengalaman untuk perhitungan skor
const experienceLevels: Record<string, number> = {
  'Fresh Graduate': 0, '1-2 tahun': 1, '3-5 tahun': 2, '5-10 tahun': 3, '> 10 tahun': 4,
};

export interface ATSResult {
  score: number;
  scoreCategory: 'Tinggi' | 'Sedang' | 'Rendah';
  scoreColor: 'emerald' | 'amber' | 'red';
  scoreBadge: string;

  educationMatch: { met: boolean; detail: string; candLevel: string; reqLevel: string };
  majorMatch: { met: boolean; detail: string; candMajor: string; relevantMajors: string[] };
  experienceMatch: { met: boolean; detail: string; candLevel: string; reqLevel: string };
  lastPositionMatch: { met: boolean; detail: string; candPosition: string; relevantPositions: string[] };
  workStatusMatch: { met: boolean; detail: string; status: string };

  matchedSkills: string[];
  missingSkills: string[];
  skillScore: number;

  matchedResponsibilities: string[];
  responsibilityScore: number;

  matchedQualifications: string[];
  qualificationScore: number;

  cvScore: number;

  summary: string;
  recommendation: string;
  strengthsArr: string[];
  weaknessesArr: string[];
  contactInfo: { phone: string; email: string; portfolio: string };
  appliedForJob: string;
}

/**
 * Helper: Cek apakah teks kandidat mengandung kata kunci (case-insensitive)
 * Aman dari error jika candidateText bernilai undefined/null
 */
function textContainsKeyword(candidateText: string | null | undefined, keyword: string): boolean {
  if (!candidateText) return false;
  return candidateText.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Helper: Hitung kata-kata penting dari kalimat tugas/kualifikasi
 * dan cek seberapa banyak yang ada di teks kandidat
 */
function calculateTextMatch(candidateText: string, sentences: string[] | null | undefined): { matched: string[]; score: number } {
  const matched: string[] = [];
  if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
    return { matched, score: 0 };
  }
  
  const text = candidateText.toLowerCase();

  sentences.forEach(sentence => {
    if (!sentence) return;
    
    // Ekstrak kata-kata penting (>4 huruf) dari kalimat
    const importantWords = sentence.toLowerCase()
      .replace(/[.,()/'\-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4 && !['untuk', 'dengan', 'dalam', 'serta', 'pada', 'menggunakan', 'minimum', 'pengalaman', 'tahun', 'minimal', 'memiliki', 'adalah', 'yang', 'atau', 'dari', 'oleh', 'tetapi', 'sebagai', 'menjabat'].includes(w));

    if (importantWords.length === 0) return;

    // Hitung berapa kata penting yang ada di teks kandidat
    const matchedWords = importantWords.filter(w => text.includes(w));
    // Jika minimal 30% kata penting cocok, anggap kalimat ini "matched"
    if (matchedWords.length / importantWords.length >= 0.3) {
      matched.push(sentence);
    }
  });

  const score = Math.round((matched.length / sentences.length) * 100);
  return { matched, score };
}

export function analyzeCandidateATS(candidate: Candidate, job: Job | undefined): ATSResult {
  // Gabung semua teks dari kandidat untuk pencarian kata kunci secara aman
  const candidateFullText = `
    ${candidate.coverLetter || ''}
    ${candidate.lastPosition || ''}
    ${candidate.educationMajor || ''}
    ${candidate.position || ''}
    ${candidate.department || ''}
    ${candidate.portfolioLink || ''}
  `.toLowerCase();

  // Jika lowongan tidak ditemukan atau tidak aktif, kembalikan skor minimal default secara aman
  if (!job) {
    return {
      score: 30,
      scoreCategory: 'Rendah',
      scoreColor: 'red',
      scoreBadge: 'Posisi tidak ditemukan (30%)',
      educationMatch: { met: false, detail: 'Tidak dapat dianalisis', candLevel: candidate.education || '-', reqLevel: '-' },
      majorMatch: { met: false, detail: 'Tidak dapat dianalisis', candMajor: candidate.educationMajor || '-', relevantMajors: [] },
      experienceMatch: { met: false, detail: 'Tidak dapat dianalisis', candLevel: candidate.experience || '-', reqLevel: '-' },
      lastPositionMatch: { met: false, detail: 'Tidak dapat dianalisis', candPosition: candidate.lastPosition || '-', relevantPositions: [] },
      workStatusMatch: { met: false, detail: 'Tidak dapat dianalisis', status: candidate.workStatus || '-' },
      matchedSkills: [], missingSkills: [], skillScore: 0,
      matchedResponsibilities: [], responsibilityScore: 0,
      matchedQualifications: [], qualificationScore: 0,
      cvScore: candidate.cvData ? 100 : 0,
      summary: `Posisi "${candidate.position || 'Unknown'}" yang dilamar tidak ditemukan dalam daftar lowongan aktif. Tidak dapat dilakukan analisis kecocokan.`,
      recommendation: 'Periksa kembali data posisi atau hubungi tim HR.',
      strengthsArr: [],
      weaknessesArr: ['Posisi lowongan tidak terdefinisi'],
      contactInfo: { phone: candidate.phone || '-', email: candidate.email || '-', portfolio: candidate.portfolioLink || '-' },
      appliedForJob: candidate.position || 'Unknown',
    };
  }

  // === 1. Analisis Pendidikan ===
  const candEduLevel = educationLevels[candidate.education || ''] || 0;
  const reqEduLevel = educationLevels[job.preferredEducation || ''] || 3;
  const educationMet = candEduLevel >= reqEduLevel;

  // === 2. Analisis Jurusan ===
  const candMajor = (candidate.educationMajor || '').toLowerCase();
  const preferredMajors = job.preferredMajors || [];
  const majorMet = preferredMajors.some(m => {
    if (!m) return false;
    const target = m.toLowerCase();
    return candMajor.includes(target) || target.includes(candMajor);
  });

  // === 3. Analisis Pengalaman ===
  const candExpLevel = experienceLevels[candidate.experience || ''] || 0;
  const reqExpLevel = experienceLevels[job.preferredExperience || ''] || 1;
  const experienceMet = candExpLevel >= reqExpLevel;

  // === 4. Analisis Jabatan Terakhir ===
  const candLastPos = (candidate.lastPosition || '').toLowerCase();
  const preferredLastPositions = job.preferredLastPositions || [];
  const lastPositionMet = preferredLastPositions.some(p => {
    if (!p) return false;
    const target = p.toLowerCase();
    return candLastPos.includes(target) || target.includes(candLastPos);
  });

  // === 5. Status Bekerja ===
  const workStatusMet = candidate.workStatus === 'Aktif Bekerja' || candidate.workStatus === 'Fresh Graduate';

  // === 6. Analisis Skills (kata kunci eksak) ===
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const jobSkills = job.skills || [];
  
  jobSkills.forEach(skill => {
    if (!skill) return;
    if (textContainsKeyword(candidateFullText, skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });
  const skillScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 50;

  // === 7. Analisis Tugas dan Tanggung Jawab ===
  const responsibilityResult = calculateTextMatch(candidateFullText, job.responsibilities);
  const matchedResponsibilities = responsibilityResult.matched;
  const responsibilityScore = responsibilityResult.score;

  // === 8. Analisis Kualifikasi ===
  const qualificationResult = calculateTextMatch(candidateFullText, job.qualifications);
  const matchedQualifications = qualificationResult.matched;
  const qualificationScore = qualificationResult.score;

  // === 9. CV Score ===
  const cvScore = candidate.cvData ? 100 : 0;

  // === 10. Total Score (weighted) ===
  const eduScore = educationMet ? 100 : Math.max(20, (candEduLevel / Math.max(reqEduLevel, 1)) * 60);
  const majorScore = majorMet ? 100 : 25;
  const expScore = experienceMet ? 100 : Math.max(15, (candExpLevel / Math.max(reqExpLevel, 1)) * 60);
  const lastPosScore = lastPositionMet ? 100 : 30;

  const totalScore = Math.round(
    (eduScore * 0.10) +
    (majorScore * 0.10) +
    (expScore * 0.15) +
    (lastPosScore * 0.15) +
    (skillScore * 0.25) +
    (responsibilityScore * 0.10) +
    (qualificationScore * 0.10) +
    (cvScore * 0.05)
  );

  // === 11. Kategori Skor ===
  let scoreCategory: 'Tinggi' | 'Sedang' | 'Rendah';
  let scoreColor: 'emerald' | 'amber' | 'red';
  let scoreBadge: string;

  if (totalScore >= 75) {
    scoreCategory = 'Tinggi';
    scoreColor = 'emerald';
    scoreBadge = `Sangat Cocok (${totalScore}%)`;
  } else if (totalScore >= 50) {
    scoreCategory = 'Sedang';
    scoreColor = 'amber';
    scoreBadge = `Cukup Cocok (${totalScore}%)`;
  } else {
    scoreCategory = 'Rendah';
    scoreColor = 'red';
    scoreBadge = `Kurang Cocok (${totalScore}%)`;
  }

  // === 12. Identifikasi Strengths & Weaknesses ===
  const strengthsArr: string[] = [];
  const weaknessesArr: string[] = [];

  if (educationMet) strengthsArr.push(`Pendidikan ${candidate.education} memenuhi syarat ${job.preferredEducation}`);
  else weaknessesArr.push(`Pendidikan ${candidate.education || 'tidak diisi'} di bawah syarat minimum ${job.preferredEducation}`);

  if (majorMet) strengthsArr.push(`Jurusan ${candidate.educationMajor} relevan dengan posisi`);
  else weaknessesArr.push(`Jurusan ${candidate.educationMajor || '-'} tidak termasuk dalam jurusan yang diutamakan`);

  if (experienceMet) strengthsArr.push(`Pengalaman ${candidate.experience} memenuhi standar`);
  else weaknessesArr.push(`Pengalaman ${candidate.experience || 'tidak diisi'} kurang dari yang dibutuhkan (${job.preferredExperience})`);

  if (lastPositionMet) strengthsArr.push(`Jabatan terakhir "${candidate.lastPosition}" sangat relevan`);
  else if (candidate.lastPosition && candidate.lastPosition !== '-') weaknessesArr.push(`Jabatan terakhir "${candidate.lastPosition}" kurang relevan dengan posisi`);
  else weaknessesArr.push('Belum memiliki pengalaman kerja sebelumnya');

  if (skillScore >= 70) strengthsArr.push(`Menguasai ${matchedSkills.length}/${jobSkills.length} skill teknis yang dibutuhkan`);
  else if (skillScore >= 40) weaknessesArr.push(`Hanya menguasai ${matchedSkills.length}/${jobSkills.length} skill teknis`);
  else weaknessesArr.push(`Sangat kurang dalam skill teknis (${matchedSkills.length}/${jobSkills.length})`);

  if (cvScore === 0) weaknessesArr.push('Belum mengunggah dokumen CV');

  // === 13. Ringkasan Dinamis ===
  let summary: string;
  let recommendation: string;

  if (totalScore >= 75) {
    summary = `Kandidat ${candidate.name} menunjukkan kecocokan TINGGI dengan posisi ${job.title}. Latar belakang pendidikan ${candidate.education} jurusan ${candidate.educationMajor} sesuai dengan kualifikasi. Pengalaman ${candidate.experience} sebagai ${candidate.lastPosition} sangat relevan. Menguasai ${matchedSkills.length} dari ${jobSkills.length} skill yang dibutuhkan (${skillScore}%) dan kemampuannya selaras dengan ${matchedResponsibilities.length}/${(job.responsibilities || []).length} tanggung jawab utama posisi ini.`;
    recommendation = 'STRONGLY RECOMMENDED. Kandidat layak diproses cepat ke tahap wawancara teknis. Profil sangat sesuai dengan kebutuhan tim.';
  } else if (totalScore >= 50) {
    summary = `Kandidat ${candidate.name} memiliki kecocokan SEDANG dengan posisi ${job.title}. ${educationMet ? '✓ Pendidikan' : '✗ Pendidikan'} ${candidate.education}/${candidate.educationMajor} ${majorMet ? 'relevan' : 'kurang relevan'}. Pengalaman ${candidate.experience} ${experienceMet ? 'memenuhi' : 'belum memenuhi'} standar. Skill yang dimiliki: ${matchedSkills.length}/${jobSkills.length} (${skillScore}%). Beberapa aspek perlu didalami lebih lanjut.`;
    recommendation = 'CONSIDER WITH CAUTION. Disarankan untuk wawancara screening awal guna mengevaluasi potensi pengembangan kandidat. Cocok jika dibutuhkan untuk posisi level lebih junior.';
  } else {
    summary = `Kandidat ${candidate.name} menunjukkan kecocokan RENDAH dengan posisi ${job.title}. ${!educationMet ? `Pendidikan ${candidate.education} di bawah minimum (${job.preferredEducation}). ` : ''}${!majorMet ? `Jurusan ${candidate.educationMajor || '-'} tidak relevan. ` : ''}${!experienceMet ? `Pengalaman ${candidate.experience} kurang dari ${job.preferredExperience}. ` : ''}Hanya menguasai ${matchedSkills.length}/${jobSkills.length} skill (${skillScore}%) dari yang dibutuhkan. Profil kandidat secara umum tidak sejalan dengan persyaratan kunci posisi.`;
    recommendation = 'NOT RECOMMENDED. Kandidat kurang sesuai untuk posisi ini. Pertimbangkan untuk menawarkan posisi alternatif yang lebih sesuai dengan profil.';
  }

  return {
    score: totalScore,
    scoreCategory,
    scoreColor,
    scoreBadge,
    educationMatch: {
      met: educationMet,
      detail: educationMet ? 'Memenuhi persyaratan' : `Di bawah minimum (${job.preferredEducation})`,
      candLevel: candidate.education || '-',
      reqLevel: job.preferredEducation || '-',
    },
    majorMatch: {
      met: majorMet,
      detail: majorMet ? 'Jurusan relevan' : 'Jurusan kurang relevan',
      candMajor: candidate.educationMajor || '-',
      relevantMajors: preferredMajors,
    },
    experienceMatch: {
      met: experienceMet,
      detail: experienceMet ? 'Memenuhi persyaratan' : 'Kurang dari yang dibutuhkan',
      candLevel: candidate.experience || '-',
      reqLevel: job.preferredExperience || '-',
    },
    lastPositionMatch: {
      met: lastPositionMet,
      detail: lastPositionMet ? 'Jabatan sebelumnya relevan' : 'Jabatan sebelumnya kurang relevan',
      candPosition: candidate.lastPosition || '-',
      relevantPositions: preferredLastPositions,
    },
    workStatusMatch: {
      met: workStatusMet,
      detail: workStatusMet ? 'Status sesuai' : 'Status perlu diperhatikan',
      status: candidate.workStatus || '-',
    },
    matchedSkills,
    missingSkills,
    skillScore,
    matchedResponsibilities,
    responsibilityScore,
    matchedQualifications,
    qualificationScore,
    cvScore,
    summary,
    recommendation,
    strengthsArr,
    weaknessesArr,
    contactInfo: {
      phone: candidate.phone || '-',
      email: candidate.email || '-',
      portfolio: candidate.portfolioLink || '-',
    },
    appliedForJob: job.title || 'Unknown',
  };
}
