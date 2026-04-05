'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TextRevealChar } from './TextReveal';
import { MagneticButton } from './MagneticButton';

export function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <header
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-cream">
        {/* Animated mesh gradient */}
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 30% 40%, rgba(181, 164, 139, 0.3) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(18, 18, 18, 0.03) 0%, transparent 40%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content Container */}
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        style={{ opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-5rem)]">
          
          {/* Left - Text Content */}
          <div className="order-2 lg:order-1 py-12 lg:py-0">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-block text-gold uppercase tracking-[0.3em] text-sm mb-6">
                Spesialis OBGYN
              </span>
            </motion.div>

            {/* Main Heading - VARIAN B */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-6">
              <span className="block overflow-hidden">
                <TextRevealChar
                  text="Sains terukur"
                  className="text-charcoal"
                  delay={0.4}
                />
              </span>
              <span className="block overflow-hidden">
                <TextRevealChar
                  text="untuk perjalanan"
                  className="text-charcoal"
                  delay={0.6}
                />
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="inline-block italic text-gold"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  esensial kesehatan
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="inline-block italic text-charcoal"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  perempuan.
                </motion.span>
              </span>
            </h1>

            {/* Subheadline - VARIAN B */}
            <motion.p
              className="text-base md:text-lg font-light leading-relaxed mb-6 max-w-lg text-taupe border-l-2 border-gold pl-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              Fasilitas medis terpadu di mana kepakaran sains reproduksi bertemu dengan keheningan ruang privat yang menghargai otonomi.
            </motion.p>

            {/* Paragraf Menengah - VARIAN B */}
            <motion.p
              className="text-sm md:text-base font-light leading-relaxed mb-8 max-w-lg text-taupe/80"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              Kesehatan reproduksi membutuhkan lebih dari sekadar diagnosis; ia menuntut pemahaman yang utuh dan kerahasiaan yang tak tertembus. Pendekatan klinis Dr. Dibya Arfianda, Sp.OG mengutamakan observasi mendalam sebelum intervensi.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              <MagneticButton strength={0.15}>
                <motion.a
                  href="#contact"
                  className="btn-luxury inline-block group"
                  data-cursor-text="Book"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Jadwalkan Konsultasi
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </motion.a>
              </MagneticButton>
            </motion.div>


          </div>

          {/* Right - Image */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            style={{ y }}
          >
            <motion.div
              className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl"
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            >
              {/* Decorative frame */}
              <div className="absolute -inset-4 border border-gold/30" />
              <div className="absolute -inset-8 border border-gold/10" />
              
              {/* Corner accents */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-gold" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-gold" />

              {/* Image container */}
              <div className="relative aspect-[3/4] bg-charcoal/5 overflow-hidden">
                <img
                  src="/images/dr-dibya-portrait.jpg"
                  alt="dr. Dibya Arfianda, Sp.OG"
                  className="w-full h-full object-cover object-top"
                />
                
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-cream/20 via-transparent to-transparent" />
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-4 -left-4 bg-charcoal text-cream px-6 py-4 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="text-xs uppercase tracking-wider text-gold mb-1">Spesialis</div>
                <div className="text-sm font-serif">Obstetri & Ginekologi</div>
                <div className="text-xs text-cream/60 mt-1">Sp.OG</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => {
            document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-xs uppercase tracking-widest text-taupe/60">
            Scroll
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </motion.div>
    </header>
  );
}
