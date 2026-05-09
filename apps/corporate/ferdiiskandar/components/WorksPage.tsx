import Link from 'next/link'
import type { CSSProperties } from 'react'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import WorksBlueprint from '@/components/WorksBlueprint'
import {
  worksCategories,
  worksGlanceSections,
  worksHero,
  worksIndexEntries,
  worksItems,
} from '@/lib/works-content'

const worksExplainerLines = [
  { text: 'Project dr', accent: false },
  { text: 'Ferdi Iskandar', accent: false },
  { text: '& Artificial The A Team', accent: true },
] as const

const worksProjectCredit = {
  lead: 'dr Ferdi Iskandar',
  defaultTeam: 'OpenAI Codex 5.4 Max + Claude Code 4.7 High',
  sentraAssistTeam: 'OpenAI Codex 5.4 Max + Claude Code 4.7 High + Moonlight Kimi 2.6',
} as const

function withDelay(delay: string): CSSProperties {
  return { '--fi-enter-delay': delay } as CSSProperties
}

export default function WorksPage() {
  return (
    <div className="fi-works-dossier" id="works-page">
      <Navbar />
      <main className="fi-works-dossier-shell" id="main-content">
        <aside aria-label="Works index" className="fi-works-index">
          <div className="fi-works-index-title">Works Index</div>
          <nav aria-label="Works categories" className="fi-works-index-nav">
            {worksIndexEntries.map((item) => (
              <Link href={item.href} key={item.number}>
                <span>{item.number}</span>
                <strong>{item.title}</strong>
                <em>{item.detail}</em>
              </Link>
            ))}
          </nav>
          <div className="fi-works-index-card">
            <p>
              Systems built for real conditions.
              <br />
              Intelligence that serves judgment.
              <br />
              Quiet reliability over spectacle.
            </p>
            <span aria-hidden="true">✧</span>
            <small>Builder&rsquo;s Registry</small>
          </div>
        </aside>

        <div className="fi-works-main">
          <header className="fi-works-hero" id="works-header">
            <div className="fi-works-hero-copy">
              <span className="fi-works-hero-section-label">{worksHero.sectionLabel}</span>
              <h1>{worksHero.title}</h1>
              <p className="fi-works-hero-thesis">{worksHero.thesis}</p>
              <p className="fi-works-hero-context">{worksHero.context}</p>
            </div>
            <div className="fi-works-hero-blueprint">
              <div className="fi-works-hero-integrated">
                <div className="fi-works-hero-integrated-copy">
                  <div className="fi-works-hero-display-block">
                    <div aria-hidden="true" className="fi-works-hero-display-rail">
                      <span
                        className="fi-works-hero-display-rail-line fi-hero-display-rail-line-live fi-enter-rule-grow"
                        style={withDelay('0.08s')}
                      />
                      <span
                        className="fi-works-hero-display-rail-node fi-enter-node"
                        style={withDelay('0.7s')}
                      />
                    </div>
                    <div className="fi-works-hero-display-copy">
                      <span
                        className="fi-works-hero-integrated-kicker fi-enter-up"
                        style={withDelay('0.08s')}
                      >
                        Section 03 / Systems Explainer
                      </span>
                      <div className="fi-works-hero-integrated-title">
                        {worksExplainerLines.map((line, index) => (
                          <span
                            className={`fi-works-hero-integrated-line fi-enter-reveal${line.accent ? ' is-accent' : ''}`}
                            key={line.text}
                            style={withDelay(`${0.12 + index * 0.12}s`)}
                          >
                            <span>{line.text}</span>
                            <span
                              aria-hidden="true"
                              className={`fi-works-hero-integrated-rule fi-line-live${line.accent ? ' is-accent' : ''} fi-enter-line-sweep`}
                              style={withDelay(`${0.24 + index * 0.12}s`)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p
                    className="fi-works-hero-integrated-body fi-enter-up"
                    style={withDelay('0.4s')}
                  >
                    These projects originate from an original applied-systems thesis, developed
                    through twelve years of executive hospital leadership and sustained medical
                    practice, then translated into accountable architectures for clinical,
                    operational, and public intelligence.
                  </p>
                </div>
                <aside
                  className="fi-works-hero-motion-note fi-enter-aside"
                  style={withDelay('0.34s')}
                >
                  <span>Institutional Signal</span>
                  <strong>Intelligence should support judgment, not perform theater.</strong>
                </aside>
              </div>
              <div className="fi-works-blueprint-panel">
                <div className="fi-works-blueprint-panel-head">
                  <span>Blueprint Excerpt</span>
                  <strong>AADI Symphony Pipeline</strong>
                </div>
                <WorksBlueprint startDelay={300} />
              </div>
            </div>
          </header>

          {worksCategories.map((cat) => {
            const items = worksItems.filter((w) => w.category === cat.id)
            if (items.length === 0) return null
            return (
              <section
                aria-labelledby={`cat-title-${cat.id}`}
                className="fi-works-category"
                id={`cat-${cat.id}`}
                key={cat.id}
              >
                <div className="fi-works-category-head">
                  <span className="fi-works-category-num">{cat.number}</span>
                  <div>
                    <h2 id={`cat-title-${cat.id}`}>{cat.label}</h2>
                    <p>{cat.description}</p>
                  </div>
                </div>
                <div className="fi-works-registry">
                  {items.map((work) => (
                    <article className="fi-works-registry-row" key={work.id}>
                      <div className="fi-works-registry-left">
                        <span className="fi-works-entry-num">{work.number}</span>
                        <span
                          aria-hidden="true"
                          className="fi-works-status-dot"
                          data-status={work.status}
                        />
                      </div>
                      <div className="fi-works-registry-body">
                        <div className="fi-works-registry-title-row">
                          <strong>{work.name}</strong>
                          <div className="fi-works-project-credit">
                            <span className="fi-works-entry-year">{work.year}</span>
                            <span className="fi-works-project-credit-item">
                              <em>Lead project</em>
                              <strong>{worksProjectCredit.lead}</strong>
                            </span>
                            <span className="fi-works-project-credit-item is-team">
                              <em>Team</em>
                              <strong>
                                {work.id === 'sentra-assist'
                                  ? worksProjectCredit.sentraAssistTeam
                                  : worksProjectCredit.defaultTeam}
                              </strong>
                            </span>
                          </div>
                        </div>
                        <p className="fi-works-tagline">{work.tagline}</p>
                        <p className="fi-works-desc">{work.description}</p>
                      </div>
                      {work.url && (
                        <a
                          className="fi-works-link"
                          href={work.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          &#8599;
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <aside aria-label="Works at a glance" className="fi-works-glance">
          <div className="fi-works-glance-head">
            <strong>At a Glance</strong>
            <span>Builder&rsquo;s registry</span>
          </div>
          {worksGlanceSections.map((section) => (
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
