// Architected and built by dr Classy

import Image from 'next/image'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import {
  mediumArchive,
  mediumEntries,
  mediumFeaturedPost,
  notesClosing,
  notesDeskCards,
  notesDeskStats,
  notesGlanceSections,
  notesHero,
  notesIndexEntries,
  notesLedgerCards,
  notesReadingOrder,
} from '@/lib/notes-content'

export default function NotesPage() {
  return (
    <div className="fi-page-notes fi-notes-dossier" id="notes-page">
      <Navbar />
      <main className="fi-notes-dossier-shell" id="main-content">
        <aside aria-label="Indeks arsip catatan" className="fi-notes-index">
          <div className="fi-notes-index-title">Indeks Catatan</div>
          <nav aria-label="Bagian catatan" className="fi-notes-index-nav">
            {notesIndexEntries.map((item) => (
              <Link href={item.href} key={item.number}>
                <span>{item.number}</span>
                <strong>{item.title}</strong>
                <em>{item.detail}</em>
              </Link>
            ))}
          </nav>
          <div className="fi-notes-index-card">
            <p>
              Observasi sebelum tindakan.
              <br />
              Jarak sebelum kesimpulan.
              <br />
              Makna sebelum pendapat.
            </p>
            <span aria-hidden="true">✧</span>
            <small>Catatan dr Ferdi</small>
          </div>
        </aside>

        <div className="fi-notes-main">
          <header className="fi-notes-hero" id="notes-foreword">
            <div className="fi-notes-hero-copy">
              <div className="fi-notes-masthead">
                <span className="fi-notes-section-label">Bagian 05</span>
                <span>{notesHero.issue}</span>
                <span>{notesHero.date}</span>
              </div>
              <h1>{notesHero.title}</h1>
              <div className="fi-notes-hero-prose">
                {notesHero.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="fi-notes-hero-statline" aria-label="Ringkasan arsip catatan">
                {notesDeskStats.map((stat) => (
                  <div key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <aside className="fi-notes-hero-aside" aria-label="Abstrak dan visual arsip catatan">
              <div className="fi-notes-hero-visual">
                <Image
                  alt="dr Ferdi Iskandar menulis catatan di meja kerja"
                  fill
                  priority
                  sizes="(max-width: 860px) 100vw, 34vw"
                  src="/cdrferdi-study.png"
                />
              </div>
              <div className="fi-notes-hero-brief">
                <span className="fi-notes-panel-label">{notesHero.eyebrow}</span>
                <p>
                  Setiap tulisan dibaca sebagai jejak pengamatan: dari pengalaman, menuju pemahaman,
                  lalu menjadi arah tindakan yang lebih jernih.
                </p>
              </div>
            </aside>
          </header>

          <section aria-labelledby="notes-reading-desk-title" className="fi-notes-reading-desk">
            <div className="fi-notes-reading-desk-head">
              <span className="fi-notes-panel-label">Meja Baca</span>
              <h2 id="notes-reading-desk-title">Bukan daftar tautan. Ini meja baca.</h2>
              <p>
                Rancangan halaman ini dibuat untuk memberi konteks sebelum pembaca keluar ke Medium:
                apa yang sedang dibahas, mengapa tulisan itu disimpan, dan bagaimana membacanya
                sebagai bagian dari pemikiran yang lebih panjang.
              </p>
            </div>
            <div className="fi-notes-reading-desk-grid">
              {notesDeskCards.map((card) => (
                <article className="fi-notes-reading-card" key={card.label}>
                  <span>{card.label}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="notes-order-title" className="fi-notes-ledger" id="notes-order">
            <div className="fi-notes-section-head">
              <h2 id="notes-order-title">Struktur Baca</h2>
              <span>Susunan editorial yang lebih tenang dan lebih teratur</span>
            </div>
            <div className="fi-notes-ledger-grid">
              {notesLedgerCards.map((card) => (
                <article className="fi-notes-ledger-card" key={card.number}>
                  <span>{card.number}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
            <div className="fi-notes-order-list">
              {notesReadingOrder.map((item) => (
                <article className="fi-notes-order-item" key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="notes-medium-title"
            className="fi-notes-medium"
            id="notes-medium"
          >
            <div className="fi-notes-section-head">
              <h2 id="notes-medium-title">{mediumArchive.title}</h2>
              <span>{mediumArchive.subtitle}</span>
            </div>
            <div className="fi-notes-medium-lead">
              <article className="fi-notes-medium-featured">
                <div className="fi-notes-featured-label-row">
                  <span className="fi-notes-panel-label">Rak Medium</span>
                  <div className="fi-notes-entry-meta">
                    <span className="fi-notes-entry-code">{mediumFeaturedPost.code}</span>
                    <span className="fi-notes-entry-date">{mediumFeaturedPost.date}</span>
                  </div>
                </div>
                <strong className="fi-notes-medium-kicker">{mediumFeaturedPost.label}</strong>
                <h3>{mediumFeaturedPost.title}</h3>
                <p className="fi-notes-entry-synopsis">{mediumFeaturedPost.synopsis}</p>
                <p className="fi-notes-entry-body">{mediumFeaturedPost.body}</p>
                <div className="fi-notes-medium-actions">
                  <Link
                    className="fi-button"
                    href={mediumFeaturedPost.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {mediumFeaturedPost.cta}
                  </Link>
                  <Link
                    className="fi-button secondary"
                    href={mediumArchive.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {mediumArchive.label}
                  </Link>
                </div>
              </article>
              <aside className="fi-notes-medium-note" aria-label="Catatan kurasi Medium">
                <span className="fi-notes-panel-label">Catatan Kurasi</span>
                <p>
                  Tulisan di rak ini dipilih karena membantu membaca pola yang sering muncul dalam
                  pekerjaan dr Ferdi: AI medis, beban administrasi, empati klinis, dan disiplin
                  membangun sistem yang bisa dipakai.
                </p>
              </aside>
            </div>
            <div className="fi-notes-medium-list">
              {mediumEntries.map((entry) => (
                <article className="fi-notes-medium-entry" key={entry.code}>
                  <div className="fi-notes-entry-meta">
                    <span className="fi-notes-entry-code">{entry.code}</span>
                    <span className="fi-notes-entry-date">{entry.date}</span>
                  </div>
                  <h3>{entry.title}</h3>
                  <p className="fi-notes-entry-synopsis">{entry.synopsis}</p>
                  <p className="fi-notes-entry-body">{entry.body}</p>
                  <Link
                    className="fi-notes-medium-link"
                    href={entry.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {entry.cta}
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="notes-closing-title"
            className="fi-notes-closing"
            id="notes-closing"
          >
            <div className="fi-notes-closing-copy">
              <span className="fi-notes-panel-label">Penutup</span>
              <h2 id="notes-closing-title">{notesClosing.title}</h2>
              <p>{notesClosing.body}</p>
            </div>
            <div className="fi-notes-closing-actions">
              <Link className="fi-button secondary" href={notesClosing.secondaryHref}>
                {notesClosing.secondaryLabel}
              </Link>
              <Link className="fi-button" href={notesClosing.primaryHref}>
                {notesClosing.primaryLabel}
              </Link>
            </div>
          </section>
        </div>

        <aside aria-label="Ringkasan catatan founder" className="fi-notes-glance">
          <div className="fi-notes-glance-head">
            <strong>Sekilas</strong>
            <span>Catatan</span>
          </div>
          {notesGlanceSections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </aside>
      </main>
      <Footer />
    </div>
  )
}
