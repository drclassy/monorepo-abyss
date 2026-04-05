'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { 
  Baby, 
  Stethoscope, 
  Dna, 
  BookOpen, 
  Video,
  ArrowRight
} from 'lucide-react';

const services = [
  {
    id: 'obstetrics',
    icon: Baby,
    title: 'Konsultasi Kehamilan Terpadu',
    slug: '/layanan/konsultasi-kehamilan-kediri',
    meta: 'Pemantauan kehamilan komprehensif oleh Dr. Dibya Arfianda, Sp.OG di Kediri. Observasi klinis presisi untuk perkembangan janin dan kesehatan esensial ibu.',
    description: 'Pemantauan fase gestasi yang terukur melalui observasi ultrasonografi dan klinis berkala. Fokus kami berada pada perkembangan janin dan adaptasi fisiologis ibu, memastikan transisi menuju persalinan berjalan dalam kerangka keilmuan medis yang optimal, rasional, dan menenangkan.',
  },
  {
    id: 'gynecology',
    icon: Stethoscope,
    title: 'Pemeriksaan Rutin Ginekologi Preventif',
    slug: '/layanan/pemeriksaan-ginekologi-rutin',
    meta: 'Layanan pemeriksaan ginekologi preventif di Kediri. Evaluasi reproduksi wanita dengan pendekatan privat dan berbasis observasi medis yang mendalam.',
    description: 'Evaluasi berkala untuk memelihara kesehatan organ reproduksi perempuan dari waktu ke waktu. Deteksi dini kelainan anatomis maupun fungsional dilakukan dengan ketelitian tingkat tinggi, di dalam ruang praktik yang sangat menjaga privasi dan batasan personal pasien.',
  },
  {
    id: 'fer',
    icon: Dna,
    title: 'Manajemen Fertilitas',
    slug: '/layanan/fertilitas-endokrinologi-reproduksi',
    meta: 'Manajemen fertilitas dan endokrinologi reproduksi (FER) berbasis bukti bersama Dr. Dibya Arfianda, Sp.OG. Evaluasi terukur untuk rencana kehamilan Anda.',
    description: 'Analisis kompleks terhadap fluktuasi hormon dan sistem reproduksi bagi pasangan yang sedang merencanakan kehamilan. Pendekatan kami tidak didasarkan pada asumsi, melainkan pada pengumpulan data laboratorium yang ketat dan evaluasi endokrin yang presisi.',
  },
  {
    id: 'counseling',
    icon: BookOpen,
    title: 'Edukasi dan Konseling Privat',
    slug: '/layanan/konseling-reproduksi-privat',
    meta: 'Sesi edukasi reproduksi dan konseling medis privat. Penjelasan kondisi ginekologis secara transparan, rasional, dan menjaga privasi absolut pasien.',
    description: 'Sesi diskusi tertutup yang dirancang untuk membedah literatur dan opsi medis terkait kondisi spesifik Anda. Informasi disampaikan secara objektif, memberikan kendali penuh bagi pasien untuk memahami otonomi tubuhnya dan mengambil keputusan medis yang meyakinkan.',
  },
  {
    id: 'telemedicine',
    icon: Video,
    title: 'Telekonsultasi Medis Terenkripsi',
    slug: '/layanan/telekonsultasi-kandungan-online',
    meta: 'Layanan telekonsultasi dokter spesialis kandungan yang terenkripsi aman. Diskusi medis jarak jauh bersama Dr. Dibya Arfianda secara privat dan akurat.',
    description: 'Evaluasi awal atau diskusi tindak lanjut jarak jauh dengan standar keamanan data tingkat tinggi. Dirancang untuk pasien yang membutuhkan pandangan medis tanpa harus hadir ke fasilitas, memastikan kenyamanan tanpa pernah mereduksi ketelitian observasi klinis.',
  },
];

export function ServicesSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={containerRef}
      id="services"
      className="py-24 lg:py-40 bg-charcoal text-cream relative overflow-hidden"
      aria-labelledby="services-heading"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(181, 164, 139, 0.5) 1px, transparent 0)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-gold text-sm uppercase tracking-[0.3em] mb-4 block">
            Layanan Klinis
          </span>
          <h2 id="services-heading" className="text-4xl md:text-5xl lg:text-6xl mb-6">
            Memprioritaskan diagnosis <br />
            <span className="italic text-gold">melalui pendengaran aktif</span>
          </h2>
          <p className="text-cream/70 font-light leading-relaxed text-lg">
            Observasi taktil dan mendalam. Kami menghindari intervensi yang tidak esensial 
            demi menjaga integritas fisiologis Anda.
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                className="group"
              >
                <div className="grid lg:grid-cols-12 gap-8 items-center p-8 border border-cream/20 hover:border-gold/40 transition-all duration-300 bg-charcoal hover:bg-charcoal-light">
                  {/* Number & Icon */}
                  <div className="lg:col-span-2 flex items-center gap-4">
                    <span className="text-5xl font-serif text-cream/20 group-hover:text-gold/40 transition-colors">
                      0{index + 1}
                    </span>
                    <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                      <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-7">
                    <h3 className="text-2xl lg:text-3xl mb-3 group-hover:text-gold transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-cream/80 font-light leading-relaxed text-sm">
                      {service.description}
                    </p>
                    <p className="text-cream/60 text-xs mt-3 italic">
                      {service.meta}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="lg:col-span-3 lg:text-right">
                    <a
                      href={service.slug}
                      className="inline-flex items-center gap-2 text-gold text-sm uppercase tracking-wider group/btn hover:translate-x-1 transition-transform"
                    >
                      <span className="border-b border-gold/30 pb-1 group-hover/btn:border-gold transition-colors">
                        Pelajari Lebih Lanjut
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-cream/70 text-sm mb-6">
            Tidak menemukan layanan yang Anda cari? Diskusikan kondisi spesifik Anda secara privat.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-3 border border-gold/50 text-gold px-8 py-4 uppercase tracking-wider text-sm hover:bg-gold hover:text-charcoal transition-all duration-300"
          >
            Konsultasi Umum
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
