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
      ? 'Current'
      : status === 'in-preparation'
        ? 'In Preparation'
        : status === 'under-review'
          ? 'Under Review'
          : status === 'published'
            ? 'Published'
            : 'Past'
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
        <aside aria-label="CV index" className="fi-cv-index">
          <div className="fi-cv-index-title">CV Index</div>
          <nav aria-label="CV sections" className="fi-cv-index-nav">
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
              Law before medicine.
              <br />
              Medicine before leadership.
              <br />
              Leadership before intelligence.
            </p>
            <span aria-hidden="true">✧</span>
            <small>Credential Registry</small>
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
              <p className="fi-cv-hero-title">{cvHero.title}</p>
              <p className="fi-cv-hero-thesis">{cvHero.thesis}</p>
              <p className="fi-cv-hero-context">{cvHero.context}</p>
            </div>
            <div className="fi-cv-hero-portrait">
              <div className="fi-cv-hero-photo">
                <Image
                  alt="dr. Ferdi Iskandar"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 45vw"
                  src="/drferdi-friends.png"
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
              <h2 id="cv-profile-title">Profile</h2>
              <span>Section 01 &middot; Executive Summary</span>
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
              <h2 id="cv-experience-title">Experience</h2>
              <span>Section 02 &middot; Career Timeline</span>
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
              <h2 id="cv-education-title">Education</h2>
              <span>Section 03 &middot; Academic Record</span>
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
              <h2 id="cv-research-title">Research &amp; Publications</h2>
              <span>Section 04</span>
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
              <h2 id="cv-download-title">Full CV</h2>
              <span>Section 05 &middot; PDF Document</span>
            </div>
            <div className="fi-cv-download-body">
              <div className="fi-cv-download-copy">
                <span className="fi-cv-panel-label">Credential Document</span>
                <p>
                  A full curriculum vitae is available upon request for institutional, academic, or
                  professional purposes.
                </p>
              </div>
              <div className="fi-cv-download-actions">
                <a
                  aria-disabled="true"
                  className="fi-button secondary fi-cv-download-btn"
                  href="#cv-download"
                >
                  Download PDF <span aria-hidden="true">↓</span>
                </a>
                <p className="fi-cv-download-note">
                  File available upon request &mdash; contact via the speaking page or direct email.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT — Glance Sidebar */}
        <aside aria-label="CV at a glance" className="fi-cv-glance">
          <div className="fi-cv-glance-head">
            <strong>At a Glance</strong>
            <span>Credential summary</span>
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
