'use client'

import { motion, useReducedMotion } from 'framer-motion'

import {
  getRevealInitial,
  motionVariants,
  motionViewport,
  transitions,
} from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'

const notes = [
  {
    tag: 'Manifesto',
    title: 'Sentra Healthcare Solutions',
    body: 'Mendisrupsi krisis kesehatan melalui kolaborasi manusia dan AI yang bertanggung jawab.',
    xOffset: -40,
  },
  {
    tag: 'Architecture',
    title: 'The Genesis Matrix',
    body: 'Catatan tentang bagaimana sistem AI kesehatan dapat dibangun dari fondasi data, alur kerja, dan penalaran.',
    xOffset: 0,
  },
  {
    tag: 'Sentinel',
    title: 'The Sentinel Grid',
    body: 'Kerangka monitoring real-time untuk membaca sinyal risiko dan anomali pada sistem kesehatan.',
    xOffset: 40,
  },
]

export default function FieldNotes() {
  const shouldReduce = useReducedMotion()
  const isMotionReady = useMotionReady()
  const revealInitial = getRevealInitial(isMotionReady, shouldReduce, 'hidden')

  return (
    <section className="fi-section" id="field-notes">
      <motion.div
        className="fi-section-head"
        initial={revealInitial}
        whileInView="visible"
        viewport={motionViewport}
        variants={motionVariants.slideIn}
        transition={shouldReduce ? { duration: 0 } : transitions.medium}
      >
        <div className="fi-kicker">Insights &amp; Reflections</div>
        <div>
          <h2 className="fi-section-title">
            Catatan lapangan dari kedokteran, hukum, dan sistem kecerdasan.
          </h2>
          <p className="fi-section-lead">
            Tulisan dan refleksi strategis yang dapat dikembangkan menjadi blog, memo founder, atau
            halaman insight lintas perawatan, hukum, dan sistem kecerdasan.
          </p>
        </div>
      </motion.div>

      <div className="fi-notes-grid">
        {notes.map((note, i) => (
          <motion.article
            className="fi-note"
            key={note.title}
            initial={getRevealInitial(isMotionReady, shouldReduce, {
              x: note.xOffset,
              y: 30,
              opacity: 0,
            })}
            whileInView={{ x: 0, y: 0, opacity: 1 }}
            viewport={motionViewport}
            transition={shouldReduce ? { duration: 0 } : { ...transitions.medium, delay: i * 0.12 }}
          >
            <time>{note.tag}</time>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
