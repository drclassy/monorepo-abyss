// Architected and built by dr Classy

import Link from 'next/link'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import {
  mediumArchive,
  mediumEntries,
  mediumFeaturedPost,
  notesClosing,
  notesGlanceSections,
  notesHero,
  notesIndexEntries,
  notesLedgerCards,
  notesReadingOrder,
  notesSignals,
} from '@/lib/notes-content'

export default function NotesPage() {
  return (
    <div className="fi-page-notes fi-notes-dossier" id="notes-page">
      <Navbar />
      <main className="fi-notes-dossier-shell" id="main-content">
        <aside aria-label="Notes archive index" className="fi-notes-index">
          <div className="fi-notes-index-title">Indeks Catatan</div>
          <nav aria-label="Notes sections" className="fi-notes-index-nav">
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
              Arsip sebelum algoritma.
              <br />
              Kejelasan sebelum kecepatan.
              <br />
              Isi sebelum teatrikal.
            </p>
            <span aria-hidden="true">✧</span>
            <small>Catatan dr Classy</small>
          </div>
        </aside>

        <div className="fi-notes-main">
          <header className="fi-notes-hero" id="notes-foreword">
            <div className="fi-notes-hero-copy">
              <span className="fi-notes-section-label">Section 05</span>
              <h1>{notesHero.title}</h1>
              <p className="fi-notes-hero-thesis">{notesHero.thesis}</p>
              <p className="fi-notes-hero-context">{notesHero.context}</p>
            </div>
            <aside className="fi-notes-hero-aside" aria-label="Notes foreword abstract">
              <span className="fi-notes-panel-label">{notesHero.eyebrow}</span>
              <p>{notesHero.abstract}</p>
              <ul>
                {notesSignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </aside>
          </header>

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
                <span className="fi-notes-panel-label">Rak Medium</span>
                <div className="fi-notes-entry-meta">
                  <span className="fi-notes-entry-code">{mediumFeaturedPost.code}</span>
                  <span className="fi-notes-entry-date">{mediumFeaturedPost.date}</span>
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
              <aside className="fi-notes-medium-note" aria-label="Medium curation note">
                <span className="fi-notes-panel-label">Curation Note</span>
                <p>
                  Semua item Medium di halaman ini dipasang manual. Tidak ada bagian yang muncul
                  otomatis, tidak ada feed dinamis, dan tidak ada sinkronisasi otomatis ke halaman
                  catatan ini.
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

        <aside aria-label="Founder notes at a glance" className="fi-notes-glance">
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
