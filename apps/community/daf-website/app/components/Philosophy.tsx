'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';

export function Philosophy() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Parallax for image
  const imageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  // Text parallax
  const textY = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);

  return (
    <section
      ref={containerRef}
      id="philosophy"
      className="bg-charcoal text-cream py-24 lg:py-40 relative overflow-hidden"
      aria-labelledby="philosophy-heading"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(181, 164, 139, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gold/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-gold/5 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image with reveal effect */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="relative group">
              {/* Decorative frame */}
              <motion.div
                className="absolute -inset-4 border border-gold/20"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              />
              
              {/* Image container with parallax */}
              <div className="relative h-[500px] lg:h-[700px] overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  style={{ y: imageY, scale: imageScale }}
                >
                  <img
                    src="/images/dr-dibya-surgery.jpg"
                    alt="dr. Dibya Arfianda, Sp.OG performing surgery with precision"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-60" />

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-20 h-px bg-gold" />
                <div className="absolute top-0 left-0 w-px h-20 bg-gold" />
                <div className="absolute bottom-0 right-0 w-20 h-px bg-gold" />
                <div className="absolute bottom-0 right-0 w-px h-20 bg-gold" />
              </div>


            </div>
          </ScrollReveal>

          {/* Content */}
          <motion.div className="lg:pl-8" style={{ y: textY }}>
            <ScrollReveal direction="right" delay={0.3}>
              <motion.span
                className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Filosofi Praktik
              </motion.span>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.4}>
              <h2
                id="philosophy-heading"
                className="text-4xl md:text-5xl lg:text-6xl text-gold mb-8 leading-[1.1]"
              >
                <span className="block">Keandalan Profesional</span>
                <span className="block italic">dan Aksesibilitas</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.5}>
              <motion.blockquote
                className="text-xl md:text-2xl italic text-cream mb-8 font-light leading-relaxed border-l-2 border-gold pl-6"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.3 }}
              >
                &ldquo;Presisi medis dan aksesibilitas layanan yang tinggi sebagai pilar utama praktik klinis.&rdquo;
              </motion.blockquote>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.6}>
              <p className="text-cream/90 font-light leading-relaxed mb-8">
                Dr. Dibya Arfianda, Sp.OG mendasarkan praktik klinisnya pada dua pilar utama: 
                presisi medis dan aksesibilitas layanan yang tinggi. Sebagai bentuk komitmen nyata 
                untuk memastikan pasien selalu mendapatkan perawatan yang mudah dijangkau, beliau 
                secara aktif mendedikasikan jadwal praktiknya di tiga institusi kesehatan utama di 
                Kediri—RSUD Gambiran, RSIA Melinda, dan RS Bhayangkara—serta menyediakan layanan 
                klinik privat khusus pada hari Minggu.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.7}>
              <p className="text-cream/80 font-light leading-relaxed mb-8">
                Mobilitas dan ketersediaan jadwal yang ekstensif ini dikelola secara ketat demi 
                memberikan fleksibilitas maksimal bagi pasien, tanpa pernah mengorbankan kualitas 
                observasi di ruang periksa.
              </p>
            </ScrollReveal>


          </motion.div>
        </div>
      </div>
    </section>
  );
}
