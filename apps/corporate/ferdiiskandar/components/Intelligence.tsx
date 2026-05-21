'use client'

import { motion, useReducedMotion } from 'framer-motion'

import {
  getRevealInitial,
  motionVariants,
  staggerContainer,
  motionViewport,
  transitions,
} from '@/lib/motion-variants'
import { useMotionReady } from '@/lib/use-motion-ready'

type NewsSignal = {
  title: string
  source: string
  published: string
  category: string
  summary: string
  href: string
}

const newsSignals: NewsSignal[] = [
  {
    title: 'OpenAI merilis GPT-5.5 Instant sebagai model default baru di ChatGPT',
    source: 'TechCrunch',
    published: '5 Mei 2026',
    category: 'Model / Produk',
    summary:
      'OpenAI mengganti model cepat default ChatGPT ke GPT-5.5 Instant, dengan penekanan pada penurunan halusinasi, pengelolaan konteks yang lebih kuat, dan kontinuitas penggunaan berbasis memori.',
    href: 'https://techcrunch.com/2026/05/05/openai-releases-gpt-5-5-instant-a-new-default-model-for-chatgpt/',
  },
  {
    title: 'Microsoft, Google, dan xAI memberi akses awal model frontier kepada pemerintah AS',
    source: 'Reuters',
    published: '5 Mei 2026',
    category: 'Kebijakan / Keamanan',
    summary:
      'Washington memperluas akses pra-rilis model untuk pengujian keamanan nasional, menandakan fokus yang lebih tajam pada risiko siber, penyalahgunaan, dan perilaku tak terduga sebelum model dibuka ke publik.',
    href: 'https://m.investing.com/news/stock-market-news/microsoft-xai-and-google-will-share-ai-models-with-us-govt-for-security-reviews-4658803?ampMode=1',
  },
  {
    title: 'xAI tampak bergerak dari laboratorium model menuju penyedia komputasi',
    source: 'TechCrunch',
    published: '6 Mei 2026',
    category: 'Infrastruktur / Komputasi',
    summary:
      'Kemitraan baru dengan Anthropic membingkai ulang xAI sebagai penjual kapasitas komputasi skala besar, menunjukkan bahwa ekonomi pusat data bisa menjadi sama pentingnya dengan persaingan model.',
    href: 'https://techcrunch.com/2026/05/06/is-xai-a-neocloud-now/',
  },
  {
    title: 'Anthropic dan OpenAI sama-sama membangun joint venture AI untuk enterprise',
    source: 'TechCrunch',
    published: '4 Mei 2026',
    category: 'Enterprise / Distribusi',
    summary:
      'Kedua lab mendorong model delivery enterprise yang lebih forward-deployed, dengan menggabungkan mitra modal dan kanal implementasi AI untuk mempercepat adopsi di organisasi besar.',
    href: 'https://techcrunch.com/2026/05/04/anthropic-and-openai-are-both-launching-joint-ventures-for-enterprise-ai-services/',
  },
  {
    title: 'Pentagon memperluas kontrak AI jaringan rahasia ke sejumlah vendor besar',
    source: 'TechCrunch',
    published: '1 Mei 2026',
    category: 'Pertahanan / Pemerintah',
    summary:
      'Departemen Pertahanan AS memperluas daftar vendor AI untuk jaringan rahasia, menegaskan bahwa model frontier sedang bergerak dari tahap eksperimen menuju infrastruktur operasional negara.',
    href: 'https://techcrunch.com/2026/05/01/pentagon-inks-deals-with-nvidia-microsoft-and-aws-to-deploy-ai-on-classified-networks/',
  },
  {
    title: 'Mistral meluncurkan Workflows untuk mengubah AI enterprise menjadi sistem produksi',
    source: 'VentureBeat',
    published: '28 April 2026',
    category: 'Agen / Orkestrasi',
    summary:
      'Lapisan orkestrasi baru dari Mistral menunjukkan pergeseran pasar: persoalan utama bukan lagi sekadar akses model, tetapi eksekusi yang andal, guardrail, dan desain workflow dalam skala besar.',
    href: 'https://venturebeat.com/technology/mistral-ai-launches-workflows-a-temporal-powered-orchestration-engine-already-running-millions-of-daily-executions',
  },
]

const leadSignal = newsSignals[0]
const railSignals = newsSignals.slice(1)

export default function Intelligence() {
  const shouldReduce = useReducedMotion()
  const isMotionReady = useMotionReady()
  const revealInitial = getRevealInitial(isMotionReady, shouldReduce, 'hidden')

  return (
    <section className="fi-section" id="intelligence">
      <div className="fi-intelligence">
        <motion.div
          className="fi-section-head"
          initial={revealInitial}
          whileInView="visible"
          viewport={motionViewport}
          variants={motionVariants.slideIn}
          transition={shouldReduce ? { duration: 0 } : transitions.medium}
        >
          <div>
            <p className="fi-section-lead">
              Di sini Anda bisa mendapatkan informasi AI terbaru dari outlet besar, dipilih karena
              paling relevan dengan perkembangan model, kebijakan, infrastruktur, dan workflow di
              sektor berisiko tinggi.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="fi-intelligence-dossier"
          initial={revealInitial}
          whileInView="visible"
          viewport={motionViewport}
          variants={staggerContainer(0.08, 0.08)}
          transition={shouldReduce ? { staggerChildren: 0, delayChildren: 0 } : undefined}
        >
          <motion.article
            className="fi-intelligence-lead"
            variants={motionVariants.blurIn}
            transition={shouldReduce ? { duration: 0 } : transitions.slow}
          >
            <div className="fi-intelligence-card-head">
              <span>{leadSignal.category}</span>
              <time>{leadSignal.published}</time>
            </div>
            <div className="fi-intelligence-lead-body">
              <small>{leadSignal.source}</small>
              <h3>{leadSignal.title}</h3>
              <p>{leadSignal.summary}</p>
            </div>
            <footer className="fi-intelligence-card-foot">
              <a href={leadSignal.href} rel="noreferrer" target="_blank">
                Baca sumber
              </a>
            </footer>
          </motion.article>

          <motion.aside
            className="fi-intelligence-rail"
            variants={motionVariants.blurIn}
            transition={shouldReduce ? { duration: 0 } : transitions.medium}
          >
            <div className="fi-intelligence-rail-block">
              <span>Catatan Redaksi</span>
              <strong>Snapshot: 8 Mei 2026</strong>
              <p>
                Fokus kurasi ini adalah berita yang membentuk arah model frontier, rezim pengujian,
                lapisan orkestrasi, dan ekonomi komputasi.
              </p>
            </div>
            <div className="fi-intelligence-rail-block">
              <span>Komposisi Sumber</span>
              <ul>
                <li>TechCrunch</li>
                <li>Reuters</li>
                <li>VentureBeat</li>
              </ul>
            </div>
          </motion.aside>

          <div className="fi-intelligence-ledger">
            {railSignals.map((signal) => (
              <motion.article
                className="fi-intelligence-note"
                key={signal.title}
                variants={motionVariants.blurIn}
                transition={shouldReduce ? { duration: 0 } : transitions.medium}
              >
                <div className="fi-intelligence-card-head">
                  <span>{signal.category}</span>
                  <time>{signal.published}</time>
                </div>
                <small>{signal.source}</small>
                <h3>{signal.title}</h3>
                <p>{signal.summary}</p>
                <footer className="fi-intelligence-card-foot">
                  <a href={signal.href} rel="noreferrer" target="_blank">
                    Baca sumber
                  </a>
                </footer>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
