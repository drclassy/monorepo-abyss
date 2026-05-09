'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

import CountUp from '@/components/CountUp'
import SectionNumberMark from '@/components/SectionNumberMark'
import {
  getRevealInitial,
  motionVariants,
  staggerContainer,
  motionViewport,
  transitions,
} from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'

export default function Portfolio() {
  const shouldReduce = useReducedMotion()
  const isMotionReady = useMotionReady()
  const mv = shouldReduce ? undefined : motionVariants
  const revealInitial = getRevealInitial(isMotionReady, shouldReduce, 'hidden')

  return (
    <section
      aria-labelledby="systems-dossier-title"
      className="fi-section fi-systems-dossier"
      id="portfolio"
    >
      {/* ── LEFT: Dossier Index ── */}
      <motion.aside
        aria-label="Systems registry dossier index"
        className="fi-dossier-index"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={mv?.slideIn}
        transition={shouldReduce ? { duration: 0 } : transitions.medium}
      >
        <div className="fi-dossier-index-title">Dossier Index</div>
        <nav aria-label="Registry sections" className="fi-dossier-nav">
          <Link href="#portfolio">
            <span>01</span>
            <strong>Foreword</strong>
            <em>Why we build systems under responsibility</em>
          </Link>
          <Link href="#featured-systems">
            <span>02</span>
            <strong>Feature</strong>
            <em>Two flagship systems</em>
          </Link>
          <Link href="#registry-all-systems">
            <span>03</span>
            <strong>The Registry</strong>
            <em>Cross-sector systems at a glance</em>
          </Link>
          <Link href="#registry-foundations">
            <span>04</span>
            <strong>Built on Foundations</strong>
            <em>Data. Safety. Human oversight.</em>
          </Link>
          <Link href="#registry-roadmap">
            <span>05</span>
            <strong>Looking Ahead</strong>
            <em>Our roadmap of care</em>
          </Link>
        </nav>
        <div className="fi-dossier-card">
          <p>
            Transparent by design.
            <br />
            Accountable by choice.
            <br />
            Built for real sectors.
          </p>
          <span aria-hidden="true">✧</span>
          <small>Sentra Healthcare AI</small>
        </div>
      </motion.aside>

      {/* ── CENTER: Dossier Main ── */}
      <div className="fi-dossier-main">
        {/* Header */}
        <motion.header
          className="fi-dossier-hero fi-dossier-hero-numbered"
          initial={revealInitial}
          whileInView="visible"
          viewport={motionViewport}
          variants={mv?.fadeUp}
          transition={shouldReduce ? { duration: 0 } : transitions.medium}
        >
          <SectionNumberMark number="04" />
          <div className="fi-dossier-titleblock">
            <span className="fi-dossier-section">Systems Registry</span>
            <h2 id="systems-dossier-title">
              Not products for show.
              <br />
              <em>Systems across sectors.</em>
              <span aria-hidden="true">✷</span>
            </h2>
            <p>
              Dari healthcare systems dan education systems hingga workforce systems dan digital
              experience yang berhadapan langsung dengan publik, setiap system dalam registry ini
              dirancang untuk menjawab masalah operasional nyata dengan accountability, clarity, dan
              manusia tetap di pusatnya.
            </p>
            <div className="fi-dossier-rule">
              <span>Applied Intelligence Systems Registry</span>
            </div>
          </div>
          <blockquote className="fi-dossier-quote">
            <span aria-hidden="true">&ldquo;</span>
            <p>
              Teknologi bukan tujuan akhirnya. Yang menjadi tujuan adalah judgment yang lebih baik,
              koordinasi yang lebih jernih, dan systems yang lebih layak dipercaya.
            </p>
            <cite>Founder systems practice</cite>
          </blockquote>
        </motion.header>

        {/* Featured Systems */}
        <motion.section
          aria-label="Featured systems"
          className="fi-feature-panel"
          id="featured-systems"
          initial={revealInitial}
          whileInView="visible"
          viewport={motionViewport}
          variants={staggerContainer(0.18, 0.1)}
          transition={shouldReduce ? { staggerChildren: 0, delayChildren: 0 } : undefined}
        >
          {/* AADI */}
          <motion.article
            className="fi-feature-card fi-feature-aadi"
            variants={mv?.scaleReveal}
            transition={shouldReduce ? { duration: 0 } : transitions.medium}
            whileHover={shouldReduce ? undefined : { y: -8, transition: { duration: 0.3 } }}
          >
            <div className="fi-feature-copy">
              <span>Featured System 01</span>
              <h3>AADI</h3>
              <p className="fi-feature-subtitle">
                Autonomous Admission &amp; Documentation Intelligence
              </p>
              <p className="fi-feature-body-italic">
                AADI mengumpulkan, memverifikasi, dan mendokumentasikan informasi pasien secara
                otonom lintas sistem, sehingga friction saat admisi menurun dan akurasi meningkat
                sejak awal proses.
              </p>
              <div className="fi-feature-status">
                <small>Status</small>
                <b className="is-testing">Sedang Diuji</b>
              </div>
              <Link aria-label="Explore AADI in registry" href="#registry-all-systems">
                Jelajahi system →
              </Link>
            </div>
            <div aria-hidden="true" className="fi-feature-illustration">
              <svg
                viewBox="0 0 420 310"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', opacity: 0.55 }}
              >
                <rect
                  x="40"
                  y="30"
                  width="340"
                  height="240"
                  rx="8"
                  stroke="#6b5a3e"
                  strokeWidth="1.2"
                  fill="none"
                />
                <line x1="40" y1="70" x2="380" y2="70" stroke="#6b5a3e" strokeWidth="0.8" />
                <circle cx="60" cy="50" r="6" fill="#aa8548" opacity="0.6" />
                <circle cx="78" cy="50" r="6" fill="#aa8548" opacity="0.35" />
                <circle cx="96" cy="50" r="6" fill="#aa8548" opacity="0.2" />
                <rect x="60" y="90" width="120" height="8" rx="2" fill="#6b5a3e" opacity="0.25" />
                <rect x="60" y="108" width="80" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <rect x="60" y="130" width="140" height="8" rx="2" fill="#6b5a3e" opacity="0.25" />
                <rect x="60" y="148" width="100" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <rect x="60" y="170" width="120" height="8" rx="2" fill="#6b5a3e" opacity="0.25" />
                <rect x="60" y="188" width="90" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <rect
                  x="220"
                  y="90"
                  width="130"
                  height="130"
                  rx="6"
                  fill="#aa8548"
                  opacity="0.06"
                  stroke="#aa8548"
                  strokeWidth="0.8"
                />
                <rect x="232" y="102" width="106" height="10" rx="2" fill="#aa8548" opacity="0.3" />
                <rect x="232" y="118" width="80" height="8" rx="2" fill="#6b5a3e" opacity="0.18" />
                <rect x="232" y="132" width="96" height="8" rx="2" fill="#6b5a3e" opacity="0.18" />
                <rect x="232" y="146" width="70" height="8" rx="2" fill="#6b5a3e" opacity="0.18" />
                <rect
                  x="232"
                  y="170"
                  width="106"
                  height="28"
                  rx="4"
                  fill="#173d67"
                  opacity="0.15"
                />
                <text
                  x="285"
                  y="189"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#173d67"
                  opacity="0.7"
                  fontFamily="Georgia, serif"
                >
                  Verify
                </text>
              </svg>
            </div>
          </motion.article>

          {/* Sentra Assist */}
          <motion.article
            className="fi-feature-card fi-feature-assist"
            variants={mv?.scaleReveal}
            transition={shouldReduce ? { duration: 0 } : transitions.medium}
            whileHover={shouldReduce ? undefined : { y: -8, transition: { duration: 0.3 } }}
          >
            <div className="fi-feature-copy">
              <span>Featured System 02</span>
              <h3>Sentra Assist</h3>
              <p className="fi-feature-subtitle">AI Chrome Side Panel for Full EMR Completion</p>
              <p>
                Sentra Assist adalah Chrome Side Panel berbasis AI yang membaca dokumen klinis,
                melakukan ekstraksi OCR, dan menerapkan algoritma field-matching probabilistik untuk
                membantu penyelesaian formulir EMR secara end-to-end dengan clinician review.
              </p>
              <div className="fi-feature-status">
                <small>Status</small>
                <b className="is-testing">Sedang Diuji</b>
              </div>
              <Link aria-label="Explore Sentra Assist in registry" href="#registry-all-systems">
                Jelajahi system →
              </Link>
            </div>
            <div
              aria-hidden="true"
              className="fi-feature-illustration fi-assist-visual fi-sentra-assist-sketch"
            >
              <svg
                viewBox="0 0 420 310"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%', opacity: 0.55 }}
              >
                <rect
                  x="20"
                  y="20"
                  width="260"
                  height="270"
                  rx="6"
                  stroke="#6b5a3e"
                  strokeWidth="1"
                  fill="none"
                />
                <line x1="20" y1="50" x2="280" y2="50" stroke="#6b5a3e" strokeWidth="0.7" />
                <rect x="30" y="62" width="100" height="6" rx="2" fill="#6b5a3e" opacity="0.2" />
                <rect x="30" y="76" width="150" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <rect x="30" y="90" width="130" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <rect x="30" y="112" width="160" height="6" rx="2" fill="#6b5a3e" opacity="0.2" />
                <rect x="30" y="126" width="120" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <line
                  x1="290"
                  y1="20"
                  x2="290"
                  y2="290"
                  stroke="#aa8548"
                  strokeWidth="0.8"
                  strokeDasharray="4 3"
                  opacity="0.5"
                />
                <rect
                  x="296"
                  y="20"
                  width="110"
                  height="270"
                  rx="6"
                  stroke="#aa8548"
                  strokeWidth="1.2"
                  fill="rgba(170,133,72,0.04)"
                />
                <rect x="304" y="32" width="90" height="8" rx="2" fill="#aa8548" opacity="0.5" />
                <rect x="304" y="50" width="90" height="6" rx="2" fill="#6b5a3e" opacity="0.2" />
                <rect x="304" y="62" width="70" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <rect x="304" y="74" width="80" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <rect x="304" y="95" width="90" height="6" rx="2" fill="#6b5a3e" opacity="0.2" />
                <rect x="304" y="107" width="60" height="6" rx="2" fill="#6b5a3e" opacity="0.15" />
                <rect x="304" y="130" width="90" height="22" rx="4" fill="#173d67" opacity="0.18" />
                <text
                  x="349"
                  y="145"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#173d67"
                  opacity="0.8"
                  fontFamily="Georgia,serif"
                >
                  AI Fill
                </text>
                <path
                  d="M 200 160 L 296 140"
                  stroke="#aa8548"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  opacity="0.6"
                />
              </svg>
            </div>
          </motion.article>
        </motion.section>

        {/* Registry Proof */}
        <motion.section
          aria-label="Registry principles and metrics"
          className="fi-registry-proof"
          id="registry-foundations"
          initial={revealInitial}
          whileInView="visible"
          viewport={motionViewport}
          variants={mv?.fadeUp}
          transition={shouldReduce ? { duration: 0 } : transitions.medium}
        >
          <div aria-hidden="true" className="fi-hands-card">
            <svg
              viewBox="0 0 180 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', opacity: 0.45 }}
            >
              <path
                d="M 40 80 Q 60 40 90 60 Q 120 80 140 40"
                stroke="#aa8548"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <circle
                cx="90"
                cy="60"
                r="18"
                stroke="#6b5a3e"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />
              <circle cx="90" cy="60" r="4" fill="#aa8548" opacity="0.6" />
            </svg>
          </div>
          <blockquote>
            <span aria-hidden="true">&ldquo;</span>
            <p>
              Sistem kami dirancang bersama clinicians dan patients. Trust mereka harus dibangun,
              bukan diasumsikan.
            </p>
            <cite>Sentra Healthcare AI</cite>
          </blockquote>
          <div aria-label="Registry summary" className="fi-proof-metrics">
            <div>
              <strong>
                <CountUp to={22} duration={1.6} />
              </strong>
              <span>Systems</span>
              <small>Across healthcare, education, work, and digital surfaces</small>
            </div>
            <div>
              <strong>
                <CountUp to={4} duration={1.2} />
              </strong>
              <span>Capability Domains</span>
              <small>Care, learning, coordination, and public experience</small>
            </div>
            <div>
              <strong>
                <CountUp to={1} duration={0.8} />
              </strong>
              <span>Commitment</span>
              <small>Responsible intelligence in real operational conditions.</small>
            </div>
          </div>
        </motion.section>

        {/* Registry Board */}
        <section
          aria-label="The registry: all systems"
          className="fi-registry-board"
          id="registry-all-systems"
        >
          <div className="fi-registry-board-head">
            <h3>The Registry: All Systems</h3>
            <span>View as list ☷</span>
          </div>
          <motion.div
            className="fi-registry-columns"
            initial={revealInitial}
            whileInView="visible"
            viewport={motionViewport}
            variants={staggerContainer(0.1, 0.05)}
            transition={shouldReduce ? { staggerChildren: 0, delayChildren: 0 } : undefined}
          >
            <motion.article
              className="fi-registry-column"
              variants={mv?.fadeUp}
              transition={shouldReduce ? { duration: 0 } : transitions.medium}
            >
              <h4>
                <span className="dot testing"></span>Sedang Diuji · 6
              </h4>
              <ul>
                <li>
                  <strong>AADI</strong>
                  <small>Autonomous Artificial Diagnostic Intelligence</small>
                </li>
                <li>
                  <strong>Audrey</strong>
                  <small>Voice-First Clinical Intelligence</small>
                </li>
                <li>
                  <strong>Intelligence Dashboard</strong>
                  <small>Unified Clinical Operations Platform</small>
                </li>
                <li>
                  <strong>Sentra Assist</strong>
                  <small>AI Chrome Side Panel for EMR Automation</small>
                </li>
                <li>
                  <strong>Telemedicine</strong>
                  <small>Remote Clinical Consultation</small>
                </li>
                <li>
                  <strong>ReferraLink</strong>
                  <small>Awareness-Intelligence Protocol</small>
                </li>
              </ul>
            </motion.article>
            <motion.article
              className="fi-registry-column"
              variants={mv?.fadeUp}
              transition={shouldReduce ? { duration: 0 } : transitions.medium}
            >
              <h4>
                <span className="dot built"></span>Sudah Dibangun · 1
              </h4>
              <ul>
                <li>
                  <strong>Med-Cognitive</strong>
                  <small>Neural Memory Architecture for Clinical AI</small>
                </li>
              </ul>
              <h4 className="mt">
                <span className="dot inbuild"></span>Sedang Dibangun · 11
              </h4>
              <ul>
                <li>
                  <strong>MELLY</strong>
                  <small>Hyper-Personalized Augmented Virtual Agent</small>
                </li>
                <li>
                  <strong>Melinda Dashboard</strong>
                  <small>Zero-Friction Interoperability Platform</small>
                </li>
                <li>
                  <strong>Melinda Shield</strong>
                  <small>Cognitive Cybersecurity Infrastructure</small>
                </li>
                <li>
                  <strong>Autonomous Admission</strong>
                  <small>Admission &amp; Journey Tracking</small>
                </li>
                <li>
                  <strong>Smart Triage</strong>
                  <small>Pediatric &amp; Maternal Algorithmic Assessment</small>
                </li>
              </ul>
            </motion.article>
            <motion.article
              className="fi-registry-column"
              variants={mv?.fadeUp}
              transition={shouldReduce ? { duration: 0 } : transitions.medium}
            >
              <h4>
                <span className="dot inbuild"></span>Continuing Build
              </h4>
              <ul>
                <li>
                  <strong>Proactive Care Navigator</strong>
                  <small>Post-Partum &amp; Preventive Monitoring</small>
                </li>
                <li>
                  <strong>Ambient Scribe</strong>
                  <small>Clinical Voice-to-EMR Engine</small>
                </li>
                <li>
                  <strong>Critical Alert System</strong>
                  <small>Proactive NICU &amp; Telemetry Intelligence</small>
                </li>
                <li>
                  <strong>Predictive Bed Management</strong>
                  <small>Autonomous Turnaround Orchestration</small>
                </li>
                <li>
                  <strong>AI Coding Auditor</strong>
                  <small>Clinical Coding &amp; Claim Defense</small>
                </li>
                <li>
                  <strong>OR Orchestrator</strong>
                  <small>Smart Operating Room Logistics</small>
                </li>
              </ul>
            </motion.article>
            <motion.article
              className="fi-registry-column"
              variants={mv?.fadeUp}
              transition={shouldReduce ? { duration: 0 } : transitions.medium}
            >
              <h4>
                <span className="dot planned"></span>Akan Dibangun · 4
              </h4>
              <ul>
                <li>
                  <strong>POGS</strong>
                  <small>Pregnancy Observation Global System</small>
                </li>
                <li>
                  <strong>CDOS</strong>
                  <small>Clinical Decision Orchestration System</small>
                </li>
                <li>
                  <strong>TRIAGE</strong>
                  <small>Severity Scoring &amp; Predictive Triage Engine</small>
                </li>
                <li>
                  <strong>PREDICTION</strong>
                  <small>Predictive Analytics Engine</small>
                </li>
              </ul>
            </motion.article>
          </motion.div>
          <p className="fi-registry-boundary">
            <strong>Clinical boundary:</strong> Sentra systems are designed as decision-support,
            workflow intelligence, and care coordination infrastructure. They do not replace
            professional medical judgment.
          </p>
        </section>
      </div>

      {/* ── RIGHT: Glance Sidebar ── */}
      <motion.aside
        aria-label="All systems at a glance"
        className="fi-dossier-glance"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={mv?.slideInRight}
        transition={shouldReduce ? { duration: 0 } : { ...transitions.medium, delay: 0.2 }}
      >
        <div className="fi-glance-head">
          <strong>All Systems at a Glance</strong>
          <span>22 Systems</span>
        </div>
        <section>
          <h3>
            <span className="dot testing"></span>Sedang Diuji · 6
          </h3>
          <ul>
            <li>AADI</li>
            <li>Audrey</li>
            <li>Intelligence Dashboard</li>
            <li>Sentra Assist</li>
            <li>Telemedicine</li>
            <li>ReferraLink</li>
          </ul>
        </section>
        <section>
          <h3>
            <span className="dot built"></span>Sudah Dibangun · 1
          </h3>
          <ul>
            <li>Med-Cognitive</li>
          </ul>
        </section>
        <section>
          <h3>
            <span className="dot inbuild"></span>Sedang Dibangun · 11
          </h3>
          <ul>
            <li>MELLY</li>
            <li>Melinda Dashboard</li>
            <li>Melinda Shield</li>
            <li>Autonomous Admission</li>
            <li>Smart Triage</li>
            <li>Proactive Care Navigator</li>
            <li>Ambient Scribe</li>
            <li>Critical Alert System</li>
            <li>Predictive Bed Management</li>
            <li>AI Coding Auditor</li>
            <li>OR Orchestrator</li>
          </ul>
        </section>
        <section id="registry-roadmap">
          <h3>
            <span className="dot planned"></span>Akan Dibangun · 4
          </h3>
          <ul>
            <li>POGS</li>
            <li>CDOS</li>
            <li>TRIAGE</li>
            <li>PREDICTION</li>
          </ul>
        </section>
      </motion.aside>
    </section>
  )
}
