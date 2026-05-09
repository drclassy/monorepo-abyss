export const siteIdentity = {
  name: 'dr. Ferdi Iskandar',
  shortName: 'Ferdi Iskandar',
  tagline: 'Applied Intelligence / Indonesia',
  headline: 'Augmented Intelligence Architect',
  location: 'Kota Kediri, Jawa Timur, Indonesia',
}

export const sectionIds = [
  { id: 'top', label: 'Top' },
  { id: 'impact', label: 'Impact' },
  { id: 'expertise', label: 'Thinking' },
  { id: 'sentra-sim', label: 'Simulation' },
  { id: 'portfolio', label: 'Systems' },
  { id: 'story-sentra', label: 'Story' },
  { id: 'contact', label: 'Contact' },
] as const

export const primaryNav = [
  { label: 'About', href: '/about' },
  { label: 'Works', href: '/works' },
  { label: 'Notes', href: '/notes' },
  { label: 'Speaking', href: '/speaking' },
  { label: 'CV', href: '/cv' },
  { label: 'Contact', href: '/#contact' },
] as const

export const futureRoutes = [
  { label: 'About', href: '/about' },
  { label: 'Systems', href: '/systems' },
  { label: 'Notes', href: '/notes' },
  { label: 'Contact', href: '/contact' },
] as const

export const contactCards = [
  {
    label: 'Strategic Collaboration',
    value: 'Official founder coordination channel',
    description:
      'Use for cross-sector intelligence systems, institutional strategy, and founder-led collaboration.',
    href: null,
  },
  {
    label: 'Institutional Programs',
    value: 'Transformation and implementation direction',
    description:
      'Use when the conversation involves healthcare, education, workforce, or public-facing digital systems.',
    href: null,
  },
  {
    label: 'Direct Contact',
    value: 'Public links and direct email',
    description:
      'Selected public surfaces are listed below for direct outreach, publication, and professional contact.',
    href: null,
  },
] as const

export const socialLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dr-ferdi-iskandar-1b620a3b5/',
    value: 'Professional profile and executive presence',
    icon: 'linkedin',
  },
  {
    label: 'X',
    href: 'https://x.com/ClaudesyI81047',
    value: 'Public commentary and signal stream',
    icon: 'x',
  },
  {
    label: 'Medium',
    href: 'https://medium.com/',
    value: 'Long-form writing and editorial reflections',
    icon: 'medium',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/',
    value: 'Code-facing public surface',
    icon: 'github',
  },
  {
    label: 'Kaggle',
    href: 'https://www.kaggle.com/drferdiiskandar',
    value: 'Data and model exploration surface',
    icon: 'kaggle',
  },
  {
    label: 'Email',
    href: 'mailto:drferdiiskandar@sentrahai.com',
    value: 'drferdiiskandar@sentrahai.com',
    icon: 'email',
  },
] as const

export const thinkingMeta = {
  sectionLabel: 'Clinical Intelligence',
  editionLabel: 'Current Edition',
  notesLabel: 'Founder Notes / Current',
  lastUpdatedLabel: 'Currently evolving',
} as const

export const footerMeta = {
  year: new Date().getFullYear(),
  location: siteIdentity.location,
  organization: 'Sentra Healthcare Artificial Intelligence',
} as const
