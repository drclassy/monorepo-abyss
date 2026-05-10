import Image from 'next/image'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { cvCredentials } from '@/lib/cv-content'
import {
  signatureLines,
  signatureTransformation,
  speakerBackground,
  speakerProfile,
  speakingFormats,
  speakingGlanceSections,
  speakingHero,
  speakingIndexEntries,
  speakingInvite,
  speakingTakeaways,
  speakingTopics,
  selectedTalks,
} from '@/lib/speaking-content'

export default function SpeakingPage() {
  return (
    <div className="fi-speaking-dossier" id="speaking-page">
      <Navbar />
      <main className="fi-speaking-dossier-shell" id="main-content">
        {/* LEFT — Index Sidebar */}
        <aside aria-label="Speaking index" className="fi-speaking-index">
          <div className="fi-speaking-index-title">Speaking Index</div>
          <nav aria-label="Speaking sections" className="fi-speaking-index-nav">
            {speakingIndexEntries.map((item) => (
              <Link href={item.href} key={item.number}>
                <span>{item.number}</span>
                <strong>{item.title}</strong>
                <em>{item.detail}</em>
              </Link>
            ))}
          </nav>
          <div className="fi-speaking-index-card">
            <p>
              Platform before the stage.
              <br />
              Clinical clarity before technical language.
              <br />
              Conscience above automation.
            </p>
            <span aria-hidden="true">✧</span>
            <small>Speaker Registry</small>
          </div>
        </aside>

        {/* CENTER — Main */}
        <div className="fi-speaking-main">
          {/* HERO */}
          <header className="fi-speaking-hero" id="speaking-hero">
            <div className="fi-speaking-hero-copy">
              <span className="fi-speaking-section-label">{speakingHero.sectionLabel}</span>
              <h1>{speakingHero.title}</h1>
              <p className="fi-speaking-hero-subtitle">{speakingHero.subtitle}</p>
              <p className="fi-speaking-hero-thesis">{speakingHero.thesis}</p>
              <p className="fi-speaking-hero-context">{speakingHero.context}</p>
            </div>
            <div className="fi-speaking-hero-profile">
              <div className="fi-speaking-hero-photo">
                <Image
                  alt="dr. Ferdi Iskandar — Speaker"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 50vw"
                  src="/drferdi.png"
                  style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                />
              </div>
              <div className="fi-speaking-hero-credentials">
                <strong>{speakerProfile.name}</strong>
                <p className="fi-speaking-hero-credentials-shorthand">
                  {cvCredentials.map((c) => c.code).join(' · ')}
                </p>
              </div>
            </div>
          </header>

          {/* SECTION 01 — Signature Theme */}
          <section
            aria-labelledby="speaking-theme-title"
            className="fi-speaking-theme"
            id="speaking-theme"
          >
            <div className="fi-speaking-section-head">
              <h2 id="speaking-theme-title">Signature Speaking Theme</h2>
              <span>Section 01</span>
            </div>
            <div className="fi-speaking-theme-body">
              <p className="fi-speaking-theme-statement">
                For decades, healthcare has been built around a reactive model. The next frontier is
                not only better treatment — it is earlier anticipation. Clinical Trajectory asks the
                deeper question: <em>&ldquo;Where is this patient heading?&rdquo;</em>
              </p>
              <div className="fi-speaking-transformation">
                <div aria-hidden="true" className="fi-speaking-transform-head">
                  <span>From</span>
                  <span>To</span>
                </div>
                {signatureTransformation.map((row) => (
                  <div className="fi-speaking-transform-row" key={row.from}>
                    <span className="fi-speaking-transform-from">{row.from}</span>
                    <span aria-hidden="true" className="fi-speaking-transform-arrow">
                      →
                    </span>
                    <span className="fi-speaking-transform-to">{row.to}</span>
                  </div>
                ))}
              </div>
              <p className="fi-speaking-theme-abstract">
                Healthcare AI should not merely automate existing workflows. It should help
                healthcare systems become more preventive, more intelligent, and more responsive to
                early signs of clinical risk — while keeping doctors at the center of every
                decision.
              </p>
            </div>
          </section>

          {/* SECTION 02 — Speaking Topics */}
          <section
            aria-labelledby="speaking-topics-title"
            className="fi-speaking-topics"
            id="speaking-topics"
          >
            <div className="fi-speaking-section-head">
              <h2 id="speaking-topics-title">Speaking Topics</h2>
              <span>Section 02 &middot; 8 Core Areas</span>
            </div>
            <div className="fi-speaking-topic-registry">
              {speakingTopics.map((topic) => (
                <article className="fi-speaking-topic-row" key={topic.number}>
                  <span className="fi-speaking-entry-num">{topic.number}</span>
                  <div className="fi-speaking-topic-body">
                    <strong>{topic.title}</strong>
                    <p>{topic.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 03 — Formats */}
          <section
            aria-labelledby="speaking-formats-title"
            className="fi-speaking-formats"
            id="speaking-formats"
          >
            <div className="fi-speaking-section-head">
              <h2 id="speaking-formats-title">Speaking Formats</h2>
              <span>Section 03 &middot; 6 Formats</span>
            </div>
            <div className="fi-speaking-formats-table">
              <div aria-hidden="true" className="fi-speaking-format-head">
                <span className="fi-speaking-panel-label">Format</span>
                <span className="fi-speaking-panel-label">Duration</span>
                <span className="fi-speaking-panel-label">Best For</span>
              </div>
              {speakingFormats.map((fmt) => (
                <div className="fi-speaking-format-row" key={fmt.format}>
                  <span className="fi-speaking-format-name">{fmt.format}</span>
                  <span className="fi-speaking-format-duration">{fmt.duration}</span>
                  <span className="fi-speaking-format-best">{fmt.bestFor}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 04 — Audience Takeaways */}
          <section
            aria-labelledby="speaking-takeaways-title"
            className="fi-speaking-takeaways"
            id="speaking-takeaways"
          >
            <div className="fi-speaking-section-head">
              <h2 id="speaking-takeaways-title">Audience Takeaways</h2>
              <span>Section 04 &middot; What Audiences Will Understand</span>
            </div>
            <div className="fi-speaking-takeaway-grid">
              {speakingTakeaways.map((item) => (
                <article className="fi-speaking-takeaway-card" key={item.number}>
                  <span className="fi-speaking-entry-num">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 05 — Selected Talks */}
          <section
            aria-labelledby="speaking-events-title"
            className="fi-speaking-events"
            id="speaking-events"
          >
            <div className="fi-speaking-section-head">
              <h2 id="speaking-events-title">Selected Talks</h2>
              <span>Section 05 &middot; Speaking Record</span>
            </div>
            <div className="fi-speaking-events-list">
              {selectedTalks.map((event) => (
                <article className="fi-speaking-event-card" key={event.id}>
                  <div className="fi-speaking-event-meta">
                    <span className="fi-speaking-entry-num">{event.number}</span>
                    <span className="fi-speaking-event-status" data-status={event.status}>
                      {event.status === 'past'
                        ? 'Past'
                        : event.status === 'confirmed'
                          ? 'Confirmed'
                          : 'Forthcoming'}
                    </span>
                    <span className="fi-speaking-event-type">{event.type}</span>
                  </div>
                  <div className="fi-speaking-event-body">
                    <h3>{event.title}</h3>
                    <p className="fi-speaking-event-subtitle">{event.subtitle}</p>
                    <p className="fi-speaking-event-desc">{event.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 06 — Invite */}
          <section
            aria-labelledby="speaking-invite-title"
            className="fi-speaking-invite"
            id="speaking-invite"
          >
            <div className="fi-speaking-section-head">
              <h2 id="speaking-invite-title">Invite to Speak</h2>
              <span>Section 05</span>
            </div>
            <div className="fi-speaking-invite-body">
              <div className="fi-speaking-invite-left">
                <p className="fi-speaking-invite-desc">{speakingInvite.body}</p>
                <div className="fi-speaking-invite-contacts">
                  <div className="fi-speaking-invite-contact-row">
                    <small>Website</small>
                    <span>{speakingInvite.website}</span>
                  </div>
                  <div className="fi-speaking-invite-contact-row">
                    <small>Email</small>
                    <a href={`mailto:${speakingInvite.email}`}>{speakingInvite.email}</a>
                  </div>
                  <div className="fi-speaking-invite-contact-row">
                    <small>Focus Areas</small>
                    <span>{speakingInvite.focusAreas}</span>
                  </div>
                </div>
              </div>
              <div className="fi-speaking-invite-right">
                <span className="fi-speaking-panel-label">Speaker Background</span>
                <div className="fi-speaking-bg-table">
                  {speakerBackground.map((item) => (
                    <div className="fi-speaking-bg-row" key={item.area}>
                      <span className="fi-speaking-bg-area">{item.area}</span>
                      <span className="fi-speaking-bg-detail">{item.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="fi-speaking-signature-lines">
              <span className="fi-speaking-panel-label">Selected Signature Lines</span>
              {signatureLines.map((line) => (
                <blockquote className="fi-speaking-signature-line" key={line}>
                  {line}
                </blockquote>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT — Glance Sidebar */}
        <aside aria-label="Speaking at a glance" className="fi-speaking-glance">
          <div className="fi-speaking-glance-head">
            <strong>At a Glance</strong>
            <span>Speaker profile</span>
          </div>
          {speakingGlanceSections.map((section) => (
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
