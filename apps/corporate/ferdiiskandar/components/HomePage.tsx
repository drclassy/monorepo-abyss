import Link from 'next/link'

import AbbyWidget from '@/components/AbbyWidget'
import ClassyNewsSpotlight from '@/components/ClassyNewsSpotlight'
import Contact from '@/components/Contact'
import Expertise from '@/components/Expertise'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Impact from '@/components/Impact'
import Navbar from '@/components/Navbar'
import Portfolio from '@/components/Portfolio'
import ScrollReveal from '@/components/ScrollReveal'
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
            <p className="fi-home-preface-kicker">Dossier Pendiri / Peta Isi Beranda</p>
            <div>
              <h2 id="home-dossier-title">Clinical Intelligence, Built from Real Practice</h2>
              <p>
                Sebuah ringkasan terkurasi mengenai pemikiran, sistem, dan inisiatif yang dibangun
                dr Ferdi Iskandar melalui Sentra Artificial Intelligence.
              </p>
            </div>
          </div>

          <div className="fi-home-preface-grid">
            <article className="fi-home-preface-card">
              <span>Posisi</span>
              <strong>{siteIdentity.headline}</strong>
              <p>
                Dibangun dari tanggung jawab klinis, kepercayaan publik, dan cara berpikir sistem
                yang dipimpin pendiri, bukan sekadar penanda personal-brand yang generik.
              </p>
            </article>

            <article className="fi-home-preface-card">
              <span>Peta Isi</span>
              <nav aria-label="Peta isi beranda">
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
              <span>Basis & Fokus</span>
              <strong>Kediri, Jawa Timur, Indonesia</strong>
              <p>
                Berfokus pada pengembangan healthcare AI, clinical decision support, dan AI-native
                healthcare operations untuk mendukung sistem kesehatan yang lebih terkoordinasi,
                manusiawi, dan adaptif.
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
          <Portfolio />
        </ScrollReveal>
        <ScrollReveal>
          <StoryOfSentra />
        </ScrollReveal>
        <ScrollReveal>
          <ClassyNewsSpotlight />
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
