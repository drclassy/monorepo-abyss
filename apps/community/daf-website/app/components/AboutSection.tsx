'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';
import { Award, BookOpen, Shield, Stethoscope } from 'lucide-react';

const credentials = [
  { icon: Stethoscope, label: 'Nama Lengkap', value: 'dr. Dibya Arfianda Iskandar, Sp.OG' },
  { icon: Award, label: 'Fokus Spesialisasi', value: 'Obstetri dan Ginekologi' },
  { icon: Shield, label: 'Afiliasi Klinis', value: 'RSIA Melinda, RS Gambiran, RS Bhayangkara Kediri' },
  { icon: BookOpen, label: 'Validasi', value: 'KKI / POGI Aktif / Komisaris RSIA Melinda' },
];

export function AboutSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={containerRef}
      id="about"
      className="py-24 lg:py-40 bg-cream relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left - Image & Credentials */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="sticky top-32">
              <div className="relative">
                {/* Decorative Frame */}
                <div className="absolute -inset-4 border border-gold/30" />
                <div className="absolute -inset-8 border border-gold/10" />
                
                {/* Corner Accents */}
                <div className="absolute -top-2 -left-2 w-12 h-12 border-t-2 border-l-2 border-gold z-10" />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-2 border-r-2 border-gold z-10" />
                
                {/* Main image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-charcoal/5">
                  <img
                    src="/images/dr-dibya-clinical.jpg"
                    alt="dr. Dibya Arfianda, Sp.OG dalam praktik klinis"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent" />
                  
                  {/* Overlay Pattern */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(181, 164, 139, 0.5) 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Floating credentials card - Glassmorphism */}
                <motion.div
                  className="absolute -bottom-6 -right-6 bg-charcoal/95 backdrop-blur-md text-cream p-6 shadow-2xl max-w-xs border border-gold/20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="text-gold text-xs uppercase tracking-wider mb-4 pb-2 border-b border-gold/20">
                    Identitas Profesional
                  </div>
                  <div className="space-y-3">
                    {credentials.map((item, index) => (
                      <motion.div 
                        key={item.label} 
                        className="flex items-start gap-3 group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                          <item.icon className="w-4 h-4 text-gold" />
                        </div>
                        <div>
                          <div className="text-[10px] text-cream/40 uppercase tracking-wider">
                            {item.label}
                          </div>
                          <div className="text-sm text-cream/90">{item.value}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                

              </div>

              {/* Quote */}
              <motion.blockquote
                className="mt-16 text-xl italic text-charcoal/80 border-l-2 border-gold pl-6"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                "Mendedikasikan ketelitian klinis untuk harmoni reproduksi Anda. 
                Berbicara secukupnya, mengobservasi sepenuhnya."
              </motion.blockquote>
            </div>
          </ScrollReveal>

          {/* Right - Bio Content */}
          <div className="space-y-12">
            <ScrollReveal direction="right" delay={0.3}>
              <div className="space-y-6">
                <span className="text-gold text-sm uppercase tracking-[0.3em]">
                  Profil Profesional
                </span>
                <h2 id="about-heading" className="text-4xl md:text-5xl leading-tight">
                  Observasi Taktil <br />
                  <span className="italic text-gold">dan Mendalam</span>
                </h2>
              </div>
            </ScrollReveal>

            {/* Varian Panjang - Main Bio */}
            <ScrollReveal direction="right" delay={0.4}>
              <div className="prose prose-lg max-w-none">
                <p className="text-taupe leading-relaxed">
                  Dr. Dibya Arfianda, Sp.OG adalah dokter spesialis obstetri dan ginekologi yang berfokus pada presisi klinis.
                </p>
                <p className="text-taupe leading-relaxed mt-4">
                  Berpraktik di Kediri, beliau mendedikasikan ketelitian keilmuannya untuk mengevaluasi dan merawat kesehatan reproduksi secara komprehensif, dalam lingkungan yang sangat mengutamakan ketenangan dan privasi pasien.
                </p>
              </div>
            </ScrollReveal>

            {/* CV Format */}
            <ScrollReveal direction="right" delay={0.5}>
              <div className="bg-white p-8 border border-border">
                <h3 className="text-lg font-serif text-charcoal mb-6 pb-4 border-b border-border">
                  Kurikulum Vitae Ringkas
                </h3>
                <dl className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-xs uppercase tracking-wider text-taupe/60">Identitas Profesional</dt>
                    <dd className="col-span-2 text-sm text-charcoal">dr. Dibya Arfianda Iskandar, Sp.OG</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-xs uppercase tracking-wider text-taupe/60">Fokus Spesialisasi</dt>
                    <dd className="col-span-2 text-sm text-charcoal">Obstetri dan Ginekologi</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-xs uppercase tracking-wider text-taupe/60">Afiliasi Klinis Utama</dt>
                    <dd className="col-span-2 text-sm text-charcoal">RSIA Melinda, RS Gambiran & RS Bhayangkara, Kota Kediri, Jawa Timur</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-xs uppercase tracking-wider text-taupe/60">Validasi Sertifikasi</dt>
                    <dd className="col-span-2 text-sm text-charcoal">KKI / POGI Aktif / Komisaris RSIA Melinda</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-xs uppercase tracking-wider text-taupe/60">Pendekatan</dt>
                    <dd className="col-span-2 text-sm text-charcoal">Evidence-Based Gynecology, Konseling Infertilitas Rasional</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-xs uppercase tracking-wider text-taupe/60">Bahasa</dt>
                    <dd className="col-span-2 text-sm text-charcoal">Indonesia (Klinis), Inggris (Terminologi Medis)</dd>
                  </div>
                </dl>
              </div>
            </ScrollReveal>

            {/* Media Kit */}
            <ScrollReveal direction="right" delay={0.6}>
              <div className="bg-cream2 p-6 border-l-2 border-gold">
                <p className="text-sm text-taupe italic">
                  "Meskipun lebih banyak mendedikasikan waktunya di balik analisis klinis dan 
                  observasi pasien, Dr. Dibya Arfianda, Sp.OG secara terbatas menerima 
                  permintaan untuk kontribusi opini tertulis terkurasi, tinjauan sejawat 
                  (peer-review) pada literatur jurnal kedokteran, atau diskusi panel akademis, 
                  khususnya dalam ranah Obstetri dan Ginekologi."
                </p>
                <p className="text-xs text-taupe/50 mt-4">
                  Seluruh korespondensi media dan profesional dipersilakan melalui saluran kontak administratif.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
