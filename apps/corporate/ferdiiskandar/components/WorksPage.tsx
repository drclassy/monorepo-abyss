import Link from 'next/link'
import type { CSSProperties } from 'react'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import WorksBlueprint from '@/components/WorksBlueprint'
import {
  worksCategories,
  worksGlanceSections,
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
        <aside aria-label="Indeks karya" className="fi-works-index">
          <div className="fi-works-index-title">Indeks Karya</div>
          <nav aria-label="Kategori karya" className="fi-works-index-nav">
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
              Sistem dibangun untuk kondisi nyata.
              <br />
              Kecerdasan yang melayani penilaian.
              <br />
              Keandalan tenang sebelum tontonan.
            </p>
            <span aria-hidden="true">✧</span>
            <small>Registri Pembangun</small>
          </div>
        </aside>

        <div className="fi-works-main">
          <header className="fi-works-hero" id="works-header">
            <h1 className="fi-prompt-sr-only">Karya — sistem terbangun</h1>
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
                        Bagian 03 / Penjelasan Sistem
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
                    Proyek-proyek ini berangkat dari tesis sistem terapan yang orisinal, dibentuk
                    melalui 12 tahun kepemimpinan eksekutif rumah sakit dan praktik medis
                    berkelanjutan, lalu diterjemahkan menjadi arsitektur yang akuntabel untuk
                    kecerdasan klinis, operasional, dan publik.
                  </p>
                </div>
                <aside
                  className="fi-works-hero-motion-note fi-enter-aside"
                  style={withDelay('0.34s')}
                >
                  <span>Sinyal Institusional</span>
                  <strong>
                    Kecerdasan seharusnya mendukung penilaian, bukan memainkan panggung.
                  </strong>
                </aside>
              </div>
              <div className="fi-works-blueprint-panel">
                <div className="fi-works-blueprint-panel-head">
                  <span>Cuplikan Blueprint</span>
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
                              <em>Lead proyek</em>
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

        <aside aria-label="Ringkasan karya" className="fi-works-glance">
          <div className="fi-works-glance-head">
            <strong>Sekilas</strong>
            <span>Registri pembangun</span>
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
