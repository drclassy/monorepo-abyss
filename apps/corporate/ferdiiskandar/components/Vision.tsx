'use client'

import { motion, useReducedMotion } from 'framer-motion'

import SplitText from '@/components/SplitText'
import {
  getRevealInitial,
  motionVariants,
  staggerContainer,
  motionViewport,
  transitions,
} from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'

const copyParagraphs: React.ReactNode[] = [
  <>
    <strong>
      Dedikasi saya berakar pada konvergensi antara presisi klinis dan arsitektur kognitif buatan.
    </strong>{' '}
    Sebagai praktisi medis aktif dan founder, fokus saya adalah mengembangkan systems yang membantu
    mengekstrak signal dari kebisingan data klinis dan kompleksitas operasional yang lebih luas.
  </>,
  <>
    Visi ini bukan tentang substitusi, melainkan augmentasi. AI seharusnya membantu manusia melihat
    pola lebih cepat, mengurangi beban administratif, dan menjaga konteks keputusan tetap jelas di
    lingkungan healthcare, education, workforce, maupun digital systems.
  </>,
  <>
    Melalui Melinda DHAI dan Sentra Healthcare Artificial Intelligence, saya berupaya membangun
    infrastruktur yang berbasis empati, validasi data, dan standar teknis yang dapat dipercaya untuk
    systems yang bekerja di bawah tanggung jawab nyata.
  </>,
]

export default function Vision() {
  const shouldReduce = useReducedMotion()
  const isMotionReady = useMotionReady()

  return (
    <section className="fi-section" id="vision">
      <div className="fi-vision">
        <SplitText
          text="Bridging Human Care with Artificial Intelligence."
          mode="word"
          stagger={0.07}
          delay={0.1}
          className="fi-vision-title"
          as="h2"
        />

        <motion.div
          className="fi-vision-copy"
          initial={getRevealInitial(isMotionReady, shouldReduce, 'hidden')}
          whileInView="visible"
          viewport={motionViewport}
          variants={staggerContainer(0.18, 0.2)}
          transition={shouldReduce ? { staggerChildren: 0, delayChildren: 0 } : undefined}
        >
          {copyParagraphs.map((para, i) => (
            <motion.p
              key={i}
              variants={motionVariants.fadeUp}
              transition={shouldReduce ? { duration: 0 } : transitions.medium}
            >
              {para}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
