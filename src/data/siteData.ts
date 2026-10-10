/**
 * DEFAULT content of the portfolio (used as a fallback / first-time starting point).
 * Once you sign in as admin on the live site, your edits are stored in Firebase
 * (Firestore) and replace these defaults for every visitor.
 */

export interface Project {
  id: string;
  title: string;
  description: string; // long text is fine – the card has a "Read more" toggle
  tags: string[];
  codeUrl: string;
  demoUrl?: string;
  iconText?: string;
}

export const SITE = {
  email: 'bhabennarzary96@gmail.com',
  github: 'https://github.com/bhoben001',
  linkedin: 'https://www.linkedin.com/in/bhoben-narzary/',
  x: 'https://x.com/bhaben001',
  /** Put your CV PDF inside the /public folder with exactly this name. */
  cvFile: 'Bhoben_Narzary_CV.pdf',
};

export const projects: Project[] = [
  // Example (copy, edit, and remove the comment markers):
  // {
  //   id: 'my-first-project',
  //   title: 'Library Management API',
  //   description: 'A REST API built with Spring Boot, Spring Security (JWT) and Spring Data JPA. ...',
  //   tags: ['Java', 'Spring Boot', 'MySQL'],
  //   codeUrl: 'https://github.com/bhoben001/library-api',
  //   demoUrl: 'https://example.com', // optional
  // },
];

export interface SkillGroup {
  title: string;
  skills: { name: string; color: string }[]; // color = any hex, e.g. '#60a5fa'
}

export interface ExperienceItem {
  title: string;
  subtitle: string;
  period: string;
  highlight?: boolean; // purple accent box
}

// To add a new technology, add a line like { name: 'Docker', color: '#38bdf8' } to a group.
export const skillGroups: SkillGroup[] = [
  {
    title: 'LANGUAGES',
    skills: [
      { name: 'Java', color: '#60a5fa' },
      { name: 'SQL', color: '#fbbf24' },
      { name: 'Git', color: '#f87171' },
    ],
  },
  {
    title: 'FRAMEWORKS',
    skills: [
      { name: 'Spring Boot', color: '#4ade80' },
      { name: 'Spring Security', color: '#c084fc' },
      { name: 'Spring Framework', color: '#38bdf8' },
    ],
  },
  {
    title: 'PERSISTENCE & TOOLS',
    skills: [
      { name: 'Spring Data JPA', color: '#f472b6' },
      { name: 'MySQL', color: '#a3e635' },
      { name: 'REST APIs / JSON', color: '#fb923c' },
    ],
  },
];

// Newest first.
export const experience: ExperienceItem[] = [
  { title: 'Backend Developer', subtitle: 'Independent Projects • Java & Spring Boot', period: '2026 – Present' },
  { title: 'Java & SQL', subtitle: 'Core OOP, Data Structures, Spring Data JPA & Spring Security', period: '2025 – 2026' },
  { title: 'Computer Science & Engineering', subtitle: 'Undergraduate • Software Systems', period: 'Present', highlight: true },
];

export interface SiteContent {
  projects: Project[];
  skillGroups: SkillGroup[];
  experience: ExperienceItem[];
}

/** Shown when Firebase is not configured or has no saved content yet. */
export const defaultContent: SiteContent = { projects, skillGroups, experience };

/** Only allow http(s) links so a bad value can never become a `javascript:` URL. */
export function safeUrl(url: string | undefined): string {
  if (!url) return '#';
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '#';
  } catch {
    return '#';
  }
}
