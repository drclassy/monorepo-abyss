import Image from 'next/image'
import Link from 'next/link'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import {
  aboutAuthoritySignals,
  aboutClosing,
  aboutGlanceSections,
  aboutHero,
  aboutIndexEntries,
  aboutManifesto,
  aboutPrinciples,
  aboutRegistryPanels,
  aboutSystemsBridge,
} from '@/lib/about-content'

export default function AboutPage() {
  return (
    <div className="fi-page-about fi-about-dossier" id="about-page">
      <Navbar />
      <main className="fi-about-dossier-shell" id="main-content">
        <aside aria-label="About dossier index" className="fi-about-index">
          <div className="fi-about-index-title">About Index</div>
          <nav aria-label="About sections" className="fi-about-index-nav">
            {aboutIndexEntries.map((item) => (
              <Link href={item.href} key={item.number}>
                <span>{item.number}</span>
                <strong>{item.title}</strong>
                <em>{item.detail}</em>
              </Link>
            ))}
          </nav>
          <div className="fi-about-index-card">
            <p>
              Accountability dalam architecture.
              <br />
              Judgment dalam ruang publik.
              <br />
              Quiet systems untuk care.
            </p>
            <span aria-hidden="true">✧</span>
            <small>Founder Dossier</small>
          </div>
        </aside>

        <div className="fi-about-main">
          <header className="fi-about-hero" id="about-foreword">
            <div className="fi-about-titleblock">
              <span className="fi-about-section-label">Section 04</span>
              <h1 id="about-hero-title">{aboutHero.title}</h1>
              <p className="fi-about-thesis">{aboutHero.thesis}</p>
              <p className="fi-about-context">{aboutHero.context}</p>
              <div className="fi-about-executive-bio" aria-label="Executive profile short bio">
                <span className="fi-about-panel-label">Executive Profile</span>
                <p>{aboutHero.executiveBio}</p>
              </div>
              <div className="fi-about-rule">
                <span>{aboutHero.eyebrow}</span>
              </div>
            </div>
            <aside className="fi-about-portrait-panel" aria-label="Founder portrait">
              <figure className="fi-about-portrait-frame">
                <Image
                  alt="Portrait of dr. Ferdi Iskandar"
                  className="fi-about-portrait-image"
                  height={1117}
                  priority
                  src="/ceo.png"
                  width={1920}
                />
              </figure>
              <blockquote className="fi-about-quote">
                <span aria-hidden="true">&ldquo;</span>
                <p>
                  Teknologi tidak seharusnya bersaing dengan care untuk merebut perhatian. Ia
                  seharusnya membuat signal lebih jelas, judgment lebih mantap, dan tanggung jawab
                  lebih sulit dihindari.
                </p>
                <cite>Founder worldview</cite>
              </blockquote>
            </aside>
          </header>

          <section
            aria-labelledby="about-registry-title"
            className="fi-about-registry"
            id="about-registry"
          >
            <div className="fi-about-registry-head">
              <h2 id="about-registry-title">The Founder Registry</h2>
              <span>Positioning as structured record</span>
            </div>
            <div className="fi-about-registry-grid">
              {aboutRegistryPanels.map((panel) => (
                <article className="fi-about-registry-panel" key={panel.number}>
                  <span>{panel.number}</span>
                  <h3>{panel.title}</h3>
                  <p>{panel.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="about-articles-title"
            className="fi-about-articles"
            id="about-articles"
          >
            <div className="fi-about-articles-head">
              <h2 id="about-articles-title">Operating Articles</h2>
              <span>Worldview translated into public logic</span>
            </div>
            <div className="fi-about-articles-grid">
              <article className="fi-about-manifesto-panel">
                <div className="fi-about-panel-label">Manifesto</div>
                <div className="fi-about-manifesto-copy">
                  {aboutManifesto.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
              <article className="fi-about-principles-panel">
                <div className="fi-about-panel-label">Operating Logic</div>
                <div className="fi-about-principles-list">
                  {aboutPrinciples.map((principle, index) => (
                    <div className="fi-about-principle-row" key={principle.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{principle.title}</h3>
                        <p>{principle.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section
            aria-labelledby="about-bridge-title"
            className="fi-about-bridge"
            id="about-bridge"
          >
            <div className="fi-about-bridge-copy">
              <span className="fi-about-panel-label">Systems Bridge</span>
              <h2 id="about-bridge-title">{aboutSystemsBridge.title}</h2>
              <p>{aboutSystemsBridge.body}</p>
            </div>
            <div className="fi-about-bridge-actions">
              <Link className="fi-button secondary" href={aboutSystemsBridge.fallbackHref}>
                {aboutSystemsBridge.label}
              </Link>
              <Link className="fi-button" href={aboutClosing.fallbackHref}>
                {aboutClosing.label}
              </Link>
            </div>
          </section>
        </div>

        <aside aria-label="Founder dossier at a glance" className="fi-about-glance">
          <div className="fi-about-glance-head">
            <strong>At a Glance</strong>
            <span>Founder dossier</span>
          </div>
          {aboutGlanceSections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
          <section className="fi-about-glance-authority">
            <h3>Authority Signals</h3>
            <ul>
              {aboutAuthoritySignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
      <Footer />
    </div>
  )
}
