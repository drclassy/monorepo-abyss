'use client'

// Architected and built by dr Classy

import Image from 'next/image'
import { useState } from 'react'

import SectionNumberMark from '@/components/SectionNumberMark'

const storyChapters = [
  {
    marker: 'Februari 2025',
    title: 'Inisiatif Awal dari CSR RSIA Melinda DHAI',
    paragraphs: [
      'Sentra Artificial Intelligence berawal dari sebuah inisiatif Corporate Social Responsibility (CSR) di RSIA Melinda DHAI. Gagasan awalnya sederhana: menghadirkan teknologi AI yang memberikan manfaat nyata bagi layanan kesehatan—bukan untuk menggantikan peran manusia, melainkan untuk mendukung tenaga kesehatan agar dapat bekerja dengan lebih jelas, konsisten, dan percaya diri. Bekerja sama dengan seorang yang berpengalaman lebih dari 25 tahun di layanan primer, Bpk. Joseph Arianto, serta asisten saya, Sdr. Norma, kami mengumpulkan permasalahan nyata, potensi solusi, berdiskusi, membuat konsep, implementasi, repeat.',
      'Seiring waktu, Sentra berkembang melampaui konsep awal tersebut.',
      'Perjalanan ini membuka pemahaman bahwa kekuatan utama AI tidak terletak pada otomatisasi semata, tetapi pada kemampuannya untuk berkolaborasi dengan manusia. AI dapat berperan sebagai partner berpikir, asisten dokumentasi, pendukung clinical reasoning, media edukasi, serta penghubung antara kompleksitas data dan pengambilan keputusan di lapangan.',
    ],
  },
  {
    marker: 'Peralihan',
    title: 'Evolusi Peran AI sebagai Kolaborator Klinis',
    paragraphs: [
      'Dari titik ini, arah Sentra menjadi semakin terdefinisi: menghadirkan AI yang relevan dan dapat digunakan secara langsung di lini depan pelayanan kesehatan primer.',
      'Pengembangan Sentra dilakukan melalui kolaborasi lintas disiplin bersama berbagai tenaga kesehatan, termasuk dokter spesialis seperti dr. Dibya Arfianda, Sp.OG dan dr. Boyong Baskoro, Sp.OG, dokter umum, perawat, bidan, hingga staf administrasi. Pendekatan ini memastikan bahwa setiap solusi yang dikembangkan berangkat dari kebutuhan nyata di lapangan.',
      'Dalam aspek teknologi, Sentra juga didukung oleh kolaborasi dengan Nathanael Kevin Susanto, BIT, M.Tech, Software Engineer di Visa Worldwide, Singapore, yang berperan dalam menjaga standar reliabilitas sistem serta menjembatani praktik engineering kelas enterprise dengan kebutuhan spesifik sektor healthcare.',
    ],
  },
  {
    marker: 'Kolaborasi Klinis',
    title: 'Kolaborasi Lintas Disiplin dan Standar Teknologi',
    paragraphs: [
      'Kolaborasi ini memperkuat prinsip bahwa AI tidak seharusnya berhenti sebagai konsep, publikasi, atau dashboard semata. Nilai sesungguhnya dari AI terletak pada kemampuannya untuk hadir di titik pelayanan—di mana keputusan dibuat, pasien didampingi, dan risiko harus diidentifikasi sejak dini.',
    ],
  },
  {
    marker: 'Primary Care',
    title: 'Implementasi Nyata di Lini Pelayanan Kesehatan',
    paragraphs: [
      'Sentra dirancang untuk memahami secara menyeluruh alur kerja layanan kesehatan, mulai dari penerimaan pasien, dokumentasi, triase, clinical reasoning, komunikasi, tindak lanjut, koordinasi operasional, edukasi pasien, hingga deteksi dini risiko.',
      'Seiring perkembangan, Sentra berevolusi menjadi ekosistem AI yang lebih luas. Selain berfokus pada healthcare intelligence dan clinical decision support, Sentra juga mengembangkan platform edukasi berbasis AI, Sentra Mitra Design, serta berbagai inisiatif lain yang lahir dari kebutuhan nyata di bidang edukasi, dokumentasi, desain, komunikasi, operasional, dan pengembangan sistem.',
    ],
  },
  {
    marker: 'Ekosistem',
    title: 'Ekspansi Menuju Ekosistem AI Terintegrasi',
    paragraphs: [
      'Secara pribadi, Sentra bukan sekadar proyek teknologi.',
      'Selama kurang lebih satu tahun, proses pengembangan dilakukan dengan komitmen penuh—melalui pembelajaran berkelanjutan, pengujian, iterasi, dan penyempurnaan arah. Perjalanan ini menegaskan satu hal: AI menjadi paling bernilai ketika ia hadir berkolaborasi mendampingi manusia, bukan sebagai pengganti, melainkan memperkuat "Augmented".',
    ],
  },
  {
    marker: 'Founder Work',
    title: 'Perjalanan Personal dan Filosofi Pengembangan',
    paragraphs: [
      'Dari sebuah inisiatif CSR, Sentra berkembang menjadi sebuah misi yang lebih luas: membangun sistem di mana keahlian manusia tetap menjadi pusat, sementara AI berperan dalam menyusun informasi, mendukung pengambilan keputusan, mempercepat pembelajaran, memperjelas komunikasi, dan membantu tim bertindak lebih proaktif.',
    ],
  },
  {
    marker: 'Mission',
    title: 'Visi Kolaborasi Manusia dan AI di Masa Depan',
    paragraphs: [
      'Ke depan, Sentra percaya bahwa masa depan tidak dibentuk oleh AI semata, melainkan oleh kolaborasi antara manusia dan teknologi—melibatkan tenaga kesehatan, tenaga pendukung, pendidik, desainer, pemimpin organisasi, serta masyarakat luas.',
    ],
  },
  {
    marker: 'Now',
    title: 'Komitmen Sentra Artificial Intelligence',
    paragraphs: [
      'Sentra Artificial Intelligence bergerak dengan satu komitmen: membangun ekosistem AI yang praktis, etis, relevan, dan berakar pada kebutuhan nyata manusia. Kedaulatan dan keputusan tetap berada di tangan tenaga kesehatan. Artificial Intelligence bertugas memenuhi mayoritas informasi yang diperlukan agar kita dapat menghasilkan diagnosis terbaik bagi pasien.',
    ],
  },
]

export default function StoryOfSentra() {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)
  const activeChapter = storyChapters[activeChapterIndex] ?? storyChapters[0]

  return (
    <section aria-labelledby="story-sentra-title" className="fi-section" id="story-sentra">
      <article className="fi-story">
        <header className="fi-story-head">
          <SectionNumberMark number="05" />
          <div className="fi-story-headline">
            <div className="fi-story-headline-copy">
              <div className="fi-kicker">Story of Sentra</div>
              <h2 className="fi-story-title" id="story-sentra-title">
                Perjalanan Sentra Artificial Intelligence
              </h2>
              <p className="fi-story-subtitle">
                Dari Inisiatif CSR menuju Ekosistem Human-AI untuk Kesehatan, Edukasi, dan Desain
              </p>
            </div>
            <figure aria-label="Kolaborator Sentra" className="fi-story-portrait">
              <Image
                alt="dr. Ferdi bersama kolaborator Sentra Artificial Intelligence"
                className="fi-story-portrait-image"
                height={450}
                sizes="(max-width: 1080px) 100vw, 34vw"
                src="/drferdi-friends.png"
                width={800}
              />
            </figure>
          </div>
        </header>

        <div className="fi-story-board">
          <nav aria-label="Urutan perjalanan Sentra" className="fi-story-index">
            {storyChapters.map((chapter, index) => (
              <button
                aria-controls="story-sentra-reader"
                aria-label={`${chapter.marker} ${chapter.title}`}
                aria-pressed={index === activeChapterIndex}
                className="fi-story-index-button"
                data-active={index === activeChapterIndex ? 'true' : 'false'}
                key={chapter.title}
                onClick={() => setActiveChapterIndex(index)}
                type="button"
              >
                <span>{chapter.marker}</span>
                <strong>{chapter.title}</strong>
              </button>
            ))}
          </nav>

          <section
            aria-live="polite"
            aria-labelledby={`story-sentra-chapter-${activeChapterIndex}`}
            className="fi-story-reader"
            id="story-sentra-reader"
          >
            <span className="fi-story-reader-marker">{activeChapter.marker}</span>
            <h3 id={`story-sentra-chapter-${activeChapterIndex}`}>{activeChapter.title}</h3>
            {activeChapter.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        </div>
      </article>
    </section>
  )
}
