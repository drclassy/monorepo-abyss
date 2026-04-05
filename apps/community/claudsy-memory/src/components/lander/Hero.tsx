// Architected and built by Claudesy.
import Link from 'next/link'

import { CornerAccent } from '@/components/lander/CornerAccent'

function Emblem() {
  return (
    <svg
      aria-hidden="true"
      className="h-[52px] w-[52px] text-[var(--text-main)]"
      fill="none"
      viewBox="0 0 65 65"
    >
      <path
        d="M39.13 43.55C39.13 41.04 41.17 39 43.68 39H47.45C49.96 39 52 36.96 52 34.45V4.55C52 2.04 54.04 0 56.55 0H60.45C62.96 0 65 2.04 65 4.55V34.45C65 36.96 62.96 39 60.45 39H56.68C54.17 39 52.13 41.04 52.13 43.55V60.45C52.13 62.96 50.09 65 47.58 65H43.68C41.17 65 39.13 62.96 39.13 60.45V43.55Z"
        fill="currentColor"
      />
      <path
        d="M13.13 43.55C13.13 41.04 15.17 39 17.68 39H21.45C23.96 39 26 36.96 26 34.45V4.55C26 2.04 28.04 0 30.55 0H34.45C36.96 0 39 2.04 39 4.55V34.45C39 36.96 36.96 39 34.45 39H30.68C28.17 39 26.13 41.04 26.13 43.55V60.45C26.13 62.96 24.09 65 21.58 65H17.68C15.17 65 13.13 62.96 13.13 60.45V43.55Z"
        fill="currentColor"
      />
      <path
        d="M0 4.55C0 2.04 2.04 0 4.55 0H8.45C10.96 0 13 2.04 13 4.55V21.45C13 23.96 10.96 26 8.45 26H4.55C2.04 26 0 23.96 0 21.45V4.55Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-end overflow-hidden border-b border-white/8 px-4 pt-32 sm:px-6 lg:px-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(92,147,159,0.18),transparent_25%),radial-gradient(circle_at_80%_15%,rgba(207,107,67,0.22),transparent_26%),linear-gradient(180deg,rgba(17,17,17,0.96),rgba(8,9,10,1))]" />
      <div className="absolute inset-0 opacity-70">
        <div className="absolute inset-x-0 top-[18%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-[12%] top-[30%] h-[1px] bg-gradient-to-r from-transparent via-[#5c939f]/40 to-transparent" />
        <div className="absolute left-[18%] top-[18%] h-[48vh] w-[48vh] rounded-full border border-white/8 blur-[2px]" />
        <div className="absolute right-[10%] top-[12%] h-[36vh] w-[36vh] rounded-full border border-[#cf6b43]/14" />
        <div className="absolute left-[12%] top-[34%] h-2 w-2 rounded-full bg-white/65 shadow-[0_0_20px_rgba(255,255,255,0.45)]" />
        <div className="absolute right-[22%] top-[42%] h-2 w-2 rounded-full bg-[#5c939f] shadow-[0_0_20px_rgba(92,147,159,0.45)]" />
        <div className="absolute left-[36%] top-[56%] h-[1px] w-[26vw] rotate-[12deg] bg-gradient-to-r from-white/0 via-white/16 to-white/0" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col pb-8">
        <div className="mx-auto flex min-h-[58vh] w-full max-w-[1040px] flex-col items-center justify-center text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--text-main)]/48">
            Persistent Context Layer
          </p>
          <h1 className="mt-8 text-[clamp(3.1rem,9vw,8rem)] uppercase leading-[0.86] tracking-[-0.06em] text-[#f5f5f5]">
            <span className="block">Persistent Memory</span>
            <span className="block">For AI Agents</span>
            <span className="block">That Never Forget</span>
          </h1>
        </div>

        <div className="mt-6 flex flex-col gap-6 border-t border-white/10 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="group relative inline-flex w-fit items-center justify-center border border-white/14 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-main)] transition hover:bg-white hover:text-[var(--bg-canvas)]"
            >
              <span className="relative block overflow-hidden">
                <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
                  Open Dashboard
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"
                >
                  Open Dashboard
                </span>
              </span>
              <CornerAccent className="left-1 top-1" />
              <CornerAccent className="right-1 top-1 rotate-90" />
              <CornerAccent className="bottom-1 left-1 -rotate-90" />
              <CornerAccent className="bottom-1 right-1 rotate-180" />
            </Link>
            <p className="max-w-[430px] text-sm leading-7 text-[var(--text-main)]/62">
              Memory engine untuk extract, consolidate, dan recall tanpa putus
              konteks antar sesi operator maupun agent.
            </p>
          </div>
          <Emblem />
        </div>
      </div>
    </section>
  )
}
