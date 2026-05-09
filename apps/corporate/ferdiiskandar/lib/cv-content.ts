export const cvHero = {
  sectionLabel: 'Curriculum Vitae / Section 07',
  name: 'dr. Ferdi Iskandar',
  credentials: 'dr., SH, MKN, CLM, CMDC',
  title: 'Physician · Hospital CEO · AI Founder',
  thesis: 'Law before medicine. Medicine before leadership. Leadership before intelligence.',
  context:
    'A credential record is not a career summary. What follows is a sequence — one that explains why every system dr. Ferdi Iskandar builds is shaped by someone who has been accountable for patient outcomes, not just model performance.',
} as const

export const cvIndexEntries = [
  { number: '01', title: 'Profile', detail: 'Executive Summary', href: '#cv-profile' },
  { number: '02', title: 'Experience', detail: 'Career Timeline', href: '#cv-experience' },
  { number: '03', title: 'Education', detail: 'Academic Record', href: '#cv-education' },
  { number: '04', title: 'Research', detail: 'Publications', href: '#cv-research' },
  { number: '05', title: 'Download', detail: 'Full CV · PDF', href: '#cv-download' },
] as const

export const cvProfile = {
  eyebrow: 'Executive Profile',
  body: [
    'dr. Ferdi Iskandar is not a technologist who discovered healthcare. He is a clinician, a hospital CEO, and a legal thinker who built an AI company because the problem demanded it.',
    'His path is unconventional by design: law before medicine, emergency practice before institutional leadership, and a decade of running a clinical facility before writing a single line of production AI. This sequence matters. It means every system he builds is shaped by someone who has been accountable for patient outcomes — not just model performance.',
    'Through Sentra Artificial Intelligence, he is translating that institutional experience into practical, explainable, and preventive healthcare AI — focused on clinical trajectory, early warning systems, and AI-native hospital operations.',
  ],
  tagline: 'Built from the inside of healthcare, not the outside.',
} as const

export type ExperienceStatus = 'current' | 'past'

export type ExperienceItem = {
  id: string
  number: string
  role: string
  organization: string
  years: string
  status: ExperienceStatus
  description: string
}

export const cvExperience: ExperienceItem[] = [
  {
    id: 'sentra-ai',
    number: '01',
    role: 'Founder & CEO',
    organization: 'Sentra Artificial Intelligence',
    years: '2025 — Present',
    status: 'current',
    description:
      'Building the operating system for preventive healthcare. Sentra develops clinical trajectory systems, AI-native hospital operations, and next-generation clinical decision support — rooted in twelve years of direct hospital leadership and frontline clinical practice. The company is the direct institutional response to systemic vulnerabilities observed during hospital operations.',
  },
  {
    id: 'rsia-melinda',
    number: '02',
    role: 'Chief Executive Officer',
    organization: 'RSIA Melinda DHAI',
    years: '2016 — Present',
    status: 'current',
    description:
      'Leading a private maternal hospital through nearly a decade of operational, clinical, and strategic transformation. Responsible for clinical governance, patient safety architecture, service quality, and institutional performance. The facility maintained a zero mortality record prior to February 2025, when a systemic external exposure prompted the development of Sentra. The hospital now operates as the primary real-world implementation environment for AI-integrated clinical operations.',
  },
  {
    id: 'er-clinician',
    number: '03',
    role: 'Emergency Room Clinician',
    organization: 'Clinical Practice',
    years: '2014 — 2016',
    status: 'past',
    description:
      'Frontline clinical practice in emergency medicine — direct exposure to acute decision-making under time pressure, resource constraints, and high-stakes conditions. The formative experience for understanding where clinical intelligence systems fail and where they are needed most. The gap between what data shows and what a clinician must decide in real time became a defining professional question.',
  },
]

export type EducationItem = {
  id: string
  number: string
  degree: string
  field: string
  institution: string
  years: string
  description: string
}

export const cvEducation: EducationItem[] = [
  {
    id: 'medicine',
    number: 'EDU-01',
    degree: 'Bachelor of Medicine',
    field: 'General Medicine',
    institution: 'Universitas Wijaya Kusuma',
    years: '2008 — 2013',
    description:
      'Medical degree — the pivot point that transformed a legal thinker into a clinician. The rare combination of law and medicine would later become the structural foundation for building healthcare AI that is both clinically sound and institutionally accountable.',
  },
  {
    id: 's2-hukum',
    number: 'EDU-02',
    degree: 'Master of Law',
    field: 'Notarial Law (MKN)',
    institution: 'Universitas Ubaya',
    years: '2005 — 2008',
    description:
      'Graduate legal studies with a thesis exploring in vitro fertilization from the perspective of surrogate motherhood — an early engagement with the ethical and legal dimensions of medical technology, reproductive rights, and institutional responsibility.',
  },
  {
    id: 's1-hukum',
    number: 'EDU-03',
    degree: 'Bachelor of Law',
    field: 'Legal Studies (SH)',
    institution: 'Universitas Ubaya',
    years: '2001 — 2005',
    description:
      'The beginning of a discipline that would later inform a career at the intersection of medicine, clinical governance, and AI ethics. Law was not a detour — it became the lens through which healthcare systems, institutional liability, and patient rights are understood.',
  },
]

export type PublicationStatus = 'in-preparation' | 'under-review' | 'published'

export type PublicationItem = {
  id: string
  number: string
  title: string
  subtitle: string
  status: PublicationStatus
  year: string
  tags: string[]
  abstract: string
}

export const cvPublications: PublicationItem[] = [
  {
    id: 'tcma',
    number: 'PUB-01',
    title: 'The Clinical Mind Algorithm (TCMA)',
    subtitle:
      'Toward Replication of Human Clinical Cognition through a Biomimetic Computational Neuroscience Approach',
    status: 'in-preparation',
    year: '2025 — 2026',
    tags: [
      'Biomimetic AI',
      'Spiking Neural Networks',
      'Neuro-Symbolic AI',
      'Digital Twin Brain',
      'Clinical Decision Support',
    ],
    abstract:
      'An integrative analysis of Digital Twin Brain and Neuro-Symbolic AI for next-generation clinical decision support architecture. The paper proposes a TCMA extension into a neurosymbolic architecture integrating synaptic primitives, acetylcholine-modulated TAN, and spiking temporal dynamics. Simulation prototype across 100 urban patients yielded 94% accuracy and 92% explainability. Predicts human-parity clinical decision support by 2027.',
  },
]

export const cvCredentials = [
  { code: 'dr.', label: 'Medical Doctor', source: 'Universitas Wijaya Kusuma' },
  { code: 'SH', label: 'Bachelor of Law', source: 'Universitas Ubaya' },
  { code: 'MKN', label: 'Master of Notarial Law', source: 'Universitas Ubaya' },
  { code: 'CLM', label: 'Certified Legal Manager', source: 'Professional Certification' },
  {
    code: 'CMDC',
    label: 'Certified Medical Doctor Consultant',
    source: 'Professional Certification',
  },
] as const

export const cvGlanceSections = [
  {
    title: 'Active Roles',
    items: ['Founder & CEO, Sentra AI', 'CEO, RSIA Melinda DHAI'],
  },
  {
    title: 'Credentials',
    items: ['dr. · SH · MKN · CLM · CMDC'],
  },
  {
    title: 'Education',
    items: ['Universitas Wijaya Kusuma', 'Universitas Ubaya (×2)'],
  },
  {
    title: 'Research',
    items: ['TCMA — In Preparation'],
  },
  {
    title: 'Background',
    items: [
      'Law & Governance',
      'Clinical Medicine',
      'Hospital Leadership',
      'Artificial Intelligence',
    ],
  },
] as const
