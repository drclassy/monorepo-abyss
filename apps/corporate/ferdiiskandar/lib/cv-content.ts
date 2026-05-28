export const cvHero = {
  sectionLabel: 'Curriculum Vitae / Bagian 07',
  name: 'dr. Ferdi Iskandar',
  credentials: 'dr., SH, MKN, APEPC™, CAIPC®, Google Dev, Minimax AI',
  profileEyebrow: 'Profil Profesional',
  profileIntersectionLines: ['Di pertemuan antara', 'hukum, kode, dan kognisi.'] as const,
  profileBody:
    'Lintas disiplin adalah kekuatan. Dari interpretasi regulasi teknologi hingga arsitektur model fondasi, setiap keputusan diinformasikan oleh perspektif multidimensional. Bukan sekadar pengembang. Bukan sekadar akademisi. Seorang pembangun yang memahami sistem secara utuh.',
  profileMottoLines: ['Setiap gelar ditempuh.', 'Setiap standar dibuktikan.'] as const,
  profileClosing:
    'Kombinasi keahlian hukum, keamanan siber, manajemen risiko, dan arsitektur cloud menciptakan fondasi unik untuk memimpin dalam era perusahaan yang diatur oleh AI.',
} as const

export const cvIndexEntries = [
  { number: '01', title: 'Profil', detail: 'Ringkasan eksekutif', href: '#cv-profile' },
  { number: '02', title: 'Pengalaman', detail: 'Linimasa karier', href: '#cv-experience' },
  { number: '03', title: 'Pendidikan', detail: 'Rekam akademik', href: '#cv-education' },
  { number: '04', title: 'Riset', detail: 'Publikasi', href: '#cv-research' },
  { number: '05', title: 'Unduh', detail: 'CV lengkap · PDF', href: '#cv-download' },
] as const

export const cvProfile = {
  eyebrow: 'Profil Eksekutif',
  body: [
    'dr. Ferdi Iskandar bukan teknolog yang baru menemukan layanan kesehatan. Ia adalah klinisi, CEO rumah sakit, dan pemikir hukum yang membangun perusahaan AI karena masalahnya memang menuntut itu.',
    'Jalurnya tidak konvensional secara sadar: hukum sebelum kedokteran, praktik gawat darurat sebelum kepemimpinan institusional, dan satu dekade menjalankan fasilitas klinis sebelum menulis sistem AI produksi. Urutan ini penting karena setiap sistem yang ia bangun dibentuk oleh seseorang yang pernah memikul akuntabilitas atas hasil pasien, bukan hanya performa model.',
    'Melalui Sentra Artificial Intelligence, ia menerjemahkan pengalaman institusional itu menjadi AI kesehatan yang praktis, dapat dijelaskan, dan preventif, dengan fokus pada trajektori klinis, sistem peringatan dini, dan operasi rumah sakit yang berangkat dari cara kerja AI sejak awal.',
  ],
  tagline: 'Dibangun dari dalam realitas layanan kesehatan, bukan dari luar.',
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
    years: '2025 — Saat ini',
    status: 'current',
    description:
      'Membangun sistem operasi untuk layanan kesehatan preventif. Sentra mengembangkan sistem trajektori klinis, operasi rumah sakit yang berangkat dari cara kerja AI sejak awal, dan pendukung keputusan klinis generasi berikutnya yang berakar pada 12 tahun kepemimpinan rumah sakit langsung dan praktik klinis lini depan. Perusahaan ini menjadi respons institusional langsung atas kerentanan sistemik yang terlihat dalam operasi rumah sakit.',
  },
  {
    id: 'rsia-melinda',
    number: '02',
    role: 'Chief Executive Officer',
    organization: 'RSIA Melinda DHAI',
    years: '2016 — Saat ini',
    status: 'current',
    description:
      'Memimpin rumah sakit ibu dan anak swasta melalui hampir satu dekade transformasi operasional, klinis, dan strategis. Bertanggung jawab atas tata kelola klinis, arsitektur keselamatan pasien, mutu layanan, dan performa institusi. Fasilitas ini mempertahankan catatan nol mortalitas sebelum Februari 2025, ketika paparan eksternal sistemik mendorong lahirnya Sentra. Rumah sakit kini menjadi lingkungan implementasi nyata utama untuk operasi klinis yang terintegrasi AI.',
  },
  {
    id: 'er-clinician',
    number: '03',
    role: 'Klinisi Instalasi Gawat Darurat',
    organization: 'Praktik Klinis',
    years: '2014 — 2016',
    status: 'past',
    description:
      'Praktik klinis lini depan dalam kedokteran gawat darurat, dengan paparan langsung pada pengambilan keputusan akut di bawah tekanan waktu, keterbatasan sumber daya, dan kondisi berisiko tinggi. Pengalaman ini membentuk pemahaman tentang titik kegagalan sistem kecerdasan klinis dan tempat sistem itu paling dibutuhkan. Jarak antara apa yang ditunjukkan data dan apa yang harus diputuskan klinisi secara waktu nyata menjadi pertanyaan profesional yang menentukan.',
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
    degree: 'Sarjana Kedokteran',
    field: 'Kedokteran Umum',
    institution: 'Universitas Wijaya Kusuma',
    years: '2008 — 2013',
    description:
      'Gelar kedokteran menjadi titik balik yang mengubah pemikir hukum menjadi klinisi. Kombinasi langka antara hukum dan kedokteran kemudian menjadi fondasi struktural untuk membangun AI kesehatan yang kuat secara klinis dan akuntabel secara institusional.',
  },
  {
    id: 's2-hukum',
    number: 'EDU-02',
    degree: 'Magister Kenotariatan',
    field: 'Hukum Kenotariatan (MKN)',
    institution: 'Universitas Ubaya',
    years: '2005 — 2008',
    description:
      'Studi hukum pascasarjana dengan tesis mengenai fertilisasi in vitro dari perspektif ibu pengganti, sebagai keterlibatan awal dengan dimensi etik dan hukum teknologi medis, hak reproduksi, serta tanggung jawab institusional.',
  },
  {
    id: 's1-hukum',
    number: 'EDU-03',
    degree: 'Sarjana Hukum',
    field: 'Ilmu Hukum (SH)',
    institution: 'Universitas Ubaya',
    years: '2001 — 2005',
    description:
      'Awal dari disiplin yang kemudian membentuk karier di pertemuan kedokteran, tata kelola klinis, dan etika AI. Hukum bukan jalan memutar; ia menjadi lensa untuk memahami sistem kesehatan, tanggung jawab institusi, dan hak pasien.',
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
      'Analisis integratif atas Digital Twin Brain dan Neuro-Symbolic AI untuk arsitektur pendukung keputusan klinis generasi berikutnya. Makalah ini mengusulkan perluasan TCMA ke arsitektur neurosimbolik yang mengintegrasikan primitif sinaptik, TAN termodulasi asetilkolin, dan dinamika temporal spiking. Prototipe simulasi pada 100 pasien urban menghasilkan akurasi 94% dan explainability 92%. Arah risetnya memprediksi pendukung keputusan klinis setara manusia pada 2027.',
  },
]

export const cvCredentials = [
  { code: 'dr.', label: 'Dokter', source: 'Universitas Wijaya Kusuma' },
  { code: 'SH', label: 'Sarjana Hukum', source: 'Universitas Ubaya' },
  { code: 'MKN', label: 'Magister Kenotariatan', source: 'Universitas Ubaya' },
  {
    code: 'APEPC™',
    label: 'AI Prompt Engineering Professional Certificate',
    source: 'Sertifikasi profesional',
  },
  {
    code: 'CAIPC®',
    label: 'Certified Artificial Intelligence Prompt Creator',
    source: 'Sertifikasi profesional',
  },
  {
    code: 'Google Dev',
    label: 'Google Developer Certification',
    source: 'Google',
  },
  {
    code: 'Minimax AI',
    label: 'Minimax AI Certification',
    source: 'Minimax',
  },
] as const

export const cvGlanceSections = [
  {
    title: 'Peran Aktif',
    items: ['Founder & CEO, Sentra AI', 'CEO, RSIA Melinda DHAI'],
  },
  {
    title: 'Kredensial',
    items: ['dr. · SH · MKN'],
  },
  {
    title: 'Sertifikasi',
    items: ['APEPC™', 'CAIPC®', 'Google Dev', 'Minimax AI'],
  },
  {
    title: 'Pendidikan',
    items: ['Universitas Wijaya Kusuma', 'Universitas Ubaya (×2)'],
  },
  {
    title: 'Riset',
    items: ['TCMA — Dalam Persiapan'],
  },
  {
    title: 'Latar Belakang',
    items: [
      'Hukum dan tata kelola',
      'Kedokteran klinis',
      'Kepemimpinan rumah sakit',
      'Kecerdasan buatan',
    ],
  },
] as const
