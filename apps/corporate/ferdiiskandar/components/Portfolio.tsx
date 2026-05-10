'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
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
        aria-label="Indeks dossier inisiatif dan sistem"
        className="fi-dossier-index"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={mv?.slideIn}
        transition={shouldReduce ? { duration: 0 } : transitions.medium}
      >
        <div className="fi-dossier-index-title">Indeks Inisiatif</div>
        <nav aria-label="Bagian inisiatif dan sistem" className="fi-dossier-nav">
          <Link href="#portfolio">
            <span>01</span>
            <strong>Laboratorium</strong>
            <em>Riset teknologi sejak Februari 2025</em>
          </Link>
          <Link href="#featured-systems">
            <span>02</span>
            <strong>Sistem Unggulan</strong>
            <em>AADI dan Sentra Assist</em>
          </Link>
          <Link href="#registry-foundations">
            <span>03</span>
            <strong>Fondasi Kerja</strong>
            <em>Kepercayaan, data, dan tanggung jawab klinis</em>
          </Link>
          <Link href="#registry-all-systems">
            <span>04</span>
            <strong>Registri Sistem</strong>
            <em>Semua sistem sekilas</em>
          </Link>
          <Link href="#registry-roadmap">
            <span>05</span>
            <strong>Arah Lanjut</strong>
            <em>Ruang pembangunan berikutnya</em>
          </Link>
        </nav>
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
          <SectionNumberMark number="03" />
          <div className="fi-dossier-titleblock">
            <span className="fi-dossier-section">Inisiatif &amp; Sistem</span>
            <h2 id="systems-dossier-title">
              Dari Laboratorium Teknologi Sederhana untuk Indonesia
            </h2>
            <p>
              Sejak Februari 2025, dr Ferdi Iskandar memulai riset dan pembangunan teknologi dari
              kebutuhan nyata di lapangan. Prosesnya tidak berhenti pada eksperimen awal; setiap
              temuan diuji kembali, dikembangkan, dan dirapikan menjadi sistem yang lebih berguna
              bagi layanan kesehatan Indonesia.
            </p>
            <div className="fi-dossier-rule">
              <span>Balowerti II 69, Kediri Jawa Timur</span>
            </div>
          </div>
          <blockquote className="fi-dossier-quote">
            <span aria-hidden="true">&ldquo;</span>
            <p>Saya percaya teknologi terbaik adalah yang bekerja dalam diam.</p>
            <cite>Praktik sistem founder</cite>
          </blockquote>
        </motion.header>

        {/* Featured Systems */}
        <motion.section
          aria-label="Sistem unggulan"
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
              <span>Sistem Unggulan 01</span>
              <h3>AADI</h3>
              <p className="fi-feature-subtitle">Kecerdasan Admisi dan Dokumentasi Otonom</p>
              <p className="fi-feature-body-italic">
                AADI mengumpulkan, memverifikasi, dan mendokumentasikan informasi pasien secara
                otonom lintas sistem, sehingga gesekan saat admisi menurun dan akurasi meningkat
                sejak awal proses.
              </p>
              <div className="fi-feature-status">
                <small>Status</small>
                <b className="is-testing">Sedang Diuji</b>
              </div>
              <Link aria-label="Telusuri AADI di registri" href="#registry-all-systems">
                Jelajahi system →
              </Link>
            </div>
            <div className="fi-feature-illustration">
              <Image
                alt="Tampilan sistem AADI"
                className="fi-feature-product-image fi-feature-product-image-aadi"
                height={520}
                src="/aadi.png"
                width={720}
              />
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
              <span>Sistem Unggulan 02</span>
              <h3>Sentra Assist</h3>
              <p className="fi-feature-subtitle">
                Panel samping Chrome berbasis AI untuk kelengkapan EMR
              </p>
              <p>
                Sentra Assist adalah Chrome Side Panel berbasis AI yang membaca dokumen klinis,
                melakukan ekstraksi OCR, dan menerapkan algoritma field-matching probabilistik untuk
                membantu penyelesaian formulir EMR secara end-to-end dengan tinjauan klinisi.
              </p>
              <div className="fi-feature-status">
                <small>Status</small>
                <b className="is-testing">Sedang Diuji</b>
              </div>
              <Link aria-label="Telusuri Sentra Assist di registri" href="#registry-all-systems">
                Jelajahi system →
              </Link>
            </div>
            <div className="fi-feature-illustration fi-assist-visual fi-sentra-assist-sketch">
              <Image
                alt="Tampilan sistem Sentra Assist"
                className="fi-feature-product-image fi-feature-product-image-assist"
                height={520}
                src="/assist.webp"
                width={720}
              />
            </div>
          </motion.article>
        </motion.section>

        {/* Registry Proof */}
        <motion.section
          aria-label="Prinsip dan metrik registri"
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
              Sistem kami dirancang bersama klinisi dan pasien. Kepercayaan mereka harus dibangun,
              bukan diasumsikan.
            </p>
            <cite>Sentra Healthcare AI</cite>
          </blockquote>
          <div aria-label="Registry summary" className="fi-proof-metrics">
            <div>
              <strong>
                <CountUp to={22} duration={1.6} />
              </strong>
              <span>Sistem</span>
              <small>Lintas layanan kesehatan, pendidikan, kerja, dan permukaan digital</small>
            </div>
            <div>
              <strong>
                <CountUp to={4} duration={1.2} />
              </strong>
              <span>Domain Kapabilitas</span>
              <small>Perawatan, pembelajaran, koordinasi, dan pengalaman publik</small>
            </div>
            <div>
              <strong>
                <CountUp to={1} duration={0.8} />
              </strong>
              <span>Commitment</span>
              <small>Kecerdasan bertanggung jawab dalam kondisi operasional nyata.</small>
            </div>
          </div>
        </motion.section>

        {/* Registry Board */}
        <section
          aria-label="Registri semua sistem"
          className="fi-registry-board"
          id="registry-all-systems"
        >
          <div className="fi-registry-board-head">
            <h3>Registri: Semua Sistem</h3>
            <span>Lihat sebagai daftar ☷</span>
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
                <span className="dot inbuild"></span>Pembangunan Berlanjut
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
                  <strong>Hospital management Auditor</strong>
                  <small>Clinical Coding &amp; Claim Defense</small>
                </li>
                <li>
                  <strong>Hospital Orchestrator</strong>
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
            <strong>Batas klinis:</strong> Sistem Sentra dirancang sebagai pendukung keputusan,
            kecerdasan alur kerja, dan infrastruktur koordinasi perawatan. Sistem ini tidak
            menggantikan penilaian medis profesional.
          </p>
        </section>
      </div>

      {/* ── RIGHT: Glance Sidebar ── */}
      <motion.aside
        aria-label="Ringkasan semua sistem"
        className="fi-dossier-glance"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={mv?.slideInRight}
        transition={shouldReduce ? { duration: 0 } : { ...transitions.medium, delay: 0.2 }}
      >
        <div className="fi-glance-head">
          <strong>Semua Sistem Sekilas</strong>
          <span>22 Sistem</span>
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
            <li>Hospital management Auditor</li>
            <li>Hospital Orchestrator</li>
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
