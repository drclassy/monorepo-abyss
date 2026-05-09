// Architected and built by dr Classy

export const notesHero = {
  eyebrow: 'Catatan / Arsip Tulisan',
  title: 'Catatan dr Classy',
  thesis:
    'Sebuah ruang baca yang menampilkan tulisan aktual mengenai AI medis, praktik kedokteran, dan cara berpikir institusional di titik temu care, leadership, dan implementasi.',
  context:
    'Halaman ini disusun sebagai arsip editorial yang rapi. Fokusnya bukan feed otomatis, melainkan pilihan tulisan yang benar-benar sudah terbit dan relevan untuk dibaca ulang.',
  abstract:
    'Seluruh daftar di bawah ini bersifat statis, manual, dan berbasis tulisan aktual yang tampil di profil Medium saat pengecekan.',
} as const

export const notesIndexEntries = [
  {
    number: '01',
    title: 'Pengantar',
    detail: 'Cara membaca halaman ini',
    href: '#notes-foreword',
  },
  {
    number: '02',
    title: 'Struktur',
    detail: 'Susunan baca dan prinsip kurasi',
    href: '#notes-order',
  },
  {
    number: '03',
    title: 'Medium',
    detail: 'Tulisan aktual yang terbit',
    href: '#notes-medium',
  },
  {
    number: '04',
    title: 'Penutup',
    detail: 'Dari tulisan menuju percakapan',
    href: '#notes-closing',
  },
] as const

export const notesSignals = [
  'Seluruh isi memakai kurasi manual, bukan sinkronisasi otomatis.',
  'Yang ditampilkan hanya tulisan yang benar-benar sudah terbit.',
  'Nada halaman dijaga tenang, rapi, dan editorial.',
] as const

export const notesLedgerCards = [
  {
    number: '01',
    title: 'Tulisan aktual',
    body: 'Halaman ini hanya menampilkan tulisan yang benar-benar sudah terbit di Medium, bukan draft, bukan placeholder, dan bukan konten simulasi.',
  },
  {
    number: '02',
    title: 'Kurasi manual',
    body: 'Tidak ada feed yang muncul sendiri. Setiap item dipilih dan dipasang manual agar layout tetap tertib dan bisa dikendalikan.',
  },
  {
    number: '03',
    title: 'Bahasa tunggal',
    body: 'Seluruh halaman disusun penuh dalam Bahasa Indonesia agar terasa lebih utuh dan tidak terpecah antara dua mode editorial.',
  },
] as const

export const notesReadingOrder = [
  {
    number: '01',
    title: 'Baca sebagai arsip, bukan feed',
    body: 'Urutannya dibuat untuk membantu pembacaan yang tenang: pengantar singkat, satu tulisan utama, lalu daftar tulisan lainnya.',
  },
  {
    number: '02',
    title: 'Satu tulisan utama lebih dominan',
    body: 'Tulisan terbaru di Medium ditampilkan sebagai sorotan utama agar pembaca langsung melihat titik masuk yang paling aktual.',
  },
  {
    number: '03',
    title: 'Daftar lanjutan tetap nyata',
    body: 'Artikel lain di bawahnya adalah tulisan aktual lain yang tampil di profil Medium, bukan daftar contoh dan bukan pengisi sementara.',
  },
] as const

export const mediumArchive = {
  title: 'Tulisan di Medium',
  subtitle: 'Pilihan tulisan aktual dari profil Medium dr Classy',
  href: 'https://medium.com/@claudesy.id',
  label: 'Buka Arsip Medium',
} as const

export const mediumFeaturedPost = {
  label: 'Tulisan Terbaru',
  code: 'MED-LATEST',
  date: 'Mar 16',
  title: 'Peran Generative AI dalam Reduksi Beban Administrasi Medis.',
  synopsis:
    'Tulisan terbaru yang tampil di profil Medium saat pengecekan menyorot bagaimana generative AI dapat membantu mengurangi beban administratif medis tanpa mengaburkan tanggung jawab profesional.',
  body: 'Bagian ini sengaja dibuat paling dominan agar pembaca langsung melihat tulisan paling aktual terlebih dahulu. Daftar di bawahnya berfungsi sebagai rak lanjutan untuk artikel lain yang benar-benar sudah terbit.',
  href: 'https://medium.com/@claudesy.id',
  cta: 'Buka Tulisan Terbaru',
} as const

export const mediumEntries = [
  {
    code: 'MED-01',
    date: 'Mar 13',
    title: 'MedGemma 27B & CDDS: Masa Depan AI Multimodal untuk Praktik Kedokteran Modern',
    synopsis:
      'Refleksi mengenai model multimodal dan arah pemakaiannya dalam praktik kedokteran modern.',
    body: 'Ditampilkan sebagai bacaan lanjutan yang lebih teknis, namun tetap dekat dengan pembacaan editorial dan konteks praktik nyata.',
    href: 'https://medium.com/@claudesy.id',
    cta: 'Baca di Medium',
  },
  {
    code: 'MED-02',
    date: 'Mar 9',
    title:
      'Menyelaraskan Visi dan Implementasi: Refleksi CEO dan Peneliti atas “Modeling Medical Diagnosis”',
    synopsis:
      'Tulisan reflektif yang menghubungkan visi sistem medis dengan realitas implementasi dan evaluasi model.',
    body: 'Masuk sebagai artikel lanjutan yang memperlihatkan kesinambungan antara sudut pandang kepemimpinan dan disiplin system-building.',
    href: 'https://medium.com/@claudesy.id',
    cta: 'Baca di Medium',
  },
  {
    code: 'MED-03',
    date: 'Mar 8',
    title: 'Di Balik Layar Algoritma: AI dan Masa Depan Empati Dokter di Indonesia',
    synopsis: 'Pembacaan atas AI, empati dokter, dan konteks praktik layanan primer di Indonesia.',
    body: 'Diletakkan sebagai bagian dari rak tulisan yang memperluas sisi humanistik dan institusional dari diskusi AI di healthcare.',
    href: 'https://medium.com/@claudesy.id',
    cta: 'Baca di Medium',
  },
] as const

export const notesGlanceSections = [
  {
    title: 'Logika Arsip',
    items: [
      'Yang ditampilkan hanya tulisan yang benar-benar sudah terbit.',
      'Section Medium dikurasi manual, bukan dirender otomatis.',
      'Satu tulisan terbaru dibuat lebih dominan daripada artikel lainnya.',
    ],
  },
  {
    title: 'Tema Berulang',
    items: [
      'AI medis dan beban administratif',
      'Implementasi model diagnosis',
      'Empati dokter dan konteks layanan primer',
    ],
  },
  {
    title: 'Mode Baca',
    items: [
      'Tenang, presisi, editorial',
      'Hierarki publikasi yang tegas',
      'Dibangun untuk dibaca ulang, bukan sebagai auto-feed',
    ],
  },
] as const

export const notesClosing = {
  title:
    'Jika sebuah tulisan terasa relevan, langkah berikutnya adalah percakapan yang lebih jernih.',
  body: 'Halaman ini dimaksudkan sebagai rak baca yang ringkas namun jelas. Jika salah satu tulisan menyentuh agenda institusional, healthcare AI, atau arah transformasi yang sedang dihadapi, percakapan lanjutan sebaiknya dimulai dari substansi, bukan dari kebisingan presentasi.',
  primaryHref: '/#contact',
  primaryLabel: 'Mulai Percakapan',
  secondaryHref: '/about',
  secondaryLabel: 'Lihat Profil',
} as const
