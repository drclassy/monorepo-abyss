import Image from 'next/image'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import {
  cvCredentials,
  cvEducation,
  cvExperience,
  cvGlanceSections,
  cvHero,
  cvIndexEntries,
  cvProfile,
  cvPublications,
} from '@/lib/cv-content'

function StatusBadge({ status }: { status: string }) {
  const label =
    status === 'current'
      ? 'Saat Ini'
      : status === 'in-preparation'
        ? 'Dalam Persiapan'
        : status === 'under-review'
          ? 'Dalam Tinjauan'
          : status === 'published'
            ? 'Terbit'
            : 'Selesai'
  return (
    <span className="fi-cv-badge" data-status={status}>
      {label}
    </span>
  )
}

export default function CVPage() {
  return (
    <div className="fi-cv-dossier" id="cv-page">
      <Navbar />
      <main className="fi-cv-dossier-shell" id="main-content">
        {/* LEFT — Index Sidebar */}
        <aside aria-label="Indeks CV" className="fi-cv-index">
          <div className="fi-cv-index-title">Indeks CV</div>
          <nav aria-label="Bagian CV" className="fi-cv-index-nav">
            {cvIndexEntries.map((item) => (
              <Link href={item.href} key={item.number}>
                <span>{item.number}</span>
                <strong>{item.title}</strong>
                <em>{item.detail}</em>
              </Link>
            ))}
          </nav>
          <div className="fi-cv-index-card">
            <p>
              Setiap gelar ditempuh.
              <br />
              Setiap standar dibuktikan.
            </p>
            <span aria-hidden="true">✧</span>
            <small>Registri Kredensial</small>
          </div>
        </aside>

        {/* CENTER — Main */}
        <div className="fi-cv-main">
          {/* HERO */}
          <header className="fi-cv-hero" id="cv-header">
            <div className="fi-cv-hero-copy">
              <span className="fi-cv-section-label">{cvHero.sectionLabel}</span>
              <h1>{cvHero.name}</h1>
              <p className="fi-cv-hero-credentials">{cvHero.credentials}</p>
              <p className="fi-cv-hero-profile-eyebrow">{cvHero.profileEyebrow}</p>
              <p className="fi-cv-hero-thesis fi-cv-hero-intersection">
                {cvHero.profileIntersectionLines[0]}
                <br />
                {cvHero.profileIntersectionLines[1]}
              </p>
              <p className="fi-cv-hero-context fi-cv-hero-prose-id">{cvHero.profileBody}</p>
              <div className="fi-cv-hero-motto">
                <p className="fi-cv-hero-motto-line">{cvHero.profileMottoLines[0]}</p>
                <p className="fi-cv-hero-motto-line">{cvHero.profileMottoLines[1]}</p>
              </div>
              <p className="fi-cv-hero-context fi-cv-hero-prose-id">{cvHero.profileClosing}</p>
            </div>
            <div className="fi-cv-hero-portrait">
              <div className="fi-cv-hero-photo">
                <Image
                  alt="dr. Ferdi Iskandar"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 45vw"
                  src="/cdrferdi.png"
                  style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                />
              </div>
              <div className="fi-cv-hero-credential-strip">
                {cvCredentials.map((c) => (
                  <div className="fi-cv-credential-item" key={c.code}>
                    <strong>{c.code}</strong>
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* SECTION 01 — Profile */}
          <section aria-labelledby="cv-profile-title" className="fi-cv-profile" id="cv-profile">
            <div className="fi-cv-section-head">
              <h2 id="cv-profile-title">Profil</h2>
              <span>Bagian 01 &middot; Ringkasan Eksekutif</span>
            </div>
            <div className="fi-cv-profile-body">
              <aside className="fi-cv-profile-aside">
                <span className="fi-cv-panel-label">{cvProfile.eyebrow}</span>
                <p className="fi-cv-profile-tagline">{cvProfile.tagline}</p>
              </aside>
              <div className="fi-cv-profile-copy">
                {cvProfile.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 02 — Experience */}
          <section
            aria-labelledby="cv-experience-title"
            className="fi-cv-experience"
            id="cv-experience"
          >
            <div className="fi-cv-section-head">
              <h2 id="cv-experience-title">Pengalaman</h2>
              <span>Bagian 02 &middot; Linimasa Karier</span>
            </div>
            <div className="fi-cv-timeline">
              {cvExperience.map((item) => (
                <article className="fi-cv-timeline-row" key={item.id}>
                  <div className="fi-cv-timeline-meta">
                    <span className="fi-cv-entry-num">{item.number}</span>
                    <StatusBadge status={item.status} />
                    <span className="fi-cv-timeline-years">{item.years}</span>
                  </div>
                  <div className="fi-cv-timeline-body">
                    <div className="fi-cv-timeline-title-row">
                      <strong>{item.role}</strong>
                      <em>{item.organization}</em>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 03 — Education */}
          <section
            aria-labelledby="cv-education-title"
            className="fi-cv-education"
            id="cv-education"
          >
            <div className="fi-cv-section-head">
              <h2 id="cv-education-title">Pendidikan</h2>
              <span>Bagian 03 &middot; Rekam Akademik</span>
            </div>
            <div className="fi-cv-timeline">
              {cvEducation.map((item) => (
                <article className="fi-cv-timeline-row" key={item.id}>
                  <div className="fi-cv-timeline-meta">
                    <span className="fi-cv-entry-num">{item.number}</span>
                    <span className="fi-cv-timeline-years">{item.years}</span>
                  </div>
                  <div className="fi-cv-timeline-body">
                    <div className="fi-cv-timeline-title-row">
                      <strong>{item.degree}</strong>
                      <em>
                        {item.field} &middot; {item.institution}
                      </em>
                    </div>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 04 — Research & Publications */}
          <section aria-labelledby="cv-research-title" className="fi-cv-research" id="cv-research">
            <div className="fi-cv-section-head">
              <h2 id="cv-research-title">Riset &amp; Publikasi</h2>
              <span>Bagian 04</span>
            </div>
            <div className="fi-cv-publications">
              {cvPublications.map((pub) => (
                <article className="fi-cv-pub-card" key={pub.id}>
                  <div className="fi-cv-pub-meta">
                    <span className="fi-cv-entry-num">{pub.number}</span>
                    <StatusBadge status={pub.status} />
                    <span className="fi-cv-timeline-years">{pub.year}</span>
                  </div>
                  <div className="fi-cv-pub-body">
                    <h3>{pub.title}</h3>
                    <p className="fi-cv-pub-subtitle">{pub.subtitle}</p>
                    <div className="fi-cv-pub-tags">
                      {pub.tags.map((tag) => (
                        <span className="fi-cv-pub-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="fi-cv-pub-abstract">{pub.abstract}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 05 — Download */}
          <section aria-labelledby="cv-download-title" className="fi-cv-download" id="cv-download">
            <div className="fi-cv-section-head">
              <h2 id="cv-download-title">CV Lengkap</h2>
              <span>Bagian 05 &middot; Dokumen PDF</span>
            </div>
            <div className="fi-cv-download-body">
              <div className="fi-cv-download-copy">
                <span className="fi-cv-panel-label">Dokumen Kredensial</span>
                <p>
                  Curriculum vitae lengkap tersedia atas permintaan untuk kebutuhan institusional,
                  akademik, atau profesional.
                </p>
              </div>
              <div className="fi-cv-download-actions">
                <a
                  aria-disabled="true"
                  className="fi-button secondary fi-cv-download-btn"
                  href="#cv-download"
                >
                  Unduh PDF <span aria-hidden="true">↓</span>
                </a>
                <p className="fi-cv-download-note">
                  Berkas tersedia atas permintaan melalui halaman speaking atau email langsung.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT — Glance Sidebar */}
        <aside aria-label="Ringkasan CV" className="fi-cv-glance">
          <div className="fi-cv-glance-head">
            <strong>Sekilas</strong>
            <span>Ringkasan kredensial</span>
          </div>
          {cvGlanceSections.map((section) => (
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
