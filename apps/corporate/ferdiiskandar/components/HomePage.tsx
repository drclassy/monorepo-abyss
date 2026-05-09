import Link from 'next/link'

import AbbyWidget from '@/components/AbbyWidget'
import Contact from '@/components/Contact'
import Expertise from '@/components/Expertise'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Impact from '@/components/Impact'
import Navbar from '@/components/Navbar'
import Portfolio from '@/components/Portfolio'
import ScrollReveal from '@/components/ScrollReveal'
import SentraSimSection from '@/components/SentraSimSection'
import StoryOfSentra from '@/components/StoryOfSentra'
import { sectionIds, siteIdentity } from '@/lib/site-content'

const homeReadingOrder = sectionIds.filter((section) => section.id !== 'top')

export default function HomePage() {
  return (
    <div id="ferdi-editorial-site">
      <div aria-hidden="true" id="top" />
      <Navbar />
      <main className="fi-shell" id="main-content">
        <Hero />
        <section aria-labelledby="home-dossier-title" className="fi-home-preface">
          <div className="fi-home-preface-head">
            <p className="fi-home-preface-kicker">Founder Dossier / Homepage Reading Order</p>
            <div>
              <h2 id="home-dossier-title">
                A homepage that reads like an operating brief, not a brochure.
              </h2>
              <p>
                The landing experience is arranged as an editorial sequence: leadership context
                first, then thinking system, then institutional simulations, selected systems,
                founder narrative, and finally the right conversation channel.
              </p>
            </div>
          </div>

          <div className="fi-home-preface-grid">
            <article className="fi-home-preface-card">
              <span>Position</span>
              <strong>{siteIdentity.headline}</strong>
              <p>
                Built around clinical responsibility, public trust, and founder-led systems thinking
                rather than generic personal-brand signaling.
              </p>
            </article>

            <article className="fi-home-preface-card">
              <span>Reading Order</span>
              <nav aria-label="Homepage reading order">
                <ul className="fi-home-preface-index">
                  {homeReadingOrder.map((section, index) => (
                    <li key={section.id}>
                      <Link href={`/#${section.id}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{section.label}</strong>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </article>

            <article className="fi-home-preface-card">
              <span>Current Signal</span>
              <strong>{siteIdentity.location}</strong>
              <p>
                {siteIdentity.tagline}. The page is meant to feel like a guided dossier for
                healthcare leadership, applied intelligence, and human-AI collaboration.
              </p>
            </article>
          </div>
        </section>
        <ScrollReveal>
          <Impact />
        </ScrollReveal>
        <ScrollReveal>
          <Expertise />
        </ScrollReveal>
        <ScrollReveal>
          <SentraSimSection />
        </ScrollReveal>
        <ScrollReveal>
          <Portfolio />
        </ScrollReveal>
        <ScrollReveal>
          <StoryOfSentra />
        </ScrollReveal>
        <ScrollReveal>
          <Contact />
        </ScrollReveal>
        <AbbyWidget />
      </main>
      <Footer />
    </div>
  )
}
