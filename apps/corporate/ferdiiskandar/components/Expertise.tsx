'use client'

import { motion, useReducedMotion } from 'framer-motion'

import {
  getRevealInitial,
  motionVariants,
  staggerContainer,
  motionViewport,
  transitions,
} from '@/lib/motion-variants'
import { thinkingMeta } from '@/lib/site-content'
import { useMotionReady } from '@/lib/use-motion-ready'

const thinkingNodes = [
  {
    className: 'fi-thinking-node fi-node-input',
    style: { ['--x' as string]: '0%', ['--y' as string]: '171px' },
    label: 'Input',
    title: 'Clinical\nComplexity',
    desc: 'Tidak terstruktur, berubah-ubah, dan berisiko tinggi.',
  },
  {
    className: 'fi-thinking-node fi-node-top-1',
    style: { ['--x' as string]: '25%', ['--y' as string]: '72px' },
    label: 'Processing',
    title: 'Intelligence Engineer\n& Systems Architect',
    desc: 'Merekayasa fondasi sistem yang mampu belajar, beradaptasi, dan tetap dapat diaudit.',
  },
  {
    className: 'fi-thinking-node fi-node-top-2',
    style: { ['--x' as string]: '48%', ['--y' as string]: '72px' },
    label: 'Processing',
    title: 'Autonomous\nSystems Strategist',
    desc: 'Mengubah otomatisasi menjadi otonomi terbatas yang tidak mengambil alih tanggung jawab klinis.',
  },
  {
    className: 'fi-thinking-node fi-node-top-3',
    style: { ['--x' as string]: '71%', ['--y' as string]: '72px' },
    label: 'Processing',
    title: 'Principal of\nAugmented Engineering',
    desc: 'Mendesain teknologi sebagai ekstensi kapasitas intelektual manusia.',
  },
  {
    className: 'fi-thinking-node fi-node-bottom-1',
    style: { ['--x' as string]: '34%', ['--y' as string]: '270px' },
    label: 'Processing',
    title: 'Neural Infrastructure\nDesigner',
    desc: 'Membangun jaringan data, retrieval, dan reasoning untuk mengekstrak sinyal klinis.',
  },
  {
    className: 'fi-thinking-node fi-node-bottom-2',
    style: { ['--x' as string]: '57%', ['--y' as string]: '270px' },
    label: 'Processing',
    title: 'Cognitive Architecture\nEngineer',
    desc: 'Merancang alur berpikir yang menjelaskan alasan, batas, ketidakpastian, dan rekomendasi.',
  },
  {
    className: 'fi-thinking-node fi-node-output',
    style: { ['--x' as string]: '91%', ['--y' as string]: '171px' },
    label: 'Output',
    title: 'Responsible\nClinical Intelligence',
    desc: 'Insight yang lebih jernih. Keputusan yang lebih baik. Care yang lebih aman.',
  },
]

export default function Expertise() {
  const shouldReduce = useReducedMotion()
  const isMotionReady = useMotionReady()
  const revealInitial = getRevealInitial(isMotionReady, shouldReduce, 'hidden')

  return (
    <section
      aria-labelledby="thinking-stack-title"
      className="fi-section fi-thinking-editorial"
      id="expertise"
    >
      <div aria-hidden="true" className="fi-editorial-page-rule"></div>

      <motion.header
        aria-label="The Thinking Stack editorial header"
        className="fi-thinking-masthead"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={motionVariants.fadeDown}
        transition={shouldReduce ? { duration: 0 } : transitions.medium}
      >
        <div className="fi-thinking-masthead-left">{thinkingMeta.sectionLabel}</div>
        <div className="fi-thinking-masthead-center">{thinkingMeta.editionLabel}</div>
        <div className="fi-thinking-masthead-right">{thinkingMeta.notesLabel}</div>
      </motion.header>

      <motion.div
        className="fi-thinking-hero-grid"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={staggerContainer(0.12, 0.1)}
        transition={shouldReduce ? { staggerChildren: 0, delayChildren: 0 } : undefined}
      >
        <motion.aside
          aria-label="Section marker"
          className="fi-thinking-section-mark"
          variants={motionVariants.fadeUp}
          transition={shouldReduce ? { duration: 0 } : transitions.medium}
        >
          <span>Section</span>
          <strong>02</strong>
          <i aria-hidden="true"></i>
          <b aria-hidden="true">✧</b>
        </motion.aside>
        <motion.div
          className="fi-thinking-title-block"
          variants={motionVariants.slideIn}
          transition={shouldReduce ? { duration: 0 } : transitions.medium}
        >
          <div className="fi-kicker">Engineering Intelligence</div>
          <h2 className="fi-thinking-title" id="thinking-stack-title">
            The Thinking Stack
          </h2>
          <div aria-hidden="true" className="fi-thinking-title-rule">
            <span></span>
          </div>
          <p className="fi-thinking-pullquote">
            AI should not make healthcare louder.
            <br />
            It should make healthcare clearer,
            <br />
            calmer, and more accountable.
          </p>
        </motion.div>
        <motion.div
          className="fi-thinking-thesis-copy"
          variants={motionVariants.fadeUp}
          transition={shouldReduce ? { duration: 0 } : { ...transitions.medium, delay: 0.1 }}
        >
          <p>
            The Thinking Stack adalah open orchestration field untuk membangun responsible clinical
            intelligence.
          </p>
          <p>
            Ia menyelaraskan multidisciplinary expertise lintas peran dan systems, dirancang bukan
            sekadar sebagai pipeline untuk mengotomasi, melainkan sebagai system untuk menalar,
            merefleksikan, dan mengangkat human judgment.
          </p>
        </motion.div>
        <motion.aside
          aria-label="Design principles"
          className="fi-thinking-rubric"
          variants={motionVariants.fadeUp}
          transition={shouldReduce ? { duration: 0 } : { ...transitions.medium, delay: 0.2 }}
        >
          <div>
            <strong>Principle</strong>
            <p>
              Clarity over volume.
              <br />
              Accountability over speed.
            </p>
          </div>
          <div>
            <strong>Design</strong>
            <p>
              Human-centered orchestration.
              <br />
              Transparent by design.
            </p>
          </div>
          <div>
            <strong>Outcome</strong>
            <p>Intelligence that supports better decisions and better care.</p>
          </div>
        </motion.aside>
      </motion.div>

      <div aria-hidden="true" className="fi-thinking-divider"></div>

      <div className="fi-thinking-orchestration">
        <motion.aside
          className="fi-thinking-sidebar"
          initial={revealInitial}
          whileInView="visible"
          viewport={motionViewport}
          variants={motionVariants.slideIn}
          transition={shouldReduce ? { duration: 0 } : transitions.medium}
        >
          <p>
            An open orchestration field inspired by Langflow—translated into an editorial system.
          </p>
          <span aria-hidden="true"></span>
          <p>Setiap peran menyumbang kemampuan reasoning yang berbeda.</p>
          <span aria-hidden="true"></span>
          <p>
            Bersama-sama, semuanya membentuk arsitektur deliberatif untuk clinical intelligence.
          </p>
          <b aria-hidden="true">✣</b>
        </motion.aside>

        <motion.div
          aria-label="Founder Cognitive Orchestration Graph"
          className="fi-thinking-graph"
          initial={revealInitial}
          whileInView="visible"
          viewport={motionViewport}
          variants={staggerContainer(0.1, 0.2)}
          transition={shouldReduce ? { staggerChildren: 0, delayChildren: 0 } : undefined}
        >
          <svg
            aria-hidden="true"
            className="fi-thinking-wires"
            preserveAspectRatio="none"
            viewBox="0 0 1200 430"
          >
            <path d="M 155 210 C 205 210 210 125 265 125"></path>
            <path d="M 155 210 C 210 210 205 305 345 305"></path>
            <path d="M 430 125 C 470 125 470 125 510 125"></path>
            <path d="M 675 125 C 710 125 710 125 745 125"></path>
            <path d="M 905 125 C 965 125 960 210 1035 210"></path>
            <path d="M 880 305 C 940 305 950 210 1035 210"></path>
            <path d="M 525 305 C 565 305 565 305 605 305"></path>
            <path d="M 360 210 C 360 250 360 270 360 305"></path>
            <path d="M 840 210 C 840 245 835 270 835 305"></path>
            <circle cx="155" cy="210" r="5"></circle>
            <circle cx="265" cy="125" r="5"></circle>
            <circle cx="430" cy="125" r="5"></circle>
            <circle cx="510" cy="125" r="5"></circle>
            <circle cx="675" cy="125" r="5"></circle>
            <circle cx="745" cy="125" r="5"></circle>
            <circle cx="905" cy="125" r="5"></circle>
            <circle cx="345" cy="305" r="5"></circle>
            <circle cx="525" cy="305" r="5"></circle>
            <circle cx="605" cy="305" r="5"></circle>
            <circle cx="880" cy="305" r="5"></circle>
            <circle cx="1035" cy="210" r="5"></circle>
          </svg>

          {thinkingNodes.map((node, i) => (
            <motion.article
              key={i}
              className={node.className}
              style={node.style}
              variants={motionVariants.scaleReveal}
              transition={
                shouldReduce ? { duration: 0 } : { ...transitions.dramatic, delay: i * 0.08 }
              }
            >
              <span>{node.label}</span>
              <h3>
                {node.title.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < node.title.split('\n').length - 1 ? <br /> : ''}
                  </span>
                ))}
              </h3>
              <p>{node.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>

      <motion.footer
        aria-label="Thinking stack metadata"
        className="fi-thinking-footnotes"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={motionVariants.fadeIn}
        transition={shouldReduce ? { duration: 0 } : { ...transitions.medium, delay: 0.1 }}
      >
        <div>
          <strong>Fig. 02.01</strong>
        </div>
        <div>
          <em>
            The Thinking Stack orchestration field.
            <br />
            Peran-peran dihubungkan oleh tujuan, bukan sekadar proses.
          </em>
        </div>
        <div>
          <strong>Source</strong>
          <span>Founder Notes Lab</span>
        </div>
        <div>
          <strong>Note</strong>
          <span>
            Bukan sekadar workflow.
            <br />
            Sebuah cara berpikir.
          </span>
        </div>
        <div>
          <strong>Status</strong>
          <span>Terus disempurnakan</span>
        </div>
        <div>
          <strong>Last Updated</strong>
          <span>{thinkingMeta.lastUpdatedLabel}</span>
        </div>
        <div aria-hidden="true" className="fi-thinking-ornament">
          ✧
        </div>
      </motion.footer>

      <div aria-hidden="true" className="fi-editorial-page-rule bottom"></div>
    </section>
  )
}
