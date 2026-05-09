'use client'

import { motion, useReducedMotion } from 'framer-motion'

import SectionNumberMark from '@/components/SectionNumberMark'
import {
  getRevealInitial,
  motionVariants,
  staggerContainer,
  motionViewport,
  transitions,
} from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'

const cells = [
  {
    num: '01',
    title: 'Sentra Healthcare Artificial Intelligence',
    desc: 'Membangun arsitektur sistem klinis yang membantu tenaga medis membaca sinyal, risiko, dan konteks secara lebih cepat dan terstruktur.',
  },
  {
    num: '02',
    title: 'Education Intelligence Systems',
    desc: 'Membangun sistem pembelajaran, riset, dan knowledge work yang membantu orang belajar lebih terarah, menstrukturkan pemikiran, dan bekerja dengan dukungan AI yang bertanggung jawab.',
  },
  {
    num: '03',
    title: 'Digital Experience Systems',
    desc: 'Merancang website dan permukaan digital editorial yang membangun trust, menjelaskan sistem yang kompleks, dan memberi pengalaman publik yang lebih jernih.',
  },
  {
    num: '04',
    title: 'Workforce Coordination Systems',
    desc: 'Mengembangkan sistem untuk manajemen karyawan, koordinasi tim, dan visibilitas operasional agar struktur kerja menjadi lebih jelas, rapi, dan dapat diandalkan.',
  },
  {
    num: '05',
    title: 'Prompt and Transformer Architect',
    desc: 'Merancang prompt system, reasoning pattern, dan pemanfaatan transformer agar AI bekerja lebih terarah, konsisten, dan dapat dikendalikan.',
  },
  {
    num: '06',
    title: 'Director of System Choreography',
    desc: 'Menyusun orkestrasi antar sistem, agent, workflow, dan decision layer agar teknologi bergerak sebagai satu ekosistem yang koheren.',
  },
  {
    num: '07',
    title: 'Chief Automation Conductor',
    desc: 'Mengarahkan automasi agar tidak sekadar mempercepat pekerjaan, tetapi mengurangi friction, menjaga konteks, dan meningkatkan reliability operasional.',
  },
  {
    num: '08',
    title: 'VP of Process & Service Coordination',
    desc: 'Menghubungkan proses layanan, koordinasi manusia, dan sistem digital agar pengalaman kerja klinis menjadi lebih jelas, rapi, dan terukur.',
  },
]

export default function Impact() {
  const shouldReduce = useReducedMotion()
  const isMotionReady = useMotionReady()
  const revealInitial = getRevealInitial(isMotionReady, shouldReduce, 'hidden')

  return (
    <section className="fi-section" id="impact">
      <motion.div
        className="fi-section-head"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={motionVariants.slideIn}
        transition={shouldReduce ? { duration: 0 } : transitions.medium}
      >
        <SectionNumberMark number="01" />
        <div>
          <div className="fi-kicker">Leadership Under Constraint</div>
          <h2 className="fi-section-title">Leadership under real responsibility.</h2>
          <p className="fi-section-lead">
            Ini adalah rekam jejak seorang founder-architect yang membangun intelligence systems di
            bawah tekanan institusional, kompleksitas operasional, dan tuntutan public trust.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="fi-impact-grid"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={staggerContainer(0.08, 0.1)}
        transition={shouldReduce ? { staggerChildren: 0, delayChildren: 0 } : undefined}
      >
        {cells.map((cell) => (
          <motion.article
            className="fi-impact-cell"
            key={cell.num}
            variants={motionVariants.scaleReveal}
            transition={shouldReduce ? { duration: 0 } : transitions.medium}
          >
            <span className="fi-num">{cell.num}</span>
            <div>
              <h3>{cell.title}</h3>
              <p>{cell.desc}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
